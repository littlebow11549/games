const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
 const page=await browser.newPage({viewport:{width:390,height:694}});page.setDefaultTimeout(120000);const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
 await page.goto(process.env.GAME_URL||'http://127.0.0.1:8000/02_brave_guy/play.html');await page.waitForFunction(()=>window.__booted);await page.locator('.opening-skip').click();await page.waitForTimeout(500);
 const boot=await page.evaluate(()=>{const rows=performance.getEntriesByType('resource');return{bytes:rows.reduce((n,r)=>n+r.encodedBodySize,0),images:rows.filter(r=>/\.(png|webp)(\?|$)/.test(r.name)).map(r=>r.name)}});
 assert(boot.bytes<30166992*.7);assert(!boot.images.some(u=>u.includes('/source/pic/')));assert(!boot.images.some(u=>u.includes('menu_keyart_01.')));assert(boot.images.some(u=>u.includes('menu_keyart_portrait_01.webp')));
 await page.evaluate(()=>__game.prepareGameplay());await page.evaluate(()=>{__game.startStage(0);__game.advanceDialog(true)});assert.equal(await page.evaluate(()=>__game.game.phase),'playing');assert.deepEqual(errors,[]);
 const report={bootBytes:boot.bytes,baselineBytes:30166992,reduction:1-boot.bytes/30166992,nativePNGRequests:0,unusedLandscapeRequested:false,gameplayReady:true,errors};fs.writeFileSync('/workspace/scratch/delivery-check.json',JSON.stringify(report,null,2));console.log(report);
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
