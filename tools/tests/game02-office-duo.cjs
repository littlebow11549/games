const assert=require('node:assert/strict'), fs=require('node:fs'), path=require('node:path'), vm=require('node:vm');
const root=path.resolve(__dirname,'../../02_brave_guy'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const src=read('js/main.js');
const hud=src.slice(src.indexOf('  let bossHp = 0'),src.indexOf("  const b = $('angel-bubble');",src.indexOf('  let bossHp = 0')));
assert(hud.includes('boss-fill'));
function bar(enemies,game){
  const fill={style:{}};
  vm.runInNewContext(hud,{enemies,game,updateControlBadge(){},$:id=>id==='boss-fill'?fill:{hidden:true}});
  return fill.style.transform;
}
const member=(kind,hp)=>({kind,hp,maxHp:2600,def:{boss:true,hp:2600}});
for(const [first,second] of [['xinji','baguashe'],['baguashe','xinji']]){
  const dead=member(first,0), survivor=member(second,1300), g={bossEncounterMaxHp:5200};
  assert.equal(bar([dead,survivor],g),'scaleX(0.25)');
  assert.equal(bar([survivor],g),'scaleX(0.25)');
  assert.equal(bar([],g),'scaleX(0)');
}
assert.equal(bar([member('lanMgr',1300)],{bossEncounterMaxHp:0}),'scaleX(0.5)');
const cfg=JSON.parse(read('assets/manifest.json')).models;
for(const [kind,clips] of [['xinji',['copyCast','chargeRush']],['baguashe',['gossipCast','spreadCast']]]){
 const b=fs.readFileSync(path.join(root,cfg[kind].url)), j=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)));
 assert.ok(b.length<2250000);
 for(const state of ['idle','run','spawn','hit','die',...clips]){
   assert.ok(j.animations.find(c=>c.name===cfg[kind].clips[state]&&c.channels.length>=3),kind+' '+state);
 }
}
assert.match(src,/st\.boss==='duo'\) stageVisualKinds\.push\(\.\.\.BOSS_GROUPS\.duo\)/);
assert.match(src,/bossEncounterMaxHp: 0/);
assert.match(src,/game\.bossEncounterMaxHp=kinds\.reduce[\s\S]{0,220}return hp \+ spawnEnemy\(k,new THREE\.Vector3\(anchor\.x\+offset,0,anchor\.z\)\)\.maxHp/);
console.log('PASS: both defeat orders, empty and single Boss HUD, lazy registration, complete GLB state mapping');
