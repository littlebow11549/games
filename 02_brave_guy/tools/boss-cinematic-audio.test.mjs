import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {BOSS_STORYBOARDS} from '../js/boss-storyboards.js';
const manifest=JSON.parse(readFileSync(new URL('../assets/manifest.json',import.meta.url),'utf8'));
test('Boss cinematic cue list does not use whistles or notification tones, and Mid King uses soft Foley for the reveal',()=>{
 for(const {cues} of Object.values(BOSS_STORYBOARDS))for(const [,key] of cues){
  assert(!['notify','whistle','dialog_next','ui_confirm'].includes(key),key);
  assert(manifest.sfx[key],key);
 }
 assert.deepEqual(BOSS_STORYBOARDS.midKing.cues.map(c=>c[1]),['punch_clock','hit_heavy','boss_slam']);
 assert.equal(manifest.sfx.guilt_crack,manifest.sfx.hit_3);
 assert.match(manifest.sfx.whistle,/whistle/); // battle warning intentionally remains
});
