// 語系切換。中文原文就是鍵：t('中文') 在英文語系下回傳翻譯，找不到就回傳原文。
import EN from './lang_en.js';

const KEY = 'braveguy.lang';
const DICTS = { en: EN };
export const LANGS = [['zh-Hant', '中文'], ['en', 'English']];

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
  for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
  for (const el of document.querySelectorAll('[data-i18n-key]')) el.dataset.key = t(el.dataset.i18nKey);
  for (const el of document.querySelectorAll('[data-lang-toggle]')) {
    const next = LANGS[(LANGS.findIndex(([c]) => c === lang) + 1) % LANGS.length];
    el.textContent = '🌐 ' + next[1];
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
