/* 漂浮動態寶石：用現成 gems_01.png（4×3 共 12 顆）sprite。
   自然散佈、有遠近大小（景深）：近景大而清晰、遠景小而透明微模糊。
   座標 x/y 為「中心點」百分比（CSS 以 translate(-50%,-50%) 置中）。 */
(function () {
  // 三層景深：near 大而清晰、mid 中等、far 小而透明且微模糊
  // 散佈在左右側帶與角落，避開中央主角/面板；左右視覺重量大致平衡但不對稱
  const LAYOUT = [
    // 近景（大、清晰、靠前）— 大小對比強、位置不規則
    { x: 3,  y: 42, s: 214, g: 0,  op: 1,   blur: 0,   amp: 16, rot: 6,  d: 7.6, delay: 0.0 },
    { x: 95, y: 57, s: 196, g: 8,  op: 1,   blur: 0,   amp: 22, rot: -9, d: 8.5, delay: 1.1 },
    { x: 13, y: 78, s: 158, g: 10, op: 0.96,blur: 0,   amp: 13, rot: -7, d: 9.1, delay: 0.5 },
    // 中景 — 高低錯落、不對齊
    { x: 88, y: 19, s: 138, g: 1,  op: 0.92,blur: 0,   amp: 24, rot: 11, d: 8.0, delay: 1.9 },
    { x: 24, y: 17, s: 108, g: 2,  op: 0.86,blur: 0.3, amp: 20, rot: 14, d: 8.7, delay: 1.2 },
    { x: 80, y: 86, s: 128, g: 11, op: 0.9, blur: 0,   amp: 16, rot: 9,  d: 7.9, delay: 2.2 },
    { x: 97, y: 79, s: 96,  g: 4,  op: 0.8, blur: 0.5, amp: 18, rot: -12,d: 9.5, delay: 0.7 },
    // 遠景（小、透明、微模糊）— 散點製造深度
    { x: 69, y: 11, s: 60,  g: 6,  op: 0.46,blur: 1.6, amp: 26, rot: -15,d: 10.8,delay: 0.9 },
    { x: 92, y: 37, s: 54,  g: 5,  op: 0.44,blur: 1.7, amp: 28, rot: 12, d: 11.2,delay: 2.5 },
    { x: 7,  y: 14, s: 64,  g: 9,  op: 0.5, blur: 1.5, amp: 22, rot: 10, d: 10.1,delay: 0.3 },
    { x: 17, y: 55, s: 72,  g: 7,  op: 0.54,blur: 1.3, amp: 20, rot: -10,d: 9.7, delay: 1.6 },
    { x: 31, y: 92, s: 50,  g: 3,  op: 0.42,blur: 1.8, amp: 24, rot: 16, d: 11.5,delay: 3.0 },
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
      el.style.setProperty("--op", c.op);
      if (c.blur) el.style.setProperty("--blur", c.blur + "px");
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
