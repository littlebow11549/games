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
  g.master = {};
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
