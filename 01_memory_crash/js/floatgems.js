/* 漂浮動態寶石：用現成 gems_01.png（4×3 共 12 顆）sprite，
   在首頁/選單背景飄動。左右對稱、平均分布、尺寸統一。
   座標 x/y 為「中心點」百分比（CSS 以 translate(-50%,-50%) 置中）。 */
(function () {
  // 左右各 4 顆，垂直平均分布，整齊對稱；尺寸統一（兩個層級交錯）
  const BIG = 150, SM = 128;
  const YS = [16, 38, 60, 82];            // 四列平均分布
  const LX = 7, RX = 93;                   // 左右邊帶
  const LGEMS = [0, 3, 7, 10];             // 左側寶石種類
  const RGEMS = [1, 5, 8, 11];             // 右側寶石種類
  const LAYOUT = [];
  YS.forEach((y, i) => {
    const s = i % 2 === 0 ? BIG : SM;      // 交錯大小，視覺平衡
    const amp = 14 + (i % 2) * 6;
    LAYOUT.push({ x: LX, y, s, g: LGEMS[i], amp, rot: 8,  d: 7.5 + i * 0.6, delay: i * 0.5 });
    LAYOUT.push({ x: RX, y, s, g: RGEMS[i], amp, rot: -8, d: 8.0 + i * 0.6, delay: 0.3 + i * 0.5 });
  });

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
