import * as THREE from '../vendor/three/three.module.min.js';
import {mergeGeometries} from '../vendor/three/addons/utils/BufferGeometryUtils.js';

export function nightmareShotAim(from,to){
 const x=to.x-from.x,z=to.z-from.z,d=Math.hypot(x,z);
 return Number.isFinite(d)&&d>.001?new THREE.Vector3(x/d,0,z/d):null;
}
let spiritArt;
function sculptSpirit(){
 const parts=[];
 const sphere=()=>new THREE.SphereGeometry(1,10,6);
 function part(g,ink,x,y,z,sx,sy,sz,rz=0){
  const shape=g.index?g.toNonIndexed():g;
  if(shape!==g)g.dispose();
  shape.scale(sx,sy,sz).rotateZ(rz).translate(x,y,z);
  const p=shape.attributes.position,colors=new Float32Array(p.count*3);
  const c=new THREE.Color(ink);
  for(let i=0;i<p.count;i++){
   const light=Math.min(1.19,Math.max(.70,.96+.48*(p.getY(i)-y)+.38*(p.getZ(i)-z)));
   colors.set([c.r*light,c.g*light,c.b*light],i*3);
  }
  shape.setAttribute('color',new THREE.BufferAttribute(colors,3));
  parts.push(shape);
 }
 const orb=(...v)=>part(sphere(),...v);
 const merge=()=>{
  const merged=mergeGeometries(parts);
  parts.forEach(g=>g.dispose());parts.length=0;
  return merged;
 };
 // Giant soft-square head, tiny floating jacket, mitten hands and boots.
 orb(0x38204f,0,.44,0,.24,.26,.18);
 orb(0x6c38a2,0,.49,.03,.202,.202,.168);
 orb(0x613426,0,.96,-.02,.345,.345,.304);
 orb(0xffcba8,0,.92,.085,.308,.283,.254);
 orb(0x814536,0,1.122,.042,.318,.16,.277);
 for(const [x,y,z,rx,ry,rz,tilt] of [[-.20,1.23,.11,.113,.24,.096,.42],[-.051,1.30,.13,.114,.23,.071,-.16],[.094,1.28,.115,.105,.23,.090,-.34],[.226,1.208,.168,.095,.20,.087,-.59]]){
  part(new THREE.ConeGeometry(1,2,7),0x944832,x,y,z,rx,ry,rz,tilt);
 }
 for(const side of [-1,1]){
  orb(0xf7b498,side*.29,.89,.084,.069,.084,.066);
  orb(0x352137,side*.115,.934,.308,.068,.089,.022,side*.14);
  orb(0xffeaca,side*.115,.920,.322,.052,.065,.014,side*.10);
  orb(0xdc395e,side*.107,.917,.333,.022,.045,.011);
  orb(0xfffaff,side*.107-.008,.939,.342,.009,.013,.006);
  orb(0x9bd94e,side*.228,.454,.059,.084,.103,.078,side*.30);
  orb(0x332143,side*.103,.244,.02,.079,.114,.075);
  orb(0x7fbd3e,side*.106,.160,.045,.087,.078,.102,side*.13);
 }
 orb(0x572b45,0,.808,.319,.052,.021,.012,-.13);
 const collar=new THREE.TorusGeometry(1,.26,6,16);collar.rotateX(Math.PI/2);
 part(collar,0xa8dc50,0,.666,0,.163,.106,.146);
 orb(0x75b343,-.126,.63,-.143,.084,.061,.136,-.34);
 orb(0x628729,-.222,.586,-.232,.116,.047,.088,.39);
 part(new THREE.OctahedronGeometry(1),0xe9b5ff,0,.496,.182,.045,.063,.021);
 const body=merge(),wing=[-1,1].map(side=>{
  orb(0x6b399d,side*.162,.109,-.013,.183,.110,.050,side*.45);
  orb(0xad66da,side*.257,.177,-.029,.191,.069,.047,side*.51);
  orb(0xcc9ef1,side*.215,.080,.010,.158,.055,.039,side*.19);
  orb(0x9564c5,side*.150,-.002,.006,.104,.043,.035,side*.04);
  return merge();
 });
 return {body,wing,material:new THREE.MeshLambertMaterial({vertexColors:true,toneMapped:false,emissive:0x29202e,emissiveIntensity:.38})};
}
export function createNightmareDrone(scene){
 const art=spiritArt||(spiritArt=sculptSpirit());
 const root=new THREE.Group();
 root.name='Nightmare skill2 | miniature Nightmare spirit';
 root.userData.modelKind='nightmare_spirit';
 const body=new THREE.Mesh(art.body,art.material);root.add(body);
 const wings=art.wing.map((g,i)=>{
  const m=new THREE.Mesh(g,art.material);m.position.set(i?.11:-.11,.58,-.12);root.add(m);return m;
 });
 let time=0;
 root.userData.advanceSpirit=dt=>{
  time+=dt;body.position.y=Math.sin(time*9)*.045;
  for(let i=0;i<2;i++){
   const side=i?1:-1,amount=Math.sin(time*15+i*.11);
   wings[i].position.y=.58+body.position.y;
   wings[i].rotation.y=side*(.22+.51*amount);wings[i].rotation.z=side*(.09+.14*amount);
  }
 };
 root.userData.releaseSpirit=()=>root.clear(); // shared species geometry/material retain ownership
 root.userData.advanceSpirit(0);
 scene.add(root);return root;
}
// A solid arrowhead of violet pressure over a dark tapered wake. Two crossed sheets
// keep the silhouette readable from the mobile camera without relying on bloom.
export function createNightmareWave(dir){
 const root=new THREE.Group();root.name='Nightmare skill2 | straight nightmare wave';
 root.rotation.y=Math.atan2(dir.x,dir.z);
 const geo=new THREE.PlaneGeometry(1.82,4.25);
 geo.rotateX(Math.PI/2);geo.translate(0,0,-1.47);
 const mat=new THREE.ShaderMaterial({
  transparent:true,depthWrite:false,side:THREE.DoubleSide,forceSinglePass:true,toneMapped:false,
  vertexShader:`varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`varying vec2 v;
   float band(float x,float w){return 1.-smoothstep(w,w+.022,abs(x));}
   void main(){
    float x=abs(v.x*2.-1.), u=v.y;
    float p=smoothstep(.03,.89,u)*(1.-smoothstep(.86,.995,u));
    float fin=pow(sin(u*3.14159),.73)*(.63+.33*smoothstep(.38,.72,u));
    float bevel=band(x-fin*.82,.041)*p;
    float slit=band(x-fin*(.41+.17*cos(u*26.)),.025)*p*(.3+.7*smoothstep(.41,.52,u));
    float glow=(1.-smoothstep(.06,max(fin*.78,.065),x))*p;
    float hot=(1.-smoothstep(.02,max(.026,fin*.23),x))*smoothstep(.29,.77,u)*(1.-smoothstep(.95,1.,u));
    float pip=band(u-.77,.061)*band(x-fin*.68,.066);
    vec3 color=mix(vec3(.066,.010,.12),vec3(.42,.12,.84),max(glow,bevel*.88));
    color=mix(color,vec3(.95,.74,1.),max(hot,slit*.68));
    color=mix(color,vec3(.73,1.,.33),pip);
    float alpha=max(glow*.80,max(bevel*.8,max(hot,max(slit*.72,pip*.9))));
    if(alpha<.026)discard;
    gl_FragColor=vec4(color,alpha);
    #include <colorspace_fragment>
   }`
 });
 const a=new THREE.Mesh(geo,mat),b=a.clone();b.rotation.z=Math.PI/2;root.add(a,b);
 return root;
}
