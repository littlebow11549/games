import * as THREE from '../vendor/three/three.module.min.js';

const PALETTES={
 brave:[0xff9b36,0xffda7b,0xffedb0,2.12],
 angel:[0xf064b8,0xffcde9,0xffdcf2,1.74],
 nightmare:[0x9250ec,0xd2a9ff,0xe4c5ff,2.17]
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
 float hash(float x){return fract(sin(x*36.671+.91)*4375.953);}
 float noise(float x){
  float i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
  return mix(hash(i),hash(i+1.),f);
 }
 float curl(float y,float t,float k){
  return sin(y*9.-t*4.+k)*.10+sin(y*17.-t*7.+k*1.7)*.043;
 }
 float tongue(float x,float y,float height,float width){
  float ny=clamp(y/height,0.,1.);
  float notch=width*pow(max(0.,1.-ny),.68)*(1.+.10*sin(ny*10.));
  return min(notch-abs(x),(height-y)*.47);
 }
 void main(){
  float y=art.y,t=clock, x=art.x-.5;
  float k=seed*15.4;
  float adv=y*4.-t*2.5+k;
  float turbulence=noise(adv)*.67+noise(adv*2.1+k)*.33-.5;
  float flex=curl(y,t,k)*(.24+y*.93)+turbulence*.15*y;
  float swell=.74+.18*noise(t*3.5+k)+.07*sin(t*7.+k);
  float wide=tongue(x-flex,y,swell,.275);
  float side1=tongue(x+.23+flex*.48-y*.23,y,.50+.16*noise(t*2.8+k+5.),.125);
  float side2=tongue(x-.22-flex*.61+y*.13,y,.41+.18*noise(t*3.2+k-3.),.12);
  float silhouette=max(wide,max(side1,side2));
  float root=smoothstep(0.,.035,y);
  float shape=smoothstep(-.007,.013,silhouette)*root;
  float halo=pow(smoothstep(-.12,.015,silhouette),2.)*root;
  float inner=tongue(x-flex*.86-.014,y+.028,swell*.65,.16);
  float filament=tongue(x-flex*.83+.04,y+.105,swell*.67,.055);
  float stream=smoothstep(.06,.91,noise(adv*2.3+k));
  float hot=smoothstep(-.011,.025,inner)*(.69+.22*stream)*(1.-y*.36);
  float skin=smoothstep(.001,.05,silhouette);
  float edge=(1.-skin)*shape;
  vec3 mid=mix(outerTint*.55,outerTint,skin);
  mid=mix(mid,coreTint,hot*.82+stream*.16*skin);
  mid=mix(mid,vec3(1.,.99,.95),smoothstep(-.006,.016,filament)*.68);
  float keep=mix(1.,.11,foreground);
  float alpha=(halo*.16+shape*(.60+hot*.28)+edge*.10)*keep;
  gl_FragColor=vec4(mid,alpha);
  if(gl_FragColor.a<.014)discard;
  #include <colorspace_fragment>
 }`;
const base=common+`
 void main(){
  vec2 p=art*2.-1.;float r=length(p),a=atan(p.y,p.x);
  float wav=sin(a*3.+clock*2.5)*.030+sin(a*7.-clock*4.)*.020;
  float streak=pow(.5+.5*sin(a*4.-clock*7.3),3.);
  float broken=pow(.5+.5*sin(a*7.+clock*5.1+.7),5.);
  float fast=(1.-smoothstep(.005,.025,abs(r-.74-wav)))*streak;
  float slow=(1.-smoothstep(.004,.038,abs(r-.69+wav)))*broken;
  float feet=pow(1.-smoothstep(.08,.85,r),2.)*.31;
  float alpha=feet+fast*.58+slow*.34;
  gl_FragColor=vec4(mix(outerTint,coreTint,fast*.78+feet*.17),alpha);
  if(gl_FragColor.a<.012)discard;
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
  const pulse=.035+.29*Math.pow(.5+.5*Math.sin(age*13.2),1.9);
  for(const m of materials)m.uniforms.clock.value=age;
  for(const {original,clone} of body){
   clone.color.copy(original.color).lerp(tint,pulse);
   if(original.emissive){
    clone.emissive.copy(original.emissive).lerp(tint,pulse*.26);
    clone.emissiveIntensity=original.emissiveIntensity*(.67+pulse*.35)+pulse*.21;
   }
  }
 }
 return {update,clear};
}
