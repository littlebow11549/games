import * as THREE from '../vendor/three/three.module.min.js';

const TAU = Math.PI * 2;
const clamp = x => Math.max(0, Math.min(1,x));
const fract = x => x - Math.floor(x);
const grain = (i,seed) => fract(Math.sin((i+1)*127.1+seed*311.7)*43758.5453);
const pa = [0xeefcff,0x85eaff,0x68bffa,0xffc5f1,0xc8dfff];
const glaze = (color, opacity=1) => new THREE.MeshBasicMaterial({
 color,opacity,transparent:true,depthWrite:false,side:THREE.DoubleSide,forceSinglePass:true
});
function strip(radius,thickness,segments=64,length=TAU){
 const m=new THREE.RingGeometry(radius-thickness/2,radius+thickness/2,segments,1,0,length);
 m.rotateX(-Math.PI/2);return m;
}
function spiral(offset,weight){
 const points=[], indices=[];
 for(let i=0;i<=36;i++){
  const t=i/36,a=offset+t*TAU*1.05,r=1.1+5.15*t,w=weight*Math.pow(Math.sin(Math.PI*t),.68);
  const y=.22+5.65*t+.12*Math.sin(3*a);
  points.push(Math.cos(a)*(r-w),y-w*.85,Math.sin(a)*(r-w),Math.cos(a)*(r+w),y+w*.85,Math.sin(a)*(r+w));
  if(i<36){const j=i*2;indices.push(j,j+1,j+2,j+1,j+3,j+2);}
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points,3));g.setIndex(indices);return g;
}
// A six-armed flake with bifurcating branches rather than a generic square particle.
function flake(){
 const points=[],indices=[];
 function stroke(ax,az,bx,bz,w){
  const d=Math.hypot(bx-ax,bz-az),dx=(bz-az)*w/d,dz=(ax-bx)*w/d,i=points.length/3;
  points.push(ax-dx,0,az-dz,ax+dx,0,az+dz,bx+dx,0,bz+dz,bx-dx,0,bz-dz);
  indices.push(i,i+1,i+2,i,i+2,i+3);
 }
 for(let i=0;i<6;i++){
  const a=i*TAU/6,x=Math.cos(a),z=Math.sin(a);
  stroke(x*.04,z*.04,x,z,.045);
  for(const sign of [-1,1]){
   const b=a+sign*TAU/6;
   stroke(x*.56,z*.56,x*.56+Math.cos(b)*.32,z*.56+Math.sin(b)*.32,.036);
  }
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points,3));g.setIndex(indices);return g;
}
function crystal(){
 const pts=[], colors=[], ice=pa.map(c=>new THREE.Color(c));
 const top=[-.12,1.35,.12], bottom=[.09,-.92,.03];
 const girdle=Array.from({length:5},(_,i)=>[Math.cos(i*TAU/5)*.47,.13*Math.sin(i*TAU/5), Math.sin(i*TAU/5)*.47]);
 for(let i=0;i<5;i++){
  const j=(i+1)%5;pts.push(...top,...girdle[j],...girdle[i],...bottom,...girdle[i],...girdle[j]);
  for(let k=0;k<3;k++)colors.push(...ice[i].toArray());
  for(let k=0;k<3;k++)colors.push(...ice[(i+2)%5].toArray());
 }
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));
 g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
 return g;
}

/**
 * Simulation-time art only. The caller owns damage, control, target and cast ticks.
 * No frame allocations, texture downloads, lights or per-particle draw calls.
 */
