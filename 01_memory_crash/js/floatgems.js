/* 漂浮動態寶石：用現成 gems_01.png（4×3 共 12 顆）sprite，
   在首頁/選單背景飄動。純 transform/opacity 動畫，效能友善。 */
(function () {
  // 預設散佈於左右側帶與上方角落，避開中央主角與面板
  const LAYOUT = [
    { x: 6,  y: 30, s: 48, d: 7.0,  delay: 0.0, g: 0,  amp: 16, rot: 8 },
    { x: 12, y: 52, s: 34, d: 9.0,  delay: 1.2, g: 3,  amp: 22, rot: -10 },
    { x: 8,  y: 72, s: 42, d: 8.0,  delay: 0.6, g: 7,  amp: 18, rot: 12 },
    { x: 17, y: 88, s: 30, d: 10.0, delay: 2.0, g: 10, amp: 20, rot: -8 },
    { x: 88, y: 28, s: 44, d: 8.0,  delay: 0.4, g: 1,  amp: 18, rot: -12 },
    { x: 92, y: 50, s: 32, d: 9.5,  delay: 1.6, g: 5,  amp: 24, rot: 10 },
    { x: 85, y: 70, s: 46, d: 7.5,  delay: 0.9, g: 8,  amp: 16, rot: -9 },
    { x: 90, y: 87, s: 30, d: 10.5, delay: 2.4, g: 11, amp: 20, rot: 11 },
    { x: 22, y: 15, s: 28, d: 9.0,  delay: 1.0, g: 2,  amp: 20, rot: 14 },
    { x: 78, y: 13, s: 30, d: 8.5,  delay: 1.8, g: 6,  amp: 22, rot: -14 },
    { x: 4,  y: 13, s: 26, d: 11.0, delay: 0.3, g: 9,  amp: 18, rot: 9 },
    { x: 96, y: 11, s: 26, d: 10.0, delay: 2.1, g: 4,  amp: 18, rot: -11 },
  ];

  function spritePos(i) {
    // 與 game.js buildBoard 相同的切圖座標（background-size:400% 300%）
    return `${(i % 4) * 100 / 3}% ${Math.floor(i / 4) * 50}%`;
  }

  function fill(container) {
    if (container.dataset.filled) return;
    container.dataset.filled = "1";
    const frag = document.createDocumentFragment();
    LAYOUT.forEach((c) => {
      const el = document.createElement("span");
      el.className = "fg";
      el.style.left = c.x + "%";
      el.style.top = c.y + "%";
      el.style.width = c.s + "px";
      el.style.height = c.s + "px";
      el.style.backgroundPosition = spritePos(c.g);
      el.style.setProperty("--amp", c.amp + "px");
      el.style.setProperty("--rot", c.rot + "deg");
      el.style.animationDuration = c.d + "s";
      el.style.animationDelay = "-" + c.delay + "s";
      frag.appendChild(el);
    });
    container.appendChild(frag);
  }

  function init() {
    document.querySelectorAll("[data-float-gems]").forEach(fill);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
