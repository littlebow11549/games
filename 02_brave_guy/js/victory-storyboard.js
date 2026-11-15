import { BOSS_STORYBOARDS } from './boss-storyboards.js?v=20261115fast';
// Pixel-identical delivery copies of archived art, composed at runtime; no new character art.
export function createVictoryStoryboard(root){
 const canvas=document.createElement('canvas');canvas.className='victory-storyboard';canvas.hidden=true;canvas.setAttribute('aria-hidden','true');root.prepend(canvas);
 const ctx=canvas.getContext('2d'),cache=new Map();let kinds=[],stamp='';
 const pose='assets/runtime/lossless/pic/transform/tf_pose.webp',fist='assets/runtime/lossless/pic/transform/tf_glove.webp';
 const bossURL=key=>'assets/runtime/lossless/pic/cinematics/'+(BOSS_STORYBOARDS[key].files?.at(-1)||`boss_${key}_storyboard`)+'.webp';
 async function load(url){if(!cache.has(url)){const image=new Image();image.src=url;cache.set(url,image);}const image=cache.get(url);try{await image.decode();if(!image.naturalWidth)throw Error('Empty artwork');return image;}catch(error){cache.delete(url);throw error;}}
 async function prepare(keys){const urls=[pose,fist,...keys.map(bossURL)];for(const key of cache.keys())if(!urls.includes(key))cache.delete(key);await Promise.all(urls.map(load));}
 function start(keys){kinds=keys;stamp='';canvas.hidden=false;root.dataset.pictureVictory='true';}
 function stop(){canvas.hidden=true;delete root.dataset.pictureVictory;delete root.dataset.victoryShot;}
 function panel(image,source,x,y,w,h,angle=0,zoom=1){
  ctx.save();ctx.translate(x+w/2,y+h/2);ctx.rotate(angle);ctx.beginPath();ctx.rect(-w/2,-h/2,w,h);ctx.clip();
  const [sx,sy,sw,sh]=source,scale=Math.max(w/sw,h/sh)*zoom;ctx.drawImage(image,sx,sy,sw,sh,-sw*scale/2,-sh*scale/2,sw*scale,sh*scale);ctx.restore();
  ctx.save();ctx.translate(x+w/2,y+h/2);ctx.rotate(angle);ctx.strokeStyle='#101b18';ctx.lineWidth=8;ctx.strokeRect(-w/2,-h/2,w,h);ctx.strokeStyle='#ffe67e';ctx.lineWidth=2;ctx.strokeRect(-w/2+4,-h/2+4,w-8,h-8);ctx.restore();
 }
 function hero(url,x,y,w,h,angle,zoom){const im=cache.get(url);panel(im,[0,0,im.width,im.height],x,y,w,h,angle,zoom);}
 function boss(key,row,x,y,w,h,angle=0,zoom=1){const im=cache.get(bossURL(key)),rows=BOSS_STORYBOARDS[key].files?1:3;panel(im,[0,(rows===1?0:row)*im.height/rows,im.width,im.height/rows],x,y,w,h,angle,zoom);}
 function render(time,reduced){
  const w=innerWidth,h=innerHeight,beat=Math.min(2,Math.floor(time/2)),local=time-beat*2,key=`${w}:${h}:${devicePixelRatio}:${reduced?beat:Math.floor(time*30)}`;if(stamp===key)return;stamp=key;
  const ratio=Math.min(devicePixelRatio||1,1.5);if(canvas.width!==Math.round(w*ratio)||canvas.height!==Math.round(h*ratio)){canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);}
  ctx.setTransform(ratio,0,0,ratio,0,0);ctx.fillStyle='#061c14';ctx.fillRect(0,0,w,h);root.dataset.victoryShot=['charge','impact','finish'][beat];
  const top=h*.13,bottom=h*.66,area=bottom-top,shake=reduced?0:beat===1?Math.sin(time*55)*3:0;
  ctx.save();ctx.translate(shake,0);
  if(beat===0){
   hero(pose,w*.04,top,w*.92,area*.64,-.025,reduced?1:1+local*.035);
   kinds.forEach((k,i)=>boss(k,1,w*.05+i*w*.9/kinds.length,top+area*.65,w*.9/kinds.length,area*.32,.025));
  }else if(beat===1){
   kinds.forEach((k,i)=>boss(k,2,w*.04+i*w*.92/kinds.length,top,w*.92/kinds.length,area*.65,(reduced?0:Math.sin(time*28)*.025),1.1));
   const jab=reduced?0:Math.sin(local*17)*w*.035;
   hero(fist,w*.02+jab,top+area*.38,w*.96,area*.58,-.08,1.08);
   // Ink impact star sits on the seam between the two illustrated panels.
   ctx.save();ctx.translate(w*.64,top+area*.41);ctx.beginPath();for(let i=0;i<24;i++){const a=i*Math.PI/12,r=(i%2? .055:.13)*w;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);}ctx.closePath();const glow=ctx.createRadialGradient(-8,-12,0,0,0,w*.13);glow.addColorStop(0,'#fffbd4');glow.addColorStop(.4,'#ffd957');glow.addColorStop(1,'#f45b18');ctx.fillStyle=glow;ctx.fill();ctx.lineWidth=4;ctx.strokeStyle='#fff0b5';ctx.stroke();ctx.restore();
  }else{
   hero(pose,w*.04,top,w*.92,area,.015,reduced?1:1.08-local*.025);
   kinds.forEach((k,i)=>{const fly=reduced?.8:Math.min(1,local/1.4);const size=w*(.32-fly*.13);boss(k,2,i? w-size+fly*w*.2:-fly*w*.2,top+area*.28-fly*area*.18,size,size*.65,(i?1:-1)*fly*.55);});
  }
  if(beat>0){
   ctx.save();ctx.translate(w*.5,top+area*.8);ctx.rotate(-.22+(reduced?0:Math.sin(time*3)*.05));
   for(let i=0;i<2;i++){ctx.beginPath();ctx.ellipse(0,-i*area*.09,w*(.44-i*.06),area*.11,0,(reduced?0:time*.7)+i*Math.PI,(reduced?0:time*.7)+i*Math.PI+4.8);ctx.lineCap='round';for(const [width,color] of [[13,'#e95416'],[8,'#ffb432'],[2,'#fff9c9']]){ctx.lineWidth=width;ctx.strokeStyle=color;ctx.stroke();}}
   ctx.restore();
  }
  ctx.restore();
 }
 return {prepare,start,stop,render};
}
