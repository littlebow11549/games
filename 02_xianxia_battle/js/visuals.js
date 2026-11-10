// 角色外觀層。兩種實作共用同一介面：
//   root（THREE.Group，原點在腳底、面向 +Z）、play(state)、update(dt)、flash()
// ProcVisual：程式拼出的佔位角色與程式動畫。
// GltfVisual：載入 GLB（骨架動畫），由 assets/manifest.json 指定後自動取代佔位版。
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

const ONE_SHOT = new Set(['attack', 'attack1', 'attack2', 'attack3', 'skill1', 'skill2', 'skill3', 'dodge', 'hit', 'die']);

const toon = (color, extra = {}) => new THREE.MeshToonMaterial({ color, ...extra });
const mesh = (geo, material, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.castShadow = true;
  return m;
};

// ---------- 佔位角色 ----------

const LOOKS = {
  hero: { scale: 1, body: 0x2fa88f, skin: 0xffe3cf, hair: 0x2b2f3a, weapon: 'sword' },
  mob_spear: { scale: 1.05, body: 0xb5482f, skin: 0xd98a5f, hair: 0x5a2a1a, weapon: 'spear', squat: true },
  mob_imp: { scale: 0.62, body: 0x4fae5a, skin: 0x9be08a, hair: 0x2f7a3a, weapon: null, leaf: true },
  boss: { scale: 3.0, body: 0x6f7480, skin: 0x8d93a0, hair: 0x4a4e58, weapon: null, boss: true },
};

function buildHumanoid(look) {
  const root = new THREE.Group();
  const rig = new THREE.Group();
  rig.scale.setScalar(look.scale);
  root.add(rig);

  const mats = {
    body: toon(look.body), skin: toon(look.skin), hair: toon(look.hair),
    dark: toon(0x1d2a2a), gold: toon(0xe9c46a),
  };

  const torso = new THREE.Group();
  torso.position.y = 0.55;
  rig.add(torso);

  const bodyR = look.squat || look.boss ? 0.36 : 0.28;
  torso.add(mesh(new THREE.CapsuleGeometry(bodyR, 0.28, 4, 12), mats.body));
  const belt = mesh(new THREE.CylinderGeometry(bodyR + 0.02, bodyR + 0.02, 0.08, 16), mats.gold, 0, -0.08, 0);
  torso.add(belt);

  const head = new THREE.Group();
  head.position.y = look.boss ? 0.62 : 0.72;
  torso.add(head);
  const headR = look.boss ? 0.3 : 0.42;
  head.add(mesh(new THREE.SphereGeometry(headR, 20, 16), mats.skin));
  const hair = mesh(new THREE.SphereGeometry(headR + 0.03, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), mats.hair);
  hair.rotation.x = -0.35;
  head.add(hair);
  for (const sx of [-1, 1]) head.add(mesh(new THREE.SphereGeometry(0.055, 8, 8), mats.dark, sx * headR * 0.38, 0, headR * 0.9));

  if (look === LOOKS.hero) {
    head.add(mesh(new THREE.SphereGeometry(0.17, 12, 10), mats.hair, 0, headR + 0.1, -0.08));
    head.add(mesh(new THREE.TorusGeometry(0.1, 0.03, 6, 14), mats.gold, 0, headR + 0.0, -0.08)).rotation.x = Math.PI / 2;
  }
  if (look.leaf) {
    const leaf = mesh(new THREE.ConeGeometry(0.16, 0.5, 6), toon(0x2f7a3a), 0, headR + 0.2, 0);
    leaf.rotation.z = 0.4;
    head.add(leaf);
  }
  if (look.boss) {
    for (const sx of [-1, 1]) {
      const horn = mesh(new THREE.ConeGeometry(0.1, 0.45, 6), toon(0xd8d2c0), sx * 0.24, 0.3, 0);
      horn.rotation.z = -sx * 0.5;
      head.add(horn);
    }
    const core = mesh(new THREE.SphereGeometry(0.14, 12, 10), toon(0xffb347, { emissive: 0xff7a1a, emissiveIntensity: 1.6 }), 0, 0.05, bodyR);
    core.userData.keepEmissive = true;
    torso.add(core);
    for (const sx of [-1, 1]) torso.add(mesh(new THREE.DodecahedronGeometry(0.22), mats.hair, sx * 0.42, 0.28, 0));
  }

  const limb = (r, len, material) => {
    const pivot = new THREE.Group();
    pivot.add(mesh(new THREE.CapsuleGeometry(r, len, 3, 8), material, 0, -(len / 2 + r), 0));
    return pivot;
  };
  const armR = limb(look.boss ? 0.16 : 0.09, 0.24, mats.body);
  const armL = limb(look.boss ? 0.16 : 0.09, 0.24, mats.body);
  armR.position.set(-(bodyR + 0.07), 0.2, 0);
  armL.position.set(bodyR + 0.07, 0.2, 0);
  torso.add(armR, armL);
  const legR = limb(0.1, 0.18, mats.dark);
  const legL = limb(0.1, 0.18, mats.dark);
  legR.position.set(-0.14, 0.42, 0);
  legL.position.set(0.14, 0.42, 0);
  rig.add(legR, legL);

  // 武器掛在右手末端，沿手臂方向（-Y）延伸
  const hand = new THREE.Group();
  hand.position.y = -0.42;
  armR.add(hand);
  if (look.weapon === 'sword') {
    hand.add(mesh(new THREE.BoxGeometry(0.3, 2.1, 0.07), toon(0x9ff0dc, { emissive: 0x1f8f78, emissiveIntensity: 0.5 }), 0, -1.25, 0));
    hand.add(mesh(new THREE.BoxGeometry(0.62, 0.1, 0.14), mats.gold, 0, -0.18, 0));
    hand.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8), mats.dark, 0, -0.02, 0));
  } else if (look.weapon === 'spear') {
    hand.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.2, 6), toon(0x6b4a2a), 0, -0.6, 0));
    hand.add(mesh(new THREE.ConeGeometry(0.09, 0.32, 6), toon(0xd9dde2), 0, -1.86, 0)).rotation.x = Math.PI;
  }
  return { root, rig, torso, head, armR, armL, legR, legL, hand, look };
}

