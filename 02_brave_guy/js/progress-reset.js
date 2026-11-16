import { lang } from './i18n.js?v=20261116dialog';
import { words } from './run-records.js?v=20261115fast';
// Only this game's progress and rankings. Preferences and other games stay intact.
export function clearProgress(storage){
 const entries=[];
 for(let i=0;i<storage.length;i++){const key=storage.key(i);if(/^braveguy\.(save\.|records\.)/.test(key))entries.push([key,storage.getItem(key)]);}
 try{for(const [key] of entries)storage.removeItem(key);}catch(error){for(const [key,value] of entries)try{storage.setItem(key,value);}catch{}throw error;}
}
export function createProgressReset(getAudio){
 const button=document.getElementById('ov-reset'),dialog=document.createElement('dialog');dialog.id='reset-progress';dialog.setAttribute('aria-labelledby','reset-title');
 dialog.innerHTML='<h2 id="reset-title"></h2><p id="reset-copy"></p><p class="reset-error" role="alert" hidden></p><div class="reset-actions"><button id="reset-cancel" autofocus></button><button id="reset-confirm"></button></div>';
 document.body.append(dialog);const $=s=>dialog.querySelector(s),tr=(...s)=>words(lang,...s);
 button.addEventListener('click',()=>{
  getAudio().unlock();getAudio().sfx('ui');
  $('#reset-title').textContent=tr('清除所有進度？','Clear all progress?','進行状況をすべて消去？');
  $('#reset-copy').textContent=tr('將刪除此裝置的通關、招式解鎖、劇情觀看紀錄，以及單關與全程排行榜。無法復原。語言、音量與畫質設定保留。','Deletes cleared stages, unlocked moves, story history and all stage/campaign records on this device. This cannot be undone. Language, sound and graphics settings stay.','この端末のクリア状況、技の解放、物語の閲覧履歴、全ランキングを消去します。元に戻せません。言語・音量・画質設定は保持します。');
  $('#reset-cancel').textContent=tr('取消，保留進度','Cancel · keep progress','キャンセル');
  $('#reset-confirm').textContent=tr('確定清除，重新開始','Delete and start over','消去して最初から');
  $('.reset-error').hidden=true;dialog.showModal();$('#reset-cancel').focus();
 });
 $('#reset-cancel').addEventListener('click',()=>{getAudio().sfx('ui_back');dialog.close();button.focus();});
 dialog.addEventListener('cancel',()=>getAudio().sfx('ui_back'));
 $('#reset-confirm').addEventListener('click',()=>{
  try{clearProgress(localStorage);}catch{const e=$('.reset-error');e.textContent=tr('無法清除儲存資料，請檢查瀏覽器設定後重試。','Could not clear storage. Check browser settings and retry.','保存データを消去できません。ブラウザ設定を確認してください。');e.hidden=false;return;}
  getAudio().sfx('ui_confirm');const url=new URL(location.href);url.searchParams.delete('unlock');location.replace(url.href);
 });
 return {refresh(){button.textContent=tr('清除所有進度','Clear all progress','進行状況を全消去');}};
}
