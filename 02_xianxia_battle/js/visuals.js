// 角色外觀層。兩種實作共用同一介面：
//   root（THREE.Group，原點在腳底、面向 +Z）、play(state)、update(dt)、flash()
// ProcVisual：程式拼出的佔位角色與程式動畫（student、brave、angel、ganqiao、jiasen、folaidi、boss）。
// GltfVisual：載入 GLB（骨架動畫），由 assets/manifest.json 指定後自動取代佔位版。
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

const ONE_SHOT = new Set(['attack', 'attack1', 'attack2', 'attack3', 'skill1', 'skill2', 'skill3', 'ult', 'dodge', 'hit', 'die']);

const toon = (color, extra = {}) => new THREE.MeshToonMaterial({ color, ...extra });
const mesh = (geo, material, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  m.castShadow = true;
  return m;
};

// ---------- 佔位角色 ----------
// 比例依概念圖（人形約 4–5 頭身），不做 Q 版。全部是程式拼的幾何體，正式模型到位後由 GLB 取代。

const LOOKS = {
  student: { scale: 1, shirt: 0xf6c21c, pants: 0x2a2f3a, skin: 0xf7c9a0, hair: 0xa9642b, shoes: 0xf2f2f2, cap: true },
  brave: { scale: 1.03, shirt: 0xf6c21c, pants: 0x151515, skin: 0xf7c9a0, hair: 0x8a4b1f, shoes: 0xe23a1e, spiky: true, scarf: 0xe23a1e, gloves: 0xe23a1e, knee: 0x3fb53a, guard: true },
  ganqiao: { scale: 0.62, shirt: 0x2fa043, pants: 0x1f7a33, skin: 0x2fa043, hair: 0x2fa043, shoes: 0x1f7a33, horns: 0xf4d03f, claws: true, redEyes: true, stubby: true },
  jiasen: { scale: 0.95, shirt: 0xd9822b, pants: 0xb5651d, skin: 0xd9822b, hair: 0xd9822b, shoes: 0xb5651d, ears: true, mask: true, mohawk: 0xd62b1f, stubby: true },
  folaidi: { scale: 1, shirt: 0xf2f2f2, pants: 0x2b2b2b, skin: 0xc8322b, hair: 0x6b4a2a, shoes: 0x1b1b1b, stripes: true, hat: 0x6b4a2a },
  boss: { scale: 2.5, shirt: 0xf2f2f2, pants: 0x2b2b2b, skin: 0xc8322b, hair: 0x6b4a2a, shoes: 0x1b1b1b, stripes: true, hat: 0x6b4a2a, boss: true },
  // 以下為各關新增的佔位角色
  worker: { scale: 1.01, shirt: 0xf2f2f2, pants: 0x2c3440, skin: 0xf7c9a0, hair: 0x8a4b1f, shoes: 0x1b1b1b, shortHair: true, tie: 0x2c3440 },
  kaban: { scale: 1, shirt: 0x3a4660, pants: 0x232a3a, skin: 0xc8322b, hair: 0x6b4a2a, shoes: 0x1b1b1b, stripes: true, hat: 0x232a3a },
  kabanKing: { scale: 2.5, shirt: 0x3a4660, pants: 0x232a3a, skin: 0xc8322b, hair: 0x6b4a2a, shoes: 0x1b1b1b, stripes: true, hat: 0x232a3a, boss: true },
  jiamang: { scale: 0.95, shirt: 0x39404f, pants: 0x2a2f3a, skin: 0xd9822b, hair: 0xd9822b, shoes: 0x1b1b1b, ears: true, mask: true, mohawk: 0xd62b1f, stubby: true, tie: 0xe23a1e },
  ganqiao_mid: { scale: 1.25, shirt: 0x2b2b30, pants: 0x1c1c20, skin: 0x7c7f86, hair: 0x7c7f86, shoes: 0x1c1c20, horns: 0xf2f2f2, manyHorns: true, purpleEyes: true, stubby: true },
  midKing: { scale: 2.6, shirt: 0x2b2b30, pants: 0x1c1c20, skin: 0x7c7f86, hair: 0x7c7f86, shoes: 0x1c1c20, horns: 0xf2f2f2, manyHorns: true, purpleEyes: true, stubby: true, boss: true },
  ganqiaoFull: { scale: 3.0, shirt: 0xf29a2e, pants: 0xd97f1a, skin: 0xf29a2e, hair: 0xf29a2e, shoes: 0xd97f1a, horns: 0xf4d03f, redEyes: true, stubby: true, snout: true, boss: true },
  junxiong: { scale: 0.6, shirt: 0xf4f4f0, pants: 0xf4f4f0, skin: 0xf4f4f0, hair: 0x8a5a2b, shoes: 0xf7c9a0, hood: 0x8a5a2b, stubby: true },
  qian: { scale: 1.05, shirt: 0xffffff, pants: 0x1f3fa0, skin: 0xf7c9a0, hair: 0xf26fb5, shoes: 0x1b1b1b, ponytail: true, fan: true, scarf: 0xf4c542, boss: true },
  lan: { scale: 1.35, shirt: 0x1e4e9a, pants: 0x12305e, skin: 0xf0b98a, hair: 0x7a4a22, shoes: 0x1b1b1b, shortHair: true, whistle: true, boss: true },
  lanMgr: { scale: 1.35, shirt: 0x2a3550, pants: 0x1a2236, skin: 0xf0b98a, hair: 0x7a4a22, shoes: 0x1b1b1b, shortHair: true, whistle: true, tie: 0x1e4e9a, boss: true },
  nightmare: { scale: 1.03, shirt: 0x5b2a86, pants: 0x1a1024, skin: 0xe6c2a6, hair: 0x6a3a18, shoes: 0x2e8b2e, spiky: true, scarf: 0x2e8b2e, gloves: 0x2e8b2e, knee: 0x5b2a86, redEyes: true, guard: true, boss: true },
  hell: { scale: 1.12, shirt: 0x2a0f3a, pants: 0x120818, skin: 0x8a6a7a, hair: 0x9b3bd6, shoes: 0x3a0f4f, spiky: true, scarf: 0x3a0f4f, gloves: 0xff6a1a, knee: 0x3a0f4f, redEyes: true, guard: true, aura: 0x9b3bd6, boss: true },
  incubus: { scale: 1.08, shirt: 0x22252b, pants: 0x191b20, skin: 0xe6c2a6, hair: 0x4a2a14, shoes: 0x0b0b10, shortHair: true, tie: 0x2e8b2e, redEyes: true, boss: true },
  xinji: { scale: 0.75, shirt: 0x5c6b84, pants: 0xf9d84a, skin: 0xf9d84a, hair: 0xf9d84a, shoes: 0xf28a1b, beak: 0xf28a1b, stubby: true, boss: true },
  guan: { scale: 1.9, shirt: 0x1f2a44, pants: 0x5a3a1e, skin: 0xf2ede0, hair: 0x5a3a1e, shoes: 0xf2b21c, beak: 0xf2b21c, crown: true, wings: 0x5a3a1e, stubby: true, boss: true },
};

