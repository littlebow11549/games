// Preserve the existing physics traversal; use numeric keys and reusable buckets
// to avoid per-frame strings and arrays as waves fill the arena.
const STEP=3, STRIDE=65536;
const cell=x=>Math.floor(x/STEP);
const address=(x,z)=>x*STRIDE+z; // arena coordinates are clamped well inside this stride
export function makeEnemySeparation(){
 const live=[], bins=new Map(), used=[], pool=[];
 return function separate(enemies,hero,heroRadius,alive){
  live.length=0;
  for(const b of used){b.length=0;pool.push(b);}
  used.length=0;bins.clear();
  for(const e of enemies)if(alive(e)&&e.y<=0){
   e._si=live.length;live.push(e);
   const key=address(cell(e.pos.x),cell(e.pos.z));
   let b=bins.get(key);
   if(!b){b=pool.pop()||[];bins.set(key,b);used.push(b);}
   b.push(e);
  }
  const slips=hero.state==='dodge'||hero.state==='skill1';
  for(const a of live){
   const key=address(cell(a.pos.x),cell(a.pos.z));
   for(let ox=-1;ox<=1;ox++)for(let oz=-1;oz<=1;oz++){
    const list=bins.get(key+ox*STRIDE+oz);if(!list)continue;
    for(const b of list){
     if(b._si<=a._si)continue;
     let dx=b.pos.x-a.pos.x,dz=b.pos.z-a.pos.z;
     if(Math.abs(dx)+Math.abs(dz)<1e-6){const angle=(a._si*2.399+b._si)*2.399;dx=Math.cos(angle)*.001;dz=Math.sin(angle)*.001;}
     const min=(a.def.radius+b.def.radius)*(a.def.boss||b.def.boss?1:.7);
     if(Math.abs(dx)>min||Math.abs(dz)>min||dx*dx+dz*dz>=min*min)continue;
     const d=Math.hypot(dx,dz)||.001;
     if(d<min){
      const push=(min-d)/2;
      if(!a.def.boss){a.pos.x-=dx/d*push;a.pos.z-=dz/d*push;}
      if(!b.def.boss){b.pos.x+=dx/d*push;b.pos.z+=dz/d*push;}
     }
    }
   }
   if(slips)continue;
   const dx=hero.pos.x-a.pos.x,dz=hero.pos.z-a.pos.z,min=a.def.radius+heroRadius;
   if(dx*dx+dz*dz>=min*min)continue;
   const d=Math.hypot(dx,dz)||.001;
   if(d<min){
    if(a.def.boss){hero.pos.x+=dx/d*(min-d);hero.pos.z+=dz/d*(min-d);}
    else {a.pos.x-=dx/d*(min-d);a.pos.z-=dz/d*(min-d);}
   }
  }
 };
}
