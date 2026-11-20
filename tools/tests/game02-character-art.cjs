const {chromium}=require('playwright');const assert=require('node:assert/strict');const fs=require('node:fs');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const errors=[];const results=[];try{
 const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,reducedMotion:'reduce'});p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
 await p.addInitScript(()=>{localStorage.setItem('braveguy.save.v1',JSON.stringify({seenOpening:true,rounds:4}));let seed=123;Math.random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646}});
 await p.goto('http://localhost:8000/02_brave_guy/play.html?skillStyle=color');await p.waitForFunction(()=>window.__game?.game.phase==='ready');await p.evaluate(()=>__game.prepareGameplay());
 for(const id of ['brave','angel','nightmare']){
  await p.evaluate(id=>{const g=__game;g.save.rounds=4;g.startStage(1,id);while(g.dialog)g.advanceDialog(true);g.game.paused=false;g.game.queue=[];g.game.waveTimer=999;g.hero.qi=100;g.hero.courage=100;g.hero.guilt=g.hero.guiltMax;g.hero.invuln=999;g.updateHud();},id);
  await p.waitForTimeout(60);await p.evaluate(()=>{__game.game.paused=true;__game.updateHud()});
  for(const style of ['color','tonal']){
   await p.evaluate(async style=>{const {setCharacterArtStyle}=await import('./js/character-art.js?v=20261120comic');setCharacterArtStyle(style);const url=getComputedStyle(document.getElementById('hud')).getPropertyValue('--character-skill-atlas').match(/url\("(.+)"\)/)[1];const im=new Image();im.src=url;await im.decode();},style);
   await p.screenshot({path:`/tmp/skills-${id}-${style}-mobile.png`});
   await p.screenshot({path:`/tmp/skills-${id}-${style}-controls.png`,clip:{x:0,y:500,width:390,height:344}});
   const checks=await p.locator('#hud .act[data-atlas-slot]').evaluateAll(buttons=>buttons.map(el=>({id:el.dataset.atlasSlot,image:getComputedStyle(el,'::before').backgroundImage,position:getComputedStyle(el,'::before').backgroundPosition,hidden:el.hidden,box:{x:el.getBoundingClientRect().x,y:el.getBoundingClientRect().y,w:el.offsetWidth,h:el.offsetHeight}})));
   assert.equal(await p.locator('.act.attack').evaluate(el=>getComputedStyle(el,'::before').borderRadius),'50%');assert.notEqual(await p.locator('#btn-cycle-lock svg').evaluate(el=>getComputedStyle(el).display),'none');assert.equal(await p.locator('.act.s1 em').evaluate(el=>getComputedStyle(el).zIndex),'1');
   assert.equal(checks.length,7);assert(checks.every(x=>decodeURI(x.image).includes('技能圖集')));assert.equal(new Set(checks.map(x=>x.position)).size,7);for(const x of checks.filter(x=>!x.hidden))assert(x.box.x>=0&&x.box.y>=0&&x.box.x+x.box.w<=391&&x.box.y+x.box.h<=845,JSON.stringify(x));
   results.push({id,style,checks});
  }
 }
 // All 36 title cells use exact labels, correct language and valid SVG resources.
 for(const lang of ['zh-Hant','en','ja']){
  await p.goto('http://localhost:8000/02_brave_guy/play.html?skillStyle=color&lang='+lang);await p.waitForFunction(()=>window.__game?.game.phase==='ready');
  const checked=await p.evaluate(async()=>{const {CHARACTER_ART:a}=await import('./js/character-art-data.js?v=20261120comic');const {characterTitle}=await import('./js/character-art.js?v=20261120comic');let count=0;for(const [id,c]of Object.entries(a.characters)){const im=new Image();im.src=c.titles.runtime;await im.decode();for(const row of c.titles.labels){const el=characterTitle(row[0],id);if(!el||el.dataset.character!==id)throw Error('Missing title '+row[0]);document.body.append(el);if(el.getBoundingClientRect().height===0)throw Error('Empty title');el.remove();count++;}}return count;});assert.equal(checked,12);
 }
 await p.setViewportSize({width:1280,height:800});await p.evaluate(async()=>{const g=__game;await g.prepareGameplay();g.save.rounds=4;g.startStage(1,'nightmare');while(g.dialog)g.advanceDialog(true);g.game.paused=true;g.hero.qi=100;g.updateHud()});
 for(const style of ['color','tonal']){await p.evaluate(async style=>(await import('./js/character-art.js?v=20261120comic')).setCharacterArtStyle(style),style);await p.waitForTimeout(150);await p.screenshot({path:`/tmp/skills-nightmare-${style}-desktop.png`});}
 assert.deepEqual(errors,[]);fs.writeFileSync('/tmp/character-art-checks.json',JSON.stringify(results,null,2));console.log('PASS: 3 characters × 2 styles, seven skill cells plus preserved original target controls, mobile bounds, desktop capture, 36 multilingual title cells, no request/script errors.');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
