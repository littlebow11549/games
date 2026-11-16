const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.setDefaultTimeout(120000);page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
  await page.goto(process.env.GAME_INDEX||'http://127.0.0.1:8000/02_brave_guy/?v=20261116sharp');
  const iframe=await page.locator('#game-frame').elementHandle(),frame=await iframe.contentFrame();await frame.waitForFunction(()=>window.__booted);
  assert(frame.url().includes('v=20261116sharp'));const bounds=await page.locator('#viewport').boundingBox();assert(Math.abs(bounds.width/bounds.height-9/16)<.001);
  await frame.locator('.opening-skip').click();await frame.evaluate(()=>__game.prepareGameplay());await frame.evaluate(()=>{__game.startStage(__game.STAGES.findIndex(s=>s.id==='4-1'));__game.advanceDialog(true)});
  await frame.locator('#btn-quick-clear').click();await frame.evaluate(()=>__game.advanceDialog(true));await frame.waitForFunction(()=>__game.cinematics.state?.mode==='boss');await frame.locator('.cinema-skip').click();
  // Hold the freshly spawned boss in its hidden spawn state to cover immediate clicks.
  await frame.evaluate(()=>{const e=__game.enemies.find(e=>e.def.incubus);e.state='spawn';e.t=-1;e.shown=false;e.visual.root.visible=false});
  await frame.locator('#btn-quick-clear').click();await frame.waitForFunction(()=>__game.cinematics.state?.mode==='awakening');await frame.evaluate(()=>__game.cinematics.update(10.5));await page.waitForTimeout(500);
  const out='/workspace/games/02_brave_guy/assets/preview/picture-films';fs.mkdirSync(out,{recursive:true});await page.screenshot({path:out+'/release-awakening.png'});await frame.locator('.cinema-skip').click();
  assert(await frame.evaluate(()=>{const e=__game.enemies.find(e=>e.def.incubus);return e.shown&&e.visual.root.visible&&e.visual.root.scale.x>0&&e.state==='chase'}));
  await frame.locator('#btn-quick-clear').click();await frame.waitForFunction(()=>__game.cinematics.state?.mode==='victory');await frame.evaluate(()=>__game.cinematics.update(2.3));await page.waitForTimeout(500);await page.screenshot({path:out+'/release-final-victory.png'});await frame.locator('.cinema-skip').click();
  await frame.locator('#ov-next').click();await frame.waitForFunction(()=>__game.cinematics.state?.mode==='ending');await frame.evaluate(()=>__game.cinematics.update(5));await page.waitForTimeout(500);await page.screenshot({path:out+'/release-ending.png'});await frame.locator('.cinema-skip').click();assert.equal(await frame.getAttribute('#cinema','data-act'),'credits');await frame.locator('.cinema-skip').click();assert.equal(await frame.getAttribute('#overlay','data-outcome'),'ending');
  assert.deepEqual(errors,[]);console.log({url:page.url(),portrait:true,bossShortcut:true,armoredAwakening:true,armoredVictory:true,ending:true,staff:true,errors});
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
