const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const page=await browser.newPage();
 await page.route('**/stick-test.html',route=>route.fulfill({contentType:'text/html',body:'<link rel="stylesheet" href="css/game.css"><link rel="stylesheet" href="css/ui-art.css"><link rel="stylesheet" href="css/controls-layout.css"><link rel="stylesheet" href="css/ui-layers.css"><body></body>'}));
 await page.goto('http://localhost:8000/02_brave_guy/stick-test.html');
 // Isolate real input module and production CSS from combat/cinematics.
 await page.evaluate(async()=>{
  document.body.className='game-art';
  document.body.innerHTML='<canvas id="scene"></canvas><div id="hud"><div id="stick-zone"><div id="stick-base"><div id="stick-knob"></div></div></div><div class="actions base-form"></div></div>';
  const {Input}=await import('./js/input.js?v=20261118stick');window.testInput=new Input();
 });
 for(const [width,height] of [[360,780],[390,844],[844,390],[1280,800]]){
  await page.setViewportSize({width,height});
  for(const baseForm of [true,false]){
   await page.evaluate(v=>document.querySelector('.actions').classList.toggle('base-form',v),baseForm);
   const b=await page.locator('#stick-base').boundingBox();
   const cx=b.x+b.width/2,cy=b.y+b.height/2,r=b.width/2;
   const move=()=>page.evaluate(()=>testInput.move().len);
   for(const [x,y] of [[width*.4,height*.5],[cx+r+12,cy],[cx+r+6,cy-r-6]]){
    await page.mouse.move(x,y);await page.mouse.down();assert.equal(await move(),0,`outside ${width}/${baseForm}`);await page.mouse.up();
   }
   await page.mouse.move(cx+r+4,cy);await page.mouse.down();assert((await move())>0,'8px tolerance works');
   await page.mouse.move(width*.6,height*.4);assert((await move())>0,'captured drag continues outside');
   await page.mouse.up();assert.equal(await move(),0,'release resets');
   await page.mouse.move(cx+20,cy);await page.mouse.down();assert((await move())>0,'inside starts');
   await page.evaluate(()=>window.dispatchEvent(new Event('blur')));assert.equal(await move(),0,'blur resets');await page.mouse.up();
   await page.evaluate(()=>{
    const z=document.querySelector('#stick-zone'),b=document.querySelector('#stick-base').getBoundingClientRect();
    z.dispatchEvent(new PointerEvent('pointerdown',{pointerId:999,pointerType:'touch',clientX:innerWidth*.4,clientY:innerHeight*.5,bubbles:true}));
   });assert.equal(await move(),0,'JS rejects distant synthetic touch');
  }
 }
 await page.setViewportSize({width:390,height:844});
 const touch=await page.context().newCDPSession(page);
 const bounds=await page.locator('#stick-base').boundingBox();
 await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:156,y:422}]});
 assert.equal(await page.evaluate(()=>testInput.move().len),0,'real center touch ignored');
 await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:bounds.x+bounds.width/2+20,y:bounds.y+bounds.height/2}]});
 assert((await page.evaluate(()=>testInput.move().len))>0,'real stick touch works');
 await touch.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
 assert.equal(await page.evaluate(()=>testInput.move().len),0,'touch cancel resets');
 console.log('PASS 4 viewports × 2 forms: center/outside ignored, 8px tolerance, captured drag, release and blur reset');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
