/* ============================================================
   MEMORY CRASH — 遊戲邏輯
   玩法：寶石依序發光 → 玩家照順序點回 → 全對過關(PERFECT)
         點錯扣愛心，愛心歸零 GAME OVER。
   ============================================================ */
(() => {
  "use strict";

  // ---------- 棋盤設定 ----------
  const COLS = 3;
  const ROWS = 4;
  const CELLS = COLS * ROWS; // 12 顆寶石

  // 12 種寶石顏色（對應設計稿的多彩寶石）
  const GEM_COLORS = [
    "#49c7ff", "#7fe0ff", "#9b7bff",
    "#5effa0", "#3ddc84", "#b6ff4e",
    "#ff7a3c", "#ff5ea8", "#ff4e4e",
    "#ffb14e", "#c98b5a", "#eaf2ff",
  ];

  // 每顆寶石的音高（五聲音階，點擊有不同聲音）
  const SCALE = [261.6, 293.7, 329.6, 392.0, 440.0, 523.3,
                 587.3, 659.3, 784.0, 880.0, 987.8, 1046.5];

  // ---------- 遊戲狀態 ----------
  const state = {
    level: 1,
    hearts: 3,
    sequence: [],     // 本關要記住的寶石序列（存 cell index）
    playerStep: 0,    // 玩家目前點到第幾個
    accepting: false, // 是否開放點擊
    master: false,    // 大師模式
    sound: true,                                       // 音效(SFX)
    music: localStorage.getItem("mc_music") !== "0",   // 背景音樂(BGM)，預設開
    best: Number(localStorage.getItem("mc_best") || 1),
  };
  let flowVersion = 0;
  let pendingStart = null; // 首次說明看完後要開始的模式

  // ---------- DOM ----------
  const $ = (sel) => document.querySelector(sel);
  const screens = {
    title:  $("#screen-title"),
    menu:   $("#screen-menu"),
    option: $("#screen-option"),
    game:   $("#screen-game"),
    over:   $("#screen-over"),
  };
  const board       = $("#board");
  const hud         = $("#hud");
  const heartsWrap  = $("#hearts");
  const levelTag    = $("#levelTag");
  const NUMDIR = "assets/source/pic/numbers/";
  function lvHTML(n) {
    let h = `<img class="nimg" src="${NUMDIR}lv.png" alt="LV"><img class="nimg ncolon" src="${NUMDIR}colon.png" alt=":">`;
    for (const d of String(n)) h += `<img class="nimg" src="${NUMDIR}n${d}.png" alt="${d}">`;
    return h;
  }
  const perfectBan  = $("#perfectBanner");
  const statusText  = $("#statusText");
  const appEl       = $("#app");
  const scoreNum    = $("#scoreNum");
  const comboPop    = $("#comboPop");
  const timerBar    = $("#timerBar");
  const timerFill   = $("#timerFill");
  const modal       = $("#modal");
  const soundState  = $("#soundState");
  const musicState  = $("#musicState");

  // ---------- 音效（WebAudio，免檔案） ----------
  let audioCtx = null;
  function ac() {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { audioCtx = null; }
    }
    return audioCtx;
  }
  function beep(freq, dur = 0.16, type = "sine", vol = 0.22) {
    if (!state.sound) return;
    duckMusic();
    const ctx = ac(); if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + dur + 0.02);
  }
  // ---------- 音效（mp3 音檔） ----------
  const SFX = {
    tap:   new Audio("assets/source/sfx/sfx_01.mp3"),
    good:  new Audio("assets/source/sfx/sfx_02.mp3"),
    wrong: new Audio("assets/source/sfx/sfx_03.mp3"),
    win:   new Audio("assets/source/sfx/sfx_04.mp3"),
    over:  new Audio("assets/source/sfx/sfx_05.mp3"),
  };
  Object.values(SFX).forEach(a => { a.preload = "auto"; a.volume = 0.55; });
  function playSfx(name) {
    if (!state.sound) return;
    const a = SFX[name]; if (!a) return;
    try { a.currentTime = 0; a.play().catch(() => {}); } catch (e) {}
  }
  // 寶石點擊/示範仍用 WebAudio 合成（beep + SCALE），保留每顆專屬音高
  const sndGood   = () => playSfx("good");
  const sndWrong  = () => playSfx("wrong");
  const sndPerfect= () => playSfx("win");
  const sndOver   = () => playSfx("over");

  // ---------- 背景音樂（mp3，循環） ----------
  const audioProbe = new Audio();
  const musicFormat = audioProbe.canPlayType('audio/ogg; codecs="vorbis"') ? "ogg" : "mp3";
  const bgmTracks = {
    normal: new Audio(`assets/source/music/bgm_01.${musicFormat}`),
    intense: new Audio(`assets/source/music/bgm_02.${musicFormat}`),
  };
  Object.values(bgmTracks).forEach(audio => { audio.loop = true; audio.volume = 0.38; audio.preload = "metadata"; });
  let bgm = bgmTracks.normal;
  let musicDuckTimer = 0;
  function startMusic() {
    if (!state.music) return;
    const selected = state.master || state.level >= 10 ? bgmTracks.intense : bgmTracks.normal;
    if (bgm !== selected) { bgm.pause(); bgm = selected; bgm.currentTime = 0; }
    bgm.play().catch(() => {});
  }
  function stopMusic() {
    clearTimeout(musicDuckTimer);
    Object.values(bgmTracks).forEach(audio => { audio.pause(); audio.volume = 0.38; });
  }
  function duckMusic() {
    bgm.volume = 0.18;
    clearTimeout(musicDuckTimer);
    musicDuckTimer = setTimeout(() => { bgm.volume = 0.38; }, 260);
  }

  // ---------- 建立棋盤 ----------
  const gems = [];
  function buildBoard() {
    board.innerHTML = "";
    board.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
    gems.length = 0;
    for (let i = 0; i < CELLS; i++) {
      const gem = document.createElement("button");
      gem.className = "gem";
      gem.style.setProperty("--gem", GEM_COLORS[i % GEM_COLORS.length]);
      gem.dataset.index = i;
      gem.setAttribute("aria-label", `Gem ${i + 1}`);
      gem.style.setProperty("--idle-delay", `${-i * 0.29}s`);
      const stone = document.createElement("span");
      stone.className = "stone";
      stone.style.backgroundPosition = `${(i % 4) * 100 / 3}% ${Math.floor(i / 4) * 50}%`;
      gem.appendChild(stone);
      gem.addEventListener("click", () => onGemClick(i));
      board.appendChild(gem);
      gems.push(gem);
    }
  }

  // ---------- 畫面切換 ----------
  function show(name) {
    if (name !== "game") {
      flowVersion++;
      state.accepting = false;
      stopTimer();
      board.classList.add("locked");
      gems.forEach(gem => gem.classList.remove("lit", "correct", "wrong"));
    }
    Object.values(screens).forEach((s) => s.classList.remove("active"));
    screens[name].classList.add("active");
    hud.classList.toggle("hidden", name !== "game");
    window.MemoryCrashMascot?.show(name);
    window.MemoryCrashPresentation?.show(name);
  }

  // ---------- 愛心（動態渲染，支援金手指加命） ----------
  function renderHearts() {
    const max = Math.max(3, state.maxHearts || 3);
    heartsWrap.innerHTML = "";
    for (let i = 0; i < max; i++) {
      const h = document.createElement("span");
      h.className = "heart" + (i >= state.hearts ? " lost" : "");
      heartsWrap.appendChild(h);
    }
  }

  // ---------- 橫幅文字 ----------
  const BANNER_IMG = {
    "READY": "ready", "YOUR TURN": "your_turn", "PERFECT": "perfect",
    "MISS": "miss", "AGAIN": "again",
  };
  function banner(text, cls = "") {
    if (text === "PERFECT") { window.MemoryCrashMascot?.play("celebrate", 1250); window.MemoryCrashPresentation?.effect("burst"); }
    else if (text === "MISS") window.MemoryCrashMascot?.play("sad", 1100);
    else window.MemoryCrashMascot?.play("idle");
    const f = BANNER_IMG[text];
    perfectBan.innerHTML = f
      ? `<img class="word" src="assets/source/pic/titles/titles_fx_${f}.png" alt="${text}">`
      : text;
    perfectBan.className = "banner game-banner " + cls;
    // 觸發動畫
    void perfectBan.offsetWidth;
    perfectBan.classList.add("pop");
  }

  // ---------- 遊戲流程 ----------
  function startGame(master, startLevel) {
    state.master = master;
    state.level = startLevel || (master ? 3 : 1);
    state.hearts = 3; state.maxHearts = 3;
    state.score = 0; state.combo = 0; updateScore();
    state.best = Number(localStorage.getItem("mc_best") || 1);
    buildBoard();
    renderHearts();
    show("game");
    startMusic();
    nextLevel(true);
  }

  function seqLength() {
    // 關卡越高序列越長
    return Math.min(CELLS, 2 + state.level);
  }
  function flashTiming() {
    // 關卡越高速度越快；大師模式更快
    const base = state.master ? 420 : 560;
    const on = Math.max(230, base - state.level * 22);
    const gap = Math.max(90, (state.master ? 130 : 170) - state.level * 6);
    return { on, gap };
  }

  function generateSequence() {
    const seq = [];
    let last = -1;
    for (let i = 0; i < seqLength(); i++) {
      let c;
      do { c = Math.floor(Math.random() * CELLS); } while (c === last);
      seq.push(c); last = c;
    }
    return seq;
  }

  function laterInGame(callback, delay) {
    const version = flowVersion;
    return setTimeout(() => {
      if (version === flowVersion && screens.game.classList.contains("active")) callback();
    }, delay);
  }
  function nextLevel(fresh) {
    flowVersion++;
    startMusic();
    levelTag.innerHTML = lvHTML(state.level);
    if (fresh) state.sequence = generateSequence();
    state.playerStep = 0;
    state.accepting = false;
    board.classList.add("locked");
    stopTimer();
    banner(fresh ? "READY" : "AGAIN", "");
    statusText.textContent = "Watch the gems light up…";
    laterInGame(playSequence, 650);
  }

  function playSequence() {
    const { on, gap } = flashTiming();
    let i = 0;
    const step = () => {
      if (i > 0) { // 關掉上一顆
        const prev = gems[state.sequence[i - 1]];
        prev.classList.remove("lit");
      }
      if (i >= state.sequence.length) {
        laterInGame(() => {
          state.accepting = true;
          board.classList.remove("locked");
          banner("YOUR TURN", "");
          statusText.textContent = "Your turn — tap them back in order";
          startTimer();
        }, 180);
        return;
      }
      const gem = gems[state.sequence[i]];
      gem.classList.add("lit");
      beep(SCALE[state.sequence[i] % SCALE.length], on / 1000 * 0.9, "sine", .18);
      i++;
      laterInGame(step, on + gap);
    };
    step();
  }

  // ---------- 手感：分數 / 連擊 / 粒子 / 震動 ----------
  function updateScore() { if (scoreNum) scoreNum.textContent = state.score; const t = scoreNum && scoreNum.parentElement; if (t) { t.classList.remove("bump"); void t.offsetWidth; t.classList.add("bump"); } }
  function floatPlus(gem, n) {
    const el = document.createElement("span");
    el.className = "float-plus"; el.textContent = "+" + n;
    gem.appendChild(el); setTimeout(() => el.remove(), 700);
  }
  function showCombo(c) {
    if (!comboPop || c < 2) return;
    comboPop.textContent = "COMBO x" + c;
    comboPop.classList.remove("show"); void comboPop.offsetWidth; comboPop.classList.add("show");
  }
  function shakeScreen() {
    if (!appEl) return;
    appEl.classList.remove("shake"); void appEl.offsetWidth; appEl.classList.add("shake");
    setTimeout(() => appEl.classList.remove("shake"), 420);
  }
  function burstParticles() {
    const n = 16;
    for (let i = 0; i < n; i++) {
      const p = document.createElement("span");
      p.className = "particle"; p.textContent = "★";
      const ang = (Math.PI * 2 * i) / n + Math.random() * 0.4;
      const dist = 70 + Math.random() * 60;
      p.style.setProperty("--dx", Math.cos(ang) * dist + "px");
      p.style.setProperty("--dy", Math.sin(ang) * dist + "px");
      p.style.setProperty("--rot", (Math.random() * 360 | 0) + "deg");
      p.style.color = ["#ffe17a", "#8fe0ff", "#5effa0", "#ff8aa0"][i % 4];
      board.appendChild(p); setTimeout(() => p.remove(), 760);
    }
  }

  // ---------- 回合倒數（限時，沒操作扣血） ----------
  let turnTimer = null, lowTimer = null;
  function turnDuration() {
    const base = state.master ? 3.6 : 5;
    return Math.max(2.2, base - state.level * 0.12);
  }
  function startTimer() {
    const dur = turnDuration();
    clearTimeout(turnTimer); clearTimeout(lowTimer);
    timerBar.classList.add("active");
    timerFill.classList.remove("low");
    timerFill.style.transition = "none"; timerFill.style.clipPath = "inset(0 0 0 0)";
    void timerFill.offsetWidth;
    timerFill.style.transition = `clip-path ${dur}s linear`;
    timerFill.style.clipPath = "inset(0 100% 0 0)";   // 由右往左裁切，不拉伸紋理
    lowTimer = setTimeout(() => timerFill.classList.add("low"), dur * 700);
    turnTimer = setTimeout(onTimeout, dur * 1000);
  }
  function resetTimer() { if (state.accepting) startTimer(); }
  function stopTimer() {
    clearTimeout(turnTimer); clearTimeout(lowTimer); turnTimer = null;
    timerBar.classList.remove("active"); timerFill.classList.remove("low");
    timerFill.style.transition = "none"; timerFill.style.clipPath = "inset(0 0 0 0)";
  }
  function onTimeout() {
    if (!state.accepting) return;
    state.accepting = false; board.classList.add("locked"); stopTimer();
    window.MemoryCrashPresentation?.effect("shatter");
    window.MemoryCrashMascot?.play("sad", 1100);
    sndWrong(); shakeScreen(); state.combo = 0;
    state.hearts--; renderHearts();
    if (state.hearts <= 0) { laterInGame(gameOver, 500); }
    else {
      banner("MISS", "miss");
      statusText.textContent = "Too slow! Watch again";
      laterInGame(() => nextLevel(false), 1100);
    }
  }

  function onGemClick(idx) {
    if (!state.accepting) return;
    const expected = state.sequence[state.playerStep];
    const gem = gems[idx];

    if (idx === expected) {
      // 正確
      window.MemoryCrashMascot?.play("happy", 1000);
      beep(SCALE[idx % SCALE.length], .14, "sine", .2);
      gem.classList.add("lit", "correct");
      setTimeout(() => gem.classList.remove("lit", "correct"), 260);
      state.combo++;
      const gain = 10 * state.combo;         // 連擊越高分越多
      state.score += gain;
      updateScore(); floatPlus(gem, gain); showCombo(state.combo);
      state.playerStep++;
      if (state.playerStep >= state.sequence.length) {
        stopTimer();
        levelClear();
      } else {
        resetTimer();   // 每點對一次就重置倒數
      }
    } else {
      // 錯誤
      state.accepting = false;
      board.classList.add("locked");
      stopTimer();
      window.MemoryCrashMascot?.play("sad", 1100);
      window.MemoryCrashPresentation?.effect("shatter");
      gem.classList.add("wrong");
      setTimeout(() => gem.classList.remove("wrong"), 360);
      sndWrong(); shakeScreen();
      state.combo = 0;
      state.hearts--;
      renderHearts();
      if (state.hearts <= 0) {
        laterInGame(gameOver, 500);
      } else {
        banner("MISS", "miss");
        statusText.textContent = "Missed! Watch the sequence again";
        laterInGame(() => nextLevel(false), 1100);
      }
    }
  }

  function levelClear() {
    state.accepting = false;
    board.classList.add("locked");
    banner("PERFECT", "");
    sndPerfect(); burstParticles();
    const bonus = 50 * state.level;          // 過關獎勵
    state.score += bonus; updateScore();
    statusText.textContent = "Great! Next level";
    if (state.level > state.best) {
      state.best = state.level;
      localStorage.setItem("mc_best", String(state.best));
    }
    state.level++;
    laterInGame(() => nextLevel(true), 1250);
  }

  function gameOver() {
    window.MemoryCrashPresentation?.effect("crack");
    stopTimer();
    sndOver();
    const bestScore = Math.max(Number(localStorage.getItem("mc_bestscore") || 0), state.score);
    localStorage.setItem("mc_bestscore", String(bestScore));
    $("#finalLevel").textContent = state.level;
    $("#bestLevel").textContent = Math.max(state.best, state.level);
    const fs = $("#finalScore"); if (fs) fs.textContent = state.score;
    const bs = $("#bestScore"); if (bs) bs.textContent = bestScore;
    show("over");
  }

  // ---------- 選項 / 說明 ----------
  function setSound(on) {
    state.sound = on;
    soundState.classList.toggle("muted", !on);
    if (on) beep(660, .1, "triangle");
  }
  function setMusic(on) {
    state.music = on;
    localStorage.setItem("mc_music", on ? "1" : "0");
    musicState.classList.toggle("muted", !on);
    const qi = $("#musicQuickIcon"); if (qi) qi.textContent = on ? "🔊" : "🔇";
    $("#btnMusicQuick")?.classList.toggle("off", !on);
    if (on) startMusic(); else stopMusic();
  }

  // 首次遊玩自動顯示玩法說明，看完才開始
  function requestStart(master, startLevel) {
    ac();
    if (!localStorage.getItem("mc_seen_howto")) {
      pendingStart = { master, startLevel };
      modal.classList.remove("hidden");
      return;
    }
    startGame(master, startLevel);
  }
  function closeModal() {
    modal.classList.add("hidden");
    if (pendingStart) {
      localStorage.setItem("mc_seen_howto", "1");
      const p = pendingStart; pendingStart = null;
      startGame(p.master, p.startLevel);
    }
  }

  // 顯示主選單（更新 CONTINUE 可用狀態）
  function showMenu() {
    ac();
    const best = Number(localStorage.getItem("mc_best") || 1);
    $("#btnContinue").disabled = best <= 1;
    show("menu");
  }

  // Exit only the game tab. Directly opened tabs fall back to the hub.
  const exitLabels = {"zh-Hant":"關閉遊戲", "zh-Hans":"关闭游戏", en:"Close game", ja:"ゲームを閉じる", ko:"게임 닫기", th:"ปิดเกม"};
  // 預設英文；僅當首頁語言明確設定時才跟隨
  let exitLanguage = "en";
  try { exitLanguage = localStorage.getItem("gamehub_language") || "en"; } catch {}
  const _exitLabelEl = $("#exitGameLabel");
  if (_exitLabelEl) _exitLabelEl.textContent = exitLabels[exitLanguage] || exitLabels["en"];
  function exitGame() {
    flowVersion++;
    stopTimer();
    window.MemoryCrashMascot?.stop();
    window.MemoryCrashPresentation?.stop();
    state.accepting = false;
    stopMusic();
    Object.values(SFX).forEach(audio => audio.pause());
    if (audioCtx && audioCtx.state !== "closed") audioCtx.suspend().catch(() => {});
    window.close();
    // Browsers may refuse to close a manually opened tab.
    setTimeout(() => window.location.replace(new URL("../", window.location.href).href), 150);
  }

  // ---------- 事件綁定 ----------
  function bind() {
    $("#btnExitGame").addEventListener("click", exitGame);
    // 所有按鈕（金色按鈕/圓鈕/START）點擊音
    document.addEventListener("click", (e) => {
      if (e.target.closest(".gold-btn, .icon-btn, .title-start")) playSfx("tap");
    });

    // 標題 START → 主選單（省略開場動畫，保留場景動態）
    const enterMenu = () => {
      const ctx = ac(); if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
      showMenu();
    };
    $("#btnStart").addEventListener("click", enterMenu);
    $("#btnOptionTitle").addEventListener("click", () => show("option"));
    $("#btnOptionTop").addEventListener("click", () => { state.accepting = false; board.classList.add("locked"); stopTimer(); show("option"); });

    // 主選單
    $("#btnArcade").addEventListener("click", () => requestStart(false));
    $("#btnContinue").addEventListener("click", () => {
      const best = Number(localStorage.getItem("mc_best") || 1);
      if (best > 1) requestStart(false, best);
    });
    $("#btnMenuOption").addEventListener("click", () => show("option"));
    $("#btnExit").addEventListener("click", exitGame);

    $("#btnHome").addEventListener("click", showMenu);
    $("#btnMaster").addEventListener("click", () => requestStart(true));
    $("#btnSound").addEventListener("click", () => setSound(!state.sound));
    $("#btnMusic").addEventListener("click", () => setMusic(!state.music));
    $("#btnHowTo").addEventListener("click", () => modal.classList.remove("hidden"));
    $("#btnCloseModal").addEventListener("click", closeModal);

    $("#btnAgain").addEventListener("click", () => startGame(state.master));
    $("#btnHomeOver").addEventListener("click", showMenu);

    // 鍵盤：Enter 在標題開選單、在選單開始 Arcade
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      if (e.target.closest("button, a, input, select, textarea")) return;
      if (screens.title.classList.contains("active")) enterMenu();
      else if (screens.menu.classList.contains("active")) requestStart(false);
    });

    // 快速靜音鍵（任意畫面可用）
    $("#btnMusicQuick")?.addEventListener("click", () => setMusic(!state.music));

    // 🎮 金手指（秘技）：遊戲進行中輸入 188 → 加一條命
    let cheatBuf = "";
    document.addEventListener("keydown", (e) => {
      if (!/^[0-9]$/.test(e.key)) return;
      cheatBuf = (cheatBuf + e.key).slice(-3);
      if (cheatBuf === "188" && screens.game.classList.contains("active")) {
        cheatBuf = "";
        state.hearts++;
        if (state.hearts > state.maxHearts) state.maxHearts = state.hearts;
        renderHearts();
        playSfx("good");
        window.MemoryCrashMascot?.play("happy", 800);
        if (statusText) {
          const prev = statusText.textContent;
          statusText.textContent = "CHEAT! +1 life ❤";
          setTimeout(() => { if (statusText.textContent.startsWith("CHEAT")) statusText.textContent = prev; }, 1000);
        }
      }
    });
  }

  // ---------- 啟動 ----------
  buildBoard();
  renderHearts();
  soundState.classList.toggle("muted", !state.sound);  // 音效預設開
  musicState.classList.toggle("muted", !state.music);  // 音樂標示（實際於開始/手勢後播放）
  $("#musicQuickIcon") && ($("#musicQuickIcon").textContent = state.music ? "🔊" : "🔇");
  $("#btnMusicQuick")?.classList.toggle("off", !state.music);
  bind();
  show("title");
})();
