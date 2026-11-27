import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {BOSS_STORYBOARDS} from '../js/boss-storyboards.js';
const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const manifest=JSON.parse(read('../assets/manifest.json'));
test('Boss introductions keep the music but add no per-panel or speech-like effects',()=>{
 for(const [key,board] of Object.entries(BOSS_STORYBOARDS))assert.equal(board.cues?.length??0,0,key);
 assert.match(manifest.sfx.whistle,/whistle/); // battle warning intentionally remains
});
test('Final Boss story panels leave Foley only on the actual punch and final burst',()=>{
 const source=read('../js/cinematics.js');
 const keys=label=>[...source.split('const '+label+'_SHOTS=[')[1].split('];')[0].matchAll(/sound:'([^']+)'/g)].map(m=>m[1]);
 assert.deepEqual(keys('FIRSTSTRIKE'),['hit_heavy']);
 assert.deepEqual(keys('AWAKENING'),['boss_slam']);
});