function buildHumanoid(look) {
  const root = new THREE.Group();
  const rig = new THREE.Group();
  rig.scale.setScalar(look.scale);
  root.add(rig);

  const stubby = !!look.stubby;
  const legLen = stubby ? 0.2 : 0.52;
  const legR0 = stubby ? 0.11 : 0.085;
  const hipY = legLen + legR0 * 2;
  const bodyR = stubby ? 0.34 : 0.21;
  const bodyLen = stubby ? 0.24 : 0.36;
  const torsoY = hipY + bodyR + bodyLen / 2 - 0.06;
  const headR = stubby ? 0.34 : 0.2;

  const mats = {
    shirt: toon(look.shirt), pants: toon(look.pants), skin: toon(look.skin),
    hair: toon(look.hair), shoes: toon(look.shoes), dark: toon(0x111111), white: toon(0xffffff),
  };

  const torso = new THREE.Group();
  torso.position.y = torsoY;
  rig.add(torso);
  torso.add(mesh(new THREE.CapsuleGeometry(bodyR, bodyLen, 4, 12), mats.shirt));
  if (look.stripes) {
    for (let i = 0; i < 4; i++) {
      const band = mesh(new THREE.CylinderGeometry(bodyR + 0.012, bodyR + 0.012, 0.07, 16), mats.dark, 0, -0.2 + i * 0.14, 0);
      torso.add(band);
    }
  }

  const head = new THREE.Group();
  head.position.y = bodyLen / 2 + bodyR + headR * 0.8;
  torso.add(head);
  head.add(mesh(new THREE.SphereGeometry(headR, 20, 16), mats.skin));
  const eyeColor = look.redEyes ? 0xd21f1f : look.purpleEyes ? 0xa24be0 : null;
  const eyeMat = eyeColor ? toon(eyeColor, { emissive: eyeColor, emissiveIntensity: 0.8 }) : mats.dark;
  if (!look.mask) for (const sx of [-1, 1]) head.add(mesh(new THREE.SphereGeometry(headR * 0.14, 8, 8), eyeMat, sx * headR * 0.38, 0, headR * 0.9));

  if (look.cap) {
    const cap = mesh(new THREE.SphereGeometry(headR + 0.02, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), mats.shirt, 0, 0.02, 0);
    head.add(cap);
    head.add(mesh(new THREE.BoxGeometry(headR * 1.5, 0.03, headR * 0.9), mats.shirt, 0, 0.04, headR * 0.95));
    head.add(mesh(new THREE.SphereGeometry(headR * 0.98, 14, 10), mats.hair, 0, -0.03, -0.04));
  }
  if (look.spiky) {
    head.add(mesh(new THREE.SphereGeometry(headR + 0.015, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), mats.hair, 0, 0.01, -0.02));
    const spikes = [[0, 1, 0, 0], [0.55, 0.8, 0, -0.6], [-0.55, 0.8, 0, 0.6], [0.3, 0.85, -0.5, -0.3], [-0.3, 0.85, -0.5, 0.3], [0, 0.7, -0.75, 0], [0.75, 0.45, -0.2, -1.1], [-0.75, 0.45, -0.2, 1.1], [0, 0.9, 0.45, 0]];
    for (const [x, y, z, rz] of spikes) {
      const sp = mesh(new THREE.ConeGeometry(headR * 0.3, headR * 1.1, 5), mats.hair, x * headR, y * headR + headR * 0.3, z * headR);
      sp.rotation.z = rz;
      sp.rotation.x = z < 0 ? -0.7 : z > 0 ? 0.5 : 0;
      head.add(sp);
    }
  }
  if (look.horns) {
    for (const sx of [-1, 1]) {
      const horn = mesh(new THREE.ConeGeometry(headR * 0.22, headR * 0.7, 6), toon(look.horns), sx * headR * 0.5, headR * 0.95, 0);
      horn.rotation.z = -sx * 0.4;
      head.add(horn);
    }
    const mouth = mesh(new THREE.BoxGeometry(headR * 1.0, headR * 0.16, 0.04), mats.white, 0, -headR * 0.4, headR * 0.86);
    head.add(mouth);
  }
  if (look.ears) for (const sx of [-1, 1]) head.add(mesh(new THREE.SphereGeometry(headR * 0.32, 10, 8), mats.skin, sx * headR * 0.75, headR * 0.7, 0));
  if (look.mask) {
    const mask = mesh(new THREE.SphereGeometry(headR * 0.92, 16, 12), toon(0xc9cdd3), 0, -0.02, headR * 0.28);
    mask.scale.set(0.9, 1.05, 0.7);
    head.add(mask);
    for (const sx of [-1, 1]) head.add(mesh(new THREE.SphereGeometry(headR * 0.15, 8, 8), mats.dark, sx * headR * 0.32, 0.03, headR * 0.92));
    head.userData.mask = mask;
  }
  if (look.mohawk) {
    for (let i = 0; i < 5; i++) {
      const sp = mesh(new THREE.ConeGeometry(headR * 0.2, headR * 0.8, 5), toon(look.mohawk), 0, headR * (1.0 - Math.abs(i - 2) * 0.12), headR * (0.5 - i * 0.28));
      sp.rotation.x = (i - 2) * -0.35;
      head.add(sp);
    }
  }
  if (look.hat) {
    head.add(mesh(new THREE.CylinderGeometry(headR * 1.5, headR * 1.5, 0.04, 18), toon(look.hat), 0, headR * 0.55, 0));
    head.add(mesh(new THREE.CylinderGeometry(headR * 0.8, headR * 0.9, headR * 0.7, 14), toon(look.hat), 0, headR * 0.9, 0));
  }
  if (look.shortHair) head.add(mesh(new THREE.SphereGeometry(headR + 0.015, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), mats.hair, 0, 0.02, -0.03));
  if (look.manyHorns) {
    for (const [x, z, rz] of [[0, 0.3, 0], [0.7, 0, -0.9], [-0.7, 0, 0.9], [0.35, -0.5, -0.4], [-0.35, -0.5, 0.4]]) {
      const horn = mesh(new THREE.ConeGeometry(headR * 0.2, headR * 0.9, 6), toon(look.horns), x * headR, headR * 0.95, z * headR);
      horn.rotation.z = rz;
      head.add(horn);
    }
  }
  if (look.snout) {
    const snout = mesh(new THREE.BoxGeometry(headR * 1.1, headR * 0.7, headR * 1.2), mats.skin, 0, -headR * 0.2, headR * 1.1);
    head.add(snout);
    head.add(mesh(new THREE.BoxGeometry(headR * 1.0, headR * 0.12, headR * 0.9), mats.white, 0, -headR * 0.5, headR * 1.25));
  }
  if (look.hood) {
    head.add(mesh(new THREE.SphereGeometry(headR + 0.05, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.72), toon(look.hood), 0, 0.02, -0.05));
    for (const sx of [-1, 1]) head.add(mesh(new THREE.SphereGeometry(headR * 0.34, 10, 8), toon(look.hood), sx * headR * 0.8, headR * 0.85, 0));
  }
  if (look.ponytail) {
    head.add(mesh(new THREE.SphereGeometry(headR + 0.02, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), mats.hair, 0, 0.01, -0.02));
    const tail = mesh(new THREE.CapsuleGeometry(headR * 0.3, headR * 1.6, 4, 8), mats.hair, 0, headR * 0.5, -headR * 1.3);
    tail.rotation.x = -0.9;
    head.add(tail);
  }
  if (look.beak) {
    const beak = mesh(new THREE.ConeGeometry(headR * 0.3, headR * 0.7, 6), toon(look.beak), 0, -headR * 0.1, headR * 1.05);
    beak.rotation.x = Math.PI / 2;
    head.add(beak);
  }
  if (look.crown) {
    head.add(mesh(new THREE.CylinderGeometry(headR * 0.5, headR * 0.42, headR * 0.35, 8), toon(0xe9c46a, { emissive: 0x7a5a10, emissiveIntensity: 0.6 }), 0, headR * 1.05, 0));
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      head.add(mesh(new THREE.ConeGeometry(headR * 0.1, headR * 0.3, 4), toon(0xe9c46a), Math.cos(a) * headR * 0.42, headR * 1.35, Math.sin(a) * headR * 0.42));
    }
  }
  if (look.tie) torso.add(mesh(new THREE.BoxGeometry(0.07, bodyLen * 0.9, 0.03), toon(look.tie), 0, 0.02, bodyR + 0.01));
  if (look.whistle) torso.add(mesh(new THREE.SphereGeometry(0.05, 8, 8), toon(0xc9ced6), 0.06, bodyLen * 0.3, bodyR + 0.03));
  if (look.aura) {
    const aura = mesh(new THREE.SphereGeometry(bodyR * 2.6, 12, 10), new THREE.MeshBasicMaterial({ color: look.aura, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false }), 0, 0.1, 0);
    aura.castShadow = false;
    aura.scale.y = 1.6;
    torso.add(aura);
  }
  if (look.scarf) {
    const scarfMat = toon(look.scarf);
    const ring = mesh(new THREE.TorusGeometry(bodyR * 0.75, 0.07, 8, 16), scarfMat, 0, bodyLen / 2 + bodyR * 0.75, 0);
    ring.rotation.x = Math.PI / 2;
    torso.add(ring);
    const tail = new THREE.Group();
    tail.position.set(0.08, bodyLen / 2 + bodyR * 0.7, -bodyR * 0.8);
    tail.add(mesh(new THREE.BoxGeometry(0.16, 0.05, 0.75), scarfMat, 0, 0, -0.38));
    torso.add(tail);
    torso.userData.scarfTail = tail;
  }

  const armR0 = stubby ? 0.1 : 0.065;
  const armLen = stubby ? 0.2 : 0.38;
  const limb = (r, len, material) => {
    const pivot = new THREE.Group();
    pivot.add(mesh(new THREE.CapsuleGeometry(r, len, 3, 8), material, 0, -(len / 2 + r), 0));
    return pivot;
  };
  const armR = limb(armR0, armLen, look.stubby ? mats.shirt : mats.skin);
  const armL = limb(armR0, armLen, look.stubby ? mats.shirt : mats.skin);
  armR.position.set(-(bodyR + armR0), bodyLen / 2 + bodyR * 0.35, 0);
  armL.position.set(bodyR + armR0, bodyLen / 2 + bodyR * 0.35, 0);
  torso.add(armR, armL);
  const handY = -(armLen + armR0 * 2);
  for (const arm of [armR, armL]) {
    if (look.claws) {
      const claw = mesh(new THREE.SphereGeometry(0.2, 10, 8), toon(0xb9bdc4), 0, handY - 0.05, 0.05);
      claw.scale.set(1, 0.6, 1.3);
      arm.add(claw);
    } else if (look.gloves) {
      arm.add(mesh(new THREE.SphereGeometry(armR0 * 1.7, 10, 8), toon(look.gloves), 0, handY, 0));
    }
  }

  const legR = limb(legR0, legLen, mats.pants);
  const legL = limb(legR0, legLen, mats.pants);
  legR.position.set(-bodyR * 0.5, hipY, 0);
  legL.position.set(bodyR * 0.5, hipY, 0);
  rig.add(legR, legL);
  for (const leg of [legR, legL]) {
    const shoe = mesh(new THREE.BoxGeometry(legR0 * 2.2, legR0 * 1.4, legR0 * 3.4), mats.shoes, 0, -(legLen + legR0 * 2) + legR0 * 0.7, legR0 * 0.6);
    leg.add(shoe);
    if (look.knee) leg.add(mesh(new THREE.SphereGeometry(legR0 * 1.5, 10, 8), toon(look.knee), 0, -(legLen * 0.5 + legR0), legR0 * 0.8));
  }

  const hand = new THREE.Group();
  hand.position.y = handY;
  armR.add(hand);
  if (look.wings) {
    for (const arm of [armR, armL]) {
      const wing = mesh(new THREE.BoxGeometry(0.08, armLen * 2.6, 0.7), toon(look.wings), 0, handY * 0.7, -0.1);
      arm.add(wing);
    }
  }
  if (look.fan) {
    const fan = mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.03, 16, 1, false, 0, Math.PI), mats.white, 0, -0.1, 0.1);
    fan.rotation.set(Math.PI / 2, 0, Math.PI / 2);
    hand.add(fan);
  }
  return { root, rig, torso, head, armR, armL, legR, legL, hand, look, torsoY };
}

