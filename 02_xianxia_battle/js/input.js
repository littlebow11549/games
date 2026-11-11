// 輸入：虛擬搖桿（觸控／滑鼠）＋鍵盤，動作鍵以佇列回傳。
const KEY_ACTIONS = { KeyJ: 'attack', Space: 'transform', KeyK: 'skill1', KeyL: 'skill2', KeyI: 'skill3', KeyO: 'ult', ShiftLeft: 'dodge', ShiftRight: 'dodge' };
const KEY_MOVE = { KeyW: [0, -1], ArrowUp: [0, -1], KeyS: [0, 1], ArrowDown: [0, 1], KeyA: [-1, 0], ArrowLeft: [-1, 0], KeyD: [1, 0], ArrowRight: [1, 0] };

export class Input {
  constructor() {
    this.stick = { x: 0, y: 0 };
    this.keys = new Set();
    this.queue = [];
    this.held = new Set();

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
