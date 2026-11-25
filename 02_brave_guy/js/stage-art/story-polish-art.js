import {loadStageAtlas} from './stage-textures.js?v=20261125perf1';
// Original chibi environment art. Four 2×2 atlases; divide maps once, share across visits.
const cv=(w,h)=>Object.assign(document.createElement('canvas'),{width:w,height:h});
function crop(img,j){
 const w=Math.floor(img.width/2),h=Math.floor(img.height/2),out=cv(w,h),ctx=out.getContext('2d',{willReadFrequently:true});
 const pad=5;ctx.drawImage(img,j%2*w+pad,Math.floor(j/2)*h+pad,w-pad*2,h-pad*2,pad,pad,w-pad*2,h-pad*2);
 const p=ctx.getImageData(0,0,w,h).data,b=[w,h,-1,-1],grid=3;
 for(let y=0;y<h;y+=grid)for(let x=0;x<w;x+=grid)if(p[(y*w+x)*4+3]>135){
   b[0]=Math.min(b[0],x);b[1]=Math.min(b[1],y);b[2]=Math.max(b[2],x);b[3]=Math.max(b[3],y);
 }
 if(b[2]-b[0]<10||b[3]-b[1]<10)throw Error('Missing atlas quadrant '+j);
 const [x,y]=[Math.max(0,b[0]-7),Math.max(0,b[1]-7)],W=Math.min(w,b[2]+8)-x,H=Math.min(h,b[3]+8)-y;
 const trim=cv(W,H);trim.getContext('2d').drawImage(out,x,y,W,H,0,0,W,H);
 return trim;
}
const images={};
const lookup={
 '1-0':['school',0,0,3.8],'1-2':['school',1,1,4.30],'1-3':['school',2,2,3.80],'1-4':['school',3,3,4.85],
 '2-1':['wild',0,0,5.05],'2-2':['wild',1,2,5.05],
 '3-0':['office',0,0,4.40],'3-1':['office',1,1,4.60],'3-2':['office',2,2,4.75],'3-3':['office',3,3,4.65],
 '3-4':['end',0,0,4.20],'3-6':['end',1,1,4.35],'3-7':['end',2,2,4.65],'3-5':['end',3,3,4.85],
 '4-1':['wild',3,3,4.90]};
export async function prepareStoryLandmarks(id){
 const [name]=lookup[id];
 if(images[name])return;
 const image=await loadStageAtlas('brave_guy_scene_'+name);
 if(!images[name])images[name]=[0,1,2,3].map(j=>crop(image,j));
}
export function placeStoryPaint(T,root,maze,id,camera,hero){
 const [id0,left,right,size]=lookup[id],stage=[];
 const matBy=new Map(),natural=id==='2-1'||id==='2-2',isBlank=(x,z)=>maze.blocked({x,z},.035);
 const candidates=[];
 for(let z=-13;z<=3;z+=.54)for(let x=.8;x<=12.8;x+=.35)candidates.push([x,z]);
 function pick(side,targetX,targetZ,w){
  const open=candidates
    .map(([x,z])=>({x:x*side,z,s:Math.hypot((x-targetX)*.98,(z-targetZ)*.82)}))
    .filter(({x,z})=>[-w*.31,0,w*.31].every(u=>[-.31,.34].every(v=>isBlank(x+u,z+v))));
  open.sort((a,b)=>a.s-b.s);
  return open.find(q=>stage.every(o=>Math.hypot(q.x-o.x,q.z-o.z)>2.9));
 }
 function mount({x,z},key,W){
  const im=images[id0][key];
  let m=matBy.get(key);if(!m){
   const map=new T.CanvasTexture(im);map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;
   matBy.set(key,m=new T.SpriteMaterial({map,alphaTest:.44,depthWrite:true,fog:false,toneMapped:false}));
  }
  const h=W*im.height/im.width*.90;
  const s=new T.Sprite(m);s.center.set(.5,.105);s.position.set(x,.16,z);s.scale.set(W,h,1);
  s.name='Hand-painted story landmark';
  root.add(s);stage.push({x,z,s,w:W,h});
 }
 const p=pick(-1,natural?6.0:3.4,natural?-6.3:-5.55,size);
 if(p)mount(p,left,size);
 const q=pick(1,natural?7.0:4.1,natural?-8.7:-8.0,size*.85);
 if(q)mount(q,right,size*.85);
 return {count:stage.length,entries:stage.map(o=>[o.x,o.z]),
  update(){
    const a=camera.position,b=hero.pos,dx=b.x-a.x,dz=b.z-a.z,k=dx*dx+dz*dz||1;
    for(const o of stage){
     const u=o.x-a.x,v=o.z-a.z,t=(u*dx+v*dz)/k;
     o.s.visible=!(t>.42&&t<1.09&&Math.hypot(u-t*dx,v-t*dz)<o.w*.41&&a.y*(1-t)+1.1*t<o.h*.93);
    }
  },
  dispose(){for(const m of matBy.values()){m.map.dispose();m.dispose();}}
 };
}
