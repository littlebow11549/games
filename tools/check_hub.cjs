// Run with Playwright installed: HUB_URL=http://localhost:8000/ node tools/check_hub.cjs
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 try{
 const context=await browser.newContext({locale:'zh-TW'});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const url=process.env.HUB_URL||'http://127.0.0.1:8000/';await page.goto(url);
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:960});
  for(const language of ['zh-Hant','zh-Hans','en','ja','ko','th']){
   await page.selectOption('#language',language);
   const layout=await page.evaluate(()=>({language:document.documentElement.lang,overflow:document.documentElement.scrollWidth>innerWidth,columns:getComputedStyle(document.querySelector('.grid')).gridTemplateColumns.split(' ').length,heading:document.querySelector('h1').getBoundingClientRect().bottom,footer:document.querySelector('.banner-footer').getBoundingClientRect().top,images:[...document.images].every(i=>i.complete&&i.naturalWidth)}));
   assert.equal(layout.language,language);assert.equal(layout.overflow,false,`${width}/${language}: overflow`);assert.ok(layout.heading<layout.footer,`${width}/${language}: banner overlap`);
   assert.equal(layout.columns,width>760?4:2);assert.equal(await page.locator('.empty-slot').count(),3);
  }
 }
 await page.selectOption('#language','ja');await page.reload();assert.equal(await page.locator('html').getAttribute('lang'),'ja');
 await page.locator('[data-filter="favorites"]').click();assert.equal(await page.locator('.game-card').count(),0);assert.ok(await page.locator('#result-status').textContent());
 await page.locator('[data-filter="all"]').click();
 await page.locator('.favorite-button').click();assert.equal(await page.locator('.favorite-button').getAttribute('aria-pressed'),'true');
 await page.locator('[data-filter="favorites"]').click();assert.equal(await page.locator('.game-card').count(),1);
 await page.reload();assert.equal(await page.locator('.favorite-button').getAttribute('aria-pressed'),'true');
 await page.locator('[data-filter="action"]').click();assert.equal(await page.locator('.game-card').count(),0);
 await page.locator('[data-filter="puzzle"]').click();assert.equal(await page.locator('.game-card').count(),1);
 await page.locator('[data-filter="favorites"]').click();await page.locator('.favorite-button').click();assert.equal(await page.locator('.game-card').count(),0);assert.equal(await page.locator('#favorite-count').textContent(),'0');
 await page.locator('[data-filter="all"]').click();await page.selectOption('#language','zh-Hant');
 await page.setViewportSize({width:1440,height:1080});await page.screenshot({path:'/workspace/games/assets/preview/hub_banner_desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/workspace/games/assets/preview/hub_banner_mobile.png',fullPage:true});
 await page.selectOption('#language','th');await page.screenshot({path:'/workspace/games/assets/preview/hub_banner_thai.png',fullPage:true});
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.banner-orbit').first().evaluate(e=>getComputedStyle(e).animationName),'none');
 await page.locator('.primary').click();assert.ok(page.url().endsWith('/01_memory_crash/'));
 const restricted=await browser.newContext({locale:'zh-CN'});await restricted.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new Error('disabled');}}));const rp=await restricted.newPage();await rp.goto(url);assert.equal(await rp.locator('html').getAttribute('lang'),'zh-Hans');await rp.selectOption('#language','en');await rp.locator('.favorite-button').click();assert.equal(await rp.locator('.favorite-button').getAttribute('aria-pressed'),'true');await restricted.close();
 const corrupt=await browser.newContext({locale:'en-US'});await corrupt.addInitScript(()=>{localStorage.setItem('gamehub_language','invalid');localStorage.setItem('gamehub_favorites','{broken');});const cp=await corrupt.newPage();await cp.goto(url);assert.equal(await cp.locator('html').getAttribute('lang'),'en');assert.equal(await cp.locator('#favorite-count').textContent(),'0');await corrupt.close();
 assert.deepEqual(errors,[]);console.log('PASS: 24 locale/viewport layouts; language and favorite persistence; filters; empty states; blocked/corrupt storage; reduced motion; play link.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
