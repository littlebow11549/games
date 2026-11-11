// 佔位場景：主角內心的黑暗校園（紫色格紋地板的長廊大廳）。全部以程式生成，之後可換成 GLB 場景件。
import * as THREE from 'three';

export const ARENA_RADIUS = 26;

// 固定種子，讓每次進場景的擺設一致，方便比對截圖
function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function checkerTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = '#5f4f9e'; g.fillRect(0, 0, 64, 64);
  g.fillStyle = '#8576c2'; g.fillRect(0, 0, 32, 32); g.fillRect(32, 32, 32, 32);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.repeat.set(16, 16);
  return tex;
}

export function buildWorld(scene) {
  const rand = rng(20261111);
  const dark = new THREE.Color(0x1a1230);
  scene.background = dark;
  scene.fog = new THREE.Fog(dark, 30, 70);

  scene.add(new THREE.HemisphereLight(0xd8ccff, 0x2a1f4a, 0.95));
  const sun = new THREE.DirectionalLight(0xfff0d8, 1.5);
  sun.position.set(-14, 26, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = sun.shadow.camera.bottom = -24;
  sun.shadow.camera.right = sun.shadow.camera.top = 24;
  sun.shadow.camera.far = 80;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.03;
  scene.add(sun, sun.target);

  // 地板：紫色格紋（取自概念圖封底的舊版畫面）
  const floor = new THREE.Mesh(new THREE.CircleGeometry(ARENA_RADIUS + 1.5, 64), new THREE.MeshToonMaterial({ map: checkerTexture() }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  const rim = new THREE.Mesh(new THREE.RingGeometry(ARENA_RADIUS + 1.5, ARENA_RADIUS + 9, 64), new THREE.MeshBasicMaterial({ color: 0x120c22 }));
  rim.rotation.x = -Math.PI / 2;
  rim.position.y = -0.02;
  scene.add(rim);

  // 周圍一圈歪斜的置物櫃
  const N = 54;
  const lockers = new THREE.InstancedMesh(new THREE.BoxGeometry(1.5, 3.4, 0.9), new THREE.MeshToonMaterial({ color: 0xffffff }), N);
  lockers.castShadow = true;
  const d = new THREE.Object3D();
  const c = new THREE.Color();
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const r = ARENA_RADIUS + 2.2 + rand() * 0.6;
    d.position.set(Math.cos(a) * r, 1.7, Math.sin(a) * r);
    d.rotation.set((rand() - 0.5) * 0.12, -a + Math.PI / 2, (rand() - 0.5) * 0.14);
    d.scale.set(1, 0.85 + rand() * 0.5, 1);
    d.updateMatrix();
    lockers.setMatrixAt(i, d.matrix);
    c.setHSL(0.6 + rand() * 0.08, 0.25, 0.32 + rand() * 0.12);
    lockers.setColorAt(i, c);
  }
  lockers.instanceColor.needsUpdate = true;
  scene.add(lockers);

  // 幾扇過大的門（主角的房門比平常大三倍）
  const doorMat = new THREE.MeshToonMaterial({ color: 0xd9a066 });
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xfff2b0 });
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    const g = new THREE.Group();
    const door = new THREE.Mesh(new THREE.BoxGeometry(4, 9, 0.4), doorMat);
    door.position.y = 4.5;
    door.castShadow = true;
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), glowMat);
    knob.position.set(1.4, 4.2, 0.3);
    g.add(door, knob);
    g.position.set(Math.cos(a) * (ARENA_RADIUS + 5), 0, Math.sin(a) * (ARENA_RADIUS + 5));
    g.rotation.y = -a + Math.PI / 2;
    g.rotation.z = (i % 2 ? 1 : -1) * 0.08;
    scene.add(g);
  }

  // 中央的圓形標記
  for (const r of [3, 6]) {
    const ringMesh = new THREE.Mesh(new THREE.RingGeometry(r - 0.08, r + 0.08, 64), new THREE.MeshBasicMaterial({ color: 0x5a4a8f, transparent: true, opacity: 0.7 }));
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = 0.02;
    scene.add(ringMesh);
  }

  return { sun };
}
