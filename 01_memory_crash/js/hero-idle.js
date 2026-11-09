/* 全身主角待機動畫：8 格 sprite（4×2，各 443×443）時間軸播放 + 相鄰格淡入過渡。
   驅動 [data-hero-idle] canvas；非作用中畫面/隱藏/減少動態時暫停。 */
(() => {
  const script = document.currentScript;
  const image = new Image();
  image.src = new URL('../assets/runtime/pic/batch3/pug_idle_full.webp', script.src).href;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const durations = [1500, 520, 90, 110, 90, 520, 700, 470]; // 合計 4000ms，含眨眼
  const total = durations.reduce((a, b) => a + b, 0);
  const nodes = [...document.querySelectorAll('[data-hero-idle]')];
  let raf = 0;
  const origin = performance.now();

  function frameRect(frame) {
    const cols = 4, rows = 2;
    const x = Math.round((frame % cols) * image.width / cols);
    const y = Math.round(Math.floor(frame / cols) * image.height / rows);
    const w = Math.round(((frame % cols) + 1) * image.width / cols) - x;
    const h = Math.round((Math.floor(frame / cols) + 1) * image.height / rows) - y;
    return { x, y, w, h };
  }
  function draw(canvas, frame, alpha = 1) {
    const { x, y, w, h } = frameRect(frame);
    const ctx = canvas.getContext('2d');
    ctx.globalAlpha = alpha;
    ctx.drawImage(image, x, y, w, h, 0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
  }
  function tick(now) {
    raf = 0;
    if (document.hidden || reduced.matches || !image.complete || !image.naturalWidth) return;
    let phase = (now - origin) % total, frame = 0;
    while (phase >= durations[frame]) phase -= durations[frame++];
    const blend = Math.min(90, durations[frame] * 0.5);
    const mix = Math.max(0, (phase - (durations[frame] - blend)) / blend);
    let visible = false;
    for (const canvas of nodes) {
      const screen = canvas.closest('.screen');
      if ((screen && !screen.classList.contains('active')) || canvas.closest('[hidden]')) continue;
      visible = true;
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      draw(canvas, frame, 1);
      if (mix > 0) draw(canvas, (frame + 1) % durations.length, mix);
    }
    if (visible) raf = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(raf); raf = 0;
    if (!image.naturalWidth) return;
    if (reduced.matches) {
      nodes.forEach(c => { c.getContext('2d').clearRect(0, 0, c.width, c.height); draw(c, 0); });
    } else if (!document.hidden) {
      raf = requestAnimationFrame(tick);
    }
  }
  image.onload = () => { nodes.forEach(c => { draw(c, 0); c.classList.add('idle-ready'); }); sync(); };
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  new MutationObserver(sync).observe(
    document.querySelector('#app') || document.body,
    { attributes: true, subtree: true, attributeFilter: ['class', 'hidden'] }
  );
})();
