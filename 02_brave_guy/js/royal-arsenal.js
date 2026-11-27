import { createPuaProjectile, disposeProjectileMaterial } from './pua-projectile.js?v=20261120assets';
import * as THREE from '../vendor/three/three.module.min.js';
// Purple/gold portals launch independently targeted PUA dialogue; all time is simulation time.
const UP=new THREE.Vector3(0,0,1);
function material(color,extra={}){return new THREE.MeshBasicMaterial({color,...extra});}
function part(root,geo,color,x=0,y=0,z=0){const m=new THREE.Mesh(geo,material(color));m.position.set(x,y,z);root.add(m);return m;}
function dispose(root){root.removeFromParent();root.traverse(o=>{if(o.isMesh)o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material]){disposeProjectileMaterial(m);}});}
const slots=[[-5,2.6],[-2.5,2.8],[0,3],[2.5,2.8],[5,2.6],[-4,4.8],[-1.4,5.2],[1.4,5.2],[4,4.8],[0,6.9]];
export function createRoyalArsenal({scene,owner,targets,impact,fx,audio,hostile=false}){
 const root=new THREE.Group();root.name='nightmare-royal-arsenal';scene.add(root);
 const projectiles=[],recall=[],lastPositions=[];let age=0,fired=0,closed=false,returning=false;
 const gates=slots.map(([x,y],i)=>{
  const g=new THREE.Group();g.name='royal-portal';g.position.set(x,y,-3.2-Math.abs(x)*.1);root.add(g);
  const disc=new THREE.Mesh(new THREE.CircleGeometry(.77,24),material(0x482069,{transparent:true,opacity:.65,side:THREE.DoubleSide,depthWrite:false}));g.add(disc);
  part(g,new THREE.TorusGeometry(.82,.065,6,32),0xffd66f);
  const ring=part(g,new THREE.TorusGeometry(.66,.035,6,24),0xb6ff67,0,0,.03);
  const runes=new THREE.Group();g.add(runes);
  for(let n=0;n<4;n++){const a=n*Math.PI/2;const rune=part(runes,new THREE.OctahedronGeometry(.11),0xe4b5ff,Math.cos(a)*.82,Math.sin(a)*.82,.04);rune.rotation.z=a;}
  const weapon=createPuaProjectile(i);weapon.scale.multiplyScalar(.35);weapon.position.z=.2;g.add(weapon);
  return {group:g,ring,runes,disc,weapon,cool:.7+i*.055,aim:null,index:i};
 });
 function position(){root.position.copy(owner.pos);root.rotation.y=owner.yaw||0;root.updateMatrixWorld(true);}
 position();
 function launch(g){
  if(!g.aim)return;
  const mesh=createPuaProjectile(g.index+Math.floor(fired/10));mesh.position.copy(g.group.getWorldPosition(new THREE.Vector3()));
  const dir=g.aim.clone().sub(mesh.position).normalize();mesh.quaternion.setFromUnitVectors(UP,dir);scene.add(mesh);
  const speed=hostile?20:38;
  if(g.index%3===0)fx.burst(mesh.position,0xdca4ff,4,3,mesh.position.y,.10);
  projectiles.push({index:g.index,mesh,target:g.target,speed,velocity:dir.multiplyScalar(speed),life:Math.min(6,mesh.position.distanceTo(g.aim)/speed+.7)});
  fx.projectileWake?.(mesh,projectiles.at(-1).velocity,.57,g.index%3===0?(hostile?0xe7b5ff:0xcfed76):0xb780ff);
  g.weapon.visible=false;g.aim=null;fired++;if(g.index%3===0)audio?.sfx('ki_shot');
 }
 function beginReturn(){returning=true;
  for(let i=0;i<10;i++){const shot=projectiles.find(p=>p.index===i);const mesh=shot?shot.mesh:createPuaProjectile(i);if(!shot){mesh.position.copy(lastPositions[i]||gates[i].group.getWorldPosition(new THREE.Vector3()));scene.add(mesh);}recall.push(mesh);}
  for(const p of projectiles)if(!recall.includes(p.mesh))dispose(p.mesh);projectiles.length=0;
 }
 return {nodes:gates.map(g=>g.group),get state(){return {phase:returning?'recall':'barrage',recallCount:recall.length,recallPositions:recall.map(m=>({x:m.position.x,y:m.position.y,z:m.position.z})),portals:gates.length,projectiles:projectiles.length,texts:projectiles.map(p=>p.mesh.userData.text),targets:projectiles.map(p=>({x:p.target?.pos.x,z:p.target?.pos.z})),weaponPositions:projectiles.map(p=>({x:p.mesh.position.x,y:p.mesh.position.y,z:p.mesh.position.z})),fired,age,positions:gates.map(g=>{const p=g.group.getWorldPosition(new THREE.Vector3());return{x:p.x,y:p.y,z:p.z}})}},update(dt){
  if(closed||dt<=0)return;age+=dt;position();const pool=targets(),live=new Set(pool);
  if(age>=8.4&&!returning)beginReturn();
  if(returning){root.scale.setScalar(Math.max(.01,1-(age-8.4)*3));recall.forEach((m,k)=>{const a=k*Math.PI*2/10+(age-8.4)*2,r=Math.max(1.3,3-(age-8.4));const goal=owner.pos.clone().add(new THREE.Vector3(Math.cos(a)*r,2.4+Math.sin(a*2)*.3,Math.sin(a)*r));const delta=goal.sub(m.position),d=delta.length();if(d)m.position.addScaledVector(delta,Math.min(1,Math.max(26,d/Math.max(.04,10-age))*dt/d));});return;}

  for(const g of gates){
   const opening=Math.max(.01,Math.min(1,(age-g.index*.025)/.4));g.group.scale.setScalar(opening);g.ring.rotation.z+=dt*(g.index%2?1:-1);g.runes.rotation.z+=dt*(g.index%2?-.8:.75);
   g.cool-=dt;const armed=g.aim?Math.max(0,1-g.cool/.28):0;
   g.ring.scale.setScalar(1+armed*.15);g.disc.material.opacity=.56+armed*.26;
   g.weapon.visible=g.cool<.55;g.weapon.position.z=.2+Math.max(0,.55-g.cool)*.9;
   if(g.cool<=.28&&!g.aim&&pool.length){const target=pool[(g.index+Math.floor(fired/10))%pool.length];g.aim=target.pos.clone();g.aim.y+=1;g.target=target;if(hostile)fx.telegraph(target.pos,.8,.28,0xb784ff);}
   if(g.aim&&!live.has(g.target)){g.aim=null;g.target=null;}
   if(g.cool<=0){launch(g);g.cool=hostile?.75:.5;}
  }
  for(let i=projectiles.length-1;i>=0;i--){const p=projectiles[i],a=p.mesh.position.clone();p.life-=dt;
   if(!hostile){if(!live.has(p.target)){p.target=null;let nearest=Infinity;for(const e of pool){const distance=e.pos.distanceToSquared(a);if(distance<nearest){nearest=distance;p.target=e;}}}
    if(p.target){const aim=p.target.pos.clone();aim.y+=1;const desired=aim.sub(a).normalize().multiplyScalar(p.speed);p.velocity.lerp(desired,Math.min(1,dt*6)).normalize().multiplyScalar(p.speed);p.mesh.quaternion.setFromUnitVectors(UP,p.velocity.clone().normalize());}}
   p.mesh.position.addScaledVector(p.velocity,dt);const b=p.mesh.position,d=b.clone().sub(a),l=d.lengthSq();
   for(const e of pool){const x=e.pos.x-a.x,y=e.pos.y+1-a.y,z=e.pos.z-a.z,t=l?THREE.MathUtils.clamp((x*d.x+y*d.y+z*d.z)/l,0,1):0;const dx=x-d.x*t,dy=y-d.y*t,dz=z-d.z*t,r=(e.def?.radius||.6)+.55;if(dx*dx+dy*dy+dz*dz<r*r){impact(e,a);fx.releaseWave?.(b,1.8,0xb4ef71,.24);fx.burst(e.pos,hostile?0xe0abff:0xffd080,7,4.2,Math.max(.25,e.pos.y+.9),.12);p.life=0;break;}}
   lastPositions[p.index]=p.mesh.position.clone();
   if(p.life<=0){dispose(p.mesh);projectiles.splice(i,1);}
  }
 },clear(){if(closed)return;closed=true;projectiles.forEach(p=>dispose(p.mesh));projectiles.length=0;recall.forEach(dispose);recall.length=0;dispose(root);}};
}
