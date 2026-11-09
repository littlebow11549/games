/* 漂浮動態寶石：用現成 gems_01.png（4×3 共 12 顆）sprite。
   自然散佈、有遠近大小（景深）：近景大而清晰、遠景小而透明微模糊。
   座標 x/y 為「中心點」百分比（CSS 以 translate(-50%,-50%) 置中）。 */
(function () {
  // 三層景深：near 大而清晰、mid 中等、far 小而透明且微模糊
  // 散佈在左右側帶與角落，避開中央主角/面板；左右視覺重量大致平衡但不對稱
  const LAYOUT = [
    // 近景（大、清晰、靠前）
    { x: 8,  y: 34, s: 186, g: 0,  op: 1,   blur: 0,   amp: 16, rot: 7,  d: 7.6, delay: 0.0 },
    { x: 91, y: 60, s: 178, g: 8,  op: 1,   blur: 0,   amp: 20, rot: -9, d: 8.4, delay: 1.1 },
    { x: 15, y: 83, s: 150, g: 10, op: 0.95,blur: 0,   amp: 14, rot: -6, d: 9.0, delay: 0.6 },
    // 中景
    { x: 93, y: 24, s: 120, g: 1,  op: 0.9, blur: 0,   amp: 22, rot: 10, d: 8.0, delay: 1.7 },
    { x: 5,  y: 58, s: 112, g: 3,  op: 0.85,blur: 0,   amp: 18, rot: -11,d: 9.4, delay: 0.4 },
    { x: 83, y: 87, s: 126, g: 11, op: 0.92,blur: 0,   amp: 16, rot: 9,  d: 7.8, delay: 2.1 },
    { x: 22, y: 13, s: 104, g: 2,  op: 0.85,blur: 0,   amp: 20, rot: 13, d: 8.8, delay: 1.3 },
    // 遠景（小、透明、微模糊）
    { x: 77, y: 11, s: 70,  g: 6,  op: 0.5, blur: 1.4, amp: 24, rot: -14,d: 10.5,delay: 0.9 },
    { x: 96, y: 43, s: 66,  g: 5,  op: 0.48,blur: 1.6, amp: 26, rot: 12, d: 11.0,delay: 2.4 },
    { x: 3,  y: 18, s: 64,  g: 9,  op: 0.5, blur: 1.5, amp: 22, rot: 10, d: 10.0,delay: 0.3 },
    { x: 19, y: 66, s: 74,  g: 7,  op: 0.55,blur: 1.2, amp: 20, rot: -10,d: 9.6, delay: 1.9 },
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
