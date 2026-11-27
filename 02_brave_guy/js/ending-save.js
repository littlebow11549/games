// Final clearance and its pending ending are saved together.
export function queueEnding(save,stats,creditsOnly){
 if(!save.pendingEnding)save.pendingEnding={stats,creditsOnly:Boolean(creditsOnly),credited:false};
 return save.pendingEnding;
}
export function restoreEnding(save,finalId){
 if(!save.cleared.includes(finalId)){delete save.pendingEnding;return null;}
 if(save.pendingEnding&&typeof save.pendingEnding.credited==='boolean')return save.pendingEnding;
 delete save.pendingEnding;
 return (save.rounds===0||save.freshRun)?queueEnding(save,null,false):null;
}
export function creditEnding(save){
 const result=save.pendingEnding;
 if(!result||result.credited)return false;
 const previous=save.rounds||0;
 if(previous===0||save.freshRun)save.rounds=previous+1;
 for(const [id,threshold] of [['nightmare',3],['angel',4]]){
  if(previous<threshold&&save.rounds>=threshold)save.pendingCharacters=[...new Set([...(save.pendingCharacters||[]),id])];
 }
 save.freshRun=false;
 result.credited=true;
 return true;
}
