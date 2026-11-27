const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname,'../../02_brave_guy');
const T = require(path.join(root,'vendor/three/three.module.min.js'));
function load(name, extras={}) {
 const source = fs.readFileSync(path.join(root,'js',name),'utf8').replace(/^import .+;\r?$/gm,'').replace(/^export /gm,'');
 const symbol = name==='guest-combat.js'?'createGuestCombat':'createAngelIceFx';
 return vm.runInNewContext(source+'\n'+symbol,{THREE:T,Math,...extras},{filename:name});
}
const createAngelIceFx=load('angel-ice-fx.js');
const make=()=> {
 const scene=new T.Scene(), logs=[], hero={pos:new T.Vector3(1,0,2),yaw:0,hp:1,character:'angel'};
 const enemy=(x,z)=>({hp:999,pos:new T.Vector3(x,0,z),def:{radius:1},state:'chase',shown:true});
 const roster=[enemy(1,8),enemy(1,15)];
 const api=load('guest-combat.js',{createAngelIceFx,disposeProjectileMaterial:m=>m.dispose()})({scene,hero,enemies:()=>roster,fx:{ring(){},trail(){}},hit:(e,m,{src})=>{logs.push({e,m,src});return{damaged:true};},audio:{sfx(){}},arena:40});
 return {api,scene,hero,roster,logs};
};
test('art is genuine volumetric snow/crystal geometry with bounded render batches and proper disposal',()=>{
 const scene=new T.Scene(), origin=new T.Vector3(3,0,-8);
 for(const [phase,limit] of [['nova',60],['vortex',75],['finish',55],['barrier-pop',20]]){
  const art=createAngelIceFx(scene,origin,phase);
  const group=scene.getObjectByName('angel-ice-'+phase);
  art.update(.32);
  assert.ok(group.position.equals(origin));
  assert.ok(group.children.length<=13);
  const batches=group.children.filter(m=>m.isInstancedMesh);
  assert.equal(batches.length,2);
  assert.ok(batches.reduce((n,o)=>n+o.count,0)<=limit);
  const a=new T.Matrix4(), b=new T.Matrix4();
  batches[0].getMatrixAt(2,a);art.update(.13);batches[0].getMatrixAt(2,b);
  assert.ok(!a.equals(b),'crystals animate rather than repeating a static plate');
  const g=batches[0].geometry;g.computeBoundingBox();
  assert.ok(g.boundingBox.max.y-g.boundingBox.min.y>2);
  assert.ok(batches[1].geometry.attributes.position.count>=60);
  let released=0;
  group.traverse(o=>{if(o.isMesh){o.geometry.addEventListener('dispose',()=>released++);o.material.addEventListener('dispose',()=>released++);}});
  art.clear();art.clear();assert.equal(scene.children.length,0);assert.equal(released,group.children.length*2);
 }
});
test('E remains instant radius-9 hit/freeze, independent of its two-second art',()=>{
 const {api,scene,roster,logs}=make();api.begin('angel','skill2');
 assert.equal(logs.length,1);assert.equal(logs[0].m,2.5);
 assert.equal(roster[0].guestStatus,'freeze');assert.equal(roster[0].guestHold,3);
 assert.ok(scene.getObjectByName('angel-ice-nova'));
 api.update(2.01);
 assert.equal(logs.length,1);assert.equal(scene.children.length,0);
});
test('R keeps the following barrier and five staggered stun hits; F keeps inward pull, pulse/final damage and expiry',()=>{
 const {api,scene,hero,roster,logs}=make();
 api.begin('angel','skill3');
 api.update(.28);assert.equal(api.state.casts[0].exploded,0);
 api.update(.03);assert.equal(api.state.casts[0].exploded,1);assert.ok(scene.getObjectByName('angel-ice-barrier-pop'));
 hero.pos.set(2,0,2);api.update(.7);
 assert.equal(api.state.casts[0].exploded,5);assert.ok(scene.getObjectByName('angel-repelling-barrier').position.equals(hero.pos));
 api.clear();assert.equal(scene.children.length,0);logs.length=0;
 const before=roster[1].pos.distanceTo(hero.pos);
 api.begin('angel','ult');assert.ok(api.ultActive);assert.ok(scene.getObjectByName('angel-ice-vortex'));
 api.update(.05); assert.ok(roster[1].pos.distanceTo(hero.pos)<before);
 assert.equal(logs[0].m,.65); assert.equal(logs[0].src,'ult');assert.equal(roster[0].guestPullT,.3);
 for(let i=0;i<198;i++)api.update(.02);
 assert.ok(!api.ultActive);
 assert.ok(scene.getObjectByName('angel-ice-finish'));
 assert.equal(scene.getObjectByName('angel-ice-vortex'),undefined);
 assert.equal(logs.filter(r=>r.m===6).length,2);
 api.update(.72);assert.equal(scene.children.length,0);
});
