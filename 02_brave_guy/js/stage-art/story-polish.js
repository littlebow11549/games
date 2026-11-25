import {placeStoryPaint} from './story-polish-art.js';
import {dressStoryQuality as illustrated,STORY_QUALITY} from './story-quality-world.js';
import {makeQualityKit} from './story-quality-kit.js';
export {STORY_QUALITY};

// Room scenes use stage-owned silhouettes rather than swapping the same decorations.
const THEMES={
 '1-0':['dorm',0x754c68,0xeeaabd,0xffd3a5,[-5.9,-5.1],[6.4,-4.6]],
 '1-2':['court',0x285866,0x8cd6c7,0xffbb66,[-7.2,-7.0],[7.1,-8.2]],
 '1-3':['office',0x573e51,0xe6b9a0,0x86bcb5,[-7.9,-4.8],[7.2,-7.0]],
 '1-4':['gate',0x4c416b,0xddabd1,0xffd49d,[-6.4,-5.0],[6.4,-4.6]],
 '2-1':['forest',0x294f54,0xb4d99d,0xf5b2d7,[-6.5,-5.1],[6.5,-5.1]],
 '2-2':['village',0x4a3d65,0xfbc082,0xbb9bd2,[-6.5,-5.1],[6.5,-5.1]],
 '3-0':['desk',0x443f6b,0xaba4e5,0xf8c78b,[-6.6,-5.1],[6.5,-5.1]],
 '3-1':['lobby',0x36636c,0xabddd8,0xf9d7a3,[-6.6,-5.1],[6.5,-5.1]],
 '3-2':['pantry',0x3b7070,0xa7ded3,0xfac28d,[-6.5,-5.1],[6.5,-5.1]],
 '3-3':['meeting',0x3e547e,0x9dbdde,0xffc992,[-6.5,-5.1],[6.5,-5.1]],
 '3-4':['support',0x774d73,0xe5aed8,0xffcf9e,[-6.5,-5.1],[6.5,-5.1]],
 '3-6':['finance',0x665043,0xe3c08a,0x90c6af,[-6.5,-5.1],[6.5,-5.1]],
 '3-7':['cross',0x495776,0xb0b8da,0xffa993,[-6.5,-5.1],[6.5,-5.1]],
 '3-5':['boss',0x4a4165,0xe3b4c7,0xffcc84,[-6.5,-5.1],[6.5,-5.1]],
 '4-1':['rift',0x593869,0xe299d7,0xbfdafa,[-6.5,-5.1],[6.5,-5.1]]
};
const css=c=>'#'+c.toString(16).padStart(6,'0');
const cream=0xffefd2,pink=0xf1a0ac,teal=0x74b8a4,dark=0x372941;

