import * as THREE from '../vendor/three/three.module.min.js';

// Each style is a timed set of separately illustrated phases, not a scaled badge.
const profiles={
 light:{rgb:'255,159,37',rim:'255,196,71',core:'255,252,222',ink:'145,52,27',scale:1.7,life:.20},
 heavy:{rgb:'255,100,33',rim:'255,192,54',core:'255,252,195',ink:'122,39,31',scale:3.18,life:.28},
 counter:{rgb:'41,244,192',rim:'130,255,222',core:'235,255,251',ink:'12,114,113',scale:3.03,life:.27},
 guard:{rgb:'80,172,255',rim:'153,219,255',core:'230,251,255',ink:'25,79,148',scale:2.48,life:.24}
};
const N=224,cache=new Map(),pi=Math.PI;
export const impactProfile=kind=>profiles[kind]||profiles.light;
const rgba=(rgb,a)=>'rgba('+rgb+','+Math.max(0,Math.min(1,a))+')';
const ease=t=>1-(1-t)**3;
const wave=(k,on,off)=>Math.max(0,Math.min(1,k/Math.max(.001,on),(1-k)/Math.max(.001,1-off)));
function rng(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
function glow(c,x,y,rx,ry,p,a){
 if(a<=.004)return;
 c.save();c.translate(x,y);c.scale(rx,ry);
 const q=c.createRadialGradient(0,0,0,0,0,1);
 q.addColorStop(0,rgba(p.core,a));q.addColorStop(.20,rgba(p.rim,a*.68));
 q.addColorStop(.49,rgba(p.rgb,a*.32));q.addColorStop(1,rgba(p.rgb,0));
 c.fillStyle=q;c.fillRect(-1,-1,2,2);c.restore();
}
function fill(c,pts,style){
 c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=style;c.fill();
}
function spark(c,x,y,a,len,width,p,alpha){
 if(alpha<.02||len<1)return;
 c.save();c.translate(x,y);c.rotate(a);
 const g=c.createLinearGradient(-len*.55,0,len*.55,0);
 g.addColorStop(0,rgba(p.rgb,0));g.addColorStop(.26,rgba(p.ink,alpha*.85));
 g.addColorStop(.55,rgba(p.rgb,alpha));g.addColorStop(.78,rgba(p.core,alpha));g.addColorStop(1,rgba(p.rim,alpha*.12));
 fill(c,[[-len*.57,0],[len*.12,-width*.51],[len*.51,-width*.05],[len*.25,width*.58],[-len*.16,width*.25]],g);
 c.restore();
}
function crescent(c,x,y,rx,ry,start,end,width,p,a){
 if(a<=.015)return;
 function layer(w,col,alpha){
   const pts=[];
   for(let edge=1;edge>=0;edge--)for(let j=0;j<=34;j++){
    const t=edge?j/34:1-j/34,ang=start+(end-start)*t;
    const r=(edge?1:-1)*w*Math.sin(pi*t)**.75;
    pts.push([x+(rx+r)*Math.cos(ang),y+(ry+r)*Math.sin(ang)]);
   }
   fill(c,pts,rgba(col,alpha));
 }
 layer(width*1.9,p.ink,a*.45);layer(width*1.32,p.rgb,a*.89);layer(width*.52,p.core,a*.96);
}
function wedge(c,x,y,s,p,seed,alpha){
 if(alpha<=.01||s<1)return;
 const rnd=rng(seed),pts=[];
 for(let i=0;i<28;i++){
   const a=i*pi/14,rad=(i%2===0?.40+rnd()*.60:.15+rnd()*.17)*s;
   pts.push([x+rad*Math.cos(a)*1.12,y+rad*Math.sin(a)*.86]);
 }
 fill(c,pts,rgba(p.rgb,alpha));
 for(let j=0;j<2;j++){
  const f=j===0?.76:.46;
  fill(c,pts.map(q=>[x+(q[0]-x)*f,y+(q[1]-y)*f]),rgba(j===0?p.rim:p.core,alpha));
 }
}
function heavy(c,k,p,source,i){
 const e=ease(k),flare=wave(k,.1,.25);
 glow(c,0,0,59+e*30,47+e*35,p,.68*flare);
 crescent(c,7*k,2,25+64*k,13+38*k,-.96,1.52,5*(1-k)+.35,p,wave(k,.21,.42)*.95);
 crescent(c,-8*k,-1,20+66*k,12+37*k,1.9,4.56,3.1*(1-k)+.42,p,wave(k,.26,.36)*.62);
 // Keep the original impact drawing inside the heavy burst; pressure front and embers are new.
 if(source){
  const sw=source.width/4,sh=source.height/2,m=[0,1,2,3,4,5,6,7][i],size=154+13*e;
  c.save();c.globalAlpha=1-k*.44;c.drawImage(source,(m%4)*sw,Math.floor(m/4)*sh,sw,sh,-size/2,-size/2,size,size);c.restore();
 }else wedge(c,0,0,[18,49,68,56,34,19,7,0][i],p,55,flare);
 const rnd=rng(663);
 for(let j=0;j<23;j++){
  const a=rnd()*2*pi,dist=(15+rnd()*64)*(.25+e),w=rnd()*4,life=.42+rnd()*.59;
  const tail=Math.max(0,1-k/life)*Math.min(1,k/.13);
  spark(c,Math.cos(a)*dist,Math.sin(a)*dist*.83,a,(9+rnd()*19)*(.65+k),w,p,tail);
 }
}
function counter(c,k,p){
 const e=ease(k),x=-63+126*e;
 glow(c,x,0,44,25,p,.59*wave(k,.12,.41));
 c.save();c.rotate(-.14);
 crescent(c,-14+25*k,17,42+37*e,18+3*k,3.11,5.89,5.5*(1-k)+.6,p,wave(k,.10,.36));
 crescent(c,12+15*k,-11,41+25*e,16+7*k,.22,2.73,3.0*(1-k)+.4,p,.7*wave(k,.19,.41));
 const a=wave(k,.11,.41);
 spark(c,x-18,0,0,75*(1-.54*k),9*Math.max(.17,1-k),p,a);
 spark(c,x-42,8,.04,37*(1-.32*k),3.7,p,a*.64);
 spark(c,x-26,-10,-.07,43*(1-.40*k),3.8,p,a*.71);
 c.restore();
 wedge(c,0,0,25*wave(k,.12,.18),p,94,a*.94);
 const rnd=rng(138);
 for(let j=0;j<16;j++){
  const d=rnd()-.45,h=rnd()-.5,len=rnd();
  spark(c,8+(d*110+24)*e,h*98*e,h*.8,10+len*21,1.1+len*2.8,p,a*(.43+len*.53));
 }
}
function guard(c,k,p){
 const e=ease(k),a=wave(k,.10,.39),x=-3+9*k;
 glow(c,-16,1,46+e*24,57,p,.68*a);
 c.save();c.translate(x,0);c.scale(.53,1);
 const shield=c.createRadialGradient(-18,0,4,0,0,45+15*k);
 shield.addColorStop(0,rgba(p.rim,.25*a));shield.addColorStop(.7,rgba(p.rgb,.13*a));shield.addColorStop(1,rgba(p.rgb,.012*a));
 c.fillStyle=shield;c.beginPath();c.arc(0,0,44+15*k,0,pi*2);c.fill();c.restore();
 crescent(c,x,0,19+10*e,32+26*e,1.19,5.09,6*(1-k)+.38,p,.94*a);
 crescent(c,x+13,0,18+9*k,29+23*k,1.46,4.82,3.4*(1-k)+.4,p,.57*wave(k,.23,.43));
 crescent(c,x-2,3,23+12*k,29+25*k,-1.20,1.17,2.1,p,.32*a);
 wedge(c,-18,0,26*wave(k,.09,.18),p,8,a);
 const rnd=rng(441);
 for(let j=0;j<17;j++){
  const ang=1.56+rnd()*3.2,s=rnd(),dist=(19+53*s)*e;
  spark(c,-16+dist*Math.cos(ang),dist*Math.sin(ang),ang,6+rnd()*17,1+rnd()*2.4,p,a*(.44+s*.48));
 }
}
function light(c,k,p){
 glow(c,0,0,60,48,p,.65*wave(k,.13,.47));
 wedge(c,0,0,58*wave(k,.13,.25),p,225,1-k);
 const rnd=rng(39);
 for(let j=0;j<14;j++){
   const a=rnd()*pi*2,r=15+rnd()*56*ease(k);
   spark(c,r*Math.cos(a),r*.84*Math.sin(a),a,11+rnd()*15,1+rnd()*3,p,wave(k,.16,.42));
 }
}

export function impactFrames(kind,source=null){
 const anchor=kind==='heavy'&&source?.width&&source?.height?source:null;
 const prior=cache.get(kind);if(prior?.anchor===anchor)return prior.frames;
 const p=impactProfile(kind),cv=document.createElement('canvas');cv.width=N*4;cv.height=N*2;
 const c=cv.getContext('2d'),paint={light,heavy,counter,guard}[kind]||light;
 for(let i=0;i<8;i++){
   const x=i%4*N,y=Math.floor(i/4)*N;
   c.save();c.beginPath();c.rect(x+2,y+2,N-4,N-4);c.clip();
   c.translate(x+N/2,y+N/2);paint(c,i===0&&(kind==='counter'||kind==='guard')?.045:i/7,p,anchor,i);
   c.restore();
 }
 const base=new THREE.CanvasTexture(cv);base.colorSpace=THREE.SRGBColorSpace;
 const frames=Array.from({length:8},(_,i)=>{
   const frame=base.clone();
   frame.generateMipmaps=false;frame.minFilter=THREE.LinearFilter;
   frame.repeat.set((N-2)/cv.width,(N-2)/cv.height);
   frame.offset.set((i%4*N+1)/cv.width,1-(Math.floor(i/4)*N+N-1)/cv.height);
   frame.needsUpdate=true;return frame;
 });
 // If the reference arrived after the fallback was already used, those active sprites
 // finish with their old atlas; keep only that one small fallback alive for their lifetime.
 base.dispose();cache.set(kind,{anchor,frames});return frames;
}
