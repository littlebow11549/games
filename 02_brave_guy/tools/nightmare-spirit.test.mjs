import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as THREE from '../vendor/three/three.module.min.js';
import {createNightmareDrone} from '../js/nightmare-drone-art.js';
globalThis.location={search:''};
const {createGuestCombat}=await import('../js/guest-combat.js');

test('Tripo-derived body is a reratioed textured 3D asset, and the wings animate with shared geometry',()=>{
 const glb=readFileSync(new URL('../assets/runtime/stage-art/brave_guy_charactor03_nightmare_spirit.glb',import.meta.url));
 assert.equal(glb.subarray(0,4).toString(),'glTF');
 const doc=JSON.parse(glb.subarray(20,20+glb.readUInt32LE(12)));
 assert.match(doc.asset.generator,/Tripo-derived/);
 const primitive=doc.meshes[0].primitives[0];
 assert(doc.accessors[primitive.attributes.POSITION].max[1]>1.4);
 assert.equal(doc.images[0].mimeType,'image/jpeg');
 assert(glb.length<900000);
 const scene=new THREE.Scene(), one=createNightmareDrone(scene), two=createNightmareDrone(scene);
 assert.equal(one.parent,scene);
 const modelHeight=doc.accessors[primitive.attributes.POSITION].max[1];
 const braveHeight=JSON.parse(readFileSync(new URL('../assets/manifest.json',import.meta.url),'utf8')).models.brave_spirit.height;
 for(const s of one.scale.toArray())assert(Math.abs(s*modelHeight-braveHeight)<.001);
 assert.equal(one.children.length,3);
 assert.equal(one.children[1].geometry,two.children[1].geometry);
 const a=one.children[1].rotation.y;one.userData.advanceSpirit(.12);
 assert.notEqual(one.children[1].rotation.y,a);
 one.userData.releaseSpirit();
 assert.equal(two.children.length,3);
});

test('each of five spirits fires one straight wave every two seconds through t=10, even without a target',()=>{
 const scene=new THREE.Scene(), hero={pos:new THREE.Vector3(),yaw:0}, shots=[];
 scene.addEventListener('childadded',({child})=>{if(child.name.includes('straight nightmare wave'))shots.push({at:clock,p:child.position.clone(),object:child})});
 const game=createGuestCombat({scene,hero,enemies:()=>[],fx:{},audio:{sfx(){}},arena:30});
 let clock=0;
 game.begin('nightmare','skill2');
 for(let k=1;k<=200;k++){
  clock=k/20;game.update(1/20);
  if(k<200)assert.equal(game.state.casts[0].nodes,5);
  assert.equal(shots.length,5*Math.floor(k/40));
 }
 assert.deepEqual([...new Set(shots.map(s=>s.at))],[2,4,6,8,10]);
 assert.equal(game.state.casts.length,0);
 let waves=scene.children.filter(o=>o.name.includes('straight nightmare wave'));
 assert(waves.length>=5);

 const pos=waves.map(o=>o.position.clone());game.update(.05);
 waves.forEach((o,i)=>{assert.equal(o.position.x,pos[i].x);assert(Math.abs(o.position.z-pos[i].z-1.5)<1e-9)});
 game.clear();assert.equal(scene.children.length,0);
});
