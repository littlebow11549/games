// Regression: a higher-specificity result grid collapsed empty atlas spans to 0×0.
// Serve repository root on :8000, then run this script.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/js/main.js*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text())+'\nwindow.__titleReview={showOverlay,setLang,refreshLang};'});});
 await page.goto('http://127.0.0.1:8000/02_brave_guy/?lang=ja');await page.waitForFunction(()=>window.__game?.game.phase==='ready');
 let checks=0;
 for(const size of [{width:320,height:568},{width:390,height:844},{width:844,height:390}]){
  await page.setViewportSize(size);
  for(const locale of ['zh-Hant','en','ja'])for(const [outcome,title] of [['clear','突 破'],['defeat','倒 下'],['ending','醒 來']]){
   await page.evaluate(({locale,outcome,title})=>{__titleReview.setLang(locale);__titleReview.showOverlay({outcome,title,text:'1-1',btn:'再打一次',stats:outcome==='clear'?{id:'1-1',name:'教室的走廊',time:88,kills:484}:null});},{locale,outcome,title});
   const box=await page.locator('#ov-title').evaluate(async el=>{
    const sprite=el.querySelector('.word-art'), css=getComputedStyle(sprite), rect=sprite.getBoundingClientRect(), parent=el.getBoundingClientRect();
    const img=new Image();img.src=css.backgroundImage.slice(5,-2);await img.decode();
    return {layout:getComputedStyle(el).display,w:rect.width,h:rect.height,center:Math.abs((rect.left+rect.right-parent.left-parent.right)/2),asset:img.naturalWidth,locale:img.src};
   });
   assert.equal(box.layout,'flex');assert(box.w>=150&&box.h>=60,JSON.stringify({locale,outcome,size,box}));assert(box.center<1);assert.equal(box.asset,1536);assert(box.locale.includes(`_${locale==='zh-Hant'?'zh':locale}.png`));checks++;
   if(size.width===390&&locale==='ja'&&outcome==='clear')await page.screenshot({path:'/workspace/scratch/result-title-fixed-ja.png'});
  }
 }
 assert.deepEqual(errors,[]);console.log(`PASS: ${checks} visible, centered, decoded result titles; 0 JS errors`);await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
