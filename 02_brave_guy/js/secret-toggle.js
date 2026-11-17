// Session-only reveal gesture; never writes player progress.
export function createSecretToggle({canUse,pause,resume,labels,onChange}) {
  let enabled=false,down=null,taps=[],opened=false;
  const box=document.createElement('dialog');box.id='secret-dialog';
  box.innerHTML='<div class="secret-angel"><img src="assets/runtime/lossless/pic/concept/angel_front.webp" alt=""><div><b></b><p id="secret-question"></p></div></div><div class="secret-choices"><button type="button" id="secret-no"></button><button type="button" id="secret-yes"></button></div>';
  box.setAttribute('aria-labelledby','secret-question');document.body.append(box);
  function finish(yes){if(!opened)return;opened=false;if(yes){enabled=true;onChange();}box.close();resume();}
  box.querySelector('#secret-no').onclick=()=>finish(false);
  box.querySelector('#secret-yes').onclick=()=>finish(true);
  box.addEventListener('cancel',e=>{e.preventDefault();finish(false)});
  box.addEventListener('keydown',e=>e.stopPropagation());
  const excluded=e=>e.target.closest('button,a,input,select,textarea,[role="button"],#stick-zone,dialog');
  addEventListener('pointerdown',e=>{
    if(!e.isPrimary||e.button!==0||!canUse()||excluded(e)){down=null;taps=[];return;}
    down={id:e.pointerId,x:e.clientX,y:e.clientY,t:performance.now()};
  },true);
  addEventListener('pointercancel',()=>{down=null;taps=[]},true);
  addEventListener('pointerup',e=>{
    const d=down;down=null;const now=performance.now();
    if(!d||e.pointerId!==d.id||!canUse()||excluded(e)||now-d.t>300||Math.hypot(e.clientX-d.x,e.clientY-d.y)>16){taps=[];return;}
    taps=taps.filter(t=>now-t.t<850&&Math.hypot(d.x-t.x,d.y-t.y)<48);taps.push({...d,t:now});
    if(taps.length<3)return;taps=[];
    if(enabled){enabled=false;onChange();return;}
    const text=labels();box.querySelector('b').textContent=text.name;box.querySelector('p').textContent=text.question;
    box.querySelector('#secret-no').textContent=text.no;box.querySelector('#secret-yes').textContent=text.yes;
    pause();opened=true;box.showModal();box.querySelector('#secret-no').focus();
  },true);
  return {get enabled(){return enabled},get opened(){return opened}};
}
