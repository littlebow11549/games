const {chromium}=require('playwright');const fs=require('fs');const assert=require('assert');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:8000/02_brave_guy/');await page.waitForFunction(()=>window.__game);await page.evaluate(()=>document.fonts.ready);
const saved=await page.evaluate(()=>JSON.stringify(window.__game.save));await page.locator('#ov-replay').click();
const shots=[];for(let i=0;i<17;i++){
 if(i!==11)await page.waitForFunction(()=>!!document.querySelector('#tf-art').dataset.frame&&document.querySelector('#tf-art img[src]'));
 if(i===8){await page.waitForFunction(()=>document.querySelector('#tf-art').dataset.frame==='scarf');}
 shots.push(await page.locator('#tf-art').evaluate(e=>({hidden:e.hidden,shot:e.dataset.shot,frame:e.dataset.frame})));
 await page.evaluate(()=>window.__game.advanceDialog());
}
assert(await page.locator('#overlay').isVisible());assert.equal(await page.evaluate(()=>JSON.stringify(window.__game.save)),saved);
const out=__dirname;fs.mkdirSync(out,{recursive:true});
for(const [w,h] of [[390,844],[844,390],[320,568],[1280,800]]){
 await page.setViewportSize({width:w,height:h});await page.locator('#ov-replay').click();
 for(const target of [1,5,8,10]){
  await page.evaluate(target=>{while(window.__game.dialog.i<target)window.__game.advanceDialog()},target);
  await page.waitForFunction(target=>{const e=document.getElementById('tf-art');return e.dataset.frame===({1:'sign',5:'waiting_1',8:'scarf',10:'pose'}[target])},target);
  await page.waitForTimeout(300);await page.screenshot({path:`${out}/${target}-${w}.png`});
  const rects=await page.evaluate(()=>{const a=document.getElementById('tf-art').getBoundingClientRect(),d=document.querySelector('#dialog .dlg-box').getBoundingClientRect();return {art:[a.x,a.y,a.width,a.height],text:[d.x,d.y,d.width,d.height],overflow:document.documentElement.scrollWidth>innerWidth}});
  assert(!rects.overflow);assert(rects.art[2]>0&&rects.art[3]>0);
 }
 await page.locator('#dlg-skip').click();assert(await page.locator('#tf-art').isHidden());assert(await page.locator('#overlay').isVisible());
}
await page.locator('#overlay [data-lang-toggle]').click();await page.locator('#ov-replay').click();await page.evaluate(()=>window.__game.advanceDialog());await page.waitForFunction(()=>document.getElementById('tf-art').dataset.frame==='sign');assert.equal(await page.locator('.tf-sign-card b').textContent(),'Please wait');await page.keyboard.press('Escape');
await page.evaluate(()=>{const g=window.__game;g.startStage(0);g.advanceDialog(true);g.save.seenTransform=false;g.hero.courage=g.GAUGE.courageMax;});
await page.keyboard.down('Space');await page.waitForFunction(()=>window.__game.dialog&&document.getElementById('dialog').classList.contains('stars'));await page.keyboard.up('Space');
await page.locator('#dlg-skip').click();await page.waitForFunction(()=>window.__game.hero.form==='brave');assert(await page.locator('#tf-art').isHidden());
await page.evaluate(()=>{const g=window.__game;g.startStage(0);g.advanceDialog(true);g.hero.courage=g.GAUGE.courageMax});await page.keyboard.down('Space');await page.waitForFunction(()=>window.__game.hero.state==='transforming');await page.keyboard.up('Space');await page.waitForFunction(()=>window.__game.hero.form==='brave');assert.equal(await page.evaluate(()=>window.__game.dialog),null);
assert.equal(errors.length,0);fs.writeFileSync(out+'/checks.json',JSON.stringify({shots,errors,sizes:4,replayPreservesSave:true,skip:true,english:true,firstTransform:true,subsequentTransformSkipsStory:true},null,2));console.log('PASS transform replay, 17 lines, 5 outfit cuts, 4 sizes, skip, English, save unchanged');
}finally{await browser.close()}})();
