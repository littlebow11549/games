const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const p=await b.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:8000/02_brave_guy/play.html');await p.waitForFunction(()=>window.__game?.audio,{timeout:90000});await p.evaluate(async()=>{const g=__game;await g.prepareGameplay();g.startStage(2);while(g.dialog)g.advanceDialog(true);g.game.waveTimer=999;g.hero.invuln=999;g.spawnEnemy('lan',g.hero.pos.clone());document.querySelector('#boss-bar').hidden=false;document.querySelector('#boss-name').textContent='藍教頭';const {setSystemArt}=await import('./js/system-art.js?v=20261120assets');const banner=document.querySelector('#banner');setSystemArt(banner,'心魔來襲');banner.classList.add('show');banner.getAnimations().forEach(a=>{a.pause();a.currentTime=500;});g.game.combo=88;g.game.comboT=999;});
for(const [w,h]of [[390,844],[844,390],[1280,720]]){
 await p.setViewportSize({width:w,height:h});await p.waitForTimeout(100);
 const checks=await p.evaluate(()=>{
  const z=id=>+getComputedStyle(document.getElementById(id)).zIndex;
  const result={bannerOverBoss:z('banner')>z('boss-bar'),comboAboveHud:z('combo')>z('hud'),dialogueAboveCombo:z('dialog')>z('combo'),pauseAboveDialogue:z('pause-menu')>z('dialog'),cinemaAboveMenus:z('cinema')>z('pause-menu'),loadingAboveFilms:z('boot-scene')>z('opening'),comboVisible:getComputedStyle(document.getElementById('combo')).display!=='none'};
  for(const id of ['btn-pause','btn-lock','btn-cycle-lock']){const el=document.getElementById(id),r=el.getBoundingClientRect();result[id]=el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}
  // Force an overlap and inspect actual paint order, not just CSS numbers.
  const banner=document.getElementById('banner'),boss=document.getElementById('boss-bar');const old=[banner.style.cssText,boss.style.cssText];for(const el of [banner,boss]){el.style.cssText+=';left:50px;top:250px;width:180px;height:60px;transform:none;animation:none;opacity:1;pointer-events:auto';}
  const painted=document.elementsFromPoint(100,275);result.overlapPaint=painted.indexOf(banner)>=0&&painted.indexOf(banner)<painted.indexOf(boss);[banner.style.cssText,boss.style.cssText]=old;
  return result;
 });for(const [name,ok]of Object.entries(checks))assert(ok,`${w}x${h}: ${name}`);
 await p.screenshot({path:`/tmp/ui-layers-${w}.png`});console.log(w,h,checks);
}
await p.setViewportSize({width:390,height:844});await p.locator('#btn-pause').click();assert(!await p.locator('#combo').isVisible());await p.locator('#pm-resume').click();
// Defensive visibility rules cover state-transition races for every blocking surface.
const blocked=await p.evaluate(()=>{const combo=document.getElementById('combo'),shards=document.createElement('div');shards.className='meter-shards';document.body.append(shards);const results=[];
for(const id of ['dialog','pause-menu','overlay','cinema','opening','boot-scene']){const panel=document.getElementById(id);if(!panel)continue;const old=panel.hidden;panel.hidden=false;combo.hidden=false;results.push([id,getComputedStyle(combo).display==='none'&&getComputedStyle(shards).display==='none']);panel.hidden=old;}
shards.remove();return results;});for(const [id,ok]of blocked)assert(ok,id+' hides combat decorations');
await p.evaluate(()=>__game.showMenu());await p.locator('#ov-menu').click();await p.locator('#ov-reset').click();assert(await p.locator('#reset-progress').evaluate(e=>e.matches(':modal')));await p.locator('#reset-cancel').click();assert.deepEqual(errors,[]);await b.close();console.log('PASS: global/local stack, overlapping banner, buttons, blocking screens, reset modal');})().catch(e=>{console.error(e);process.exit(1)});
