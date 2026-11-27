import {dangerDisc,outwardWave,sweepInk,laneInk,flightCross} from './attack-art.js?v=20261127combatfinal';
import {impactProfile,impactFrames} from './impact-art.js?v=20261127impact3d';
// 場景內網格／粒子特效與面向鏡頭的8格命中火花。
// 刀光 slash 在這版改當拳風使用。
import { disposeOwned } from './dispose-owned.js?v=20261120assets';
import * as THREE from '../vendor/three/three.module.min.js';

const additive = (color, opacity = 1) => new THREE.MeshBasicMaterial({
  color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
});

const hitFrames = [];
let hitReference=null;
const hitSheetReady = new THREE.TextureLoader().loadAsync(new URL('../assets/source/pic/fx/brave_guy_fx01_fx_hit_arcade_8f.png', import.meta.url).href).then(sheet => {
  sheet.colorSpace = THREE.SRGBColorSpace;
  hitReference=sheet.image;
  for (let i = 0; i < 8; i++) {
    const frame = sheet.clone();
    frame.repeat.set(1 / 4, 1 / 2);
    frame.offset.set((i % 4) / 4, 1 - (Math.floor(i / 4) + 1) / 2);
    frame.needsUpdate = true;
    hitFrames.push(frame);
  }
  sheet.dispose();
  if(typeof requestIdleCallback==='function'){
    for(const kind of ['heavy','counter','guard'])requestIdleCallback(()=>impactFrames(kind,hitReference));
  }
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
      const done=it.tick(k, dt, it.obj);
      if (done===true || k >= 1) {
        releaseFx(it.obj);
        this.items.splice(i, 1);
      }
    }
  }

  clear() {
    for (const it of this.items) releaseFx(it.obj);
    this.items.length = 0;
  }

  // All bursts fit on one camera-facing quad. Direction derives from the actual hit source.
  hitSpark(pos,y=1,kind='light',from=null){
    if(this.items.filter(it=>it.obj.userData.hitSpark).length>=18)return null;
    if(typeof kind==='boolean')kind=kind?'heavy':'light';
    const p=impactProfile(kind),atlas=kind==='light'&&hitFrames.length>0;
    const frames=atlas?hitFrames:impactFrames(kind,hitReference);
    const dx=from?pos.x-from.x:0,dz=from?pos.z-from.z:0;
    const directed=kind==='counter'||kind==='guard';
    const rotation=directed?(Math.hypot(dx,dz)>.12?Math.atan2(-dz*.72,dx):.25):(Math.random()-.5)*.37;
    const material=new THREE.SpriteMaterial({map:frames[0],transparent:true,
      depthWrite:false,depthTest:true,toneMapped:false,rotation});
    const sprite=new THREE.Sprite(material);
    Object.assign(sprite.userData,{hitSpark:true,kind,frame:0});
    sprite.position.set(pos.x,y,pos.z);
    sprite.scale.setScalar(p.scale);
    return this.add(sprite,p.life,k=>{
      const frame=Math.min(7,Math.floor(k*8));
      sprite.userData.frame=frame;
      material.map=frames[frame];material.opacity=atlas?1:k<.68?1:Math.max(0,(1-k)/.32);
    });
  }

  // 半月刀光：扇形面片沿揮砍方向掃過並淡出。yaw 以 +Z 為前方。
  slash(pos, yaw, radius, arc, color = 0xdffff6, dir = 1, y = 0.9) {
    const g = new THREE.Group();
    g.position.set(pos.x, y, pos.z);
    g.rotation.y = yaw;
    const positions=[],uvs=[],indices=[],segments=40,bands=3;
    for(let i=0;i<=segments;i++){
      const t=i/segments,angle=-Math.PI/2-arc/2+t*arc,flame=Math.sin(Math.PI*t);
      const outer=radius*(1+.09*Math.sin(t*Math.PI*9)*flame),width=radius*.36*Math.pow(Math.max(0,flame),.55);
      for(let j=0;j<=bands;j++){const r=outer-width*(1-j/bands);positions.push(Math.cos(angle)*r,Math.sin(angle)*r,0);uvs.push(t,j/bands);}
      if(i<segments)for(let j=0;j<bands;j++){const n=i*4+j;indices.push(n,n+4,n+1,n+1,n+4,n+5);}
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);
    const material=sweepInk(color,dir);g.name='Attack | ink sweep';
    const m=new THREE.Mesh(geometry,material);m.rotation.x=-Math.PI/2;g.add(m);
    return this.add(g,arc>5?.36:.25,k=>{material.uniforms.phase.value=k;g.rotation.y=yaw+dir*(arc>5?1.4:.35)*k;g.scale.setScalar(.92+.10*k);});
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

  // Ground warning bounds remain fixed; timing follows the game's simulation.
  telegraph(pos, radius, life, color = 0xff3b30) {
    const m=dangerDisc(pos,radius,color);
    return this.add(m,life,k=>{m.material.uniforms.phase.value=k;});
  }

  releaseWave(pos,radius,color=0xffa949,life=.5) {
    if(this.items.filter(it=>it.obj.userData.releaseWave).length>=8)return null;
    const m=outwardWave(pos,radius,color);
    m.userData.releaseWave=true;
    return this.add(m,life,k=>{m.material.uniforms.phase.value=k;});
  }

  projectileWake(mesh,velocity,radius,color) {
    if(this.items.filter(it=>it.obj.userData.projectileWake).length>=12)return null;
    const wake=flightCross(radius,color);
    wake.userData.projectileWake=true;
    wake.position.copy(mesh.position);
    wake.rotation.y=Math.atan2(velocity.x,velocity.z);
    return this.add(wake,4,(k,dt)=>{
      if(!mesh.parent)return true;
      wake.position.copy(mesh.position);
      wake.rotation.y=Math.atan2(velocity.x,velocity.z);
      wake.children[0].material.uniforms.phase.value+=dt;
    });
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
  trail(from, to, width, color = 0xffe08a, life = 0.3, opacity = 0.7, { alignToPath = true } = {}) {
    const len = Math.hypot(to.x - from.x, to.z - from.z);
    if(len<.025)return null;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(width, len), laneInk(color,opacity));
    m.name='Attack | directional ground stroke';
    m.rotation.x = -Math.PI / 2;
    const yaw = Math.atan2(to.x - from.x, to.z - from.z);
    // A plane's local Y axis becomes -Z after the ground rotation. The positive
    // angle aligns it to the endpoints; leave older effect styles unchanged.
    m.rotation.z = alignToPath ? yaw : -yaw;
    m.position.set((from.x + to.x) / 2, 0.2, (from.z + to.z) / 2);
    return this.add(m, life, (k) => { m.material.uniforms.phase.value=k; m.scale.x = 1 - k * 0.6; });
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
