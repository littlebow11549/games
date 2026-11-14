import { drawMinimapSprite, minimapArtReady } from '../../js/minimap-art.js';
let attempts = 0;
function draw() {
  if (!minimapArtReady()) {
    if (++attempts > 600) { document.getElementById('state').textContent = '來源圖載入失敗；遊戲會使用原圓點地圖。'; return; }
    requestAnimationFrame(draw); return;
  }
  for (const cv of document.querySelectorAll('canvas')) {
    const c = cv.getContext('2d');
    drawMinimapSprite(c, 'frame', 120, 120, 240);
    drawMinimapSprite(c, 'enemy', 75, 65, 10);
    drawMinimapSprite(c, 'elite', 120, 65, 17);
    drawMinimapSprite(c, 'boss', 165, 65, 26);
    for (let i = 0; i < 4; i++) drawMinimapSprite(c, 'hero', 65 + i * 37, 145, 26, i * Math.PI / 2);
  }
  document.getElementById('state').textContent = '已載入；箭頭依序為上、右、下、左。';
}
draw();
