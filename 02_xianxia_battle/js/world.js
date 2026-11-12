// 佔位場景：主角內心的黑暗世界。每一關一個主題，全部以程式生成，之後可換成 GLB 場景件。
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

// floor：[色1, 色2, 格數]；色2 為 null 時是素色地板
export const THEMES = {
  dorm: { bg: 0x2a1a2e, fog: [28, 64], floor: ['#c96a8e', '#d98aa6', 10], hemi: [0xffd8e8, 0x3a1f3a, 0.95], sun: [0xfff0d8, 1.4], props: ['doors', 'beds'], mark: 0x8f3f66 },
  corridor: { bg: 0x1a1230, fog: [30, 70], floor: ['#5f4f9e', '#8576c2', 16], hemi: [0xd8ccff, 0x2a1f4a, 0.95], sun: [0xfff0d8, 1.5], props: ['lockers', 'doors'], mark: 0x5a4a8f },
  court: { bg: 0x10162a, fog: [32, 74], floor: ['#b5651d', '#c0722a', 6], hemi: [0xbfd4ff, 0x1a2140, 0.85], sun: [0xcfe0ff, 1.5], props: ['hoops', 'stands'], mark: 0xffffff },
  office: { bg: 0x1c1a16, fog: [30, 68], floor: ['#7a8a5a', '#8a9a68', 12], hemi: [0xfff2c8, 0x2a2a1a, 0.9], sun: [0xfff0c0, 1.5], props: ['lockers', 'flags'], mark: 0x4a5a30 },
  gate: { bg: 0x2a1438, fog: [30, 70], floor: ['#6a5a78', null, 1], hemi: [0xf0b0ff, 0x2a1438, 0.9], sun: [0xff9ad0, 1.6], props: ['gate', 'notes'], mark: 0x8a4fd6 },
  forest: { bg: 0x08100c, fog: [20, 52], floor: ['#1f3a26', '#24422b', 20], hemi: [0x9fd8b0, 0x06100a, 0.7], sun: [0xbfe8c8, 1.1], props: ['trees', 'signs'], mark: 0x2f5a3a },
  village: { bg: 0x0a0a16, fog: [22, 56], floor: ['#3a2f26', '#44372c', 14], hemi: [0xb0b8ff, 0x0a0a16, 0.7], sun: [0xffd8a0, 1.2], props: ['houses', 'notes'], mark: 0x9b3bd6 },
  desk: { bg: 0x14161a, fog: [26, 60], floor: ['#8a8f96', '#979ca3', 18], hemi: [0xf2f6ff, 0x2a2e36, 1.05], sun: [0xf2f6ff, 1.2], props: ['cubicles', 'frames'], mark: 0x5a6068 },
  lobby: { bg: 0x14161a, fog: [28, 64], floor: ['#9a9fa6', '#a8adb4', 8], hemi: [0xf2f6ff, 0x2a2e36, 1.05], sun: [0xf2f6ff, 1.3], props: ['gate', 'cubicles'], mark: 0x5a6068 },
  openoffice: { bg: 0x14161a, fog: [28, 64], floor: ['#8f8672', '#9a917c', 6], hemi: [0xf2f6ff, 0x2a2e36, 1.05], sun: [0xf2f6ff, 1.3], props: ['cubicles', 'hoops'], mark: 0xffffff },
  meeting: { bg: 0x12141a, fog: [26, 60], floor: ['#5a6a4a', '#66775a', 12], hemi: [0xe8eeff, 0x22262e, 1.0], sun: [0xe8eeff, 1.3], props: ['lockers', 'screens'], mark: 0x3a4a2a },
  callcenter: { bg: 0x12141a, fog: [26, 60], floor: ['#6a7a8a', '#768696', 16], hemi: [0xe8eeff, 0x22262e, 1.0], sun: [0xe8eeff, 1.3], props: ['cubicles', 'notes'], mark: 0x3a4a5a },
  bossroom: { bg: 0x1a1408, fog: [30, 70], floor: ['#5a2a2a', '#6a3232', 8], hemi: [0xfff0c0, 0x2a1a08, 0.95], sun: [0xffe0a0, 1.6], props: ['perch', 'flags'], mark: 0xe9c46a },
  core: { bg: 0x05050a, fog: [18, 48], floor: ['#16161f', '#1c1c28', 10], hemi: [0xb0b0ff, 0x05050a, 0.75], sun: [0xd0d0ff, 1.2], props: ['fragments'], mark: 0x2e8b2e },
};

