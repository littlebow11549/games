import { createVictoryStoryboard } from './victory-storyboard.js?v=20261118seal2';
import { createPictureFilm } from './picture-film.js?v=20261118seal2';
import { waitForArtwork, cancelArtwork } from './loading.js?v=20261118seal2';
import { words } from './run-records.js?v=20261118seal2';
import { BOSS_BANTER } from './boss-banter.js?v=20261118seal2';
import { BOSS_STORYBOARDS, createBossStoryboard } from './boss-storyboards.js?v=20261118seal2';
import { t, lang } from './i18n.js?v=20261118seal2';
export const BOSS_PROFILES = {
 jiamangKing:['假忙森主管','jiamang','#71dfdc','papers','你的鍋，接回去！','zhuangxiong'],
 qianBiz:['錢經理','qian','#ffd84d','coins','妳的帳，別算在我頭上。','qian'],
 folaidiKing:['佛賴弟王','boss','#bda8ff','mist','再五分鐘啦～','laichuang'],
 qian:['錢大姐','qian','#ffd84d','coins','先付錢，再談勇氣。','qian'],
 lan:['藍教頭','lan','#49cfff','slash','站直！你還差得遠！','lan'],
 nightmare:['惡夢超人','nightmare','#bb63ff','mirror','你真的以為自己辦得到？','nightmare'],
 midKing:['特大隻的悶幹譙','midKing','#b9a5ff','impact','有種就別再忍！','ganqiao'],
 hell:['地獄超人','hell','#ff6938','inferno','讓你的罪惡感燒個夠！','hell'],
 kabanKing:['加班鬼王','kabanKing','#62ddcc','papers','再五分鐘就好～','laichuang'],
 xinji:['新雞','xinji','#ffe459','feathers','這可不是我的錯喔。','xinji'],
 baguashe:['八卦蛇','baguashe','#ee8ce3','coil','大家都在說你呢。','baguashe'],
 lanMgr:['藍經理','lanMgr','#69aaff','stamp','你的努力，我再看看。','lan'],
 ganqiaoFull:['幹譙龍','ganqiaoFull','#ffad40','quake','忍到現在，該爆發了吧！','ganqiao'],
 guan:['冠老闆','guan','#ffe9a2','crown','在這裡，我說了算。','guanlaoban'],
 incubus:['夢魘超人','incubus','#a6ffb5','fracture','不抱期待，就不會失望。','incubus'],
};
const endingLines = [
 ['','我終於找回自己了。'],
 ['佛賴弟王／錢大姐／藍教頭','哼，總算站起來了。掌聲可不是免費的！'],
 ['惡夢超人／悶幹譙／地獄超人','別得意。以後照樣會怕、會痛、會失敗！'],
 ['加班鬼王／新雞／八卦蛇','拍拍手而已，明天還不是得面對爛事。'],
 ['藍經理／幹譙龍／冠老闆／夢魘超人','算你有種。領帶還是歪的，別以為我們不會再來！'],
 ['主角','我知道。你們可以繼續說。我的路，我自己走。'],
 ['','真正的強大，是不再把自己交給別人的聲音。'],
];
const roles=['企劃・導演','故事・角色設計','美術・動畫','程式・遊戲設計','音樂・音效','測試・製作'];
const AWAKENING_SHOTS=[
 {file:'awakening_armor_a',row:0,duration:2.4,sound:'guilt_crack',role:'boss',line:['你以為，這就是我的全部？','You think this is all I am?','これが俺のすべてだと思ったか？']},
 {file:'awakening_armor_a',row:1,duration:1.1,sound:'tf_glove',role:'boss',line:['你每一次退縮，都成了我的鎧甲。','Every retreat became my armor.','お前が逃げるたび、俺の鎧になった。']},
 {file:'awakening_armor_a',row:2,duration:1.2,sound:'tf_jacket',role:'boss',line:['你每一次退縮，都成了我的鎧甲。','Every retreat became my armor.','お前が逃げるたび、俺の鎧になった。']},
 {file:'awakening_armor_b',row:0,duration:1.4,sound:'tf_hair',role:'boss',line:['你的恐懼，就是核心。','Your fear powers the core.','お前の恐怖が、この核を動かす。']},
 {file:'awakening_armor_b',row:1,duration:3,sound:'ui_back',role:'hero',line:['變身的時候我能偷襲嗎？','Can I sneak-attack while you transform?','変身中に不意打ちしてもいい？']},
 {file:'awakening_armor_a',row:2,duration:.65,sound:'transform_charge',role:'boss',line:['……你能不能尊重一下流程？','…Could you respect the process?','……手順を尊重してくれないか？']},
 {file:'awakening_armor_b',row:2,duration:3.8,sound:'guilt_burst',role:'boss',line:['現在，看看你還敢不敢往前。','Now, dare to take another step.','さあ、それでも前に進めるか。']}
];
export const AWAKENING_DURATION=AWAKENING_SHOTS.reduce((n,s)=>n+s.duration,0);

