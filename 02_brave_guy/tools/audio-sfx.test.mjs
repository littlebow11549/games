// Run: node --test 02_brave_guy/tools/audio-sfx.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../js/audio.js', import.meta.url), 'utf8');
const moduleUrl = 'data:text/javascript;base64,' + Buffer.from(source).toString('base64');
const { GameAudio } = await import(moduleUrl);
const mockStorage = new Map();
globalThis.localStorage = {
  getItem: key => mockStorage.get(key) ?? null,
  setItem: (key, value) => mockStorage.set(key, value),
};

function harness(sfx = {}) {
  mockStorage.clear();
  const g = new GameAudio({ audio: {}, sfx });
  const played = [];
  let fetchCount = 0;
  g.ctx = {
    decodeAudioData: async () => ({ decoded: true }),
    createBufferSource: () => ({
      connect() { return this; },
      start() { played.push('file'); },
    }),
  };
  g.master = {gain:{value:.5}};
  g.syntheticSfx = name => played.push('fallback:' + name);
  return { g, played, get fetchCount() { return fetchCount; }, inc() { fetchCount++; } };
}

test('undefined SFX slot uses synthesis and does not fetch', () => {
  const { g, played } = harness();
  g.sfx('swing');
  assert.deepEqual(played, ['fallback:swing']);
});

test('loaded SFX uses cache and supports overlapping playback', async () => {
  const h = harness({ hit: 'hit.mp3' });
  const previous = globalThis.fetch;
  globalThis.fetch = async () => { h.inc(); return { ok: true, arrayBuffer: async () => new ArrayBuffer(4) }; };
  try {
    h.g.ctx.currentTime = 0;
    h.g.sfx('hit');
    h.g.ctx.currentTime = .11;
    h.g.sfx('hit');
    // The project's approved impact is sample-only: don't substitute a different impact.
    assert.deepEqual(h.played, []);
    await h.g.sfxLoading.get('hit');
    h.g.ctx.currentTime = .22;
    h.g.sfx('hit');
    h.g.sfx('hit'); // same-frame impact is still suppressed
    h.g.ctx.currentTime = .33;
    h.g.sfx('hit');
    assert.equal(h.fetchCount, 1);
    assert.deepEqual(h.played, ['file', 'file']);
    assert.equal(h.g.voices.size, 2);
  } finally { globalThis.fetch = previous; }
});

test('failed download uses synthesis without retrying on each hit', async () => {
  const h = harness({ boom: 'missing.mp3' });
  const previousFetch = globalThis.fetch;
  const previousWarn = console.warn;
  console.warn = () => {};
  globalThis.fetch = async () => { h.inc(); throw new Error('offline'); };
  try {
    h.g.sfx('boom');
    await h.g.sfxLoading.get('boom');
    h.g.sfx('boom');
    assert.equal(h.fetchCount, 1);
    assert.deepEqual(h.played, ['fallback:boom', 'fallback:boom']);
  } finally { globalThis.fetch = previousFetch; console.warn = previousWarn; }
});

test('mute disables SFX while preserving BGM mute flag semantics', () => {
  const h = harness({ ui: 'ui.mp3' });
  h.g.muted = true;
  h.g.sfx('ui');
  assert.deepEqual(h.played, []);
  assert.equal(h.g.sfxLoading.size, 0);
});

test('cancelled async loop load cannot start after leaving combat', async () => {
 const {g,played}=harness({beam_loop:'beam.mp3'});
 let ready;g.loadSfx=()=>new Promise(resolve=>{ready=()=>{g.sfxBuffers.set('beam_loop',{});resolve();};});
 g.startLoop('beam_loop');g.stopLoops();ready();await Promise.resolve();
 assert.deepEqual(played,[]);assert.equal(g.loopRequests.size,0);
});

test('loop lifecycle stops on mute and one-shot charge does not restart while held', () => {
 const {g,played}=harness({beam_loop:'beam.mp3',transform_charge:'charge.mp3'});
 let stopped=0;const nodes=[];g.ctx.createBufferSource=()=>{const n={connect(){},disconnect(){},start(){played.push('file');},stop(){stopped++;}};nodes.push(n);return n;};
 g.sfxBuffers.set('beam_loop',{});g.sfxBuffers.set('transform_charge',{});
 g.syncCombatLoops('ult');g.syncCombatLoops('ult');assert.equal(nodes.length,1);assert(nodes[0].loop);
 g.setMuted(true);assert.equal(stopped,1);assert.equal(g.loopRequests.size,0);
 g.setMuted(false);g.syncCombatLoops('transforming');assert.equal(nodes[1].loop,false);nodes[1].onended();g.syncCombatLoops('transforming');assert.equal(nodes.length,2);
 g.syncCombatLoops(null);g.syncCombatLoops('transforming');assert.equal(nodes.length,3);
});

test('variants rotate and swarm sounds throttle while polyphony remains bounded',()=>{
 const {g}=harness({swing:['a.mp3','b.mp3','c.mp3'],spawn:'spawn.mp3',hit:'hit.mp3'});let stopped=0;const played=[];
 g.ctx.currentTime=0;g.ctx.createBufferSource=()=>({connect(){},start(){played.push(this.buffer);},stop(){stopped++;}});
 for(const k of ['swing:0','swing:1','swing:2','spawn','hit'])g.sfxBuffers.set(k,k);
 for(let i=0;i<4;i++){g.ctx.currentTime+=.1;g.sfx('swing');}assert.deepEqual(played,['swing:0','swing:1','swing:2','swing:0']);
 for(let i=0;i<100;i++)g.sfx('spawn');assert.equal(played.filter(x=>x==='spawn').length,1);
 for(let i=0;i<30;i++){g.ctx.currentTime+=.05;g.sfx('hit');}assert.equal(g.voices.size,16);assert(stopped>0);
});