function buildPlant() {
  const root = new THREE.Group();
  const rig = new THREE.Group();
  root.add(rig);
  rig.add(mesh(new THREE.SphereGeometry(0.42, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon(0x6b4a2a)));
  const stem = new THREE.Group();
  rig.add(stem);
  stem.add(mesh(new THREE.CylinderGeometry(0.1, 0.14, 1.0, 8), toon(0x3f9a4a), 0, 0.5, 0));
  const head = new THREE.Group();
  head.position.y = 1.15;
  stem.add(head);
  head.add(mesh(new THREE.SphereGeometry(0.4, 14, 12), toon(0xd94f8a)));
  head.add(mesh(new THREE.SphereGeometry(0.2, 10, 8), toon(0x3a0f24), 0, 0, 0.3));
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const petal = mesh(new THREE.ConeGeometry(0.14, 0.4, 5), toon(0xf4b6c2), Math.cos(a) * 0.36, Math.sin(a) * 0.36, 0.05);
    petal.rotation.z = a - Math.PI / 2;
    head.add(petal);
  }
  for (const sx of [-1, 1]) {
    const leaf = mesh(new THREE.ConeGeometry(0.14, 0.6, 5), toon(0x2f7a3a), sx * 0.3, 0.45, 0);
    leaf.rotation.z = -sx * 1.1;
    stem.add(leaf);
  }
  return { root, rig, stem, head, plant: true };
}

const ease = (x) => 1 - (1 - x) * (1 - x);

export class ProcVisual {
  constructor(kind) {
    this.kind = kind;
    this.p = kind === 'mob_plant' ? buildPlant() : buildHumanoid(LOOKS[kind] || LOOKS.mob_spear);
    this.root = this.p.root;
    this.state = 'idle';
    this.t = 0;
    this.dur = 0.4;
    this.clock = Math.random() * 10;
    this.flashT = 0;
    this.mats = [];
    this.root.traverse((o) => {
      if (o.isMesh && !o.userData.keepEmissive) {
        this.mats.push({ m: o.material, e: o.material.emissive.getHex(), i: o.material.emissiveIntensity });
      }
    });
  }

  play(state, dur = 0.4) {
    if (state === this.state && !ONE_SHOT.has(state)) return;
    this.state = state;
    this.t = 0;
    this.dur = dur;
  }

  flash() { this.flashT = 0.12; }

