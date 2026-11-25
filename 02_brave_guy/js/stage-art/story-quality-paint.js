// Story H5 revision: image-backed scenery, painted cast shadows, readable route masks.
const U=Math.PI*2, EXTENT=31, SIZE=1536;
const root='../../assets/runtime/stage-art/story_quality_';
const load=name=>new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(Error(name+' not found'));i.src=new URL(root+name+'.png',import.meta.url);});
const existing=n=>new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=new URL('../../assets/runtime/stage-art/sunny_chibi_'+n+'.png',import.meta.url);});
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
const [woods,inside,twilight,surfaces,nature]=await Promise.all([load('woodland'),load('interior'),load('twilight'),load('surfaces'),existing('plants')]);
const bitmaps=Object.fromEntries(Object.entries({forest:[woods,0],ferns:[woods,1],cottage:[woods,2],lantern:[woods,3],read:[inside,0],
 pots:[inside,1],window:[inside,2],files:[inside,3],tower:[twilight,0],crystal:[twilight,1],sofa:[twilight,2],city:[twilight,3]}).map(([n,[im,j]])=>[n,quadrant(im,j,true)]));
for(const [k,j] of [['tree',0],['bloom',1],['flowers',2],['hedge',3]])bitmaps[k]=oldCrop(nature,j);
const surfacesBy=[0,1,2,3].map(i=>quadrant(surfaces,i,false));
const rnd=s=>()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/2**32);
const recipe={
 '1-0':{rim:['files','pots'],back:['read','window','read'],coat:'rug',light:'#ffd5a2'},
 '1-2':{rim:['hedge','flowers'],back:['tree','bloom','tree'],coat:'court',light:'#fff0a8'},
 '1-3':{rim:['flowers','hedge'],back:['tree','bloom','tree'],coat:'parade',light:'#ffd297'},
 '1-4':{rim:['lantern','hedge'],back:['bloom','tree','bloom'],coat:'gate',light:'#ffc28a'},
 '2-1':{rim:['ferns','ferns'],back:['forest','forest','forest'],coat:'woods',light:'#8ce8cf'},
 '2-2':{rim:['lantern','ferns'],back:['cottage','cottage','forest'],coat:'village',light:'#ffb868'},
 '3-0':{rim:['files','pots'],back:['city','window','read'],coat:'rug',light:'#d5e8ff'},
 '3-1':{rim:['pots','pots'],back:['window','window','window'],coat:'lobby',light:'#edfff9'},
 '3-2':{rim:['pots','files'],back:['read','window','window'],coat:'office',light:'#fff0bd'},
 '3-3':{rim:['files','pots'],back:['window','read','window'],coat:'meeting',light:'#cad9ff'},
 '3-4':{rim:['files','files','pots'],back:['read','window','read'],coat:'office',light:'#ffd4df'},
 '3-6':{rim:['files','files','pots'],back:['read','read','read'],coat:'finance',light:'#ffe2a0'},
 '3-7':{rim:['files','pots'],back:['window','read','window'],coat:'meeting',light:'#ffc5a9'},
 '3-5':{rim:['pots','sofa'],back:['city','tower','city'],coat:'roof',light:'#ffd1a7'},
 '4-1':{rim:['crystal','ferns'],back:['crystal','tower','crystal'],coat:'rift',light:'#eca6e8'}
};
export function paintArtStage(T,root,maze,style,id,camera,hero) {
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
  if(Math.hypot(x-maze.start.x,z-maze.start.z)<2.9||Math.hypot(x-maze.boss.x,z-maze.boss.z)<1.7)return false;
  if(foot.some(p=>Math.hypot(x-p.x,z-p.z)<1.22))return false;
  sprite(rim[i%rim.length],x,z,w,{stretch:.86,foot:.20});return true;
 }
 for(let i=0;i<3;i++){
  const x=[-14,0,14][i],z=-20.1-(i===1?2.6:0)+rng()*1.3;
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
 backGrad.addColorStop(0,lite);backGrad.addColorStop(.46,mid);backGrad.addColorStop(1,dark);
 c.fillStyle=backGrad;c.fillRect(0,0,SIZE,SIZE);
 const indoor=!['gate','court','parade','woods','village','roof','rift'].includes(coat);
 mixTexture(surfacesBy[coat==='woods'||coat==='gate'?2:indoor?0:1],mid,.87);
 const radiance=c.createRadialGradient(uv(-6),uv(-9),5,uv(-6),uv(-9),660);
 radiance.addColorStop(0,light+'83');radiance.addColorStop(1,light+'00');
 c.fillStyle=radiance;c.fillRect(0,0,SIZE,SIZE);

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
 c.strokeStyle=lite+'b9';c.lineWidth=13;c.stroke(edges);
 c.save();c.clip(hit);
 const pathGrad=c.createLinearGradient(0,0,SIZE,SIZE);pathGrad.addColorStop(0,high);pathGrad.addColorStop(.52,coat==='woods'?'#87a38b':base);pathGrad.addColorStop(1,coat==='woods'?'#6b8b82':mid);
 c.fillStyle=pathGrad;c.fillRect(0,0,SIZE,SIZE);
 const surface={wood:0,court:0,stone:1,moss:2,carpet:3,marble:3,office:3,fracture:1}[style.ground]??1;
 mixTexture(surfacesBy[surface],base,style.ground==='court'?.31:coat==='woods'?.43:.80,coat==='woods'?11:7);
 c.fillStyle=radiance;c.fillRect(0,0,SIZE,SIZE);
 c.strokeStyle=line+'72';c.lineWidth=5;c.stroke(edges);
 const pt=(x,z)=>[uv(x),uv(z)];
 const L=(...xy)=>{c.beginPath();for(let i=0;i<xy.length;i+=2)(i?c.lineTo:c.moveTo).call(c,...pt(xy[i],xy[i+1]));c.stroke();};
 function panel(x,z,w,d,r){
   c.beginPath();c.roundRect(uv(x-w/2),uv(z-d/2),w*k,d*k,r*k);c.fill();c.stroke();
 }
 c.lineWidth=3.2;c.strokeStyle=line+'aa';c.fillStyle=dark+'32';
 if(coat==='court'){
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
