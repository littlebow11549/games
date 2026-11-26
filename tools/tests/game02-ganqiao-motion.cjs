const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../../02_brave_guy');
const main=fs.readFileSync(path.join(root,'js/main.js'),'utf8');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/manifest.json'),'utf8')).models;
const visualSource=fs.readFileSync(path.join(root,'js/ganqiao-motion.js'),'utf8');
const config=vm.runInNewContext(visualSource.replaceAll('export ','')+'\n({ganqiaoStageModels,ganqiaoMove,ganqiaoAttackDuration})');
const common=['idle','run','attack','hit','stun','die'];
for(const [kind,extra] of [['ganqiao',[]],['ganqiao_mid',['skill1','skill2','skill3']],['ganqiaoFull',['skill1','skill2','skill3']]]){
 const item=manifest[kind]; assert.ok(item,kind);
 const file=fs.readFileSync(path.join(root,item.url));
 assert.ok(file.length<3_000_000);assert.equal(file.toString('ascii',0,4),'glTF');
 const g=JSON.parse(file.subarray(20,20+file.readUInt32LE(12)));
 assert.equal(g.skins[0].joints.length,15);
 for(const state of [...common,...extra]){
  const anim=g.animations.find(a=>a.name===item.clips[state]);
  assert.ok(anim?.channels.length>=2,kind+' '+state);
 }
 assert.ok(g.nodes.some(n=>n.name==='Jaw'));
}
const stages=[
 [{map:1,waves:[{ganqiao:5}]},[],null,['ganqiao']],
 [{map:2,waves:[{ganqiao_mid:8}]},[{vis:'midKing',minion:'ganqiao_mid'}],'ganqiao_mid',['ganqiao_mid']],
 [{map:3,waves:[{jiamang:8,kaban:8}]},[{vis:'ganqiaoFull'}],'kaban',['ganqiaoFull']],
 [{map:3,waves:[{jiamang:8}]},[{vis:'lanMgr'}],'kaban',[]]
];
for(const [st,bs,fodder,expected] of stages)assert.deepEqual(Array.from(config.ganqiaoStageModels(st,bs,fodder)),expected);
assert.equal(config.ganqiaoAttackDuration('ganqiao',.5),.75);
assert.equal(config.ganqiaoAttackDuration('ganqiao_mid',.5),.75);
assert.equal(config.ganqiaoAttackDuration('kaban',.6),1);
const visual={actions:{skill1:{},skill2:{},skill3:{}}};
assert.equal(config.ganqiaoMove({def:{vis:'ganqiaoFull'},visual},'breath')?.[0],'skill1');
assert.equal(config.ganqiaoMove({def:{vis:'ganqiaoFull'},visual},'charge')?.[1],1.5);
assert.equal(config.ganqiaoMove({def:{vis:'midKing'},visual},'summon')?.[0],'skill1');
assert.equal(config.ganqiaoMove({def:{vis:'ganqiaoFull'},visual:{}},'breath'),null);
assert.match(main,/ganqiaoStageModels\(st,/);
assert.match(main,/ganqiaoMove\(e,'breath'\)/);
assert.match(main,/t >= 0\.5 \+ e\.cast\.n \* 0\.1/);
assert.match(main,/e\.cast\.n < 12/);
assert.match(main,/t > 0\.7 && t < 1\.5/);

const calls=[];
const folaidiMove=vm.runInNewContext(fs.readFileSync(path.join(root,'js/folaidi-motion.js'),'utf8').replaceAll('export ','')+'\nfolaidiMove');
const env={folaidiMove,ganqiaoMove:config.ganqiaoMove,nightmareBossSkills:{moves:{}},hero:{pos:{}},HERO:{radius:.7},
 fx:{telegraph:(...z)=>calls.push(['warning',z[2]]),ring(){}},bossLine(){},hostileShot:(...z)=>calls.push(['shot',z[1],z[2]]),
 hurtHero:d=>calls.push(['hurt',d]),boomAt(){},dist2d:()=>0};
const a=main.indexOf('const MOVES = {'),b=main.indexOf('  dive: {',a);
const moves=vm.runInNewContext(main.slice(a,b)+'}; MOVES',env);
function actor(vis){
 return {def:{vis,dmg:250},pos:{clone(){return {...this}}},yaw:.1,visual:{actions:{skill1:{},skill2:{},skill3:{}},play:(...z)=>calls.push(['pose',...z])},cast:{t:0}};
}
const dragon=actor('ganqiaoFull');
moves.breath.start(dragon);
assert.deepEqual(calls[0],['pose','skill1',1.9]);
dragon.cast.t=.499;assert.equal(moves.breath.update(dragon),false);assert.equal(calls.length,1);
dragon.cast.t=.5;assert.equal(moves.breath.update(dragon),false);assert.equal(calls.length,2);
assert.equal(calls[1][1],-.5);assert.equal(calls[1][2].dmg,70);assert.equal(calls[1][2].silence,2);
dragon.cast.t=1.6;assert.equal(moves.breath.update(dragon),false);
assert.equal(calls.filter(x=>x[0]==='shot').length,12);
dragon.cast.t=1.9;assert.equal(moves.breath.update(dragon),true);
const middle=actor('midKing');calls.length=0;
moves.slam.start(middle);assert.deepEqual(calls,[['pose','skill3',.95],['warning',.95]]);
middle.cast.t=.949;assert.equal(moves.slam.update(middle),false);
middle.cast.t=.95;assert.equal(moves.slam.update(middle),true);assert.deepEqual(calls.at(-1),['hurt',250]);
console.log('PASS: three rigged forms, shared mid-boss model, stage-only loading, fallback and preserved attack timing');
