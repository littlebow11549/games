import {SCENE_GRADES,paintSceneWear,paintSceneRim} from './story-scene-grade.js';
import {loadStageAtlas} from './stage-textures.js?v=20261125perf1';
// Story H5 revision: image-backed scenery, painted cast shadows, readable route masks.
const U=Math.PI*2, EXTENT=31, SIZE=1536;
const canvas=(W,H)=>Object.assign(document.createElement('canvas'),{width:W,height:H});
function quadrant(im,j,alpha) {
 const a=canvas(Math.floor(im.width/2),Math.floor(im.height/2)),c=a.getContext('2d',{willReadFrequently:alpha});
 const pad=3,W=a.width-pad*2,H=a.height-pad*2;
 c.drawImage(im,(j%2)*a.width+pad,Math.floor(j/2)*a.height+pad,W,H,pad,pad,W,H);
 if(!alpha)return a;
 const src=c.getImageData(0,0,a.width,a.height), p=src.data;
 let x0=a.width,x1=-1,y0=a.height,y1=-1;
 for(let y=0;y<a.height;y++)for(let x=0;x<a.width;x++)if(p[(y*a.width+x)*4+3]>83){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
 if(x1-x0<4||y1-y0<4)throw Error('Empty sprite quadrant '+j);
 const b=canvas(x1-x0+5,y1-y0+5);b.getContext('2d').drawImage(a,x0,y0,x1-x0+1,y1-y0+1,2,2,x1-x0+1,y1-y0+1);
 return b;
}
function oldCrop(im,k) {
 const boxes=[[22,129,591,430],[648,149,579,410],[34,897,562,219],[662,942,548,174]];
 const [x,y,w,h]=boxes[k],b=canvas(w,h);b.getContext('2d').drawImage(im,x,y,w,h,0,0,w,h);return b;
}
const sources={
 forest:['woodland',0],ferns:['woodland',1],cottage:['woodland',2],lantern:['woodland',3],
 read:['interior',0],pots:['interior',1],window:['interior',2],files:['interior',3],
 tower:['twilight',0],crystal:['twilight',1],sofa:['twilight',2],city:['twilight',3],
 tree:['plants',0],bloom:['plants',1],flowers:['plants',2],hedge:['plants',3]
};
const bitmaps=Object.create(null);
let surfacesBy;
const rnd=s=>()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/2**32);
const recipe={
 '1-0':{rim:['files','pots'],back:['read','window','read'],coat:'rug',light:'#ffd5a2'},
 '1-2':{rim:['hedge','flowers'],back:['tree','bloom','tree'],coat:'court',light:'#fff0a8'},
 '1-3':{rim:['flowers','hedge'],back:['tree','bloom','tree'],coat:'parade',light:'#ffd297'},
 '1-4':{rim:['lantern','hedge'],back:['bloom','tree','bloom'],coat:'gate',light:'#ffc28a'},
 '2-1':{rim:['ferns','ferns'],back:['forest','forest','forest'],coat:'woods',light:'#8ce8cf'},
 '2-2':{rim:['lantern','ferns'],back:['cottage','cottage','forest'],coat:'village',light:'#ffb868'},
 '3-0':{rim:['files','pots'],back:[],coat:'rug',light:'#d5e8ff'},
 '3-1':{rim:['pots','pots'],back:[],coat:'lobby',light:'#edfff9'},
 '3-2':{rim:['pots','files'],back:[],coat:'office',light:'#fff0bd'},
 '3-3':{rim:['files','pots'],back:[],coat:'meeting',light:'#cad9ff'},
 '3-4':{rim:['files','files','pots'],back:[],coat:'office',light:'#ffd4df'},
 '3-6':{rim:['files','files','pots'],back:[],coat:'finance',light:'#ffe2a0'},
 '3-7':{rim:['files','pots'],back:['window','window'],coat:'meeting',light:'#ffc5a9'},
 '3-5':{rim:['pots','sofa'],back:[],coat:'roof',light:'#ffd1a7'},
 '4-1':{rim:['crystal','ferns'],back:['crystal','tower','crystal'],coat:'rift',light:'#eca6e8'}
};
export async function prepareStoryPaint(id){
 const {rim,back}=recipe[id];
 const loadSurface=surfacesBy ? null : loadStageAtlas('story_quality_surfaces').then(img=>{
  if(!surfacesBy)surfacesBy=[0,1,2,3].map(i=>quadrant(img,i,false));
 });
 await Promise.all([loadSurface,...[...new Set([...rim,...back])].map(async name=>{
  if(bitmaps[name])return;
  const [key,index]=sources[name],isPlant=key==='plants';
  const image=await loadStageAtlas(isPlant?'sunny_chibi_plants':'story_quality_'+key);
  if(!bitmaps[name])bitmaps[name]=isPlant?oldCrop(image,index):quadrant(image,index,true);
 })]);
}
export function paintArtStage(T,root,maze,style,id,camera,hero,landmarks=[]) {
 const grade=SCENE_GRADES[id];
 const recipe0=recipe[id],{rim,back,coat,light}=recipe0,palette=style.palette;
 const [base,high,dark,mid,lite,line]=palette;
 const named=new Map(),foot=[],occluders=[];
 const rng=rnd(Number(id.replace('-',''))*11939+91852);
 const geo=new T.PlaneGeometry(EXTENT*2,EXTENT*2),draw=canvas(SIZE,SIZE),c=draw.getContext('2d');
 const k=SIZE/(EXTENT*2),uv=n=>SIZE/2+n*k;
 const inRoute=(x,z,r=.04)=>!maze.blocked({x,z},r);
 const shadow=(x,z,w,h,alpha)=>{
  c.save();c.translate(uv(x+.21),uv(z+.32));c.scale(k*w,k*h);
  const g=c.createRadialGradient(0,0,.13,0,0,1);g.addColorStop(0,dark);g.addColorStop(.54,dark);g.addColorStop(1,dark+'00');
  c.globalAlpha=alpha;c.fillStyle=g;c.fillRect(-1,-1,2,2);c.restore();
 };
 function sprite(name,x,z,W,opt={}){
  const source=bitmaps[name];let m=named.get(name);
  if(!m){
   const map=new T.CanvasTexture(source);map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;
   m=new T.SpriteMaterial({map,alphaTest:.44,depthWrite:true,toneMapped:false,fog:false});named.set(name,m);
  }
  const H=W*source.height/source.width*(opt.stretch||.87),s=new T.Sprite(m);
  s.name='Painted '+name;s.center.set(.5,.085);s.position.set(x,opt.y??.05,z);s.scale.set(W,H,1);root.add(s);
  if(H>1.2)occluders.push(s);foot.push({x,z,w:W*.52,h:Math.max(.35,H*.37),alpha:opt.foot??.27});
 }
 // Individual authored scalar composition is read from each kit's layout. Offset nearby details out of navigable cells.
 function safeAccent(i,x,z,w){
  if(inRoute(x,z))return false;
  if(id==='3-7'||(id.startsWith('3-')&&(i%3!==1||Math.abs(x)<8)))return false;
  if(Math.hypot(x-maze.start.x,z-maze.start.z)<2.9||Math.hypot(x-maze.boss.x,z-maze.boss.z)<1.7)return false;
  if(foot.some(p=>Math.hypot(x-p.x,z-p.z)<1.22))return false;
  sprite(rim[i%rim.length],x,z,w,{stretch:.86,foot:.20});return true;
 }
 for(let i=0;i<back.length;i++){
  const x=(id==='3-7'?[-17,17]:[-14,0,14])[i],z=-20.1-(i===1?2.6:0)+rng()*1.3;
  sprite(back[i],x,z,coat==='woods'?7.9:coat==='village'?7.1:coat==='roof'?8.1:6.4,{foot:.32});
 }
 const winds=[[-12,-3.2],[12,-3.2],[-12,3.5],[12,3.5],[-15,-11],[15,-11],[-12,11],[12,11]];
 for(let i=0;i<winds.length;i++){
  const [x,z]=winds[i];let done=false;
  for(const dx of [0,-1,1,-2,2]){ if(safeAccent(i,x+dx,z,2.45+rng()*1.1)){done=true;break;} }
  if(!done)safeAccent(i,x*1.32,z,2.7);
 }
 for(let i=0;i<maze.walls.length;i++){
  const w=maze.walls[i],x=(w.x0+w.x1)/2,z=(w.z0+w.z1)/2;
  const horizontal=(w.x1-w.x0)>(w.z1-w.z0);
  if(rng()>.56||z>14||Math.hypot(x,z)<5)continue;
  for(const off of [-.43,.43]){
   const X=x+(horizontal?0:off),Z=z+(horizontal?off:0);
   if(safeAccent(i,X,Z,1.5+rng()*1.0))break;
  }
 }

 function mixTexture(sw,fallback,alpha,n=7){
   c.save();c.globalAlpha=alpha;c.globalCompositeOperation='soft-light';
   const W=SIZE/n;
   for(let ix=0;ix<n;ix++)for(let iy=0;iy<n;iy++){
    c.save();c.translate((ix+(ix%2))*W,(iy+(iy%2))*W);c.scale(ix%2?-1:1,iy%2?-1:1);
    c.drawImage(sw,-1.4,-1.4,W+2.8,W+2.8);c.restore();
   }c.restore();c.fillStyle=fallback;
 }
 const backGrad=c.createLinearGradient(SIZE*.15,0,SIZE*.85,SIZE);
 backGrad.addColorStop(0,grade?.horizon??(id==='3-7'?'#52465f':lite));backGrad.addColorStop(.46,grade?.edge??(id==='3-7'?'#3a354d':mid));backGrad.addColorStop(1,id==='3-7'?'#302941':dark);
 c.fillStyle=backGrad;c.fillRect(0,0,SIZE,SIZE);
 const indoor=!['gate','court','parade','woods','village','roof','rift'].includes(coat);
 mixTexture(surfacesBy[coat==='woods'||coat==='gate'?2:indoor?0:1],mid,.87);
 if(id==='3-7'){
  // Continuous walnut margins. Narrow, staggered joints and contact shading
  // replace the conspicuous atlas squares that read like an outdoor void.
  c.fillStyle='#40394d';c.fillRect(0,0,SIZE,SIZE);
  const grain=rnd(71297), lane=.72, span=3.42;
  const bands=['#554453','#604958','#594457','#513d52','#594554','#604d59'];
  for(let j=-35;j<=35;j++)for(let i=-9;i<=9;i++){
   const x=i*span+(j%4)*.65,z=j*lane;
   const r=grain(),X=uv(x-span/2+.016),Z=uv(z-lane/2+.016),W=(span-.032)*k,H=(lane-.034)*k;
   const wood=c.createLinearGradient(0,Z,0,Z+H);
   wood.addColorStop(0,bands[(r*6)|0]);wood.addColorStop(.27,bands[(r*6)|0]);
   wood.addColorStop(1,'#483c50');
   c.fillStyle=wood;c.fillRect(X,Z,W,H);
   c.fillStyle='#efbf9721';c.fillRect(X+1,Z+1,W-2,1.8);
   for(let n=0;n<3;n++){
    const gx=grain(),gz=grain(),st=X+4+W*gx*.48,Y=Z+2+(H-4)*gz;
    c.strokeStyle=n%2?'#e6b49b13':'#201f351e';c.lineWidth=.7;
    c.beginPath();c.moveTo(st,Y);c.quadraticCurveTo(st+W*.17,Y-1.9,st+W*.31,Y+.6);c.stroke();
   }
  }
 }
 const radiance=c.createRadialGradient(uv(-6),uv(-9),5,uv(-6),uv(-9),660);
 radiance.addColorStop(0,light+'83');radiance.addColorStop(1,light+'00');
 if(!grade&&id!=='3-7'){c.fillStyle=radiance;c.fillRect(0,0,SIZE,SIZE);}

 // Bake continuous walk region, and trim only at true collision edges, never on seams.
 const hit=new Path2D(),edges=new Path2D(),h=maze.cell/2;
 for(const p of maze.walkCells)hit.rect(uv(p.x-h)-.3,uv(p.z-h)-.3,maze.cell*k+.6,maze.cell*k+.6);
 for(const w of maze.walls){
  const x=(w.x0+w.x1)/2,z=(w.z0+w.z1)/2,
    hor=(w.x1-w.x0)>(w.z1-w.z0),length=(hor?w.x1-w.x0:w.z1-w.z0)/2-.23;
  edges.moveTo(uv(x-(hor?length:0)),uv(z-(hor?0:length)));
  edges.lineTo(uv(x+(hor?length:0)),uv(z+(hor?0:length)));
 }
 c.lineCap='round';c.lineJoin='round';
 c.strokeStyle=dark+'68';c.lineWidth=24;c.save();c.translate(2,5);c.stroke(edges);c.restore();
 c.strokeStyle=id==='3-7'?'#89717b94':lite+'b9';c.lineWidth=13;c.stroke(edges);
 c.save();c.clip(hit);
 const pathGrad=c.createLinearGradient(0,0,SIZE,SIZE);pathGrad.addColorStop(0,high);pathGrad.addColorStop(.52,coat==='woods'?'#87a38b':base);pathGrad.addColorStop(1,coat==='woods'?'#6b8b82':mid);
 c.fillStyle=pathGrad;c.fillRect(0,0,SIZE,SIZE);
 const surface={wood:0,court:0,stone:1,moss:2,carpet:3,marble:3,office:3,fracture:1}[style.ground]??1;
 mixTexture(surfacesBy[surface],base,style.ground==='court'?.31:coat==='woods'?.43:.80,coat==='woods'?11:7);
 if(!grade&&id!=='3-7'){c.fillStyle=radiance;c.fillRect(0,0,SIZE,SIZE);}
 if(grade)paintSceneWear(c,grade,uv,k,EXTENT);
 c.strokeStyle=line+'72';c.lineWidth=5;c.stroke(edges);
 const pt=(x,z)=>[uv(x),uv(z)];
 const L=(...xy)=>{c.beginPath();for(let i=0;i<xy.length;i+=2)(i?c.lineTo:c.moveTo).call(c,...pt(xy[i],xy[i+1]));c.stroke();};
 function panel(x,z,w,d,r){
   c.beginPath();c.roundRect(uv(x-w/2),uv(z-d/2),w*k,d*k,r*k);c.fill();c.stroke();
 }
 c.lineWidth=3.2;c.strokeStyle=line+'aa';c.fillStyle=dark+'32';
 if(id==='3-7'){
  // One baked floor pass: staggered satin tiles, contact-darkened edges, and local light pools.
  // Keep the middle low-contrast so enemy silhouettes and cast warnings stay legible.
  const tileRng=rnd(370751), stepX=1.65, stepZ=1.28;
  // Slate blues make the amber spill legible. Bevels are painted at the same
  // scale as the architecture; scuffs sit on the floor, not paper texture.
  const slate=['#59657c','#626b80','#596278','#6b6f80','#536175','#656b7d','#626c81'];
  c.fillStyle='#424e64';c.fillRect(0,0,SIZE,SIZE);
  for(let j=-17;j<=17;j++)for(let i=-14;i<=14;i++){
   const x=i*stepX+(j%2)*stepX*.5,z=j*stepZ;
   const r=tileRng();
   const bx=uv(x-stepX/2+.022),by=uv(z-stepZ/2+.022),w=(stepX-.048)*k,d=(stepZ-.055)*k;
   const tile=c.createLinearGradient(bx,by,bx+w*.4,by+d);
   tile.addColorStop(0,slate[(r*7)|0]);tile.addColorStop(1,r>.55?'#535c72':'#505a71');
   c.fillStyle=tile;c.strokeStyle='#323c5170';c.lineWidth=1.6;
   panel(x,z,stepX-.048,stepZ-.055,.075);
   c.lineWidth=1.6;c.strokeStyle='#ced4d232';
   L(x-.73,z+.38,x-.73,z-.51,x+.70,z-.51);
   c.strokeStyle='#242e4b63';L(x-.71,z+.54,x+.70,z+.54,x+.72,z-.10);
   // Irregular thin seams, inset flecks and dry brushed patches. Seeded and
   // baked, so the whole treatment stays a single floor draw.
   for(let n=0;n<10;n++){
    const a=tileRng(),b=tileRng(),m=tileRng();
    const xx=x+(a-.5)*1.27,zz=z+(b-.5)*.91;
    c.lineWidth=.58+m*.54;
    c.strokeStyle=n%3?'#bdc9d415':'#192d4d27';
    L(xx,zz,xx+.018+m*.12,zz+(m-.5)*.08);
   }
   if(r>.28&&r<.50){
    c.strokeStyle='#a7b9ce24';c.lineWidth=.82;
    L(x-.62,z-.26,x-.43,z-.30,x-.38,z-.16,x-.18,z-.18,x-.10,z-.24);
   }
   if(r>.73){
    c.strokeStyle='#bbc3cf25'; c.lineWidth=1.1;
    L(x-.47,z+.12,x-.24,z+.16,x+.18,z+.12);
    L(x+.06,z+.30,x+.37,z+.29);
   }
  }
  c.save();c.lineWidth=46;c.shadowColor='#101b30dc';c.shadowBlur=20;c.strokeStyle='#23304b88';c.stroke(edges);c.restore();
  c.save();c.strokeStyle='#a8948e65';c.lineWidth=2.2;c.stroke(edges);c.restore();
  // Rectangular light falls through the open jamb; the edges soften with
  // distance. Confine highlights to the north so dangerous red shapes stay legible.
  c.save();
  const throwLight=c.createLinearGradient(uv(0),uv(-20.2),uv(0),uv(-11.5));
  throwLight.addColorStop(0,'#ffc58c87');throwLight.addColorStop(.31,'#ffbf7846');throwLight.addColorStop(1,'#ffbc7200');
  c.filter='blur(9px)';
  c.fillStyle=throwLight;
  c.beginPath();c.moveTo(uv(-2.35),uv(-20.2));c.lineTo(uv(2.35),uv(-20.2));c.lineTo(uv(3.51),uv(-11.5));c.lineTo(uv(-2.77),uv(-11.5));c.closePath();c.fill();
  c.restore();
  // Woven runner, edge strip, and emblem anchor the battle room without
  // competing with attack indicators.
  c.fillStyle='#302a44d0';c.strokeStyle='#e9b37d90';c.lineWidth=3.1;
  panel(.12,-.21,5.77,5.18,.47);
  c.fillStyle='#675472c9';c.strokeStyle='#daae915a';c.lineWidth=1.3;
  panel(.12,-.21,5.52,4.93,.37);
  c.fillStyle='#5a496867';c.strokeStyle='#eec8a04b';
  panel(.12,-.21,5.11,4.48,.28);
  c.save();c.globalAlpha=.27;c.strokeStyle='#e7b78e';c.lineWidth=1.5;
  for(const [x,z] of [[-2.10,-1.86],[2.36,-1.86],[-2.10,1.45],[2.36,1.45],[.12,-.21]]){
   const a=x===.12?.64:.16;L(x,z-a,x+a,z,x,z+a,x-a,z,x,z-a);
  }
  c.restore();
 }else if(coat==='court'){
  c.fillStyle=base+'04';c.strokeStyle='#fff8d2d9';c.lineWidth=3.6;
  panel(0,0,15.6,9.0,.5);L(0,-4.5,0,4.5);
  c.beginPath();c.arc(uv(0),uv(0),k*1.42,0,U);c.stroke();
  panel(-6.3,0,3.0,3,.15);panel(6.3,0,3.0,3,.15);
 }else if(['rug','meeting','finance','roof','rift'].includes(coat)){
  c.fillStyle=dark+'73';panel(0,.4,6.9,5.1,1.1);
  c.fillStyle=lite+'39';panel(0,.4,6.55,4.75,.88);
  c.fillStyle=mid+'45';panel(0,.4,5.94,4.14,.82);
  for(let i=-2;i<=2;i++)for(const z of [-1.25,2.04])L(i*.83,z-.15,i*.83+.15,z,i*.83,z+.15,i*.83-.15,z,i*.83,z-.15);
 }else if(coat==='parade'||coat==='lobby'||coat==='gate'){
  c.beginPath();c.ellipse(uv(0),uv(0),1.65*k,1.65*k,0,0,U);c.stroke();
  c.beginPath();c.ellipse(uv(0),uv(0),1.35*k,1.35*k,0,0,U);c.stroke();
  for(let i=0;i<8;i++){const a=i*U/8;L(Math.cos(a)*1.11,Math.sin(a)*1.11,Math.cos(a)*.83,Math.sin(a)*.83);}
 }
 for(let i=0;i<99;i++){
  const x=(rng()-.5)*42,z=(rng()-.5)*42,f=.035+rng()*.11;
  if(!inRoute(x,z,.3))continue;
  c.fillStyle=line+(i%2?'49':'a0');c.strokeStyle=dark+'3e';c.lineWidth=1.3;
  c.save();c.translate(...pt(x,z));c.rotate(rng()*U);
  c.beginPath();c.ellipse(0,0,k*f*2.15,k*f*.60,0,0,U);c.fill();c.stroke();c.restore();
 }
 c.restore();
 if(grade){
  paintSceneRim(c,grade,uv,k,SIZE,maze.walls,edges);
  for(const [x,z,w,d] of landmarks)if(!inRoute(x,z))shadow(x,z,w,d,.58*grade.shade+.16);
 }
 if(id==='3-7'){
  for(const [x,z,w,d,core] of [[0,-17.1,3.9,6.2,'#ffca83bf'],[-4.72,-9.62,3.7,3.1,'#ffc08092'],[4.75,-10.07,3.0,2.8,'#e8aeab75'],[-14.5,10.8,2.9,2.5,'#ffb5778a'],[14.2,10.9,2.8,2.3,'#cb9cd178']]){
   c.save();c.translate(uv(x),uv(z));c.scale(k*w,k*d);
   const glow=c.createRadialGradient(0,-.25,.08,0,.06,1);
   glow.addColorStop(0,core);glow.addColorStop(.44,core.slice(0,7)+'71');glow.addColorStop(.72,core.slice(0,7)+'26');glow.addColorStop(1,core.slice(0,7)+'00');
   c.fillStyle=glow;c.fillRect(-1,-1,2,2);c.restore();
  }
 }
 if(id==='3-7'){
  for(const sign of [-1,1]){
   // Long soft wall contact, with stronger small shadows under every pilaster.
   c.save();const inner=uv(sign*14.3),outer=uv(sign*17.2);
   const ao=c.createLinearGradient(inner,0,outer,0);
   ao.addColorStop(0,'#1d1b2c00');ao.addColorStop(.48,'#231e3765');ao.addColorStop(1,'#1d172ccc');
   c.fillStyle=ao;c.fillRect(Math.min(inner,outer),uv(-14.2),Math.abs(outer-inner),31.3*k);c.restore();
   for(let i=-3;i<=3;i++)shadow(sign*16.43,1.6+i*4.82,1.37,.88,.65);
  }
  c.save();c.fillStyle='#25203838';c.fillRect(uv(-16.9),uv(16.96),33.8*k,1.04*k);c.restore();
 }
 if(id==='3-7'){
  // Reflected light is narrow at each sconce and spreads down the wall face.
  // Keep the running lane cool in between fixtures.
  for(const side of [-1,1])for(const z of [-.81,13.7]){
   c.save();c.translate(uv(side*15.48),uv(z));c.scale(2.24*k,2.65*k);
   const light=c.createRadialGradient(side*.36,0,.03,0,0,1);
   light.addColorStop(0,'#edbb8397');light.addColorStop(.33,'#eab48755');
   light.addColorStop(.59,'#e3a67821');light.addColorStop(1,'#e3ac8600');
   c.fillStyle=light;c.fillRect(-1,-1,2,2);c.restore();
  }
 }
 if(id==='3-7'){ for(const [x,z,w,d,a] of [[0,9.2,4.18,1.72,.69],[-14.25,11.65,2.91,1.76,.69],[14.15,10.92,2.58,1.56,.66],[-4.6,-10.82,2.55,1.7,.54],[4.6,-10.82,2.54,1.66,.57],[-3.18,-20.10,1.6,2.0,.62],[3.18,-20.10,1.6,2.0,.62]])shadow(x,z,w,d,a); }
 for(const v of foot)shadow(v.x,v.z,v.w,v.h,v.alpha);
 // Closed paths are still exact. Implied sketch lines are never used to block player controls.
 const map=new T.CanvasTexture(draw);map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;
 const stageFloor=new T.Mesh(geo,new T.MeshBasicMaterial({map,toneMapped:false,fog:false}));
 stageFloor.rotation.x=-Math.PI/2;stageFloor.position.y=-.026;stageFloor.name='Painted ground';root.add(stageFloor);
 const shadowPlane=new T.Mesh(geo,new T.ShadowMaterial({opacity:.21,depthWrite:false}));
 shadowPlane.rotation.x=-Math.PI/2;shadowPlane.position.y=-.008;shadowPlane.receiveShadow=true;root.add(shadowPlane);
 function update(){
  if(!camera?.position||!hero?.pos)return;
  const a=camera.position,b=hero.pos,dx=b.x-a.x,dz=b.z-a.z,l=dx*dx+dz*dz||1;
  for(const s of occluders){
   const sx=s.position.x-a.x,sz=s.position.z-a.z,t=(sx*dx+sz*dz)/l;
   const dist=Math.hypot(sx-t*dx,sz-t*dz);
   s.visible=!(t>.40&&t<1.08&&dist<s.scale.x*.38&&a.y*(1-t)+.92*t<s.scale.y*.94);
  }
 }
 return {count:foot.length,update};
}
