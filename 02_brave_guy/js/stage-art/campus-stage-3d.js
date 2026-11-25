import { makeSchool } from './campus-school-3d.js';
import { makeWaterfall } from './campus-water-3d.js';
// Atlas paintings are not reference screenshots. Navigation remains owned by sunny-maze.
const TAU = Math.PI*2;
const load=(name)=>new Promise((ok,fail)=>{
 const pic=new Image();pic.onload=()=>ok(pic);pic.onerror=()=>fail(Error('Scene art failed to load: '+name));
 pic.src=new URL('../../assets/runtime/stage-art/sunny_chibi_'+name+'.png',import.meta.url).href;
});
const [PLANTS,LANDMARKS,GROUND]=await Promise.all(['plants','landmarks','terrain'].map(load));
const WATER_POS={x:-4.7,z:-10.15};
const POND='M -3.99,-.03 C -4.18,-.75 -3.3,-1.48 -2.36,-1.49 C -1.2,-1.62 -.91,-2.15 .61,-1.98 C 1.68,-1.9 1.97,-1.55 2.88,-1.24 C 4.04,-.88 4.17,-.05 3.17,.58 C 2.75,.81 1.81,1.03 .42,1.24 C -.72,1.36 -1.38,1.87 -2.73,1.48 C -3.65,1.17 -4.14,.63 -3.99,-.03 Z';
const RAND=(s)=>()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
const graphic=(w,h,fn)=>{const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);return c;};
const CROP={
 grass:[4,4,616,616],dirt:[634,5,614,614],water:[4,635,615,614],shade:[635,635,614,614],
 green:[22,129,591,430],pink:[648,149,579,410],
 low:[34,897,562,219],tall:[662,942,548,174],
 school:[0,153,645,510],cascade:[626,209,624,451],
 stone:[29,842,577,302],fence:[630,840,608,302],
};
function blit(c,src,key,x,y,w,h){c.drawImage(src,...CROP[key],x,y,w,h);}
function shade(c,x,z,rx,rz,alpha=.25){
 c.save();c.translate(x,z);c.scale(rx,rz);
 const r=c.createRadialGradient(0,0,.10,0,0,1);
 r.addColorStop(0,'rgba(36,62,39,'+alpha+')');r.addColorStop(.50,'rgba(48,70,39,'+(alpha*.76)+')');r.addColorStop(1,'rgba(57,70,41,0)');
 c.fillStyle=r;c.fillRect(-1,-1,2,2);c.restore();
}
function tiles(c,W,H,key,count){
 const w=W/count,h=H/count;
 for(let y=0;y<count;y++)for(let x=0;x<count;x++){
  c.save();c.translate(x*w+(x%2?w:0),y*h+(y%2?h:0));c.scale(x%2?-1:1,y%2?-1:1);
  blit(c,GROUND,key,-1.25,-1.25,w+2.5,h+2.5);c.restore();
 }
}
function floor(w,h,cells,cell,footprints,extent){
 return graphic(w,h,(c,W,H)=>{
  const px=v=>(v+extent)/(2*extent)*W, s=cell*W/(extent*2), u=W/(extent*2);
  const random=RAND(113781);
  tiles(c,W,H,'grass',7);
  c.fillStyle='#9eac8450';c.fillRect(0,0,W,H);
  // Transparent, full-region dark undergrowth brush blended on the slopes.
  const shadowTile=graphic(620,620,g=>blit(g,GROUND,'shade',0,0,620,620));
  for(let i=0;i<22;i++){
   const worldX=(random()-.5)*64,worldZ=(random()-.5)*62;
   if(cells.some(p=>Math.hypot(worldX-p.x,worldZ-p.z)<3.1))continue;
   const x=px(worldX),z=px(worldZ),d=135+210*random();
   c.save();c.beginPath();c.ellipse(x,z,d*.63,d*.53,random(),0,TAU);c.clip();
   c.globalAlpha=.19+random()*.14;c.filter='blur(16px)';c.drawImage(shadowTile,x-d*.67,z-d*.6,d*1.35,d*1.2);c.restore();
  }
  const wide=new Path2D(),mask=new Path2D();
  for(const p of cells){
   const x=px(p.x)-s/2,z=px(p.z)-s/2;
   wide.roundRect(x-8,z-8,s+16,s+16,16);
   mask.roundRect(x-1.25,z-1.25,s+2.5,s+2.5,14);
  }
  c.fillStyle='#7796577d';c.fill(wide);
  c.save();c.clip(mask);
  tiles(c,W,H,'dirt',5);
  c.fillStyle='#fff5c431';c.fillRect(0,0,W,H);
  c.restore();
  c.save();c.globalAlpha=.18;c.filter='blur(6px)';
  c.lineWidth=13;c.strokeStyle='#dce989';c.stroke(mask);c.restore();
  // Pond is wholly in the enclosed northern ornamental garden. Art isn't collision.
  c.save();c.translate(px(WATER_POS.x),px(WATER_POS.z));c.scale(u,u);
  const pool=new Path2D(POND);
  c.lineWidth=.28;c.strokeStyle='#63835b';c.stroke(pool);
  c.lineWidth=.16;c.strokeStyle='#d8dfae';c.stroke(pool);
  c.save();c.clip(pool);blit(c,GROUND,'water',-4.1,-2.1,8.3,4.1);
  const g=c.createLinearGradient(0,-1.7,0,1.6);
  g.addColorStop(0,'#16577850');g.addColorStop(.33,'#17658010');g.addColorStop(.8,'#dbf4cd04');g.addColorStop(1,'#dcf6cc3e');
  c.fillStyle=g;c.fillRect(-5,-2.5,10,5);
  c.restore();
  c.lineWidth=.032;c.strokeStyle='#f2f6ca8a';c.stroke(pool);
  for(const [x,y,k] of [[-2.72,.38,.25],[-2.52,.53,.17],[2.18,.61,.23]]){
   c.fillStyle='#7ea847';c.beginPath();c.ellipse(x,y,k,k*.55,-.20,.22,TAU-.08);c.lineTo(x,y);c.fill();
   c.fillStyle='#ffc9a0';c.beginPath();c.ellipse(x-.07,y-.02,.07,.035,.2,0,TAU);c.fill();
  }
  c.restore();
  for(const o of footprints){shade(c,px(o.x+o.shadow),px(o.z+.36),o.w*u*.63,o.shadowH*u,o.k*.79);}
  // Subtle directional trail highlights at the courtyard, not fake collision.
  for(const [x,z] of [[-3,-1.9],[3,-1.9],[-3,3.8],[3,3.8]]){
   c.save();c.translate(px(x),px(z));c.rotate(Math.PI/4);
   c.fillStyle='#78995150';c.fillRect(-3,-3,6,6);c.restore();
  }
 });
}

