const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'../../02_brave_guy'),read=n=>fs.readFileSync(path.join(root,n),'utf8');
const main=read('js/main.js'),src=main.slice(main.indexOf('function updateAmbush('),main.indexOf('\n//',main.indexOf('function updateAmbush(')));
function cycle(map,form,dist,willStun=true,attack=false){
 const calls=[], pos={set(){}}, visual={actions:{hit:true,attack:true},root:{position:pos,rotation:{}},play:(...a)=>calls.push(['play',...a]),update(){},dispose:()=>calls.push(['dispose'])};
 const ctx={game:{stage:0,caught:0,ambushT:0,rules:{junxiong:true}},hero:{pos:{x:0,z:0},state:'idle',form,maxHp:800,hp:600,courage:20,guilt:3},
 STAGES:[{map,rules:{junxiong:true}}],ambush:null,THREE:{Vector3:class{}},enemies:[1],alive:()=>true,D:()=>({bearMax:1,bearGap:[9,10]}),
 rand:a=>a,clampArena(){},createVisual:(...a)=>(calls.push(['visual',...a]),visual),scene:{add(){},remove:()=>calls.push(['remove'])},
 fx:{ring(){}}, popup(){},audio:{sfx:x=>calls.push(x)},dist2d:()=>dist,addRescues:()=>1,tf:()=>'',say(){},addCourage:x=>ctx.hero.courage+=x,
 stunHero:t=>(calls.push(['stun',t]),willStun)};
 vm.createContext(ctx);vm.runInContext(main.match(/const junxiongModel = [^;]+;/)[0]+'\n'+src+'\nthis.tick=updateAmbush',ctx);
 ctx.tick(.1);
 assert.equal(calls[0][1],'junxiong');
 assert.equal(calls[0][3]?.modelKind,map===3?'junxiong_office':'junxiong');
 ctx.tick(.59); assert.equal(ctx.ambush.done,false);
 if(attack)ctx.hero.state='attack';
 ctx.tick(attack?.05:.62);
 assert.equal(ctx.ambush.done,true);
 const rescued=attack||(form==='brave'&&dist<4.5);
 assert.equal(ctx.game.caught,+rescued);
 assert.equal(ctx.hero.hp,rescued?680:600);
 assert.ok(calls.some(x=>Array.isArray(x)&&x[0]==='play'&&x[1]===(rescued?'hit':'attack')&&x[2]===.9));
 assert.equal(calls.filter(x=>x==='junxiong_pop').length,rescued?0:1);
 assert.equal(calls.some(x=>Array.isArray(x)&&x[0]==='stun'),!rescued&&dist<4.5);
 const fear=!rescued&&dist<4.5&&willStun;
 assert.equal(ctx.hero.courage,20+(rescued?15:fear?-10:0));
 assert.equal(ctx.hero.guilt,fear?9:3);
 ctx.tick(.91); assert.equal(ctx.ambush,null);assert.ok(calls.some(x=>x[0]==='dispose'));assert.equal(ctx.game.ambushT,9);
}
cycle(1,'student',3.8);cycle(2,'student',5);cycle(3,'brave',4.3);cycle(3,'worker',3.8,false);cycle(3,'worker',2.8,true,true);
const models=JSON.parse(read('assets/manifest.json')).models;
for(const kind of ['junxiong','junxiong_office']){
 const cfg=models[kind],b=fs.readFileSync(path.join(root,cfg.url)),g=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)));
 assert.equal(g.skins[0].joints.length,17);assert.ok(b.length<2000000);
 for(const pose of ['idle','attack','hit'])assert.ok(g.animations.some(a=>a.name===cfg.clips[pose]&&a.channels.length>=4));
}
assert.match(main,/if\s*\(st\.rules\?\.junxiong\)\s*stageVisualKinds\.push\(junxiongModel\(st\)\)/);
console.log('PASS: school/office costumes, warning timing, catch/heal, active/invulnerable/distant scare, cleanup at cap, bound motion assets');
