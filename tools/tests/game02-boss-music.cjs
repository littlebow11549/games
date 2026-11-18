const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:8000/02_brave_guy/play.html');await page.waitForFunction(()=>window.__game);
 await page.evaluate(()=>__game.prepareGameplay());
 const rows=await page.evaluate(()=>{
  const g=__game,rows=[];let heard=null,finish=null;
  g.audio.playBgm=name=>{heard=name};
  // Isolate scene routing from asynchronous artwork loading; execute the actual combat callback.
  g.cinematics.boss=(_k,done)=>{finish=done};
  for(const rounds of [0,4]){
   g.save.rounds=rounds;
   for(let i=0;i<g.STAGES.length;i++){
    const st=g.STAGES[i];if(!st.boss)continue;
    g.startStage(i);const intro={phase:g.game.phase,heard,wanted:g.game.bgm};
    while(g.dialog)g.advanceDialog(true);
    const form=g.hero.form;g.spawnBoss();
    const cutscene={heard,wanted:g.game.bgm,phase:g.game.phase};
    finish();rows.push({id:st.id,boss:st.boss,rounds,form,intro,cutscene,combat:heard});
   }
  }
  return rows;
 });
 for(const r of rows){
  if(r.intro.phase==='dialog')assert.equal(r.intro.heard,r.intro.wanted,`intro ${r.id}`);
  assert.equal(r.cutscene.phase,'cinematic');assert.equal(r.cutscene.heard,r.cutscene.wanted,`cutscene ${r.id}`);
  assert.notEqual(r.cutscene.heard,'bgm_brave');
  assert.equal(r.combat,r.form==='brave'?'bgm_brave':r.boss==='guan'?'bgm_boss_guan':r.cutscene.wanted,`combat ${r.id}`);
  if(r.boss==='guan')assert.equal(r.cutscene.heard,'bgm_stage_3_5');
 }
 assert.deepEqual(errors,[]);console.log(`PASS ${rows.length} boss entries: original cutscene tracks, base/brave combat, Guan original track, stage intro music; no page errors`);
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
