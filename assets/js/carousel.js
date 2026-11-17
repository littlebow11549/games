'use strict';
(()=>{
 const root=document.querySelector('.featured-carousel');if(!root)return;
 const slides=[...root.querySelectorAll(':scope > section')],dots=[...root.querySelectorAll('[data-slide]')];
 const pause=root.querySelector('[data-carousel=pause]'),reduce=matchMedia('(prefers-reduced-motion: reduce)');
 let index=0,paused=reduce.matches,timer,start=null;
 function schedule(){clearTimeout(timer);if(!paused&&!document.hidden&&!root.matches(':hover')&&!root.contains(document.activeElement))timer=setTimeout(()=>show(index+1),6000)}
 function show(n){index=(n+slides.length)%slides.length;slides.forEach((el,i)=>el.hidden=i!==index);dots.forEach((el,i)=>el.setAttribute('aria-pressed',String(i===index)));schedule()}
 function pauseLabel(){pause.setAttribute('aria-pressed',String(paused));pause.setAttribute('aria-label',paused?'Play slideshow':'Pause slideshow');pause.textContent=''}
 root.querySelector('[data-carousel=prev]').onclick=()=>show(index-1);
 root.querySelector('[data-carousel=next]').onclick=()=>show(index+1);
 dots.forEach((el,i)=>el.onclick=()=>show(i));
 pause.onclick=()=>{paused=!paused;pauseLabel();schedule()};
 root.addEventListener('pointerenter',()=>clearTimeout(timer));root.addEventListener('pointerleave',schedule);
 root.addEventListener('focusin',()=>clearTimeout(timer));root.addEventListener('focusout',()=>setTimeout(schedule,0));
 root.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();show(index+(e.key==='ArrowRight'?1:-1));}});
 root.addEventListener('touchstart',e=>{start=e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null;clearTimeout(timer)},{passive:true});
 root.addEventListener('touchend',e=>{if(start){const dx=e.changedTouches[0].clientX-start.x,dy=e.changedTouches[0].clientY-start.y;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy))show(index+(dx<0?1:-1));}start=null;schedule()},{passive:true});
 root.addEventListener('touchcancel',()=>{start=null;schedule()},{passive:true});
 document.addEventListener('visibilitychange',schedule);reduce.addEventListener('change',()=>{paused=reduce.matches;pauseLabel();schedule()});
 pauseLabel();show(0);
})();
