const {chromium}=require('playwright');const fs=require('fs');const assert=require('assert');
(async()=>{
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/js/main.js*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text())+'\nwindow.__review={game,hero,STAGES,startStage,advanceDialog,updateHud,showGuiltBurstArt,setForm,runDialog,lockMarker,showMenu,updateMinimap};'});});
await page.goto('http://127.0.0.1:8000/02_brave_guy/');await page.waitForFunction(()=>window.__review);await page.evaluate(()=>document.fonts.ready);
const out=__dirname;fs.mkdirSync(out,{recursive:true});const checks=[];
for(const [w,h] of [[390,844],[844,390],[320,568],[1280,800]]){
 await page.setViewportSize({width:w,height:h});
 await page.evaluate(()=>{const r=window.__review;r.startStage(9);for(let i=0;i<8;i++)r.advanceDialog(true);r.game.phase='review';r.hero.form='worker';r.hero.hp=r.hero.maxHp*.65;r.hero.courage=100;r.hero.guilt=r.hero.guiltMax*.95;r.game.combo=25;r.updateHud();for(let i=0;i<3;i++)r.updateMinimap();document.getElementById('boss-bar').hidden=false;document.getElementById('boss-name').textContent='惡夢超人';document.getElementById('boss-fill').style.transform='scaleX(.6)';});
 await page.waitForTimeout(400);await page.evaluate(()=>{for(let i=0;i<3;i++)window.__review.updateMinimap()});await page.screenshot({path:`${out}/hud-${w}.png`});
 checks.push(await page.evaluate(()=>({width:innerWidth,worker:document.getElementById('portrait').classList.contains('worker'),bar:getComputedStyle(document.getElementById('hp-fill')).backgroundImage,lockAtlas:!!window.__review.lockMarker.material.map,overflow:document.documentElement.scrollWidth>innerWidth})));
 await page.evaluate(()=>{const r=window.__review;r.hero.form='brave';r.hero.hp=0;r.hero.guilt=0;r.hero.courage=0;r.hero.qi=100;r.game.abilities.add('ult');r.updateHud()});
 await page.waitForFunction(()=>getComputedStyle(document.getElementById('hp-fill')).transform==='matrix(0, 0, 0, 1, 0, 0)');
 await page.evaluate(()=>window.__review.showGuiltBurstArt());assert.equal(await page.locator('.guilt-burst-art').count(),1);await page.locator('.guilt-burst-art').waitFor({state:'detached',timeout:10000});
 await page.evaluate(()=>window.__review.runDialog([['小天使','（在賓果卡上畫圈）「你明明說過」。第三格了。他現在叫地獄超人。惡夢是怕別人，地獄是恨自己。']],()=>{}));
 await page.screenshot({path:`${out}/dialog-${w}.png`});assert(await page.locator('#dlg-bingo').isVisible());
 await page.evaluate(()=>window.__review.advanceDialog(true));
}
assert(!checks.some(c=>!c.worker||!c.lockAtlas||c.overflow));assert.equal(await page.locator('.act.ult').evaluate(e=>getComputedStyle(e,'::after').content),'"F"');assert.equal(errors.length,0);fs.writeFileSync(out+'/checks.json',JSON.stringify({checks,errors,burstCleanup:true,bingoDialog:true},null,2));console.log(JSON.stringify({checks,errors}));await browser.close();
})();