function vignettePainter(T,root,col){
 const cv=document.createElement('canvas');cv.width=256;cv.height=128;
 const ctx=cv.getContext('2d');
 const grad=ctx.createRadialGradient(128,64,5,128,64,121);
 grad.addColorStop(0,css(col)+'92');grad.addColorStop(.43,css(col)+'54');grad.addColorStop(1,css(col)+'00');
 ctx.scale(1,.5);ctx.fillStyle=grad;
 // Draw in a circular context and expand in world space selectively.
 ctx.fillRect(0,-64,256,256);
 const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;
 const g=new T.PlaneGeometry(1,1),m=new T.MeshBasicMaterial({map:tex,depthWrite:false,transparent:true,opacity:.43,polygonOffset:true,polygonOffsetFactor:-2});
 return {at(x,z,s,sz){
   const a=new T.Mesh(g,m);a.rotation.x=-Math.PI/2;a.position.set(x,.067,z);a.scale.set(s,sz,1);root.add(a);return a;
 },dispose(){g.dispose();m.dispose();tex.dispose();}};
}
function bakedDetails(T,layer,primary,accent,ink){
 const cv=document.createElement('canvas');cv.width=1024;cv.height=512;
 const c=cv.getContext('2d'),paint=(i,f)=>{c.save();c.translate((i%4)*256,Math.floor(i/4)*256);f();c.restore();};
 const path=(coords,fill,stroke=ink,width=7)=>{
  c.fillStyle=css(fill);c.strokeStyle=css(stroke);c.lineWidth=width;c.lineJoin='round';c.lineCap='round';
  c.beginPath();c.moveTo(...coords[0]);for(const a of coords.slice(1))c.lineTo(...a);c.closePath();c.stroke();c.fill();
 };
 const blob=(x,y,a,b,col,line=0)=>{c.beginPath();c.ellipse(x,y,a,b,0,0,7);if(line){c.strokeStyle=css(line);c.lineWidth=9;c.stroke();}c.fillStyle=css(col);c.fill();};
 const edge=(x,y,w,h,r,col)=>{c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=css(col);c.fill();};
 const mark=(i,draw)=>paint(i,()=>{
  blob(127,216,81,18,0x574055);
  draw();
 });
 // Plush, flower tuft, little lantern, pigeon, stationery, crystal, tiled planter, window.
 mark(0,()=>{blob(75,94,27,28,accent,ink);blob(180,94,27,28,accent,ink);blob(128,144,65,57,primary,ink);
 blob(126,158,40,27,cream);blob(108,138,6,8,ink);blob(146,138,6,8,ink);blob(127,151,8,5,ink);
 blob(89,157,9,5,pink);blob(168,157,9,5,pink);blob(106,110,19,8,cream);});
 mark(1,()=>{path([[55,153],[201,153],[181,209],[76,209]],accent);
 for(const [x,y] of [[61,127],[98,118],[142,104],[179,133],[202,123]]){
  path([[x-7,153],[x+2,y-9],[x+9,157]],teal,teal,2);
  for(let i=0;i<5;i++){let a=i*6.283/5;blob(x+12*Math.cos(a),y+12*Math.sin(a),12,12,i%2?primary:pink);}
  blob(x,y,7,7,cream);
 }
 edge(54,149,149,16,7,cream);});
 mark(2,()=>{path([[72,113],[128,57],[184,113]],ink);
 edge(76,109,105,89,18,ink);edge(86,113,85,73,14,accent);
 edge(94,121,69,52,13,cream);edge(125,113,8,73,3,ink);edge(86,142,85,8,3,ink);
 edge(69,187,118,15,6,ink);edge(123,61,10,32,4,ink);});
 mark(3,()=>{blob(116,160,51,39,primary,ink);blob(155,128,34,36,cream,ink);blob(124,165,29,17,accent);
 path([[182,127],[208,138],[184,146]],accent,ink,3);blob(168,124,5,6,ink);
 edge(106,185,10,19,5,accent);edge(137,186,11,17,5,accent);});
 mark(4,()=>{for(let i=0;i<3;i++){let y=185-i*31;
 edge(54+i*12,y,155-i*16,25,6,ink);edge(60+i*12,y+5,141-i*16,15,4,i===1?primary:cream);
 edge(69+i*12,y+5,14,15,4,accent);}
 path([[151,120],[166,79],[182,114]],accent,ink,4);blob(91,109,19,14,primary,ink);});
 mark(5,()=>{path([[125,68],[174,101],[191,174],[141,211],[99,192],[80,140]],primary);
 path([[125,68],[142,100],[143,178],[141,211],[99,192],[80,140]],accent,ink,3);
 path([[125,68],[142,100],[191,174],[174,101]],cream,ink,3);blob(129,133,8,10,cream);});
 mark(6,()=>{for(const [x,y,a,b,col] of [[80,146,37,26,teal],[170,147,35,24,teal],[124,130,49,29,primary],[124,107,29,23,teal]])blob(x,y,a,b,col,ink);
 path([[54,158],[204,158],[180,209],[77,209]],accent);edge(58,158,140,11,5,cream);});
 mark(7,()=>{edge(59,68,139,137,26,ink);edge(68,77,121,119,20,cream);edge(76,85,105,103,17,primary);
 edge(122,85,13,103,5,ink);edge(76,132,105,11,5,ink);
 path([[83,123],[106,92],[120,92],[97,123]],cream,cream,1);});
 const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;
 const mats=[],geos=[];
 return {at(i,x,z,y,w,angle=0){
   const geo=new T.PlaneGeometry(w,w);
   const uv=geo.attributes.uv;
   for(let j=0;j<uv.count;j++)uv.setXY(j,((i%4)+uv.getX(j))/4,(1-Math.floor(i/4)+uv.getY(j))/2);
   let mat=mats[0];
   if(!mat){mat=new T.MeshBasicMaterial({map:tex,alphaTest:.4,side:T.DoubleSide});mats.push(mat);}
   const a=new T.Mesh(geo,mat);a.position.set(x,y,z);a.rotation.y=angle;layer.add(a);geos.push(geo);return a;
 },dispose(){tex.dispose();for(const a of [...mats,...geos])a.dispose();}};
}

