const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});try{
 const context=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 await context.addInitScript(()=>{let r=0;Math.random=()=>((r++%12)+.5)/12;localStorage.setItem('mc_seen_howto','1');localStorage.setItem('mc_music','1');const NativeAudio=window.Audio;window.__testAudio=[];window.Audio=function(...args){const a=new NativeAudio(...args);window.__testAudio.push(a);return a;};window.Audio.prototype=NativeAudio.prototype;});
 const p=await context.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));const url=process.env.GAME_URL||'http://127.0.0.1:8000/01_memory_crash/';await p.goto(url);
 await p.evaluate(()=>MemoryCrashPresentation.fontReady);assert.equal(await p.locator('[data-bitmap][data-rendered="true"]').count(),6);
 await p.waitForFunction(()=>!document.querySelector('#warpVideo').paused&&document.querySelector('#warpVideo').currentTime>0);
 const clickStart=async page=>{const box=await page.locator('#btnStart').boundingBox();await page.mouse.click(box.x+box.width/2,box.y+box.height/2);};
 await p.screenshot({path:'/workspace/games/01_memory_crash/assets/preview/final_title.png'});await clickStart(p);
 await p.waitForFunction(()=>MemoryCrashPresentation.introPlaying&&!document.querySelector('#introVideo').paused);await p.screenshot({path:'/workspace/games/01_memory_crash/assets/preview/final_intro.png'});
 await p.locator('#skipIntro').click();await p.waitForSelector('#screen-menu.active');assert.equal(await p.locator('#introVideo').evaluate(v=>v.paused),true);
 await p.locator('#btnMenuOption').click();assert.equal(await p.locator('#warpVideo').evaluate(v=>v.paused),true);await p.screenshot({path:'/workspace/games/01_memory_crash/assets/preview/final_bitmap_options.png'});
 await p.locator('#btnSound').click();assert.ok(await p.locator('#soundState').evaluate(e=>e.classList.contains('muted')));await p.locator('#btnSound').click();
 await p.locator('#btnMaster').click();await p.waitForSelector('#screen-game.active');await p.waitForFunction(()=>window.__testAudio.some(a=>/bgm_02/.test(a.src)&&!a.paused));
 assert.ok(await p.locator('.gem').first().evaluate(e=>getComputedStyle(e).backgroundImage.includes('slot.png')));
 await p.waitForFunction(()=>!document.querySelector('#board').classList.contains('locked'));for(let i=0;i<5;i++)await p.locator('.gem').nth(i).click();
 await p.waitForSelector('.fx-burst');await p.screenshot({path:'/workspace/games/01_memory_crash/assets/preview/final_perfect_fx.png'});
 for(let miss=0;miss<3;miss++){await p.waitForFunction(()=>!document.querySelector('#board').classList.contains('locked'));await p.locator('.gem').nth(11).click();assert.ok(await p.locator('.fx-shatter').count());}
 await p.waitForSelector('#screen-over.active');await p.waitForSelector('.fx-crack');await p.screenshot({path:'/workspace/games/01_memory_crash/assets/preview/final_over_fx.png'});
 await p.locator('#btnHomeOver').click();await p.locator('#btnArcade').click();await p.waitForFunction(()=>window.__testAudio.some(a=>/bgm_01/.test(a.src)&&!a.paused));
 assert.equal(await p.evaluate(()=>window.__testAudio.filter(a=>/bgm_0[12]/.test(a.src)&&!a.paused).length),1);
 await p.locator('#btnOptionTop').click();await p.locator('#btnMusic').click();assert.equal(await p.evaluate(()=>window.__testAudio.filter(a=>/bgm_0[12]/.test(a.src)&&!a.paused).length),0);
 await p.waitForTimeout(800);assert.equal(await p.locator('.gem.lit').count(),0);assert.equal(await p.locator('#board').evaluate(e=>e.classList.contains('locked')),true);
 await p.locator('#btnMusic').click();await p.waitForFunction(()=>window.__testAudio.some(a=>/bgm_01/.test(a.src)&&!a.paused&&Number.isFinite(a.duration)));
 await p.evaluate(()=>{const a=window.__testAudio.find(a=>/bgm_01/.test(a.src)&&!a.paused);a.currentTime=a.duration-.15;});await p.waitForFunction(()=>window.__testAudio.some(a=>/bgm_01/.test(a.src)&&!a.paused&&a.currentTime<1));
 // The natural completion path also reaches the menu without a skip click.
 const natural=await context.newPage();await natural.goto(url);await clickStart(natural);await natural.waitForSelector('#screen-menu.active',{timeout:12000});assert.equal(await natural.locator('#introVideo').evaluate(v=>v.ended),true);await natural.close();
 const small=await b.newContext({viewport:{width:320,height:568},hasTouch:true,isMobile:true,reducedMotion:'reduce'});await small.addInitScript(()=>{localStorage.setItem('mc_seen_howto','1');localStorage.setItem('mc_music','0');});const sp=await small.newPage();await sp.goto(url);await sp.evaluate(()=>MemoryCrashPresentation.fontReady);await clickStart(sp);await sp.waitForSelector('#screen-menu.active');assert.equal(await sp.locator('#introLayer').evaluate(e=>e.hidden),true);assert.equal(await sp.locator('#warpVideo').evaluate(v=>v.paused),true);
 await sp.locator('#btnMenuOption').click();assert.ok(await sp.locator('#btnMaster').evaluate(e=>e.getBoundingClientRect().bottom<=innerHeight));await sp.screenshot({path:'/workspace/games/01_memory_crash/assets/preview/final_options_small.png'});
 await sp.locator('#btnHowTo').click();await sp.locator('#btnCloseModal').scrollIntoViewIfNeeded();assert.ok(await sp.locator('#btnCloseModal').evaluate(e=>e.getBoundingClientRect().bottom<=innerHeight));await sp.locator('#btnCloseModal').click();await sp.locator('#btnMaster').click();await sp.waitForSelector('#screen-game.active');assert.ok(await sp.locator('.game-reaction').evaluate(e=>e.getBoundingClientRect().bottom<=innerHeight));
 assert.deepEqual(errors,[]);console.log('PASS: bitmap labels; native intro playback/skip/end/reduced motion; title/menu warp lifecycle; real Master/Arcade music switching, mute and loop wrap; slot art; burst/shatter/crack events; 320x568 touch layout and modal scrolling.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