function floorTexture([c1, c2, n]) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 64;
  const g = cv.getContext('2d');
  g.fillStyle = c1; g.fillRect(0, 0, 64, 64);
  if (c2) { g.fillStyle = c2; g.fillRect(0, 0, 32, 32); g.fillRect(32, 32, 32, 32); }
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.repeat.set(n, n);
  return tex;
}

function ringOf(group, rand, count, geo, color, place, tint = true) {
  const m = new THREE.InstancedMesh(geo, new THREE.MeshToonMaterial({ color: tint ? 0xffffff : color }), count);
  m.castShadow = true;
  const d = new THREE.Object3D();
  const c = new THREE.Color(color), c2 = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + rand() * 0.05;
    d.rotation.set(0, 0, 0);
    d.scale.set(1, 1, 1);
    place(d, a, i);
    d.updateMatrix();
    m.setMatrixAt(i, d.matrix);
    if (tint) { c2.copy(c).offsetHSL((rand() - 0.5) * 0.04, 0, (rand() - 0.5) * 0.12); m.setColorAt(i, c2); }
  }
  if (tint) m.instanceColor.needsUpdate = true;
  group.add(m);
  return m;
}

const R = ARENA_RADIUS;
const PROPS = {
  lockers: (g, rand) => ringOf(g, rand, 54, new THREE.BoxGeometry(1.5, 3.4, 0.9), 0x4a5a7a, (d, a) => {
    const r = R + 2.2 + rand() * 0.6;
    d.position.set(Math.cos(a) * r, 1.7, Math.sin(a) * r);
    d.rotation.set((rand() - 0.5) * 0.12, -a + Math.PI / 2, (rand() - 0.5) * 0.14);
    d.scale.y = 0.85 + rand() * 0.5;
  }),
  doors: (g) => {
    const doorMat = new THREE.MeshToonMaterial({ color: 0xd9a066 });
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xfff2b0 });
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      const grp = new THREE.Group();
      const door = new THREE.Mesh(new THREE.BoxGeometry(4, 9, 0.4), doorMat);
      door.position.y = 4.5;
      door.castShadow = true;
      const knob = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), glowMat);
      knob.position.set(1.4, 4.2, 0.3);
      grp.add(door, knob);
      grp.position.set(Math.cos(a) * (R + 5), 0, Math.sin(a) * (R + 5));
      grp.rotation.y = -a + Math.PI / 2;
      grp.rotation.z = (i % 2 ? 1 : -1) * 0.08;
      g.add(grp);
    }
  },
  beds: (g, rand) => ringOf(g, rand, 10, new THREE.BoxGeometry(3, 0.9, 5), 0xf2e6d0, (d, a) => {
    d.position.set(Math.cos(a) * (R + 3.5), 0.45, Math.sin(a) * (R + 3.5));
    d.rotation.y = -a + rand();
  }),
  hoops: (g) => {
    for (const sx of [-1, 1]) {
      const grp = new THREE.Group();
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 6, 8), new THREE.MeshToonMaterial({ color: 0x3a6fd0 }));
      pole.position.y = 3;
      const board = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.2, 0.15), new THREE.MeshToonMaterial({ color: 0xffffff }));
      board.position.set(0, 5.6, 0.6);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.06, 6, 16), new THREE.MeshToonMaterial({ color: 0xe23a1e }));
      rim.rotation.x = Math.PI / 2;
      rim.position.set(0, 4.9, 1.25);
      grp.add(pole, board, rim);
      grp.traverse((o) => { if (o.isMesh) o.castShadow = true; });
      grp.position.set(sx * (R + 1.5), 0, 0);
      grp.rotation.y = -sx * Math.PI / 2;
      g.add(grp);
    }
  },
  stands: (g, rand) => ringOf(g, rand, 40, new THREE.BoxGeometry(3.6, 1.2, 2), 0x39405a, (d, a, i) => {
    const row = i % 2;
    d.position.set(Math.cos(a) * (R + 4 + row * 2.2), 0.6 + row * 1.1, Math.sin(a) * (R + 4 + row * 2.2));
    d.rotation.y = -a + Math.PI / 2;
  }),
  flags: (g, rand) => ringOf(g, rand, 12, new THREE.BoxGeometry(0.15, 7, 2.2), 0xb03030, (d, a) => {
    d.position.set(Math.cos(a) * (R + 4.5), 5, Math.sin(a) * (R + 4.5));
    d.rotation.y = -a;
  }),
  gate: (g) => {
    // 校門；地圖三的打卡機沿用同一個形狀（場景是校園改建的）
    const mat = new THREE.MeshToonMaterial({ color: 0x8a8f96 });
    for (const sx of [-1, 1]) {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(2.4, 10, 2.4), mat);
      pillar.position.set(sx * 6, 5, -(R + 3));
      pillar.castShadow = true;
      g.add(pillar);
    }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(15, 1.6, 2), mat);
    beam.position.set(0, 10.4, -(R + 3));
    const light = new THREE.Mesh(new THREE.BoxGeometry(9, 6, 0.3), new THREE.MeshBasicMaterial({ color: 0xfff2d0 }));
    light.position.set(0, 4.5, -(R + 3.4));
    g.add(beam, light);
  },
  notes: (g, rand) => ringOf(g, rand, 70, new THREE.PlaneGeometry(0.7, 0.9), 0xf2efe0, (d) => {
    const a = rand() * Math.PI * 2, r = 6 + rand() * (R + 6);
    d.position.set(Math.cos(a) * r, 2.5 + rand() * 7, Math.sin(a) * r);
    d.rotation.set(rand() * 3, rand() * 6, rand() * 3);
  }),
  trees: (g, rand) => {
    ringOf(g, rand, 90, new THREE.CylinderGeometry(0.3, 0.5, 6, 6), 0x2a1f18, (d) => {
      const a = rand() * Math.PI * 2, r = R + 2 + rand() * 22;
      d.position.set(Math.cos(a) * r, 3, Math.sin(a) * r);
      d.rotation.z = (rand() - 0.5) * 0.3;
      d.scale.setScalar(0.8 + rand() * 1.1);
    });
    ringOf(g, rand, 60, new THREE.IcosahedronGeometry(2.6, 0), 0x12301c, (d) => {
      const a = rand() * Math.PI * 2, r = R + 3 + rand() * 20;
      d.position.set(Math.cos(a) * r, 6 + rand() * 3, Math.sin(a) * r);
      d.scale.setScalar(0.8 + rand());
    });
  },
  signs: (g, rand) => ringOf(g, rand, 26, new THREE.BoxGeometry(1.8, 0.5, 0.1), 0xd9c8a0, (d) => {
    // 一堆指向不同方向的路牌
    const a = rand() * Math.PI * 2, r = R + 1 + rand() * 5;
    d.position.set(Math.cos(a) * r, 1.6 + rand() * 1.4, Math.sin(a) * r);
    d.rotation.y = rand() * 6;
    d.rotation.z = (rand() - 0.5) * 0.4;
  }),
  houses: (g, rand) => {
    ringOf(g, rand, 18, new THREE.BoxGeometry(5, 4, 5), 0x4a3a2a, (d, a) => {
      d.position.set(Math.cos(a) * (R + 6), 2, Math.sin(a) * (R + 6));
      d.rotation.y = -a + (rand() - 0.5) * 0.4;
    });
    ringOf(g, rand, 18, new THREE.ConeGeometry(4.4, 2.6, 4), 0x2a1f18, (d, a) => {
      d.position.set(Math.cos(a) * (R + 6), 5.3, Math.sin(a) * (R + 6));
      d.rotation.y = -a + Math.PI / 4;
    });
    // 每扇窗都亮著
    const win = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.2, 1.2), new THREE.MeshBasicMaterial({ color: 0xffd98a }), 18);
    const d = new THREE.Object3D();
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      d.position.set(Math.cos(a) * (R + 3.45), 2.2, Math.sin(a) * (R + 3.45));
      d.rotation.set(0, -a - Math.PI / 2, 0);
      d.updateMatrix();
      win.setMatrixAt(i, d.matrix);
    }
    g.add(win);
  },
  cubicles: (g, rand) => ringOf(g, rand, 60, new THREE.BoxGeometry(3.2, 1.6, 0.15), 0xb8bcc4, (d, a, i) => {
    const row = i % 3;
    d.position.set(Math.cos(a) * (R + 2 + row * 2.6), 0.8, Math.sin(a) * (R + 2 + row * 2.6));
    d.rotation.y = -a + Math.PI / 2 + (row === 1 ? Math.PI / 2 : 0);
  }),
  frames: (g, rand) => ringOf(g, rand, 24, new THREE.BoxGeometry(1.6, 2, 0.1), 0xe9c46a, (d, a) => {
    // 牆上一整排「年度最佳員工」相框
    d.position.set(Math.cos(a) * (R + 9.5), 5, Math.sin(a) * (R + 9.5));
    d.rotation.y = -a + Math.PI / 2;
  }),
  screens: (g, rand) => ringOf(g, rand, 8, new THREE.BoxGeometry(7, 4, 0.2), 0xe8eeff, (d, a) => {
    d.position.set(Math.cos(a) * (R + 5), 5, Math.sin(a) * (R + 5));
    d.rotation.y = -a + Math.PI / 2;
  }, false),
  perch: (g) => {
    const gold = new THREE.MeshToonMaterial({ color: 0xe9c46a, emissive: 0x5a4208, emissiveIntensity: 0.5 });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 12, 10), gold);
    pole.position.set(0, 6, -(R + 2));
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 6, 8), gold);
    bar.rotation.z = Math.PI / 2;
    bar.position.set(0, 12, -(R + 2));
    pole.castShadow = true;
    g.add(pole, bar);
  },
  fragments: (g, rand) => {
    // 校園、荒野、城市的碎片漂浮在黑霧裡
    for (const [geo, color] of [[new THREE.BoxGeometry(1.5, 3.4, 0.9), 0x4a5a7a], [new THREE.CylinderGeometry(0.3, 0.5, 6, 6), 0x2a3f2a], [new THREE.BoxGeometry(3.2, 1.6, 0.15), 0xb8bcc4]]) {
      ringOf(g, rand, 22, geo, color, (d) => {
        const a = rand() * Math.PI * 2, r = R + rand() * 16;
        d.position.set(Math.cos(a) * r, 2 + rand() * 12, Math.sin(a) * r);
        d.rotation.set(rand() * 6, rand() * 6, rand() * 6);
      });
    }
    const desk = new THREE.Mesh(new THREE.BoxGeometry(5, 1.4, 2.4), new THREE.MeshToonMaterial({ color: 0x3a2a1a }));
    desk.position.set(0, 0.7, -(R - 2));
    desk.castShadow = true;
    g.add(desk);
  },
};

