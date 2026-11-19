import { createPuaProjectile } from './pua-projectile.js?v=20261119arsenal';
import { createRoyalArsenal } from './royal-arsenal.js?v=20261119arsenal';
import { angelText, angelFont } from './angel-language.js?v=20261119arsenal';
import * as THREE from '../vendor/three/three.module.min.js';
// Owns all guest projectiles, drones and delayed casts. Simulation time only.
export function createGuestCombat({scene,hero,enemies,fx,hit,line,move,audio,arena}) {
 const bolts=[], casts=[];
 let attackStep=0,attackGap=0;
 const valid=e=>e.hp>0&&!e.gone&&!e.fly&&e.state!=='dead'&&e.state!=='spawn'&&e.shown;
 const targets=()=>enemies().filter(valid);
 const direction=yaw=>new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));
 const dispose=m=>{scene.remove(m);m.traverse(o=>{if(o.isMesh)o.geometry?.dispose();if(o.material){o.material.map?.dispose();o.material.dispose()}})}; // Sprite geometry is shared by Three; never dispose it.
 const orb=(color,size=.35)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(size,10,8),new THREE.MeshBasicMaterial({color}));scene.add(m);return m};
 const textMesh=raw=>{const text=angelText(raw);const cv=document.createElement('canvas');cv.width=512;cv.height=128;const c=cv.getContext('2d');c.font=`900 64px ${angelFont()}`;const size=Math.min(64,64*480/Math.max(1,c.measureText(text).width));c.font=`900 ${size}px ${angelFont()}`;c.textAlign='center';c.textBaseline='middle';c.lineWidth=10;c.strokeStyle='#4e194c';c.strokeText(text,256,64);c.fillStyle='#fff4b4';c.fillText(text,256,64);const texture=new THREE.CanvasTexture(cv);const m=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthWrite:false}));m.scale.set(5,1.25,1);m.userData.text=text;scene.add(m);return m};
 function bolt(pos,dir,{text=null,target=null,mult=1,src='combo',life=1.1,speed=22,scale=1,pua=null}={}){const mesh=pua!==null?createPuaProjectile(pua):text?textMesh(text):orb(0xb55cff);if(pua!==null)scene.add(mesh);mesh.scale.multiplyScalar(scale);mesh.position.copy(pos);mesh.position.y=1.4;bolts.push({mesh,vel:dir.clone().multiplyScalar(speed),target,mult,src,life,hit:new Set()});}
 function damage(e,mult,src,control=0,color=0xb891ff,from=hero.pos){
  const result=hit(e,mult,{src,from,kb:0});
  if(result?.damaged&&control&&!e.castInvuln&&!e.untouchable){
   if(!e.def.boss||!(e.guestControlCooldown>0)){
    const hold=e.def.boss?Math.min(.4,control):control;
    if(hold>=(e.guestHold||0))e.guestStatus=hero.character==='angel'?(src==='skill2'?'freeze':'paralyze'):'stun';
    e.guestHold=Math.max(e.guestHold||0,hold);
    if(e.def.boss)e.guestControlCooldown=2.5;
    fx.ring(e.pos,.3,e.def.radius+1,color,.35);
   }
  }
 }
 function area(pos,radius,mult,src,control=0,color=0xb891ff){for(const e of targets())if(e.pos.distanceTo(pos)<=radius+e.def.radius)damage(e,mult,src,control,color,pos);}
 function begin(kind,name){
  const from=hero.pos.clone(),dir=direction(hero.yaw),color=kind==='angel'?0xa2eeff:0xad61ff;
  if(kind==='angel'){
   if(name==='skill1'){
    const end=from.clone().addScaledVector(dir,28);line(from,end,8,4.8,{src:name,kb:22,launch:9,heavy:true});fx.trail(from,end,8,0xffa5df,.55,.18);fx.trail(from,end,3,0xd5fbff,.4,.3);
    bolt(from,dir,{text:'不要過來！',mult:0,src:name,life:1,speed:28,scale:1.6});audio.sfx('dash');
   }else if(name==='skill2'){
    area(from,9,2.5,name,3,0xa2eeff);casts.push({kind:'snow',pos:from,life:2,tick:0});audio.sfx('quake');
   }else if(name==='skill3'){
    const points=Array.from({length:10},()=>{const a=Math.random()*Math.PI*2,r=3+Math.sqrt(Math.random())*16,p=from.clone().add(new THREE.Vector3(Math.sin(a)*r,0,Math.cos(a)*r));if(p.length()>arena-1)p.setLength(arena-1);fx.ring(p,.3,2.8,0xffdf79,.55);return p});
    casts.push({kind:'bombs',points,life:2.4,age:0,next:0});audio.sfx('ki_shot');
   }else{
    const funnel=new THREE.Group();for(let i=0;i<5;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(1.1+i*.85,.13,6,32,Math.PI*1.6),new THREE.MeshBasicMaterial({color:i%2?0xffffff:0x9cefff,transparent:true,opacity:.75,depthWrite:false}));ring.rotation.x=Math.PI/2;ring.rotation.z=i*.8;ring.position.y=.5+i*1.25;funnel.add(ring);}funnel.position.copy(from);scene.add(funnel);
    casts.push({kind:'vortex',pos:from,life:4,tick:0,ult:true,funnel});audio.sfx('beam_start');
   }
  }else{
   if(name==='skill1'){casts.push({kind:'dash',life:.35,dir,from,hit:[new Set(),new Set(),new Set()]});audio.sfx('dash');}
   else if(name==='skill3'){area(from,13,4,name,2.3);fx.dome(from,13,color,.6);fx.ring(from,1,13,0xe2bbff,.5);audio.sfx('boom');}
   else if(name==='ult'){const arsenal=createRoyalArsenal({scene,owner:hero,targets:()=>targets().filter(e=>!e.untouchable&&!e.castInvuln),impact:(e,from)=>{
     const impactPos=e.pos.clone();hit(e,2.4,{src:'ult',from,kb:9,launch:4,heavy:true});
     for(const nearby of targets())if(nearby!==e&&nearby.pos.distanceTo(impactPos)<3.6+nearby.def.radius)hit(nearby,1.2,{src:'ult',from:impactPos,kb:7,launch:3,heavy:true});
     fx.ring(impactPos,.3,3.6,0xc1ff6b,.3);fx.burst(impactPos,0xbc7aff,9,6,.3,.2);
    },fx,audio});casts.push({kind:'arsenal',life:10,ult:true,arsenal,nodes:arsenal.nodes});audio.sfx('beam_start');}
   else{const ult=false,count=5;casts.push({kind:'drones',life:ult?10:5,tick:0,ult,src:name,nodes:Array.from({length:count},()=>{const m=orb(0x9d49ff,.45);m.position.copy(from);m.position.y=2.3;return m})});audio.sfx('ki_shot');}
  }
 }
 function update(dt){
  attackGap=Math.max(0,attackGap-dt);if(!attackGap)attackStep=0;
  for(let i=casts.length-1;i>=0;i--){const c=casts[i];const elapsed=Math.min(dt,c.life);c.life-=dt;c.tick=(c.tick||0)-elapsed;
   if(c.kind==='dash'){
    const before=hero.pos.clone();move(c.dir.x*45*elapsed,c.dir.z*45*elapsed);const side=new THREE.Vector3(c.dir.z,0,-c.dir.x);
    for(let k=0;k<3;k++){const a=before.clone().addScaledVector(side,(k-1)*3.4),b=hero.pos.clone().addScaledVector(side,(k-1)*3.4);line(a,b,3,4,{src:'skill1',kb:17,launch:7,heavy:true},c.hit[k]);fx.trail(a,b,1.4,0xb46cff,.25);}
   }else if(c.kind==='snow'&&c.tick<=0){c.tick=.18;fx.ring(c.pos,2,9,0xa2eeff,.45);fx.burst(c.pos,0xd6faff,18,9,.5,.2);}
   else if(c.kind==='bombs'){
    c.age+=elapsed;while(c.next<10&&c.age>=.5+c.next*.15){const p=c.points[c.next++];area(p,3.2,1.9,'skill3',1.8,0xffe88a);fx.dome(p,3.2,0xffd659,.35);fx.burst(p,0xffefb1,12,7,.3,.2);audio.sfx('boom');}
   }else if(c.kind==='vortex'){
    c.funnel.rotation.y+=elapsed*8;
    for(const e of targets()){if(e.untouchable||e.castInvuln)continue;e.guestPullT=.3;const pull=c.pos.clone().sub(e.pos);pull.y=0;const d=pull.length();if(d>.8){pull.multiplyScalar(Math.min(d-.8,elapsed*(e.def.boss?9:22))/d);e.pos.add(pull);}}
    if(c.tick<=0){c.tick=.22;fx.ring(c.pos,14,1,0xa7faff,.4);fx.pillar(c.pos,3,10,0xbdf5ff,.35);fx.burst(c.pos,0xffffff,16,12,.4,.18);area(c.pos,arena*2,.65,'ult');}
    if(c.life<=0){area(c.pos,arena*2,6,'ult');fx.dome(c.pos,17,0xffd4ef,.65);audio.sfx('boom');}
   }else if(c.kind==='arsenal'){c.arsenal.update(elapsed);
    if(c.life<=0){const pool=targets();for(const e of pool)hit(e,6,{src:'ult',from:hero.pos,kb:18,launch:8,heavy:true});for(const e of pool.slice(0,24)){fx.burst(e.pos,0xc4ff78,10,9,.6,.25);fx.dome(e.pos,3.6,0xbb70ff,.65);fx.pillar(e.pos,1.2,7,0xc4ff78,.45);}fx.ring(hero.pos,2,arena*2,0xc08aff,.8);fx.ring(hero.pos,1,arena*1.7,0xc4ff78,1);audio.sfx('boom');}
   }else if(c.kind==='drones'){
    const pool=targets().filter(e=>!e.untouchable&&!e.castInvuln);
    c.nodes.forEach((m,k)=>{
      let target=m.userData.target;
      if(!pool.includes(target))target=m.userData.target=pool.slice().sort((a,b)=>a.pos.distanceToSquared(m.position)-b.pos.distanceToSquared(m.position))[0]||null;
      const a=c.life*1.4+k*Math.PI*2/c.nodes.length,center=target?target.pos:hero.pos,r=target?2.8:2.3;
      const goal=new THREE.Vector3(center.x+Math.cos(a)*r,2.3+Math.sin(a*2)*.3,center.z+Math.sin(a)*r);
      const delta=goal.sub(m.position),distance=delta.length();if(distance)m.position.addScaledVector(delta,Math.min(1,18*elapsed/distance));
    });
    if(c.tick<=0){c.tick=c.ult?.6:.65;let fired=false;c.nodes.forEach(m=>{const e=m.userData.target;if(!e||m.position.distanceTo(e.pos)>8)return;const d=e.pos.clone().sub(m.position);d.y=0;bolt(m.position,d.normalize(),{pua:(m.userData.shots=(m.userData.shots||0)+1),target:e,mult:c.ult?1.2:1.1,src:c.src,life:3,speed:30});fired=true;});if(fired)audio.sfx('ki_shot');}
   }
   if(c.life<=0){if(c.funnel)dispose(c.funnel);if(c.arsenal)c.arsenal.clear();else c.nodes?.forEach(dispose);casts.splice(i,1);}
  }
  for(let i=bolts.length-1;i>=0;i--){const b=bolts[i];b.life-=dt;const before=b.mesh.position.clone();if(b.target&&valid(b.target)){const d=b.target.pos.clone().sub(before);d.y=0;if(d.lengthSq()>0)b.vel.copy(d.normalize().multiplyScalar(30));}b.mesh.position.addScaledVector(b.vel,dt);
   if(b.mult){const a=before,bp=b.mesh.position,dx=bp.x-a.x,dz=bp.z-a.z,l=dx*dx+dz*dz||1;for(const e of targets()){if(b.hit.has(e))continue;const t=Math.max(0,Math.min(1,((e.pos.x-a.x)*dx+(e.pos.z-a.z)*dz)/l));if(Math.hypot(e.pos.x-a.x-t*dx,e.pos.z-a.z-t*dz)<e.def.radius+.65){damage(e,b.mult,b.src,0,0xb891ff,before);b.hit.add(e);b.life=0;break;}}}
   if(b.life<=0){dispose(b.mesh);bolts.splice(i,1);}
  }
 }
 return {begin,update,attack(){const step=attackStep;bolt(hero.pos,direction(hero.yaw),{text:['笨蛋！','走開啦！','給我閉嘴！'][step],mult:[1.25,1.7,2.4][step],scale:[1,1.3,1.65][step]});attackStep=(step+1)%3;attackGap=1.2;audio.sfx('ki_shot');},get ultActive(){return casts.some(c=>c.ult)},get state(){return {attackStep,attackGap,projectiles:bolts.map(b=>({mult:b.mult,width:b.mesh.scale.x,text:b.mesh.userData.text})),bolts:bolts.length,casts:casts.map(c=>({kind:c.kind,life:c.life,arsenal:c.arsenal?.state,nodes:c.nodes?.length||0,dronePositions:c.nodes?.map(m=>({x:m.position.x,z:m.position.z,targetX:m.userData.target?.pos.x,targetZ:m.userData.target?.pos.z}))||[],exploded:c.next}))}},clear(){attackStep=attackGap=0;bolts.forEach(b=>dispose(b.mesh));casts.forEach(c=>{if(c.arsenal)c.arsenal.clear();else c.nodes?.forEach(dispose);if(c.funnel)dispose(c.funnel)});bolts.length=casts.length=0;}};
}