// 第一階段打完：勇氣超人一拳把董事長打倒的三格過場（用 incubus_firststrike 圖集，接在甦醒鎧甲過場之前）
const FIRSTSTRIKE_SHOTS=[
 {file:'incubus_firststrike',row:0,duration:2.2,sound:'boss_warn',role:'boss',line:['你真以為，打倒我就結束了？','You think beating me down ends it?','俺を倒せば終わると思ったか？']},
 {file:'incubus_firststrike',row:1,duration:1.5,sound:'hit_heavy',role:'hero',line:['這一拳，連本帶利還你！','This one is for everything — with interest!','この一撃、利子つきで返す！']},
 {file:'incubus_firststrike',row:2,duration:2.6,sound:'boss_slam',role:'hero',line:['站起來。我不會再退了。','Get up. I won’t back down again.','立て。もう引かない。']}
];
const FIRSTSTRIKE_DURATION=FIRSTSTRIKE_SHOTS.reduce((n,s)=>n+s.duration,0);
export function createCinematics(_renderer,audioProvider){
 const root=document.createElement('section');root.id='cinema';root.hidden=true;root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');
 root.innerHTML='<div class="cinema-lines" aria-hidden="true"></div><div class="cinema-top"><span class="cinema-kicker"></span><button class="cinema-skip"></button></div><div class="cinema-caption"><h2></h2><p></p></div><div class="cinema-progress"><i></i></div><div class="cinema-credits" hidden></div>';
 document.body.append(root);const storyboard=createBossStoryboard(root,audioProvider),victoryArt=createVictoryStoryboard(root),film=createPictureFilm(root);
 const $=q=>root.querySelector(q),skip=$('.cinema-skip'),title=$('.cinema-caption h2'),subtitle=$('.cinema-caption p'),credits=$('.cinema-credits');
 let active=null,elapsed=0,previousFocus=null;
 function cancel(){cancelArtwork();storyboard.stop();victoryArt.stop();film.stop();active=null;root.hidden=true;root.classList.remove('banter-hit','awakening-impact');for(const key of ['speaker','act','awakeningShot','defeatShot'])delete root.dataset[key];document.body.classList.remove('in-cinematic');previousFocus?.focus?.({preventScroll:true});}
 function finish(){const done=active?.done;cancel();done?.();}
 function base(mode,duration,done){cancel();previousFocus=document.activeElement;active={mode,duration,done,beat:-1};elapsed=0;root.hidden=false;root.dataset.mode=mode;root.dataset.dialogueTone='normal';document.body.classList.add('in-cinematic');credits.hidden=true;title.hidden=subtitle.hidden=false;title.className='cinema-name system-lettering';skip.textContent=t('跳過');skip.focus({preventScroll:true});root.setAttribute('aria-label',words(lang,'圖片過場','Illustrated cinematic','イラスト演出'));}
 function line(beat,speaker,text,role='boss',impact=false,sound){
  root.dataset.speaker=role;title.textContent=speaker;subtitle.textContent=text;
  if(active.beat===beat)return;active.beat=beat;root.dataset.dialogueTone=impact?'impact':'normal';root.classList.remove('banter-hit');void root.offsetWidth;root.classList.add('banter-hit');if(sound)audioProvider()?.sfx(sound);
 }
 function boss(kinds,done){waitForArtwork(()=>storyboard.prepare(kinds),()=>{base('boss',kinds.reduce((n,k)=>n+BOSS_STORYBOARDS[k].duration,0),done);active.kinds=kinds;active.index=-1;$('.cinema-kicker').textContent=t('心魔來襲');});}
 function victory(kinds,done){waitForArtwork(()=>victoryArt.prepare(kinds),()=>{base('victory',6,done);victoryArt.start(kinds);root.style.setProperty('--cinema-color','#caff69');$('.cinema-kicker').textContent=words(lang,'勇氣・終結一擊','COURAGE · FINAL STRIKE','勇気・最後の一撃');});}
 function awakening(done){waitForArtwork(()=>film.prepare(['awakening_armor_a','awakening_armor_b']),()=>{base('awakening',AWAKENING_DURATION,done);film.start();audioProvider()?.stopLoops?.();audioProvider()?.duckBgm?.(.25);root.style.setProperty('--cinema-color','#a6ff70');$('.cinema-kicker').textContent=words(lang,'夢魘・最終昇華','INCUBUS · FINAL ASCENSION','インキュバス・最終覚醒');});}
 function firstStrike(done){waitForArtwork(()=>film.prepare(['incubus_firststrike']),()=>{base('firststrike',FIRSTSTRIKE_DURATION,done);film.start();audioProvider()?.duckBgm?.(.3);root.style.setProperty('--cinema-color','#caff69');$('.cinema-kicker').textContent=words(lang,'勇氣・第一擊','COURAGE · FIRST STRIKE','勇気・一撃');});}
 function defeat(done){waitForArtwork(()=>film.prepare(['defeat_storyboard','defeat_retry']),()=>{base('defeat',10,done);film.start();audioProvider()?.playBgm('bgm_defeat');audioProvider()?.sfx('lose');root.style.setProperty('--cinema-color','#c5abec');$('.cinema-kicker').textContent=words(lang,'迷失的結局','A LOST ENDING','迷いの結末');});}
 const prepareEnding=()=>film.prepare(['ending_applause_final']);
 function ending(done){waitForArtwork(prepareEnding,()=>{base('ending',36.5,done);film.start();audioProvider()?.playBgm('bgm_ending');root.style.setProperty('--cinema-color','#ffdf79');$('.cinema-kicker').textContent=t('找回自己');credits.replaceChildren();const heading=document.createElement('h2');heading.textContent='STAFF';credits.append(heading);for(const role of roles){const row=document.createElement('p'),label=document.createElement('span'),name=document.createElement('strong');label.textContent=t(role);name.textContent='LilinS';row.append(label,name);credits.append(row);}const thanks=document.createElement('p');thanks.className='credits-thanks';thanks.textContent=t('謝謝你，走到了這裡。');credits.append(thanks);});}
 skip.addEventListener('click',()=>{if(active?.mode==='ending'&&elapsed<31.5){elapsed=31.5;update(0);}else finish();});
 addEventListener('keydown',e=>{if(!active)return;if(['Escape','Space','Enter'].includes(e.code)){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)skip.click();}else if(e.code==='Tab'){e.preventDefault();skip.focus();}},true);
 function update(dt){
  if(!active)return false;if(!document.hidden)elapsed+=dt;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(active.mode==='boss'){
   let index=0,start=0;while(index<active.kinds.length-1&&elapsed>=start+BOSS_STORYBOARDS[active.kinds[index]].duration){start+=BOSS_STORYBOARDS[active.kinds[index++]].duration;}
   const key=active.kinds[index],profile=BOSS_PROFILES[key];if(active.index!==index){active.index=index;storyboard.start(key);root.dataset.motif=profile[3];root.style.setProperty('--cinema-color',profile[2]);}
   storyboard.render(elapsed-start,reduced,profile[2]);const beat=Number(root.dataset.beat),role=beat===1?'hero':'boss';line(index*3+beat,t(beat===1?'主角':profile[0]),words(lang,...BOSS_BANTER[key][beat]),role,beat===2,beat===1?'hit_2':'hit_heavy');
  }else if(active.mode==='victory'){
   const beat=Math.min(2,Math.floor(elapsed/2));victoryArt.render(elapsed,reduced);const lines=[['這一次，換我說了算！','My turn to call the shots!','今度は俺が決める！'],['把你的廢話，全都打回去！','Take your excuses back!','その言い訳、全部返す！'],['我還會害怕，但我不會再退。','I still feel fear. I will not back down.','怖くても、もう引かない。']];line(beat,t('主角'),words(lang,...lines[beat]),'hero',beat===1,beat===2?'boom':'hit_heavy');
  }else if(active.mode==='awakening'){
   let index=0,start=0;while(index<AWAKENING_SHOTS.length-1&&elapsed>=start+AWAKENING_SHOTS[index].duration)start+=AWAKENING_SHOTS[index++].duration;
   const shot=AWAKENING_SHOTS[index],local=elapsed-start,burst=index===6,impact=burst?Math.max(0,1-local/1.1):index===1||index===2?Math.max(0,1-local/.3):0;
   root.dataset.awakeningShot=String(index);root.dataset.shot=burst?'ascension':'assembly';
   if(active.beat!==index&&burst){root.classList.remove('awakening-impact');void root.offsetWidth;root.classList.add('awakening-impact');audioProvider()?.sfx('boss_slam');}
   film.render([shot],elapsed,{reduced,impact,dark:index===5?.75:0,flash:burst?Math.max(0,.65-local*2):0,color:'#a6ff70',zoom:burst&&!reduced?1+Math.max(0,.08-local*.12):1});
   line(index,t(shot.role==='hero'?'主角':'夢魘超人'),words(lang,...shot.line),shot.role,burst,shot.sound);
  }else if(active.mode==='firststrike'){
   let index=0,start=0;while(index<FIRSTSTRIKE_SHOTS.length-1&&elapsed>=start+FIRSTSTRIKE_SHOTS[index].duration)start+=FIRSTSTRIKE_SHOTS[index++].duration;
   const shot=FIRSTSTRIKE_SHOTS[index],local=elapsed-start,impact=index===1?Math.max(0,1-local/.4):0;
   film.render([shot],elapsed,{reduced,impact,color:'#caff69',zoom:index===1&&!reduced?1+Math.max(0,.06-local*.1):1});
   line(index,t(shot.role==='hero'?'主角':'夢魘超人'),words(lang,...shot.line),shot.role,index===1,shot.sound);
  }else if(active.mode==='defeat'){
   const beat=elapsed<2?0:elapsed<4?1:elapsed<7?2:3;root.dataset.defeatShot=String(beat);film.render([beat===3?{file:'defeat_retry',rows:1,row:0}:{file:'defeat_storyboard',row:beat}],elapsed,{reduced,color:beat===3?'#baff66':'#b39acf'});
   const lines=[['他的勇氣，碎在恐懼面前。','His courage shattered before fear.','彼の勇気は、恐怖の前に砕けた。'],['他縮回角落，變成了只會逃避的懦夫。','He cowered in a corner, running from everything.','隅で震え、何もかもから逃げる臆病者に。'],['娘炮與懦夫……這就是放棄後的我？','A sissy and a coward… Is this who I become if I quit?','なよなよした臆病者……諦めた先の俺なのか？'],['我不甘心，我還要再試一次！','I refuse to give up. Let me try again!','諦められない。もう一度挑戦する！']];line(beat,beat>=2?t('主角'):words(lang,'如果就此放棄','IF YOU GIVE UP','ここで諦めたら'),words(lang,...lines[beat]),beat>=2?'hero':'boss',false,beat===3?'courage_full':'guilt_tick');
  }else{
   const index=Math.min(6,Math.floor(elapsed/4.5)),staff=elapsed>=31.5;root.dataset.act=staff?'credits':String(index);
   if(staff){film.stop();title.hidden=subtitle.hidden=true;if(!active.credits){active.credits=true;credits.hidden=false;audioProvider()?.stopCelebration?.();audioProvider()?.playBgm('bgm_credits');$('.cinema-kicker').textContent='STAFF';}credits.style.transform=reduced?'none':`translateY(${innerHeight-(elapsed-31.5)/5*(innerHeight+credits.offsetHeight+30)}px)`;}
   else{film.render([{file:'ending_applause_final',row:0,rows:1}],elapsed,{reduced,color:'#ffe5a0'});line(index,t(endingLines[index][0]||'找回自己'),t(endingLines[index][1]),index===0||index>=5?'hero':'boss');if(elapsed>=4.5&&!active.cheered){active.cheered=true;audioProvider()?.sfx('victory_human_cheer');}}
  }
  $('.cinema-progress i').style.transform=`scaleX(${Math.min(1,elapsed/active.duration)})`;
  if(elapsed>=active.duration)finish();return true;
 }
 return{boss,victory,defeat,awakening,firstStrike,ending,cancel,update,prepareEnding,prepareBoss:storyboard.prepare,get active(){return Boolean(active);},get state(){return active?{mode:active.mode,elapsed,duration:active.duration,cast:0}:null;}};
}