let current = null;

// 建立（或重建）指定主題的場景。回傳 { sun } 供鏡頭更新陰影位置。
export function buildWorld(scene, themeName = 'corridor') {
  if (current) {
    scene.remove(current);
    current.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); }
    });
  }
  const t = THEMES[themeName] || THEMES.corridor;
  const rand = rng(20261112 + themeName.length * 7919);
  const g = new THREE.Group();
  current = g;
  scene.add(g);

  const bg = new THREE.Color(t.bg);
  scene.background = bg;
  scene.fog = new THREE.Fog(bg, t.fog[0], t.fog[1]);

  g.add(new THREE.HemisphereLight(t.hemi[0], t.hemi[1], t.hemi[2]));
  const sun = new THREE.DirectionalLight(t.sun[0], t.sun[1]);
  sun.position.set(-14, 26, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = sun.shadow.camera.bottom = -24;
  sun.shadow.camera.right = sun.shadow.camera.top = 24;
  sun.shadow.camera.far = 80;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.03;
  g.add(sun, sun.target);

  const floor = new THREE.Mesh(new THREE.CircleGeometry(R + 1.5, 64), new THREE.MeshToonMaterial({ map: floorTexture(t.floor) }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  g.add(floor);
  const rim = new THREE.Mesh(new THREE.RingGeometry(R + 1.5, R + 40, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color(t.bg).multiplyScalar(0.6) }));
  rim.rotation.x = -Math.PI / 2;
  rim.position.y = -0.02;
  g.add(rim);

  for (const r of [3, 6]) {
    const ringMesh = new THREE.Mesh(new THREE.RingGeometry(r - 0.08, r + 0.08, 64), new THREE.MeshBasicMaterial({ color: t.mark, transparent: true, opacity: 0.6 }));
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = 0.02;
    g.add(ringMesh);
  }
  for (const name of t.props) PROPS[name](g, rand);
  return { sun };
}
