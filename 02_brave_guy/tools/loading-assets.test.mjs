import {readFile} from 'node:fs/promises';
import {stat} from 'node:fs/promises';
import test from 'node:test';
import assert from 'node:assert/strict';

const root=new URL('../',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');
const moduleUrl=code=>'data:text/javascript;base64,'+Buffer.from(code).toString('base64');
const imports={
 './asset-paths.js':moduleUrl(await read('js/asset-paths.js')),
 './run-records.js?v=20261120assets':moduleUrl('export const words=(code,...options)=>options[0]'),
 './i18n.js?v=20261120assets':moduleUrl('export const lang="zh-Hant"'),
 './character-art-data.js?v=20261120nighttitles':moduleUrl(await read('js/character-art-data.js')),
};
let source=await read('js/loading.js');
for(const [name,url] of Object.entries(imports))source=source.replace(`'${name}'`,`'${url}'`);
globalThis.location={search:''};
globalThis.matchMedia=()=>({matches:true});
const {imagePlan,preloadImages,prepareGameplay,gameplayIsReady}=await import(moduleUrl(source));
const manifest=JSON.parse(await read('assets/runtime-images.json'));

test('game plan prioritizes only selected combat atlas, localized title art, and common angel speech',async()=>{
 const specs={brave:'勇氣超人',angel:'小天使',nightmare:'惡夢超人'};
 for(const [id,label] of Object.entries(specs))for(const locale of ['zh-Hant','en','ja']){
  const plan=imagePlan(manifest,{scope:'game',character:id,locale});
  assert.equal(plan.length,new Set(plan).size);
  assert.match(plan[0],new RegExp(label+'_原版2D技能圖集'));
  assert.match(plan[1],new RegExp(label+'_對話招式圖集01'));
  assert(plan.some(x=>x.includes('小天使_對話招式圖集01')));
  assert(!plan.some(x=>/(ui20_勇氣超人技能|ui29_普攻|ui36_閃避|ui19_勇氣寶石)/.test(x)));
  assert(!plan.some(x=>x.includes('/cinematics/')));
  assert.equal(plan.some(x=>x.includes('/transform/')),id==='brave');
  assert(plan.some(x=>x.endsWith(`system_combat_${locale==='zh-Hant'?'zh':locale}.webp`)));
  assert.equal(plan.filter(x=>/system_combat_(zh|en|ja)/.test(x)).length,1);
  for(const path of plan)assert((await stat(new URL(path,root))).size>0,path);
 }
 const legacy=imagePlan(manifest,{scope:'game',style:'legacy'});
 assert(legacy.some(x=>x.includes('ui20_勇氣超人技能')));
 assert(!legacy.some(x=>x.includes('原版2D技能圖集')));
});

test('boot plan includes only matching orientation and does not block on Japanese logo outside Japanese',()=>{
 const boot=imagePlan(manifest);
 assert(boot.some(x=>x.includes('menu_keyart_portrait')));
 assert(!boot.some(x=>x.includes('logo_ja')));
 assert(!boot.some(x=>x.includes('對話招式圖集')));
 const landscape=imagePlan(manifest,{locale:'ja',portrait:false});
 assert(landscape.some(x=>x.includes('menu_keyart_01')));
 assert(landscape.some(x=>x.includes('logo_ja')));
 assert(!landscape.some(x=>x.includes('menu_keyart_portrait')));
});

test('duplicate requests share the same decode and failed artwork can be retried',async()=>{
 const path='assets/runtime/lossless/pic/branding/brave_guy_branding11_menu_keyart_01.webp';
 globalThis.fetch=async()=>({ok:true,json:async()=>[path]});
 globalThis.matchMedia=()=>({matches:false});
 globalThis.document={getElementById:()=>({style:{}})};
 const seen=new Map();
 let shouldFail=true;
 globalThis.Image=class {
   naturalWidth=1920;
   decode(){
    seen.set(this.src,(seen.get(this.src)||0)+1);
    return this.src===path&&shouldFail?Promise.reject(Error('decode failure')):Promise.resolve();
   }
 };
 const result=await Promise.allSettled([preloadImages(),preloadImages()]);
 assert(result.every(x=>x.status==='rejected'));
 assert.equal(seen.get(path),1);
 shouldFail=false;
 await preloadImages();
 assert.equal(seen.get(path),2);
 await prepareGameplay('angel');
 assert(gameplayIsReady('angel'));
 assert(!gameplayIsReady('brave'));
 await prepareGameplay('brave');
 assert(gameplayIsReady('brave'));
 assert.equal(seen.get(path),2);
 assert.equal([...seen].filter(([url])=>url.includes('小天使_對話招式圖集'))[0][1],1);
});
