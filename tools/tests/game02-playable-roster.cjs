const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const p=await b.newPage({viewport:{width:390,height:844}});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://localhost:8000/02_brave_guy/play.html');await p.waitForFunction(()=>window.__game);await p.evaluate(async()=>{await __game.prepareGameplay();__game.startStage(0,'angel');while(__game.dialog)__game.advanceDialog(true);__game.game.paused=true;});assert.equal(await p.evaluate(()=>__game.hero.character),'brave','locked save rejects guest');
await p.evaluate(()=>{__game.save.rounds=4;window.pending=__game.startStage(1);});await p.locator('#roster-picker').waitFor();await p.locator('#roster-picker').screenshot({path:'/tmp/roster-mobile.png'});await p.locator('.roster-cancel').click();assert.equal(await p.evaluate(()=>__game.game.stage),0,'cancel preserves stage');
await p.evaluate(()=>{window.pending=__game.startStage(1)});await p.locator('[data-character="angel"].roster-card').click();await p.evaluate(async()=>{await window.pending;while(__game.dialog)__game.advanceDialog(true);__game.game.paused=true});assert.deepEqual(await p.evaluate(()=>[__game.hero.character,__game.hero.visual.kind,__game.support.name,__game.support.visual.kind]),['angel','angel_playable','主角','student_spirit']);
const setup=async(kind)=>p.evaluate(kind=>{const g=__game;g.startStage(0,kind);while(g.dialog)g.advanceDialog(true);g.game.paused=true;g.game.waveTimer=999;g.game.queue=[];g.game.ambushT=999;g.hero.pos.set(0,0,0);g.hero.yaw=0;g.hero.qi=100;g.hero.invuln=999;g.setLock(false);g.enemies.splice(0);window.victims=[];for(const [x,z] of [[0,6],[-3.4,6],[3.4,6],[0,20]]){const e=g.spawnEnemy('folaidi',g.hero.pos.clone());e.pos.set(x,0,z);e.state='chase';e.shown=true;e.visual.root.visible=true;e.hp=e.maxHp=100000;e.stun=999;e.cool=999;victims.push(e)}},kind);
const cast=async(name)=>p.evaluate(name=>{__game.startSkill(name,{x:0,y:0,len:0});__game.game.hitstop=0},name);
await setup('angel');await p.keyboard.press('j');await p.evaluate(()=>{__game.step(1,.02)});assert.equal(await p.evaluate(()=>__game.guestCombat.state.bolts),1);await p.evaluate(()=>__game.step(30,.02));assert(await p.evaluate(()=>victims[0].hp<100000),'text bolt hits');
await setup('angel');await cast('skill1');assert(await p.evaluate(()=>victims[0].vy>0&&victims[0].hp<100000),'line blow away');assert.equal(await p.evaluate(()=>victims[3].hp),100000,'line range bounded');
await setup('angel');await cast('skill2');assert(await p.evaluate(()=>victims[0].guestHold===3&&!(victims[3].guestHold>0)),'freeze radius');
await setup('angel');await cast('skill3');await p.evaluate(()=>__game.step(105,.02));assert.equal(await p.evaluate(()=>__game.guestCombat.state.casts.find(c=>c.kind==='bombs')?.exploded),10,'exactly ten blast points');await p.evaluate(()=>__game.step(20,.02));assert.equal(await p.evaluate(()=>__game.guestCombat.state.casts.length),0);
await setup('angel');await cast('ult');await p.evaluate(()=>__game.step(50,.02));assert(await p.evaluate(()=>victims[3].pos.length()<20),'global pull');assert.equal(await p.evaluate(()=>__game.hero.qi),0,'ult does not recharge itself');await p.evaluate(()=>__game.step(180,.02));assert.equal(await p.evaluate(()=>__game.guestCombat.ultActive),false);
await setup('nightmare');await cast('skill1');await p.evaluate(()=>__game.step(35,.02));assert(await p.evaluate(()=>victims.slice(0,3).every(e=>e.hp<100000)),'three dash paths');
await setup('nightmare');await cast('skill2');assert.deepEqual(await p.evaluate(()=>__game.guestCombat.state.casts.map(c=>[c.nodes,c.life])),[[3,5]]);const before=await p.evaluate(()=>__game.guestCombat.state.casts[0].life);await p.waitForTimeout(150);assert.equal(await p.evaluate(()=>__game.guestCombat.state.casts[0].life),before,'paused freezes skill');await p.evaluate(()=>__game.step(260,.02));assert.equal(await p.evaluate(()=>__game.guestCombat.state.casts.length),0,'five seconds ends');
await setup('nightmare');await cast('skill3');assert(await p.evaluate(()=>victims[0].guestHold===2.3&&victims[0].hp<100000));
await setup('nightmare');await cast('ult');assert.deepEqual(await p.evaluate(()=>__game.guestCombat.state.casts.map(c=>[c.nodes,c.life])),[[10,10]]);await p.evaluate(()=>__game.step(510,.02));assert.equal(await p.evaluate(()=>__game.guestCombat.state.casts.length),0,'ten seconds ends');
for(const kind of ['angel','nightmare']){await setup(kind);await p.evaluate(()=>{__game.hero.invuln=0;__game.game.rescues=2;__game.hurtHero(100000)});assert(await p.evaluate(()=>__game.game.rescues===1&&__game.hero.hp>0&&__game.hero.form==='brave'),'rescue once without reverting');assert((await p.locator('#angel-bubble').textContent()).includes(kind==='angel'?'主角':'勇氣超人'));}
await setup('nightmare');await cast('ult');await p.evaluate(()=>{__game.startStage(0,'brave');while(__game.dialog)__game.advanceDialog(true);__game.game.paused=true});assert.deepEqual(await p.evaluate(()=>[__game.guestCombat.state.bolts,__game.guestCombat.state.casts.length,__game.hero.visual.kind,__game.support.visual.kind]),[0,0,'brave','angel']);

