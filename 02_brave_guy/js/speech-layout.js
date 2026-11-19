// Speech uses a bottom-center anchor. Reserve the boss name + HP strip,
// rather than raising bubbles over it or hiding either piece of information.
export function placeSpeech(el, anchor, boss = document.getElementById('boss-bar')) {
  const margin = 12, gap = 14;
  const width = el.offsetWidth, height = el.offsetHeight;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(Math.max(lo, hi), v));
  let x = clamp(anchor.x, width / 2 + margin, innerWidth - width / 2 - margin);
  let y = clamp(anchor.y, height + margin, innerHeight - margin);
  if (boss && !boss.hidden && boss.getClientRects().length) {
    const r = boss.getBoundingClientRect();
    if (x + width / 2 > r.left - gap && x - width / 2 < r.right + gap &&
        y > r.top - gap && y - height < r.bottom + gap) {
      if (r.bottom + gap + height <= innerHeight - margin) y = r.bottom + gap + height;
      else if (r.top - gap - height >= margin) y = r.top - gap;
      // Short landscapes: use a free side if there isn't enough vertical room.
      else if (r.left - gap - width >= margin) x = r.left - gap - width / 2;
      else if (r.right + gap + width <= innerWidth - margin) x = r.right + gap + width / 2;
    }
  }
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
}
