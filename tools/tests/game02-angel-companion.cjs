const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../../02_brave_guy');
const T = require(path.join(root, 'vendor/three/three.module.min.js'));
const manifest = require(path.join(root, 'assets/manifest.json'));
const source = fs.readFileSync(path.join(root, 'js/main.js'), 'utf8');

const cfg = manifest.models.angel;
assert.match(cfg.url, /charactor02_angel_companion\.glb$/);
assert.ok(cfg.height > 1 && cfg.height < manifest.models.angel_playable.height);
assert.equal(cfg.rotationY, manifest.models.angel_playable.rotationY);
const model = fs.readFileSync(path.join(root, cfg.url));
const full = fs.readFileSync(path.join(root, manifest.models.angel_playable.url));
const gltf = b => JSON.parse(b.subarray(20, 20 + b.readUInt32LE(12)));
const low = gltf(model), original = gltf(full);
assert.equal(model.subarray(0,4).toString(), 'glTF');
assert.equal(model.length, model.readUInt32LE(8));
assert.ok(model.length < 850_000 && model.length < full.length * .18);
const prim = low.meshes[0].primitives[0];
assert.equal(low.images.length, 1);
assert.equal(low.nodes.filter(n => n.skin !== undefined).length, 1);
assert.equal(low.meshes[0].primitives.length, 1);
assert.equal(low.skins[0].joints.length, original.skins[0].joints.length);
assert.ok(prim.attributes.NORMAL !== undefined && prim.attributes.TEXCOORD_0 !== undefined &&
  prim.attributes.JOINTS_0 !== undefined && prim.attributes.WEIGHTS_0 !== undefined);
const b = low.accessors[prim.attributes.POSITION];
assert.ok(b.max[2] - b.min[2] > .29 && b.max[1] - b.min[1] > .95, 'actual volume, not a sprite');
assert.ok(low.accessors[prim.indices].count <= 24_000);
assert.deepEqual(low.animations.map(a => a.name), [cfg.clips.idle]);
assert.ok(low.animations[0].channels.length > 30);
assert.match(source, /angel\.vis=\{angel:createVisual\('angel'\),student:createVisual\('student_spirit'\),brave:createVisual\('brave_spirit'\)\}/);
assert.match(source, /hero\.character==='angel'\?angel\.vis\.student:hero\.character==='nightmare'\?angel\.vis\.brave:angel\.vis\.angel/);
assert.doesNotMatch(source.match(/const deferredModelKinds[^;]+;/)[0], /['"]angel['"]/);

const routines = source.slice(source.indexOf('function supportTarget('), source.indexOf('function updateAngel(')) +
  source.match(/function updateAngel\(dt\) \{[\s\S]*?\n\}/)[0];
const make = (kind, hasIdle, guest) => {
  const pose = new T.Group(), hero = {pos: new T.Vector3(4, 0, -3)}, updated = [];
  const angel = {pos: new T.Vector3(2.7, 0, -3.6),
    visual:{root:pose, kind, ...(hasIdle ? {actions:{idle:true}} : {}), update: dt => updated.push(dt)}};
  const g = vm.createContext({angel, hero, guest: () => guest, game:{time:0}, tmp:new T.Vector3()});
  vm.runInContext(routines + '\nthis.advance=updateAngel;', g);
  return {pose, angel, updated, advance:g.advance};
};
const real = make('angel', true, false);
real.advance(0);
assert.deepEqual(real.pose.position.toArray(),[2.7,1.5,-3.6]);
assert.ok(real.pose.rotation.y > .35 && real.pose.rotation.y < .55,'visible three-quarter face');
real.advance(.25);
assert.ok(real.pose.position.y > 1.57,'visible idle hover');
real.angel.rescueT = 1.2;
real.advance(.2);
assert.ok(real.pose.position.x > 3.2 && real.angel.rescueT < 1.2,'unchanged shoulder rescue approach');
assert.deepEqual(real.updated,[0,.25,.2]);
for(const [kind, guest, height] of [['student_spirit',true,2.1],['brave_spirit',true,2.1],['angel',false,1.5]]){
  const old = make(kind,false,guest);old.advance(0);
  assert.deepEqual(old.pose.position.toArray(),[2.7,height,-3.6]);
  assert.ok(old.pose.rotation.y > 1,'previous guest and offline-fallback behavior');
}
console.log('PASS: low-cost skinned Little Angel, shoulder anchor, hover, rescue approach, distinct unchanged guest supports');
