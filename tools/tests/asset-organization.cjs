const fs=require('node:fs');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const failures=[];let verified=0;
 try{
  for(const [root,prefix] of [['02_brave_guy','brave_guy'],['01_memory_crash','memory_crash'],['.','game_center']]){
   const ledger=JSON.parse(fs.readFileSync(`${root}/assets/records/${prefix}_asset-renames.json`));
   for(const row of ledger.files){
    if(row.disposition==='retired-qa')continue;
    assert(fs.existsSync(row.new),row.new);
    if(row.media){assert.equal(crypto.createHash('sha256').update(fs.readFileSync(row.new)).digest('hex'),row.sha256,row.new);verified++;}
   }
  }
  for(const width of [390,1280]){
   const context=await browser.newContext({viewport:{width,height:width===390?844:800}});
   await context.addInitScript(()=>localStorage.setItem('braveguy.save.v1',JSON.stringify({seenOpening:true})));
   const page=await context.newPage();
   page.on('pageerror',e=>failures.push(e.message));
   page.on('response',r=>{if(r.status()>=400)failures.push(`${r.status()} ${decodeURI(r.url())}`)});
   for(const path of ['/','/01_memory_crash/','/02_brave_guy/play.html']){
    await page.goto(`http://localhost:8000${path}`);
    if(path.includes('02_brave')){
     await page.waitForFunction(()=>window.__game?.game.phase==='ready');
     await page.evaluate(async()=>{
      await __game.prepareGameplay();
      const {BOSS_STORYBOARDS,createBossStoryboard}=await import('./js/boss-storyboards.js');
      await createBossStoryboard(document.createElement('div'),()=>null).prepare(Object.keys(BOSS_STORYBOARDS));
      const {assetPath}=await import('./js/asset-paths.js');
      const urls=[];
      const {TRANSFORM_FILES}=await import('./js/transform-art.js');
      for(const id of TRANSFORM_FILES)urls.push(assetPath(`assets/runtime/lossless/pic/transform/tf_${id}.webp`));
      for(const locale of ['zh','en','ja'])for(const group of ['combat','labels','outcomes'])urls.push(assetPath(`assets/runtime/lossless/pic/titles/system_${group}_${locale}.webp`));
      for(const id of ['angel','nightmare'])for(const lang of ['','_en','_ja'])urls.push(assetPath(`assets/source/pic/titles/ult_${id}${lang}.svg`));
      for(const url of urls){const im=new Image();im.src=url;await im.decode();}
     });
    }else if(path.includes('01_memory')){
     await page.evaluate(async()=>{
      await MemoryCrashPresentation.fontReady;
      const paths=Array.from({length:10},(_,i)=>`assets/source/pic/numbers/n${i}.webp`);
      for(const f of ['again','miss','perfect','ready','your_turn'])paths.push(`assets/runtime/pic/batch3/titles_fx_${f}_v3.webp`);
      for(const path of paths){const image=new Image();image.src=memoryAssetPath(path);await image.decode();}
     });
    }
    await page.waitForTimeout(300);
    const broken=await page.locator('img').evaluateAll(images=>images.filter(im=>im.src&&!im.naturalWidth&&im.complete).map(im=>im.src));
    failures.push(...broken);
   }
   await context.close();
  }
  assert.deepEqual([...new Set(failures)],[]);
  console.log(`PASS: ${verified} media hashes preserved; game center and both games at 390/1280px; all boss entrances, transforms, three-language titles, digits and feedback images; no HTTP or script errors.`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
