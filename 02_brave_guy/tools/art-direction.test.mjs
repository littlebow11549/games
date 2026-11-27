import test from 'node:test';
import assert from 'node:assert/strict';
import {STAGES} from '../js/story.js';
import * as art from '../js/stage-art/stage-atmosphere.js';
import * as impact from '../js/impact-art.js';
import * as shadows from '../js/actor-shadows.js';
import * as hud from '../js/battle-readability.js';
test('crowd health meter keeps targeted and damaged enemies, not every untouched mob',()=>{
 assert.equal(typeof hud.revealMobHealth,'function');
 assert(hud.revealMobHealth(5,false,10,10));
 assert(!hud.revealMobHealth(16,false,10,10));
 assert(hud.revealMobHealth(16,true,10,10));
 assert(hud.revealMobHealth(16,false,6,10));
});

test('all campaign scenes have an individual, bounded color and depth treatment',()=>{
 assert.equal(Object.keys(art.CAMPAIGN_LOOK || {}).length,STAGES.length);
 const signatures=new Set();
 for(const stage of STAGES){
  const p=art.CAMPAIGN_LOOK[stage.id];
  assert.match(p.warm,/^#[0-9a-f]{6}$/i);
  assert.match(p.shadow,/^#[0-9a-f]{6}$/i);
  assert(p.depth[0]>=20 && p.depth[1]>p.depth[0]+20);
  assert(p.veil>0&&p.veil<=.24);
  signatures.add(JSON.stringify(p));
 }
 assert.equal(signatures.size,STAGES.length);
});
test('impact angle comes from projected aim, with a stable fallback for point-blank hits',()=>{
 assert.equal(typeof impact.impactAngle,'function');
 assert.equal(impact.impactAngle(0,0),0);
 assert.equal(impact.impactAngle(24,0),0);
 assert(Math.abs(impact.impactAngle(0,16)+Math.PI/2)<.00001);
 assert(Math.abs(Math.abs(impact.impactAngle(-24,0))-Math.PI)<.00001);
});
test('contact stamps retain a dark foot anchor and fall off smoothly into the penumbra',()=>{
 assert.equal(typeof shadows.contactFalloff,'function');
 const f=shadows.contactFalloff;
 assert(f(0)>.9&&f(.4)>.5&&f(.72)>.05);
 assert(f(.4)>f(.72)&&f(.72)>f(.88));
 assert.equal(f(1),0);
});
