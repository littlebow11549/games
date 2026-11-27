import test from 'node:test';
import assert from 'node:assert/strict';
import {STAGES} from '../js/story.js';
import {sceneCraft,craftPlacements} from '../js/stage-art/scene-craft.js';
import {impactWaveShape} from '../js/attack-art.js';

test('each authored scene has an original focal motif and bounded placements',()=>{
 assert.deepEqual(Object.keys(sceneCraft).sort(),STAGES.map(s=>s.id).sort());
 assert.equal(new Set(Object.values(sceneCraft).map(p=>p.motif)).size,STAGES.length);
 const cells=[{x:0,z:0,kind:'S'},{x:4.6,z:0,kind:'.'},{x:-4.6,z:-4.6,kind:'.'},{x:0,z:-9.2,kind:'B'},{x:4.6,z:-9.2,kind:'E'},{x:9.2,z:-9.2,kind:'.'}];
 const p=craftPlacements(cells,4.6,'2-1');
 assert.equal(p.length,2);
 assert(p.every(item=>cells.some(c=>c.kind==='.'&&c.x===item.x&&c.z===item.z)));
 assert(p.every(item=>item.radius<=4.6*.47));
});
test('impact wave finishes inside the original gameplay radius',()=>{
 const {worldScale,edge}=impactWaveShape;
 assert(worldScale*edge/2<=1);
 assert(worldScale*edge/2>.93);
});
