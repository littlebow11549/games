const assert=require('node:assert/strict'), fs=require('node:fs'), path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../../02_brave_guy'), rd=n=>fs.readFileSync(path.join(root,n),'utf8');
const src=rd('js/jiasen-motion.js'),main=rd('js/main.js'),v=rd('js/visuals.js');
const m=vm.runInNewContext(src.replaceAll('export ','')+'\n({jiasenModels,jiasenMove,jiasenAttackTime,buildJiamangPan})');
const models=JSON.parse(rd('assets/manifest.json')).models;
assert.deepEqual(Array.from(m.jiasenModels({waves:[{jiasen:3}]},[])),['jiasen']);
assert.deepEqual(Array.from(m.jiasenModels({waves:[{kaban:3}]},[{minion:'jiamang'}])),['jiamang']);
assert.deepEqual(Array.from(m.jiasenModels({waves:[{folaidi:4}]},[{vis:'jiamang'}])),['jiamang']);
assert.deepEqual(Array.from(m.jiasenModels({waves:[{folaidi:4}]},[])),[]);
assert.equal(m.jiasenAttackTime('jiasen',.75),1);
assert.equal(m.jiasenAttackTime('jiamang',.8),1.05);
assert.equal(m.jiasenAttackTime('kaban',.55),null);
for(const [move,clip,t] of [['slam','skill1',.95],['charge','skill2',1.5],['summon','skill3',.5]]){
 const e={kind:'jiamangKing',visual:{actions:{[clip]:true}}};
 assert.deepEqual(Array.from(m.jiasenMove(e,move)),[clip,t]);
 assert.equal(m.jiasenMove({...e,kind:'jiamang'},move),null);
 assert.equal(m.jiasenMove({...e,visual:{}},move),null);
}
for(const [name,names,tot] of [['jiasen',['idle','run','attack','hit','stun','die'],6],['jiamang',['idle','run','attack','hit','stun','die','backstep','skill1','skill2','skill3'],10]]){
 const cfg=models[name], b=fs.readFileSync(path.join(root,cfg.url));
 assert.ok(b.length<2250000);
 const g=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)));
 assert.equal(g.skins[0].joints.length,17);
 assert.equal(g.animations.length,tot);
 for(const k of names)assert.ok(g.animations.some(a=>a.name===cfg.clips[k]),name+': '+k);
}
assert.match(main,/kind==='jiamangKing'\?\{height:def.height\}/);
assert.match(main,/if \(e\.def\.armored|const guarded = e\.def\.armored/);
assert.match(main,/if \(!e\.struck && e\.t >= def\.windup\)/);
assert.match(main,/if\(def\.pan\)e\.visual\.releasePan\?\.\(\);/);
assert.match(main,/s\.pan && hero\.form !== 'brave'\) \{ hero\.slowT = 2\.5/);
assert.match(main,/forward\(yaw\)\.multiplyScalar\(o\.speed \|\| 11\)/);
assert.match(v,/getObjectByName\('R_Hand'\)/);
// Verify that repeated pan throws own their materials and release them on despawn.
const THREE=require(path.join(root,'vendor/three/three.module.min.js'));
const {disposeOwned}=require(path.join(root,'js/dispose-owned.js'));
const scene=new THREE.Scene(), first=m.buildJiamangPan(THREE,.475), next=m.buildJiamangPan(THREE,.475);
const stats=[0,0]; const uniqueMat=new Set(first.children.map(o=>o.material));
assert.equal(first.children.length,4);assert.notEqual(first.children[0].material,next.children[0].material);
for(const mat of uniqueMat)mat.addEventListener('dispose',()=>stats[0]++);
for(const mesh of first.children)mesh.geometry.addEventListener('dispose',()=>stats[1]++);
scene.add(first);disposeOwned(first);assert.deepEqual(stats,[3,4]);assert.equal(scene.children.length,0);
disposeOwned(next);
console.log('PASS: separate costume rigs, warmup and boss timeline, throw visual and armored/pan rules');
