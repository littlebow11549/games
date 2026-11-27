const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { pathToFileURL } = require('node:url');

(async () => {
  const root = path.resolve(__dirname, '../../02_brave_guy');
  const source = fs.readFileSync(path.join(root, 'js/main.js'), 'utf8');
  const load = rel => import(pathToFileURL(path.join(root, rel)).href);
  const [THREE, { Fx }] = await Promise.all([load('vendor/three/three.module.min.js'), load('js/fx.js')]);
  const part = (start, end) => {
    const from = source.indexOf(start), to = source.indexOf(end, from + start.length);
    assert(from >= 0 && to > from, start);
    return source.slice(from, to);
  };
  const noop = () => {};
  const scene = new THREE.Scene(), fx = new Fx(scene);
  const sounds = [], strikes = [], glow = [];
  const hero = { pos: new THREE.Vector3(4, 0, -2), visual: { glow: (...args) => glow.push(args) } };
  const game = {};
  let unlocked = true;
  const context = vm.createContext({
    fx, hero, game, audio: {sfx: id => sounds.push(id)},
    areaStrike: (...args) => strikes.push(args), popup: noop, guest: () => hero.character !== 'brave',
    tr: zh => zh, canTransform: () => unlocked, burstMeter: noop, showGuiltBurstArt: noop, beam: null,
    setForm: form => { hero.form = form; }, endUlt: noop, stage: () => ({map: 1}),
    enemies: [], playBraveCue: noop, setTimeout: noop, say: noop, tauntFrom: noop, TAUNTS_SCARED: [],
  });
  vm.runInContext(
    part('const FORM =', '// dur 動作總長') +
    part('const stats =', 'const stage =') +
    part('const TRANSFORM_RELEASE_RADIUS', 'function revert('),
    context,
  );
  const run = s => vm.runInContext(s, context);
  const reset = (character, extra = {}) => {
    fx.clear();
    sounds.length = strikes.length = glow.length = 0;
    Object.assign(game, { final: false, shake: 0, hitstop: 0 });
    Object.assign(hero, {
      character, form: character === 'brave' ? 'student' : 'brave', state: 'free', guestBurstT: 0,
      guilt: 100, guiltMax: 100, hp: 500, maxHp: 1000, invuln: 0, t: 1, ...extra,
    });
    unlocked = true;
  };
  const near = (n, expected) => assert(Math.abs(n - expected) < 1e-9, `${n} vs ${expected}`);
  const checkWave = (radius, color, total = 3) => {
    assert.equal(fx.items.length, total);
    const [dome, ring, dust] = fx.items;
    assert.equal(dome.obj.geometry.type, 'SphereGeometry');
    assert.equal(dome.obj.geometry.parameters.thetaLength, Math.PI / 2);
    assert.equal(ring.obj.geometry.type, 'RingGeometry');
    assert.equal(dust.obj.isPoints, true);
    assert.deepEqual([dome.life, ring.life, dust.life], [.55, .45, .5]);
    assert.deepEqual([dome.obj.material.color.getHex(), ring.obj.material.color.getHex(), dust.obj.material.color.getHex()], [color, 0xffffff, color]);
    assert.deepEqual(dome.obj.position.toArray(), hero.pos.toArray());
    assert.deepEqual(ring.obj.position.toArray(), [hero.pos.x, .15, hero.pos.z]);
    const positions = dust.obj.geometry.attributes.position;
    assert.equal(positions.count, 36);
    assert.equal(dust.obj.material.size, .32);
    assert.equal(positions.getX(0), hero.pos.x);
    near(positions.getY(0), Math.fround(.6));
    assert.equal(positions.getZ(0), hero.pos.z);
    assert.equal(game.shake, .7);
    fx.update(.1);
    near(dome.obj.scale.x, .5 + radius * (1 - (1 - .1 / .55) ** 2));
    near(ring.obj.scale.x, 1 + (radius - 1) * (1 - (1 - .1 / .45) ** 2));
    assert(positions.getX(0) !== hero.pos.x || positions.getZ(0) !== hero.pos.z);
    const travel = Math.hypot(positions.getX(0) - hero.pos.x, positions.getZ(0) - hero.pos.z);
    assert(travel >= .52 - 1e-5 && travel <= 1.3 + 1e-5, 'uses transformation particle speed');
  };

  for (const [id, color] of [['angel', 0xff9de0], ['nightmare', 0xb080ff]]) {
    reset(id);
    run('guiltBurst()');
    assert.equal(fx.items.length, 0, 'full resource does not trigger automatic guest FX');
    run('startGuestBurst()');
    assert.deepEqual([hero.guilt, hero.guestBurstT, hero.invuln, hero.hp, hero.form], [0, 8, .6, 500, 'brave']);
    assert.deepEqual(sounds, ['guilt_burst']);
    assert.deepEqual(glow, [[true, color]]);
    assert.equal(strikes.length, 0, 'guest burst does not damage, stun or knock back');
    assert.equal(game.hitstop, 0);
    const boosted = run('stats()');
    reset(id);
    const base = run('stats()');
    near(boosted.atk / base.atk, 1.5);
    near(boosted.speed / base.speed, 1.15);
    near(boosted.hurtMult / base.hurtMult, .8);
    run('startGuestBurst()');
    checkWave(6, color);
    hero.guilt = hero.guiltMax;
    run('startGuestBurst()');
    assert.equal(fx.items.length, 3, 'no duplicate FX during active burst');
    assert.equal(sounds.length, 1);
    fx.update(.46);
    assert.equal(scene.children.length, 0, 'visuals release by .55s');
    assert.equal(hero.guestBurstT, 8, 'FX duration is separate from buff');
    reset(id, {guilt: 99});
    run('startGuestBurst()');
    assert.equal(fx.items.length, 0, 'insufficient resource');
    reset(id);
    game.final = true;
    run('startGuestBurst()');
    assert.equal(fx.items.length, 0, 'final stage seal');
  }

  for (const [held, radius, multiplier] of [[1, 6, 1.6], [3, 11, 3.2]]) {
    reset('brave', {t: held});
    run('finishTransform()');
    checkWave(radius, 0x9be564);
    assert.deepEqual(sounds, ['transform_done']);
    const [[center, range, damage, effect]] = strikes;
    assert.deepEqual([center, range, damage], [hero.pos, radius, multiplier]);
    assert.deepEqual({...effect}, {kb: 12, launch: 9, stun: .8, heavy: true});
  }

  reset('brave');
  run('guiltBurst()');
  checkWave(9, 0xb06cff, 4);
  assert.equal(fx.items[3].obj.geometry.type, 'CylinderGeometry');
  assert.deepEqual(strikes[0].slice(0, 3), [hero.pos, 9, 3]);
  assert.deepEqual([hero.hp, hero.burstT, game.hitstop], [650, 12, .12]);
  reset('brave');
  unlocked = false;
  run('guiltBurst()');
  assert.equal(fx.items.length, 1, 'sealed guilt burst keeps its small ring only');
  assert.equal(fx.items[0].obj.geometry.type, 'RingGeometry');
  assert.deepEqual(sounds, ['guilt_crack']);
  assert.deepEqual(strikes[0].slice(0, 3), [hero.pos, 4, .1]);
  fx.clear();
  console.log('PASS guest shockwave FX parity and disposal, activation guards, unchanged guest buffs, transform damage/radius and protagonist guilt variants.');
})().catch(error => { console.error(error); process.exitCode = 1; });
