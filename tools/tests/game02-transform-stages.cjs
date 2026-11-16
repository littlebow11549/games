// Real browser transform checks; combat kills are simulated, not a full playthrough.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.GAME_URL||'http://127.0.0.1:8000/02_brave_guy/play.html';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await page.waitForFunction(()=>window.__game?.audio,{timeout:90000});await page.evaluate(()=>__game.prepareGameplay());
 const stages=await page.evaluate(()=>__game.STAGES.map(s=>s.id));
 async function enter(index,cleared){await page.evaluate(({index,cleared})=>{const g=__game;g.save.cleared=cleared;g.save.seenTransform=true;g.startStage(index);while(g.dialog)g.advanceDialog(true);g.hero.invuln=999;g.hero.courage=g.GAUGE.courageMax;g.game.waveTimer=999;}, {index,cleared});await page.waitForTimeout(100);}
 async function transform(){await page.locator('.act.transform').click();await page.waitForFunction(()=>__game.hero.form==='brave',{timeout:5000});}
 for(let i=0;i<stages.length;i++){
  const id=stages[i];await enter(i,stages.slice(0,i));
  if(id==='3-0'){assert(await page.locator('.act.transform').isHidden());assert(await page.locator('#transform-status').isVisible());assert.equal(await page.locator('#courage').evaluate(e=>e.classList.contains('full')),false);console.log(id,'story seal confirmed');continue;}
  if(id==='3-1'){
   assert(await page.locator('.act.transform').isHidden());
   await page.evaluate(()=>{__game.game.waveTimer=0;});
   for(let step=0;step<200;step++){await page.evaluate(()=>{for(const e of __game.enemies)e.state='dead';__game.step(30);});if(await page.evaluate(()=>__game.game.midDone))break;}
   assert(await page.evaluate(()=>__game.game.midDone));
   await page.evaluate(()=>{__game.hero.courage=20;});
   await page.evaluate(()=>{while(__game.dialog)__game.advanceDialog(true);__game.game.waveTimer=999;});
  }
  if(id==='3-1')assert.equal(await page.evaluate(()=>__game.hero.courage),100);
  await transform();console.log(id,'transform passed');
 }
 await page.evaluate(()=>{__game.game.final=true;__game.hero.form='worker';__game.hero.courage=100;});await page.waitForTimeout(100);assert(await page.locator('.act.transform').isHidden());assert.match(await page.locator('#transform-status').textContent(),/董事長/);console.log('final phase story seal confirmed');
 await enter(stages.indexOf('3-1'),stages.slice(0,stages.indexOf('3-1')+1));await transform();console.log('3-1 cleared replay passed');
 await enter(stages.indexOf('3-0'),stages);await transform();console.log('all-clear replay passed');
 assert.deepEqual(errors,[]);await browser.close();console.log('All stage transform checks passed');
})().catch(e=>{console.error(e);process.exit(1)});
