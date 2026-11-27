import * as THREE from '../vendor/three/three.module.min.js';

const TAU=Math.PI*2, S=640;
let atlas;
const clamp=t=>Math.max(0,Math.min(1,t));
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
export function angelSealPose(phase,t,r,out={}){
 if(phase==='barrier-pop')return null;
 const build=smooth(0,phase==='cast'?.24:.18,t);
 const bloom=smooth(0,phase==='finish'?.49:.36,t);
 const fade=1-smooth(phase==='vortex'||phase==='barrier'?.78:.62,1,t);
 const spread=phase==='vortex'?.68:phase==='finish'?.90:.95;
 out.opacity=build*fade;
 out.outer=r*spread*(.82+.18*bloom);
 out.inner=out.outer*.72;
 out.yawA=t*(phase==='cast'?-.22:-.45);
 out.yawB=t*(phase==='vortex'?.86:.53);
 return out;
}
function texture(draw,size=S){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=size;
 const c=canvas.getContext('2d');c.translate(size/2,size/2);c.scale(size/2,size/2);
 c.lineCap='round';c.lineJoin='round';
 draw(c);
 const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;
 return t;
}
function line(c,pts){
 c.beginPath();for(let i=0;i<pts.length;i++){const [x,y]=pts[i];if(i)c.lineTo(x,y);else c.moveTo(x,y);}
}
function ring(c,r,a=0,b=TAU){
 c.beginPath();c.arc(0,0,r,a,b);c.stroke();
}
function stroke(c,w,color){
 c.lineWidth=w;c.strokeStyle=color;c.stroke();
}
function jewel(c,w,h){
 const p=[[0,-h],[-w,0],[0,h],[w,0]];
 line(c,p);c.closePath();
 let g=c.createLinearGradient(-w,-h,w,h);g.addColorStop(0,'#fafffc');g.addColorStop(.42,'#a9edff');g.addColorStop(.65,'#7ba9ec');g.addColorStop(1,'#d797d9');
 c.fillStyle=g;c.fill();stroke(c,.005,'#f5dfee');
 line(c,[[0,-h],[0,.015],[-w,0]]);stroke(c,.0045,'#fff5e9');
 line(c,[[0,h],[0,.015],[w,0]]);stroke(c,.004,'#766daa');
}
function flake(c){
 for(let i=0;i<6;i++){
  c.save();c.rotate(i*TAU/6);
  line(c,[[0,-.11],[-.081,-.33],[0,-.68],[.081,-.33]]);c.closePath();
  const g=c.createLinearGradient(-.057,-.68,.075,-.20);g.addColorStop(0,'#f6ffff');g.addColorStop(.43,'#96dcff');g.addColorStop(.54,'#d4fcff');g.addColorStop(1,'#6266ba');
  c.fillStyle=g;c.fill();stroke(c,.029,'#343360c9');stroke(c,.013,'#eefcff');
  line(c,[[0,-.67],[0,-.13]]);stroke(c,.006,'#ffe7fb');
  for(const side of [-1,1])for(const level of [0,1]){
   const y=-.29-level*.16,x=side*(.175-level*.034);
   line(c,[[0,y],[x*.72,y-.12],[x,y-.174],[x*.65,y-.147],[x*.54,y-.10],[0,y+.024]]);
   c.closePath();c.fillStyle=level?'#e8c3f0':'#a0e8fd';c.fill();stroke(c,.009,'#e8fdff');
  }
  c.save();c.translate(0,-.774);jewel(c,.034,.046);c.restore();c.restore();
 }
 jewel(c,.13,.15);
}
function mark(c,i){
 const glyphs=[
  [[-.032,.027],[-.032,-.021],[-.012,-.042],[.027,-.029],[.027,.019],[.005,.033]],
  [[-.033,-.028],[.029,-.028],[.029,.028],[.008,.047],[-.023,.027]],
  [[-.031,.026],[-.031,-.017],[0,-.043],[.032,-.017],[.032,.014],[-.01,.014]],
  [[-.031,-.026],[.031,-.026],[.029,.026],[.004,.043],[-.028,.026],[-.028,.002]],
  [[-.030,.033],[-.030,-.03],[.021,-.03],[.021,.012],[-.009,.012]],
  [[-.031,-.025],[.028,-.025],[.028,.027],[-.009,.027],[-.009,-.007]]
 ];
 line(c,glyphs[i%6]);stroke(c,.012,'#fbf5f9');
 if(i%2===0){line(c,[[.042,-.023],[.042,.023]]);stroke(c,.007,'#b8e6ff');}
}
function medallion(c,i){
 const glass=c.createRadialGradient(-.035,-.04,.012,0,0,.139);
 glass.addColorStop(0,'#9da3e0');glass.addColorStop(.53,'#6654a8');glass.addColorStop(1,'#372b62');
 c.beginPath();c.arc(0,0,.119,0,TAU);c.fillStyle=glass;c.fill();stroke(c,.027,'#292343');stroke(c,.012,'#fff3fb');
 c.lineWidth=.006;c.strokeStyle='#cddef9';ring(c,.096);
 if(i===0){
  c.beginPath();c.moveTo(-.057,.017);c.bezierCurveTo(-.017,-.05,.033,-.06,.068,-.068);
  c.bezierCurveTo(.043,-.023,.012,.047,-.048,.056);stroke(c,.011,'#ebf7ff');
  line(c,[[-.060,.045],[-.01,-.008],[.044,-.043]]);stroke(c,.006,'#c4e6fe');
 }else if(i===1){
  jewel(c,.038,.065);
  c.lineWidth=.006;c.strokeStyle='#faddfc';ring(c,.083,.30,2.5);ring(c,.083,3.44,5.64);
 }else{
  c.beginPath();c.moveTo(0,.061);c.bezierCurveTo(-.084,.005,-.057,-.052,0,-.041);
  c.bezierCurveTo(.057,-.052,.084,.005,0,.061);stroke(c,.011,'#ffd9f4');
  c.beginPath();c.arc(0,-.001,.018,0,TAU);c.fillStyle='#e2f9ff';c.fill();
 }
}
function outerArt(c){
 const h=c.createRadialGradient(0,0,.05,0,0,1);
 h.addColorStop(0,'#9256d13b');h.addColorStop(.38,'#623da045');h.addColorStop(.66,'#263c7c8d');
 h.addColorStop(.91,'#444f87d4');h.addColorStop(.97,'#6b94c2a0');h.addColorStop(1,'#bbdce800');
 c.fillStyle=h;c.beginPath();c.arc(0,0,.99,0,TAU);c.fill();
 const rim=c.createLinearGradient(-.86,-.75,.75,.9);
 rim.addColorStop(0,'#fff6ed');rim.addColorStop(.24,'#cbf4ff');rim.addColorStop(.51,'#f5d7ff');rim.addColorStop(.73,'#f1e7ff');rim.addColorStop(1,'#b5e7ff');
 for(const [r,w,col] of [[.971,.012,'#f5f5fab5'],[.946,.013,rim],[.925,.007,'#bad8f8'],[.904,.006,'#d9eeff'],[.887,.010,rim],[.755,.013,rim],[.733,.007,'#d6eeff'],[.712,.006,'#fce5ff']]){
  c.lineWidth=w;c.strokeStyle=col;ring(c,r);
 }
 for(let i=0;i<36;i++){
  c.save();c.rotate((i+.5)*TAU/36);c.translate(0,-.821);mark(c,i);c.restore();
 }
 for(let i=0;i<24;i++){
  const a=(i+.5)*TAU/24;c.save();c.rotate(a);
  line(c,[[0,-.706],[-.06,-.657],[0,-.679],[.06,-.657],[0,-.706]]);stroke(c,.007,'#e6edffcc');
  if(i%3===1){line(c,[[0,-.939],[0,-.900]]);stroke(c,.009,'#f0efff');}
  c.restore();
 }
 for(let i=0;i<3;i++){
  c.save();c.rotate(i*TAU/3+.14);c.translate(0,-.821);medallion(c,i);c.restore();
 }
}
function innerArt(c){
 const hex=(r,offset)=>Array.from({length:7},(_,i)=>[r*Math.cos(i*TAU/6+offset),r*Math.sin(i*TAU/6+offset)]);
 line(c,hex(.89,TAU/12));stroke(c,.021,'#382d72aa');stroke(c,.010,'#f0e8ffd4');
 line(c,hex(.865,TAU/12));stroke(c,.006,'#bde9f7bb');
 c.save();c.scale(1.08,1.08);flake(c);c.restore();
 for(let i=0;i<6;i++){
  c.save();c.rotate(i*TAU/6+TAU/12);
  c.translate(0,-.58);jewel(c,.015,.027);c.restore();
 }
}
export function angelSatellitePose(t,radius,impact,out={}){
 const x=clamp(t);
 out.scale=radius*(impact?.38+.46*smooth(0,.78,x):.36+.07*smooth(0,.75,x));
 out.opacity=impact?(.64+.36*smooth(0,.19,x))*(1-smooth(.24,1,x)):(.50+.44*smooth(0,.65,x))*(1-smooth(.90,1,x));
 return out;
}
let satelliteAtlas;
function satelliteArt(c){
 const veil=c.createRadialGradient(0,0,.03,0,0,.99);
 veil.addColorStop(0,'#cfcaff90');veil.addColorStop(.36,'#6058a638');veil.addColorStop(.68,'#5945a347');veil.addColorStop(1,'#aeeeff00');
 c.fillStyle=veil;c.beginPath();c.arc(0,0,.99,0,TAU);c.fill();
 for(let i=0;i<6;i++){
  c.save();c.rotate(i*TAU/6);
  c.beginPath();c.moveTo(0,-.78);
  c.quadraticCurveTo(.165,-.60,.141,-.48);c.quadraticCurveTo(.102,-.401,0,-.279);
  c.quadraticCurveTo(-.102,-.401,-.141,-.48);c.quadraticCurveTo(-.165,-.60,0,-.78);c.closePath();
  const glass=c.createLinearGradient(-.12,-.44,.10,-.80);
  glass.addColorStop(0,'#514178d9');glass.addColorStop(.58,'#8086d8ea');glass.addColorStop(1,'#bdefff');
  c.fillStyle=glass;c.fill();stroke(c,.035,'#32254ec8');stroke(c,.017,'#d9efff');
  line(c,[[0,-.727],[0,-.335]]);stroke(c,.009,'#fff1eea6');
  c.rotate(TAU/12);c.translate(0,-.60);jewel(c,.035,.062);c.restore();
 }
 c.lineWidth=.013;c.strokeStyle='#ffdaefda';ring(c,.237);
 jewel(c,.154,.193);
}
export function createAngelSatellite(root,radius,impact){
 if(!satelliteAtlas)satelliteAtlas=texture(satelliteArt,320);
 const g=new THREE.PlaneGeometry(2,2);
 const mat=new THREE.MeshBasicMaterial({map:satelliteAtlas,transparent:true,depthWrite:false,opacity:0,toneMapped:false});
 const m=new THREE.Mesh(g,mat);m.name='Angel seal | satellite ice bloom';
 m.rotation.x=-Math.PI/2;m.position.y=.137;m.renderOrder=4;root.add(m);
 const p={};
 return t=>{
  angelSatellitePose(t,radius,impact,p);m.scale.setScalar(p.scale);
  m.material.opacity=p.opacity;
 };
}
export function createAngelSeal(root,phase,radius){
 if(phase==='barrier-pop')return null;
 if(!atlas)atlas=[texture(outerArt),texture(innerArt)];
 const layers=atlas.map((map,i)=>{
  const mat=new THREE.MeshBasicMaterial({color:0xffffff,map,transparent:true,depthWrite:false,opacity:0,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-1});
  const m=new THREE.Mesh(new THREE.PlaneGeometry(2,2),mat);
  m.name=i?'Angel seal | crystal rose':'Angel seal | engraved runes';
  m.rotation.x=-Math.PI/2;m.position.y=i?.128:.116;m.renderOrder=3+i;root.add(m);return m;
 });
 const p={};
 const reduced=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 return t=>{
  angelSealPose(phase,t,radius,p);
  layers[0].scale.setScalar(p.outer);layers[1].scale.setScalar(p.inner);
  layers[0].rotation.z=reduced?0:p.yawA;layers[1].rotation.z=reduced?0:p.yawB;
  layers[0].material.opacity=p.opacity;layers[1].material.opacity=p.opacity*.96;
 };
}
