import test from 'node:test';
import assert from 'node:assert/strict';
import * as mod from '../js/crowd-separation.js';

function original(enemies,hero,radius,alive){
 const live=enemies.filter(e=>alive(e)&&e.y<=0), grid=new Map(),cell=(x,z)=>x+','+z,C=3;
 live.forEach((e,i)=>{e._si=i;const k=cell(Math.floor(e.pos.x/C),Math.floor(e.pos.z/C));if(!grid.has(k))grid.set(k,[]);grid.get(k).push(e);});
 for(const a of live){
  const cx=Math.floor(a.pos.x/C),cz=Math.floor(a.pos.z/C);
  for(let x=-1;x<=1;x++)for(let z=-1;z<=1;z++)for(const b of grid.get(cell(cx+x,cz+z))||[]){
   if(b._si<=a._si)continue;
   let dx=b.pos.x-a.pos.x,dz=b.pos.z-a.pos.z;
   if(Math.abs(dx)+Math.abs(dz)<1e-6){const angle=(a._si*2.399+b._si)*2.399;dx=Math.cos(angle)*.001;dz=Math.sin(angle)*.001;}
   const min=(a.def.radius+b.def.radius)*(a.def.boss||b.def.boss?1:.7);
   if(Math.abs(dx)>min||Math.abs(dz)>min)continue;
   const d=Math.hypot(dx,dz)||.001;if(d>=min)continue;
   const push=(min-d)/2;
   if(!a.def.boss){a.pos.x-=dx/d*push;a.pos.z-=dz/d*push;}
   if(!b.def.boss){b.pos.x+=dx/d*push;b.pos.z+=dz/d*push;}
  }
  const dx=hero.pos.x-a.pos.x,dz=hero.pos.z-a.pos.z,d=Math.hypot(dx,dz)||.001,min=a.def.radius+radius;
  if(d<min&&hero.state!=='dodge'&&hero.state!=='skill1'){
   const p=a.def.boss?hero.pos:a.pos, s=a.def.boss?1:-1;
   p.x+=s*dx/d*(min-d);p.z+=s*dz/d*(min-d);
  }
 }
}
test('crowd separation retains pair order, boss push, airborne exclusions and original coordinates',()=>{
 assert.equal(typeof mod.makeEnemySeparation,'function');
 const alive=e=>e.hp>0;
 const f=mod.makeEnemySeparation();
 for(let k=0;k<12;k++){
  const mobs=Array.from({length:140},(_,i)=>({pos:i<2?{x:0,z:0}:{x:Math.cos(i*2.67+k)*((i%17)*1.35),z:Math.sin(i*1.28)*((i%13)*1.1)},hp:i%19?50:0,y:i%23?0:1,def:{radius:i===1?1.13:.4+(i%5)*.16,boss:i===1}}));
  const hero={pos:{x:.08,z:.12},state:k%3===1?'dodge':'free'};
  const a=structuredClone(mobs),b=structuredClone(mobs),h1=structuredClone(hero),h2=structuredClone(hero);
  for(let j=0;j<5;j++){original(a,h1,.55,alive);f(b,h2,.55,alive);}
  const same=(p,q)=>assert(Math.max(Math.abs(p.x-q.x),Math.abs(p.z-q.z))<1e-10);
  a.forEach((e,i)=>same(e.pos,b[i].pos));same(h1.pos,h2.pos);
 }
});
