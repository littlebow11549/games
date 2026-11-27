const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const dir=path.resolve(__dirname,'../../02_brave_guy'),read=f=>fs.readFileSync(path.join(dir,f),'utf8');
const src=read('js/main.js'),visuals=read('js/visuals.js'),models=JSON.parse(read('assets/manifest.json')).models;
const tri={};
for (const kind of ['kaban','kabanKing']){
 const c=models[kind];const b=fs.readFileSync(path.join(dir,c.url));const j=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)));
 const p=j.meshes[0].primitives[0];tri[kind]=j.accessors[p.indices].count/3;
 assert.equal(j.skins[0].joints.length,17);
 if(kind==='kaban'){assert.ok(b.length<500000);assert.ok(tri[kind]<=5500);assert.equal(p.targets,undefined);}
 else {assert.ok(b.length<2000000);assert.ok(p.targets?.length>0);}
 for(const state of ['idle','run','hit','die','attack',...(kind==='kabanKing'?['spawn','kabanSlam','chargeRush','kabanSummon']:[])]){
  const a=j.animations.find(a=>a.name===c.clips[state]);assert.ok(a?.channels.length>=(state==='hit'?2:3),state);
  const d=j.accessors[a.samplers[0].input].max[0];
  if(state==='attack')assert.ok(Math.abs(d-.8)<1e-6);
 }
}
assert.ok(tri.kaban/tri.kabanKing<.2);
assert.match(src,/st.waves.some\(wave=>wave.kaban\)/);
assert.match(src,/if\(st.boss==='kabanKing'\)stageVisualKinds.push\('kabanKing'\)/);
assert.match(visuals,/model.getObjectByName\('L_Hand'\)/);
assert.match(visuals,/Overtime king clock/);
console.log('PASS: staged guard and king models, '+tri.kaban+'/'+tri.kabanKing+' triangles, aligned hits and king clock');
