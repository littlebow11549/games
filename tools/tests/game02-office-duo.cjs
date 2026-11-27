const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'../../02_brave_guy'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
(async()=>{
 const {bossHealthRows}=await import(pathToFileURL(path.join(root,'js/boss-health.js')).href);
 const member=(kind,hp)=>({kind,hp,maxHp:2600,def:{boss:true,hp:2600}});
 for(const [first,second] of [['xinji','baguashe'],['baguashe','xinji']]){
  const a=member(first,0),b=member(second,1300);
  assert.deepEqual(bossHealthRows([a,b],false).map(x=>x.fill),[0,.5]);
  a.hp=2600;b.hp=0;
  assert.deepEqual(bossHealthRows([a,b],false).map(x=>x.fill),[1,0]);
 }
 assert.equal(bossHealthRows([member('lanMgr',1300)],false)[0].fill,.5);
 const cfg=JSON.parse(read('assets/manifest.json')).models;
 for(const [kind,clips] of [['xinji',['copyCast','chargeRush']],['baguashe',['gossipCast','spreadCast']]]){
  const b=fs.readFileSync(path.join(root,cfg[kind].url)),j=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)));
  assert.ok(b.length<2250000);
  for(const state of ['idle','run','spawn','hit','die',...clips])assert.ok(j.animations.find(c=>c.name===cfg[kind].clips[state]&&c.channels.length>=3),kind+' '+state);
 }
 const src=read('js/main.js');
 assert.match(src,/st\.boss==='duo'\) stageVisualKinds\.push\(\.\.\.BOSS_GROUPS\.duo\)/);
 assert.match(src,/bossActors: null/);assert.match(src,/game\.bossActors=kinds\.map/);
 console.log('PASS: independent duo health bars in both defeat orders, solo HUD, lazy spawn and GLB clips');
})().catch(err=>{console.error(err);process.exitCode=1});
