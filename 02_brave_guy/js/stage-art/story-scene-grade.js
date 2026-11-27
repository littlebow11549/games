// Artwork only. Warming fixtures, perimeter contrast and floor wear are
// independent of stage topology. Each light is [x,z,radiusX,radiusZ,hue,opacity].
const scene=(sky,edge,horizon,material,lights,shade=.48)=>Object.freeze({sky,edge,horizon,material,lights,shade});
export const SCENE_GRADES=Object.freeze({
 '1-0':scene('#b08c9a','#706078','#b89a91','timber',[[-5.2,-12.6,4.9,4.1,'#ffcf9e',.56],[11.3,4.8,3.0,3.9,'#f6af9d',.44]],.44),
 '1-2':scene('#9fc8bb','#527c7a','#90b29d','court',[[-10.8,-11.2,6.7,5.0,'#ffde98',.55],[11.1,5.8,3.8,4.7,'#ffedb4',.37]],.48),
 '1-3':scene('#ab8992','#78576a','#bd9186','flagstone',[[0,-16.8,5.4,4.7,'#ffc291',.54],[-12.2,-5.9,4.7,4.4,'#ffe0a7',.53],[13.1,4.6,4.5,3.6,'#edb1a0',.29]],.53),
 '1-4':scene('#7d799c','#564e76','#9386a0','flagstone',[[0,-17.6,4.7,5.8,'#ffc792',.69],[-12.7,-3.9,4.5,3.6,'#f5b29a',.53],[12.4,7.7,3.1,3.9,'#aaa5ee',.33]],.62),
 '2-1':scene('#355b62','#294c54','#538276','woodland',[[-10.9,-11.3,6.3,6.2,'#b5e4aa',.53],[4.6,-5.3,5.6,4.9,'#ddeeaa',.48],[10.8,10.2,4.8,4.1,'#6cbdaf',.42]],.66),
 '2-2':scene('#57516d','#423f60','#877280','flagstone',[[-12.4,-11.7,4.5,4.5,'#ffbe80',.67],[0,-16.3,3.4,4.4,'#ffce89',.57],[12.2,5.8,4.2,3.9,'#f5a680',.53]],.59),
 '3-0':scene('#636f8c','#444c70','#8a8098','timber',[[-11.4,-11.2,4.4,4.5,'#fbcaa1',.59],[2.4,-16.8,4.4,4.3,'#b9d4f2',.52],[12.9,8.0,3.6,3.3,'#f7b789',.43]],.61),
 '3-1':scene('#91acb6','#607b87','#aac1c2','marble',[[0,-16.1,5.8,5.6,'#e7fbf0',.54],[-12.3,-5.7,4.8,3.5,'#affaee',.43],[13.2,7.1,3.7,4.4,'#fde7b5',.46]],.42),
 '3-2':scene('#738e82','#4a6966','#88a394','ceramic',[[10.5,-11.3,5.3,4.6,'#ffde9d',.63],[-12.9,-8,4.6,4.1,'#dceab6',.43],[-11.4,6.2,4.0,3.5,'#f4cf9a',.40]],.55),
 '3-3':scene('#62617b','#454765','#8a7b98','textile',[[0,-17.1,5.4,5.1,'#c9dfff',.56],[-12.2,-5.6,4.0,3.3,'#e0a5ad',.52],[12.8,6.4,4.0,3.8,'#d0c1ed',.42]],.58),
 '3-4':scene('#697d8e','#475b7b','#899dad','ceramic',[[0,-15.6,4.5,4.7,'#b9e6ff',.52],[-11.3,-5.1,4.0,4.2,'#ffb1bd',.47],[12.9,6.5,4.7,4.2,'#a7edf1',.50]],.60),
 '3-5':scene('#68536f','#53445f','#a57380','timber',[[0,-16.5,6.2,5.6,'#ffc38f',.63],[-13.5,-4.0,4.6,5.3,'#ed9bae',.48],[12.8,7.3,4.4,4.9,'#a3afd8',.39]],.68),
 '3-6':scene('#685463','#4e405b','#927580','marble',[[0,-17.5,4.7,5.1,'#ffce84',.68],[-12.0,-7.0,4.0,4.2,'#f2b47f',.54],[12.7,6.8,4.6,4.0,'#e8c28b',.47]],.67),
 '4-1':scene('#4b3b63','#332947','#6c537c','rift',[[0,-16.6,5.1,5.9,'#f1a4ef',.62],[-12.8,-4.4,4.8,4.7,'#b292f0',.52],[12.5,6.3,4.1,4.4,'#eda5c4',.42]],.70)
});
export const modelLightRig=grade=>grade?.lights.map(([x,z,rx,rz,color,a])=>[x,1.25,z,Math.sqrt(rx*rz),color,a*.52]);
export function paintSceneWear(c,grade,uv,k,extent) {
 const s=rng(23517+grade.material.charCodeAt(0)),{material:kind}=grade;
 const clip=extent*k;
 const sketch=(x,z,len,bend,weight,color)=>{
  c.lineWidth=weight;c.strokeStyle=color;c.beginPath();c.moveTo(uv(x),uv(z));
  c.quadraticCurveTo(uv(x+len*.43),uv(z+bend),uv(x+len),uv(z+bend*.58));c.stroke();
 };
 c.save();
 if(kind==='timber'){
  for(let j=-28;j<28;j++){
   const z=.76*j;
   c.strokeStyle=j%3?'#25192f30':'#351f393e';c.lineWidth=1.1;
   c.beginPath();c.moveTo(uv(-extent),uv(z));c.lineTo(uv(extent),uv(z));c.stroke();
   c.strokeStyle='#fff1cc29';c.beginPath();c.moveTo(uv(-extent),uv(z)+1.6);c.lineTo(uv(extent),uv(z)+1.6);c.stroke();
   for(let i=-8;i<=8;i++){
    const x=i*3.1+(j%3)*1.02, r=s();
    c.fillStyle=r>.45?'#eed3a618':'#58425b1c';
    c.fillRect(uv(x),uv(z)+2,(3.1*k)-.9,(.76*k)-2);
    c.fillStyle='#291f342f';c.fillRect(uv(x),uv(z),1,.76*k);
    sketch(x+.16,z+.18+r*.32,.76+r*.66,(s()-.5)*.09,.7,'#4e3d581f');
   }
  }
 }else if(kind==='woodland'||kind==='rift'){
  for(let i=0;i<255;i++){
   const x=(s()-.5)*45,z=(s()-.5)*44, r=s();
   const color=kind==='rift'?(r>.58?'#ffb2eb2e':'#32264831'):(r>.65?'#d0dfa82d':'#325c572b');
   c.fillStyle=color;c.beginPath();c.ellipse(uv(x),uv(z),(.055+r*.15)*k,(.024+r*.048)*k,s()*Math.PI,0,7);c.fill();
   if(kind==='rift'&&r>.84)sketch(x,z,.42+r*.31,-.09,1.26,'#4a355c52');
  }
 }else if(kind==='textile'){
  for(let j=-26;j<26;j++){
   c.fillStyle=j%3?'#aeb5eb0b':'#5d466428';c.fillRect(uv(-extent),uv(j*.69),clip*2,1.35);
  }
  for(let i=0;i<200;i++)sketch((s()-.5)*43,(s()-.5)*43,.08+s()*.26,(s()-.5)*.02,.66,'#efe2f01d');
 }else{
  const rows=kind==='court'?1.14:kind==='marble'?1.85:.99, span=kind==='court'?1.91:kind==='marble'?1.83:1.48;
  for(let j=-23;j<=23;j++)for(let i=-22;i<=22;i++){
   const x=(i+((j&1)&&kind!=='marble'?.49:0))*span,z=j*rows;
   const r=s(),x0=uv(x),z0=uv(z);
   c.fillStyle=r>.58?'#ffe2a314':r<.29?'#3c496823':'#eef5e40d';
   c.fillRect(x0+1.5,z0+1.5,span*k-3,rows*k-3);
   c.strokeStyle=kind==='marble'?'#53617737':'#463b5438';c.lineWidth=1.4;
   c.strokeRect(x0+1.1,z0+1.1,span*k-2.2,rows*k-2.2);
   c.strokeStyle='#fff0df32';c.lineWidth=.85;c.beginPath();
   c.moveTo(x0+2,z0+rows*k-2);c.lineTo(x0+2,z0+2);c.lineTo(x0+span*k-3,z0+2);c.stroke();
   if(r>.83)sketch(x+.16,z+.35,span*.45,(s()-.5)*.14,.82,kind==='marble'?'#6b729137':'#8a6c652e');
  }
 }
 c.restore();
}
export function paintSceneRim(c,grade,uv,k,size,walls,edges){
 c.save();
 const fence=c.createRadialGradient(uv(0),uv(-1),k*8.4,uv(0),uv(-1),k*28);
 fence.addColorStop(0,grade.edge+'00');fence.addColorStop(.64,grade.edge+'22');fence.addColorStop(1,grade.edge+'a2');
 c.fillStyle=fence;c.fillRect(0,0,size,size);
 c.lineWidth=k*(.92+grade.shade*.78);
 c.shadowBlur=10;c.shadowOffsetY=3;c.shadowColor=grade.edge+'8a';
 c.strokeStyle=grade.edge+'66';c.stroke(edges);
 c.shadowBlur=0;c.shadowOffsetY=0;
 c.lineWidth=1.6;c.strokeStyle=grade.horizon+'a0';c.stroke(edges);
 c.restore();
 for(const [x,z,rx,rz,hue,alpha] of grade.lights){
  c.save();c.translate(uv(x),uv(z));c.scale(k*rx,k*rz);
  const g=c.createRadialGradient(0,-.12,.05,0,0,1);
  g.addColorStop(0,hue+hex(alpha));g.addColorStop(.35,hue+hex(alpha*.66));
  g.addColorStop(.69,hue+hex(alpha*.26));g.addColorStop(1,hue+'00');
  c.fillStyle=g;c.fillRect(-1,-1,2,2);
  c.restore();
 }
}
const rng=seed=>()=>((seed=(Math.imul(1664525,seed)+1013904223)>>>0)/4294967296);
const hex=n=>Math.round(n*255).toString(16).padStart(2,'0');
