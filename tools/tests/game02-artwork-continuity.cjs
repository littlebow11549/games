// Uses a controllable image decoder to exercise failure/delay without requiring a browser.
// Run from repo root: node tools/tests/game02-artwork-continuity.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const pkg = path.resolve(__dirname, '../../02_brave_guy');
const read = file => fs.readFileSync(path.join(pkg, file), 'utf8');
async function run() {
  const { assetPath } = await import('../../02_brave_guy/js/asset-paths.js');
  const manifest = JSON.parse(read('assets/runtime-images.json'));
  for (const image of manifest) assert(fs.statSync(path.join(pkg, assetPath(image))).isFile(), image);
  const pending = new Map(), requests = [];
  global.Image = class {
    decode() {
      const name = decodeURIComponent(this.src).match(/tf_(.+)\.webp$/)[1];
      requests.push(name);
      return new Promise((resolve, reject) => pending.set(name, { resolve, reject }));
    }
    cloneNode() { return { src: this.src, setAttribute() {} }; }
  };
  const flush = () => new Promise(resolve => setImmediate(resolve));
  const settle = async (id, ok = true) => { pending.get(id)[ok ? 'resolve' : 'reject'](); await flush(); };
  global.document = { hidden: false };
  global.cancelAnimationFrame = () => {};
  global.requestAnimationFrame = () => 1; // This test exercises dialogue progression, not animation timing.
  const { createTransformArt } = await import('../../02_brave_guy/js/transform-art.js');
  const displayed = [];
  const picture = { children: [], replaceChildren() { this.children = []; }, append(img){ this.children.push(img); } };
  const sign = { hidden: true, img: {}, querySelector(){ return this.img; } };
  const root = { hidden: true, dataset: {}, style: {}, querySelector(selector){ return selector === '.tf-picture' ? picture : sign; } };
  const view = createTransformArt(root, id => displayed.push(id));

  view.show('bg_stars', 'silhouette');
  assert.deepEqual(requests, ['bg_stars', 'silhouette']);
  assert.equal(root.hidden, true);
  await settle('bg_stars');
  assert.equal(root.dataset.frame, 'bg_stars');
  assert.match(picture.children[0].src, /tf_bg_stars/);
  assert.equal(root.hidden, false);

  view.show('silhouette', 'sign');
  assert.deepEqual(requests, ['bg_stars', 'silhouette', 'sign']);
  assert.equal(root.dataset.frame, 'bg_stars'); // previous image survives pending incoming decode
  await settle('silhouette');
  assert.equal(root.dataset.frame, 'silhouette');
  assert.match(picture.children[0].src, /tf_silhouette/);

  view.show('sign');
  await settle('sign', false);
  assert.equal(root.hidden, true);
  assert.equal(picture.children.length, 0);
  assert.deepEqual(displayed, ['bg_stars', 'silhouette']);
  view.show('sign'); // same cue may retry rather than using a permanent failed cache entry
  await settle('sign');
  assert.deepEqual(requests, ['bg_stars', 'silhouette', 'sign', 'sign']);
  assert.equal(sign.hidden, false);
  assert.match(sign.img.src, /tf_sign/);
  assert.deepEqual(displayed, ['bg_stars', 'silhouette', 'sign']);

  view.show(['glove', 'knee', 'jacket', 'hair', 'scarf'], 'waiting_4');
  assert.deepEqual(requests.slice(-2), ['glove', 'knee']); // current plus one-ahead
  view.hide(); // skip before asset arrives; neither old promise may resurrect UI
  await settle('glove');
  await settle('knee');
  assert.equal(root.hidden, true);
  assert.equal(picture.children.length, 0);
  assert.deepEqual(displayed, ['bg_stars', 'silhouette', 'sign']);
  console.log('PASS: ' + manifest.length + ' runtime image paths; transform delay, failure, retry, one-ahead, stale callback and sound timing.');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
