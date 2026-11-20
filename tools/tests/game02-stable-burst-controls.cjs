const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../../02_brave_guy');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const game = read('css/game.css');
const controls = read('css/controls-layout.css');
const roster = read('css/playable-roster.css');
const main = read('js/main.js');
const html = read('play.html');
const characters = ':is([data-character="angel"],[data-character="nightmare"])';
const protagonist = ':where(#hud:not([data-character="angel"],[data-character="nightmare"])) ';
const reflow = '.actions:has(.transform:not([hidden])) .act.';
assert(controls.includes(protagonist + reflow + 'lock,\n' + protagonist + reflow + 'cycle-lock{bottom:252px}'));
assert(!/^\.actions:has\(\.transform/m.test(controls), 'no unscoped guest reflow');

const rule = (css, selector) => {
  const offset = css.indexOf(selector + '{');
  assert(offset !== -1, 'missing rule: ' + selector);
  return css.slice(offset + selector.length + 1, css.indexOf('}', offset));
};
const position = (css, selector) => Object.fromEntries(
  [...rule(css, selector).matchAll(/(right|bottom|width|height):(\d+)px/g)].map(([, k, v]) => [k, +v]));
const slots = {
  lock: position(controls, '.game-art .act.lock'),
  cycle: position(controls, '.game-art .act.cycle-lock'),
  gem: position(roster, '#hud' + characters + ' .act.transform'),
};
assert.deepEqual(slots, {
  lock: {right: 14, bottom: 202, width: 48, height: 48},
  cycle: {right: 72, bottom: 202, width: 48, height: 48},
  gem: {right: 144, bottom: 224, width: 68, height: 68},
});
assert.match(game, /\[hidden\]\{display:none!important\}/, 'unavailable gem cannot intercept hits');
assert.match(game, /\.actions\{position:absolute;right:calc\(14px \+ var\(--safe-r\)\);bottom:calc\(14px \+ var\(--safe-b\)\)/);
assert.match(game, /@media \(max-height:420px\)[\s\S]*?\.actions\{transform:scale\(\.8\);transform-origin:right bottom\}/);
assert.match(main, /guest\(\)\?game\.final\|\|hero\.guilt<hero\.guiltMax\|\|hero\.guestBurstT>0/, 'visibility still driven by gameplay only');
assert.match(html, /css\/controls-layout\.css\?v=\w+/);

const viewports = [{width: 320, height: 568}, {width: 390, height: 844}, {width: 844, height: 390}, {width: 1280, height: 720}];
const overlap = (a, b) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
for (const {width, height} of viewports) {
  const scale = height <= 420 ? .8 : 1;
  const screen = ({right, bottom, width: w, height: h}) =>
    ({ x: width - 14 - (right + w) * scale, y: height - 14 - (bottom + h) * scale, width: w * scale, height: h * scale });
  const [lock, cycle, gem] = [slots.lock, slots.cycle, slots.gem].map(screen);
  assert(!overlap(lock, gem) && !overlap(cycle, gem));
  assert(!overlap(lock, cycle));
  assert(cycle.x - (gem.x + gem.width) >= 19);
  for (const box of [lock, cycle, gem]) assert(box.x >= 0 && box.y >= 0 && box.x + box.width <= width && box.y + box.height <= height);
}
console.log('PASS source selector isolation, unchanged fixed slots, hidden non-interception rule and numerical layout at four screen sizes');

// Optional real-browser checks: uses exactly the shipped HTML and styles, but
// isolates the HUD so no WebGL, save data, CDN or game boot is needed.
if (process.argv.includes('--browser')) {
  (async () => {
    const { chromium } = require('playwright');
    const browser = await chromium.launch({executablePath: process.env.CHROMIUM || '/usr/bin/chromium', args: ['--no-sandbox']});
    try {
      const css = [...html.matchAll(/href="(css\/[^"?#]+)\?v=[^"]+"/g)].map(([, name]) => read(name)).join('\n');
      const hud = html.slice(html.indexOf('<div id="hud" hidden>'), html.indexOf('<div class="combo"')).replace('<div id="hud" hidden>', '<div id="hud">');
      for (const viewport of viewports) {
        const page = await browser.newPage({viewport, hasTouch: viewport.width !== 1280, reducedMotion: 'reduce'});
        await page.setContent(`<!doctype html><style>${css}</style><body class="game-art">${hud}</body>`);
        const result = await page.evaluate(() => {
          const hud = document.querySelector('#hud'), gem = hud.querySelector('.act.transform'), actions = hud.querySelector('.actions');
          hud.dataset.artStyle = 'classic2d';
          const bounds = el => {
            const {x, y, width, height} = el.getBoundingClientRect();
            return {x, y, width, height};
          };
          const visible = el => getComputedStyle(el).display !== 'none';
          const stableSelectors = ['.actions', '#btn-lock', '#btn-cycle-lock', '.act.attack', '.act.dodge',
            '.act.s1', '.act.s2', '.act.s3', '.act.ult', '#stick-base', '.quest', '#minimap', '.hud-top-left'];
          hud.querySelectorAll('.act.skill,.act.ult').forEach(el => { el.hidden = false; });
          const states = [true, false, true, true, false]; // charging, ready, active, sealed, ready again
          const entry = id => {
            hud.dataset.character = id;
            return states.map(hidden => {
              gem.hidden = hidden;
              gem.classList.toggle('ready', !hidden);
              const rect = bounds(gem);
              const hit = !hidden && document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2) === gem;
              return { stable: stableSelectors.map(s => bounds(hud.querySelector(s))), gem: rect, shown: visible(gem), hit };
            });
          };
          const guests = ['angel', 'nightmare'].map(entry);
          const brave = entry('brave');
          actions.classList.add('base-form');
          const baseBrave = entry('brave');
          return {guests, brave, baseBrave};
        });
        for (const [charging, ready, active, sealed, refill] of result.guests) {
          for (const state of [ready, active, sealed, refill]) assert.deepEqual(state.stable, charging.stable);
          assert.deepEqual(ready.gem, refill.gem);
          assert.deepEqual([charging.shown, ready.shown, active.shown, sealed.shown, refill.shown], [false, true, false, false, true]);
          assert.equal(charging.gem.width, 0);
          assert.equal(active.gem.width, 0);
          assert.equal(sealed.gem.width, 0);
          assert(ready.hit && refill.hit);
          for (const button of ready.stable.slice(1, 9)) assert(!overlap(ready.gem, button));
        }
        assert(result.brave[1].stable[1].y < result.brave[0].stable[1].y, 'old protagonist clearance remains');
        assert.deepEqual(result.baseBrave[0].stable, result.baseBrave[1].stable, 'existing base-form override remains');
        await page.close();
      }
      console.log('PASS real HTML/CSS: stationary guest HUD, no gem overlap or hidden hit target, preserved protagonist clearance');
    } finally {
      await browser.close();
    }
  })().catch(error => { console.error(error); process.exitCode = 1; });
}
