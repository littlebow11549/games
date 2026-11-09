/* Eight drawn keyframes; time-based blending, with short blink transitions. */
(() => {
  const script = document.currentScript;
  const image = new Image();
  image.src = new URL('../assets/runtime/pic/batch3/pug_idle_01.webp', script.src).href;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const durations = [850,400,90,110,90,400,450,610];
  const nodes = [...document.querySelectorAll('[data-hero-idle]')];
  let raf = 0, origin = performance.now();
  function draw(canvas, frame, alpha=1) {
    const x=Math.round((frame%4)*image.width/4), y=Math.round(Math.floor(frame/4)*image.height/2);
    const w=Math.round((frame%4+1)*image.width/4)-x, h=Math.round((Math.floor(frame/4)+1)*image.height/2)-y;
    const ctx=canvas.getContext('2d'); ctx.globalAlpha=alpha;
    ctx.drawImage(image,x,y,w,h,0,0,canvas.width,canvas.height);
    ctx.globalAlpha=1;
  }
  function tick(now) {
    raf=0;
    if(document.hidden || reduced.matches || !image.complete || !image.naturalWidth) return;
    let phase=(now-origin)%3000, frame=0;
    while(phase>=durations[frame]) phase-=durations[frame++];
    const blend=Math.min(100,durations[frame]*.5), mix=Math.max(0,(phase-(durations[frame]-blend))/blend);
    let visible=false;
    for(const canvas of nodes) {
      const screen=canvas.closest('.screen');
      if((screen&&!screen.classList.contains('active'))||canvas.closest('[hidden]')) continue;
      visible=true;
      canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);
      draw(canvas,frame,1); if(mix>0) draw(canvas,(frame+1)%8,mix);
      canvas.dataset.frame=String(frame);
    }
    if(visible) raf=requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(raf);raf=0;
    if(!image.naturalWidth) return;
    if(reduced.matches) nodes.forEach(c=>{c.getContext('2d').clearRect(0,0,c.width,c.height);draw(c,0);c.dataset.frame='0';});
    else if(!document.hidden) raf=requestAnimationFrame(tick);
  }
  image.onload=()=>{nodes.forEach(c=>{draw(c,0);c.classList.add('idle-ready');});sync();};
  document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
  new MutationObserver(sync).observe(document.querySelector('#app')||document.body,{attributes:true,subtree:true,attributeFilter:['class','hidden']});
})();
