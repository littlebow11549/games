import * as THREE from '../vendor/three/three.module.min.js';

// Procedural cut-paper combat ink. All custom fragments use world geometry, respect
// opaque depth and leave collision, tint selection and timing at their call sites.
const vertexShader=`
varying vec2 art;
void main(){
 art=uv;
 gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
}`;
const material=(color,fragment,alpha=1,edge=1,mirror=1)=>new THREE.ShaderMaterial({
 transparent:true,depthWrite:false,side:THREE.DoubleSide,forceSinglePass:true,
 uniforms:{tone:{value:new THREE.Color(color)},phase:{value:0},strength:{value:alpha},edge:{value:edge},mirror:{value:mirror}},
 vertexShader,fragmentShader:`
 varying vec2 art;
 uniform vec3 tone;
 uniform float phase,strength,edge,mirror;
 float ink(float d,float w){return 1.-smoothstep(w,w+.008,abs(d));}
 void main(){${fragment}
 if(a<.012) discard;
 gl_FragColor=vec4(rgb,min(1.,a));
 #include <colorspace_fragment>
 }`,
});
const ground=(p,w,mat,y)=>{
 const m=new THREE.Mesh(new THREE.PlaneGeometry(w,w),mat);
 m.rotation.x=-Math.PI/2;m.position.set(p.x,y,p.z);
 return m;
};
const radial=`
 vec2 p=art*2.-1.;
 float r=length(p),ang=atan(p.y,p.x);
 float tooth=abs(fract(ang*3.8197+.5)*2.-1.);
 vec3 dark=vec3(.022,.009,.044);
`;
export function dangerDisc(p,r,color){
 const edge=.94, width=2*r/edge;
 const m=ground(p,width,material(color,radial+`
   float outer=ink(r-(edge-.016),.026);
   float shell=ink(r-(edge-.023),.010);
   float markers=(1.-smoothstep(.18,.48,tooth))*ink(r-(edge-.066),.045);
   float inner=ink(r-edge*mix(.11,.975,phase),.011)*smoothstep(.01,.09,phase);
   float fill=(1.-smoothstep(edge*phase-.02,edge*phase+.015,r));
   float hatch=step(.72,fract((p.x+p.y)*12.))*step(r,edge-.034);
   float clock=step(fract(ang/6.28318+.5),phase)*shell;
   float glow=max(shell*.56,max(inner*.91,max(markers*.92,clock)));
   vec3 rgb=mix(dark,mix(tone,vec3(1.,.94,.81),glow*.9),clamp(glow*1.55,0.,1.));
   float a=max(outer*.85,max(markers*.83,max(inner*.92,fill*.24+hatch*.13)));
 `,1,edge),.15);
 m.name='Boss | timed ground warning';return m;
}
export const impactWaveShape=Object.freeze({worldScale:2.20,edge:.871});
export function outwardWave(p,r,color){
 const m=ground(p,r*impactWaveShape.worldScale,material(color,radial+`
   float k=1.-pow(1.-phase,2.);
   float reach=mix(.115,edge,k);
   float tick=ang/6.283185+.5;
   float s=fract(tick*29.);
   float petals=sin(ang*5.+.45)*sin(ang*11.-.50);
   float split=smoothstep(.1,.44,s)*(1.-smoothstep(.70,.94,s));
   float rim=r-reach+(1.-split)*.026+petals*(.014+.022*(1.-phase));
   float front=ink(rim,.012)*(.62+split*.38);
   float bevel=ink(rim+.018,.032)*(.34+split*.53);
   float chips=ink(r-reach+.092+s*.11,.013)*smoothstep(.39,.78,tooth)*smoothstep(.12,.37,k);
   float echo=ink(r-reach*.71+petals*.042,.019)*smoothstep(.11,.45,k)*(.56+.44*split);
   float wake=ink(r-reach+.105,.083)*.30*(.64+.36*petals);
   float gleam=max(front,max(bevel*.88,max(chips*.78,echo*.61)));
   vec3 rgb=mix(mix(dark,tone,.64),mix(tone,vec3(1.,.985,.934),front*.91),clamp(gleam*1.52,0.,1.));
   float a=max(gleam,wake)*pow(1.-phase,.69);
 `,1,impactWaveShape.edge),.19);
 m.name='Attack | faceted pressure wave';return m;
}
export function sweepInk(color,dir){
 return material(color,`
   float u=mirror>0.?art.x:1.-art.x;
   float band=art.y;
   float jag=abs(fract(u*13.5)*2.-1.);
   float glaze=ink(band-(.79-.16*jag),.045);
   float facet=ink(band-(.43+.21*jag),.058)*smoothstep(.17,.78,jag);
   float spine=ink(band-.81,.035)*smoothstep(.09,.26,u);
   float cap=smoothstep(0.,.14,u)*(1.-smoothstep(.91,1.,u));
   float sweep=smoothstep(u-.10,u+.02,.26+phase*1.75);
   float shape=smoothstep(.04,.15,band)*(1.-smoothstep(.90,1.,band));
   vec3 rgb=mix(tone*.26,tone,max(glaze,facet));
   rgb=mix(rgb,vec3(1.,.97,.88),max(glaze*.87,spine));
   // Leading edge is a fine warm-white blade, with broken ink behind it.
   float edgeGap=abs(fract(u*22.+band*.84+.13)*2.-1.);
   float bead=ink(band-.90,.013)*(1.-smoothstep(.38,.84,edgeGap));
   float strake=ink(band-(.22+.12*jag),.016)*(1.-smoothstep(.43,.84,edgeGap));
   rgb=mix(rgb,vec3(1.,.985,.94),bead*.96);
   float a=cap*sweep*max(shape*max(.58,max(glaze,facet)),max(bead,strake*.70))*pow(1.-phase,.65);
 `,1,1,dir);
}
export function laneInk(color,alpha,style='ink'){
 if(style==='frost')return material(color,`
   float u=1.-art.y,x=(art.x-.5)*2.;
   float shoulder=pow(max(.001,sin(u*3.14159)),.48);
   float wing=abs(x)/max(shoulder,.026);
   float pulse=smoothstep(u-.20,u+.09,.16+phase*2.60);
   float veins=fract(u*11.5+abs(x)*1.83);
   float wingChip=ink(wing-.73-.12*veins,.028)*smoothstep(.21,.48,veins)*(1.-smoothstep(.71,.89,veins));
   float hilite=ink(wing-(.33+.24*veins),.031)*smoothstep(.24,.41,veins)*(1.-smoothstep(.67,.86,veins));
   float core=1.-smoothstep(.018,.155,wing);
   float bands=abs(fract(u*13.5+wing*1.03)*2.-1.);
   float snow=ink(bands-.18,.052)*ink(wing-.29,.265)*smoothstep(.11,.20,phase);
   float melt=(1.-smoothstep(.61,.96,wing))*.40;
   vec3 ice=vec3(.21,.68,1.);
   vec3 rgb=mix(tone*.43,mix(ice,vec3(.91,.99,1.),max(core,hilite*.7)),melt+.29);
   rgb=mix(rgb,vec3(1.,.99,.98),clamp(core+snow*.8+wingChip*.67,0.,1.));
   float a=max(melt,max(core*.89,max(wingChip*.86,max(hilite*.61,snow*.70))))*pulse*strength*pow(1.-phase,.79);
 `,Math.min(1,alpha*1.8));
 return material(color,`
   float x=(art.x-.5)*2., z=1.-art.y;
   float taper=pow(max(.001,sin(z*3.141593)),.52);
   float reach=clamp(abs(x)/max(.025,taper),0.,2.);
   float tooth=fract(z*9.-phase*1.8);
   float rip=ink(reach-(.40+.37*tooth),.055)*(1.-smoothstep(.55,.94,tooth));
   float fine=ink(reach-.13,.045)*smoothstep(.07,.96,z);
   float core=ink(reach-.02,.075);
   float body=1.-smoothstep(.55,.97,reach);
   vec3 rgb=mix(tone*.31,tone,max(body*.72,rip));
   rgb=mix(rgb,vec3(1.,.965,.91),max(core*.96,max(fine*.67,rip*.57)));
   float grain=abs(fract(z*18.5-phase*5.5+reach*.42)*2.-1.);
   float thread=ink(reach-(.78+.13*grain),.028)*(1.-smoothstep(.31,.84,grain));
   rgb=mix(rgb,vec3(.92,.98,1.),thread*.62);
   float a=max(max(body*.59,max(core,rip)),thread*.72)*smoothstep(0.,.065,z)*(1.-smoothstep(.94,1.,z))*strength*(1.-phase);
 `,Math.min(1,alpha*1.8));
}
export function flightCross(radius,color){
 const g=new THREE.Group(), len=radius*5.6, width=radius*2.25;
 const mat=material(color,`
   float x=abs(art.x-.5)*2., u=art.y;
   float n=abs(fract(u*6.-phase*4.+.2)*2.-1.);
   float silhouette=pow(u,.64)*(.68+.23*n);
   float contour=ink(x-silhouette*.68,.05);
   float white=ink(x-silhouette*.25,.056);
   float body=1.-smoothstep(silhouette*.27,silhouette,x);
   vec3 rgb=mix(tone*.12,tone,max(body,contour));
   rgb=mix(rgb,vec3(1.,1.,.925),max(white*.76,body*.7));
   float a=max(body,max(contour*.6,white))*smoothstep(.0,.5,u)*(1.-smoothstep(.93,1.,u));
 `);
 const a=new THREE.Mesh(new THREE.PlaneGeometry(width,len),mat), b=a.clone();
 // Both planes terminate inside the core, extending behind local +Z flight.
 a.rotation.x=Math.PI/2;
 // Use a parent-space Z-roll via quaternion, not a roll of the flight axis.
 b.quaternion.copy(a.quaternion).premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),Math.PI/2));
 a.position.z=b.position.z=radius*.28-len/2;
 g.add(a,b);g.name='Attack | filled projectile streak';return g;
}

