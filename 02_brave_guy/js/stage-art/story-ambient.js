// Small stage-authored effects: world-space sprites, no damage or collision.
const FX={
 '1-0':[['dust',7,-3.9,-8.4],['dust',5,3.8,-7.5]],
 '1-2':[['glint',8,0,-6.3],['dust',5,-6,1]],
 '1-3':[['paper',9,-3,-7.9],['dust',6,4,-7]],
 '1-4':[['paper',12,0,-7.7],['glint',7,0,-9]],
 '2-1':[['fog',11,0,-8.9],['firefly',15,-4,-5.5]],
 '2-2':[['smoke',8,-5.2,-9.3],['ember',13,4,-8.4],['lamplight',3,-4.4,-8.4]],
 '3-0':[['screen',6,-4.6,-8.3],['dust',9,1,-7.4]],
 '3-1':[['glint',9,-4,-7.8],['screen',5,4.6,-8.8]],
 '3-2':[['steam',9,4.7,-8.7],['dust',5,-4,-4.2]],
 '3-3':[['screen',10,4.1,-8.7],['dust',5,-3,-6]],
 '3-4':[['screen',9,-4.6,-8.4],['paper',7,4.5,-8.7]],
 '3-6':[['glint',12,-4.6,-8.3],['paper',7,2,-7.7]],
 '3-7':[['steam',7,-3.5,-8.6],['paper',10,3.5,-8.2]],
 '3-5':[['glint',13,3.7,-7.7],['dust',7,-4,-7.4]],
 '4-1':[['rift',14,4.1,-8.4],['fog',8,0,-7.4]]
};
const themes={
 dust:['#ffe7ae',.28,.50],glint:['#ffecae',.44,.83],paper:['#ffd98e',.72,1.06],
 fog:['#d5fff0',.32,.34],firefly:['#dcff92',.80,.66],smoke:['#ddd0f6',.36,.57],
 ember:['#ffad62',.82,.75],screen:['#9fe7ff',.52,.76],steam:['#fff2df',.48,.75],lamplight:['#ffc37c',.39,.72],
 rift:['#f6a2f9',.77,.89]
};
function texture(T,type){
 const cv=document.createElement('canvas');cv.width=cv.height=64;
 const c=cv.getContext('2d');
 if(type==='paper'){
  c.fillStyle='#fff';c.strokeStyle='#6c564a';c.lineWidth=4;c.beginPath();
  c.moveTo(13,18);c.lineTo(46,11);c.lineTo(54,42);c.lineTo(18,49);c.closePath();c.fill();c.stroke();
  c.lineWidth=1.8;c.beginPath();c.moveTo(20,27);c.lineTo(42,22);c.moveTo(22,34);c.lineTo(38,30);c.stroke();
 }else if(type==='rift'||type==='screen'){
  c.fillStyle='#fff';c.beginPath();c.moveTo(31,3);c.lineTo(40,29);c.lineTo(53,38);c.lineTo(35,37);c.lineTo(25,60);c.lineTo(27,34);c.lineTo(12,24);c.lineTo(27,27);c.closePath();c.fill();
 }else if(['fog','smoke','steam'].includes(type)){
  // Three wisps with asymmetric silhouettes, baked once per local effect.
  for(const [x,y,rx,ry,a] of [[29,38,27,15,.63],[39,27,18,22,.52],[22,27,14,18,.31]]){
   c.save();c.translate(x,y);c.scale(rx,ry);
   const g=c.createRadialGradient(-.18,-.22,.1,0,0,1);
   g.addColorStop(0,'rgba(255,255,255,'+a+')');
   g.addColorStop(.46,'rgba(255,255,255,'+a*.63+')');
   g.addColorStop(1,'rgba(255,255,255,0)');
   c.fillStyle=g;c.fillRect(-1,-1,2,2);c.restore();
  }
 }else if(type==='glint'||type==='firefly'||type==='ember'){
  const g=c.createRadialGradient(32,32,1,32,32,30);
  g.addColorStop(0,'#fff');g.addColorStop(.22,'#ffffffa0');g.addColorStop(1,'#ffffff00');
  c.fillStyle=g;c.fillRect(0,0,64,64);
  c.fillStyle='#fff';c.beginPath();
  c.moveTo(32,10);c.lineTo(36,28);c.lineTo(47,32);c.lineTo(36,36);c.lineTo(32,53);c.lineTo(28,36);c.lineTo(17,32);c.lineTo(28,28);c.closePath();c.fill();
 }else{
  const g=c.createRadialGradient(32,32,0,32,32,32);
  g.addColorStop(0,'#fff');g.addColorStop(.22,'#ffffffe0');g.addColorStop(.55,'#ffffff6c');g.addColorStop(1,'#ffffff00');
  c.fillStyle=g;c.fillRect(0,0,64,64);
 }
 const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;return tex;
}
export function makeAmbientBatch(T,root,tex,color,count,type){
 const base=new T.PlaneGeometry(1,1),geometry=new T.InstancedBufferGeometry();
 geometry.setIndex(base.index);geometry.setAttribute('position',base.attributes.position);geometry.setAttribute('uv',base.attributes.uv);
 base.dispose();
 const center=new T.InstancedBufferAttribute(new Float32Array(count*3),3).setUsage(T.DynamicDrawUsage);
 const shape=new T.InstancedBufferAttribute(new Float32Array(count*4),4).setUsage(T.DynamicDrawUsage);
 geometry.setAttribute('ambientCenter',center);geometry.setAttribute('ambientShape',shape);geometry.instanceCount=count;
 const material=new T.ShaderMaterial({
  transparent:true,depthWrite:false,fog:true,
  uniforms:{...T.UniformsUtils.clone(T.UniformsLib.fog),atlas:{value:tex},tint:{value:new T.Color(color)}},
  vertexShader:`attribute vec3 ambientCenter;
   attribute vec4 ambientShape;
   varying vec2 spriteUv;
   varying float spriteAlpha;
   #include <fog_pars_vertex>
   void main(){
    spriteUv=uv;spriteAlpha=ambientShape.z;
    vec2 p=position.xy*ambientShape.xy;
    float s=sin(ambientShape.w),c=cos(ambientShape.w);
    vec4 mvPosition=modelViewMatrix*vec4(ambientCenter,1.);
    mvPosition.xy+=vec2(c*p.x-s*p.y,s*p.x+c*p.y);
    gl_Position=projectionMatrix*mvPosition;
    #include <fog_vertex>
   }`,
  fragmentShader:`uniform sampler2D atlas;
   uniform vec3 tint;
   varying vec2 spriteUv;
   varying float spriteAlpha;
   #include <fog_pars_fragment>
   void main(){
    vec4 texel=texture2D(atlas,spriteUv);
    float a=texel.a*spriteAlpha;
    if(a<.004)discard;
    gl_FragColor=vec4(texel.rgb*tint,a);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
   }`
 });
 const mesh=new T.Mesh(geometry,material);mesh.name='Ambient batch | '+type;mesh.frustumCulled=false;root.add(mesh);
 return {
  set(i,x,y,z,sx,sy,a,rotation){center.setXYZ(i,x,y,z);shape.setXYZW(i,sx,sy,a,rotation);},
  commit(){center.needsUpdate=true;shape.needsUpdate=true;},
  dispose(){root.remove(mesh);geometry.dispose();material.dispose();}
 };
}
export function addStoryAmbient(T,root,d){
 const particles=[],batches=[];let anchor='';
 let t=0,s=Number(d.id.replace('-',''))+195;
 const rand=()=>((s=(s*1664525+1013904223)>>>0)/4294967296);
 for(const [type,n,x,z] of FX[d.id]){
  const [color,opa,speed]=themes[type];
  const tex=texture(T,type),batch=makeAmbientBatch(T,root,tex,color,n,type);
  batches.push({tex,batch});
  for(let i=0;i<n;i++)particles.push({type,x,z,batch,i,opa,speed,seed:rand(),a:rand(),b:rand(),c:rand()});
 }
 const digest=()=>anchor;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function update(dt){
  t+=Math.min(Math.max(dt||0,0),.05)*(reduced?.28:1);
  for(const p of particles){
   const {type,batch,i,x,z,opa,speed,seed,a,b,c}=p;
   const u=(seed+t*.16*speed)%1,phase=(a+t*.20)*Math.PI*2;
   let px,py,pz,sx,sy,alpha,rotation=0;
   if(type==='fog'){
    px=x+(a-.5)*17+Math.sin(phase)*3;pz=z+(b-.5)*7+u*3;
    py=.29+c*.46;sx=2.8+c*2.6;sy=.60+c*.46;alpha=opa*(.38+.42*Math.sin(Math.PI*u));
   }else if(type==='lamplight'){
    px=x+(a-.5)*2.1;pz=z+.38+b*.23;py=1.42+c*.48;
    sx=.82+c*.68;sy=sx;alpha=opa*(.60+.35*Math.sin(phase+c*6)**2);
   }else if(type==='smoke'||type==='steam'){
    px=x+(a-.5)*1.6+u*(type==='smoke'?2.2:.65)+Math.sin(phase)*.22;
    pz=z+(b-.5)*1.1;py=(type==='smoke'?2.7:1.5)+u*2.1;
    sx=.28+u*(type==='smoke'?1.55:.53);sy=sx*.88;alpha=opa*Math.sin(Math.PI*u);
   }else if(type==='paper'){
    px=x+(a-.5)*9+u*2+Math.sin(phase)*.5;pz=z+(b-.5)*4;
    py=.85+(1-u)*2+c*.8;sx=.14+c*.15;sy=.16+c*.12;alpha=opa*Math.sin(Math.PI*u);
    rotation=phase*(c>.5?1:-1);
   }else{
    px=x+(a-.5)*9+Math.sin(phase)*(.36+c*.32);pz=z+(b-.5)*4+Math.cos(phase)*.27;
    py=.52+(type==='ember'?u*2:c*2.1)+Math.sin(phase)*.17;
    sx=.07+c*.12;sy=sx*(type==='rift'?2.4:1);
    alpha=opa*(.23+.77*Math.abs(Math.sin(phase+seed*8)));
    if(type==='rift'){sx*=1.7;alpha*=.82;rotation=(a-.5)*.6;}
   }
   batch.set(i,px,py,pz,sx,sy,alpha,rotation);
   if(p===particles[0])anchor=[px,py,pz].map(n=>Number(n.toFixed(5))).join(',');
  }
  for(const {batch} of batches)batch.commit();
 }
 update(0);
 return {update,digest,types:FX[d.id].map(a=>a[0]),count:particles.length,
  dispose(){for(const {batch,tex} of batches){batch.dispose();tex.dispose();}}};
}
