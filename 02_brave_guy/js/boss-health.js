const fraction=(hp,max)=>Math.max(0,Math.min(1,max>0?hp/max:0));
export function bossHealthRows(bosses,awakened){
 const final=bosses.length===1&&bosses[0].kind==='incubus'?bosses[0]:null;
 if(!final)return bosses.map(e=>({kind:e.kind,fill:fraction(e.hp,e.maxHp),active:e.hp>0}));
 // Only normalize how the existing phase gates are displayed. The actual HP,
 // shield breaking, cutscene transition and final no-damage story beat stay intact.
 const secondStart=Math.ceil(final.maxHp*.6),finish=Math.floor(final.maxHp*.1)+1;
 return [awakened
  ? {kind:final.kind,phase:2,fill:fraction(final.hp-finish,secondStart-finish),active:true}
  : {kind:final.kind,phase:1,fill:fraction(final.hp-secondStart,final.maxHp-secondStart),active:true}
 ];
}
