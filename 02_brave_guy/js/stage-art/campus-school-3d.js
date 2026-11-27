// Sunny campus | genuine closed-volume, two-storey school. +Z is the front facade.
// All hard-surface details are vertex-tinted static geometry; no house sprite.
export function makeSchool(THREE,{label='教學大樓',subtitle='CAMPUS CLASSROOMS'}={}){
 const root=new THREE.Group();
 root.name='Campus Teaching Block | two-storey 3D';
 const p=[],c=[];
 const C={
  ink:0x563a39,deep:0x493941,brickDark:0xac4b41,brick:0xd9634a,roof:0xe58a62,roofTop:0xf5a879,
  tile:0xbb7770,brickLight:0xf28a58,cream:0xffdb9b,light:0xffeab8,plaster:0xf6c989,shade:0xe0aa76,
  stone:0xc39888,step:0xe3bc9a,stepLight:0xf1cdae,stoneDark:0x9a7780,floor:0xdcb28e,
  teal:0x43888a,tealLight:0x72b4a4,tealBright:0xa2d5b1,tealDark:0x2f666a,
  glassDark:0x3b829c,glass:0x64c5de,glassHi:0xb0eaf2,glare:0xe5fbf2,curtain:0xf9cfa3,
  knob:0xf2ba55,wood:0xa96750,woodDark:0x79483a,woodHi:0xc48760,
  leaf:0x83ac52,leafDark:0x568a47,leafHi:0xb7cc65
 };
 const cc=new Map(),rawBox=new THREE.BoxGeometry(1,1,1),unit=rawBox.toNonIndexed();
 const {position:pos,normal:norm}=unit.attributes;
 const color=(hex,t)=>{
  const key=hex+'/'+t;
  if(!cc.has(key))cc.set(key,new THREE.Color(hex).multiplyScalar(t));
  return cc.get(key);
 };
 function vertex(x,y,z,hex,t=1){const q=color(hex,t);p.push(x,y,z);c.push(q.r,q.g,q.b);}
 function poly(points,hex,t=1,reverse=false){
  // Convex polygon triangulated as a fan. Reverse the winding for the opposing facade.
  for(let i=1;i<points.length-1;i++)for(const q of reverse?[points[0],points[i+1],points[i]]:[points[0],points[i],points[i+1]])vertex(...q,hex,t);
 }
 function box(x,y,z,w,h,d,hex,ang=0,s=1,pitch=0){
  const ss=Math.sin(ang),cs=Math.cos(ang),sp=Math.sin(pitch),cp=Math.cos(pitch);
  for(let i=0;i<pos.count;i++){
   const u=pos.getX(i)*w,v=pos.getZ(i)*d,sy=pos.getY(i)*h;
   const xx=cs*u+ss*v,zz=-ss*u+cs*v;
   const nx=cs*norm.getX(i)+ss*norm.getZ(i),nz0=-ss*norm.getX(i)+cs*norm.getZ(i);
   const ny=cp*norm.getY(i)-sp*nz0,nz=sp*norm.getY(i)+cp*nz0;
   const tone=ny>.5?1.055:ny<-.5?.66:nz>.5?1.01:nz<-.5?.84:nx<-.5?.94:.81;
   vertex(x+xx,y+cp*sy-sp*zz,z+sp*sy+cp*zz,hex,tone*s);
  }
 }
 function face(x,y,z,w,h,hex,dir=1,bevel=.045){
  const a=w/2,b=h/2,r=Math.min(bevel,a*.38,b*.38);
  const pts=[[-a+r,-b],[a-r,-b],[a,-b+r],[a,b-r],[a-r,b],[-a+r,b],[-a,b-r],[-a,-b+r]];
  poly(pts.map(([u,v])=>[x+u*dir,y+v,z]),hex,dir>0?1:.96);
 }
 function stripe(x,y,z,pts,hex,dir=1){
  const area=pts.reduce((a,[px,py],i)=>{const [qx,qy]=pts[(i+1)%pts.length];return a+px*qy-qx*py;},0);
  poly(pts.map(([u,v])=>[x+u*dir,y+v,z]),hex,dir>0?1:.94,area<0);
 }
 function lintel(x,y,z,w,dir=1){box(x,y,z,w,.072,.13,C.woodDark);box(x,y+.046,z+dir*.018,w-.05,.045,.114,C.light);}
 function windowAt(x,y,z,dir=1,width=1.29,height=1.00,split=true){
  const d=f=>z+dir*f;
  box(x,y-.015,d(.018),width+.105,height+.09,.122,C.shade);
  face(x,y,d(.087),width+.085,height+.061,C.ink,dir,.073);
  face(x,y,d(.096),width,height-.022,C.woodDark,dir,.061);
  face(x,y+.007,d(.107),width-.118,height-.155,C.tealDark,dir,.045);
  face(x,y+.019,d(.114),width-.165,height-.202,C.glassDark,dir,.039);
  face(x,y+.049,d(.120),width-.195,height-.286,C.glass,dir,.035);
  const w=(width-.23)*.5, h=(height-.23)*.5;
  stripe(x,y,d(.127),[[-w,h*.68],[w*.96,h*.68],[w*.96,h*.91],[-w,h*.91]],C.glassHi,dir);
  stripe(x,y,d(.131),[[-w,-h*.35],[-w,-h*.03],[-w*.12,h*.72],[.15*w,h*.72]],C.glare,dir);
  stripe(x,y,d(.133),[[w*.33,-h*.81],[w*.53,-h*.81],[w,h*.11],[w,h*.44]],C.glassHi,dir);
  // Curtains have embedded silhouettes rather than a printed window quad.
  stripe(x,y,d(.138),[[-w,h*.74],[-w,-h*.66],[-w*.57,-h*.66],[-w*.76,h*.74]],C.curtain,dir);
  stripe(x,y,d(.138),[[w*.75,h*.74],[w*.55,-h*.66],[w,-h*.66],[w,h*.74]],C.curtain,dir);
  if(split){box(x,y+.014,d(.129),.056,height-.146,.048,C.ink);box(x+dir*.009,y+.023,d(.154),.020,height-.198,.012,C.tealLight);}
  box(x,y+height*.22,d(.138),width-.15,.051,.055,C.tealDark);
  box(x,y+height*.23+.011,d(.169),width-.18,.014,.025,C.tealBright);
  box(x,y-height*.486,d(.091),width+.146,.087,.242,C.woodDark);
  box(x,y-height*.486+.037,d(.12),width+.134,.043,.241,C.light);
 }
 function doors(x,z,dir){
  const d=f=>z+dir*f, w=1.61;
  box(x,1.28,d(.054),w+.16,1.78,.154,C.ink);
  box(x,1.28,d(.126),w,1.657,.084,C.woodDark);
  for(const side of [-1,1]){
   const u=x+side*.386;
   face(u,1.29,d(.176),.730,1.56,C.wood,dir,.045);
   face(u,1.32,d(.190),.647,1.45,C.woodHi,dir,.037);
   face(u,1.61,d(.204),.548,.55,C.ink,dir,.044);
   face(u,1.64,d(.218),.469,.45,C.glassDark,dir,.026);
   stripe(u,1.64,d(.223),[[-.211,-.09],[.102,.197],[.191,.197],[-.107,-.196],[-.211,-.196]],C.glassHi,dir);
   for(const shift of [-.142,.142])box(u+shift,.975,d(.216),.018,.372,.022,C.woodDark);
   box(x+side*.105,1.299,d(.237),.092,.171,.052,C.ink);
   box(x+side*.105,1.303,d(.274),.041,.140,.038,C.knob);
  }
  lintel(x,2.227,d(.086),w+.31,dir);
 }
 function disk(x,y,z,r,thick,hex,dir=1,segments=32){
  const a=[],b=[];
  for(let i=0;i<segments;i++){
   const theta=i/segments*Math.PI*2;
   const u=x+Math.cos(theta)*r,v=y+Math.sin(theta)*r;
   a.push([u,v,z-thick/2]);b.push([u,v,z+thick/2]);
  }
  poly(a,hex,.82,true);poly(b,hex,dir>0?1:.92);
  for(let i=0;i<segments;i++){const j=(i+1)%segments;poly([a[i],a[j],b[j],b[i]],hex,.86);}
 }
 const LN=(x0,y0,x1,y1,z,w,hex)=>{
  const dx=x1-x0,dy=y1-y0,l=Math.hypot(dx,dy),a=-dy/l*w/2,b=dx/l*w/2;
  poly([[x0+a,y0+b,z],[x0-a,y0-b,z],[x1-a,y1-b,z],[x1+a,y1+b,z]],hex);
 };
 function clock(x,y,z){
  disk(x,y,z,.331,.12,C.ink);
  disk(x,y,z+.06,.285,.048,C.brickLight);
  disk(x,y,z+.09,.235,.032,C.light);
  for(let i=0;i<12;i++){
   const a=i/12*Math.PI*2,dx=Math.cos(a),dy=Math.sin(a);
   LN(x+dx*.181,y+dy*.181,x+dx*.213,y+dy*.213,z+.111,i%3===0?.034:.018,C.ink);
  }
  LN(x,y,x+.064,y+.084,z+.113,.039,C.deep);
  LN(x,y,x+.125,y-.115,z+.114,.028,C.tealDark);
  disk(x,y,z+.113,.035,.018,C.brickDark);
 }
 // Broad squared-off institutional mass and whole rear/side walls.
 const X=-.31,Z=-.36,W=8.49,D=2.64,F=Z+D/2,B=Z-D/2;
 box(X,.095,Z,W+.35,.19,D+.34,C.ink);
 box(X,.192,Z,W+.32,.138,D+.32,C.stoneDark);
 box(X,.296,Z,W+.24,.132,D+.24,C.step);
 box(X,2.368,Z,W,4.048,D,C.shade);
 box(X,1.33,Z,W+.018,1.875,D+.028,C.cream);
 box(X,3.382,Z,W+.026,1.865,D+.033,C.light);
 box(X,.529,Z,W+.10,.33,D+.07,C.teal);
 box(X,.694,Z,W+.11,.068,D+.098,C.tealLight);
 box(X,2.354,Z,W+.16,.285,D+.13,C.brickDark);
 box(X,2.419,Z,W+.24,.118,D+.17,C.brickLight);
 box(X,2.49,Z,W+.21,.046,D+.14,C.light);
 for(const side of [-1,1]){
  const x=X+side*(W/2-.09);
  for(const z of [B-.008,F+.008]){
   box(x,2.315,z,.335,3.953,.147,C.woodDark);
   box(x,2.315,z+Math.sign(z-Z)*.055,.245,3.96,.102,C.plaster);
   box(x+side*.060,2.315,z+Math.sign(z-Z)*.113,.067,3.87,.049,C.light);
   box(x,2.42,z+Math.sign(z-Z)*.065,.28,.168,.112,C.brickLight);
  }
 }
 const bays=[-3.64,-2.0,-.29,1.40,3.08];
 for(const dir of [1,-1]){
  const z=dir===1?F:B;
  for(let i=0;i<5;i++){
   const x=bays[i];
   windowAt(x,3.423,z+dir*.018,dir,1.34,.96);
   if(dir===1&&i===2)doors(x,z,dir);
   else windowAt(x,1.43,z+dir*.018,dir,1.37,1.04);
  }
  for(const x of [-2.822,-1.139,.56,2.23]){
   box(x,2.981,z+dir*.036,.087,1.23,.071,C.plaster);
   box(x,.973,z+dir*.036,.067,.48,.066,C.plaster);
  }
  for(const x of [-4.315,3.706]){
   box(x,1.98,z+dir*.041,.088,.08,.081,C.brickDark);
   box(x,3.97,z+dir*.041,.088,.087,.081,C.brickDark);
  }
 }
 // Side and rear facades are not a flat extrusion: side glazing, service door, downpipes.
 for(const side of [-1,1]){
  const x=X+side*W/2;
  const sidePane=(y,z,w,h)=>{
   box(x+side*.053,y,z,.112,h+.106,w+.10,C.ink);
   box(x+side*.098,y+.016,z,.058,h-.025,w-.04,C.woodDark);
   box(x+side*.139,y+.064,z,.046,h-.178,w-.144,C.glass);
   box(x+side*.168,y+h*.219,z,.023,.041,w-.145,C.glassHi);
   box(x+side*.166,y,z,.023,.071,w-.10,C.tealDark);
   box(x+side*.177,y+.05,z,.019,h-.165,.052,C.tealDark);
   box(x+side*.106,y-h*.514,z,.239,.074,w+.103,C.light);
  };
  for(const off of [-.715,.71]){
   sidePane(3.44,Z+off,.99,.96);
   if(side<0)sidePane(1.45,Z+off,1.01,1.02);
  }
  if(side>0){
   box(x+.041,1.28,Z-.67,.074,1.7,.99,C.ink);
   box(x+.084,1.30,Z-.67,.052,1.63,.87,C.teal);
   box(x+.12,1.55,Z-.67,.031,.49,.69,C.tealDark);
   box(x+.145,1.56,Z-.67,.032,.387,.591,C.glassHi);
  }
  for(const off of [-1.10,1.08]){
   box(x+side*.045,2.399,Z+off,.114,3.641,.088,C.woodDark);
   box(x+side*.084,2.457,Z+off,.088,3.515,.042,C.plaster);
  }
 }
 // Flat stepped roof and low masonry parapets; a short rooftop service bay.
 box(X,4.394,Z,W+.22,.194,D+.11,C.ink);
 box(X,4.478,Z,W+.41,.151,D+.27,C.brickDark);
 box(X,4.540,Z,W+.48,.092,D+.34,C.brickLight);
 box(X,4.597,Z,W+.29,.09,D+.14,C.roofTop);
 const rw=W+.24,rd=D+.13;
 for(const side of [-1,1]){
  box(X,4.738,Z+side*(rd/2-.046),rw,.263,.21,C.brickDark);
  box(X,4.797,Z+side*(rd/2-.016),rw+.065,.131,.201,C.brick);
  box(X,4.874,Z+side*(rd/2-.009),rw+.143,.065,.254,C.roofTop);
  box(X+side*(rw/2-.057),4.742,Z,.214,.268,rd-.04,C.brickDark);
  box(X+side*(rw/2-.061),4.862,Z,.260,.067,rd+.11,C.roofTop);
 }
 for(let i=0;i<8;i++)box(X,4.648,Z-.92+i*.254,W-.44,.011,.023,C.tile);
 // Small rooftop school pennant breaks the heavy roofline without adding
 // a third render mesh.
 const flagX=X-2.65,flagZ=Z-.75;
 box(flagX,4.733,flagZ,.35,.17,.31,C.step);
 box(flagX,5.27,flagZ,.068,1.12,.068,C.woodDark);
 box(flagX,5.822,flagZ,.112,.093,.105,C.knob);
 const banner=[[.054,-.16],[.45,-.235],[.81,-.025],[.80,.209],[.46,.088],[.05,.147]];
 stripe(flagX,5.555,flagZ+.013,banner,C.brickDark);
 stripe(flagX,5.555,flagZ+.019,[[.068,-.111],[.433,-.181],[.755,-.016],[.75,.149],[.456,.036],[.067,.102]],C.brickLight);
 stripe(flagX,5.555,flagZ+.026,[[.249,.026],[.300,.079],[.376,.032],[.304,-.047]],C.cream);
 box(X+2.62,4.731,Z-.36,1.247,.181,.899,C.brickDark);
 box(X+2.62,4.885,Z-.36,1.176,.306,.802,C.cream);
 box(X+2.62,5.054,Z-.36,1.30,.093,.921,C.brick);
 box(X+2.62,5.111,Z-.36,1.275,.051,.918,C.roofTop);
 box(X+2.62,4.89,Z+.073,.508,.241,.044,C.tealDark);
 for(const q of [-1,0,1])box(X+2.62+q*.13,4.892,Z+.106,.036,.153,.030,C.glassHi);
 // Prominent circulation corridor; deep projecting floor, posts and open rails.
 const zBal=1.335,wBal=8.53;
 box(X,2.225,zBal,wBal,.252,.851,C.ink);
 box(X,2.327,zBal,wBal+.128,.145,.94,C.brick);
 box(X,2.407,zBal,wBal+.154,.056,.971,C.light);
 box(X,2.452,zBal,wBal-.05,.045,.821,C.floor);
 const posts=[-4.485,-2.818,-1.145,.545,2.217,3.89];
 for(const x of posts){
  box(x,.425,1.624,.325,.215,.332,C.woodDark);
  box(x,.496,1.624,.289,.218,.279,C.plaster);
  box(x,1.333,1.624,.188,1.581,.215,C.wood);
  box(x-.039,1.319,1.743,.052,1.597,.034,C.cream);
  box(x,2.126,1.624,.300,.127,.286,C.ink);
  box(x,2.932,1.741,.107,.972,.117,C.tealDark);
  box(x,3.376,1.746,.140,.102,.143,C.tealBright);
 }
 const postMm=posts.at(-1)-posts[0],postX=(posts.at(-1)+posts[0])/2;
 box(postX,2.72,1.755,postMm,.074,.084,C.tealDark);
 box(postX,3.280,1.755,postMm,.088,.119,C.tealDark);
 box(postX,3.339,1.752,postMm+.12,.074,.132,C.tealBright);
 for(let i=0;i<posts.length-1;i++){
  for(let s=1;s<=5;s++){const x=posts[i]+(posts[i+1]-posts[i])*s/6;box(x,2.999,1.755,.046,.553,.050,C.teal);}
 }
 // Classroom-panel clock and plaque between the broad horizontal lines.
 box(-.29,2.962,1.781,2.53,.505,.112,C.ink);
 box(-.29,2.967,1.848,2.43,.428,.074,C.woodDark);
 box(-.29,2.972,1.897,2.343,.388,.042,C.cream);
 box(-.29,4.238,F+.085,1.02,.555,.185,C.brickDark);
 box(-.29,4.238,F+.183,.902,.515,.066,C.plaster);
 clock(-.29,4.244,F+.248);
 // Ground entry steps, and genuine side external stair in the right-side bay.
 const stairX=4.493,run=3.24,startingZ=1.915,n=14,ground=.105;
 box(stairX,.060,.30,1.314,.120,3.58,C.stoneDark);
 for(let i=0;i<n;i++){
  const y=ground+i*.169, z=startingZ-i*run/n, span=run/n+.011;
  box(stairX,y/2,z,1.174,y,span,C.stoneDark);
  box(stairX,y-.016,z,1.206,.059,span,C.step);
  box(stairX,y+.016,z+.109,1.188,.041,.039,C.stepLight);
 }
 box(stairX,2.333,-1.413,1.271,.247,.575,C.woodDark);
 box(stairX,2.461,-1.402,1.287,.064,.572,C.stepLight);
 box(stairX,2.34,-1.707,1.30,.222,.132,C.brickDark);
 // Thin stair rails are segmented solids, their end points aligned to each landing.
 for(const sx of [stairX-.548,stairX+.54]){
  for(const i of [0,3,6,9,12,14]){
   const z=startingZ-i*run/n;
   const y=ground+i*.169;
   box(sx,y+.38,z,.072,.744,.080,C.tealDark);
   box(sx,y+.746,z,.082,.048,.109,C.tealBright);
  }
  const dy=n*.169,dz=-run,railLen=Math.hypot(dy,dz),pitch=Math.atan2(-dy,dz);
  box(sx,ground+dy/2+.755,startingZ+dz/2,.090,.087,railLen+.162,C.tealDark,0,1,pitch);
  box(sx,ground+dy/2+.799,startingZ+dz/2,.094,.045,railLen+.16,C.tealBright,0,1,pitch);

 }
 // Stairhead service opening / upper exterior landing lies with the stair not the walkable level.
 box(X+W/2+.038,3.325,-1.287,.056,1.65,.75,C.ink);
 box(X+W/2+.081,3.351,-1.287,.055,1.57,.656,C.teal);
 box(X+W/2+.118,3.57,-1.287,.035,.53,.524,C.glass);
 box(X+W/2+.139,3.61,-1.287,.019,.065,.473,C.glassHi);
 for(const [i,depth] of [2.13,1.99,1.845].entries()){
  const y=.058+i*.068;
  box(-.29,y,depth,2.59-i*.12,y*2,.38,C.stoneDark);
  box(-.29,y*2+.008,depth,2.62-i*.12,.065,.39,i%2===0?C.stepLight:C.step);
 }
 // Bulletin boards on both ground-level wings, visible through the columns.
 for(const [qx,shade] of [[-2.83,C.tealDark],[2.25,C.woodDark]]){
  box(qx,.966,F+.073,.51,.355,.111,C.ink);
  box(qx,.970,F+.134,.456,.301,.041,shade);
  for(const [off,hue,tilt] of [[-.102,C.cream,.07],[.041,C.light,-.09],[.124,C.brickLight,.06]]){
   const u=qx+off;box(u,.970,F+.161,.125,.159,.012,hue,tilt);
   box(u,1.032,F+.177,.022,.024,.014,C.knob);
  }
 }
 // Entry planters are near posts but inside the art footprint.
 for(const cx of [-3.16,2.96]){
  const cz=1.968;
  box(cx,.19,cz,.84,.363,.467,C.woodDark);
  box(cx,.31,cz,.891,.103,.496,C.brick);
  box(cx,.363,cz,.810,.066,.474,C.plaster);
  for(let i=0;i<4;i++){
   const x=cx+(i-1.5)*.181,y=.48+(i%2)*.073;
   box(x,y,cz,.262,.258,.369,i%2?C.leaf:C.leafDark,.25-i*.34);
   box(x,y+.110,cz+.029,.185,.075,.218,i%2?C.leafHi:C.leaf,.14+i*.18);
  }
 }
 rawBox.dispose();unit.dispose();
 const geom=new THREE.BufferGeometry();
 geom.setAttribute('position',new THREE.Float32BufferAttribute(p,3));
 geom.setAttribute('color',new THREE.Float32BufferAttribute(c,3));
 geom.computeBoundingBox();geom.computeBoundingSphere();
 const material=new THREE.MeshBasicMaterial({vertexColors:true,toneMapped:false});
 const painted=new THREE.Mesh(geom,material);
 painted.name='School | painted shell, classrooms, corridor and stairs';
 painted.castShadow=true;
 root.add(painted);

 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=170;
 const ctx=canvas.getContext('2d');
 ctx.fillStyle='#ffe8b3';ctx.fillRect(0,0,1024,170);
 ctx.strokeStyle='#b68156';ctx.lineWidth=8;ctx.strokeRect(7,7,1010,156);
 ctx.strokeStyle='#eac88e';ctx.lineWidth=2;ctx.strokeRect(18,18,988,134);
 ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#244e54';ctx.font='950 98px system-ui, sans-serif';
 ctx.fillText(label,512,74,842);
 ctx.font='800 25px system-ui, sans-serif';ctx.fillStyle='#70504d';ctx.fillText(subtitle,512,133,650);
 for(const u of [117,907]){
  ctx.fillStyle='#c96c4d';ctx.beginPath();ctx.moveTo(u,57);ctx.lineTo(u+16,73);ctx.lineTo(u,89);ctx.lineTo(u-16,73);ctx.fill();
 }
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;
 const sign=new THREE.Mesh(new THREE.PlaneGeometry(2.32,.394),new THREE.MeshBasicMaterial({map:tex,toneMapped:false}));
 sign.position.set(-.29,2.973,1.925);sign.rotation.x=-.055;sign.name='School | readable teaching block plaque';
 root.add(sign);
 const bounds=new THREE.Box3().setFromObject(root);
 root.userData.school={floors:2,front:'+Z',windowBays:5,worldDimensions:bounds.getSize(new THREE.Vector3()).toArray(),triangles:p.length/9+2,drawMeshes:2};
 return root;
}