test('user recording stops when leaving celebration',()=>{
 const {g}=harness({victory_human_cheer:'voice.wav'});let stops=0;
 g.ctx.createBufferSource=()=>({connect(){},start(){},stop(){stops++},disconnect(){}});
 g.sfxBuffers.set('victory_human_cheer',{});g.sfx('victory_human_cheer');assert.equal(g.crowdVoices.size,1);g.stopCelebration();assert.equal(stops,1);assert.equal(g.crowdVoices.size,0);
});

test('clean cues work before files load, use silent edges and respect mute', () => {
  for (const [name, expected] of [['stage_select',2], ['win',4], ['hit',2]]) {
    const audio = new GameAudio({});
    let starts = 0, disconnected = 0;
    const envelopes = [];
    audio.master = {};
    audio.ctx = {
      currentTime: 1,
      createOscillator: () => ({frequency:{},connect(){return this;},start(){starts++;},stop(){this.onended();},disconnect(){disconnected++;}}),
      createGain: () => {
        const points = []; envelopes.push(points);
        return {gain:{setValueAtTime(v){points.push(v);},linearRampToValueAtTime(v){points.push(v);},exponentialRampToValueAtTime(v){points.push(v);}},connect(){return this;},disconnect(){disconnected++;}};
      },
    };
    audio.sfx(name);
    assert.equal(starts, expected);
    assert.equal(disconnected, expected * 2);
    for (const points of envelopes) { assert.equal(points[0], 0); assert.equal(points.at(-1), 0); }
    audio.muted = true; audio.sfx(name);
    assert.equal(starts, expected);
  }
});

test('user victory recording loads before playback, with no synthesized substitute', async()=>{
 const {g,played}=harness({victory_human_cheer:'voice.wav'});
 g.loadSfx=async key=>{g.sfxBuffers.set(key,{});};
 g.sfx('victory_human_cheer');await new Promise(r=>setImmediate(r));
 assert.deepEqual(played,['file']);assert.equal(g.crowdVoices.size,1);
 const missing=harness();missing.g.sfx('victory_human_cheer');assert.deepEqual(missing.played,[]);
});
test('leaving victory cancels pending recorded cheer', async()=>{
 const {g,played}=harness({victory_human_cheer:'voice.wav'});let finish;
 g.loadSfx=()=>new Promise(resolve=>{finish=()=>{g.sfxBuffers.set('victory_human_cheer',{});resolve();};});
 g.sfx('victory_human_cheer');g.stopCelebration();finish();await new Promise(r=>setImmediate(r));assert.deepEqual(played,[]);
});

test('startup warms common sound only, limits background work, and skips muted sessions',async()=>{
 const {g}=harness({ui:'ui.mp3',ui_confirm:'confirm.mp3',hit:['a.mp3','b.mp3'],boss_ko:'ko.mp3',victory_human_cheer:'heavy.mp3',enemy_down:['long.wav','long2.wav','short.wav','long3.wav']});
 const names=[];let active=0,max=0;
 g.loadSfx=async name=>{names.push(name);++active;max=Math.max(max,active);await new Promise(setImmediate);--active;};
 g.muted=true;
 await g.preloadSfx();
 assert.deepEqual(names,[]);
 g.muted=false;
 const pending=g.preloadSfx();
 assert.equal(g.preloadSfx(),pending);
 await pending;
 assert.equal(max,2);
 assert.deepEqual(names.sort(),['boss_ko','enemy_down:2','hit:0','hit:1','ui','ui_confirm']);
});


test('enemy and cutscene cues never turn into a generic tone while files load or fail', async () => {
  const h = harness({ enemy_down:['down0.wav','down1.wav'], spawn:'spawn.mp3', dialog_next:'click.wav', notify:'notify.wav' });
  const previousFetch = globalThis.fetch, previousWarn = console.warn;
  console.warn = () => {};
  globalThis.fetch = async url => {
    if (url.startsWith('spawn')) throw new Error('offline');
    return { ok:true, arrayBuffer:async()=>new ArrayBuffer(4) };
  };
  try {
    h.g.sfx('enemy_down'); h.g.sfx('spawn'); h.g.sfx('dialog_next'); h.g.sfx('notify', { sampleOnly:true });
    assert.deepEqual(h.played, []);
    await Promise.all(h.g.sfxLoading.values());
    h.g.sfx('enemy_down'); // variant 1 is cold; use decoded variant 0, never a tone
    h.g.sfx('spawn'); h.g.sfx('dialog_next'); h.g.sfx('notify', { sampleOnly:true });
    assert.deepEqual(h.played, ['file','file','file']);
    await Promise.all(h.g.sfxLoading.values());
  } finally { globalThis.fetch = previousFetch; console.warn = previousWarn; }
});

test('monster death layers stay bounded during swarms without stealing player impacts', () => {
  const {g} = harness({enemy_down:'down.wav',hit:'hit.wav'});
  g.sfxBuffers.set('enemy_down','death');g.sfxBuffers.set('hit','impact');
  const nodes = [];
  g.ctx.createBufferSource=()=>({ connect(){}, disconnect(){}, start(){nodes.push(this);}, stop(){this.stopped=true;this.onended();} });
  g.ctx.currentTime=0;g.sfx('hit');
  for(let i=1;i<=5;i++){g.ctx.currentTime=i*.2;g.sfx('enemy_down');}
  assert.equal(nodes.filter(node=>node.buffer==='death'&&!node.stopped).length,2);
  assert.equal(g.voices.size,3);
  assert.equal(nodes[0].stopped,undefined);
});
