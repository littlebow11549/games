// Session-only reveal gesture; never writes player progress.
export function createSecretToggle({canUse,pause,resume,labels,onChange}) {
  let enabled=false,down=null,timer=null,opened=false;
  const box=document.createElement('dialog');box.id='secret-dialog';
  box.innerHTML='<div class="secret-angel"><div class="secret-expression" aria-hidden="true"></div><div><b></b><p id="secret-question"></p></div></div><div class="secret-choices"><button type="button" id="secret-no"></button><button type="button" id="secret-yes"></button></div>';
  box.setAttribute('aria-labelledby','secret-question');document.body.append(box);
  function finish(yes){if(!opened)return;opened=false;if(yes){enabled=true;onChange();}box.close();resume();}
  box.querySelector('#secret-no').onclick=()=>finish(false);
  box.querySelector('#secret-yes').onclick=()=>finish(true);
  box.addEventListener('cancel',e=>{e.preventDefault();finish(false)});
  box.addEventListener('keydown',e=>e.stopPropagation());
  const excluded=e=>e.target.closest('button,a,input,select,textarea,[role="button"],#stick-zone,dialog');
  function cancelHold(){clearTimeout(timer);timer=null;down=null;}
  addEventListener('pointerdown',e=>{
    cancelHold();
    if(!e.isPrimary||e.button!==0||!canUse()||excluded(e))return;
    down={id:e.pointerId,x:e.clientX,y:e.clientY};
    timer=setTimeout(()=>{cancelHold();if(canUse())activate();},5000);
  },true);
  addEventListener('pointermove',e=>{if(down&&e.pointerId===down.id&&Math.hypot(e.clientX-down.x,e.clientY-down.y)>16)cancelHold();},true);
  for(const event of ['pointerup','pointercancel'])addEventListener(event,cancelHold,true);
  addEventListener('blur',cancelHold);
  document.addEventListener('visibilitychange',cancelHold);
  // Prevent the browser touch context menu from stealing a deliberate hold.
  addEventListener('contextmenu',e=>{if(down)e.preventDefault();},true);
  function activate(){
    if(enabled){enabled=false;onChange();return;}
    const text=labels();box.querySelector('b').textContent=text.name;box.querySelector('p').textContent=text.question;
    box.querySelector('#secret-no').textContent=text.no;box.querySelector('#secret-yes').textContent=text.yes;
    pause();opened=true;box.showModal();box.querySelector('#secret-no').focus();
  }
  return {get enabled(){return enabled},get opened(){return opened}};
}