  update(dt) {
    this.t += dt;
    this.clock += dt;
    if (this.flashT > 0) {
      this.flashT -= dt;
      const on = this.flashT > 0;
      for (const s of this.mats) {
        s.m.emissive.setHex(on ? 0xffffff : s.e);
        s.m.emissiveIntensity = on ? 0.9 : s.i;
      }
    }
    if (this.p.plant) this.updatePlant(); else this.updateHumanoid();
  }

  updatePlant() {
    const { rig, stem, head } = this.p;
    const k = Math.min(1, this.t / this.dur);
    stem.rotation.z = Math.sin(this.clock * 2) * 0.12;
    stem.rotation.x = 0;
    head.scale.setScalar(1);
    rig.scale.setScalar(1);
    if (this.state === 'attack') {
      stem.rotation.x = -0.5 * Math.sin(k * Math.PI);
      head.scale.setScalar(1 + 0.35 * Math.sin(k * Math.PI));
    } else if (this.state === 'hit') {
      stem.rotation.x = -0.4 * (1 - k);
    } else if (this.state === 'die') {
      rig.scale.setScalar(Math.max(0.001, 1 - ease(k)));
    }
  }

  updateHumanoid() {
    const { rig, torso, armR, armL, legR, legL, look } = this.p;
    const c = this.clock;
    const k = Math.min(1, this.t / this.dur);
    const s = this.state;
    const guard = look.weapon === 'sword' ? -2.3 : look.weapon === 'spear' ? -1.2 : 0.1;

    // 每幀先回到基準姿勢，再依狀態疊加
    rig.rotation.set(0, 0, 0);
    rig.position.y = 0;
    rig.scale.setScalar(look.scale);
    torso.rotation.set(0, 0, 0);
    torso.position.set(0, 0.55 + Math.sin(c * 3) * 0.015, 0);
    armR.rotation.set(guard, 0, 0);
    armL.rotation.set(0, 0, 0.15);
    legR.rotation.x = legL.rotation.x = 0;

    if (s === 'run') {
      const sw = Math.sin(c * 14);
      legR.rotation.x = sw * 0.9;
      legL.rotation.x = -sw * 0.9;
      armL.rotation.x = sw * 0.7;
      torso.rotation.x = 0.18;
      torso.position.y += Math.abs(sw) * 0.05;
    } else if (s === 'attack1' || s === 'attack2') {
      const dir = s === 'attack1' ? 1 : -1;
      armR.rotation.x = -Math.PI / 2;
      torso.rotation.y = dir * (1.5 - 3.0 * ease(k));
      torso.rotation.x = 0.15;
      legR.rotation.x = -0.4;
      legL.rotation.x = 0.4;
    } else if (s === 'attack3') {
      armR.rotation.x = -3.0 + 2.3 * ease(Math.min(1, k * 1.6));
      torso.rotation.x = -0.3 + 0.7 * ease(Math.min(1, k * 1.6));
      torso.position.y += 0.35 * Math.sin(Math.min(1, k * 1.6) * Math.PI);
    } else if (s === 'skill1') {
      armR.rotation.x = -Math.PI / 2;
      torso.rotation.y = -k * Math.PI * 4;
    } else if (s === 'skill2') {
      armR.rotation.x = -2.8 + 1.4 * ease(k);
      torso.rotation.y = 0.9 - 1.8 * ease(k);
    } else if (s === 'skill3') {
      armR.rotation.x = -3.1;
      armL.rotation.x = -3.1;
      torso.position.y += 0.5 * Math.sin(Math.min(1, k * 1.2) * Math.PI);
    } else if (s === 'dodge') {
      torso.rotation.x = 0.9;
      legR.rotation.x = 0.8;
      legL.rotation.x = -0.6;
    } else if (s === 'attack') {
      // 小怪通用攻擊：前段蓄力後仰，後段突刺
      const wind = Math.min(1, k / 0.6);
      const strike = k > 0.6 ? (k - 0.6) / 0.4 : 0;
      torso.rotation.x = -0.35 * wind + 0.8 * Math.sin(strike * Math.PI);
      armR.rotation.x = guard - 0.5 * wind + (-Math.PI / 2 - guard + 0.5) * Math.sin(strike * Math.PI);
      if (look.boss) { armL.rotation.x = armR.rotation.x = -3.0 * wind + 2.6 * strike; }
    } else if (s === 'hit') {
      torso.rotation.x = -0.5 * (1 - k);
    } else if (s === 'die') {
      rig.rotation.x = -Math.PI / 2 * ease(Math.min(1, k * 2));
      rig.position.y = 0.2 * look.scale * ease(Math.min(1, k * 2));
      rig.scale.setScalar(look.scale * (k < 0.5 ? 1 : Math.max(0.001, 1 - (k - 0.5) * 2)));
    }
  }

