import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {STAGES} from '../js/story.js';
import {SCHOOL_QUALITY} from '../js/stage-art/story-quality-school.js';
import {OFFICE_QUALITY} from '../js/stage-art/story-quality-office.js';
import {FINALE_QUALITY} from '../js/stage-art/story-quality-finale.js';
import {SCENE_GRADES,modelLightRig} from '../js/stage-art/story-scene-grade.js';
import {buildSceneHorizon} from '../js/stage-art/story-scene-horizon.js';
const scenes={...SCHOOL_QUALITY,...OFFICE_QUALITY,...FINALE_QUALITY};
const hash=types=>createHash('sha256').update(JSON.stringify(Object.entries(types).sort(([a],[b])=>a.localeCompare(b)).map(([id,stage])=>[id,stage.rows]))).digest('hex');

test('all playable layouts have an art path with no extra or missing entries',()=>{
 assert.deepEqual([...Object.keys(scenes),'1-1'].sort(), STAGES.map(s=>s.id).sort());
 assert.equal(STAGES.length,16);
 assert.deepEqual(Object.keys(SCENE_GRADES).sort(),Object.keys(scenes).filter(id=>id!=='3-7').sort());
});

test('scene art keeps the previously released walkable layouts verbatim',()=>{
 assert.equal(hash(scenes),'d263ed0ad7f70da0ef0bd13415ccd70e9dbe2661c82c1f2c3c3e903c871270a4');
});

test('each scene backdrop can construct finite, nonempty batched geometry',()=>{
 for(const [id,scene] of Object.entries(scenes)){
  let objects=0;
  const part=new Proxy({}, {get:(_,kind)=>(...args)=>{
    const n=kind==='cone'?5:kind==='cyl'?6:5;
    const coords=kind==='sign'?args.slice(0,n):args.filter(x=>typeof x==='number');
    assert(coords.every(Number.isFinite),id+' '+String(kind));
    objects++;
  }});
  const kit={place(x,z,yaw,fn){ assert([x,z,yaw].every(Number.isFinite),id);fn(part);},
    at(_n,fn){fn(part);}};
  scene.backdrop(kit);
  buildSceneHorizon(kit,id);
  assert(objects>15,id);
 }
});

test('local light pools have valid art-only coordinates and bounded opacity',()=>{
 for(const [id,scene] of Object.entries(SCENE_GRADES)){
  assert(scene.lights.length>=2,id);
  for(const [x,z,rx,rz,hue,a] of scene.lights){
   assert([x,z,rx,rz,a].every(Number.isFinite),id);
   assert(rx>1&&rz>1&&a>0&&a<.75,id);
   assert.match(hue,/^#[\da-f]{6}$/i);
  }
  assert(modelLightRig(scene).every(x=>x[5]<.4));
 }
});
