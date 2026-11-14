// Isolated preview wrapper; gameplay and the normal index page stay unchanged.
const frame = document.getElementById('game');
const art = document.getElementById('art');
const status = document.getElementById('status');
let savedHidden = null;
function applyArt() {
  if (!frame.contentDocument?.body) return;
  frame.contentDocument.body.classList.toggle('art-preview', art.checked);
}
frame.addEventListener('load', () => {
  const doc = frame.contentDocument;
  const link = doc.createElement('link');
  link.rel = 'stylesheet'; link.href = 'css/art-preview.css';
  doc.head.append(link);
  savedHidden = null;
  document.getElementById('inspect').setAttribute('aria-pressed', 'false');
  applyArt();
  status.textContent = '原遊戲＋預覽樣式；可切回舊版';
});
art.addEventListener('change', applyArt);
document.getElementById('phone').addEventListener('click', (event) => {
  const narrow = frame.classList.toggle('phone');
  event.currentTarget.setAttribute('aria-pressed', String(narrow));
});
document.getElementById('inspect').addEventListener('click', (event) => {
  const doc = frame.contentDocument;
  if (!doc?.getElementById('hud')) return;
  const ids = ['hud', 'overlay', 'dialog', 'pause-menu'];
  if (!savedHidden) {
    savedHidden = ids.map(id => [id, doc.getElementById(id).hidden]);
    for (const id of ids) doc.getElementById(id).hidden = id !== 'hud';
    doc.body.classList.add('art-inspect');
    status.textContent = '僅檢視介面（不代表正在戰鬥）；再按可返回';
    event.currentTarget.setAttribute('aria-pressed', 'true');
  } else {
    for (const [id, hidden] of savedHidden) doc.getElementById(id).hidden = hidden;
    savedHidden = null;
    doc.body.classList.remove('art-inspect');
    status.textContent = '原遊戲＋預覽樣式；可切回舊版';
    event.currentTarget.setAttribute('aria-pressed', 'false');
  }
});
