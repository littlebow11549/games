// 語系切換。中文原文就是鍵：t('中文') 在英文語系下回傳翻譯，找不到就回傳原文。
import EN from './lang_en.js?v=20261116dialog';
import JA from './lang_ja.js?v=20261116dialog';

const KEY = 'braveguy.lang';
const DICTS = { en: EN, ja: JA };
export const LANGS = [['zh-Hant', '中文'], ['en', 'English'], ['ja', '日本語']];

function initial() {
  const q = new URLSearchParams(location.search).get('lang');
  if (q && (q === 'zh-Hant' || DICTS[q])) return q;
  try { const s = localStorage.getItem(KEY); if (s === 'zh-Hant' || DICTS[s]) return s; } catch { /* 讀不到就用預設 */ }
  return 'zh-Hant'; // 預設中文；玩家自己切換後會記住
}
export let lang = initial();

export function t(text) {
  const d = DICTS[lang];
  return (d && d[text]) || text;
}
// 帶參數的句子：tf('第 {0} 波', 3)
export function tf(text, ...args) {
  return t(text).replace(/\{(\d)\}/g, (_, i) => args[+i]);
}
// 把 HTML 裡標了 data-i18n 的元素換成目前語系
export function applyStatic() {
  document.documentElement.lang = lang;
  document.title = t('勇氣超人') + ' · Brave Guy';
  for(const el of document.querySelectorAll('[data-i18n-aria]')) el.setAttribute('aria-label',t(el.dataset.i18nAria));
  for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
  for (const el of document.querySelectorAll('[data-i18n-key]')) el.dataset.key = t(el.dataset.i18nKey);
  // 語系鍵：兩種語言並排，目前的那個亮起來；點一下換成另一個
  for (const el of document.querySelectorAll('[data-lang-toggle]')) {
    el.replaceChildren();
    el.append(document.createElement('i'));
    for (const [code, label] of LANGS) {
      const chip = document.createElement('span');
      chip.textContent = label;
      chip.dataset.lang = code;
      chip.classList.toggle('on', code === lang);
      el.append(chip);
    }
    el.setAttribute('aria-label', 'Language / 語言');
  }
}
export function setLang(code) {
  lang = code;
  try { localStorage.setItem(KEY, code); } catch { /* 存不了也沒關係 */ }
  applyStatic();
}
export function nextLang() {
  setLang(LANGS[(LANGS.findIndex(([c]) => c === lang) + 1) % LANGS.length][0]);
}
