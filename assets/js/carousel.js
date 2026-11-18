'use strict';
(()=>{
 const root=document.querySelector('.featured-carousel');if(!root)return;
 const slides=[...root.querySelectorAll(':scope > section')],dots=[...root.querySelectorAll('[data-slide]')];
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 let index=0,elapsed=0,last=performance.now(),start=null;
 function show(n){index=(n+slides.length)%slides.length;elapsed=0;slides.forEach((el,i)=>el.hidden=i!==index);dots.forEach((el,i)=>{el.setAttribute('aria-pressed',String(i===index));el.style.setProperty('--progress','0')})}
 function tick(now){const dt=Math.min(now-last,100);last=now;
  const focused=root.querySelector(':focus-visible');
  if(!document.hidden&&!reduce.matches&&!start&&!focused&&!slides[index].matches(':hover')){
   elapsed+=dt;if(elapsed>=6000)show(index+1);
  }
  dots[index].style.setProperty('--progress',String(elapsed/6000));requestAnimationFrame(tick);
 }
 root.querySelector('[data-carousel=prev]').onclick=()=>show(index-1);
 root.querySelector('[data-carousel=next]').onclick=()=>show(index+1);
 dots.forEach((el,i)=>el.onclick=()=>show(i));
 root.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();show(index+(e.key==='ArrowRight'?1:-1));}});
 root.addEventListener('touchstart',e=>{start=e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null},{passive:true});
 root.addEventListener('touchend',e=>{if(start){const dx=e.changedTouches[0].clientX-start.x,dy=e.changedTouches[0].clientY-start.y;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy))show(index+(dx<0?1:-1));}start=null},{passive:true});
 root.addEventListener('touchcancel',()=>{start=null},{passive:true});
 show(0);requestAnimationFrame(tick);
})();
