/* Asset-only presentation: bitmap labels, cinematic media and event effects. */
(() => {
  'use strict';
  const app=document.querySelector('#app');
  const warp=document.querySelector('#warpVideo');
  const intro=document.querySelector('#introVideo');
  const layer=document.querySelector('#introLayer');
  const skip=document.querySelector('#skipIntro');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let screen='title',introPlaying=false,introFinish=null,introDeadline=0;
  let fontImage=null;
  function paintLabel(node,metrics){
    const value=node.dataset.bitmap;const em=26,pad=3;let width=pad;
    for(let i=0;i<value.length;i++){
      const glyph=metrics.glyphs[value[i]];if(!glyph)return;
      width+=(glyph.advance_em+(metrics.kerning_em[value.slice(i,i+2)]||0))*em;
    }
    const canvas=document.createElement('canvas');canvas.width=Math.ceil((width+pad)*2);canvas.height=80;
    canvas.setAttribute('aria-hidden','true');const ctx=canvas.getContext('2d');ctx.scale(2,2);
    let x=pad;const baseline=30,scale=em/metrics.cap_height_pixels;
    for(let i=0;i<value.length;i++){
      const g=metrics.glyphs[value[i]];
      if(g.width)ctx.drawImage(fontImage,g.x,g.y,g.width,g.height,x,baseline+g.baseline_offset_em*em-g.height*scale,g.width*scale,g.height*scale);
      x+=(g.advance_em+(metrics.kerning_em[value.slice(i,i+2)]||0))*em;
    }
    node.replaceChildren(canvas);node.classList.add('bitmap-label');node.setAttribute('role','img');node.setAttribute('aria-label',value);node.dataset.rendered='true';
  }
  let readyMetrics=null,fontReady=null;
  function ensureFont(){
    if(fontReady)return fontReady;
    fontImage=new Image();fontImage.src='assets/source/pic/font/font_01.webp';
    fontReady=Promise.all([fontImage.decode(),fetch('assets/source/pic/font/font_01.metrics.json').then(r=>{if(!r.ok)throw new Error('font metrics');return r.json();})]).then(([,metrics])=>{readyMetrics=metrics;document.querySelectorAll('[data-bitmap]').forEach(node=>paintLabel(node,metrics));}).catch(()=>{});
    return fontReady;
  }
  if(document.querySelector('[data-bitmap]'))ensureFont();
  function syncBackground(){
    const allowed=!document.hidden&&!reduced.matches&&!navigator.connection?.saveData&&!introPlaying&&['title','menu'].includes(screen);
    if(!allowed){warp.pause();app.classList.remove('warp-video-active');return;}
    if(!warp.src)warp.src=warp.dataset.src;
    warp.play().then(()=>{if(!warp.paused&&!introPlaying&&!reduced.matches&&!document.hidden&&['title','menu'].includes(screen))app.classList.add('warp-video-active');}).catch(()=>app.classList.remove('warp-video-active'));
  }
  function finishIntro(){
    if(!introPlaying)return;
    introPlaying=false;clearTimeout(introDeadline);intro.pause();layer.hidden=true;
    const done=introFinish;introFinish=null;if(done)done();syncBackground();document.querySelector("#btnArcade")?.focus({preventScroll:true});
  }
  function playIntro(done){
    if(introPlaying)return;
    if(reduced.matches||navigator.connection?.saveData){done();return;}
    introPlaying=true;introFinish=done;layer.hidden=false;warp.pause();
    if(!intro.src)intro.src=intro.dataset.src;
    intro.currentTime=0;intro.play().catch(finishIntro);
    // Loading trouble never prevents the player from reaching the menu.
    introDeadline=setTimeout(finishIntro,6500);skip.focus({preventScroll:true});
  }
  intro.addEventListener('ended',finishIntro);intro.addEventListener('error',finishIntro);skip.addEventListener('click',finishIntro);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&introPlaying){e.preventDefault();finishIntro();}});
  const fxRoot=document.querySelector('#fxLayer');
  const fxPreload=new Image();fxPreload.src='assets/runtime/pic/fx_01.webp';
  function effect(kind){
    const names={burst:0,shatter:1,crack:2};if(!(kind in names))return;
    const art=document.createElement('span');art.className='fx-art fx-'+kind;
    art.style.backgroundPosition=`${names[kind]*50}% 50%`;fxRoot.append(art);
    setTimeout(()=>art.remove(),reduced.matches?220:(kind==='crack'?1500:700));
  }
  document.addEventListener('visibilitychange',()=>{if(document.hidden)intro.pause();else if(introPlaying)intro.play().catch(finishIntro);syncBackground();});
  reduced.addEventListener('change',()=>{if(reduced.matches)finishIntro();syncBackground();});
  window.MemoryCrashPresentation={
    show(name){screen=name;syncBackground();},
    intro:playIntro,
    effect,
    stop(){clearTimeout(introDeadline);introFinish=null;introPlaying=false;intro.pause();warp.pause();layer.hidden=true;fxRoot.replaceChildren();},
    get introPlaying(){return introPlaying;},
    get fontReady(){return fontReady||Promise.resolve();},
    async renderLabel(node,value){await ensureFont();if(!readyMetrics)return false;node.dataset.bitmap=value;paintLabel(node,readyMetrics);return node.dataset.rendered==='true';},
  };
})();
