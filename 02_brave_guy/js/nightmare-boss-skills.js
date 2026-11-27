import { createRoyalArsenal } from './royal-arsenal.js?v=20261127combatfinal';
import * as THREE from '../vendor/three/three.module.min.js';
// Same four nightmare mechanics, with readable windups and dodgeable hostile shots.
export function createNightmareBossSkills({scene,hero,fx,hurt,shot,say,announce,clamp,arena=40}){
 const active=[];const color=0xad61ff;
 const live=e=>e.hp>0&&!e.gone&&e.state!=='dead'&&!e.shield&&!e.untouchable;
 const distanceToSegment=(p,a,b)=>{const d=b.clone().sub(a),l=d.lengthSq();return p.distanceTo(a.clone().addScaledVector(d,l?Math.max(0,Math.min(1,p.clone().sub(a).dot(d)/l)):0));};
 function start(e,key,radius=3){
  const dur=e.def.incubus?({attackWindup:.55,skill1:1.3,skill2:.8,skill3:.8,ult:1.15}[key]||1):1;
  e.visual.play(key,dur);fx.telegraph(e.pos,radius,key==='attackWindup'||key==='attack1'?.55:key==='ult'?1.15:.8,color);
 }
 function cast(e,key,radius){start(e,key,radius);announce(e,key);}
 const playerTarget={pos:hero.pos,def:{radius:.6}};
 function drones(e,ult){
  if(ult){const arsenal=createRoyalArsenal({scene,owner:e,targets:()=>hero.hp>0&&hero.state!=='dead'?[playerTarget]:[],impact:()=>hurt(65),fx,hostile:true});active.push({owner:e,nodes:arsenal.nodes,life:10,ult:true,arsenal});return;}
  const nodes=Array.from({length:5},()=>{
   const node=new THREE.Group();node.name='Nightmare | pulse drone';
   const core=new THREE.Mesh(new THREE.OctahedronGeometry(.40),new THREE.MeshBasicMaterial({color:0xd9b9ff}));core.rotation.z=Math.PI*.25;node.add(core);
   const band=new THREE.Mesh(new THREE.TorusGeometry(.47,.045,4,16),new THREE.MeshBasicMaterial({color:0x8752e8}));band.rotation.x=Math.PI*.34;node.add(band);
   node.position.copy(e.pos);node.position.y=2.3;scene.add(node);return node;
  });fx.releaseWave?.(e.pos,2.75,0xd8adff,.28);active.push({owner:e,nodes,life:5,tick:.45,ult});
 }
 function dispose(c){if(c.arsenal){c.arsenal.clear();return;}for(const m of c.nodes){m.removeFromParent();m.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}}
 function dashWarning(a,b){
  // The two outer rails stay fixed during the warning; the launched stroke is a separate cue.
  if(!fx.add){fx.trail(a,b,3.6,0xd88cff,.8,.47);return;}
  const d=b.clone().sub(a),length=d.length(),geo=new THREE.PlaneGeometry(3.6,length);
  const mat=new THREE.ShaderMaterial({uniforms:{phase:{value:0}},transparent:true,depthWrite:false,side:THREE.DoubleSide,
   vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
   fragmentShader:`varying vec2 v;uniform float phase;
    void main(){
     float x=abs(v.x-.5)*2., y=1.-v.y;
     float rail=(1.-smoothstep(.028,.072,abs(x-.91)));
     float edge=max(rail,(1.-smoothstep(.028,.066,min(y,1.-y)))*smoothstep(.6,.92,x));
     float fill=.24*smoothstep(.0,.08,phase-y)*smoothstep(.065,.13,y)*(1.-smoothstep(.84,.91,x));
     float arrow=(1.-smoothstep(.025,.085,abs(fract(y*6.4-phase*.85)-(.38-x*.28))))*(1.-smoothstep(.48,.69,x));
     vec3 rgb=mix(vec3(.44,.12,.64),vec3(1.,.75,.86),max(edge,arrow*.62));
     gl_FragColor=vec4(rgb,max(max(edge*.72,arrow*.34),fill)*(.73+.27*phase));
    }`});
  const m=new THREE.Mesh(geo,mat);m.name='Nightmare | dash lane warning';m.rotation.x=-Math.PI/2;m.rotation.z=Math.atan2(d.x,d.z);
  m.position.set((a.x+b.x)*.5,.176,(a.z+b.z)*.5);
  fx.add(m,.8,k=>{mat.uniforms.phase.value=k;});
 }
 const moves={
  nPunch:{cd:3.2,range:4.6,start(e){start(e,e.def.incubus&&e.visual.actions?.attackWindup?'attackWindup':'attack1',4.6);say(e,'別以為我會手下留情。');e.cast.next=0;e.cast.aimYaw=Math.atan2(hero.pos.x-e.pos.x,hero.pos.z-e.pos.z);},update(e){const beats=[.55,.99,1.5];while(e.cast.next<3&&e.cast.t>=beats[e.cast.next]){const i=e.cast.next++,yaw=e.cast.aimYaw;e.visual.play('attack'+(i+1),.4);fx.slash(e.pos,yaw,4.6,i===2?Math.PI*2:2.6,color,i===1?-1:1,1);const angle=Math.atan2(hero.pos.x-e.pos.x,hero.pos.z-e.pos.z)-yaw;if(hero.pos.distanceTo(e.pos)<4.6&&(i===2||Math.abs(Math.atan2(Math.sin(angle),Math.cos(angle)))<1.3))hurt([85,110,170][i]);}return e.cast.t>=1.85;}},
  nDash:{cd:4,minRange:3,start(e,dx,dz,d){cast(e,'skill1');e.chargeDir=new THREE.Vector3(dx,0,dz).normalize();e.struck=false;e.dashInkOrigin=null;e.dashInkT=.8;const side=new THREE.Vector3(e.chargeDir.z,0,-e.chargeDir.x);for(let k=-1;k<=1;k++){const a=e.pos.clone().addScaledVector(side,k*3.4);dashWarning(a,a.clone().addScaledVector(e.chargeDir,15.75));}},update(e,dt){const t=e.cast.t;const travel=Math.max(0,Math.min(t,1.15)-Math.max(t-dt,.8));if(travel){const a=e.pos.clone();e.pos.addScaledVector(e.chargeDir,45*travel);clamp(e.pos);const side=new THREE.Vector3(e.chargeDir.z,0,-e.chargeDir.x);
  if(!e.dashInkOrigin){e.dashInkOrigin=a;fx.releaseWave?.(a,2.3,0xe9bdff,.24);}
  const paint=t>=e.dashInkT||t>=1.15;
  for(let k=-1;k<=1;k++){const from=a.clone().addScaledVector(side,k*3.4),to=e.pos.clone().addScaledVector(side,k*3.4);
   if(paint)fx.trail(e.dashInkOrigin.clone().addScaledVector(side,k*3.4),to,2.4,k===0?0xe9c4ff:0x984bdf,.18,.74);
   if(!e.struck&&distanceToSegment(hero.pos,from,to)<1.8){e.struck=true;hurt(175);}}if(paint){e.dashInkOrigin=e.pos.clone();e.dashInkT=t+.072;}}return t>=1.3;}},
  nDrones:{cd:8,cond:e=>!active.some(c=>c.owner===e),start(e){cast(e,'skill2')},update(e){if(e.cast.t<.8)return false;drones(e,false);return true;}},
  nShout:{cd:7,range:13,start(e){cast(e,'skill3',13.6);e.aim=e.pos.clone()},update(e){if(e.cast.t<.8)return false;fx.releaseWave(e.aim,13.6,color,.61);fx.releaseWave(e.aim,10.6,0xe2bbff,.42);if(hero.pos.distanceTo(e.aim)<13.6){const hp=hero.hp;hurt(190);if(hero.hp<hp&&hero.state!=='dead'){hero.stunT=Math.max(hero.stunT,.55);}}return true;}},
  nKing:{cd:20,cond:e=>e.hp<e.maxHp*.75&&!active.some(c=>c.owner===e),start(e){cast(e,'ult',6)},update(e){if(e.cast.t<1.15)return false;fx.releaseWave?.(e.pos,5.7,0xd998ff,.46);drones(e,true);return true;}}
 };
 return {moves,get state(){return active.map(c=>({count:c.nodes.length,life:c.life,ult:c.ult,arsenal:c.arsenal?.state,positions:c.nodes.map(m=>({x:m.position.x,z:m.position.z}))}))},update(dt){for(let i=active.length-1;i>=0;i--){const c=active[i];c.life-=dt;if(c.ult&&live(c.owner)&&c.life<=.9&&!c.bombs){c.bombs=Array.from({length:10},(_,k)=>{const p=k===0?hero.pos.clone():new THREE.Vector3(Math.cos(k*2.4)*arena*.8*Math.sqrt(k/10),0,Math.sin(k*2.4)*arena*.8*Math.sqrt(k/10));clamp(p);fx.telegraph(p,4,Math.max(.01,c.life),color);return p;});}
if(c.life<=0&&live(c.owner)&&c.bombs){let hit=false;for(const [k,p] of c.bombs.entries()){fx.dome(p,3.5,0x9b4bdb,.42);if(k<5)fx.releaseWave?.(p,4,0xde9dff,.33);fx.burst(p,k%2?0xae67ff:0xffc8ee,8,7,.4,.16);if(!hit&&hero.pos.distanceTo(p)<4){hurt(130);hit=true;}}}
if(!live(c.owner)||c.life<=0){dispose(c);active.splice(i,1);continue;}if(c.arsenal){c.arsenal.update(dt);continue;}c.tick-=dt;for(let k=0;k<c.nodes.length;k++){const a=c.life*.7+k*Math.PI*2/c.nodes.length;const center=hero.hp>0&&hero.state!=='dead'?hero.pos:c.owner.pos;const goal=new THREE.Vector3(center.x+Math.cos(a)*6,2.3,center.z+Math.sin(a)*6);const delta=goal.sub(c.nodes[k].position),d=delta.length();if(d)c.nodes[k].position.addScaledVector(delta,Math.min(1,12*dt/d));const [core,band]=c.nodes[k].children;core.rotation.y+=dt*4.8;band.rotation.z+=dt*2.4;const charge=Math.max(0,1-c.tick/.23);core.scale.setScalar(1+charge*.22);}if(c.tick<=0){c.tick=c.ult?.6:.65;for(const [k,m] of c.nodes.entries()){const d=m.position.distanceTo(hero.pos);if(hero.hp<=0||hero.state==='dead'||d>10)continue;const yaw=Math.atan2(hero.pos.x-m.position.x,hero.pos.z-m.position.z)+(c.ult?(k%3-1)*.14:0);fx.burst(m.position,k%2?0xbf88ff:0xf3d9ff,3,2.5,m.position.y,.105);shot(m.position,yaw,{owner:c.owner,pua:k+Math.floor(c.life*2),dmg:c.ult?65:85,speed:16,radius:.35,color,life:Math.min(8,d/16+.7)});}}}},clear(){active.forEach(dispose);active.length=0}};
}
