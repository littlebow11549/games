const TOTAL=18, CROWDED_LIGHT=8;
// Non-hit effects (warnings, casts, wakes) are separate and never displaced.
export function reserveHitSpark(items,important,crowded) {
 let total=0,ordinary=0,oldest=-1;
 for(let i=0;i<items.length;i++){
  const v=items[i].obj.userData;
  if(!v.hitSpark)continue;
  total++;
  if(!v.essential){ordinary++;if(oldest<0)oldest=i;}
 }
 if(!important&&crowded&&ordinary>=CROWDED_LIGHT)return {show:false,replace:-1};
 if(total<TOTAL)return {show:true,replace:-1};
 return important&&oldest>=0?{show:true,replace:oldest}:{show:false,replace:-1};
}