  dispose() {
    this.root.traverse((o) => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } });
  }
}

// ---------- GLB 角色 ----------

const loader = new GLTFLoader();
const library = {}; // kind -> { scene, clips, cfg }

// cfg 格式見 assets/README.md。載入失敗時回傳 false，呼叫端會退回佔位角色。
export async function loadModel(kind, cfg) {
  try {
    const gltf = await loader.loadAsync(cfg.url);
    gltf.scene.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; } });
    library[kind] = { scene: gltf.scene, clips: gltf.animations, cfg };
    return true;
  } catch (err) {
    console.warn(`[models] ${kind} 載入失敗，改用佔位角色：`, err);
    return false;
  }
}

export class GltfVisual {
  constructor(kind) {
    const { scene, clips, cfg } = library[kind];
    this.kind = kind;
    this.cfg = cfg;
    this.root = new THREE.Group();
    const model = SkeletonUtils.clone(scene);
    model.updateMatrixWorld(true); // 骨架世界矩陣要先更新，否則蒙皮模型的包圍盒會算錯
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const scale = (cfg.height || 1.5) / (size.y || 1);
    model.scale.setScalar(scale);
    model.position.y = -box.min.y * scale;
    model.rotation.y = cfg.rotationY || 0;
    this.root.add(model);

    this.mixer = new THREE.AnimationMixer(model);
    this.actions = {};
    for (const [state, clipName] of Object.entries(cfg.clips || {})) {
      const clip = THREE.AnimationClip.findByName(clips, clipName);
      if (clip) this.actions[state] = this.mixer.clipAction(clip);
    }
    this.current = null;
    this.state = '';
    this.flashT = 0;
    this.mats = [];
    model.traverse((o) => {
      if (o.isMesh) {
        o.material = o.material.clone();
        if (o.material.emissive) this.mats.push({ m: o.material, e: o.material.emissive.getHex(), i: o.material.emissiveIntensity });
      }
    });

    // 武器：若 manifest 另有 sword 模型且指定了手部骨骼，就掛上去
    if (cfg.weapon && library[cfg.weapon.kind] && cfg.weapon.bone) {
      const bone = model.getObjectByName(cfg.weapon.bone);
      if (bone) {
        const w = library[cfg.weapon.kind].scene.clone();
        const wc = cfg.weapon;
        w.scale.setScalar((wc.scale || 1) / scale);
        if (wc.position) w.position.fromArray(wc.position);
        if (wc.rotation) w.rotation.fromArray(wc.rotation);
        bone.add(w);
      }
    }
    this.play('idle');
  }

  pick(state) {
    if (this.actions[state]) return this.actions[state];
    if (/^attack\d$/.test(state)) return this.actions.attack1 || this.actions.attack;
    if (/^skill\d$/.test(state)) return this.actions.attack3 || this.actions.attack1 || this.actions.attack;
    if (state === 'dodge') return this.actions.run;
    return this.actions.idle;
  }

  play(state, dur = 0.4) {
    if (state === this.state && !ONE_SHOT.has(state)) return;
    this.state = state;
    const next = this.pick(state);
    if (!next) return;
    next.reset();
    if (ONE_SHOT.has(state)) {
      next.setLoop(THREE.LoopOnce, 1);
      next.clampWhenFinished = true;
      next.timeScale = next.getClip().duration / Math.max(0.05, dur); // 讓動作長度對齊判定時間
    } else {
      next.setLoop(THREE.LoopRepeat, Infinity);
      next.timeScale = 1;
    }
    if (this.current && this.current !== next) next.crossFadeFrom(this.current, 0.1, false);
    next.play();
    this.current = next;
  }

  flash() { this.flashT = 0.12; }

  update(dt) {
    this.mixer.update(dt);
    if (this.flashT > 0) {
      this.flashT -= dt;
      const on = this.flashT > 0;
      for (const s of this.mats) {
        s.m.emissive.setHex(on ? 0xffffff : s.e);
        s.m.emissiveIntensity = on ? 0.6 : s.i;
      }
    }
  }

  dispose() { this.mixer.stopAllAction(); }
}

export function createVisual(kind) {
  return library[kind] ? new GltfVisual(kind) : new ProcVisual(kind);
}