export function dressCampus3D(THREE,scene,{maze,world,sun,camera,hero,radius=26}={}){
 const cells=maze?.walkCells,cell=maze?.cell;
 if(!cells?.length||!world?.parent)throw Error('Painted world expects the original Sunny maze');
 const root=new THREE.Group();root.name='1-1 actual 3D landmarks with 2D surroundings';scene.add(root);
 const art=world.children.filter(o=>o.isMesh||o.isGroup).map(o=>[o,o.visible]);
 art.forEach(([o])=>o.visible=false);
 const oldMaze=maze.group.visible;maze.group.visible=false;
 const oldBg=scene.background,oldFog=scene.fog,oldSun=sun?.color.clone();
 scene.background=new THREE.Color(0xc8dfa2);scene.fog=new THREE.Fog(0xc8dfa2,48,108);
 sun?.color.setHex(0xffe8bc);
 const textures=[],materials=[],geometries=[],footprints=[],occluders=[];
 const texture=canvas=>{const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;textures.push(t);return t;};
 const mat=(Type,cfg)=>{const m=new Type(cfg);materials.push(m);return m;};
 const random=RAND(225381);
 const occupied=(x,z)=>cells.some(p=>Math.abs(x-p.x)<cell*.515&&Math.abs(z-p.z)<cell*.515);
 const positions={water:{x:-4.10,z:-11.42},school:{x:maze.exit.x-3.07,z:maze.exit.z-6.00}};
 const reserves=[
  {p:positions.water, halfX:3.16,front:1.82,back:1.90},
  {p:positions.school,halfX:5.32,front:3.02,back:2.33}
 ];
 const nearLandmark=(x,z,pad=0)=>reserves.some(({p,halfX,front,back})=>
   Math.abs(x-p.x)<halfX+pad && z>p.z-back-pad && z<p.z+front+pad);
 const material=(atlas,key)=>{
  const [sx,sy,w,h]=CROP[key];
  const map=texture(graphic(w,h,c=>{
    if(key==='school')c.clip(new Path2D('M 0 0 H 645 V 300 L 622 345 V 510 H 0 Z'));
    if(key==='cascade')c.clip(new Path2D('M 15 0 H 624 V 451 H 0 V 293 L 15 251 Z'));
    c.drawImage(atlas,sx,sy,w,h,0,0,w,h);
  }));
  return {m:mat(THREE.SpriteMaterial,{map,alphaTest:.47,transparent:false,depthWrite:true,toneMapped:false}),aspect:w/h};
 };
 const tileset={};
 for(const k of ['green','pink','low','tall'])tileset[k]=material(PLANTS,k);
 for(const k of ['stone','fence'])tileset[k]=material(LANDMARKS,k);
 function stamp(key,x,z,w,{high=false,anchor=.13,flat=.85,mirror=false,shadow=.19}={}){
  const {m,aspect}=tileset[key];
  const o=new THREE.Sprite(m);o.position.set(x,.035,z);o.center.set(.50,anchor);
  const h=w/aspect*flat;
  // Mirroring a Sprite via negative width is not portable; composition uses reduced repeat instead.
  o.scale.set(w,h,1);root.add(o);
  footprints.push({x,z,w,shadow:high?.58:.13,shadowH:high?Math.min(1.53,w*.25):Math.min(.8,h*.52),k:shadow});
  if(high)occluders.push(o);
  return o;
 }
 const border=(w)=>Math.max(w.x1-w.x0,w.z1-w.z0);
 let rimCount=0;
 // Stagger hedge clusters, rock silhouettes and wooden segments along real barriers.
 for(const [i,w] of maze.walls.entries()){
   const x=(w.x0+w.x1)/2,z=(w.z0+w.z1)/2,alongX=w.x1-w.x0>=w.z1-w.z0;
   const len=border(w);
   const n=len>=4?2:1;
   for(let j=0;j<n;j++){
    const off=(j+.5)*len/n-len/2+(random()-.5)*.27;
    const xx=x+(alongX?off:0),zz=z+(alongX?0:off);
    if(nearLandmark(xx,zz,.25)||Math.hypot(xx-maze.exit.x,zz-maze.exit.z)<2.0 || Math.hypot(xx-maze.start.x,zz-maze.start.z)<1.3)continue;
    const k=arcMat(i+3*j,xx,zz,alongX),w0=(1.74+random()*.91)*(k==='tall'?1.11:1);
    stamp(k,xx,zz,Math.max(len/n*.84,w0),{flat:.92,anchor:.10,shadow:.19});
    rimCount++;
   }
 }
 function arcMat(i,x,z,alongX){
   const west=Math.hypot(x-WATER_POS.x,z-WATER_POS.z)<5.0;
   return west&&i%3===0?'stone':alongX&&(i%11===4||i%11===5)?'fence':i%6===0?'stone':i%6===3?'tall':'low';
 }
 const seen=[];
 for(let z=-24;z<=26;z+=4.75) for(let x=-25;x<=25;x+=5.4){
   const X=x+(random()-.5)*1.45,Z=z+(random()-.5)*1.20;
   if(occupied(X,Z)||nearLandmark(X,Z,1.0)||Math.hypot(X-WATER_POS.x,Z-WATER_POS.z)<4.5||random()>.52)continue;
   if([maze.start,maze.exit,maze.boss].some(p=>p&&Math.hypot(p.x-X,p.z-Z)<3.8))continue;
   if(cells.some(p=>Math.hypot(p.x-X,p.z-Z)<cell*.56))continue;
   if(seen.some(p=>Math.hypot(p.x-X,p.z-Z)<4.4))continue;
   seen.push({x:X,z:Z});stamp(seen.length%5===2?'pink':'green',X,Z,4.45+random()*1.60,{high:true,anchor:.075,flat:.91,shadow:.32});
 }
 // A landmark at the pond lip is visible from the courtyard.
 const waterfall=makeWaterfall(THREE);
 waterfall.root.position.set(positions.water.x,0,positions.water.z);root.add(waterfall.root);
 const school=makeSchool(THREE);
 if(!school?.isGroup)throw Error('3D school needs a Group');
 school.position.set(positions.school.x,0,positions.school.z);root.add(school);
 footprints.push({x:positions.water.x,z:positions.water.z+.5,w:4.8,shadow:.30,shadowH:1.32,k:.25});
 footprints.push({x:positions.school.x,z:positions.school.z+.65,w:9.0,shadow:.26,shadowH:2.15,k:.30});
 function plaque(x,z,label){
   const pic=graphic(420,150,c=>{
    c.lineJoin='round';c.strokeStyle='#684f3d';c.lineWidth=7;
    c.fillStyle='#9b6b42';for(const X of [113,295]){c.beginPath();c.roundRect(X,59,15,77,5);c.fill();c.stroke();}
    c.beginPath();c.roundRect(27,21,366,74,14);c.fillStyle='#b78255';c.fill();c.stroke();
    c.beginPath();c.roundRect(36,28,348,52,10);c.fillStyle='#f7dfa6';c.fill();
    c.textAlign='center';c.textBaseline='middle';c.font='850 30px "BG JP",system-ui';c.fillStyle='#46554a';c.fillText(label,210,55);
   });
   tileset.plaque={m:mat(THREE.SpriteMaterial,{map:texture(pic),alphaTest:.41,transparent:false,toneMapped:false}),aspect:420/150};
   const sign=stamp('plaque',x,z,3.0,{anchor:.16,flat:1,shadow:.22});
   sign.position.y=.49;
 }
 plaque(maze.start.x-2.35,maze.start.z+.26,'前庭入口');
 const extent=radius+21;
 const groundGeo=new THREE.PlaneGeometry(extent*2,extent*2);geometries.push(groundGeo);
 const ground=new THREE.Mesh(groundGeo,mat(THREE.MeshBasicMaterial,{map:texture(floor(2048,2048,cells,cell,footprints,extent)),toneMapped:false}));
 ground.rotation.x=-Math.PI/2;ground.position.y=-.036;root.add(ground);
 const sh=new THREE.Mesh(groundGeo,mat(THREE.ShadowMaterial,{opacity:.23,depthWrite:false}));
 sh.rotation.x=-Math.PI/2;sh.receiveShadow=true;sh.position.y=.004;root.add(sh);
 function update(dt=0,focus=null){
  waterfall.update(dt);
  if(!hero?.pos||!camera)return;
  const a=camera.position,p=focus||hero.pos,vx=p.x-a.x,vz=p.z-a.z,len=vx*vx+vz*vz;
  for(const o of occluders){
   const t=((o.position.x-a.x)*vx+(o.position.z-a.z)*vz)/(len||1);
   const d=Math.hypot(o.position.x-a.x-t*vx,o.position.z-a.z-t*vz);
   o.visible= !(t>.49&&t<.99&&d<o.scale.x*.39&&a.y*(1-t)+.8*t<o.scale.y*.89);
  }
 }
 function dispose(){
  waterfall.dispose();
  const sg=new Set(),sm=new Set(),st=new Set();
  school.traverse(o=>{if(o.geometry)sg.add(o.geometry);for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m){sm.add(m);if(m.map)st.add(m.map);}});
  sg.forEach(x=>x.dispose());sm.forEach(x=>x.dispose());st.forEach(x=>x.dispose());
  root.removeFromParent();for(const o of textures)o.dispose();for(const o of materials)o.dispose();for(const o of geometries)o.dispose();
  if(world.parent===scene){art.forEach(([o,v])=>o.visible=v);maze.group.visible=oldMaze;scene.background=oldBg;scene.fog=oldFog;if(sun&&oldSun)sun.color.copy(oldSun);}
 }
 return {root,update,dispose,landmarks:positions,stats:{art:'Actual 3D waterfall/rock bank and school, stylized cel colors',walkCells:cells.length,borderStickers:rimCount,trees:seen.length,landmarks:true}};
}
