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
    option: $("#screen-option"),
    game:   $("#screen-game"),
    over:   $("#screen-over"),
  };
  const board       = $("#board");
  const hud         = $("#hud");
  const heartsWrap  = $("#hearts");
  const levelNum    = $("#levelNum");
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
  const sndGood   = () => { beep(660, .12, "triangle"); setTimeout(() => beep(990, .14, "triangle"), 90); };
  const sndWrong  = () => beep(140, .32, "sawtooth", .25);
  const sndPerfect= () => { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => beep(f, .18, "triangle"), i * 90)); };
  const sndOver   = () => { [440, 349, 262, 196].forEach((f, i) => setTimeout(() => beep(f, .28, "sawtooth", .22), i * 160)); };

  // ---------- 背景音樂（WebAudio 合成，循環） ----------
  let musGain = null;
  const MUS = {
    playing: false, timer: null, step: 0, nextTime: 0,
    tempo: 0.30, // 每步秒數
    // C 大調五聲音階的循環旋律（半音偏移，相對 C4）
    melody: [0, 4, 7, 9, 7, 4, 0, 4,  9, 12, 9, 7, 4, 7, 2, 0],
    // 低音（每兩拍一顆）
    bass:   [0, null, 5, null, 7, null, 4, null,  9, null, 5, null, 7, null, -1, null],
  };
  const NOTE = (semi) => 261.63 * Math.pow(2, semi / 12);
  function getMusGain() {
    const ctx = ac(); if (!ctx) return null;
    if (!musGain) { musGain = ctx.createGain(); musGain.gain.value = 0.5; musGain.connect(ctx.destination); }
    return musGain;
  }
  function musVoice(freq, dur, type, vol, when) {
    const ctx = ac(); const g = getMusGain(); if (!ctx || !g) return;
    const o = ctx.createOscillator(), env = ctx.createGain();
    o.type = type; o.frequency.value = freq;
    env.gain.setValueAtTime(0.0001, when);
    env.gain.exponentialRampToValueAtTime(vol, when + 0.03);
    env.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.connect(env); env.connect(g);
    o.start(when); o.stop(when + dur + 0.03);
  }
  function musSchedule() {
    const ctx = ac(); if (!ctx) return;
    while (MUS.nextTime < ctx.currentTime + 0.25) {
      const i = MUS.step % MUS.melody.length;
      const m = MUS.melody[i];
      if (m !== null) musVoice(NOTE(m), MUS.tempo * 0.95, "triangle", 0.08, MUS.nextTime);
      const b = MUS.bass[i];
      if (b !== null && b !== undefined) musVoice(NOTE(b - 12), MUS.tempo * 1.8, "sine", 0.11, MUS.nextTime);
      MUS.nextTime += MUS.tempo;
      MUS.step++;
    }
  }
  function startMusic() {
    if (!state.music || MUS.playing) return;
    const ctx = ac(); if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    MUS.playing = true;
    MUS.nextTime = ctx.currentTime + 0.1;
    MUS.timer = setInterval(musSchedule, 60);
    musSchedule();
  }
  function stopMusic() {
    MUS.playing = false;
    if (MUS.timer) { clearInterval(MUS.timer); MUS.timer = null; }
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
  function banner(text, cls = "") {
    perfectBan.textContent = text;
    perfectBan.className = "banner game-banner " + cls;
    // 觸發動畫
    void perfectBan.offsetWidth;
    perfectBan.classList.add("pop");
  }

  // ---------- 遊戲流程 ----------
  function startGame(master) {
    state.master = master;
    state.level = master ? 3 : 1;
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
    levelNum.textContent = state.level;
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
  function requestStart(master) {
    ac();
    if (!localStorage.getItem("mc_seen_howto")) {
      pendingStart = { master };
      modal.classList.remove("hidden");
      return;
    }
    startGame(master);
  }
  function closeModal() {
    modal.classList.add("hidden");
    if (pendingStart) {
      localStorage.setItem("mc_seen_howto", "1");
      const p = pendingStart; pendingStart = null;
      startGame(p.master);
    }
  }

  // ---------- 事件綁定 ----------
  function bind() {
    $("#btnStart").addEventListener("click", () => requestStart(false));
    $("#btnOptionTitle").addEventListener("click", () => show("option"));
    $("#btnOptionTop").addEventListener("click", () => { state.accepting = false; board.classList.add("locked"); show("option"); });

    $("#btnHome").addEventListener("click", () => show("title"));
    $("#btnMaster").addEventListener("click", () => requestStart(true));
    $("#btnSound").addEventListener("click", () => setSound(!state.sound));
    $("#btnMusic").addEventListener("click", () => setMusic(!state.music));
    $("#btnHowTo").addEventListener("click", () => modal.classList.remove("hidden"));
    $("#btnCloseModal").addEventListener("click", closeModal);

    $("#btnAgain").addEventListener("click", () => startGame(state.master));
    $("#btnHomeOver").addEventListener("click", () => show("title"));

    // 鍵盤：Enter 開始
    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && screens.title.classList.contains("active")) {
        requestStart(false);
      }
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
