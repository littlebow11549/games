import { words } from './run-records.js';
import { lang } from './i18n.js?v=20261115cinema';
let manifestPromise,gameplayPromise,gameplayReady=false;const decoded=new Set();
export async function preloadImages(report=()=>{},scope='boot'){
 if(!manifestPromise)manifestPromise=fetch('assets/runtime-images.json?v=20261115finish').then(r=>{if(!r.ok)throw new Error('Image manifest unavailable');return r.json()}).catch(e=>{manifestPromise=null;throw e});
 const all=await manifestPromise;
 const common=all.filter(url=>!url.includes('/cinematics/')&&(!url.includes('/sheet/unified/')||/sheet_(angel|ganqiao|worker)\.png$/.test(url)));
 const urls=common.filter(url=>!decoded.has(url)&&(scope==='game'||/\/branding\/|language_globe|panel_popup|panel_title_plate|btn_text|difficulty_sheet|portrait_student|sheet_(angel|ganqiao)\.png/.test(url)));let next=0,done=0,failure=null;
 async function worker(){while(!failure&&next<urls.length){const url=urls[next++],im=new Image();im.src=url;try{await im.decode();if(!im.naturalWidth)throw new Error('Empty image');}catch{failure=true;throw new Error(words(lang,'圖片載入失敗，請重試：','Image failed. Please retry: ','画像の読み込みに失敗。再試行：')+url);}decoded.add(url);report(++done,urls.length);}}
 const results=await Promise.allSettled(Array.from({length:3},worker));
 const failed=results.find(result=>result.status==='rejected');if(failed)throw failed.reason;
}

let gateId=0;
export function waitForArtwork(task,done){
 const id=++gateId,root=document.getElementById('boot-scene'),retry=document.getElementById('boot-retry');root.hidden=false;
 document.getElementById('boot-caption').textContent=words(lang,'正在準備畫面素材…','Preparing artwork…','画面の画像を準備中…');
 document.getElementById('boot-percent').textContent='';document.getElementById('boot-fill').style.transform='scaleX(0)';retry.hidden=true;
 const attempt=async()=>{retry.hidden=true;try{await task();if(id!==gateId)return;root.hidden=true;retry.onclick=()=>location.reload();done();}catch{if(id!==gateId)return;document.getElementById('boot-caption').textContent=words(lang,'圖片尚未就緒，請重試。','Artwork is not ready. Please retry.','画像を読み込めません。再試行してください。');retry.hidden=false;retry.onclick=attempt;}};attempt();
}
export function cancelArtwork(){gateId++;const root=document.getElementById('boot-scene');if(window.__booted)root.hidden=true;}

export const gameplayIsReady=()=>gameplayReady;
export function prepareGameplay(){if(!gameplayPromise)gameplayPromise=preloadImages((done,total)=>{document.getElementById('boot-fill').style.transform=`scaleX(${done/total})`;document.getElementById('boot-percent').textContent=`${done}/${total}`;},'game').then(()=>{gameplayReady=true}).catch(error=>{gameplayPromise=null;throw error});return gameplayPromise;}
