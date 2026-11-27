import assert from 'node:assert/strict';
import {test} from 'node:test';
import * as THREE from '../vendor/three/three.module.min.js';
global.document ??= {createElementNS(){throw Error('Textures disabled in Node fixture');}};
const {Fx}=await import('../js/fx.js');
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-6,`${actual} != ${expected}`);

test('boss circle and landing target use distinct art with identical physical radius and expiry',()=>{
 const fx=new Fx(new THREE.Scene()), origin=new THREE.Vector3(2,0,-4);
 const circle=fx.telegraph(origin,4.8,.6,0x5579ff);
 const impact=fx.telegraph(origin,4.8,.6,0x5579ff,'impact');
 assert.notEqual(circle.material.fragmentShader,impact.material.fragmentShader);
 assert.match(impact.material.fragmentShader,/brackets/);
 assert.doesNotMatch(circle.material.fragmentShader,/brackets/);
 for(const m of [circle,impact]){
  close(m.geometry.parameters.width*.5*m.material.uniforms.edge.value,4.8);
  assert.equal(m.material.depthWrite,false);
 }
 fx.update(.3);
 for(const m of [circle,impact]) close(m.material.uniforms.phase.value,.5);
 fx.update(.3);assert.equal(fx.scene.children.length,0);
});

test('boss lane chevrons point from cast origin to destination, fixed for entire windup',()=>{
 const fx=new Fx(new THREE.Scene()),from=new THREE.Vector3(2,0,-3),to=new THREE.Vector3(9,0,8);
 const line=fx.laneTelegraph(from,to,3.6,0xad61ff,.8);
 assert.equal(fx.laneTelegraph(from,from,3.6,0xad61ff,.8),null);
 assert.match(line.material.fragmentShader,/arrow/);
 close(line.geometry.parameters.width,3.6);
 const half=from.distanceTo(to)/2;
 for(const dt of [0,.2,.55]){
  fx.update(dt);line.updateMatrixWorld(true);
  const a=line.localToWorld(new THREE.Vector3(0,half,0));a.y=0;
  const b=line.localToWorld(new THREE.Vector3(0,-half,0));b.y=0;
  close(a.distanceTo(from),0);close(b.distanceTo(to),0);close(line.scale.x,1);
 }
 close(line.material.uniforms.phase.value,.75/.8);
 fx.update(.06);assert.equal(fx.scene.children.length,0);
});
