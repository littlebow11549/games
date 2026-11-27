import { disposeProjectileMaterial } from './pua-projectile.js?v=20261120assets';
import { createNightmareDrone, createNightmareWave, nightmareShotAim } from './nightmare-drone-art.js?v=20261127cleancues';
import { createRoyalArsenal } from './royal-arsenal.js?v=20261127combatfinal';
import { angelText, angelFont } from './angel-language.js?v=20261120assets';
import { createAngelIceFx } from './angel-ice-fx.js?v=20261127icebloom';
import * as THREE from '../vendor/three/three.module.min.js';
// Owns all guest projectiles, drones and delayed casts. Simulation time only.
export function createGuestCombat({scene,hero,enemies,fx,hit,line,move,audio,arena,constrain=()=>{}}) {
 const bolts=[], casts=[], angelIce=[];
 const ice=(pos,phase,follow,life)=>{const art=createAngelIceFx(scene,pos,phase,follow,life);angelIce.push({art,left:art.life});};
 let attackStep=0,attackGap=0,barrierCast=null;
 const valid=e=>e.hp>0&&!e.gone&&!e.fly&&e.state!=='dead'&&e.state!=='spawn'&&e.shown;
 const targets=()=>enemies().filter(valid);
 const direction=yaw=>new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));
 const dispose=m=>{
  scene.remove(m);
  if(m.userData.releaseSpirit){m.userData.releaseSpirit();return;}
  const geometries=new Set(),materials=new Set();
  m.traverse(o=>{if(o.isMesh)geometries.add(o.geometry);if(o.material)materials.add(o.material);});
  geometries.forEach(g=>g?.dispose());materials.forEach(disposeProjectileMaterial);
 }; // Sprite geometry is shared by Three; never dispose it.
 const orb=(color,size=.35)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(size,10,8),new THREE.MeshBasicMaterial({color}));scene.add(m);return m};
 const textMesh=raw=>{const text=angelText(raw);const cv=document.createElement('canvas');cv.width=512;cv.height=128;const c=cv.getContext('2d');c.font=`italic 900 64px ${angelFont()}`;const size=Math.min(64,64*460/Math.max(1,c.measureText(text).width));c.font=`italic 900 ${size}px ${angelFont()}`;c.textAlign='center';c.textBaseline='middle';c.lineWidth=10;c.strokeStyle='#4e194c';c.strokeText(text,256,64);c.fillStyle='#fff4b4';c.fillText(text,256,64);const texture=new THREE.CanvasTexture(cv);const m=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthWrite:false}));m.scale.set(5,1.25,1);m.userData.text=text;scene.add(m);return m};
 function bolt(pos,dir,{text=null,mult=1,src='combo',life=1.1,speed=22,scale=1,wave=false,piercing=false}={}){
  const mesh=wave?createNightmareWave(dir):text?textMesh(text):orb(0xb55cff);
  if(wave)scene.add(mesh);
  mesh.scale.multiplyScalar(scale);mesh.position.copy(pos);mesh.position.y=wave?pos.y+.70:1.4;
  const vel=dir.clone().multiplyScalar(speed);
  bolts.push({mesh,vel,mult,src,life,piercing,wave,spent:0,hit:new Set()});
  if(text)fx.projectileWake?.(mesh,vel,.48*scale,0xffa6e4);
 }
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
    const width=8,end=from.clone().addScaledVector(dir,28);
    line(from,end,width,4.8,{src:name,kb:22,launch:9,heavy:true,forwardOnly:true});
    fx.trail(from,end,width,0xffa5df,.55,.68,{alignToPath:true,style:'frost'});
    ice(from,'cast');
    bolt(from,dir,{text:'不要過來！',mult:0,src:name,life:1,speed:28,scale:1.6,piercing:true});audio.sfx('dash');
   }else if(name==='skill2'){
    area(from,9,2.5,name,3,0xa2eeff);ice(from,'nova');casts.push({kind:'snow',pos:from,life:2,tick:0});audio.sfx('quake');
   }else if(name==='skill3'){
    const points=Array.from({length:5},(_,i)=>{const a=hero.yaw+i*Math.PI*2/5,p=from.clone().add(new THREE.Vector3(Math.sin(a)*4.5,0,Math.cos(a)*4.5));if(p.length()>arena-1)p.setLength(arena-1);ice(p,'barrier-mark',null,.3+i*.15);return p});
    const barrier=new THREE.Group();barrier.name='angel-repelling-barrier';
    const shell=new THREE.Mesh(new THREE.SphereGeometry(4.5,32,16,0,Math.PI*2,0,Math.PI/2),new THREE.MeshBasicMaterial({color:0x9eefff,transparent:true,opacity:.10,side:THREE.DoubleSide,depthWrite:false}));barrier.add(shell);
    ice(from,'barrier',hero.pos);

    barrier.position.copy(hero.pos);scene.add(barrier);barrierCast={kind:'bombs',points,life:3,age:0,next:0,barrier};casts.push(barrierCast);
    for(const e of enemies())repelEnemy(e);audio.sfx('ki_shot');
   }else{
    ice(from,'vortex');
    casts.push({kind:'vortex',pos:from,life:4,tick:0,ult:true});audio.sfx('beam_start');
   }
  }else{
   if(name==='skill1'){casts.push({kind:'dash',life:.35,dir,from,inkFrom:from.clone(),hit:[new Set(),new Set(),new Set()]});fx.releaseWave?.(from,2.8,0xa269ec,.32);audio.sfx('dash');}
   else if(name==='skill3'){area(from,13,4,name,2.3);fx.releaseWave?.(from,13,color,.61);fx.releaseWave?.(from,10.5,0xe0afff,.42);audio.sfx('boom');}
   else if(name==='ult'){const arsenal=createRoyalArsenal({scene,owner:hero,targets:()=>targets().filter(e=>!e.untouchable&&!e.castInvuln),impact:(e,from)=>{
     const impactPos=e.pos.clone();hit(e,1.8,{src:'ult',from,kb:9,launch:4,heavy:true});
     for(const nearby of targets())if(nearby!==e&&nearby.pos.distanceTo(impactPos)<3.6+nearby.def.radius)hit(nearby,.9,{src:'ult',from:impactPos,kb:7,launch:3,heavy:true});
     fx.releaseWave?.(impactPos,3.6,0xc1ff6b,.33);fx.burst(impactPos,0xbc7aff,7,6,.3,.2);
    },fx,audio});casts.push({kind:'arsenal',life:10,ult:true,arsenal,nodes:arsenal.nodes});audio.sfx('beam_start');}
   else{const count=5;casts.push({kind:'drones',life:10,age:0,nextShot:2,src:name,nodes:Array.from({length:count},()=>{const m=createNightmareDrone(scene);m.position.copy(from);m.position.y=2.3;m.userData.aim=direction(hero.yaw);return m})});fx.releaseWave?.(from,3.5,0xb577f8,.36);audio.sfx('ki_shot');}
  }
 }
 // Body exclusion only: ranged projectiles and damage remain governed by normal rules.
 function repelEnemy(e){
  if(!barrierCast||barrierCast.life<=0||hero.hp<=0||e.hp<=0||e.gone||e.state==='dead')return false;
  const radius=4.5+e.def.radius,dx=e.pos.x-hero.pos.x,dz=e.pos.z-hero.pos.z,d=Math.hypot(dx,dz);
  if(d>=radius)return false;
  const angle=d>.001?Math.atan2(dx,dz):hero.yaw+Math.PI;
  let best=null,score=Infinity;
  for(let i=0;i<25;i++){
   const offset=i===0?0:Math.ceil(i/2)*Math.PI/12*(i%2?1:-1),a=angle+offset;
   const candidate=hero.pos.clone().add(new THREE.Vector3(Math.sin(a)*(radius+.02),0,Math.cos(a)*(radius+.02)));constrain(candidate,e.def.radius);
   if(Math.hypot(candidate.x-hero.pos.x,candidate.z-hero.pos.z)<radius-.001)continue;
   const cost=candidate.distanceToSquared(e.pos);if(cost<score){best=candidate;score=cost;}if(i===0)break;
  }
  if(!best)return false;e.pos.copy(best);
  if(e.vel){const away=best.clone().sub(hero.pos).normalize(),inward=e.vel.dot(away);if(inward<0)e.vel.addScaledVector(away,-inward);}
  return true;
 }
 function update(dt){
  attackGap=Math.max(0,attackGap-dt);if(!attackGap)attackStep=0;
  for(let i=angelIce.length-1;i>=0;i--){const a=angelIce[i];a.art.update(Math.min(dt,a.left));a.left-=dt;if(a.left<=0){a.art.clear();angelIce.splice(i,1);}}
  for(let i=casts.length-1;i>=0;i--){const c=casts[i];const elapsed=Math.min(dt,c.life);c.life-=dt;c.tick=(c.tick||0)-elapsed;
   if(c.kind==='dash'){
    const before=hero.pos.clone();move(c.dir.x*45*elapsed,c.dir.z*45*elapsed);const side=new THREE.Vector3(c.dir.z,0,-c.dir.x);
    for(let k=0;k<3;k++){const a=before.clone().addScaledVector(side,(k-1)*3.4),b=hero.pos.clone().addScaledVector(side,(k-1)*3.4);line(a,b,3,4,{src:'skill1',kb:17,launch:7,heavy:true},c.hit[k]);}
    if(c.tick<=0||c.life<=0){c.tick=.06;
     for(let k=0;k<3;k++){
      const a=c.inkFrom.clone().addScaledVector(side,(k-1)*3.4),b=hero.pos.clone().addScaledVector(side,(k-1)*3.4);
      fx.trail(a,b,k===1?2.2:1.4,k===1?0xe6baff:0x9b47ef,.28,k===1?.85:.65);
     }
     c.inkFrom.copy(hero.pos);
    }
    if(c.life<=0)fx.releaseWave?.(hero.pos,3.8,0xd9a4ff,.38);
   }else if(c.kind==='bombs'){
    c.barrier.position.copy(hero.pos);c.barrier.rotation.y+=elapsed*.6;
    c.age+=elapsed;while(c.next<c.points.length&&c.age>=.3+c.next*.15){const p=c.points[c.next++];area(p,3.2,1.9,'skill3',1.8,0xffe88a);ice(p,'barrier-pop');audio.sfx('boom');}
   }else if(c.kind==='vortex'){
    for(const e of targets()){if(e.untouchable||e.castInvuln)continue;e.guestPullT=.3;const pull=c.pos.clone().sub(e.pos);pull.y=0;const d=pull.length();if(d>.8){pull.multiplyScalar(Math.min(d-.8,elapsed*(e.def.boss?9:22))/d);e.pos.add(pull);}}
    if(c.tick<=0){c.tick=.22;area(c.pos,arena*2,.65,'ult');}
    if(c.life<=0){area(c.pos,arena*2,6,'ult');ice(c.pos,'finish');audio.sfx('boom');}
   }else if(c.kind==='arsenal'){c.arsenal.update(elapsed);
    if(c.life<=0){const pool=targets();for(const e of pool)hit(e,4.5,{src:'ult',from:hero.pos,kb:18,launch:8,heavy:true});for(const e of pool.slice(0,12)){fx.burst(e.pos,0xc4ff78,9,9,.6,.25);}fx.releaseWave?.(hero.pos,arena*2,0xb86cfc,.8);fx.releaseWave?.(hero.pos,arena*1.7,0xc4ff78,1);fx.releaseWave?.(hero.pos,8,0xf0c2ff,.42);audio.sfx('boom');}
   }else if(c.kind==='drones'){
    const pool=targets().filter(e=>!e.untouchable&&!e.castInvuln),live=new Set(pool);
    c.nodes.forEach((m,k)=>{
      let target=m.userData.target;
      if(!live.has(target)){target=null;let nearest=Infinity;for(const e of pool){const distance=e.pos.distanceToSquared(m.position);if(distance<nearest){nearest=distance;target=e;}}m.userData.target=target;}
      const a=c.life*1.4+k*Math.PI*2/c.nodes.length,center=target?target.pos:hero.pos,r=target?2.8:2.3;
      const goal=new THREE.Vector3(center.x+Math.cos(a)*r,2.3+Math.sin(a*2)*.3,center.z+Math.sin(a)*r);
      const delta=goal.sub(m.position),distance=delta.length();if(distance)m.position.addScaledVector(delta,Math.min(1,18*elapsed/distance));
      if(target){const aim=nightmareShotAim(m.position,target.pos);if(aim)m.userData.aim=aim;}
      m.rotation.y=Math.atan2(m.userData.aim.x,m.userData.aim.z);
      m.rotation.z=Math.sin(a*2)*.13;m.userData.advanceSpirit(elapsed);
    });
    c.age+=elapsed;
    // Five volleys, including the t=10 volley immediately before the spirits leave.
    while(c.nextShot<=10&&c.age+1e-8>=c.nextShot){
     c.nextShot+=2;
     for(const m of c.nodes){
      const d=m.userData.aim;
      const origin=m.position.clone().addScaledVector(d,.36);
      bolt(origin,d,{wave:true,mult:1.1,src:c.src,life:3,speed:30});
     }
     audio.sfx('ki_shot');
    }
   }
   if(c.life<=0){if(c===barrierCast)barrierCast=null;if(c.barrier)dispose(c.barrier);if(c.arsenal)c.arsenal.clear();else c.nodes?.forEach(dispose);casts.splice(i,1);}
  }
  const boltTargets=bolts.length?targets():[];
  for(let i=bolts.length-1;i>=0;i--){const b=bolts[i];b.life-=dt;
   if(b.spent){
    b.mesh.scale.x=b.mesh.scale.y=Math.max(.03,b.life/.10);
    if(b.life<=0){dispose(b.mesh);bolts.splice(i,1);}
    continue;
   }
   const before=b.mesh.position.clone();b.mesh.position.addScaledVector(b.vel,dt);

   if(b.mult){const a=before,bp=b.mesh.position,dx=bp.x-a.x,dz=bp.z-a.z,l=dx*dx+dz*dz||1;for(const e of boltTargets){if(!valid(e)||b.hit.has(e))continue;const t=Math.max(0,Math.min(1,((e.pos.x-a.x)*dx+(e.pos.z-a.z)*dz)/l));if(Math.hypot(e.pos.x-a.x-t*dx,e.pos.z-a.z-t*dz)<e.def.radius+.65){damage(e,b.mult,b.src,0,0xb891ff,before);b.hit.add(e);if(!b.piercing){
    if(b.wave){b.mesh.position.lerp(before,1-t);b.life=.10;b.spent=1;}
    else b.life=0;
    break;
   }}}}
   if(b.life<=0){dispose(b.mesh);bolts.splice(i,1);}
  }
 }
 return {begin,update,repelEnemy,attack(){const step=attackStep;bolt(hero.pos,direction(hero.yaw),{text:['笨蛋！','走開啦！','給我閉嘴！'][step],mult:[1.45,1.95,2.75][step],scale:[1,1.3,1.65][step],piercing:true});attackStep=(step+1)%3;attackGap=1.2;audio.sfx('ki_shot');},get ultActive(){return casts.some(c=>c.ult)},get state(){return {attackStep,attackGap,projectiles:bolts.map(b=>({mult:b.mult,width:b.mesh.scale.x,text:b.mesh.userData.text})),bolts:bolts.length,casts:casts.map(c=>({kind:c.kind,life:c.life,arsenal:c.arsenal?.state,nodes:c.nodes?.length||0,dronePositions:c.nodes?.map(m=>({x:m.position.x,z:m.position.z,targetX:m.userData.target?.pos.x,targetZ:m.userData.target?.pos.z}))||[],points:c.points?.map(p=>({x:p.x,z:p.z})),barrier:!!c.barrier,exploded:c.next}))}},clear(){angelIce.forEach(a=>a.art.clear());angelIce.length=0;barrierCast=null;attackStep=attackGap=0;bolts.forEach(b=>dispose(b.mesh));casts.forEach(c=>{if(c.arsenal)c.arsenal.clear();else c.nodes?.forEach(dispose);if(c.barrier)dispose(c.barrier)});bolts.length=casts.length=0;}};
}
