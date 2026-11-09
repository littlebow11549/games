/* Eight-frame character playback; no game rules live in this controller. */
(() => {
  'use strict';
  const root='assets/source/pic/character/';
  const clips={
    idle:{file:'char_anim_idle.png',fps:3,label:'Idle breathing'},
    happy:{file:'char_anim_happy.png',fps:8,label:'Happy'},
    sad:{file:'char_anim_sad.png',fps:5,label:'Sad'},
    celebrate:{file:'char_anim_celebrate.png',fps:8,label:'Celebrating'},
  };
  const cache=new Map();
  const nodes=[...document.querySelectorAll('[data-mascot]')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let state='idle',started=performance.now(),request=0,reactionTimer=0,stopped=false;
  function load(name){
    if(cache.has(name))return cache.get(name);
    const image=new Image();image.decoding='async';
    const entry={image,ready:false,failed:false};cache.set(name,entry);
    image.onload=()=>{entry.ready=true;if(name==='idle')Object.keys(clips).forEach(load);if(name===state)render(performance.now());};
    image.onerror=()=>{entry.failed=true;};image.src=root+clips[name].file;
    return entry;
  }
  function draw(node,image,frame){
    const canvas=node.querySelector('canvas');const ctx=canvas.getContext('2d');
    const sw=image.naturalWidth/4,sh=image.naturalHeight/2;
    const scale=Math.min(canvas.width/sw,canvas.height/sh);
    const dw=sw*scale,dh=sh*scale;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(image,(frame%4)*sw,Math.floor(frame/4)*sh,sw,sh,(canvas.width-dw)/2,canvas.height-dh,dw,dh);
    node.dataset.frame=String(frame);node.dataset.state=state;node.classList.add('loaded');
    node.setAttribute('aria-label','Space Pug: '+clips[state].label);
  }
  function render(now){
    if(stopped||document.hidden)return;
    const entry=load(state);const frame=reduced.matches?0:Math.floor((now-started)/1000*clips[state].fps)%8;
    for(const node of nodes){
      if(!node.closest('.screen.active'))continue;
      node.dataset.state=state;
      if(entry.ready)draw(node,entry.image,frame);
    }
  }
  function tick(now){request=0;render(now);if(!stopped&&!document.hidden&&!reduced.matches&&nodes.some(node=>node.closest('.screen.active')))request=requestAnimationFrame(tick);}
  function wake(){if(stopped)return;render(performance.now());if(!request&&!document.hidden&&!reduced.matches)request=requestAnimationFrame(tick);}
  function play(name,duration=0){
    if(!clips[name])return;
    clearTimeout(reactionTimer);state=name;started=performance.now();load(name);wake();
    if(duration>0)reactionTimer=setTimeout(()=>play('idle'),duration);
  }
  window.MemoryCrashMascot={
    show(screen){stopped=false;play(screen==='over'?'sad':'idle');},
    play,
    stop(){stopped=true;clearTimeout(reactionTimer);cancelAnimationFrame(request);request=0;},
    get state(){return state;},
  };
  document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(request);request=0;if(!document.hidden){started=performance.now();wake();}});
  reduced.addEventListener('change',()=>{cancelAnimationFrame(request);request=0;wake();});
  // Character images retain a static fallback until the first clip is ready.
  load('idle');
})();
