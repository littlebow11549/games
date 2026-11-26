
const assert=require('node:assert/strict');
const fs=require('node:fs'), path=require('node:path'), vm=require('node:vm');
const root=path.resolve(__dirname,'../../02_brave_guy');
const js=fs.readFileSync(path.join(root,'js/main.js'),'utf8');
const gfx=fs.readFileSync(path.join(root,'js/visuals.js'),'utf8');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/manifest.json'),'utf8'));
const calls=[];
const ganqiaoMove=vm.runInNewContext(fs.readFileSync(path.join(root,'js/ganqiao-motion.js'),'utf8').replaceAll('export ','')+'\nganqiaoMove');
class V { constructor(x=0,y=0,z=0){Object.assign(this,{x,y,z});} clone(){return new V(this.x,this.y,this.z);} }
const folaidiMove=vm.runInNewContext(fs.readFileSync(path.join(root,'js/folaidi-motion.js'),'utf8').replaceAll('export ','')+'\nfolaidiMove');
const env={folaidiMove,ganqiaoMove,nightmareBossSkills:{moves:{}},THREE:{Vector3:V},boomAt(){},hero:{invuln:0,movingT:.4,pos:new V()},HERO:{radius:.7},
 fx:{telegraph:(...a)=>calls.push(['telegraph',...a.slice(1)]),ring(){},slash:()=>calls.push(['slash'])},
 sfx(){},audio:{sfx:k=>calls.push(['sfx',k])}, hurtHero:n=>calls.push(['hurt',n]), knockHero:(p,n)=>calls.push(['knock',n]),dist2d:()=>0,
 stunHero:(t)=>{calls.push(['stun',t]);return true}, enemies:[], alive:()=>false, bossLine(){}, banner(){}, rand:()=>0,
 spawnEnemy:()=>calls.push(['minion']), hostileShot:()=>calls.push(['shot'])};
const a=js.indexOf('const MOVES = {'), b=js.indexOf('  mDash: {',a);
const moves=vm.runInNewContext(js.slice(a,b)+'}; MOVES',env);
function actor(vis,loaded=true) {
 return {def:{vis,radius:1,dmg:200,minionN:3},visual:{...(loaded?{actions:{skill1:{},skill2:{},skill3:{}}}:{}),play:(...z)=>calls.push(['pose',...z])},pos:new V(),cast:{t:0}};
}
function start(key,vis,skill,loaded=true) {
 calls.length=0; const a=actor(vis,loaded); moves[key].start(a,3,4,5);
 assert.equal(calls.find(o=>o[0]==='pose')?.[1],skill,key+' / '+vis);return a;
}
const q=start('fan','qian_school','skill1');assert.equal(calls.find(o=>o[0]==='telegraph')[2],.6);
q.cast.t=.599;assert.equal(moves.fan.update(q,0,3),false);
q.cast.t=.6;assert.equal(moves.fan.update(q,0,3),true);
assert.deepEqual(calls.filter(o=>['sfx','hurt','knock'].includes(o[0])),[['sfx','fan'],['hurt',70],['knock',22]]);
start('fan','qian','attack');start('fan','qian_school','attack',false);start('charge','qian_school','skill2');start('charge','qian','attack');
start('summon','qian_school','skill3'); assert.equal(calls.filter(o=>o[0]==='minion').length,3);
const l=start('whistle','lan_school','skill1');assert.equal(calls.find(o=>o[0]==='telegraph')[2],1);
l.cast.t=.999;assert.equal(moves.whistle.update(l,0,5),false);
l.cast.t=1;assert.equal(moves.whistle.update(l,0,5),true);
assert.deepEqual(calls.filter(o=>['sfx','hurt','stun'].includes(o[0])),[['sfx','whistle'],['stun',1.3],['hurt',90]]);
start('whistle','lanMgr',undefined);start('whistle','lan_school',undefined,false);
start('spread','lan_school','skill2');start('slam','lan_school','skill3');
for(const [kind,n,clips] of [['qian_school',19,['Fan','Charge','Summon']],['lan_school',17,['Whistle','Spread','Slam']]]){
 const c=manifest.models[kind],f=fs.readFileSync(path.join(root,c.url));assert.ok(f.length<3000000);
 const g=JSON.parse(f.subarray(20,20+f.readUInt32LE(12)));assert.equal(g.skins[0].joints.length,n);
 const names=g.animations.map(x=>x.name);assert.ok(clips.every(name=>names.includes(name)));
 assert.ok(g.nodes.some(n=>n.name==='R_Hand'));assert.ok(Object.values(c.clips).every(name=>names.includes(name)));
}
assert.match(js,/qianBiz: \{[^\n]*vis: 'qian'/);
assert.match(js,/STAGES\[index\]\.boss==='qian'\?'qian_school':STAGES\[index\]\.boss==='lan'\?'lan_school'/);
assert.match(gfx,/hand\.add\(prop\)/);
console.log('PASS: school-only skill routing, actual fan/whistle timing and effects, original fallback and workplace routing, model clips and props');