function prop(kind,p,i,a,b){
 const r=p.round,o=p.ball,k=p.cyl;
 const bowl=(x,y,z,s)=>{
  k(x,y,z,.34*s,.24*s,.25*s,b,12);k(x,y+.14*s,z,.37*s,.36*s,.065*s,cream,12);
  for(let j=0;j<5;j++)o(x+.19*s*Math.cos(j*1.26),y+.24*s,z+.17*s*Math.sin(j*1.26),.15*s,.18*s,.15*s,j%2?teal:a);
 };
 const bun=(x,y,z,s)=>{
  o(x,y,z,s*.52,s*.45,s*.46,a);
  for(const l of [-1,1]){
   o(x+l*.35*s,y+.33*s,z,.19*s,.19*s,.17*s,b);
   o(x+l*.13*s,y+.034*s,z+.426*s,.038*s,.054*s,.025*s,dark);
   o(x+l*.245*s,y-.062*s,z+.41*s,.07*s,.037*s,.022*s,pink);
  }o(x,y-.08*s,z+.446*s,.055*s,.042*s,.025*s,cream);
 };
 const shelf=(y,w=2.6)=>{
  r(0,y,.05,w+.12,.16,.95,dark);r(0,y+.11,.05,w,.10,.87,a);
 };
 const lantern=(x,y,z)=>{
  k(x,(y-.30)*.5,z,.041,.058,y-.28,dark,8);
  r(x,y,z,.58,.64,.65,dark);r(x,y,z+.32,.44,.50,.043,b);
  r(x,y+.3,z,.71,.12,.69,a);r(x,y-.29,z,.65,.10,.70,a);
 };
 const ticket=(x,y,z,w,h,col)=>{
  r(x,y,z,w,h,.10,dark);r(x,y,z+.065,w*.93,h*.91,.039,col);
  for(let j=0;j<3;j++)r(x-w*.06,y+h*(.19-j*.19),z+.095,w*(.58-j*.09),.044,.015,j%2?cream:dark);
 };
 const stand=(w=2.35,h=1.75)=>{
  for(const x of [-w*.43,w*.43])r(x,h*.46,-.11,.12,h,.34,dark);
  r(0,h*.76,-.21,w,h*.58,.14,dark);r(0,h*.76,-.117,w*.94,h*.52,.065,a);
 };
 switch(kind){
 case 'dorm':
  shelf(.42);r(0,.83,.01,2.45,.62,.89,a);r(0,1.18,.06,2.57,.15,.97,b);
  bun(-.58,1.59,.15,1.01);r(.75,1.42,.11,.52,.44,.48,cream);
  for(let j=0;j<4;j++)r(.75,1.28+j*.10,.36,.43,.027,.035,j%2?pink:a);
  break;
 case 'court':
  stand(2.5,1.68);ticket(0,1.37,-.018,1.72,.54,b);shelf(.34);
  for(let j=0;j<3;j++){
   o(-.65+j*.63,.64,.27,.28,.28,.28,b);k(-.65+j*.63,.66,.28,.277,.277,.028,dark,15);
  }break;
 case 'office':
  stand(2.5,2.13);for(let j=0;j<3;j++)ticket(-.70+j*.70,1.57+j%2*.18,-.03,.51,.66,j%2?b:cream);
  shelf(.46);k(.68,.66,.12,.20,.17,.26,b);bowl(-.73,.71,.11,.91);break;
 case 'gate':
  for(const x of [-.78,.78]){lantern(x,1.83,-.18);bowl(x,.17,.42,1.18);}
  shelf(.44,1.34);bun(0,.82,.17,.74);break;
 case 'forest':
  for(const [x,z,s] of [[-.77,-.06,1.35],[.45,.32,.87],[.90,-.34,1.04]]){
   k(x,.30*s,z,.12*s,.24*s,.57*s,cream,10);o(x,.61*s,z,.56*s,.30*s,.45*s,x<0?a:b);
   for(const [u,v] of [[-.16,.16],[.19,.10],[0,-.20]])o(x+u*s,.80*s,z+v*s,.09*s,.031*s,.080*s,cream);
  }if(!i)bun(-.22,.25,.64,.52);break;
 case 'village':
  stand(2.55,1.71);for(let j=0;j<5;j++)r(-1+j*.50,1.88,-.24,.53,.14,.86,j%2?b:a);
  shelf(.62);for(let j=0;j<3;j++)bowl(-.65+j*.63,.86,.18,.71);
  lantern(i?1.55:-1.56,1.42,.15);break;
 case 'desk':
  shelf(.77);r(0,1.10,-.28,1.89,.54,.26,dark);r(0,1.12,-.127,1.72,.41,.04,a);
  for(let j=0;j<4;j++)r(-.60,1.26-j*.09,-.09,.35+j*.09,.026,.015,cream);
  k(.87,.98,.39,.16,.13,.29,b);r(-.06,.89,.32,1.04,.045,.29,cream);bowl(-1.17,.94,.07,.68);break;
 case 'lobby':
  shelf(.43,2.23);r(0,.93,-.18,1.39,.88,.31,dark);
  ticket(0,.97,.01,1.12,.54,a);for(const x of [-1,1])bowl(x,.65,.04,1.04);break;
 case 'pantry':
  shelf(.66);r(-.48,1.12,-.07,1.21,.73,.57,a);r(-.48,1.12,.245,.58,.45,.04,dark);
  k(-.48,1.04,.277,.123,.099,.23,cream);k(.53,.91,.14,.27,.20,.35,b);
  o(.53,1.11,.14,.28,.12,.28,b);o(.53,1.22,.14,.07,.07,.07,cream);bowl(1.05,.83,.14,.6);break;
 case 'meeting':
  stand(2.57,2.04);ticket(0,1.53,-.029,2.25,.61,a);
  shelf(.63);for(const x of [-.71,.69]){k(x,.81,.17,.13,.11,.24,cream);r(x*.78,.75,.28,.28,.03,.24,b);}
  o(.06,.84,.11,.29,.09,.18,dark);break;
 case 'support':
  stand(2.64,2.19);for(let j=0;j<6;j++)ticket(-.84+(j%3)*.84,1.42+Math.floor(j/3)*.56,.0,.62,.39,[b,a,cream][j%3]);
  shelf(.62);bowl(.9,.81,.14,.7);bun(-.77,.99,.14,.73);break;
 case 'finance':
  shelf(.48);for(let j=0;j<3;j++){const x=-.75+j*.75;r(x,.91,.03,.61,.68,.75,j%2?a:b);r(x,1.28,.07,.62,.10,.78,dark);ticket(x,.93,.447,.46,.31,cream);}
  for(let j=0;j<4;j++)k(.76,1.38+j*.06,.12,.16,.16,.057,j%2?b:cream,12);break;
 case 'cross':
  stand(2.4,1.98);for(let j=0;j<3;j++)ticket(-.7+j*.7,1.45,-.028,.56,.81,j===1?b:a);
  shelf(.57);for(const x of [-.80,-.24,.32,.88])k(x,.77,.17,.14,.12,.30,cream);break;
 case 'boss':
  shelf(.52);r(0,.93,-.04,1.49,.62,.77,a);
  for(const x of [-.93,.93]){r(x,.8,-.04,.34,.54,.84,dark);bowl(x,.66,.67,.69);}
  r(0,.95,-.49,1.71,.74,.21,b);r(0,.69,.23,1.60,.15,.48,cream);break;
 case 'rift':
  for(let j=0;j<5;j++){const x=(j-2)*.39,h=1.35-Math.abs(j-2)*.29;
   k(x,h*.40,.01,.16,.20,h*.75,j%2?a:b,5);p.cone(x,h*.94,.01,.16,h*.47,cream,5);}
  r(0,.096,.10,2.55,.18,.95,dark);r(0,.204,.11,2.25,.11,.80,a);break;
 }
}

