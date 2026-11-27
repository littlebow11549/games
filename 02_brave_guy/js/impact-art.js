import * as THREE from '../vendor/three/three.module.min.js';

const profiles={
 light:{a:'#ffcf76',b:'#fff7da',scale:1.7,life:.20,points:6},
 heavy:{a:'#ff8457',b:'#ffe86e',scale:2.75,life:.24,points:8},
 counter:{a:'#66ebcf',b:'#d9fff1',scale:2.64,life:.25,points:4},
 guard:{a:'#75b9ff',b:'#e5f5ff',scale:1.88,life:.20,points:6}
};
const textures=new Map();
export const impactProfile=kind=>profiles[kind]||profiles.light;
export function impactTexture(kind){
 if(textures.has(kind))return textures.get(kind);
 const p=impactProfile(kind),cv=document.createElement('canvas');cv.width=cv.height=128;
 const c=cv.getContext('2d');
 function polygon(points,fill,stroke,width){
  c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();
  c.lineJoin='round';c.strokeStyle=stroke;c.lineWidth=width;c.stroke();c.fillStyle=fill;c.fill();
 }
 function burst(outer,inner,a0){
  return Array.from({length:p.points*2},(_,i)=>{
   const a=i*Math.PI/p.points+a0,r=i%2?inner:outer*(i%4===0?1:.85);
   return [64+r*Math.cos(a),64+r*Math.sin(a)];
  });
 }
 if(kind==='guard'){
  polygon([[64,19],[96,34],[92,70],[83,87],[64,103],[45,87],[36,70],[32,34]],'#5274b9','#273755',8);
  polygon([[64,28],[89,40],[85,68],[78,82],[64,94],[50,82],[43,68],[39,40]],p.a,p.b,4);
  polygon([[65,37],[51,61],[66,58],[58,83],[80,54],[65,56]],p.b,'#5274b9',2);
  c.strokeStyle=p.b;c.lineWidth=4;c.lineCap='round';
  for(const [x,y] of [[20,49],[109,45],[103,83]]){c.beginPath();c.moveTo(x,y);c.lineTo(x+(x>64?9:-9),y-6);c.stroke();}
 }else{
  if(kind!=='light'){
   c.lineCap='round';
   for(let i=0;i<4;i++){
    const a=i*Math.PI/2+.15;
    c.beginPath();c.arc(64,64,49,a,a+.89);
    c.strokeStyle='#42334f';c.lineWidth=7;c.stroke();
    c.strokeStyle=p.a;c.lineWidth=4;c.stroke();
   }
  }
  const a=kind==='counter'?-Math.PI/2:-.28;
  polygon(burst(kind==='light'?47:56,kind==='counter'?13:21,a),p.a,'#4d3146',4);
  polygon(burst(kind==='light'?31:39,kind==='counter'?7:12,a),p.b,p.a,2);
  c.fillStyle='#fffaf1';c.beginPath();c.ellipse(64,64,9,7,-.3,0,7);c.fill();
 }
 const texture=new THREE.CanvasTexture(cv);texture.colorSpace=THREE.SRGBColorSpace;
 textures.set(kind,texture);return texture;
}
