// Dedicated narrative shots. Atlas rows are selected at draw time; original pixels stay intact.
const ROOT='assets/runtime/lossless/pic/cinematics/';
export const BOSS_INTRO_TIMING=Object.freeze({cuts:Object.freeze([4,8]),duration:12});
export const BOSS_STORYBOARDS={
 folaidiKing:{files:['folaidi_corridor','folaidi_eyes','folaidi_reveal'],...BOSS_INTRO_TIMING,fx:'mist',cues:[[0.0,'folaidi_flicker'],[0.323,'folaidi_tick'],[0.969,'folaidi_tick'],[1.615,'folaidi_tick'],[2.4,'folaidi_rise'],[4.2,'folaidi_reveal']]},
 qian:{...BOSS_INTRO_TIMING,fx:'coins',cues:[[0.0,'notify'],[2.4,'fan'],[4.2,'fan'],[4.429,'boss_slam']]},
 lan:{...BOSS_INTRO_TIMING,fx:'rings',cues:[[0.0,'boss_warn'],[2.4,'whistle'],[4.2,'boss_slam']]},
 nightmare:{...BOSS_INTRO_TIMING,fx:'glass',cues:[[0.0,'guilt_tick'],[2.4,'guilt_crack'],[4.2,'guilt_burst']]},
 midKing:{...BOSS_INTRO_TIMING,fx:'rubble',cues:[[0.0,'guilt_crack'],[2.4,'hit_heavy'],[4.2,'boss_slam']]},
 hell:{...BOSS_INTRO_TIMING,fx:'fire',cues:[[0.0,'beam_start'],[2.4,'folaidi_rise'],[4.2,'guilt_burst']]},
 kabanKing:{...BOSS_INTRO_TIMING,fx:'papers',cues:[[0.0,'punch_clock'],[1.292,'folaidi_tick'],[2.4,'guilt_crack'],[4.2,'folaidi_reveal']]},
 xinji:{...BOSS_INTRO_TIMING,fx:'feathers',cues:[[0.0,'bubble'],[2.4,'notify'],[3.05,'notify'],[4.2,'enemy_shot']]},
 baguashe:{...BOSS_INTRO_TIMING,fx:'gossip',cues:[[0.0,'bubble'],[2.4,'notify'],[3.2,'bubble'],[4.2,'fan']]},
 lanMgr:{...BOSS_INTRO_TIMING,fx:'stamp',cues:[[0.0,'punch_clock'],[2.4,'boss_warn'],[4.2,'boss_slam']]},
 ganqiaoFull:{...BOSS_INTRO_TIMING,fx:'rubble',cues:[[0.0,'quake'],[2.4,'folaidi_rise'],[4.2,'guilt_burst'],[4.771,'boss_slam']]},
 guan:{...BOSS_INTRO_TIMING,fx:'crown',cues:[[0.0,'boss_warn'],[2.4,'ui_confirm'],[4.2,'beam_end']]},
 incubus:{...BOSS_INTRO_TIMING,fx:'glass',cues:[[0.0,'folaidi_tick'],[1.076,'folaidi_tick'],[2.4,'guilt_crack'],[4.2,'guilt_burst']]},
};
// Retime existing sound accents to the readable 4-second dialogue beats.
for (const board of Object.values(BOSS_STORYBOARDS)) board.cues = board.cues.map(([at,sound]) => [at < 2.4 ? at*4/2.4 : at < 4.2 ? 4+(at-2.4)*4/1.8 : 8+(at-4.2), sound]);
export function createBossStoryboard(root,audioProvider){
 const canvas=document.createElement('canvas');canvas.className='cinema-storyboard';canvas.setAttribute('aria-hidden','true');root.prepend(canvas);
 const ctx=canvas.getContext('2d'),cache=new Map(),backdrop=document.createElement('canvas');let backKey=null;let key=null,definition=null,fired=new Set(),previous=-1;
 function images(k){const d=BOSS_STORYBOARDS[k];const files=d.files||[`boss_${k}_storyboard`];return files.map(file=>{if(!cache.has(file)){const im=new Image();im.src=ROOT+file+'.webp';cache.set(file,im);}return cache.get(file);});}
 function prepare(kinds){return Promise.all(kinds.filter(k=>BOSS_STORYBOARDS[k]).flatMap(k=>images(k).map(im=>im.decode().catch(error=>{for(const [file,image] of cache)if(image===im)cache.delete(file);throw error;}))));}
 function ready(){return key&&images(key).every(im=>im.complete&&im.naturalWidth>0);}
 function start(k){key=k;definition=BOSS_STORYBOARDS[k];fired=new Set();previous=-1;images(k);root.dataset.storyboard=k;root.dataset.artReady='false';root.dataset.beat='0';audioProvider()?.stopLoops?.();audioProvider()?.duckBgm?.(.38);}
 function stop(){key=null;definition=null;delete root.dataset.storyboard;delete root.dataset.beat;canvas.hidden=true;audioProvider()?.duckBgm?.(1);}
 function render(time,reduced,color){
  if(!definition)return;
  const d=definition,beat=time<d.cuts[0]?0:time<d.cuts[1]?1:2,local=time-(beat===0?0:d.cuts[beat-1]),length=(beat===2?d.duration:d.cuts[beat])-(beat===0?0:d.cuts[beat-1]);
  if(root.dataset.beat!==String(beat))root.dataset.beat=String(beat);const shot=beat===2?'hold':'reveal';if(root.dataset.shot!==shot)root.dataset.shot=shot;
  // Fire only cues crossed this frame. A skip/large seek never dumps old cues together.
  const due=d.cues.filter(([at],i)=>!fired.has(i)&&at<=time&&at>previous);
  for(const [at,sound] of due){const i=d.cues.findIndex(c=>c[0]===at&&c[1]===sound);fired.add(i);if(time-at<.2||previous<0&&at===0)audioProvider()?.sfx(sound);}
  previous=time;
  const list=images(key),im=list[list.length===1?0:beat];if(!im.complete||!im.naturalWidth){canvas.hidden=true;root.dataset.artReady='false';return;}
  canvas.hidden=false;if(root.dataset.artReady!=='true')root.dataset.artReady='true';
  const w=innerWidth,h=innerHeight,dpr=Math.min(devicePixelRatio||1,2);if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
  const sw=im.naturalWidth,sh=im.naturalHeight/(list.length===1?3:1),sy=list.length===1?beat*sh:0;
  // A subdued full-bleed extension sits behind the sharp frame on tall screens.
  const cacheKey=`${key}:${beat}:${w}:${h}`;
  if(backKey!==cacheKey){backKey=cacheKey;backdrop.width=w;backdrop.height=h;const bg=backdrop.getContext('2d');bg.fillStyle='#03080e';bg.fillRect(0,0,w,h);bg.globalAlpha=.32;bg.filter='blur(18px)';const back=Math.max(w/sw,h/sh);bg.drawImage(im,0,sy,sw,sh,(w-sw*back)/2,(h-sh*back)/2,sw*back,sh*back);}
  ctx.drawImage(backdrop,0,0,w,h);
  const tall=w/h<1,areaH=tall?Math.min(h*.63,w/.95):h*.82;
  const scale=(tall?Math.max(w/sw,areaH/sh):Math.min(w/sw,areaH/sh)),zoom=reduced?1:beat===0?1+local/length*.075:beat===1?1.06-local/length*.035:1.055-Math.min(local/.4,1)*.055;
  const dw=sw*scale*zoom,dh=sh*scale*zoom,cy=tall?h*.42:h*.43;
  const shake=!reduced?Math.sin(local*65)*Math.max(0,1-local/.4)*(beat===1?7:11):0;
  const pan=reduced?0:Math.sin(local/length*Math.PI)*Math.min(12,(dw-w)*.08)*(beat===1?-1:1);
  ctx.save();ctx.beginPath();ctx.rect(0,cy-areaH/2,w,areaH);ctx.clip();ctx.drawImage(im,0,sy,sw,sh,(w-dw)/2+pan+shake,cy-dh/2,dw,dh);ctx.restore();
  const edge=ctx.createLinearGradient(0,0,0,h);edge.addColorStop(0,'#02080fcc');edge.addColorStop(.18,'#02080f00');edge.addColorStop(.55,'#02080f00');edge.addColorStop(1,'#02080ff5');ctx.fillStyle=edge;ctx.fillRect(0,0,w,h);
  if(!reduced){
   ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=1.5;
   for(let i=0;i<22;i++){
    const seed=(i*137.508)%360,progress=(time*(d.fx==='fire'?.19:.095)+i/22)%1;
    const x=(seed/360*w+Math.sin(time*.7+i)*20),y=h*(1-progress),size=3+(i%5)*2;
    ctx.globalAlpha=(beat===2?.45:.19)*Math.sin(progress*Math.PI);
    ctx.save();ctx.translate(x,y);ctx.rotate(time*.3+i);
    if(['coins','crown','rings'].includes(d.fx)){ctx.beginPath();ctx.ellipse(0,0,size,size*.65,0,0,Math.PI*2);ctx.stroke();}
    else if(['papers','stamp','gossip'].includes(d.fx)){ctx.strokeRect(-size,-size*.6,size*2,size*1.2);}
    else if(d.fx==='glass'||d.fx==='rubble'){ctx.beginPath();ctx.moveTo(-size,size);ctx.lineTo(0,-size);ctx.lineTo(size,size*.4);ctx.closePath();ctx.stroke();}
    else if(d.fx==='mist'){ctx.globalAlpha*=.4;ctx.scale(5,1);const fog=ctx.createRadialGradient(0,0,0,0,0,size*2);fog.addColorStop(0,color);fog.addColorStop(1,'transparent');ctx.fillStyle=fog;ctx.fillRect(-size*2,-size*2,size*4,size*4);}
    else{ctx.beginPath();ctx.ellipse(0,0,size*.4,size,0,0,Math.PI*2);ctx.fill();}
    ctx.restore();
   }
   if(beat===2&&local<.65){ctx.globalAlpha=(1-local/.65)*.4;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(w/2,cy,w*(.1+local*1.6),h*(.07+local*.7),0,0,Math.PI*2);ctx.stroke();}
   ctx.restore();
  }
 }
 return{prepare,ready,start,stop,render};
}
