const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { pathToFileURL } = require('node:url');

// Run the actual stage/camera reset functions with real Three.js models and maze
// collision. Browser integration lives in game02-entry-position.cjs.
(async () => {
  const root = path.resolve(__dirname, '../../02_brave_guy');
  const source = fs.readFileSync(path.join(root, 'js/main.js'), 'utf8');
  const load = rel => import(pathToFileURL(path.join(root, rel)).href);
  globalThis.location = { search: '' };
  const [THREE, { createVisual }, { makeMaze }, { STAGES }, { ARENA_RADIUS }, { ROSTER }] = await Promise.all(
    ['vendor/three/three.module.min.js', 'js/visuals.js', 'js/maze.js', 'js/story.js', 'js/world.js', 'js/playable-roster.js'].map(load));
  const section = (start, end) => {
    const a = source.indexOf(start), b = source.indexOf(end, a + start.length);
    assert(a >= 0 && b > a, `${start} … ${end}`);
    return source.slice(a, b);
  };
  const noop = () => {};
  const scene = new THREE.Scene(), game = {}, hero = { pos: new THREE.Vector3(), vis: {} }, angel = { pos: new THREE.Vector3() };
  const camera = new THREE.PerspectiveCamera();
  const save = { rounds: 0, cleared: [], secretCharacters: [] };
  const nodes = new Map();
  const context = vm.createContext({
    THREE, createVisual, makeMaze, STAGES, ARENA_RADIUS, ROSTER, scene, game, hero, angel, camera, save,
    HERO: { radius: .5, maxHp: 1000 }, GAUGE: {}, matchMedia: () => ({matches: false}),
    audio: { stopCelebration: noop, stopLoops: noop, sfx: noop, tracks: {} }, input: {takeActions: noop},
    opening: {cancel: noop}, cinematics: {cancel: noop, prepareEnding: async () => {}, prepareBoss: async () => {}},
    transformArt: {hide: noop}, runs: {start: noop, invalidate: noop}, unlockAll: false, diff: 0,
    pendingVictory: null, BOSS_GROUPS: {}, taunt: {}, clearTimeout, applyCharacterHud: noop,
    $: id => { if (!nodes.has(id)) nodes.set(id, { classList: {remove: noop} }); return nodes.get(id); },
    clearField: noop, buildWorld: () => ({sun: new THREE.DirectionalLight()}), Q: noop,
    t: x => x, say: noop, gameplayIsReady: () => true, rosterPicker: {open: false},
    characterUnlocked: () => true, stageAbilities: () => new Set(), setBgm: noop,
    supportName: () => 'support', stageBgm: noop,
  });
  vm.runInContext(`
    const tmp = new THREE.Vector3(), camTarget = new THREE.Vector3();
    ${section('const CAM_OFFSET', 'let { sun }')}
    let stageFocusHeight = 0.9, sun, portraitHurtTimer;
    let difficulty = 'normal';
    const D = () => ({id: difficulty, bearGap:[1, 2], rescues: 3});
    const guest = () => ['angel', 'nightmare'].includes(hero.character);
    const godMode = () => save.rounds > 3;
    const rand = (a,b) => a + Math.random()*(b-a);
    const stage = () => STAGES[game.stage];
    const applyBgm = () => {};
    const runDialog = (lines, done) => { if(lines.length) game.phase = 'dialog'; };
    ${section('let maze = null;', '// 開發期間')}
    ${section('function setForm(', 'let portraitHurtTimer;')}
    ${section('function resetHero(', 'function clearField(')}
    ${section('function startStage(', 'const startGame =')}
    ${section('function supportTarget(', '// ---------- 小地圖')}
    ${section('function snapStageCamera(', '// 持續掉幀')}
  `, context);

  const project = () => {
    const b = new THREE.Box2(), v = new THREE.Vector3();
    hero.visual.root.updateMatrixWorld(true);
    hero.visual.root.traverse(o => {
      if (!o.isMesh) return;
      const pos = o.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) b.expandByPoint(v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld).project(camera));
    });
    return b.getCenter(new THREE.Vector2());
  };
  const compare = (a, b, delta, message) => assert(Math.abs(a - b) <= delta, `${message}: ${a} vs ${b}`);
  let cases = 0;
  for (const [width, height] of [[390, 844], [1280, 720], [844, 390]]) {
    camera.aspect = width / height;
    camera.fov = width < height ? 58 : 42;
    camera.updateProjectionMatrix();
    for (const difficulty of ['normal', 'hell']) {
      vm.runInContext(`difficulty = "${difficulty}"`, context);
      for (const [rounds, id] of [[0, 'brave'], [4, 'brave'], [4, 'angel'], [4, 'nightmare']]) {
        save.rounds = rounds;
        for (let stage = 0; stage < STAGES.length; stage++) {
          // Simulate retry / previous stage with camera and both rigs off-center.
          camera.position.set(17, 20, -19); camera.lookAt(18, 5, -17); camera.updateMatrixWorld();
          vm.runInContext(`camTarget.set(18, 0, -17); game.shake = 1; startStage(${stage}, "${id}")`, context);
          assert.equal(game.phase, 'dialog');
          assert.deepEqual(hero.pos.toArray(), [0, 0, 0]);
          assert.deepEqual(hero.visual.root.position.toArray(), [0, 0, 0]);
          assert.equal(hero.visual.root.rotation.y, 0);
          assert.equal(angel.visual.root.position.x, -1.3);
          assert.equal(angel.visual.root.position.z, -.6);
          assert.equal(vm.runInContext('maze?.blocked(hero.pos, HERO.radius) || false', context), false);
          const before = project(), beforeMatrix = camera.matrixWorld.toArray();
          compare(before.x * width / 2, 0, 5, 'first frame X');
          compare(before.y * height / 2, 0, 5, 'first frame Y');
          vm.runInContext('game.phase = "playing"; hero.visual.update(1/60); updateAngel(1/60); updateCamera(1/60)', context);
          camera.updateMatrixWorld();
          assert.deepEqual(camera.matrixWorld.toArray(), beforeMatrix, 'no camera jump when dialogue closes');
          const after = project();
          compare(after.x * width / 2, before.x * width / 2, 1, 'idle X change');
          compare(after.y * height / 2, before.y * height / 2, 1, 'idle Y change');
          cases++;
        }
      }
    }
  }
  // Walking follows the existing exponential camera easing, rather than locking to spawn.
  vm.runInContext('hero.pos.x += 4; updateCamera(1/60)', context);
  compare(camera.position.x, 4 * (1 - Math.exp(-8/60)), Number.EPSILON, 'walking camera follow');

  console.log(`PASS ${cases} stage entries across all 16 stages, 3 characters/base forms, 2 difficulties, 3 viewports; actual geometry projection, collision, companion and camera continuity`);
})().catch(error => { console.error(error); process.exitCode = 1; });
