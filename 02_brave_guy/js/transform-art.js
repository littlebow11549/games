// Reuse archived native PNGs. No generated derivatives or image upscaling.
export const TRANSFORM_FILES = ['bg_stars', 'silhouette', 'glove', 'knee', 'jacket', 'hair', 'scarf', 'pose', 'waiting_1', 'waiting_2', 'waiting_3', 'waiting_4', 'sign'];
const urls = Object.fromEntries(TRANSFORM_FILES.map(id => [id, new URL(`../assets/source/pic/transform/tf_${id}.png`, import.meta.url).href]));
const cache = new Map();
function load(id) {
  if (!cache.has(id)) cache.set(id, new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null); // Text dialog remains usable if an image fails.
    img.src = urls[id];
  }));
  return cache.get(id);
}
// Reuse delivered SFX; fire at the committed visual frame, not at dialog input time.
export const TRANSFORM_SFX = Object.freeze({
 bg_stars:['tf_stars'], silhouette:['tf_silhouette'],
 glove:['tf_glove'], knee:['tf_knee'], jacket:['tf_jacket'],
 hair:['tf_hair'], scarf:['tf_scarf'], pose:['tf_pose'],
 waiting_1:['ui_back'], waiting_2:['chips'], waiting_3:['revert'],
 waiting_4:['student_punch'], sign:['ui_confirm'],
});
export function createTransformArt(root, onFrame = () => {}) {
  const picture = root.querySelector('.tf-picture');
  const sign = root.querySelector('.tf-sign-card');
  let generation = 0, timer = 0, current = null;
  function stop() { cancelAnimationFrame(timer); timer = 0; generation++; }
  function hide() { stop(); current = null; root.hidden = true; picture.replaceChildren(); sign.hidden = true; }
  function show(cue) {
    if (!cue) { hide(); return; }
    // Language refresh must not restart the outfit montage.
    if (cue === current) return;
    stop(); current = cue;
    const token = generation;
    root.hidden = false;
    root.dataset.shot = Array.isArray(cue) ? 'outfit' : cue;
    picture.replaceChildren(); sign.hidden = true;
    delete root.dataset.frame;
    for (const id of TRANSFORM_FILES) load(id);
    load('bg_stars').then(img => { if (img && token === generation) root.style.backgroundImage = `url("${img.src}")`; });
    const shots = Array.isArray(cue) ? cue : [cue];
    async function display(index) {
      const id = shots[index], img = await load(id);
      if (token !== generation) return;
      root.dataset.frame = id;
      picture.replaceChildren(); sign.hidden = id !== 'sign';
      if (img) {
        const copy = img.cloneNode(); copy.alt = ''; copy.setAttribute('aria-hidden', 'true');
        if (id === 'sign') sign.querySelector('img').src = img.src;
        else picture.append(copy);
        if (!document.hidden) onFrame(id);
      }
      if (!img) sign.hidden = true;
      if (index + 1 < shots.length) {
        let elapsed = 0, last = performance.now();
        const tick = now => {
          if (token !== generation) return;
          if (!document.hidden) elapsed += Math.min(now - last, 100);
          last = now;
          if (elapsed >= 800) display(index + 1);
          else timer = requestAnimationFrame(tick);
        };
        timer = requestAnimationFrame(tick);
      }
    }
    display(0);
  }
  return { show, hide };
}