function buildSnake() {
  // 八卦蛇：一串球體，由 updateSnake 做蠕動
  const root = new THREE.Group();
  const rig = new THREE.Group();
  root.add(rig);
  const segs = [];
  for (let i = 0; i < 9; i++) {
    const r = i === 0 ? 0.34 : 0.3 - i * 0.022;
    const seg = mesh(new THREE.SphereGeometry(r, 12, 10), toon(i % 2 ? 0xf2f2f2 : 0x2f5d50), 0, r, -i * 0.42);
    rig.add(seg);
    segs.push(seg);
  }
  for (const sx of [-1, 1]) segs[0].add(mesh(new THREE.SphereGeometry(0.06, 8, 8), toon(0xd62b1f, { emissive: 0xd62b1f, emissiveIntensity: 0.8 }), sx * 0.15, 0.12, 0.26));
  const tongue = mesh(new THREE.BoxGeometry(0.04, 0.02, 0.3), toon(0xd62b1f), 0, -0.05, 0.42);
  segs[0].add(tongue);
  return { root, rig, segs, snake: true };
}

function buildAngel() {
  // 小天使：只跟著飄，不參與戰鬥
  const root = new THREE.Group();
  const rig = new THREE.Group();
  root.add(rig);
  const pink = toon(0xf48fc6), red = toon(0xe0261c), white = toon(0xffffff), skin = toon(0xf7c9a0);
  rig.add(mesh(new THREE.CapsuleGeometry(0.14, 0.26, 4, 10), red, 0, 0.45, 0));
  rig.add(mesh(new THREE.ConeGeometry(0.24, 0.3, 12), toon(0x2a6fb8), 0, 0.2, 0));
  rig.add(mesh(new THREE.SphereGeometry(0.17, 16, 12), skin, 0, 0.82, 0));
  rig.add(mesh(new THREE.SphereGeometry(0.19, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.6), pink, 0, 0.83, -0.02));
  rig.add(mesh(new THREE.BoxGeometry(0.3, 0.6, 0.08), pink, 0, 0.5, -0.17));
  for (const sx of [-1, 1]) {
    const tip = mesh(new THREE.ConeGeometry(0.07, 0.3, 6), red, sx * 0.16, 1.03, 0);
    tip.rotation.z = -sx * 0.9;
    rig.add(tip);
    rig.add(mesh(new THREE.SphereGeometry(0.045, 8, 8), toon(0xf4c542), sx * 0.3, 1.1, 0));
    const wing = mesh(new THREE.SphereGeometry(0.2, 10, 8), white, sx * 0.3, 0.55, -0.14);
    wing.scale.set(1.3, 0.8, 0.2);
    wing.rotation.z = sx * 0.5;
    rig.add(wing);
    rig.userData[sx < 0 ? 'wingR' : 'wingL'] = wing;
    rig.add(mesh(new THREE.SphereGeometry(0.025, 6, 6), toon(0xd21f1f), sx * 0.06, 0.83, 0.16));
  }
  return { root, rig, angel: true };
}

