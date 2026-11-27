import {mountLandmarks} from './solid-landmarks.js';

const ink=0x302d4b, wood=0x755570, cream=0xf9d3ad, glow=0xffca77, candle=0xffe8a7, stone=0x77738f;
function lamp(p,x,y,z){
 p.round(x,y,z,.29,.41,.26,ink);
 p.round(x,y,z+.09,.22,.29,.12,glow);
 p.ball(x,y+.25,z,.19,.10,.17,wood);
 p.round(x,y-.20,z,.35,.076,.32,ink);
}
function window(p,x,y,z,w,h){
 p.round(x,y,z,w+.15,h+.16,.20,ink);
 p.round(x,y,z+.113,w,h,.14,glow);
 p.round(x-.16,y+.06,z+.185,.14,h*.55,.03,candle);
 p.round(x,y,z+.205,.051,h,.047,wood);
 p.round(x,y-.05,z+.201,w,.05,.047,wood);
 p.round(x,y-h/2-.09,z+.073,w+.25,.117,.38,wood);
}
function cottage(p,bake){
 const r=p.round, wall=bake?0xd4a08f:0xb7b6b5, roof=bake?0xb65d7d:0x577f87, rim=bake?0xe59da5:0x8bb8b9;
 r(0,.10,-.10,4.69,.20,3.75,ink);
 r(0,.21,-.12,4.46,.22,3.56,stone);
 r(0,1.33,-.22,3.63,2.20,2.57,wall);
 r(0,.47,1.02,3.66,.34,.26,wood);
 for(const x of [-1.66,1.66]){
   r(x,1.38,1.06,.18,2.05,.24,wood);
   r(x+.023,1.39,1.195,.061,1.88,.042,cream);
 }
 r(0,2.34,-.21,4.25,.25,3.04,ink);
 for(let i=0;i<6;i++){
   const y=2.50+i*.145,d=3.05-i*.43,w=4.13-i*.13;
   r(0,y,-.20,w,.198,d,i%2?rim:roof);
   if(i<5)for(let j=0;j<7;j++)r(-1.56+j*.51+(i%2?.16:0),y+.044,-.20+d/2-.065,.078,.082,.145,rim);
 }
 r(0,3.30,-.21,3.37,.15,.83,rim);
 const sx=bake?.99:-.98;
 r(sx,3.24,-.53,.45,.91,.48,wood);
 r(sx,3.66,-.53,.62,.18,.67,ink);
 r(sx,3.77,-.53,.47,.075,.44,stone);
 const dx=bake?.98:-.92,wx=bake?-.68:.69;
 r(dx,1.17,1.10,1.03,1.66,.22,ink);
 r(dx,1.18,1.23,.85,1.48,.16,bake?0x92576a:0x4c747d);
 for(let i=0;i<3;i++)r(dx-.22+i*.22,1.06,1.315,.031,1.18,.026,wood);
 p.ball(dx+(bake?-.28:.28),1.12,1.36,.077,.062,.046,candle);
 r(dx,.26,1.37,1.36,.16,.79,stone);
 r(dx,.13,1.58,1.53,.11,.60,wood);
 window(p,wx,1.44,1.09,bake?1.39:1.04,.72);
 lamp(p,dx+(bake?-.62:.60),1.84,1.30);
 lamp(p,bake?1.58:-1.55,1.84,1.25);
 if(bake){
   r(wx,2.029,1.27,1.69,.18,.61,ink);
   for(let j=0;j<7;j++)r(wx-.72+j*.24,1.99,1.60,.25,.23,.25,j%2?roof:cream);
   r(wx,.90,1.36,1.57,.105,.55,wood);
   for(const x of [-1.14,-.74,-.35]){
     p.ball(x,1.02,1.51,.16,.11,.14,glow);
     r(x,1.076,1.583,.106,.025,.029,cream);
   }
   r(wx,2.25,1.17,.66,.29,.14,ink);
   p.ball(wx,2.254,1.27,.24,.09,.063,glow);
   for(const x of [wx-.1,wx+.03])r(x,2.272,1.324,.036,.095,.026,cream);
 }else{
   r(wx,2.13,1.18,1.20,.26,.16,ink);
   for(const u of [-.30,0,.30])p.ball(wx+u,2.14,1.285,.075,.075,.044,glow);
   for(const [x,y,z] of [[1.41,.39,1.43],[.95,.32,1.56],[1.57,.28,-.03]]){
     r(x,y,z,.37,.40,.38,wood);
     for(const s of [-1,1])r(x,y+s*.133,z+.191,.36,.036,.053,cream);
   }
 }
 // Soft plant silhouettes and stones along both landings, all behind the footprint guard.
 for(const [x,z] of [[-1.94,.88],[1.99,.80],[-1.90,-.61],[1.88,-1.48]]){
   p.ball(x,.20,z,.25,.16,.19,stone);
   p.ball(x,.39,z,.24,.24,.18,bake?0x85a497:0x6f9697);
   p.ball(x-.081,.48,z+.034,.12,.15,.091,0xb0bda1);
 }
}

export function makeVillageLandmarks(T,root,maze,camera,hero){
 return mountLandmarks(T,root,maze,camera,hero,ink,[
  {name:'Village | Supply shop',x:-9.84,z:-5.32,yaw:.26,draw:p=>cottage(p,false)},
  {name:'Village | Bakery',x:9.60,z:-8.62,yaw:-.29,draw:p=>cottage(p,true)}
 ]);
}
