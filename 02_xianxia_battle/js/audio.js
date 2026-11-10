// 音訊：音效先以 WebAudio 合成佔位；BGM 由 assets/manifest.json 的 audio 欄位提供。
const MUTE_KEY = 'game02.muted';

export class GameAudio {
  constructor(manifest) {
    this.tracks = (manifest && manifest.audio) || {};
    this.muted = localStorage.getItem(MUTE_KEY) === '1';
    this.ctx = null;
    this.bgm = null;
    this.bgmName = null;
  }

  // 必須在使用者手勢內呼叫（瀏覽器的自動播放限制）
  unlock() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.5;
    this.master.connect(this.ctx.destination);
    const len = this.ctx.sampleRate * 0.5;
    this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }

  setMuted(m) {
    this.muted = m;
    localStorage.setItem(MUTE_KEY, m ? '1' : '0');
    if (this.master) this.master.gain.value = m ? 0 : 0.5;
    if (this.bgm) this.bgm.muted = m;
  }

  playBgm(name) {
    if (this.bgmName === name) return;
    if (this.bgm) { this.bgm.pause(); this.bgm = null; }
    this.bgmName = name;
    const url = this.tracks[name];
    if (!url) return;
    this.bgm = new Audio(url);
    this.bgm.loop = name !== 'bgm_victory';
    this.bgm.volume = 0.5;
    this.bgm.muted = this.muted;
    this.bgm.play().catch(() => {});
  }

  noise(dur, freq, q, gain, sweepTo) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = this.ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.setValueAtTime(freq, t);
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    f.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f).connect(g).connect(this.master);
    src.start(t);
    src.stop(t + dur);
  }

  tone(type, f0, f1, dur, gain) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + dur);
  }

  sfx(name) {
    switch (name) {
      case 'swing': this.noise(0.16, 900, 1.2, 0.5, 3200); break;
      case 'hit': this.tone('square', 220, 70, 0.09, 0.35); this.noise(0.07, 2400, 0.8, 0.4); break;
      case 'crit': this.tone('square', 330, 60, 0.14, 0.45); this.noise(0.12, 3200, 0.7, 0.5); break;
      case 'boom': this.tone('sine', 120, 30, 0.5, 0.9); this.noise(0.45, 400, 0.5, 0.8, 80); break;
      case 'hurt': this.tone('sawtooth', 300, 120, 0.18, 0.3); break;
      case 'skill': this.tone('triangle', 400, 1200, 0.25, 0.3); this.noise(0.25, 1500, 2, 0.3, 5000); break;
      case 'dodge': this.noise(0.14, 500, 1, 0.35, 1800); break;
      case 'shoot': this.tone('triangle', 700, 300, 0.12, 0.2); break;
      case 'ui': this.tone('sine', 880, 1320, 0.08, 0.25); break;
      case 'win': [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.tone('triangle', f, f, 0.3, 0.3), i * 120)); break;
      case 'lose': [392, 330, 262].forEach((f, i) => setTimeout(() => this.tone('triangle', f, f * 0.9, 0.4, 0.3), i * 200)); break;
    }
  }
}