const ease = (x) => 1 - (1 - x) * (1 - x);

export class ProcVisual {
  constructor(kind) {
    this.kind = kind;
    this.p = kind === 'angel' ? buildAngel() : kind === 'baguashe' ? buildSnake() : buildHumanoid(LOOKS[kind] || LOOKS.ganqiao);
    this.root = this.p.root;
    this.state = 'idle';
    this.t = 0;
    this.dur = 0.4;
    this.clock = Math.random() * 10;
    this.flashT = 0;
    this.glowOn = false;
    this.mats = [];
    this.root.traverse((o) => {
      if (o.isMesh && o.material.emissive && !o.userData.keepEmissive) { // 沒有自發光屬性的材質（光暈）略過
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

  // 持續發光（變身中的光之剪影）
  glow(on, color = 0xffffff) {
    this.glowOn = on;
    this.glowColor = color;
    this.applyEmissive();
  }

  applyEmissive() {
    const lit = this.flashT > 0 || this.glowOn;
    for (const s of this.mats) {
      s.m.emissive.setHex(lit ? (this.glowOn ? this.glowColor : 0xffffff) : s.e);
      s.m.emissiveIntensity = lit ? (this.glowOn ? 1.6 : 0.9) : s.i;
    }
  }

  update(dt) {
    this.t += dt;
    this.clock += dt;
    if (this.flashT > 0) {
      this.flashT -= dt;
      this.applyEmissive();
    }
    if (this.p.angel) this.updateAngel(); else if (this.p.snake) this.updateSnake(); else this.updateHumanoid();
  }

  updateSnake() {
    const { rig, segs } = this.p;
    const k = Math.min(1, this.t / this.dur);
    const speed = this.state === 'run' ? 9 : 4;
    segs.forEach((seg, i) => { seg.position.x = Math.sin(this.clock * speed - i * 0.7) * 0.22 * Math.min(1, i * 0.4); });
    segs[0].position.y = 0.34 + (this.state === 'attack' ? 0.9 * Math.sin(k * Math.PI) : 0.25);
    rig.scale.setScalar(this.state === 'die' ? Math.max(0.001, 1 - k) : 1);
  }

  updateAngel() {
    const { rig } = this.p;
    rig.position.y = Math.sin(this.clock * 2.4) * 0.08;
    const flap = Math.sin(this.clock * 9) * 0.35;
    rig.userData.wingR.rotation.y = flap;
    rig.userData.wingL.rotation.y = -flap;
  }

  updateHumanoid() {
    const { rig, torso, armR, armL, legR, legL, look, torsoY } = this.p;
    const c = this.clock;
    const k = Math.min(1, this.t / this.dur);
    const s = this.state;
    const sin = Math.sin(k * Math.PI);

    // 每幀先回到基準姿勢，再依狀態疊加
    rig.rotation.set(0, 0, 0);
    rig.position.y = 0;
    rig.scale.setScalar(look.scale);
    torso.rotation.set(0, 0, 0);
    torso.position.set(0, torsoY + Math.sin(c * 3) * 0.012, 0);
    armR.rotation.set(look.guard ? -1.3 : 0.05, 0, look.guard ? 0.25 : 0);
    armL.rotation.set(look.guard ? -1.1 : 0.05, 0, look.guard ? -0.25 : 0);
    legR.rotation.x = legL.rotation.x = 0;
    const tail = torso.userData.scarfTail;
    if (tail) tail.rotation.set(Math.sin(c * 5) * 0.15 - 0.2, Math.sin(c * 3.3) * 0.3, 0);

    if (s === 'run') {
      const sw = Math.sin(c * 13);
      legR.rotation.x = sw * 0.9;
      legL.rotation.x = -sw * 0.9;
      armR.rotation.x += -sw * 0.6;
      armL.rotation.x += sw * 0.6;
      torso.rotation.x = 0.2;
      torso.position.y += Math.abs(sw) * 0.04;
      if (tail) tail.rotation.x = 0.5;
    } else if (s === 'attack1' || s === 'attack2') {
      // 直拳：左右手輪流
      const arm = s === 'attack1' ? armR : armL;
      const dir = s === 'attack1' ? 1 : -1;
      arm.rotation.x = -Math.PI / 2 - 0.2 * sin;
      arm.position.z = 0.25 * sin;
      torso.rotation.y = dir * 0.7 * sin;
      torso.rotation.x = 0.2 * sin;
      legR.rotation.x = -0.35;
      legL.rotation.x = 0.35;
    } else if (s === 'attack3') {
      // 迴旋踢
      legR.rotation.x = -1.7 * sin;
      torso.rotation.x = -0.35 * sin;
      torso.rotation.y = -Math.PI * 2 * ease(k);
    } else if (s === 'skill1') {
      // 勇氣衝拳
      armR.rotation.x = -Math.PI / 2;
      armR.position.z = 0.3;
      torso.rotation.x = 0.55;
      legR.rotation.x = 0.9;
      legL.rotation.x = -0.5;
    } else if (s === 'skill2' || s === 'ult') {
      // 氣功彈／超勇氣波：雙手前推
      const push = s === 'ult' ? 1 : ease(Math.min(1, k * 2.5));
      armR.rotation.set(-Math.PI / 2 * push - 0.3 * (1 - push), 0, -0.25);
      armL.rotation.set(-Math.PI / 2 * push - 0.3 * (1 - push), 0, 0.25);
      torso.rotation.x = 0.15;
      legR.rotation.x = -0.4;
      legL.rotation.x = 0.4;
      if (s === 'ult') torso.position.z = Math.sin(c * 40) * 0.015;
    } else if (s === 'skill3') {
      // 氣功震地：舉拳後捶地
      const down = ease(Math.min(1, k * 2.2));
      armR.rotation.x = -3.0 + 2.6 * down;
      torso.rotation.x = -0.2 + 0.9 * down;
      torso.position.y -= 0.3 * down;
      legR.rotation.x = -0.9 * down;
      legL.rotation.x = 0.5 * down;
    } else if (s === 'transform') {
      // 變身：浮起、雙手高舉、緩慢旋轉
      armR.rotation.set(-2.9, 0, -0.3);
      armL.rotation.set(-2.9, 0, 0.3);
      rig.position.y = 0.35 + Math.sin(c * 4) * 0.05;
      rig.rotation.y = this.t * 3;
    } else if (s === 'dodge') {
      torso.rotation.x = 1.0;
      legR.rotation.x = 0.9;
      legL.rotation.x = -0.7;
    } else if (s === 'attack') {
      // 敵人通用攻擊：前段蓄力後仰，後段出手
      const wind = Math.min(1, k / 0.6);
      const strike = k > 0.6 ? (k - 0.6) / 0.4 : 0;
      const hit = Math.sin(strike * Math.PI);
      torso.rotation.x = -0.35 * wind + 0.8 * hit;
      armR.rotation.x = -0.6 * wind - 1.3 * hit;
      armL.rotation.x = -0.6 * wind - 1.3 * hit;
      if (look.boss) { armL.rotation.x = armR.rotation.x = -3.0 * wind + 2.6 * strike; }
    } else if (s === 'stun') {
      torso.rotation.z = Math.sin(c * 8) * 0.25;
      torso.rotation.x = 0.3;
    } else if (s === 'hit') {
      torso.rotation.x = -0.5 * (1 - k);
    } else if (s === 'die') {
      rig.rotation.x = -Math.PI / 2 * ease(Math.min(1, k * 2));
      rig.position.y = 0.2 * look.scale * ease(Math.min(1, k * 2));
      rig.scale.setScalar(look.scale * (k < 0.5 ? 1 : Math.max(0.001, 1 - (k - 0.5) * 2)));
    }
    if (s !== 'attack1' && s !== 'attack2' && s !== 'skill1') { armR.position.z = 0; armL.position.z = 0; }
    else if (s === 'attack1') armL.position.z = 0;
    else if (s === 'attack2') armR.position.z = 0;
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
    if (state === 'ult') return this.actions.skill2 || this.actions.attack1 || this.actions.attack;
    if (state === 'transform' || state === 'stun') return this.actions.idle;
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

  glow(on, color = 0xffffff) {
    this.glowOn = on;
    for (const m of this.mats) { m.m.emissive.setHex(on ? color : m.e); m.m.emissiveIntensity = on ? 1.2 : m.i; }
  }

  update(dt) {
    this.mixer.update(dt);
    if (this.flashT > 0) {
      this.flashT -= dt;
      const on = this.flashT > 0;
      if (!this.glowOn) for (const s of this.mats) {
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
