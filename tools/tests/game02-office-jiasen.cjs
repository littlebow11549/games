// Exercise the new stage through the real boss-preview and victory buttons.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const page=await browser.newPage({viewport:{width:390,height:694}});page.setDefaultTimeout(120000);const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
 await page.goto(process.env.GAME_INDEX||'http://127.0.0.1:8000/02_brave_guy/?v=20261120assets');const f=await(await page.locator('#game-frame').elementHandle()).contentFrame();await f.waitForFunction(()=>window.__booted);await f.locator('.opening-skip').click();await f.evaluate(()=>__game.prepareGameplay());
 for(const lang of ['zh-Hant','en','ja']){
 await page.setViewportSize(lang==='en'?{width:320,height:568}:{width:390,height:694});
  await f.evaluate(async lang=>{(await import('./js/i18n.js?v=20261120assets')).setLang(lang);__game.startStage(__game.STAGES.findIndex(s=>s.id==='3-7'));__game.advanceDialog(true)},lang);
  await f.locator('#btn-quick-clear').click();await f.evaluate(()=>__game.advanceDialog(true));await f.waitForFunction(()=>__game.cinematics.state?.mode==='boss');
  for(const [i,time] of [.2,4.2,8.2].entries()){await f.evaluate(t=>__game.cinematics.update(Math.max(0,t-__game.cinematics.state.elapsed)),time);assert.equal(await f.getAttribute('#cinema','data-storyboard'),'jiamangKing');assert.equal(await f.getAttribute('#cinema','data-beat'),String(i));assert((await f.locator('.cinema-caption p').textContent()).length>0);assert.equal(await f.getAttribute('#cinema','data-art-ready'),'true');if(process.env.SHOTS&&lang==='zh-Hant'){await page.waitForTimeout(450);await page.screenshot({path:process.env.SHOTS+'/jiamang-intro-'+i+'.png'})}}
  await f.locator('.cinema-skip').click();await page.waitForTimeout(1300);await f.locator('#btn-quick-clear').click();await f.waitForFunction(()=>__game.cinematics.state?.mode==='victory');
  for(const [i,time] of [.2,2.2,4.2].entries()){await f.evaluate(t=>__game.cinematics.update(Math.max(0,t-__game.cinematics.state.elapsed)),time);assert.equal(await f.getAttribute('#cinema','data-victory-bosses'),'jiamangKing');assert.equal(await f.getAttribute('#cinema','data-victory-shot'),['charge','impact','finish'][i]);if(process.env.SHOTS&&lang==='zh-Hant'){await page.waitForTimeout(450);await page.screenshot({path:process.env.SHOTS+'/jiamang-victory-'+i+'.png'})}}
  await f.locator('.cinema-skip').click();await f.locator('#overlay.result').waitFor();assert((await f.locator('#ov-text').textContent()).includes('3-7'));assert(await f.locator('#ov-next').isVisible());
 }
 assert.deepEqual(errors,[]);console.log({stage:'3-7',locales:3,introShots:9,victoryShots:9,result:true,errors});
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
