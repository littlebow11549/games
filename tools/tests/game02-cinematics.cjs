require('node:fs').mkdirSync('/tmp/game02-qa',{recursive:true});
// Start `python -m http.server 8000` at repository root, then node this file.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
(async()=>{
 const root=path.resolve(__dirname,'../..'), out='/tmp/game02-qa/cinema-review';
 const {nextLockTarget}=await import(path.join(root,'02_brave_guy/js/targeting.js'));
 const target=x=>({state:'idle',pos:{x,z:0},def:{radius:.5}}), a=target(1),b=target(2),c=target(3),gone=target(2);gone.gone=true;
 assert.equal(nextLockTarget([a,b,c,gone],a,{x:0,z:0},10),b);assert.equal(nextLockTarget([a,b,c],a,{x:0,z:0},10,-1),c);assert.equal(nextLockTarget([a,b,c],c,{x:0,z:0},10),a);b.state='dead';assert.equal(nextLockTarget([a,b,c],a,{x:0,z:0},10),c);assert.equal(nextLockTarget([a],null,{x:100,z:0},10),null);
 const {default:EN}=await import(path.join(root,'02_brave_guy/js/lang_en.js')), {default:JA}=await import(path.join(root,'02_brave_guy/js/lang_ja.js'));
 for(const [k,v] of Object.entries(EN)){assert(JA[k],`Missing Japanese: ${k}`);assert.deepEqual((JA[k].match(/\{\d\}/g)||[]).sort(),(v.match(/\{\d\}/g)||[]).sort(),k);}
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[],missing=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()===404)missing.push(r.url());});
 await page.goto('http://127.0.0.1:8000/02_brave_guy/play.html');await page.locator('.opening-skip').click();await page.evaluate(()=>__game.prepareGameplay());await page.waitForFunction(()=>window.__game?.game.phase==='ready');
 const profiles=await page.evaluate(async()=>Object.keys((await import('./js/cinematics.js?v=20261120assets')).BOSS_PROFILES));assert.equal(profiles.length,13);
 for(const key of profiles){await page.evaluate(k=>{__game.startStage(0);__game.advanceDialog(true);__game.game.phase='cinematic';__game.cinematics.boss([k],()=>{__game.game.phase='playing';});__game.cinematics.update(1.2);},key);await page.waitForTimeout(100);await page.screenshot({path:path.join(out,`boss-${key}.png`)});await page.locator('.cinema-skip').click();assert.equal(await page.evaluate(()=>__game.game.phase),'playing');}
 const stages=await page.evaluate(()=>__game.STAGES.map((s,i)=>({i,boss:s.boss})).filter(s=>s.boss));
 for(const {i,boss} of stages){await page.evaluate(i=>{__game.startStage(i);__game.advanceDialog(true);__game.spawnBoss();},i);assert.equal(await page.evaluate(()=>__game.game.phase),'cinematic');await page.locator('.cinema-skip').click();assert.equal(await page.evaluate(()=>__game.enemies.filter(e=>e.def.boss).length),boss==='duo'?2:1);}
 await page.evaluate(()=>{__game.startStage(0);__game.advanceDialog(true);__game.hero.courage=100;__game.game.combo=99;__game.game.comboT=99;});
 await page.locator('#btn-pause').click();
 for(const locale of ['zh-Hant','en','ja']){await page.locator(`#pause-menu [data-lang="${locale}"]`).click();assert.equal(await page.getAttribute('html','lang'),locale);const widths=await page.locator('#pause-menu .card>button').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().width));assert(Math.max(...widths)-Math.min(...widths)<1);assert(await page.locator('#pause-menu h1 .word-art').count());await page.screenshot({path:path.join(out,`pause-${locale}.png`)});}
 await page.locator('#pm-resume').click();
 const burst=await page.evaluate(()=>{__game.game.abilities.add('transform');__game.hero.guilt=__game.hero.guiltMax;__game.guiltBurst();return{shards:document.querySelectorAll('.meter-shards i').length,burst:document.getElementById('guilt').classList.contains('meter-exploding'),atlas:document.querySelectorAll('.guilt-burst-art').length};});
 assert.equal(burst.shards,12);assert(burst.burst);assert.equal(burst.atlas,1);
 await page.screenshot({path:path.join(out,'guilt-burst.png')});await page.waitForFunction(()=>document.querySelectorAll('.meter-shards').length===0);
 await page.evaluate(()=>{const el=document.getElementById('combo-n'),animate=el.animate.bind(el);el.animate=(frames,options)=>{window.__comboAnimation={frames,options};return animate(frames,options)};__game.game.combo=10;__game.game.comboT=99;});await page.waitForFunction(()=>document.getElementById('combo-n').textContent==='10'&&window.__comboAnimation);assert(await page.evaluate(()=>__comboAnimation.frames.length>=3&&__comboAnimation.options.duration>0));

 await page.evaluate(()=>{__game.game.stage=13;__game.clearStage();});await page.keyboard.press('Escape');await page.locator('#ov-next').click();await page.waitForFunction(()=>__game.cinematics.state?.mode==='ending');assert.equal(await page.evaluate(()=>__game.cinematics.state.cast),14);
 await page.evaluate(()=>__game.cinematics.update(6));await page.screenshot({path:path.join(out,'ending-ja.png')});await page.locator('.cinema-skip').click();await page.waitForTimeout(200);
 assert.equal(await page.locator('.cinema-credits strong').count(),6);assert((await page.locator('.cinema-credits strong').allTextContents()).every(x=>x==='LilinS'));await page.screenshot({path:path.join(out,'staff-ja.png')});
 await page.evaluate(()=>__game.cinematics.update(8.1));assert.equal(await page.evaluate(()=>__game.game.phase),'over');assert(await page.locator('#ov-replay').isVisible());await page.locator('#ov-replay').click();await page.waitForFunction(()=>__game.cinematics.state?.mode==='ending');await page.keyboard.press('Escape');await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>__game.game.phase),'over');
 for(const [w,h] of [[320,568],[390,844],[844,390],[1280,720]]){await page.setViewportSize({width:w,height:h});await page.evaluate(()=>__game.showMenu());await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:path.join(out,`menu-ja-${w}.png`)});}
 await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>{__game.game.phase='cinematic';__game.cinematics.boss(['hell'],()=>{__game.game.phase='ready';});});await page.waitForFunction(()=>__game.cinematics.state?.mode==='boss');await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>__game.game.phase),'ready');
 assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
 const report={profiles:profiles.length,bossStages:stages.length,locales:Object.keys(EN).length,targetCycle:true,guiltBurst:true,comboBounce:true,endingCast:14,staffRoles:6,staffName:'LilinS',staffSeconds:8,replay:true,skip:true,widths:[320,390,844,1280],errors,missing};fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify(report,null,2));console.log(report);await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
