import { angelText } from './angel-language.js?v=20261119arsenal';
export const ROSTER = {
 brave:{name:'勇氣超人',role:'近戰・勇氣爆發',quote:'這次，換我自己決定。',skills:['勇氣衝拳','氣功彈','氣功震地','超勇氣波'],cd:[3,4,7],intro:'天下無敵不是不會害怕，是敢自己選擇。',win:'這一次，也沒有逃走。'},
 angel:{name:'小天使',role:'魔法・文字砲擊',quote:'我平常不出手，是怕你失業。',skills:['變態！不要過來','救命啊～色狼！','給我站住！','全都給我過來！'],cd:[4,8,10],intro:'導遊休假。今天換我清場，你在旁邊學著點。',win:'還行。當然，我說的是我自己。'},
 nightmare:{name:'惡夢超人',role:'近戰・浮游砲追擊',quote:'我這麼做，都是為了你好。',skills:['夢的翅膀已經受了傷～','聽話，讓我看看！','夠了！','王之嘴炮'],cd:[4,8,9],intro:'別怕。我只是把你不敢說的話，替你打回去。',win:'我不怪你。我只是……對你們很失望。'}
};
export const characterUnlocked=(id,rounds=0)=>id==='brave'||id==='nightmare'&&rounds>=3||id==='angel'&&rounds>=4;
export function createRosterPicker(){
 const box=document.createElement('dialog');box.id='roster-picker';box.setAttribute('aria-labelledby','roster-title');
 box.innerHTML='<h2 id="roster-title">夢境換角</h2><p>選擇本關角色。每次進關都能重新選擇。</p><div class="roster-cards"></div><p class="roster-note">沿用通關進度與救援次數；換角遊玩不列入一般計時排行。</p><button class="roster-cancel" type="button">返回</button>';
 document.body.append(box);let resolve=null;
 function finish(id){box.close();const done=resolve;resolve=null;done?.(id);}
 for(const [id,c] of Object.entries(ROSTER)){
  const btn=document.createElement('button');btn.type='button';btn.className='roster-card';btn.dataset.character=id;
  btn.innerHTML=`<span class="roster-face ${id}" aria-hidden="true"></span><strong>${c.name}</strong><small>${c.role}</small><q>${c.quote}</q><span class="roster-skills">${c.skills.map(angelText).join('／')}</span>`;
  btn.onclick=()=>finish(id);box.querySelector('.roster-cards').append(btn);
 }
 box.querySelector('.roster-cancel').onclick=()=>finish(null);box.addEventListener('cancel',e=>{e.preventDefault();finish(null)});box.addEventListener('keydown',e=>e.stopPropagation());
 return {get open(){return box.open},choose(last='brave',rounds=0){for(const btn of box.querySelectorAll('.roster-card')){btn.hidden=!characterUnlocked(btn.dataset.character,rounds);btn.querySelector('.roster-skills').textContent=ROSTER[btn.dataset.character].skills.map(angelText).join('／');}if(!characterUnlocked(last,rounds))last='brave';if(resolve)return Promise.resolve(null);return new Promise(done=>{resolve=done;box.showModal();box.querySelector(`[data-character="${last}"]`)?.focus()})}};
}

export function createUnlockNotice(){
 const box=document.createElement('dialog');box.id='unlock-dialog';box.className='character-unlock';
 box.innerHTML='<div class="secret-angel"><span class="roster-face"></span><div><b></b><p id="unlock-message"></p></div></div><div class="secret-choices"><button type="button">知道了，準備出發！</button></div>';
 box.setAttribute('aria-labelledby','unlock-message');document.body.append(box);let finish;
 const close=()=>{box.close();const done=finish;finish=null;done?.();};
 box.querySelector('button').onclick=close;box.addEventListener('cancel',e=>{e.preventDefault();close()});box.addEventListener('keydown',e=>e.stopPropagation());
 return {get open(){return box.open},show(id){return new Promise(resolve=>{finish=resolve;box.dataset.character=id;box.querySelector('.roster-face').className='roster-face '+id;box.querySelector('b').textContent=ROSTER[id].name+'・已解鎖';box.querySelector('p').textContent=id==='nightmare'?'哼，三次都撐過來了？惡夢超人已解鎖。下次進關可以選我……別誤會，我才不是特地來幫你的！':'四次了，還挺有毅力嘛。小天使已解鎖！下次進關選我，讓你看看什麼叫嘴上不饒人。可別拖我後腿唷！';box.showModal();box.querySelector('button').focus()})}};
}
