const test=require('node:test');
const assert=require('node:assert/strict');
const {Input}=require('../../02_brave_guy/js/input.js');
function fixture(native=true){
 const win=new EventTarget(), doc=new EventTarget(),zone=new EventTarget(),base=new EventTarget(),knob={style:{transform:''}},canvas=new EventTarget(),btn=new EventTarget();
 const elements={'stick-zone':zone,'stick-base':base,'stick-knob':knob,scene:canvas};
 base.getBoundingClientRect=()=>({left:0,top:0,width:100,height:100});
 base.setPointerCapture=()=>{throw Error('capture unavailable');};
 btn.dataset={action:'attack'};
 doc.getElementById=id=>elements[id]; doc.querySelectorAll=()=>[btn];
 if(native)win.ontouchstart=null;
 global.window=win;global.document=doc;global.addEventListener=win.addEventListener.bind(win);
 const input=new Input(),fire=(target,type,fields={})=>target.dispatchEvent(Object.assign(new Event(type,{cancelable:true}),fields));
 const finger=(identifier,clientX,clientY)=>({identifier,clientX,clientY,target:base});
 const touch=(target,type,changedTouches,touches=changedTouches)=>fire(target,type,{changedTouches,touches});
 const pointer=(target,type,pointerId,clientX=50,clientY=50,pointerType='mouse')=>fire(target,type,{pointerType,button:0,pointerId,clientX,clientY});
 return {win,doc,zone,base,knob,btn,input,fire,finger,touch,pointer};
}
const stopped=({input,knob})=>{assert.deepEqual(input.move(),{x:0,y:0,len:0});assert.equal(knob.style.transform,'');};
test('joystick follows a thumb outside its circle and ignores release of the skill finger',()=>{
 const q=fixture(),{zone,win,btn,input,finger,touch,pointer}=q;
 const start=finger(34,52,49), moved=finger(34,-20,2), second=finger(35,250,250);
 touch(zone,'touchstart',[start]);
 touch(win,'touchmove',[moved]);
 assert(input.move().x<-.8);assert(input.move().y<-.4);
 pointer(btn,'pointerdown',35,250,250,'touch');assert.deepEqual(input.takeActions(),['attack']);
 touch(win,'touchend',[second],[moved]);assert(input.move().x<-.8);
 touch(win,'touchend',[moved],[second]);stopped(q);
 touch(zone,'touchstart',[finger(36,90,50)]);
 assert(input.move().x>.8);
});
test('touchcancel, system focus loss and paused layout clear direction and the displaced knob',()=>{
 const q=fixture(),{zone,win,doc,input,finger,touch,fire}=q;
 const start=finger(1,83,50),hold=()=>{touch(zone,'touchstart',[start]);assert(input.move().x>.6);};
 hold();touch(win,'touchcancel',[start],[]);stopped(q);
 hold();fire(win,'pagehide');stopped(q);
 hold();doc.hidden=true;fire(doc,'visibilitychange');stopped(q);
 hold();input.resetMovement();stopped(q);
 touch(win,'touchmove',[start]);stopped(q);
});
test('pointer capture is optional: mouse motion and release outside the stick still work',()=>{
 const q=fixture(false),{base,win,input,pointer,fire}=q;
 pointer(base,'pointerdown',7,80,50);assert(input.move().x>.5);
 pointer(win,'pointermove',7,50,99);assert.equal(input.move().y,1);
 pointer(win,'pointerup',8);assert.equal(input.move().y,1);
 pointer(win,'pointerup',7);stopped(q);
 fire(win,'keydown',{code:'ArrowLeft'});assert.equal(input.move().x,-1);
 fire(win,'keyup',{code:'ArrowLeft'});stopped(q);
});