export function createAngelIceFx(scene,pos,phase){
 const tempest=phase==='vortex',final=phase==='finish',pop=phase==='barrier-pop';
 const life=tempest?4:final?.72:pop?.38:2, radius=tempest?13:final?17:pop?3.2:9;
 const root=new THREE.Group();root.name='angel-ice-'+phase;root.position.copy(pos);scene.add(root);
 const dummy=new THREE.Object3D();
 function mesh(g,c,order){
  const m=new THREE.Mesh(g,glaze(c,0));m.renderOrder=order;root.add(m);return m;
 }
 function pool(g,color,count,facets=false){
  const m=new THREE.InstancedMesh(g,glaze(color,0),count);m.material.vertexColors=facets;
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);m.frustumCulled=false;m.renderOrder=7;root.add(m);return m;
 }
 const edge=mesh(strip(1,.035),0x479bd5,3);
 const core=mesh(strip(1,.017),0xf0fdff,4);
 const arc=mesh(strip(1,.06,44,TAU*.32),0x94dcff,4);arc.position.y=.13;
 const trim=mesh(strip(1,.025,36,TAU*.33),0xffc7ec,5);trim.position.y=.15;
 const sigil=mesh(flake(),0xbcf2ff,3);sigil.position.y=.095;
 const helix=tempest?Array.from({length:3},(_,i)=>[
  mesh(spiral(i*TAU/3,.44),[0x60bbff,0xafeaff,0xa4bfff][i],5),
  mesh(spiral(i*TAU/3+.03,.14),[0xf4fdff,0xffc4ee,0xcbf6ff][i],6)
 ]).flat():[];
 const icicles=pool(crystal(),0xffffff,tempest?30:final?28:pop?8:22,true);
 const snow=pool(flake(),0xffffff,tempest?44:final?24:pop?9:34);
 const pools=[icicles,snow].map((m,j)=>({m,isFlake:j===1,seeds:Array.from({length:m.count},(_,i)=>({
  a0:(i/m.count+grain(i,1)*.06)*TAU,rad:grain(i,2),seed:grain(i,3),tilt:grain(i,4)
 }))}));
 for(let i=0;i<snow.count;i++)snow.setColorAt(i,new THREE.Color(pa[i%pa.length]));
 if(snow.instanceColor)snow.instanceColor.needsUpdate=true;
 let age=0,closed=false;
 function update(dt){
  if(closed)return;
  age=Math.min(life,age+dt);
  const t=age/life,tail=1-clamp((t-(tempest?.87:.55))/(tempest?.13:.45));
  const pulse=tempest?(.84+.16*Math.sin(age*18)):(1-t),wash=tempest?clamp(t*12):1;
  const travel=tempest?radius*(1-.79*fract(t*3)):radius*(.09+.91*(1-Math.pow(1-clamp(age/(pop?.25:.72)),3)));
  edge.position.y=.105;core.position.y=.12;
  edge.scale.setScalar(travel);core.scale.setScalar(travel*.987);
  edge.material.opacity=.61*tail*pulse;core.material.opacity=.93*tail*pulse;
  arc.scale.setScalar(radius*(tempest?.43:.98));trim.scale.setScalar(radius*(tempest?.47:1.018));
  arc.rotation.y=age*(tempest?1.9:.55);trim.rotation.y=age*(tempest?-1.65:-.65)+Math.PI;
  arc.material.opacity=.67*tail*wash;trim.material.opacity=.84*tail*wash;
  sigil.scale.setScalar(radius*(tempest?.43:.89));sigil.rotation.y=age*(tempest?.62:.13);
  sigil.material.opacity=(tempest?.33:pop?.43:.49)*tail*wash;
  for(let i=0;i<helix.length;i++){
   const m=helix[i];m.rotation.y=-age*4.6;
   m.scale.set(.7+.3*wash,.65+.35*wash,.7+.3*wash);
   m.material.opacity=(i%2?.91:.39)*wash*tail*pulse;
  }
  for(const {m,isFlake,seeds} of pools){
   m.material.opacity=tail*(isFlake?.89:.96)*wash;
   for(let i=0;i<m.count;i++){
    const {a0,rad,seed,tilt}=seeds[i];
    const v=tempest?fract(age*(.58+seed*.21)+rad):clamp((age-(isFlake?seed*.38:rad*.24))/(pop?.37:.7));
    const a=tempest?a0-age*(2.95+seed*.85)+v*1.3:a0+age*(seed-.5)*.48;
    let r,h,s;
    if(tempest){
     r=.9+v*(5.55+2.5*seed);h=.24+(1-v)*(4.6+seed*1.8)+.25*Math.sin(a*4);
     s=(isFlake?.22:.29)+tilt*(isFlake?.31:.38);s*=Math.min(1,v*8,(1-v)*8);
    }else{
     const curve=1-Math.pow(1-v,2.7);
     r=(.29+.66*rad)*radius*curve+.16;h=.18+Math.sin(v*Math.PI)*(isFlake?1.68+seed:1.3+seed*1.45);
     if(!isFlake&&!final&&!pop)h+=.37*Math.min(1,v*4);
     s=(isFlake?.17:.33)+tilt*(isFlake?.37:.48);
     s*=Math.max(.001,Math.min(1,v*5))*(1-v*(isFlake?.24:.49));
    }
    dummy.position.set(Math.sin(a)*r,h,Math.cos(a)*r);
    dummy.rotation.set(isFlake?.26+tilt*.63+age*.75:.33*(tilt-.5)+v*.87,a+age*2.2,isFlake?seed*1.2+age*.55:.64*(seed-.5));
    dummy.scale.setScalar(Math.max(.001,s));dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);
   }
   m.instanceMatrix.needsUpdate=true;
  }
 }
 function clear(){
  if(closed)return;closed=true;
  scene.remove(root);root.traverse(o=>{if(o.isInstancedMesh)o.dispose();if(o.isMesh){o.geometry.dispose();o.material.dispose();}});
 }
 update(0);
 return {life,update,clear};
}