// Painted wayfinding tied to the real collision mask. No effect on moves or hits.
function dressRoute(T,root,maze,id){
 const N=1024,W=55,k=N/W,cv=document.createElement('canvas');cv.width=cv.height=N;
 const c=cv.getContext('2d');c.translate(N/2,N/2);c.scale(k,k);
 const hit=new Path2D(),h=maze.cell/2;
 for(const p of maze.walkCells)hit.rect(p.x-h-.022,p.z-h-.022,maze.cell+.044,maze.cell+.044);
 const ink={
 '1-0':['#a85f81','#ffe4ba','#d783a1','stars'],'1-2':['#27867d','#fff5c3','#e7a44f','court'],
 '1-3':['#a14b62','#fde4a1','#915b87','crest'],'1-4':['#6b5089','#ffd7ad','#a36690','petals'],
 '2-1':['#1d495b','#c2f5b3','#7bb695','forest'],'2-2':['#433b77','#ffd19e','#ac82a7','village'],
 '3-0':['#473d79','#ffd4b1','#8a79ab','stars'],'3-1':['#3a8585','#fff0c6','#8cc6b7','lobby'],
 '3-2':['#48958a','#fff1c5','#d79d6d','pantry'],'3-3':['#466695','#d6edfd','#869bcb','meeting'],
 '3-4':['#a65c9e','#ffdeed','#d8a0cb','heart'],'3-6':['#976845','#ffe4a0','#bd9960','finance'],
 '3-7':['#6272a2','#fff0c8','#e9a493','cross'],'3-5':['#7e537c','#ffe2a0','#c17799','executive'],
 '4-1':['#61285f','#f4ccf7','#bb65bc','rift']}[id];
 const [shadow,light,body,mark]=ink,a=(color,alpha)=>color+alpha;
 const q=(x,z,w,d,r,fill,stroke=null,line=.06)=>{
  c.beginPath();c.roundRect(x-w/2,z-d/2,w,d,r);
  if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=line;c.stroke();}
 };
 const line=(coords,col,width)=>{
  c.strokeStyle=col;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';
  c.beginPath();coords.forEach(([x,z],i)=>i?c.lineTo(x,z):c.moveTo(x,z));c.stroke();
 };
 const dot=(x,z,w,d,col)=>{
  c.beginPath();c.ellipse(x,z,w,d,0,0,7);c.fillStyle=col;c.fill();
 };
 const star=(x,z,r,col)=>{
  c.beginPath();for(let i=0;i<8;i++){const t=i*Math.PI/4,o=i%2?r*.36:r;
   const xx=x+o*Math.sin(t),zz=z+o*Math.cos(t);i?c.lineTo(xx,zz):c.moveTo(xx,zz);}
  c.closePath();c.fillStyle=col;c.fill();
 };
 const halo=(x,z,r,color,alpha)=>{
  const g=c.createRadialGradient(x,z,.01,x,z,r);
  g.addColorStop(0,color+alpha);g.addColorStop(.47,color+alpha);g.addColorStop(1,color+'00');
  c.fillStyle=g;c.fillRect(x-r,z-r,r*2,r*2);
 };
 c.save();c.clip(hit);
 for(const w of maze.walls){
   const x=(w.x1+w.x0)/2,z=(w.z1+w.z0)/2,wide=w.x1-w.x0>w.z1-w.z0;
   const size=(wide?w.x1-w.x0:w.z1-w.z0)/2;
   line(wide?[[x-size,z],[x+size,z]]:[[x,z-size],[x,z+size]],a(shadow,'55'),.64);
   line(wide?[[x-size,z],[x+size,z]]:[[x,z-size],[x,z+size]],a(light,'95'),.16);
 }
 const mid=[['forest','village','rift'].includes(mark)?6.6:6.05,mark==='forest'?2.6:3.85];
 if(mark==='court'){
  q(0,0,15.6,9,.5,a(body,'27'));
  for(const side of [-1,1])q(side*6.3,0,3,3,.15,a(shadow,'35'));
  for(const z of [-4.89,4.89])line([[-3.3,z],[3.3,z]],a(shadow,'48'),.14);
 }else if(mark==='forest'||mark==='village'){
  // Highlight lantern reach and break up the broad walkable area with hand-staggered pavers.
  c.fillStyle=a(shadow,mark==='village'?'36':'20');c.fillRect(-26,-26,52,52);
  halo(-4.3,-3.25,6.0,light,mark==='village'?'60':'36');halo(4.4,-5.5,5.1,light,'39');halo(.3,2,3.9,body,'37');
  for(let i=0;i<11;i++){
   const x=(Math.sin(i*2.1)*1.11)+(i%2?.48:-.48),z=-12+i*2.28,w=1.16+(i%3)*.20;
   q(x,z,w,.72,.30,a(shadow,'20'),a(light,'66'),.036);
   line([[x-w*.29,z-.18],[x+w*.18,z-.21],[x+w*.31,z-.11]],a(light,'60'),.04);
  }
 }else if(mark==='rift'){
  halo(0,-3.6,8.4,body,'57');
  for(const z of [-7.8,-2.7,2.6,7.5]){
   for(const scale of [1,.83]){c.save();c.translate(0,z);c.rotate(Math.PI/4);q(0,0,2.85*scale,2.85*scale,.41,scale===1?a(shadow,'7d'):a(body,'42'),a(light,'91'),.065);c.restore();}
   star(0,z,.78,a(light,'aa'));
  }
  for(const s of [-1,1])line([[s*2,-12],[s*2.65,-8],[s*1.67,-5],[s*2.49,-1],[s*1.86,2]],a(light,'6b'),.068);
 }else{
  const [w,d]=mid;
  q(0,.72,w,d,.85,a(shadow,'82'),a(light,'8c'),.111);
  q(0,.72,w-.26,d-.26,.72,a(body,'86'),a(light,'80'),.048);
  q(0,.72,w-.64,d-.64,.60,null,a(light,'6b'),.056);
  for(const z of [-d*.33+.72,d*.33+.72])for(let i=-3;i<=3;i++){
   const x=i*w*.13;
   if(mark==='heart'){dot(x-.077,z,.121,.107,a(light,'a5'));dot(x+.077,z,.121,.107,a(light,'a5'));star(x,z+.065,.164,a(light,'a5'));}
   else if(mark==='petals'){for(let j=0;j<5;j++)dot(x+Math.cos(j*1.26)*.09,z+Math.sin(j*1.26)*.09,.068,.068,a(light,'a5'));}
   else star(x,z,i===0?.19:.12,a(light,'a8'));
  }
  if(mark==='lobby'||mark==='executive'||mark==='crest'||mark==='finance'){
    for(const r of [.64,.90]){c.beginPath();c.ellipse(0,.72,r,r*.79,0,0,7);c.lineWidth=.057;c.strokeStyle=a(light,'ae');c.stroke();}
    star(0,.72,.50,a(light,'a9'));
  }
  if(['pantry','meeting','cross'].includes(mark)){
   for(const side of [-1,1])for(const zz of [-4.5,4.65,8.75]){
    q(side*.95,zz,1.36,2.53,.34,a(side===-1?shadow:body,'44'),a(light,'87'),.052);
    line([[side*.95-.34,zz-.66],[side*.95+.28,zz-.66],[side*.95+.37,zz-.46]],a(light,'85'),.047);
   }
  }else{
   for(const z of [-8.2,-4.65,5.35,9.3]){
    q(0,z,2.49,1.59,.38,a(shadow,'57'),a(light,'72'),.061);
    for(const x of [-.58,0,.58])star(x,z,.21,a(light,'82'));
   }
  }
 }
 c.restore();
 const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;
 const mesh=new T.Mesh(new T.PlaneGeometry(W,W),new T.MeshBasicMaterial({
   map:tex,transparent:true,depthWrite:false,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-1
 }));
 mesh.rotation.x=-Math.PI/2;mesh.position.y=-.017;mesh.name='Story route accents';root.add(mesh);
 return ()=>{mesh.geometry.dispose();mesh.material.dispose();tex.dispose();};
}

