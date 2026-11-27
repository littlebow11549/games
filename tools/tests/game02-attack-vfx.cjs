const assert = require('node:assert/strict');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {test} = require('node:test');
global.document = {createElementNS(){throw Error('Texture downloads disabled in Node fixture');}};
const url = f => pathToFileURL(path.resolve(__dirname,'../../02_brave_guy',f)).href;
const ready = Promise.all([import(url('vendor/three/three.module.min.js')),import(url('js/fx.js'))]);
const close = (a,b) => assert(Math.abs(a-b)<1e-6,`${a} != ${b}`);
test('warning holds the actual radius, fills with elapsed time and is removed at release',async()=>{
 const [T,{Fx}]=await ready, scene=new T.Scene(), fx=new Fx(scene);
 const p=new T.Vector3(5,2,-4), warning=fx.telegraph(p,7.5,.8,0xb06cff);
 p.set(0,0,0);
 close(warning.position.x,5); close(warning.position.z,-4);
 close(warning.geometry.parameters.width/2 * warning.material.uniforms.edge.value,7.5);
 fx.update(.4);close(warning.material.uniforms.phase.value,.5);
 fx.update(.401);assert.equal(scene.children.length,0);
});
test('directional trails stay inside both endpoints even when fading, and skip zero-length streaks',async()=>{
 const [T,{Fx}]=await ready, fx=new Fx(new T.Scene());
 const a=new T.Vector3(2,0,7),b=new T.Vector3(9,0,2),d=b.clone().sub(a).normalize();
 const m=fx.trail(a,b,4,0xffa5df,.55,.35,{alignToPath:true});
 for(const k of [0,.1]){
  fx.update(k);m.updateMatrixWorld(true);
  const p=m.localToWorld(new T.Vector3(0,Math.hypot(7,5)/2,0));p.y=0;
  close(p.distanceTo(a),0);close(new T.Vector3(0,1,0).applyQuaternion(m.quaternion).dot(d),-1);
 }
 assert.equal(fx.trail(a,a,4),null);
});
test('release burst is distinct from warning and separately capped during rapid multi-casts',async()=>{
 const [T,{Fx}]=await ready, scene=new T.Scene(), fx=new Fx(scene);
 const a=new T.Vector3();
 for(let i=0;i<24;i++)fx.releaseWave(a,6,0xff9b50,.5);
 assert.equal(scene.children.length,8);
 assert(scene.children.every(o=>o.material.uniforms.phase.value===0));
 fx.update(.2);
 assert(scene.children.every(o=>Math.abs(o.material.uniforms.phase.value-.4)<1e-6));
 fx.clear();assert.equal(scene.children.length,0);
});
test('a ranged streak follows the projectile heading without moving its collision centre',async()=>{
 const [T,{Fx}]=await ready, scene=new T.Scene(), fx=new Fx(scene);
 const shot=new T.Group();shot.position.set(4,1.2,5);scene.add(shot);
 const str=fx.projectileWake(shot,new T.Vector3(8,0,-6),1.2,0x9be564);
 assert.equal(str.children.length,2);
 close(str.rotation.y,Math.atan2(8,-6));
 fx.update(.09);assert(str.children.every(o=>o.material.uniforms.phase.value>0));
 close(shot.position.distanceTo(new T.Vector3(4,1.2,5)),0);
 shot.removeFromParent();fx.update(.01);assert.equal(scene.children.length,0);assert.equal(fx.items.length,0);
});
