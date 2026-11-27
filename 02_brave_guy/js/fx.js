import {impactProfile,impactTexture} from './impact-art.js?v=20261127finishfx';
// 場景內網格／粒子特效與面向鏡頭的8格命中火花。
// 刀光 slash 在這版改當拳風使用。
import { disposeOwned } from './dispose-owned.js?v=20261120assets';
import * as THREE from '../vendor/three/three.module.min.js';

const additive = (color, opacity = 1) => new THREE.MeshBasicMaterial({
  color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
});

const hitFrames = [];
const hitSheetReady = new THREE.TextureLoader().loadAsync(new URL('../assets/source/pic/fx/brave_guy_fx01_fx_hit_arcade_8f.png', import.meta.url).href).then(sheet => {
  sheet.colorSpace = THREE.SRGBColorSpace;
  for (let i = 0; i < 8; i++) {
    const frame = sheet.clone();
    frame.repeat.set(1 / 4, 1 / 2);
    frame.offset.set((i % 4) / 4, 1 - (Math.floor(i / 4) + 1) / 2);
    frame.needsUpdate = true;
    hitFrames.push(frame);
  }
  sheet.dispose();
}).catch(() => {}); // Missing art must not stop gameplay.
function releaseFx(obj) {
  if (obj.userData.hitSpark) { obj.material.dispose(); obj.removeFromParent(); }
  else disposeOwned(obj);
}
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
        releaseFx(it.obj);
        this.items.splice(i, 1);
      }
    }
  }

  clear() {
    for (const it of this.items) releaseFx(it.obj);
    this.items.length = 0;
  }

  // One sprite per hit, shared textures and flat opacity; avoid a full-screen flash.
  hitSpark(pos,y=1,kind='light'){
    if(this.items.filter(it=>it.obj.userData.hitSpark).length>=18)return null;
    if(typeof kind==='boolean')kind=kind?'heavy':'light';
    const p=impactProfile(kind),atlas=kind==='light'&&hitFrames.length>0;
    const material=new THREE.SpriteMaterial({map:atlas?hitFrames[0]:impactTexture(kind),transparent:true,
      depthWrite:false,depthTest:true,toneMapped:false,rotation:kind==='guard'?0:(Math.random()-.5)*.26});
    const sprite=new THREE.Sprite(material);
    Object.assign(sprite.userData,{hitSpark:true,kind,frame:0});
    sprite.position.set(pos.x,y,pos.z);
    sprite.scale.setScalar(atlas?p.scale:p.scale*.77);
    return this.add(sprite,p.life,k=>{
      const frame=Math.min(7,Math.floor(k*8));
      sprite.userData.frame=frame;
      if(atlas)material.map=hitFrames[frame];
      else {
        sprite.scale.setScalar(p.scale*(.77+.32*(1-(1-k)**3)));
        material.opacity=k<.26?1:(1-k)/.74;
      }
    });
  }

  // 半月刀光：扇形面片沿揮砍方向掃過並淡出。yaw 以 +Z 為前方。
  slash(pos, yaw, radius, arc, color = 0xdffff6, dir = 1, y = 0.9) {
    const g = new THREE.Group();
    g.position.set(pos.x, y, pos.z);
    g.rotation.y = yaw;
    const positions=[],colors=[],indices=[],segments=32,bands=3;
    const palette=[new THREE.Color(0xf0440d),new THREE.Color(0xffaf2c),new THREE.Color(color),new THREE.Color(0xff7a16)];
    for(let i=0;i<=segments;i++){
      const t=i/segments,angle=-Math.PI/2-arc/2+t*arc,flame=Math.sin(Math.PI*t);
      const outer=radius*(1+.09*Math.sin(t*Math.PI*9)*flame),width=radius*.36*Math.pow(Math.max(0,flame),.55);
      for(let j=0;j<=bands;j++){const r=outer-width*(1-j/bands);positions.push(Math.cos(angle)*r,Math.sin(angle)*r,0);colors.push(palette[j].r,palette[j].g,palette[j].b);}
      if(i<segments)for(let j=0;j<bands;j++){const n=i*4+j;indices.push(n,n+4,n+1,n+1,n+4,n+5);}
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setIndex(indices);
    const material=additive(0xffffff,.85);material.vertexColors=true;
    const m=new THREE.Mesh(geometry,material);m.rotation.x=-Math.PI/2;g.add(m);
    return this.add(g,arc>5?.36:.25,k=>{m.material.opacity=.85*(1-k);g.rotation.y=yaw+dir*(arc>5?1.4:.6)*k;g.scale.setScalar(.85+.35*k);});
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

  // 殘影：衝拳路徑上留下的拖尾
  trail(from, to, width, color = 0xffe08a, life = 0.3, opacity = 0.7, { alignToPath = false } = {}) {
    const len = Math.hypot(to.x - from.x, to.z - from.z);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(width, len), additive(color, opacity));
    m.rotation.x = -Math.PI / 2;
    const yaw = Math.atan2(to.x - from.x, to.z - from.z);
    // A plane's local Y axis becomes -Z after the ground rotation. The positive
    // angle aligns it to the endpoints; leave older effect styles unchanged.
    m.rotation.z = alignToPath ? yaw : -yaw;
    m.position.set((from.x + to.x) / 2, 0.2, (from.z + to.z) / 2);
    return this.add(m, life, (k) => { m.material.opacity = opacity * (1 - k); m.scale.x = 1 - k * 0.6; });
  }

  // 半球衝擊波：變身與爆炸用
  dome(pos, radius, color = 0x9be564, life = 0.5) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), additive(color, 0.55));
    m.position.set(pos.x, 0, pos.z);
    return this.add(m, life, (k) => {
      const e = 1 - (1 - k) * (1 - k);
      m.scale.setScalar(0.5 + radius * e);
      m.material.opacity = 0.55 * (1 - k);
    });
  }
}
