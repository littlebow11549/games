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
  Object.values(SFX).forEach(a => { a.preload = "auto"; a.volume = 0.6; });
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
  const bgm = new Audio("assets/source/music/bgm_01.mp3");
  bgm.loop = true; bgm.volume = 0.45; bgm.preload = "auto";
  function startMusic() {
    if (!state.music) return;
    bgm.play().catch(() => {}); // 需使用者互動後瀏覽器才允許播放
  }
  function stopMusic() {
    bgm.pause();
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
      gem.setAttribute("aria-label", `寶石 ${i + 1}`);
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
    Object.values(screens).forEach((s) => s.classList.remove("active"));
    screens[name].classList.add("active");
    hud.classList.toggle("hidden", name !== "game");
  }

  // ---------- 愛心 ----------
  function renderHearts() {
    [...heartsWrap.children].forEach((h, i) => {
      h.classList.toggle("lost", i >= state.hearts);
    });
  }

  // ---------- 橫幅文字 ----------
  const BANNER_IMG = {
    "READY": "ready", "YOUR TURN": "your_turn", "PERFECT": "perfect",
    "MISS": "miss", "AGAIN": "again",
  };
  function banner(text, cls = "") {
    const f = BANNER_IMG[text];
    perfectBan.innerHTML = f
      ? `<img class="word" src="assets/source/pic/titles/${f}.png" alt="${text}">`
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
    state.hearts = 3;
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

  function nextLevel(fresh) {
    levelTag.innerHTML = lvHTML(state.level);
    if (fresh) state.sequence = generateSequence();
    state.playerStep = 0;
    state.accepting = false;
    board.classList.add("locked");
    banner(fresh ? "READY" : "AGAIN", "");
    statusText.textContent = "看好寶石發光的順序…";
    setTimeout(playSequence, 650);
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
        setTimeout(() => {
          state.accepting = true;
          board.classList.remove("locked");
          banner("YOUR TURN", "");
          statusText.textContent = "換你了！照順序點回寶石";
        }, 180);
        return;
      }
      const gem = gems[state.sequence[i]];
      gem.classList.add("lit");
      beep(SCALE[state.sequence[i] % SCALE.length], on / 1000 * 0.9, "sine", .18);
      i++;
      setTimeout(step, on + gap);
    };
    step();
  }

  function onGemClick(idx) {
    if (!state.accepting) return;
    const expected = state.sequence[state.playerStep];
    const gem = gems[idx];

    if (idx === expected) {
      // 正確
      beep(SCALE[idx % SCALE.length], .14, "sine", .2);
      gem.classList.add("lit", "correct");
      setTimeout(() => gem.classList.remove("lit", "correct"), 260);
      state.playerStep++;
      if (state.playerStep >= state.sequence.length) {
        levelClear();
      }
    } else {
      // 錯誤
      state.accepting = false;
      board.classList.add("locked");
      gem.classList.add("wrong");
      setTimeout(() => gem.classList.remove("wrong"), 360);
      sndWrong();
      state.hearts--;
      renderHearts();
      if (state.hearts <= 0) {
        setTimeout(gameOver, 500);
      } else {
        banner("MISS", "miss");
        statusText.textContent = "記錯了！再看一次順序";
        setTimeout(() => nextLevel(false), 1100);
      }
    }
  }

  function levelClear() {
    state.accepting = false;
    board.classList.add("locked");
    banner("PERFECT", "");
    sndPerfect();
    statusText.textContent = "太棒了！進入下一關";
    if (state.level > state.best) {
      state.best = state.level;
      localStorage.setItem("mc_best", String(state.best));
    }
    state.level++;
    setTimeout(() => nextLevel(true), 1250);
  }

  function gameOver() {
    sndOver();
    $("#finalLevel").textContent = state.level;
    $("#bestLevel").textContent = Math.max(state.best, state.level);
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

  // ---------- 事件綁定 ----------
  function bind() {
    // 所有按鈕（金色按鈕/圓鈕/START）點擊音
    document.addEventListener("click", (e) => {
      if (e.target.closest(".gold-btn, .icon-btn, .title-start")) playSfx("tap");
    });

    // 標題 START → 主選單
    $("#btnStart").addEventListener("click", showMenu);
    $("#btnOptionTitle").addEventListener("click", () => show("option"));
    $("#btnOptionTop").addEventListener("click", () => { state.accepting = false; board.classList.add("locked"); show("option"); });

    // 主選單
    $("#btnArcade").addEventListener("click", () => requestStart(false));
    $("#btnContinue").addEventListener("click", () => {
      const best = Number(localStorage.getItem("mc_best") || 1);
      if (best > 1) requestStart(false, best);
    });
    $("#btnMenuOption").addEventListener("click", () => show("option"));
    $("#btnExit").addEventListener("click", () => { location.href = "../index.html"; });

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
      if (screens.title.classList.contains("active")) showMenu();
      else if (screens.menu.classList.contains("active")) requestStart(false);
    });
  }

  // ---------- 啟動 ----------
  buildBoard();
  renderHearts();
  soundState.classList.toggle("muted", !state.sound);  // 音效預設開
  musicState.classList.toggle("muted", !state.music);  // 音樂標示（實際於開始/手勢後播放）
  bind();
  show("title");
})();
