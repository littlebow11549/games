const test=require('node:test');
const assert=require('node:assert/strict');
const T=require('../../02_brave_guy/vendor/three/three.module.min.js');
const {makeCrowdVisualBudget,makeCrowdResolution,needsChaseSight}=require('../../02_brave_guy/js/crowd-visual-budget.js');
const camera=new T.PerspectiveCamera(50,.7,.1,100);
camera.position.set(0,10,16);camera.lookAt(0,0,0);
const make=(x,z,opts={})=>{
 const root=new T.Group(); root.position.set(x,0,z);
 const frames=[];
 return {pos:root.position.clone(),y:0,def:{radius:.5,height:1.8},visual:{root,update:t=>frames.push(t)},frames,shown:true,state:'chase',...opts};
};
test('180 entities stay in the simulation while offscreen roots are hidden only during drawing',()=>{
 const q=makeCrowdVisualBudget(T);
 const close=make(0,0), out=make(30,0), boss=make(30,0,{def:{boss:true,height:2,radius:1}}), locked=make(-30,0), tall=make(0,-8,{y:7});
 const mobs=[close,out,boss,locked,tall,...Array.from({length:175},()=>make(28,2))];
 q.classify(mobs,camera,new T.Vector3(),locked);
 assert.equal(mobs.length,180);
 assert.equal(q.hiddenCount,176);
 assert(mobs.every(e=>e.visual.root.visible));
 assert.throws(()=>q.draw(()=>{assert(out.visual.root.visible===false); assert(mobs[6].visual.root.visible===false); assert(close.visual.root.visible&&boss.visual.root.visible&&locked.visual.root.visible&&tall.visual.root.visible); throw Error('render abort');}),/render abort/);
 assert(mobs.every(e=>e.visual.root.visible));
 assert.equal(out.state,'chase');
 out.pos.set(0,0,1);
 q.classify(mobs,camera,new T.Vector3(),locked);
 assert(out.crowdDrawOmit===false);
 q.classify(mobs.slice(0,5),camera,new T.Vector3(),null);
 assert.equal(q.hiddenCount,0);
});
test('distant travel animation decimates samples; attack prep and close animation keep full timing',()=>{
 const q=makeCrowdVisualBudget(T),far=make(30,0),near=make(1,0),boss=make(30,0,{def:{boss:true,height:2,radius:1}}),charging=make(16,0,{state:'windup'});
 const mobs=[far,near,boss,charging,...Array.from({length:40},()=>make(26,2))];
 q.classify(mobs,camera,new T.Vector3(),null);
 for(let i=0;i<60;i++) for(const e of mobs)q.animate(e,1/60);
 const sum=e=>e.frames.reduce((a,b)=>a+b,0);
 assert(far.frames.length<=12&&far.frames.length>5);
 for(const e of [near,boss,charging]){assert.equal(e.frames.length,60);assert(Math.abs(sum(e)-1)<1e-8);}
 assert(sum(far)<=1.001&&sum(far)>=.85);
 q.flush(far);assert(Math.abs(sum(far)-1)<1e-8);
 far.state='windup';q.animate(far,1/60);assert.equal(far.frames.at(-1),1/60);
});
test('line of sight is skipped only where the original reach and steering do not depend on it',()=>{
 assert(needsChaseSight(false,3,3));
 assert(!needsChaseSight(false,3.001,3));
 assert(needsChaseSight(true,5,3));
 assert(needsChaseSight(true,3,3));
 assert(!needsChaseSight(true,7.001,6));
 assert(needsChaseSight(true,8,9));
});

test('sustained slow crowds lower only drawing scale, then recover with hysteresis',()=>{
 const a=makeCrowdResolution();
 const tick=(n,d,count,playing=true)=>{let changed=0;for(let i=0;i<n;i++)if(a.tick(d,count,playing))changed++;return changed;};
 assert.equal(tick(4,.2,180),0);
 assert.equal(tick(80,1/60,180),0);
 assert.equal(tick(24,.06,29),0);
 assert.equal(tick(24,.06,180,false),0);
 assert.equal(tick(20,.06,180),2);
 assert.equal(a.scale,.72);
 assert.equal(tick(30,1/45,180),0);
 assert.equal(tick(24,1/30,20),0);
 assert.equal(tick(105,1/30,20),2);
 assert.equal(a.scale,1);
});
