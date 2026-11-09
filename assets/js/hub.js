/* Homepage only. Game languages are maintained separately. */
'use strict';
const COPY = {
 'zh-Hant': {
  brand:'遊戲中心',skip:'跳至主要內容',home:'遊戲中心首頁',nav:'主要導覽',collection:'遊戲收藏',play:'立即遊玩',featured:'本期精選',headline1:'記住光芒。',headline2:'突破極限。',intro:'跟隨寶石的閃耀，重現光的順序。用一場小挑戰，喚醒你的專注力。',start:'開始挑戰',explore:'探索遊戲',noDownload:'免下載，打開就能玩',bannerCaption:'記憶 × 專注 × 挑戰',devices:'手機・電腦皆適用',collectionIntro:'找到你的下一場小挑戰。',filterLabel:'依遊戲類型篩選',favorites:'最愛',all:'全部',puzzle:'益智',memory:'記憶',action:'動作',casual:'休閒',footer:'為每一個想玩一下的時刻。',description:'記住寶石的發光順序，重現你的完美記憶。',addFavorite:'加入最愛',removeFavorite:'移除最愛',emptyFavorites:'還沒有收藏。點選遊戲卡片上的愛心，將喜歡的遊戲加入最愛。',emptyCategory:'這個類型的新遊戲準備中，敬請期待。',favoriteAdded:'已加入最愛：',favoriteRemoved:'已移除最愛：',title:'遊戲中心',meta:'免下載的小遊戲收藏。挑戰 Memory Crash，探索你的記憶極限。',storageUnavailable:'瀏覽器無法儲存設定，本次選擇仍然有效。'
 },
 'zh-Hans': {
  brand:'游戏中心',skip:'跳至主要内容',home:'游戏中心首页',nav:'主导航',collection:'游戏收藏',play:'立即游玩',featured:'本期精选',headline1:'记住光芒。',headline2:'突破极限。',intro:'跟随宝石的闪耀，重现光的顺序。用一场小挑战，唤醒你的专注力。',start:'开始挑战',explore:'探索游戏',noDownload:'无需下载，打开就能玩',bannerCaption:'记忆 × 专注 × 挑战',devices:'手机・电脑均适用',collectionIntro:'找到你的下一场小挑战。',filterLabel:'按游戏类型筛选',favorites:'最爱',all:'全部',puzzle:'益智',memory:'记忆',action:'动作',casual:'休闲',footer:'为每一个想玩一下的时刻。',description:'记住宝石的发光顺序，重现你的完美记忆。',addFavorite:'加入最爱',removeFavorite:'移除最爱',emptyFavorites:'还没有收藏。点击游戏卡片上的爱心，将喜欢的游戏加入最爱。',emptyCategory:'这个类型的新游戏准备中，敬请期待。',favoriteAdded:'已加入最爱：',favoriteRemoved:'已移除最爱：',title:'游戏中心',meta:'无需下载的小游戏收藏。挑战 Memory Crash，探索你的记忆极限。',storageUnavailable:'浏览器无法保存设置，本次选择仍然有效。'
 },
 en: {
  brand:'Game Center',skip:'Skip to content',home:'Game Center home',nav:'Main navigation',collection:'Game collection',play:'Play now',featured:'FEATURED GAME',headline1:'Follow the light.',headline2:'Beat your limits.',intro:'Watch the gems glow. Repeat the sequence. Give your focus a little challenge and make your next move count.',start:'Start playing',explore:'Explore games',noDownload:'No downloads. Just play.',bannerCaption:'MEMORY × FOCUS × CHALLENGE',devices:'MOBILE & DESKTOP',collectionIntro:'Find your next little challenge.',filterLabel:'Filter games by category',favorites:'Favorites',all:'All games',puzzle:'Puzzle',memory:'Memory',action:'Action',casual:'Casual',footer:'For every “just one more game” moment.',description:'Remember the glowing gems. Repeat the sequence and test your memory.',addFavorite:'Add to favorites',removeFavorite:'Remove from favorites',emptyFavorites:'No favorites yet. Tap the heart on a game card to save it here.',emptyCategory:'New games in this category are on the way. Stay tuned.',favoriteAdded:'Added to favorites: ',favoriteRemoved:'Removed from favorites: ',title:'Game Center',meta:'A little collection of no-download games. Play Memory Crash and challenge your memory.',storageUnavailable:'Your browser cannot save settings. Your choices still work for this visit.'
 },
 ja: {
  brand:'ゲームセンター',skip:'本文へスキップ',home:'ゲームセンター ホーム',nav:'メインナビゲーション',collection:'ゲーム一覧',play:'今すぐプレイ',featured:'注目のゲーム',headline1:'光を覚えて。',headline2:'限界を超えよう。',intro:'宝石が光る順番を覚えて、同じ順番でタップ。小さな挑戦で、あなたの集中力を目覚めさせよう。',start:'挑戦する',explore:'ゲームを探す',noDownload:'ダウンロード不要ですぐ遊べる',bannerCaption:'記憶 × 集中 × 挑戦',devices:'スマートフォン・PC 対応',collectionIntro:'次の小さな挑戦を見つけよう。',filterLabel:'ゲームのジャンルで絞り込む',favorites:'お気に入り',all:'すべて',puzzle:'パズル',memory:'記憶',action:'アクション',casual:'カジュアル',footer:'「ちょっと遊びたい」すべての瞬間に。',description:'光る宝石の順番を覚えて再現。あなたの記憶力に挑戦しよう。',addFavorite:'お気に入りに追加',removeFavorite:'お気に入りから削除',emptyFavorites:'お気に入りはまだありません。ゲームのハートを押して追加しましょう。',emptyCategory:'このジャンルの新しいゲームを準備中です。お楽しみに。',favoriteAdded:'お気に入りに追加しました：',favoriteRemoved:'お気に入りから削除しました：',title:'ゲームセンター',meta:'ダウンロード不要のミニゲーム。Memory Crash で記憶力に挑戦しよう。',storageUnavailable:'ブラウザに設定を保存できません。この画面では引き続き利用できます。'
 },
 ko: {
  brand:'게임 센터',skip:'본문으로 건너뛰기',home:'게임 센터 홈',nav:'주 메뉴',collection:'게임 모음',play:'지금 플레이',featured:'추천 게임',headline1:'빛을 기억하고,',headline2:'한계를 넘어서.',intro:'보석이 빛나는 순서를 기억하고 그대로 따라 해 보세요. 작은 도전으로 집중력을 깨워 보세요.',start:'도전하기',explore:'게임 둘러보기',noDownload:'다운로드 없이 바로 플레이',bannerCaption:'기억 × 집중 × 도전',devices:'모바일 · PC 지원',collectionIntro:'다음 작은 도전을 찾아보세요.',filterLabel:'게임 장르별 필터',favorites:'즐겨찾기',all:'전체',puzzle:'퍼즐',memory:'기억력',action:'액션',casual:'캐주얼',footer:'잠깐의 여유를 게임으로 채워 보세요.',description:'빛나는 보석의 순서를 기억하고 따라 하며 기억력에 도전하세요.',addFavorite:'즐겨찾기에 추가',removeFavorite:'즐겨찾기에서 삭제',emptyFavorites:'아직 즐겨찾기가 없어요. 게임 카드의 하트를 눌러 추가해 보세요.',emptyCategory:'이 장르의 새 게임을 준비하고 있어요. 기대해 주세요.',favoriteAdded:'즐겨찾기에 추가됨: ',favoriteRemoved:'즐겨찾기에서 삭제됨: ',title:'게임 센터',meta:'다운로드 없이 즐기는 미니 게임. Memory Crash로 기억력에 도전하세요.',storageUnavailable:'브라우저에 설정을 저장할 수 없지만 현재 화면에서는 이용할 수 있어요.'
 },
 th: {
  brand:'ศูนย์รวมเกม',skip:'ข้ามไปยังเนื้อหา',home:'หน้าแรกศูนย์รวมเกม',nav:'เมนูหลัก',collection:'คลังเกม',play:'เล่นเลย',featured:'เกมแนะนำ',headline1:'จดจำแสงระยิบ',headline2:'ก้าวข้ามขีดจำกัด',intro:'จำลำดับการส่องแสงของอัญมณี แล้วแตะตามให้ถูกต้อง ปลุกสมาธิของคุณด้วยความท้าทายเล็ก ๆ',start:'เริ่มเล่น',explore:'สำรวจเกม',noDownload:'ไม่ต้องดาวน์โหลด เปิดแล้วเล่นได้เลย',bannerCaption:'ความจำ × สมาธิ × ความท้าทาย',devices:'เล่นได้ทั้งมือถือและคอมพิวเตอร์',collectionIntro:'ค้นพบความท้าทายครั้งต่อไป',filterLabel:'กรองเกมตามประเภท',favorites:'รายการโปรด',all:'ทั้งหมด',puzzle:'ปริศนา',memory:'ฝึกความจำ',action:'แอ็กชัน',casual:'เล่นเพลิน ๆ',footer:'เติมความสนุกให้ทุกช่วงเวลาที่อยากเล่น',description:'จำลำดับแสงของอัญมณี แล้วแตะตามเพื่อทดสอบความจำของคุณ',addFavorite:'เพิ่มในรายการโปรด',removeFavorite:'นำออกจากรายการโปรด',emptyFavorites:'ยังไม่มีเกมโปรด แตะหัวใจบนการ์ดเกมเพื่อเก็บเกมที่ชอบไว้ที่นี่',emptyCategory:'เกมใหม่ในหมวดนี้กำลังมา โปรดติดตาม',favoriteAdded:'เพิ่มในรายการโปรดแล้ว: ',favoriteRemoved:'นำออกจากรายการโปรดแล้ว: ',title:'ศูนย์รวมเกม',meta:'รวมมินิเกมที่เล่นได้โดยไม่ต้องดาวน์โหลด ท้าทายความจำกับ Memory Crash',storageUnavailable:'เบราว์เซอร์บันทึกการตั้งค่าไม่ได้ แต่ยังใช้งานตัวเลือกได้ในครั้งนี้'
 }
};
const LANGUAGE_KEY='gamehub_language';
const FAVORITES_KEY='gamehub_favorites';
const GAMES=[{id:'memory-crash',folder:'01_memory_crash',name:'Memory Crash',descriptionKey:'description',icon:'01_memory_crash/assets/source/pic/branding/icon_01.png',categories:['puzzle','memory'],status:'ready'}];
const grid=document.getElementById('grid');
const status=document.getElementById('result-status');
const select=document.getElementById('language');
let activeFilter='all';
let storageFailed=false;
function readStorage(key){try{return localStorage.getItem(key);}catch{return null;}}
function saveStorage(key,value){try{localStorage.setItem(key,value);return true;}catch{storageFailed=true;return false;}}
function initialLanguage(){
 const saved=readStorage(LANGUAGE_KEY);
 if(Object.hasOwn(COPY,saved))return saved;
 for(const requested of navigator.languages||[navigator.language]){
  const code=(requested||'').toLowerCase();
  if(code.startsWith('zh'))return /hans|cn|sg/.test(code)?'zh-Hans':'zh-Hant';
  const base=code.split('-')[0];if(Object.hasOwn(COPY,base))return base;
 }
 return 'zh-Hant';
}
let language=initialLanguage();
let favorites=new Set();
try{const stored=JSON.parse(readStorage(FAVORITES_KEY)||'[]');if(Array.isArray(stored))favorites=new Set(stored.filter(id=>GAMES.some(game=>game.id===id)));}catch{/* Corrupt storage falls back to no favorites. */}
function text(key){return COPY[language][key]||COPY['zh-Hant'][key]||key;}
function renderGames(message=''){
 grid.replaceChildren();
 const ready=GAMES.filter(game=>game.status==='ready');
 const visible=ready.filter(game=>activeFilter==='all'||(activeFilter==='favorites'?favorites.has(game.id):game.categories.includes(activeFilter)));
 document.getElementById('game-count').textContent=String(visible.length).padStart(2,'0');
 document.getElementById('favorite-count').textContent=String(ready.filter(game=>favorites.has(game.id)).length);
 status.textContent=message||(visible.length?'':text(activeFilter==='favorites'?'emptyFavorites':'emptyCategory'));
 if(storageFailed)status.textContent+=' '+text('storageUnavailable');
 visible.forEach(game=>{
  const card=document.createElement('article');card.className='game-card';card.dataset.gameId=game.id;
  const cover=document.createElement('a');cover.className='game-cover';cover.href=game.folder+'/';cover.tabIndex=-1;cover.setAttribute('aria-hidden','true');
  const image=document.createElement('img');image.className='game-icon';image.src=game.icon;image.alt='';image.width=106;image.height=106;image.loading='lazy';cover.append(image);
  const favorite=document.createElement('button');favorite.className='favorite-button';favorite.type='button';favorite.dataset.favoriteId=game.id;
  const isFavorite=favorites.has(game.id);favorite.setAttribute('aria-pressed',String(isFavorite));favorite.setAttribute('aria-label',`${text(isFavorite?'removeFavorite':'addFavorite')} — ${game.name}`);
  favorite.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>';
  favorite.addEventListener('click',()=>{
   const adding=!favorites.has(game.id);if(adding)favorites.add(game.id);else favorites.delete(game.id);
   saveStorage(FAVORITES_KEY,JSON.stringify([...favorites]));
   renderGames(text(adding?'favoriteAdded':'favoriteRemoved')+game.name);
   const replacement=grid.querySelector(`[data-favorite-id="${game.id}"]`);
   (replacement||document.querySelector('[data-filter="favorites"]')).focus({preventScroll:true});
  });
  const body=document.createElement('div');body.className='game-body';
  const tags=document.createElement('div');tags.className='tags';
  game.categories.forEach(category=>{const tag=document.createElement('span');tag.className='tag';tag.textContent=text(category);tags.append(tag);});
  const heading=document.createElement('div');heading.className='game-title';
  const title=document.createElement('h3');const link=document.createElement('a');link.href=game.folder+'/';link.textContent=game.name;link.setAttribute('aria-label',`${text('play')} — ${game.name}`);title.append(link);
  const arrow=document.createElement('span');arrow.className='card-arrow';arrow.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 18 18 6M6 6h12v12"/></svg>';arrow.setAttribute('aria-hidden','true');heading.append(title,arrow);
  const description=document.createElement('p');description.textContent=text(game.descriptionKey);body.append(tags,heading,description);card.append(cover,favorite,body);grid.append(card);
 });
 // Keep one complete desktop row. Empty slots represent unbuilt games, never playable links.
 const slots=Math.max(4,Math.ceil(visible.length/4)*4);
 for(let i=visible.length;i<slots;i++){const empty=document.createElement('div');empty.className='empty-slot';empty.setAttribute('aria-hidden','true');grid.append(empty);}
}
function applyLanguage(){
 document.documentElement.lang=language;select.value=language;document.title=text('title');
 document.querySelector('meta[name="description"]').content=text('meta');
 document.querySelectorAll('[data-i18n]').forEach(node=>{node.textContent=text(node.dataset.i18n);});
 document.querySelectorAll('[data-i18n-aria]').forEach(node=>{node.setAttribute('aria-label',text(node.dataset.i18nAria));});
 renderGames();
}
select.addEventListener('change',()=>{language=Object.hasOwn(COPY,select.value)?select.value:'zh-Hant';saveStorage(LANGUAGE_KEY,language);applyLanguage();});
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
 activeFilter=button.dataset.filter;
 document.querySelectorAll('[data-filter]').forEach(item=>{const selected=item===button;item.classList.toggle('selected',selected);item.setAttribute('aria-pressed',String(selected));});
 renderGames();
}));
applyLanguage();