export function beamInk(width,length){
 const g=new THREE.Group();g.name='Attack | Courage beam';
 const mat=material(0xa5f84f,`
   float x=(art.x-.5)*2., run=art.y;
   float drift=run*14.-phase*13.;
   float facet=abs(fract(drift)*2.-1.);
   float limit=(.70+.23*sin(run*39.-phase*10.)*.35+.14*facet)*smoothstep(0.,.07,run);
   float body=1.-smoothstep(limit*.62,limit,abs(x));
   float line=ink(abs(x)-limit*.65,.03)*(.45+.55*facet);
   float hot=1.-smoothstep(.05,.27,abs(x+.035*sin(drift*2.)));
   vec3 rgb=mix(vec3(.09,.37,.018),tone,max(body*.78,line));
   rgb=mix(rgb,vec3(1.,1.,.84),max(hot*.98,line*.59));
   float a=max(body*.80,max(line*.75,hot))*(1.-smoothstep(.94,1.,run));
 `);
 for(let i=0;i<3;i++){
   const m=new THREE.Mesh(new THREE.PlaneGeometry(width,length),mat);
   m.rotation.x=Math.PI/2;
   m.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),i*Math.PI/3));
   m.position.z=length/2+.9;g.add(m);
 }
 g.userData.mat=mat;return g;
}
