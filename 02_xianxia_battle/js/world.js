// 佔位場景：全部以程式生成（森林空地）。之後可換成 GLB 場景件。
import * as THREE from 'three';

export const ARENA_RADIUS = 24;

// 固定種子，讓每次進場景的擺設一致，方便比對截圖
function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function scatter(mesh, count, place) {
  const d = new THREE.Object3D();
  const c = new THREE.Color();
  for (let i = 0; i < count; i++) {
    place(d, c, i);
    d.updateMatrix();
    mesh.setMatrixAt(i, d.matrix);
    if (mesh.instanceColor !== undefined) mesh.setColorAt(i, c);
  }
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
}

export function buildWorld(scene) {
  const rand = rng(20261110);
  const sky = new THREE.Color(0xbfe3d6);
  scene.background = sky;
  scene.fog = new THREE.Fog(sky, 38, 85);

  scene.add(new THREE.HemisphereLight(0xeaf6ff, 0x3f6b4a, 0.85));
  const sun = new THREE.DirectionalLight(0xfff0d0, 1.7);
  sun.position.set(-14, 26, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = sun.shadow.camera.bottom = -22;
  sun.shadow.camera.right = sun.shadow.camera.top = 22;
  sun.shadow.camera.far = 80;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.03;
  scene.add(sun, sun.target);

  // 地面：頂點色做出草地深淺
  const groundGeo = new THREE.PlaneGeometry(180, 180, 90, 90);
  groundGeo.rotateX(-Math.PI / 2);
  const pos = groundGeo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const col = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const n = Math.sin(x * 0.21) * Math.cos(z * 0.17) * 0.5 + Math.sin(x * 0.07 + z * 0.11) * 0.5;
    const inArena = Math.hypot(x, z) < ARENA_RADIUS;
    col.setHSL(0.27 + n * 0.02, 0.5, (inArena ? 0.36 : 0.27) + n * 0.06 + (rand() - 0.5) * 0.03);
    colors.set([col.r, col.g, col.b], i * 3);
  }
  groundGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const ground = new THREE.Mesh(groundGeo, new THREE.MeshToonMaterial({ vertexColors: true }));
  ground.receiveShadow = true;
  scene.add(ground);

  // 中央石陣
  const stoneMat = new THREE.MeshToonMaterial({ color: 0x8b958e });
  const dais = new THREE.Mesh(new THREE.CylinderGeometry(6, 6.3, 0.12, 40), stoneMat);
  dais.position.y = 0.06;
  dais.receiveShadow = true;
  scene.add(dais);
  for (const r of [2.2, 4.2]) {
    const ringMesh = new THREE.Mesh(new THREE.TorusGeometry(r, 0.07, 6, 48), new THREE.MeshToonMaterial({ color: 0x6f7a72 }));
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 0.13;
    scene.add(ringMesh);
  }

  // 踏腳石
  const steps = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.7, 0.8, 0.1, 7), stoneMat, 26);
  steps.receiveShadow = true;
  scatter(steps, 26, (d, c, i) => {
    const t = i / 25;
    d.position.set(-22 + t * 44 + (rand() - 0.5), 0.05, Math.sin(t * 5) * 5 + 12 + (rand() - 0.5));
    d.rotation.y = rand() * 6;
    d.scale.set(0.8 + rand() * 0.6, 1, 0.8 + rand() * 0.6);
  });
  scene.add(steps);

  // 樹：圍在場地外圈
  const TREES = 110;
  const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.35, 0.55, 4, 7), new THREE.MeshToonMaterial({ color: 0x6b4a2f }), TREES);
  const crownMat = new THREE.MeshToonMaterial({ color: 0xffffff });
  const crownA = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(2.6, 1), crownMat, TREES);
  const crownB = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1.9, 1), crownMat, TREES);
  const spots = [];
  for (let i = 0; i < TREES; i++) {
    const a = rand() * Math.PI * 2;
    const r = ARENA_RADIUS + 3 + rand() * 30;
    spots.push({ x: Math.cos(a) * r, z: Math.sin(a) * r, s: 0.8 + rand() * 0.9, h: 0.26 + rand() * 0.08, l: 0.3 + rand() * 0.14 });
  }
  scatter(trunk, TREES, (d, c, i) => { const p = spots[i]; d.position.set(p.x, 2 * p.s, p.z); d.rotation.set(0, 0, 0); d.scale.setScalar(p.s); });
  scatter(crownA, TREES, (d, c, i) => { const p = spots[i]; d.position.set(p.x, 5 * p.s, p.z); d.rotation.y = i; d.scale.setScalar(p.s); c.setHSL(p.h, 0.5, p.l); });
  scatter(crownB, TREES, (d, c, i) => { const p = spots[i]; d.position.set(p.x + p.s, 6.6 * p.s, p.z - 0.6 * p.s); d.rotation.y = i * 2; d.scale.setScalar(p.s); c.setHSL(p.h + 0.02, 0.5, p.l + 0.06); });
  for (const m of [trunk, crownA, crownB]) { m.castShadow = true; scene.add(m); }

  // 石塊
  const rocks = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), new THREE.MeshToonMaterial({ color: 0x8a8f8a }), 40);
  rocks.castShadow = rocks.receiveShadow = true;
  scatter(rocks, 40, (d) => {
    const a = rand() * Math.PI * 2;
    const r = ARENA_RADIUS + 0.5 + rand() * 6;
    const s = 0.5 + rand() * 1.4;
    d.position.set(Math.cos(a) * r, s * 0.35, Math.sin(a) * r);
    d.rotation.set(rand() * 3, rand() * 3, rand() * 3);
    d.scale.set(s, s * 0.7, s);
  });
  scene.add(rocks);

  // 草叢與小花
  const grass = new THREE.InstancedMesh(new THREE.ConeGeometry(0.09, 0.5, 4), new THREE.MeshToonMaterial({ color: 0xffffff }), 2600);
  scatter(grass, 2600, (d, c) => {
    const a = rand() * Math.PI * 2;
    const r = 6.5 + Math.sqrt(rand()) * 34;
    d.position.set(Math.cos(a) * r, 0.2, Math.sin(a) * r);
    d.rotation.set((rand() - 0.5) * 0.5, rand() * 6, (rand() - 0.5) * 0.5);
    d.scale.setScalar(0.6 + rand() * 0.9);
    c.setHSL(0.26 + rand() * 0.06, 0.55, 0.3 + rand() * 0.14);
  });
  scene.add(grass);
  const flowers = new THREE.InstancedMesh(new THREE.SphereGeometry(0.1, 6, 5), new THREE.MeshToonMaterial({ color: 0xffffff }), 320);
  scatter(flowers, 320, (d, c) => {
    const a = rand() * Math.PI * 2;
    const r = 6.5 + Math.sqrt(rand()) * 30;
    d.position.set(Math.cos(a) * r, 0.28, Math.sin(a) * r);
    d.rotation.set(0, 0, 0);
    d.scale.setScalar(0.8 + rand() * 0.6);
    c.setHSL([0.93, 0.14, 0.58, 0][Math.floor(rand() * 4)], 0.8, 0.78);
  });
  scene.add(flowers);

  return { sun };
}
