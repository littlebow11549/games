import { assetPath, logicalAssetPath } from './asset-paths.js';
import { words } from './run-records.js?v=20261120assets';
import { lang } from './i18n.js?v=20261120assets';
import { CHARACTER_ART } from './character-art-data.js?v=20261120nightdialogue';

let manifestPromise;
const gameplayLoads = new Map();
const decoded = new Set(), inFlight = new Map();
const mode = new URLSearchParams(location.search).get('skillStyle');
const atlasStyle = mode === 'legacy' || CHARACTER_ART.reviewStyles.includes(mode) ? mode : CHARACTER_ART.defaultStyle;
const legacyReplaced = /\/(btn_attack_sheet|btn_dodge_transform_sheet|skill_buttons_sheet|btn_transform_courage_gem)\.webp$/;
const menuArtwork = /\/branding\/|language_globe|panel_popup|panel_title_plate|btn_text|difficulty_sheet|portrait_student|\/concept\/(angel|ganqiao)_front\.webp/;
const tagFor = code => code === 'zh-Hant' ? 'zh' : code;
const langOf = path => path.match(/_(en|zh|ja)\.webp$/)?.[1];
const artFor = id => CHARACTER_ART.characters[id] || CHARACTER_ART.characters.brave;

export function imagePlan(manifest, {scope = 'boot', locale = lang, portrait = matchMedia('(orientation:portrait)').matches, character = 'brave', style = atlasStyle} = {}) {
  const tag = tagFor(locale);
  const urls = new Set();
  for (const physical of manifest) {
    const path = logicalAssetPath(physical);
    const variant = langOf(path);
    if (variant && variant !== tag) continue;
    if (path.includes('/cinematics/')) continue;
    if (path.includes('/sheet/unified/') && !path.endsWith('/sheet_worker.webp')) continue;
    if (path.includes('/branding/') && !path.endsWith('/logo_01.webp') &&
        !(tag === 'ja' && path.endsWith('/logo_ja.webp')) &&
        !path.endsWith(portrait ? '/menu_keyart_portrait_01.webp' : '/menu_keyart_01.webp')) continue;
    if (scope === 'boot' && !menuArtwork.test(path)) continue;
    if (scope === 'game' && style === 'classic2d' && legacyReplaced.test(path)) continue;
    if (scope === 'game' && character !== 'brave' && path.includes('/transform/')) continue;
    urls.add(assetPath(path));
  }
  if (scope === 'game') {
    const skill = artFor(character).skills[style]?.runtime;
    // Player's actual button atlas and name art are required before first combat input.
    // Keep the angel's regular dialogue ready too; she speaks regardless of the roster pick.
    for (const path of [skill, artFor(character).titles.runtime, artFor('angel').titles.runtime].filter(Boolean)) {
      urls.delete(path);
    }
    return [...new Set([skill, artFor(character).titles.runtime, artFor('angel').titles.runtime, ...urls].filter(Boolean))];
  }
  return [...urls];
}

function decodeImage(url, priority = 'auto') {
  if (decoded.has(url)) return Promise.resolve();
  if (inFlight.has(url)) return inFlight.get(url);
  const img = new Image();
  img.fetchPriority = priority;
  const request = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      img.removeAttribute('src');
      reject(new Error('Image decode timed out'));
    }, 25000);
    img.src = url;
    img.decode().then(() => {
      if (!img.naturalWidth) throw new Error('Empty image');
      resolve();
    }).catch(reject).finally(() => clearTimeout(timeout));
  }).then(() => { decoded.add(url); }).finally(() => { inFlight.delete(url); });
  inFlight.set(url, request);
  return request;
}

// Warm the shared boss title atlas during the stage intro, not boot.
export function warmCharacterTitles(character) {
  return decodeImage(artFor(character).titles.runtime).catch(() => {});
}

export async function preloadImages(report = () => {}, scope = 'boot', character = 'brave') {
  if (!manifestPromise) manifestPromise = fetch('assets/runtime-images.json?v=20261120assets')
    .then(r => { if (!r.ok) throw new Error('Image manifest unavailable'); return r.json(); })
    .catch(error => { manifestPromise = null; throw error; });
  const urls = imagePlan(await manifestPromise, {scope, character}).filter(url => !decoded.has(url));
  let next = 0, done = 0, failure = null;
  async function worker() {
    while (!failure && next < urls.length) {
      const url = urls[next++];
      try { await decodeImage(url); }
      catch {
        failure = new Error(words(lang, '圖片載入失敗，請重試：', 'Image failed. Please retry: ', '画像の読み込みに失敗。再試行：') + url);
        return;
      }
      report(++done, urls.length);
    }
  }
  await Promise.all(Array.from({length: Math.min(urls.length, 3)}, worker));
  if (failure) throw failure;
}

// Only one background pack at a time; it must not compete with the active locale.
export function preloadLanguage(code) {
  if (!manifestPromise) return;
  manifestPromise.then(async all => {
    const tag = tagFor(code);
    for (const physical of all) {
      if (lang !== code) break;
      const path = logicalAssetPath(physical);
      if (langOf(path) !== tag || path.includes('/cinematics/')) continue;
      await decodeImage(assetPath(path), 'low').catch(() => {});
    }
  }).catch(() => {});
}

let gateId=0;
export function waitForArtwork(task,done){
 const id=++gateId,root=document.getElementById('boot-scene'),retry=document.getElementById('boot-retry');root.hidden=false;
 document.getElementById('boot-caption').textContent=words(lang,'正在準備畫面素材…','Preparing artwork…','画面の画像を準備中…');
 document.getElementById('boot-percent').textContent='';document.getElementById('boot-fill').style.transform='scaleX(0)';retry.hidden=true;
 const attempt=async()=>{retry.hidden=true;try{await task();if(id!==gateId)return;root.hidden=true;retry.onclick=()=>location.reload();done();}catch{if(id!==gateId)return;document.getElementById('boot-caption').textContent=words(lang,'圖片尚未就緒，請重試。','Artwork is not ready. Please retry.','画像を読み込めません。再試行してください。');retry.hidden=false;retry.onclick=attempt;}};attempt();
}
export function cancelArtwork(){gateId++;const root=document.getElementById('boot-scene');if(window.__booted)root.hidden=true;}

const gameplayKey = character => `${character}:${lang}:${atlasStyle}`;
export const gameplayIsReady = (character = 'brave') => gameplayLoads.get(gameplayKey(character))?.ready === true;
export function prepareGameplay(character = 'brave') {
  const key = gameplayKey(character);
  if (!gameplayLoads.has(key)) {
    const entry = {ready:false};
    entry.promise = preloadImages((done,total) => {
      document.getElementById('boot-fill').style.transform = `scaleX(${done/total})`;
      document.getElementById('boot-percent').textContent = `${done}/${total}`;
    }, 'game', character).then(() => { entry.ready = true; })
      .catch(error => { gameplayLoads.delete(key); throw error; });
    gameplayLoads.set(key, entry);
  }
  return gameplayLoads.get(key).promise;
}
