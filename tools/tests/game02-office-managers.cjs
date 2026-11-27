const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const dir=path.resolve(__dirname,'../../02_brave_guy'),rd=p=>fs.readFileSync(path.join(dir,p),'utf8');
const THREE=require(path.join(dir,'vendor/three/three.module.min.js'));
const {createActorShadows}=require(path.join(dir,'js/actor-shadows.js'));
const actor=(i,boss=false)=>{const root=new THREE.Group();root.position.set(i,0,0);return {visual:{root},shown:true,def:{radius:.6,boss}};};
const scene=new THREE.Scene(),shadows=createActorShadows(THREE,scene);
for(const count of [36,144,180,400,610,36]){
 const ordinary=Array.from({length:count},(_,i)=>actor(i+10));
 shadows.update(actor(0),actor(1),[actor(2,true),...ordinary],actor(3),false);
 assert.equal(scene.children.length,1,'one instanced mesh');
 assert.equal(scene.children[0].count,Math.min(512,count+4),'all shadows within budget including reserved actors');
 const m=new THREE.Matrix4();
 for(let i=0;i<4;i++){scene.children[0].getMatrixAt(i,m);assert.equal(m.elements[12],i);}
}
const cfg=JSON.parse(rd('assets/manifest.json')).models;
for(const [kind,number,shots] of [['qian_manager',18,['officeFan','chargeRush','officeSummon']],['lan_manager',17,['officeMeeting','officeHeal','officeWhistle','spreadCast']]]){
 const c=cfg[kind],b=fs.readFileSync(path.join(dir,c.url)),j=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)));
 assert.equal(j.skins[0].joints.length,number);
 assert.ok(b.length<2400000);
 for(const state of ['idle','run','spawn','die',...shots])assert.ok(j.animations.find(a=>a.name===c.clips[state]&&a.channels.length>=4),kind+' '+state);
}
const src=rd('js/main.js');
assert.match(src,/stageVisualKinds\.push\(officeBossModel\)/);
assert.match(src,/modelKind:officeModel,height:def.height/);
console.log('PASS: office-only models, named battle clips, crowd shadow pressure and one draw batch');
