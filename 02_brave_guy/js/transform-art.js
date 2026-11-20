import { assetPath } from './asset-paths.js';
// Lossless delivery copies of archived art; native dimensions and RGBA pixels preserved.
export const TRANSFORM_FILES = ['bg_stars', 'silhouette', 'glove', 'knee', 'jacket', 'hair', 'scarf', 'pose', 'waiting_1', 'waiting_2', 'waiting_3', 'waiting_4', 'sign'];
const urls = Object.fromEntries(TRANSFORM_FILES.map(id => [id, new URL(assetPath(`../assets/runtime/lossless/pic/transform/tf_${id}.webp`), import.meta.url).href]));
const cache = new Map();
function load(id) {
  if (!urls[id]) return Promise.resolve(null);
  if (!cache.has(id)) {
    const img = new Image();
    img.src = urls[id];
    cache.set(id, img.decode().then(() => img).catch(() => {
      cache.delete(id); // A transient failure must not poison the rest of the play session.
      return null;
    }));
  }
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
  function show(cue, nextCue) {
    if (!cue) { hide(); return; }
    // Language refresh must not restart the outfit montage.
    if (cue === current) return;
    stop(); current = cue;
    const token = generation;
    const shots = Array.isArray(cue) ? cue : [cue];
    async function display(index) {
      const id = shots[index];
      const incoming = load(id);
      // Warm only the next frame, not all 13 story images. Reuse each pending decode.
      const next = shots[index + 1] ?? (Array.isArray(nextCue) ? nextCue[0] : nextCue);
      if (next) load(next);
      const img = await incoming;
      if (token !== generation) return;
      picture.replaceChildren(); sign.hidden = id !== 'sign';
      if (img) {
        root.dataset.shot = Array.isArray(cue) ? 'outfit' : cue;
        root.dataset.frame = id;
        const copy = img.cloneNode(); copy.alt = ''; copy.setAttribute('aria-hidden', 'true');
        if (id === 'sign') sign.querySelector('img').src = img.src;
        else picture.append(copy);
        root.hidden = false;
        load('bg_stars').then(bg => {
          if (bg && token === generation) root.style.backgroundImage = `url("${bg.src}")`;
        });
        if (!document.hidden) onFrame(id);
      } else {
        // Stop showing the previous frame after a failed request; the dialogue stays usable.
        root.hidden = true; sign.hidden = true; delete root.dataset.frame;
        current = null;
      }
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
