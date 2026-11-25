// Isolated Brave hallway ki FX. Native groups still own position, hit volumes,
// penetration, timers, sounds and damage; this module owns only drawn meshes.
export function createHallwayFx(THREE, scene) {
  const shots = new Map();
  const impacts = [];
  const TAU = Math.PI * 2;
  const dir = new THREE.Vector3();
  const forward = new THREE.Vector3(0, 0, 1);
  const lime = 0xadff64;
  const gold = 0xffd876;
  let disposed = false;

  const material = (color, extra = {}) => new THREE.MeshBasicMaterial({ color, depthWrite: false, ...extra });
  const glow = (color, opacity) => material(color, {
    transparent: true, opacity, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
  });
  function spindle(profiles, n = 12) {
    const vertices = [], triangles = [];
    for (let row = 0; row < profiles.length; row++) {
      const [z, rx, ry] = profiles[row];
      for (let i = 0; i < n; i++) {
        const a = TAU * (i + (row % 2) * 0.25) / n;
        vertices.push(rx * Math.cos(a), ry * Math.sin(a), z);
      }
    }
    for (let row = 0; row < profiles.length - 1; row++) {
      for (let i = 0; i < n; i++) {
        const a = row * n + i, b = row * n + (i + 1) % n;
        triangles.push(a, b, a + n, b, b + n, a + n);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    g.setIndex(triangles);
    g.computeBoundingSphere();
    return g;
  }
  function ribbon(points) {
    const verts = [], indices = [];
    for (let i = 0; i < points.length; i++) {
      const [x, y, z, width] = points[i];
      verts.push(x - width, y, z, x + width, y, z);
      if (i > 0) {
        const a = 2 * (i - 1);
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    g.setIndex(indices);
    g.computeBoundingSphere();
    return g;
  }
  const coreGeo = spindle([[-1.95, 0, 0], [-.8, .37, .28], [.16, .71, .55], [.72, .53, .42], [1.16, 0, 0]]);
  const rimGeo = spindle([[-2.1, 0, 0], [-.99, .47, .36], [-.12, .82, .63], [.47, .79, .59], [1.03, .44, .36], [1.31, 0, 0]]);
  const auraGeo = spindle([[-3.2, 0, 0], [-1.5, .60, .45], [-.43, 1.12, .79], [.36, 1.02, .78], [1.52, 0, 0]]);
  const mainRibbon = ribbon([[.50, .09, .60, 0], [.94, .12, -.18, .12], [1.18, .08, -1.13, .14], [.96, .015, -2.61, .09], [.63, 0, -4.2, .036], [.34, 0, -4.96, 0]]);
  const lineRibbon = ribbon([[.54, .1, .45, 0], [.95, .13, -.17, .031], [1.17, .11, -1.08, .038], [.96, .04, -2.44, .025], [.36, 0, -4.83, 0]]);
  const sparkGeo = spindle([[-1, 0, 0], [-.05, .081, .081], [.36, .067, .067], [.75, 0, 0]], 4);
  const ringGeo = new THREE.RingGeometry(.83, 1, 24);
  const ownedGeometry = [coreGeo, rimGeo, auraGeo, mainRibbon, lineRibbon, sparkGeo, ringGeo];

  function spawnMesh(group, geo, mat, order) {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = order;
    group.add(mesh);
    return mesh;
  }
  function remove(root, materials) {
    root.removeFromParent();
    for (const mat of materials) mat.dispose();
  }
  function orientTo(root, vector) {
    if (!vector || !Number.isFinite(vector.x) || !Number.isFinite(vector.z)) return;
    if (Math.abs(vector.x) + Math.abs(vector.z) > 1e-6) {
      root.rotation.y = Math.atan2(vector.x, vector.z);
    }
  }

  function attachKiShot(native, direction) {
    if (disposed || !native?.isGroup || !native.position || shots.has(native)) return false;
    const root = new THREE.Group();
    root.name = 'Brave | E Ki Blast visual only';
    root.position.copy(native.position);
    orientTo(root, direction);
    const materials = [
      material(0xfff7c2, { side: THREE.DoubleSide }),
      material(0x7bc029, { side: THREE.DoubleSide, transparent: true, opacity: .52 }),
      glow(lime, .18), glow(0x96f23b, .54), glow(gold, .80),
    ];
    const [coreMat, rimMat, auraMat, trailGreen, trailGold] = materials;
    const body = new THREE.Group();
    root.add(body);
    spawnMesh(body, coreGeo, coreMat, 10);
    spawnMesh(body, rimGeo, rimMat, 9);
    spawnMesh(body, auraGeo, auraMat, 8);

    const trails = [];
    for (let i = 0; i < 4; i++) {
      const trail = new THREE.Group();
      trail.rotation.z = i * TAU / 4 + .34;
      root.add(trail);
      spawnMesh(trail, mainRibbon, trailGreen, 11);
      spawnMesh(trail, lineRibbon, trailGold, 12);
      trails.push(trail);
    }
    // Leave native children/resources under native ownership; detached FX avoids
    // disposing shared resources when the original projectile group is removed.
    const hidden = native.children.map(child => [child, child.visible]);
    for (const [child] of hidden) child.visible = false;
    scene.add(root);
    shots.set(native, { root, materials, body, trails, hidden, age: 0 });
    return true;
  }

  function impactKi(position, direction, terminal = true) {
    if (disposed || !position || !Number.isFinite(position.x + position.y + position.z)) return false;
    if (impacts.length >= 7) {
      const oldest = impacts.shift();
      remove(oldest.root, oldest.materials);
    }
    const root = new THREE.Group();
    root.name = 'Brave | E Ki Blast impact only';
    root.position.copy(position);
    orientTo(root, direction);
    const materials = [glow(gold, .9), glow(lime, .8), glow(0xfff4b8, .65)];
    const sparks = [], rings = [];
    const count = terminal ? 9 : 4;
    for (let i = 0; i < count; i++) {
      const a = i * TAU / count + .29;
      const up = .12 + (i % 4) * .16;
      const axis = new THREE.Vector3(Math.cos(a) * .93, up, Math.sin(a)).normalize();
      const m = spawnMesh(root, sparkGeo, materials[i % 2], 12);
      m.quaternion.setFromUnitVectors(forward, axis);
      sparks.push({ m, axis, speed: (terminal ? 5.8 : 3.9) + (i % 3) * .73 });
    }
    if (terminal) {
      for (let i = 0; i < 2; i++) {
        const m = spawnMesh(root, ringGeo, materials[i ? 2 : 1], 11);
        m.position.y = Math.min(.12, .16 - position.y + i * .025);
        m.rotation.x = -Math.PI / 2;
        rings.push(m);
      }
    }
    scene.add(root);
    impacts.push({ root, materials, sparks, rings, age: 0, life: terminal ? .31 : .18 });
    applyImpact(impacts.at(-1));
    return true;
  }

  function applyImpact(v) {
    const p = v.age / v.life, f = Math.max(0, 1 - p);
    const fade = f * f;
    v.materials[0].opacity = .88 * fade;
    v.materials[1].opacity = .67 * fade;
    v.materials[2].opacity = .62 * fade;
    for (const { m, axis, speed } of v.sparks) {
      m.position.copy(axis).multiplyScalar(.22 + speed * v.age);
      m.scale.setScalar(.84 * f + .13);
      m.scale.z *= 1.38 + p * .8;
    }
    for (let i = 0; i < v.rings.length; i++) {
      const radius = i === 0 ? .24 + 2.45 * p : .13 + 1.67 * p;
      v.rings[i].scale.setScalar(radius);
    }
  }

  function update(dt) {
    if (disposed || !Number.isFinite(dt) || dt < 0) return;
    for (const [native, v] of shots) {
      if (!native.parent) {
        remove(v.root, v.materials);
        shots.delete(native);
        continue;
      }
      v.age += dt;
      dir.subVectors(native.position, v.root.position);
      orientTo(v.root, dir);
      v.root.position.copy(native.position);
      const pulse = 1 + Math.sin(38 * v.age) * .055;
      v.body.scale.set(pulse, pulse, 1 + Math.sin(29 * v.age + 1) * .045);
      v.body.rotation.z = v.age * 3.4;
      v.trails.forEach((t, i) => {
        t.rotation.z = i * TAU / 4 + .34 + v.age * 2.1 + .17 * Math.sin(v.age * 22 + i);
        t.scale.z = 1 + .13 * Math.sin(v.age * 24 + i * 1.25);
      });
    }
    for (let i = impacts.length - 1; i >= 0; i--) {
      const v = impacts[i];
      v.age += dt;
      if (v.age >= v.life) {
        remove(v.root, v.materials);
        impacts.splice(i, 1);
      } else applyImpact(v);
    }
  }

  function clear() {
    for (const [native, v] of shots) {
      if (native.parent) {
        for (const [child, wasVisible] of v.hidden) if (child.parent === native) child.visible = wasVisible;
      }
      remove(v.root, v.materials);
    }
    shots.clear();
    for (const v of impacts) remove(v.root, v.materials);
    impacts.length = 0;
  }
  function dispose() {
    if (disposed) return;
    clear();
    for (const geo of ownedGeometry) geo.dispose();
    disposed = true;
  }
  return { attachKiShot, impactKi, update, clear, dispose };
}
