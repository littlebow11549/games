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
    h.g.sfx('hit');
    h.g.sfx('hit');
    assert.deepEqual(h.played, ['fallback:hit', 'fallback:hit']);
    await h.g.sfxLoading.get('hit');
    h.g.sfx('hit');
    h.g.sfx('hit');
    assert.equal(h.fetchCount, 1);
    assert.deepEqual(h.played.slice(2), ['file', 'file']);
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