function makeSkin(T,root,maze,id){
 const [kind,ink,a,b,left,right]=THEMES[id],style=STORY_QUALITY[id];
 const kit=makeQualityKit(T,root,{edge:style.palette[4]});
 const clearRoute=dressRoute(T,root,maze,id);
 const detail=bakedDetails(T,root,a,b,ink),pools=vignettePainter(T,root,b);
 const details=[],moves=[],poolList=[];
 const isFree=(x,z)=>!maze.blocked({x,z},.025);
 const motifs={dorm:[0,4],court:[3,6],office:[4,6],gate:[2,1],forest:[1,5],village:[2,1],desk:[4,7],lobby:[6,7],pantry:[1,4],meeting:[4,7],support:[0,4],finance:[4,2],cross:[4,6],boss:[7,1],rift:[5,2]}[kind];
 function position([x,z],dir){
  for(const [dx,dz] of [[0,0],[0,-2],[1.8*dir,0],[2.55*dir,-1.6],[3.8*dir,-1.5],[5*dir,-1],[6.8*dir,-.6],[7.5*dir,-2.3],[8.7*dir,1.4],[9.9*dir,2.2]]){
   const X=x+dx,Z=z+dz;
   if([-1.32,0,1.32].every(dd=>[-.6,.6].every(zz=>!isFree(X+dd,Z+zz))))return [X,Z];
  }
  return null;
 }
 function cluster(pos,side,i){
  const at=position(pos,side);if(!at)return;
  const [x,z]=at;
  kit.place(x,z,-side*.18,p=>prop(kind,p,i,a,b));
  poolList.push(pools.at(x,z+1,4.2,2.6));
  for(const [n,xo,zo,sy,w] of [[motifs[i%2],side*1.57,.25,.49,1.28],[motifs[(i+1)%2],side*1.35,-.81,.39,.94]]){
    if(!isFree(x+xo,z+zo)){const piece=detail.at(n,x+xo,z+zo,sy,w,-side*.25);details.push(piece);}
  }
 }
 cluster(left,-1,0);cluster(right,1,1);
 cluster([-10.2,3.45],-1,2);cluster([10.1,3.2],1,3);
 const exterior=['court','gate','forest','village'].includes(kind);
 for(const side of [-1,1]){
  for(let i=0;i<5;i++){
   const z=-17.1+i*4.22,near=side*(7.1+(i%3)*1.15),xs=[near,near+side*2.4,near+side*4.8];
   const x=xs.find(x=>!isFree(x,z));if(x==null)continue;
   for(let j=0;j<2;j++){
    const xx=x+side*(j*.7),zz=z+Math.sin(i+j*2)*.70;
    if(!isFree(xx,zz)){
     const w=.69+(i%3)*.17+(j===1?.24:0);
     details.push(detail.at(exterior&&j===0?1:motifs[(i+j)%2],xx,zz,w*.38,w,-side*.12));
    }
   }
  }
 }
 // One unobtrusive moving story prop per side, not a combat effect.
 for(const side of [-1,1]){
   const at=position(side<0?left:right,side);if(!at)continue;
   const [x,z]=at;
   const motif=exterior?(kind==='village'?2:3):kind==='rift'?5:kind==='dorm'?0:4;
   const el=detail.at(motif,x-side*.82,z+.26,1.32+(side>0?.18:0),.73,-side*.16);
   moves.push({el,y:el.position.y,x:el.position.x,phase:side*.8});
 }
 kit.draw();
 let t=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 return {details:details.length,solids:kit.partCount(),motion:moves.length,
  update(dt){t+=Math.min(Math.max(dt||0,0),.045)*(reduced?.15:1);for(const a of moves){
    a.el.position.y=a.y+Math.sin(t*1.6+a.phase)*.12;
    a.el.position.x=a.x+Math.sin(t*.8+a.phase)*.18;
    a.el.rotation.z=Math.sin(t*.95+a.phase)*.09;
  }},
  dispose(){clearRoute();detail.dispose();pools.dispose();kit.gradient.dispose();}
 };
}

export function dressStoryQuality(T,scene,d,maze,sun,quality,camera,hero){
 const old=illustrated(T,scene,d,maze,sun,quality,camera,hero);
 const world=sun.parent,root=new T.Group();root.name='Story art v2 | '+d.id;world.add(root);
 const skin=makeSkin(T,root,maze,d.id);
 const painted=placeStoryPaint(T,root,maze,d.id,camera,hero);
 const stats={...old.stats,quality:'polished',sceneDetails:skin.details,sceneSolids:skin.solids,sceneMotion:skin.motion,paintedLandmarks:painted.count,paintedPositions:painted.entries,
   get fxMotion(){return old.stats.fxMotion;}};
 return {stats,update(dt){old.update(dt);skin.update(dt);painted.update();},
   dispose(){old.dispose();skin.dispose();painted.dispose();}};
}
