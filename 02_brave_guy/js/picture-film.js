import { assetPath } from './asset-paths.js';
// Source coordinates are measured from the original 1024x1536 WebP atlases.
// Heights exclude the burned-in gutters and their antialiased transition rows.
const BOSS_TRANSFORMATION_PANELS={
 awakening_armor_a:[[0,509],[514,474],[993,543]],
 awakening_armor_b:[[0,436],[445,480],[934,602]],
 incubus_firststrike:[[0,509],[514,507],[1026,510]]
};
const PANEL_ROWS={...BOSS_TRANSFORMATION_PANELS,victory_qianBiz:[[0,534],[537,520],[1060,476]]};

// Native-size, lossless illustration playback. No WebGL or character models.
export function createPictureFilm(root,className='picture-film'){
 const canvas=document.createElement('canvas');canvas.className=className;canvas.hidden=true;canvas.setAttribute('aria-hidden','true');root.prepend(canvas);
 const ctx=canvas.getContext('2d'),cache=new Map();let stamp='';
 const bounds=f=>PANEL_ROWS[f.file]?.[f.row||0];
 const header=root.querySelector('.cinema-top'),caption=root.querySelector('.cinema-caption');
 const url=file=>assetPath(`assets/runtime/lossless/pic/cinematics/${file}.webp`);
 async function prepare(files){
  const wanted=new Set(files);for(const key of cache.keys())if(!wanted.has(key))cache.delete(key);
  await Promise.all([...wanted].map(async file=>{if(!cache.has(file)){const image=new Image();image.src=url(file);cache.set(file,image);}const image=cache.get(file);try{await image.decode();if(!image.naturalWidth)throw Error('Empty image');}catch(error){cache.delete(file);throw error;}}));
 }
 function start(){canvas.hidden=false;stamp='';root.dataset.artReady='true';}
 function stop(){canvas.hidden=true;stamp='';}
 function render(frames,time,{reduced=false,impact=0,dark=0,flash=0,color='#baff66',zoom=1}={}){
  const w=innerWidth,h=innerHeight,ratio=Math.min(devicePixelRatio||1,1.5),signature=`${w}:${h}:${ratio}:${frames.map(f=>f.file+':'+f.row).join(',')}:${reduced?'still':Math.floor(time*30)}`;
  if(stamp===signature)return;stamp=signature;
  if(canvas.width!==Math.round(w*ratio)||canvas.height!==Math.round(h*ratio)){canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);}
  ctx.setTransform(ratio,0,0,ratio,0,0);ctx.fillStyle='#03070b';ctx.fillRect(0,0,w,h);
  const first=frames[0],bg=cache.get(first.file);if(!bg?.naturalWidth)return;
  const br=bounds(first),bh=br?br[1]:bg.height/(first.rows||3),by=br?br[0]:(first.row||0)*bh,bs=Math.max(w/bg.width,h/bh);
  ctx.globalAlpha=.18;ctx.drawImage(bg,0,by,bg.width,bh,(w-bg.width*bs)/2,(h-bh*bs)/2,bg.width*bs,bh*bs);ctx.globalAlpha=1;
  const protectedFrame=Object.hasOwn(BOSS_TRANSFORMATION_PANELS,first.file);
  // Fit the complete panel between the live header and localized dialogue, even on a short screen.
  const top=protectedFrame?Math.max(h*.14,header.offsetTop+header.offsetHeight+8):h*.14;
  const area=protectedFrame?Math.max(1,caption.offsetTop-10-top):h*.51;
  frames.forEach((f,i)=>{
   const im=cache.get(f.file),region=bounds(f),sh=region?region[1]:im.height/(f.rows||3),sy=region?region[0]:(f.row||0)*sh,boxH=area/frames.length;
   const motionScale=reduced?1:1+Math.sin(time*.6)*.008;
   const safeScale=Math.min((w*.96-2)/im.width,(boxH-2)/sh);
   const scale=protectedFrame?Math.max(.001,Math.min(safeScale,safeScale*(reduced?1:.955*zoom*motionScale))):Math.min(w*.96/im.width,boxH/sh)*zoom*motionScale;
   const dw=im.width*scale,dh=sh*scale,cx=w*.5,cy=top+boxH*(i+.5),shake=reduced?0:Math.sin(time*91)*impact*(protectedFrame?Math.min(9,Math.max(0,(w-dw)/2-1)):9);
   const left=cx-dw/2+shake;
   ctx.save();ctx.beginPath();ctx.rect(0,top+i*boxH,w,boxH);ctx.clip();ctx.drawImage(im,0,sy,im.width,sh,left,cy-dh/2,dw,dh);
   ctx.strokeStyle=color;ctx.lineWidth=2;ctx.globalAlpha=.8;ctx.strokeRect(protectedFrame?left:cx-dw/2,cy-dh/2,dw,dh);ctx.restore();
  });
  if(!reduced&&impact>0){ctx.strokeStyle=color;ctx.globalAlpha=impact*.6;ctx.lineWidth=2;for(let i=0;i<18;i++){const a=i*Math.PI/9;ctx.beginPath();ctx.moveTo(w*.5+Math.cos(a)*w*.45,h*.4+Math.sin(a)*h*.3);ctx.lineTo(w*.5+Math.cos(a)*w,h*.4+Math.sin(a)*h);ctx.stroke();}ctx.globalAlpha=1;}
  if(dark>0){ctx.fillStyle=`rgba(0,0,0,${dark})`;ctx.fillRect(0,0,w,h);}
  if(!reduced&&flash>0){ctx.fillStyle=`rgba(225,255,211,${flash})`;ctx.fillRect(0,0,w,h);}
 }
 return{prepare,start,stop,render};
}
