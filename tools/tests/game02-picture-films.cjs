const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:694}}),errors=[];
  page.setDefaultTimeout(120000);page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.filmDraws=0;for(const C of [WebGLRenderingContext,WebGL2RenderingContext])for(const key of ['drawArrays','drawElements','drawArraysInstanced','drawElementsInstanced']){const fn=C.prototype[key];if(fn)C.prototype[key]=function(...args){if(this.canvas.id==='scene')window.filmDraws++;return fn.apply(this,args)}}});
  await page.goto(process.env.GAME_URL||'http://127.0.0.1:8000/02_brave_guy/play.html');await page.locator('.opening-skip').click();
  const out='/workspace/games/02_brave_guy/assets/preview/picture-films';fs.mkdirSync(out,{recursive:true});
  const start=async mode=>{await page.evaluate(mode=>{__game.cinematics.cancel();__game.game.phase='cinematic';__game.cinematics[mode](()=>__game.game.phase='ready')},mode);await page.waitForFunction(mode=>__game.cinematics.state?.mode===mode,mode);await page.evaluate(()=>window.filmDraws=0)};
  const seek=async time=>{await page.evaluate(time=>__game.cinematics.update(Math.max(0,time-__game.cinematics.state.elapsed)),time)};
  const shot=async name=>{await page.waitForTimeout(300);await page.screenshot({path:out+'/'+name+'.png'})};
  for(const locale of ['zh-Hant','en','ja']){
   await page.evaluate(async locale=>(await import('./js/i18n.js?v=20261115fast')).setLang(locale),locale);
   await start('awakening');
   for(const [i,time] of [0.2,2.6,3.7,4.9,6.4,9.3,10.6].entries()){
    await seek(time);assert.equal(await page.getAttribute('#cinema','data-awakening-shot'),String(i));assert((await page.locator('.cinema-caption p').textContent()).length>0);
    if(locale==='zh-Hant')await shot('awakening-'+i);
   }
   assert.equal(await page.evaluate(()=>filmDraws),0);await seek(14);assert.equal(await page.evaluate(()=>__game.game.phase),'ready');
   await start('defeat');for(const [i,time] of [.2,2.2,4.2,7.2].entries()){await seek(time);assert.equal(await page.getAttribute('#cinema','data-defeat-shot'),String(i));if(locale==='zh-Hant')await shot('defeat-'+i)}
   assert.equal(await page.evaluate(()=>filmDraws),0);await seek(10.2);assert.equal(await page.evaluate(()=>__game.game.phase),'ready');
  }
  await start('ending');await seek(4.8);await shot('ending');assert.equal(await page.evaluate(()=>filmDraws),0);
  await seek(33.8);assert.equal(await page.getAttribute('#cinema','data-act'),'credits');assert.equal(await page.locator('#cinema').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(0, 0, 0)');assert.deepEqual(await page.locator('.cinema-credits strong').allTextContents(),Array(6).fill('LilinS'));assert.equal(await page.locator('.picture-film').isVisible(),false);await shot('staff');await seek(36.6);assert.equal(await page.evaluate(()=>__game.game.phase),'ready');
  await page.emulateMedia({reducedMotion:'reduce'});await start('awakening');await seek(10.2);assert.equal(await page.locator('.picture-film').evaluate(e=>getComputedStyle(e).animationName),'none');await page.keyboard.press('Escape');await start('ending');await seek(32);assert.equal(await page.locator('.cinema-credits').evaluate(e=>getComputedStyle(e).transform),'none');await page.keyboard.press('Escape');
  await page.emulateMedia({reducedMotion:'no-preference'});await page.evaluate(()=>__game.prepareGameplay());
  let widthChecks=0;
  for(const width of [320,390,430]){await page.setViewportSize({width,height:Math.round(width*16/9)});for(const locale of ['zh-Hant','en','ja']){
   await page.evaluate(async locale=>{(await import('./js/i18n.js?v=20261115fast')).setLang(locale);__game.showMenu()},locale);
   const equal=async selector=>{const widths=await page.locator(selector+' span[data-lang]').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().width));assert.equal(widths.length,3);assert(Math.min(...widths)>40);assert(Math.max(...widths)-Math.min(...widths)<1,JSON.stringify(widths));widthChecks++};
   await equal('#overlay .lang-btn');
   await page.evaluate(()=>{__game.startStage(0);__game.advanceDialog(true)});await page.locator('#btn-pause').click();await equal('#pause-menu .lang-btn');if(width===390&&locale==='zh-Hant')await shot('language-pause');await page.locator('#pm-resume').click();
   await page.evaluate(()=>__game.endGame(false));await page.waitForFunction(()=>__game.cinematics.state?.mode==='defeat');await page.keyboard.press('Escape');await equal('#overlay .lang-btn');
  }}
  assert.deepEqual(errors,[]);const result={awakeningShots:21,defeatShots:12,staffSeconds:5,staffNames:'LilinS',zero3DDraws:true,equalLanguageLayouts:widthChecks,reducedMotion:true,errors};fs.writeFileSync(out+'/verification.json',JSON.stringify(result,null,2)+'\n');console.log(result);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
