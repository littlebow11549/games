const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { pathToFileURL } = require('node:url');

(async () => {
  const root = path.resolve(__dirname, '../../02_brave_guy');
  const read = file => fs.readFileSync(path.join(root, file), 'utf8');
  const css = read('css/playable-roster.css');
  const baseCss = read('css/game.css');
  const html = read('play.html');
  const main = read('js/main.js');
  const selector = '#hud:is([data-character="angel"],[data-character="nightmare"]) .act.transform';
  assert(css.includes(selector + '::after{content:none}'), 'only guest gems suppress the visible caption and keycap');
  assert(css.includes(selector + '::before{'), 'guest gem artwork remains');
  assert(css.includes(selector + '.ready::before{'), 'ready state remains');
  assert.match(baseCss, /\.act::after\{content:attr\(data-key\)/, 'ordinary desktop keycaps remain');
  assert(!css.includes('data-burst-label') && !main.includes('data-burst-label'), 'no stale visible caption writer');
  assert.match(html, /class="act transform"[^>]*data-action="transform"[^>]*aria-keyshortcuts="Space"[^>]*aria-label="變身"/);
  assert.match(html, /css\/playable-roster\.css\?v=\w+/);

  // Evaluate the real updateHud transform-control branch independently of WebGL.
  const start = main.indexOf('      const ready=guest()?!game.final');
  const end = main.indexOf("    } else if (a === 'dodge')", start);
  const attr = main.match(/function attrIfChanged[^\n]*/)?.[0];
  assert(start >= 0 && end > start && attr);
  const attrs = new Map([['title', 'previous-title']]);
  const states = new Map();
  let attrWrites = 0;
  const btn = {
    dataset: {action: 'transform'},
    getAttribute: name => attrs.get(name) ?? null,
    hasAttribute: name => attrs.has(name),
    setAttribute: (name, value) => { attrWrites++; attrs.set(name, value); },
    removeAttribute: name => { attrWrites++; attrs.delete(name); },
    classList: {toggle: (name, value) => states.set(name, value)},
  };
  const hero = {character: 'angel', courage: 100, guilt: 100, guiltMax: 100, guestBurstT: 0};
  const game = {final: false};
  let lang = 0, brave = true;
  const ctx = vm.createContext({
    btn, hero, game, guest: () => hero.character !== 'brave', GAUGE: {courageMax: 100}, canTransform: () => true,
    tr: (...words) => words[lang], t: zh => [zh, 'Transform', '変身'][lang],
    get brave() { return brave; },
  });
  const update = vm.runInContext(`${attr}; () => {${main.slice(start, end)}}`, ctx);
  for (const id of ['angel', 'nightmare']) {
    hero.character = id;
    for (const [index, label] of ['爆氣', 'Burst', '覚醒'].entries()) {
      lang = index;
      attrs.set('title', 'stale-transform-name');
      update();
      assert.equal(attrs.get('aria-label'), label);
      assert.equal(attrs.has('title'), false, 'guest hover cannot expose the label');
      assert.equal(states.get('ready'), true);
      const previousWrites = attrWrites;
      update();
      assert.equal(attrWrites, previousWrites, 'stable HUD makes no caption/tooltip attribute writes');
      hero.guestBurstT = 2;
      update();
      assert.equal(states.get('ready'), false);
      hero.guestBurstT = 0;
    }
  }
  hero.character = 'brave';
  brave = false;
  for (const [index, label] of ['變身', 'Transform', '変身'].entries()) {
    lang = index;
    update();
    assert.equal(attrs.get('aria-label'), label);
    assert.equal(attrs.get('title'), label, 'returning to protagonist restores the ordinary tooltip');
    assert.equal(states.get('ready'), true);
  }

  // Test the unchanged Input listeners without a dependency on CSS caption data.
  class Target {
    listeners = new Map();
    addEventListener(type, callback) { this.listeners.set(type, callback); }
    send(type, options) { this.listeners.get(type)?.({preventDefault() {}, ...options}); }
  }
  Object.setPrototypeOf(btn, new Target());
  const window = new Target(), document = new Target();
  document.getElementById = () => new Target();
  document.querySelectorAll = () => [btn];
  globalThis.window = window;
  globalThis.document = document;
  globalThis.addEventListener = window.addEventListener.bind(window);
  const { Input } = await import(pathToFileURL(path.join(root, 'js/input.js')).href);
  const input = new Input();
  window.send('keydown', {code: 'Space', repeat: false});
  assert.deepEqual(input.takeActions(), ['transform']);
  window.send('keyup', {code: 'Space'});
  assert(!input.held.has('transform'));
  btn.send('pointerdown', {pointerType: 'touch'});
  assert.deepEqual(input.takeActions(), ['transform']);
  btn.send('pointerup', {pointerType: 'touch'});
  assert(!input.held.has('transform'));
  console.log('PASS guest icon-only rule, three-language accessible names, no guest tooltip, protagonist labels, Space and touch.');
})().catch(error => { console.error(error); process.exitCode = 1; });
