import * as THREE from '../vendor/three/three.module.min.js';

const PALETTES={
 brave:[0xff9a2b,0xffe58a,0xfff5ba,2.12],
 angel:[0xec67b4,0xffcfed,0xffe9f6,1.74],
 nightmare:[0x8b46e8,0xba8bff,0xe2c5ff,2.17]
};
const common=`
 varying vec2 art; uniform float clock;
 uniform vec3 outerTint, coreTint;
 float ridge(float x){return abs(fract(x)*2.-1.);}
`;
const vtx=`varying vec2 art; void main(){art=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const flameVertex=`
 varying vec2 art;varying float foreground;
 uniform vec3 auraCenter;
 void main(){
  art=uv;
  vec3 center=(modelMatrix*vec4(0.,0.,0.,1.)).xyz;
  float facing=dot(normalize(center.xz-auraCenter.xz),normalize(cameraPosition.xz-auraCenter.xz));
  foreground=smoothstep(.18,.83,facing);
  gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
 }`;
const flame=common+`
 uniform float seed;
 varying float foreground;
 void main(){
  float y=art.y;
  float flow=y*2.75-clock*2.3+seed;
  float tip=.64+.30*ridge(clock*2.2+seed*1.73);
  float h=y/tip;
  float wav=(ridge(flow)-.5)*(.12+.29*y)+(ridge(flow*.69+.6)-.5)*.16*y;
  float x0=abs(art.x-.50-wav);
  float x1=abs(art.x-.25-.18*y+(ridge(flow*.47+.25)-.5)*.25);
  float x2=abs(art.x-.76+.14*y-(ridge(flow*.53+.60)-.5)*.21);
  float body=.28*pow(clamp(1.-h,0.,1.),.72);
  float l=.15*pow(clamp(1.-h*1.38,0.,1.),.72);
  float r=.13*pow(clamp(1.-h*1.58,0.,1.),.66);
  float edge=max(1.-smoothstep(body*.85,body+.011,x0),max(1.-smoothstep(l*.86,l+.01,x1),1.-smoothstep(r*.86,r+.01,x2)));
  edge*=smoothstep(0.,.035,y)*(1.-smoothstep(.94,1.,h));
  float hot=(1.-smoothstep(body*.08,body*.58+.004,x0))*pow(max(0.,1.-h),.40);
  float teeth=.72+.28*ridge(flow*1.43);
  // Keep the near flame transparent so the character's body flash remains legible.
  float opacity=edge*(.65+hot*.29)*mix(1.,.17,foreground);
  gl_FragColor=vec4(mix(outerTint,coreTint,hot*teeth),opacity);
  if(gl_FragColor.a<.027) discard;
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
 }`;
const base=common+`
 void main(){
  vec2 p=art*2.-1.; float r=length(p), a=atan(p.y,p.x);
  float skew=.73+ridge(a*1.91+clock*3.)*.085;
  float gl=1.-smoothstep(.008,.060,abs(r-skew));
  float thin=1.-smoothstep(.007,.024,abs(r-skew+.063));
  float grit=pow(ridge(a*5.73-clock*4.),2.5);
  float alpha=(gl*.65+thin*.37)*(.52+.48*grit);
  gl_FragColor=vec4(mix(outerTint,coreTint,gl*.70),alpha);
  if(gl_FragColor.a<.024)discard;
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
 }`;
const embersVert=`
 attribute vec3 seed;uniform float clock;
 varying float power;
 void main(){
  float t=fract(seed.y+clock*(.51+.16*seed.z));
  float a=seed.x+clock*.65;
  float r=.57+t*.56+seed.z*.28;
  vec3 p=vec3(cos(a)*r,.15+2.75*t,sin(a)*r);
  power=sin(t*3.14159);
  vec4 mv=modelViewMatrix*vec4(p,1.);
  gl_Position=projectionMatrix*mv; gl_PointSize=clamp((100.+35.*seed.z)/max(7.,-mv.z),2.,8.)*power;
 }`;
const embersFrag=`
 uniform vec3 coreTint; varying float power;
 void main(){
  vec2 p=abs(gl_PointCoord-.5);
  float mask=1.-smoothstep(.34,.49,p.x+p.y*.65);
  gl_FragColor=vec4(coreTint,power*mask);
  if(gl_FragColor.a<.03)discard;
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
 }`;

export function activeBurstRoster(hero,game){
 if(!hero?.visual?.root||hero.hp<=0||hero.state==='dead'||game.final||!['playing','dialog'].includes(game.phase))return null;
 if(hero.character==='angel'||hero.character==='nightmare')return hero.guestBurstT>0?hero.character:null;
 return hero.form==='brave'&&((hero.mode==='burst'&&hero.burstT>0)||(hero.mode==='courage'&&hero.burstAuraUntil>game.time))?'brave':null;
}

export function makeBurstAura(scene){
 let visual=null,group=null,key=null,started=0,lastTime=-1,body=[],materials=[],tint;
 function clear(){
  if(!group)return;
  group.removeFromParent();
  for(const o of group.children)o.geometry.dispose();
  for(const material of materials)material.dispose();
  for(const b of body){if(b.mesh.material===b.clone)b.mesh.material=b.original;b.clone.dispose();}
  body=[];materials=[];visual=null;group=null;key=null;lastTime=-1;
 }
 function begin(next,look,time){
  visual=look; key=next; started=time; lastTime=-1;
  const [outer,core,skin,height]=PALETTES[key];
  tint=new THREE.Color(skin);
  group=new THREE.Group();group.name='Burst | sustained '+key+' aura';
  group.scale.setScalar(height/2.1);scene.add(group);
  const material=(fragmentShader,seed=0,vertexShader=vtx,side=THREE.DoubleSide)=>{
   const m=new THREE.ShaderMaterial({vertexShader,fragmentShader,uniforms:{
    clock:{value:0},auraCenter:{value:group.position},seed:{value:seed},outerTint:{value:new THREE.Color(outer)},coreTint:{value:new THREE.Color(core)}
   },transparent:true,depthWrite:false,side,forceSinglePass:true,toneMapped:false});materials.push(m);return m;
  };
  const glow=new THREE.Mesh(new THREE.PlaneGeometry(3.65,3.65),material(base));
  glow.rotation.x=-Math.PI/2;glow.position.y=.105;glow.renderOrder=1;group.add(glow);
  for(let i=0;i<5;i++){
   const a=i*Math.PI*2/5;
   const sheet=new THREE.Mesh(new THREE.PlaneGeometry(1.48,2.85+Math.sin(i*9)*.46),material(flame,i*.419,flameVertex));
   sheet.position.set(Math.sin(a)*1.03,1.43,Math.cos(a)*1.03);sheet.rotation.y=a;
   group.add(sheet);
  }
  const seeds=Array.from({length:18},(_,i)=>[i*2.39996,(i*.7549)%1,(i*.3919)%1]).flat();
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(seeds.length),3));
  geo.setAttribute('seed',new THREE.Float32BufferAttribute(seeds,3));
  const specks=new THREE.Points(geo,material(embersFrag,0,embersVert));specks.frustumCulled=false;specks.renderOrder=1;group.add(specks);
  // Isolate the player tint from other avatars and enemies that share prototype materials.
  look.root.traverse(mesh=>{
   const original=mesh.material;
   if(!mesh.isMesh||!original?.color||original.opacity<.6||mesh.userData.keepEmissive)return;
   const clone=original.clone();mesh.material=clone;body.push({mesh,original,clone});
  });
 }
 function update(hero,game){
  const next=activeBurstRoster(hero,game);
  if(!next){clear();return;}
  if(next!==key||hero.visual!==visual){clear();begin(next,hero.visual,game.time);}
  group.position.copy(hero.pos);
  if(lastTime===game.time)return;
  lastTime=game.time;
  const age=Math.max(0,game.time-started);
  const pulse=.08+.48*Math.pow(.5+.5*Math.sin(age*15.7),2.6);
  for(const m of materials)m.uniforms.clock.value=age;
  for(const {original,clone} of body){
   clone.color.copy(original.color).lerp(tint,pulse);
   if(original.emissive){
    clone.emissive.copy(original.emissive).lerp(tint,pulse*.49);
    clone.emissiveIntensity=original.emissiveIntensity*(.67+pulse*.35)+pulse*.29;
   }
  }
 }
 return {update,clear};
}