for(const kind of ['angel','nightmare']){
 await setup(kind);
 const result=await p.evaluate(kind=>{
  const g=__game;g.enemies.splice(0);const boss=g.spawnEnemy('incubus',g.hero.pos.clone());boss.pos.set(0,0,3);boss.state='chase';boss.shown=true;boss.visual.root.visible=true;boss.hp=boss.maxHp=99999;boss.stun=0;boss.cool=999;
  g.startSkill('skill1',{x:0,y:0,len:0});g.step(25,.02);g.game.hitstop=0;g.hero.pos.set(0,0,0);g.hero.yaw=0;boss.pos.set(0,0,3);g.hero.state='free';
  g.startSkill('skill2',{x:0,y:0,len:0});g.step(60,.02);g.hero.state='free';g.hero.pos.set(0,0,0);boss.pos.set(0,0,3);
  const random=Math.random;Math.random=()=>0;try{g.startSkill('skill3',{x:0,y:0,len:0});g.step(100,.02)}finally{Math.random=random}
  const broken=Array.from(boss.broken).sort();
  g.guestCombat.clear();boss.shield=false;boss.castInvuln=true;boss.guestHold=0;const hp=boss.hp;g.hero.cds.skill3=0;g.hero.state='free';g.startSkill('skill3',{x:0,y:0,len:0});g.step(100,.02);const invulnerable=boss.hp===hp&&boss.guestHold===0;
  return {broken,invulnerable};
 },kind);
 assert.deepEqual(result.broken,['skill1','skill2','skill3'],kind+' breaks all three shield keys');assert(result.invulnerable,kind+' respects cast invulnerability');
 await setup(kind);await p.evaluate(()=>{__game.game.victoryShown=true;__game.runs.tick(5);__game.clearStage()});assert(await p.evaluate(()=>__game.game.phase==='over'&&!__game.runs.stageResult.ranked&&__game.save.cleared.includes(__game.STAGES[0].id)),'clear saves progress and excludes guest rank');
}

for(const kind of ['angel','nightmare']){
 await p.evaluate(kind=>{const g=__game;g.startStage(g.STAGES.length-1,kind);while(g.dialog)g.advanceDialog(true);g.game.paused=true;g.game.waveTimer=999;g.game.queue=[];g.game.ambushT=999;g.game.awakened=true;g.enemies.splice(0);const e=g.spawnEnemy('incubus',g.hero.pos.clone());e.pos.x+=10;e.state='chase';e.shown=true;e.visual.root.visible=true;e.shield=false;e.hp=e.maxHp*.1+1;e.stun=0;e.cool=999;g.game.hitstop=0;g.step(1,.02)},kind);
 const finalState=await p.evaluate(()=>({final:__game.game.final,visual:__game.hero.visual.kind,casts:__game.guestCombat.state.casts.length,phase:__game.game.phase,hold:__game.enemies[0]?.guestHold,hp:__game.enemies[0]?.hp}));assert(finalState.final&&finalState.visual===(kind==='angel'?'angel_playable':kind)&&finalState.casts===0,kind+' final '+JSON.stringify(finalState));
}
for(const [width,height] of [[320,568],[844,390],[1280,720]]){
 await p.setViewportSize({width,height});await p.evaluate(()=>{window.pending=__game.startStage(1)});await p.locator('#roster-picker').waitFor();
 assert(await p.locator('#roster-picker').evaluate(e=>e.scrollWidth<=e.clientWidth+1),'picker no horizontal overflow');await p.locator('.roster-cancel').click();
}
assert.deepEqual(errors,[]);console.log('PASS unlock/picker/cancel, both models/supports, text hits, 8 skills, pause, lifetime, rescue and stage cleanup');await b.close()})().catch(e=>{console.error(e);process.exit(1)});
