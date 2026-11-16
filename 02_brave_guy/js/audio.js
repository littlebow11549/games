// BGM 使用 manifest.audio；正式 SFX 可填 manifest.sfx，缺檔時沿用 WebAudio 合成音效。
const MUTE_KEY = 'game02.muted';

export class GameAudio {
  constructor(manifest) {
    this.tracks = (manifest && manifest.audio) || {};
    this.sfxTracks = (manifest && manifest.sfx) || {};
    this.sfxBuffers = new Map();
    this.sfxByUrl = new Map();
    this.bgmLoads = new Map();
    this.sfxLoading = new Map();
    this.sfxFailed = new Set();
    this.sfxVariants = new Map(); this.sfxLast = new Map(); this.voices = new Set(); this.crowdVoices=new Set();
    this.loops = new Map(); this.loopRequests = new Map(); this.duck = 1;
    this.muted = localStorage.getItem(MUTE_KEY) === '1';
    this.ctx = null;
    this.bgm = null;
    this.bgmSrc = null;
    this.bgmName = null;
    this.buffers = {};
  }

  // 必須在使用者手勢內呼叫（瀏覽器的自動播放限制）
  unlock() {
    if (this.ctx) { if(this.ctx.state === 'suspended') this.ctx.resume().catch(()=>{}); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.5;
    const limiter=this.ctx.createDynamicsCompressor();limiter.threshold.value=-8;limiter.knee.value=12;limiter.ratio.value=8;limiter.attack.value=.003;limiter.release.value=.15;
    this.master.connect(limiter).connect(this.ctx.destination);
    // BGM 走另一條音量，不受音效主音量影響
    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.value = this.muted ? 0 : 0.55 * this.duck;
    this.bgmGain.connect(this.ctx.destination);
    const len = this.ctx.sampleRate * 0.5;
    this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.preloadSfx();
  }

  applause() { this.sfx('applause'); this.sfx('crowd_cheer'); }
  stopCelebration(){for(const voice of this.crowdVoices){try{voice.stop();}catch{}}this.crowdVoices.clear();this.sfxLast.delete('applause');this.sfxLast.delete('crowd_cheer');}

  preloadSfx() {
    for(const [name,source] of Object.entries(this.sfxTracks)) {
      if(Array.isArray(source)) source.forEach((url,i)=>this.loadSfx(`${name}:${i}`,this.resolve(url)));
      else if(source) this.loadSfx(name,this.resolve(source));
    }
  }
  duckBgm(factor) { this.duck=factor; if(this.bgmGain)this.bgmGain.gain.value=this.muted?0:.55*factor; if(this.bgm)this.bgm.volume=.5*factor; }
  startLoop(name, repeat=true) {
    if(this.muted || !this.ctx || this.loopRequests.has(name))return;
    const source=this.sfxTracks[name];if(!source)return;
    const token={};this.loopRequests.set(name,token);
    const begin=()=>{
      if(this.loopRequests.get(name)!==token || this.muted)return;
      const buffer=this.sfxBuffers.get(name);if(!buffer){this.loopRequests.delete(name);return;}
      const player=this.ctx.createBufferSource();player.buffer=buffer;player.loop=repeat;player.connect(this.master);this.loops.set(name,player);
      player.onended=()=>{player.disconnect();if(this.loops.get(name)===player){this.loops.delete(name);if(repeat)this.loopRequests.delete(name);}};player.start();
    };
    if(this.sfxBuffers.has(name))begin();else Promise.resolve(this.loadSfx(name,this.resolve(source))).then(begin);
  }
  stopLoop(name) { this.loopRequests.delete(name);const player=this.loops.get(name);this.loops.delete(name);if(player){try{player.stop();}catch{} player.disconnect();} }
  stopLoops() { for(const name of [...this.loopRequests.keys()])this.stopLoop(name); }
  syncCombatLoops(state) {
    for(const [name,wanted] of [['beam_loop',state==='ult'],['transform_charge',state==='transforming']]) {
      if(wanted)this.startLoop(name,name==='beam_loop');else this.stopLoop(name);
    }
  }

  setMuted(m) {
    this.muted = m;
    if(m)this.stopLoops();
    localStorage.setItem(MUTE_KEY, m ? '1' : '0');
    if (this.master) this.master.gain.value = m ? 0 : 0.5;
    if (this.bgmGain) this.bgmGain.gain.value = m ? 0 : 0.55 * this.duck;
    if (this.bgm) this.bgm.muted = m;
  }

  // 裝置不支援 OGG（部分 iOS Safari）時改讀同名的 .mp3；兩種格式都有交付
  resolve(url) {
    if (!/\.ogg$/i.test(url)) return url;
    if (this.oggOk === undefined) this.oggOk = !!new Audio().canPlayType('audio/ogg; codecs="vorbis"');
    return this.oggOk ? url : url.replace(/\.ogg$/i, '.mp3');
  }

  stopBgm() {
    this.bgmGeneration=(this.bgmGeneration||0)+1;
    if (this.bgmSrc) { try { this.bgmSrc.stop(); } catch { /* 已停止 */ } this.bgmSrc.disconnect?.(); this.bgmSrc = null; }
    if (this.bgm) { this.bgm.pause(); this.bgm = null; }
  }

  // 優先用 WebAudio 解碼後循環：OGG 這樣才是真的無縫。解碼失敗再退回 <audio>。
  async playBgm(name) {
    if (this.bgmName === name) return;
    this.stopBgm();
    this.bgmName = name;
    const generation=this.bgmGeneration;
    const raw = this.tracks[name];
    if (!raw) return;
    const url = this.resolve(raw);
    const loop = !['bgm_victory', 'bgm_defeat', 'bgm_transform', 'bgm_ending', 'bgm_credits'].includes(name);
    try {
      if (!this.ctx) throw new Error('no audio context');
      if (!this.buffers[url]) {
        if (this.onLoading) this.onLoading(true);
        if(!this.bgmLoads.has(url)){
          const request=(async()=>{const response=await fetch(url);if(!response.ok)throw new Error('BGM HTTP '+response.status);return this.ctx.decodeAudioData(await response.arrayBuffer());})();
          this.bgmLoads.set(url,request);
          request.finally(()=>this.bgmLoads.delete(url)).catch(()=>{});
        }
        this.buffers[url] = await this.bgmLoads.get(url);
      }
      if (this.onLoading) this.onLoading(false);
      this.trimBgmCache(url);
      if (this.bgmName !== name || generation!==this.bgmGeneration) return; // 載入期間已經換曲
      const src = this.ctx.createBufferSource();
      src.buffer = this.buffers[url];
      src.loop = loop;
      src.connect(this.bgmGain);
      src.start();
      this.bgmSrc = src;
    } catch (err) {
      if (this.onLoading) this.onLoading(false);
      if (this.bgmName !== name || generation!==this.bgmGeneration) return;
      this.bgm = new Audio(url);
      this.bgm.loop = loop;
      this.bgm.volume = 0.5 * this.duck;
      this.bgm.muted = this.muted;
      this.bgm.play().catch(() => {});
    }
  }

  trimBgmCache(recent) {
    // Preserve the active track; retain at most 3 decoded tracks / 64 MiB otherwise.
    const buffer=this.buffers[recent];delete this.buffers[recent];if(buffer)this.buffers[recent]=buffer;
    const bytes=()=>Object.values(this.buffers).reduce((n,b)=>n+(b.length||0)*(b.numberOfChannels||1)*4,0);
    const active=this.tracks[this.bgmName]&&this.resolve(this.tracks[this.bgmName]);
    for(const key of Object.keys(this.buffers)){
      if(Object.keys(this.buffers).length<=3&&bytes()<=64*1024*1024)break;
      if(key!==active)delete this.buffers[key];
    }
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

  // 正式音效採首次觸發後背景載入，已緩存時以獨立 BufferSource 疊音。
  // 初次載入、網路錯誤或解碼失敗均維持原合成音，不阻塞戰鬥。
  loadSfx(name, url) {
    if (!this.ctx || this.sfxFailed.has(name)) return Promise.resolve();
    if(this.sfxLoading.has(name))return this.sfxLoading.get(name);
    if(this.sfxBuffers.has(name))return Promise.resolve();
    const promise = (async () => {
      try {
        if(!this.sfxByUrl.has(url))this.sfxByUrl.set(url,(async()=>{
          const response=await fetch(url+(url.includes('?')?'&':'?')+'v=20261115crisp');
          if(!response.ok)throw new Error('SFX HTTP '+response.status);
          return this.ctx.decodeAudioData(await response.arrayBuffer());
        })());
        const buffer=await this.sfxByUrl.get(url);
        this.sfxBuffers.set(name, buffer);
      } catch (error) {
        this.sfxFailed.add(name);
        console.warn('SFX fallback:', name, error);
      } finally {
        this.sfxLoading.delete(name);
      }
    })();
    this.sfxLoading.set(name, promise);
    return promise;
  }

  sfx(name) {
    if (this.muted) return;
    const now=this.ctx?.currentTime;
    const gap={spawn:.16,enemy_down:.09,enemy_fly:.14,guilt_tick:.3,guilt_crack:1.2,hit:.035,crit:.06,bubble:.25,guard:.08,applause:6.5,crowd_cheer:12}[name] ?? .025;
    if(Number.isFinite(now)){if(now-(this.sfxLast.get(name)??-Infinity)<gap)return;this.sfxLast.set(name,now);}
    let source=this.sfxTracks[name],cacheKey=name;
    if(Array.isArray(source)){const i=this.sfxVariants.get(name)||0;this.sfxVariants.set(name,(i+1)%source.length);cacheKey=`${name}:${i}`;source=source[i];}
    if (source && this.ctx && this.master) {
      const buffer = this.sfxBuffers.get(cacheKey);
      if (buffer) {
        if(this.voices.size>=16){const oldest=this.voices.values().next().value;oldest.stop?.();this.voices.delete(oldest);}
        const player=this.ctx.createBufferSource();player.buffer=buffer;player.connect(this.master);this.voices.add(player);
        if(name==='applause'||name==='crowd_cheer')this.crowdVoices.add(player);
        player.onended=()=>{player.disconnect?.();this.voices.delete(player);this.crowdVoices.delete(player);};player.start();return;
      }
      this.loadSfx(cacheKey,this.resolve(source));
    }
    if(name==='stage_select'||name==='dialog_next'||name==='win'){this.cleanUiCue(name);return;}
    const basic=['swing','hit','crit','boom','hurt','skill','dodge','shoot','ui','win','lose'];
    const fallback=basic.includes(name)?name:/burst|slam|quake|blast|done|reveal|beam_end/.test(name)?'boom':/punch|kick|fly|fan/.test(name)?'swing':/hurt|guilt/.test(name)?'hurt':/full|beam|charge|revive|combo/.test(name)?'skill':'ui';
    this.syntheticSfx(fallback);
  }

  // Match the PCM cues even on the first click before audio files finish loading.
  cleanUiCue(name) {
    if(!this.ctx || !this.master)return;
    const combat={lose:[[0,392,.18,.17],[.10,330,.20,.15],[.20,262,.25,.12]],swing:[[0,330,.16,.20]],hit:[[0,130,.15,.35],[.01,520,.06,.10]],crit:[[0,110,.22,.40],[.01,440,.08,.12]],boom:[[0,65,.40,.40],[.02,130,.25,.15]],hurt:[[0,196,.17,.22]],skill:[[0,440,.18,.20],[.07,660,.22,.16]],dodge:[[0,330,.14,.16]],shoot:[[0,660,.13,.18]],ui:[[0,587.330,.105,.12]]};
    const notes=combat[name] || (name==='win'?[[0,523.251,.22,.17],[.10,659.255,.22,.15],[.20,783.991,.24,.14],[.32,1046.502,.32,.12]]:name==='stage_select'?[[0,659.255,.15,.19],[.075,987.767,.20,.16]]:[[0,587.330,.105,.12]]);
    for(const [delay,frequency,duration,volume] of notes){
      const start=this.ctx.currentTime+delay,osc=this.ctx.createOscillator(),gain=this.ctx.createGain();
      osc.type='sine';osc.frequency.value=frequency;
      gain.gain.setValueAtTime(0,start);
      gain.gain.linearRampToValueAtTime(volume,start+.008);
      gain.gain.exponentialRampToValueAtTime(volume*.025,start+duration-.025);
      gain.gain.linearRampToValueAtTime(0,start+duration);
      osc.connect(gain).connect(this.master);
      osc.onended=()=>{osc.disconnect();gain.disconnect();};
      osc.start(start);osc.stop(start+duration);
    }
  }

  syntheticSfx(name) {
    this.cleanUiCue(name);
  }
}
