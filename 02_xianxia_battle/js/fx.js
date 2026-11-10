// 3D 特效：全部是場景內的網格與粒子（不是 2D 貼片疊圖）。
import * as THREE from 'three';

const additive = (color, opacity = 1) => new THREE.MeshBasicMaterial({
  color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
});

export class Fx {
  constructor(scene) {
    this.scene = scene;
    this.items = [];
  }

  add(obj, life, tick) {
    this.scene.add(obj);
    this.items.push({ obj, life, t: 0, tick });
    return obj;
  }

  update(dt) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      it.t += dt;
      const k = Math.min(1, it.t / it.life);
      it.tick(k, dt, it.obj);
      if (k >= 1) {
        this.scene.remove(it.obj);
        it.obj.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
        this.items.splice(i, 1);
      }
    }
  }

  clear() {
    for (const it of this.items) this.scene.remove(it.obj);
    this.items.length = 0;
  }

  // 半月刀光：扇形面片沿揮砍方向掃過並淡出。yaw 以 +Z 為前方。
  slash(pos, yaw, radius, arc, color = 0xdffff6, dir = 1, y = 0.9) {
    const g = new THREE.Group();
    g.position.set(pos.x, y, pos.z);
    g.rotation.y = yaw;
    const m = new THREE.Mesh(new THREE.RingGeometry(radius * 0.45, radius, 28, 1, -Math.PI / 2 - arc / 2, arc), additive(color, 0.5));
    m.rotation.x = -Math.PI / 2;
    g.add(m);
    const sweep = arc >= Math.PI * 1.9 ? 0 : 0.5;
    return this.add(g, 0.22, (k) => {
      m.material.opacity = 0.5 * (1 - k);
      g.rotation.y = yaw + dir * sweep * (0.5 - k);
      g.scale.setScalar(0.8 + 0.3 * k);
    });
  }

  // 地面衝擊環
  ring(pos, r0, r1, color = 0xffffff, life = 0.45, y = 0.15) {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.8, 1, 48), additive(color, 0.6));
    m.rotation.x = -Math.PI / 2;
    m.position.set(pos.x, y, pos.z);
    return this.add(m, life, (k) => {
      const e = 1 - (1 - k) * (1 - k);
      m.scale.setScalar(r0 + (r1 - r0) * e);
      m.material.opacity = 0.6 * (1 - k);
    });
  }

  // 粒子爆散
  burst(pos, color = 0xffe08a, count = 14, speed = 6, y = 1, size = 0.22) {
    const positions = new Float32Array(count * 3);
    const vel = [];
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const up = Math.random() * 0.9 + 0.2;
      const sp = speed * (0.4 + Math.random() * 0.6);
      vel.push(Math.cos(a) * sp, up * sp * 0.8, Math.sin(a) * sp);
      positions.set([pos.x, y, pos.z], i * 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({
      color, size, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    pts.frustumCulled = false;
    return this.add(pts, 0.5, (k, dt) => {
      const p = geo.attributes.position.array;
      for (let i = 0; i < count; i++) {
        vel[i * 3 + 1] -= 16 * dt;
        p[i * 3] += vel[i * 3] * dt;
        p[i * 3 + 1] = Math.max(0.05, p[i * 3 + 1] + vel[i * 3 + 1] * dt);
        p[i * 3 + 2] += vel[i * 3 + 2] * dt;
      }
      geo.attributes.position.needsUpdate = true;
      pts.material.opacity = 1 - k;
    });
  }

  // 預警圈：外框固定、內圈逐漸填滿，填滿即判定
  telegraph(pos, radius, life, color = 0xff3b30) {
    const g = new THREE.Group();
    g.position.set(pos.x, 0.14, pos.z);
    const mk = (geo, op) => {
      const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: op, depthWrite: false }));
      m.rotation.x = -Math.PI / 2;
      g.add(m);
      return m;
    };
    mk(new THREE.RingGeometry(radius * 0.96, radius, 48), 0.9);
    const fill = mk(new THREE.CircleGeometry(radius, 48), 0.3);
    return this.add(g, life, (k) => fill.scale.setScalar(Math.max(0.001, k)));
  }

  // 光柱
  pillar(pos, radius, height, color = 0xfff0b0, life = 0.5) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 24, 1, true), additive(color, 0.7));
    m.position.set(pos.x, height / 2, pos.z);
    return this.add(m, life, (k) => {
      m.scale.set(1 - k * 0.7, 1, 1 - k * 0.7);
      m.material.opacity = 0.7 * (1 - k);
    });
  }

  // 天降巨劍：落下 → 插地停留 → 淡出。onImpact 在觸地瞬間呼叫一次。
  giantSword(pos, onImpact) {
    const g = new THREE.Group();
    const blade = new THREE.Mesh(new THREE.BoxGeometry(1.6, 9, 0.3), new THREE.MeshToonMaterial({
      color: 0x9ff0dc, emissive: 0x2fd0a8, emissiveIntensity: 1.2, transparent: true,
    }));
    blade.position.y = 5.5;
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.6, 4), blade.material);
    tip.position.y = 0.3;
    tip.rotation.x = Math.PI;
    tip.rotation.y = Math.PI / 4;
    tip.scale.z = 0.25;
    const guard = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.5, 0.6), new THREE.MeshToonMaterial({ color: 0xe9c46a, transparent: true }));
    guard.position.y = 10.2;
    g.add(blade, tip, guard);
    g.position.set(pos.x, 30, pos.z);
    g.rotation.y = Math.random() * Math.PI;
    let hit = false;
    return this.add(g, 1.3, (k) => {
      const fall = Math.min(1, k / 0.22);
      g.position.y = 30 * (1 - fall * fall) - 0.6 * fall;
      if (fall >= 1 && !hit) { hit = true; onImpact(); }
      const fade = k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1;
      blade.material.opacity = fade;
      guard.material.opacity = fade;
    });
  }
}
