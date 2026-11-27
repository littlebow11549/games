import * as THREE from '../vendor/three/three.module.min.js';
import {mergeGeometries} from '../vendor/three/addons/utils/BufferGeometryUtils.js';

export function nightmareShotAim(from,to){
 const x=to.x-from.x,z=to.z-from.z,d=Math.hypot(x,z);
 return Number.isFinite(d)&&d>.001?new THREE.Vector3(x/d,0,z/d):null;
}
let wingArt, spiritBody, spiritTask, spiritSettled=false;
let referenceHeight=1.05,assetHeight=1.45476;
export function setNightmareSpiritHeight(height){if(Number.isFinite(height)&&height>0)referenceHeight=height;}
const spiritScale=()=>referenceHeight/assetHeight;
const spiritUrl=new URL('../assets/runtime/stage-art/brave_guy_charactor03_nightmare_spirit.glb?v=20261127spiritflight',import.meta.url);
export const nightmareSpiritIsReady=()=>spiritSettled;
export function prepareNightmareSpirit(){
 if(!spiritTask)spiritTask=import('../vendor/three/addons/loaders/GLTFLoader.js')
  .then(({GLTFLoader})=>new GLTFLoader().loadAsync(spiritUrl.href))
  .then(({scene})=>{spiritBody=scene;const height=new THREE.Box3().setFromObject(scene).getSize(new THREE.Vector3()).y;if(height>0)assetHeight=height;spiritBody.traverse(node=>{if(node.isMesh)node.material.toneMapped=false});return true;})
  .catch(()=>false).finally(()=>{spiritSettled=true;});
 return spiritTask;
}
function sculptWings(){
 const material=new THREE.MeshBasicMaterial({vertexColors:true,toneMapped:false});
 const wing=[-1,1].map(side=>{
  const parts=[];
  for(const [i,[rx,ry,rz]] of [[.217,.093,.034],[.179,.078,.029],[.139,.065,.021]].entries()){
   const shape=new THREE.SphereGeometry(1,12,8);
   shape.scale(rx,ry,rz).rotateZ(side*(.69-.24*i)).translate(side*(.168-.024*i),.12-.101*i,0);
   const p=shape.attributes.position,colors=new Float32Array(p.count*3);
   const deep=new THREE.Color(0x71419a), pale=new THREE.Color(i===0?0xf1dbff:0xce9bfc),color=new THREE.Color();
   for(let k=0;k<p.count;k++){
    const light=THREE.MathUtils.clamp(.47+.9*p.getY(k)+.51*Math.abs(p.getX(k))+.19*Math.sign(p.getZ(k)),.12,.98);
    color.copy(deep).lerp(pale,light);
    colors.set([color.r,color.g,color.b],k*3);
   }
   shape.setAttribute('color',new THREE.BufferAttribute(colors,3));parts.push(shape);
  }
  const result=mergeGeometries(parts);parts.forEach(g=>g.dispose());return result;
 });
 return {wing,material};
}
export function createNightmareDrone(scene){
 const art=wingArt||(wingArt=sculptWings());
 const root=new THREE.Group();
 root.name='Nightmare skill2 | Tripo chibi spirit';
 root.userData.modelKind='nightmare_spirit';
 root.scale.setScalar(spiritScale());
 const body=new THREE.Group();root.add(body);
 const attach=()=>{if(spiritBody&&root.parent&&!body.children.length){body.add(spiritBody.clone(true));root.scale.setScalar(spiritScale());root.userData.hasTripoBody=true;}};
 const wings=art.wing.map((g,i)=>{
  const m=new THREE.Mesh(g,art.material);m.position.set(i?.105:-.105,.76,-.165);root.add(m);return m;
 });
 let time=0;
 root.userData.advanceSpirit=dt=>{
  time+=dt;body.position.y=Math.sin(time*8)*.052;body.rotation.x=.055*Math.sin(time*8-.4);
  for(let i=0;i<2;i++){
   const side=i?1:-1,amount=Math.sin(time*14+i*.11);
   wings[i].position.y=.76+body.position.y;
   wings[i].rotation.y=side*(.14+.58*amount);wings[i].rotation.z=side*(.12+.18*amount);
  }
 };
 root.userData.releaseSpirit=()=>root.clear(); // all drones share immutable asset geometry/materials
 scene.add(root);attach();
 if(!spiritBody&&typeof window!=='undefined')prepareNightmareSpirit().then(attach);
 root.userData.advanceSpirit(0);
 return root;
}
// Original Nightmare Wave silhouette, without the two chartreuse side accents.
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
    vec3 color=mix(vec3(.066,.010,.12),vec3(.42,.12,.84),max(glow,bevel*.88));
    color=mix(color,vec3(.95,.74,1.),max(hot,slit*.68));
    float alpha=max(glow*.80,max(bevel*.8,max(hot,slit*.72)));
    if(alpha<.026)discard;
    gl_FragColor=vec4(color,alpha);
    #include <colorspace_fragment>
   }`
 });
 const a=new THREE.Mesh(geo,mat),b=a.clone();b.rotation.z=Math.PI/2;root.add(a,b);
 return root;
}
