require('node:fs').mkdirSync('/tmp/game02-qa',{recursive:true});
// Run with repository HTTP server on port 8000.
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const out=path.resolve('/tmp/game02-qa/boss-storyboards');fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[],missing=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()===404)missing.push(r.url());});
 await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
 await page.goto('http://127.0.0.1:8000/02_brave_guy/play.html');await page.locator('.opening-skip').click();await page.waitForFunction(()=>window.__game?.game.phase==='ready',null,{polling:50});
 await page.locator('#overlay [data-lang="ja"]').click();
 await page.locator('#ov-local-logo').evaluate(e=>e.getAnimations().forEach(a=>a.finish()));
 const logo=await page.locator('#ov-local-logo').evaluate(async e=>{await e.decode();const r=e.getBoundingClientRect();return{tag:e.tagName,src:e.src,w:r.width,h:r.height,nw:e.naturalWidth,nh:e.naturalHeight};});assert.equal(logo.tag,'IMG');assert(logo.src.endsWith('/logo_ja.png'));assert.equal(logo.nw,1536);assert(logo.w>100&&logo.h>50);await page.screenshot({path:path.join(out,'logo-ja.png')});
 // Decode every delivery file in the actual browser, including MP3 Safari fallback.
 const decoded=await page.evaluate(async()=>{const a=__game.audio;a.unlock();const m=await(await fetch('assets/manifest.json')).json(),urls=[...new Set(Object.values(m.sfx).flat().flatMap(u=>u.endsWith('.ogg')?[u,u.replace(/\.ogg$/,'.mp3')]:[u]))];const rows=[];for(const url of urls){const b=await a.ctx.decodeAudioData(await(await fetch(url)).arrayBuffer());let peak=0;for(const v of b.getChannelData(0))peak=Math.max(peak,Math.abs(v));rows.push({url,seconds:b.duration,channels:b.numberOfChannels,peak});}return rows;});
 assert(decoded.length>=63);for(const r of decoded){assert(r.seconds>0,r.url);assert.equal(r.channels,1);assert(r.peak<1,r.url+' clipping');}
 const config=await page.evaluate(async()=>{const m=await import('./js/boss-storyboards.js?v=20261115allboss');window.__boards=m.BOSS_STORYBOARDS;await Promise.all(Object.entries(__boards).flatMap(([k,d])=>(d.files||['boss_'+k+'_storyboard']).map(async f=>{const i=new Image();i.src='assets/source/pic/cinematics/'+f+'.png';await i.decode();})));await __game.cinematics.prepareBoss(Object.keys(__boards));return __boards;});
 assert.equal(Object.keys(config).length,13);
 let shots=0;
 for(const locale of ['zh-Hant','en','ja']){
  await page.evaluate(async l=>(await import('./js/i18n.js?v=20261115cinema')).setLang(l),locale);
  for(const [key,d]of Object.entries(config)){
   assert.deepEqual(d.cuts,[4,8]);assert.equal(d.duration,12);
   await page.evaluate(k=>{__game.game.phase='cinematic';__game.cinematics.boss([k],()=>{__game.game.phase='playing';});},key);await page.waitForTimeout(35);
   for(const [dt,beat]of [[.2,'0'],[4,'1'],[4,'2']]){await page.evaluate(dt=>__game.cinematics.update(dt),dt);assert.equal(await page.getAttribute('#cinema','data-beat'),beat,key);assert.equal(await page.getAttribute('#cinema','data-art-ready'),'true',key);shots++;}
   assert(await page.locator('.cinema-name').isVisible());const expected=await page.evaluate(async k=>{const{BOSS_PROFILES}=await import('./js/cinematics.js?v=20261115allboss');const{t}=await import('./js/i18n.js?v=20261115cinema');return t(BOSS_PROFILES[k][0]);},key);assert.equal(await page.locator('.cinema-name').textContent(),expected);
   if(locale==='zh-Hant'){await page.waitForTimeout(550);await page.screenshot({path:path.join(out,key+'.png')});}
   await page.evaluate(()=>__game.cinematics.update(4));assert.equal(await page.evaluate(()=>__game.game.phase),'playing');assert.equal(await page.evaluate(()=>__game.audio.duck),1);
  }
 }
 for(const [w,h]of [[320,568],[844,390],[1280,720]]){await page.setViewportSize({width:w,height:h});await page.evaluate(()=>{__game.game.phase='cinematic';__game.cinematics.boss(['folaidiKing'],()=>{});});await page.waitForTimeout(30);await page.evaluate(()=>__game.cinematics.update(5));await page.waitForTimeout(550);await page.screenshot({path:path.join(out,'folaidi-'+w+'.png')});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>__game.cinematics.active),false);}
 // Duo follows the same 12-second format twice, and never spawns a boss on cancel.
 await page.evaluate(()=>{window.finished=0;__game.cinematics.boss(['xinji','baguashe'],()=>finished++);});await page.waitForTimeout(30);await page.evaluate(()=>__game.cinematics.update(12.1));assert.equal(await page.getAttribute('#cinema','data-storyboard'),'baguashe');await page.evaluate(()=>__game.cinematics.cancel());assert.equal(await page.evaluate(()=>finished),0);
 await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>__game.cinematics.boss(['incubus'],()=>{}));await page.waitForTimeout(30);await page.evaluate(()=>__game.cinematics.update(5));assert.equal(await page.locator('.cinema-name').evaluate(e=>getComputedStyle(e).animationName),'none');await page.keyboard.press('Escape');
 assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
 const report={bosses:13,shots,locales:3,duration:12,cuts:[4,8],logo,decodedSfx:decoded.length,maxDecodedPeak:Math.max(...decoded.map(x=>x.peak)),cancel:true,duo:true,reducedMotion:true,errors,missing};fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify(report,null,2));console.log(report);await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
