// 輸入：手機用虛擬搖桿與螢幕按鍵；電腦用 WASD 移動、滑鼠瞄準與攻擊、鍵盤放招。動作以佇列回傳。
// 電腦主要按鍵：滑鼠左鍵普攻、右鍵或 Shift 閃避、Q／E／R 三個小招、F 大招、空白鍵變身。
// J／K／L／I／O 是不用滑鼠時的備用鍵。
const KEY_ACTIONS = {
  KeyQ: 'skill1', KeyE: 'skill2', KeyR: 'skill3', KeyF: 'ult', Space: 'transform', ShiftLeft: 'dodge', ShiftRight: 'dodge',
  KeyJ: 'attack', KeyK: 'skill1', KeyL: 'skill2', KeyI: 'skill3', KeyO: 'ult',
};
const KEY_MOVE = { KeyW: [0, -1], ArrowUp: [0, -1], KeyS: [0, 1], ArrowDown: [0, 1], KeyA: [-1, 0], ArrowLeft: [-1, 0], KeyD: [1, 0], ArrowRight: [1, 0] };

// 鎖定畫面大小：擋掉會讓網頁被拉近的操作。
// iPhone 的 Safari 會無視 viewport 的 user-scalable=no，所以要自己攔手勢事件。
export function lockViewport() {
  const stop = (e) => e.preventDefault();
  const opts = { passive: false };
  // 兩指縮放（iOS 專用的手勢事件）
  for (const type of ['gesturestart', 'gesturechange', 'gestureend']) document.addEventListener(type, stop, opts);
  // 兩指以上的觸控移動
  document.addEventListener('touchmove', (e) => { if (e.touches.length > 1) e.preventDefault(); }, opts);
  // 快速連點被當成「點兩下放大」。開始畫面的按鈕靠 click 觸發，不能攔，所以排除 overlay
  let lastEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastEnd < 350 && !e.target.closest('.overlay')) e.preventDefault();
    lastEnd = now;
  }, opts);
  document.addEventListener('dblclick', stop, opts);
  // 電腦：Ctrl／⌘＋滾輪、Ctrl／⌘＋加減號
  addEventListener('wheel', (e) => { if (e.ctrlKey || e.metaKey) e.preventDefault(); }, opts);
  addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && ['Equal', 'Minus', 'Digit0', 'NumpadAdd', 'NumpadSubtract', 'Numpad0'].includes(e.code)) e.preventDefault();
  });
  // 萬一還是被拉近了（例如從別的頁面帶著縮放進來）：重寫 viewport 讓瀏覽器回到 1 倍
  const meta = document.getElementById('viewport');
  if (window.visualViewport && meta) {
    const content = meta.content;
    visualViewport.addEventListener('resize', () => {
      if (Math.abs(visualViewport.scale - 1) > 0.01) {
        meta.content = content + ',initial-scale=1.0001';
        requestAnimationFrame(() => { meta.content = content; });
      }
    });
  }
}

export class Input {
  constructor() {
    this.stick = { x: 0, y: 0 };
    this.keys = new Set();
    this.queue = [];
    this.held = new Set();
    // 滑鼠游標位置（畫面座標）。active 表示玩家目前在用滑鼠，攻擊與招式會朝游標方向
    this.mouse = { x: 0, y: 0, active: false };

    const zone = document.getElementById('stick-zone');
    const base = document.getElementById('stick-base');
    const knob = document.getElementById('stick-knob');
    let pid = null;
    const R = 48;
    const setKnob = (e) => {
      const b = base.getBoundingClientRect();
      let dx = e.clientX - (b.left + b.width / 2);
      let dy = e.clientY - (b.top + b.height / 2);
      const len = Math.hypot(dx, dy);
      if (len > R) { dx *= R / len; dy *= R / len; }
      knob.style.transform = `translate(${dx}px,${dy}px)`;
      this.stick.x = dx / R;
      this.stick.y = dy / R;
    };
    const release = (e) => {
      if (e.pointerId !== pid) return;
      pid = null;
      this.stick.x = this.stick.y = 0;
      knob.style.transform = '';
    };
    zone.addEventListener('pointerdown', (e) => { pid = e.pointerId; zone.setPointerCapture(pid); setKnob(e); });
    zone.addEventListener('pointermove', (e) => { if (e.pointerId === pid) setKnob(e); });
    zone.addEventListener('pointerup', release);
    zone.addEventListener('pointercancel', release);

    for (const btn of document.querySelectorAll('[data-action]')) {
      const action = btn.dataset.action;
      btn.addEventListener('pointerdown', (e) => { e.preventDefault(); this.queue.push(action); this.held.add(action); });
      const up = () => this.held.delete(action);
      btn.addEventListener('pointerup', up);
      btn.addEventListener('pointerleave', up);
      btn.addEventListener('pointercancel', up);
    }

    // 滑鼠：在遊戲畫面上按左鍵是普攻（可按住連打），右鍵是閃避
    const canvas = document.getElementById('scene');
    const track = (e) => {
      if (e.pointerType === 'mouse') { this.mouse.x = e.clientX; this.mouse.y = e.clientY; this.mouse.active = true; }
      else this.mouse.active = false; // 改用觸控時回到自動朝向最近敵人
    };
    addEventListener('pointermove', track);
    addEventListener('pointerdown', track, true);
    canvas.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      const action = e.button === 0 ? 'attack' : e.button === 2 ? 'dodge' : null;
      if (!action) return;
      e.preventDefault();
      this.queue.push(action);
      if (action === 'attack') this.held.add('attack');
    });
    addEventListener('pointerup', (e) => { if (e.pointerType === 'mouse' && e.button === 0) this.held.delete('attack'); });

    addEventListener('keydown', (e) => {
      if (KEY_MOVE[e.code]) { this.keys.add(e.code); e.preventDefault(); }
      const action = KEY_ACTIONS[e.code];
      if (action) {
        e.preventDefault();
        if (!e.repeat) this.queue.push(action);
        this.held.add(action);
      }
    });
    addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
      if (KEY_ACTIONS[e.code]) this.held.delete(KEY_ACTIONS[e.code]);
    });
    addEventListener('blur', () => { this.keys.clear(); this.held.clear(); });
    addEventListener('contextmenu', (e) => e.preventDefault());
  }

  // 回傳畫面座標系的移動向量（x 右、y 下），長度 0–1
  move() {
    let x = this.stick.x, y = this.stick.y;
    for (const code of this.keys) { x += KEY_MOVE[code][0]; y += KEY_MOVE[code][1]; }
    const len = Math.hypot(x, y);
    if (len < 0.15) return { x: 0, y: 0, len: 0 };
    const k = Math.min(1, len) / len;
    return { x: x * k, y: y * k, len: Math.min(1, len) };
  }

  takeActions() {
    const q = this.queue;
    this.queue = [];
    return q;
  }
}
