// Local top-three records: independent stage clears and the sum of one complete campaign.
export const words=(lang,zh,en,ja)=>lang==='en'?en:lang==='ja'?ja:zh;
export function formatTime(seconds){const n=Math.max(0,Math.floor(seconds));return `${Math.floor(n/3600).toString().padStart(2,'0')}:${Math.floor(n/60)%60}`.replace(/:(\d)$/,':0$1')+`:${(n%60).toString().padStart(2,'0')}`;}
export class RunRecords {
 constructor(storage){this.storage=storage;this.reset();}
 reset(){this.run=null;this.result=null;this.attempt=null;this.stageResult=null;}
 start(index,difficulty){
  if(index===0&&!this.run)this.run={seconds:0,next:0,difficulty,eligible:true,stageTimes:[]};
  if(this.run&&(index!==this.run.next||difficulty!==this.run.difficulty))this.run.eligible=false;
  this.attempt={index,difficulty,seconds:0,eligible:true};this.result=null;this.stageResult=null;
 }
 tick(dt){if(this.attempt&&Number.isFinite(dt)&&dt>0)this.attempt.seconds+=dt;}
 invalidate(){if(this.run)this.run.eligible=false;if(this.attempt)this.attempt.eligible=false;}
 record(key,entry){
  let rows=[];try{const data=JSON.parse(this.storage.getItem(key)||'[]');if(Array.isArray(data))rows=data.filter(x=>Number.isFinite(x.seconds)&&x.seconds>0&&typeof x.id==='string').sort((a,b)=>a.seconds-b.seconds).slice(0,3);}catch{}
  const item={seconds:entry.seconds,id:globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random()}`,date:new Date().toISOString().slice(0,10)};
  const ranked=entry.eligible&&entry.seconds>0;if(ranked)rows=[...rows,item].sort((a,b)=>a.seconds-b.seconds).slice(0,3);
  let saved=true;if(ranked)try{this.storage.setItem(key,JSON.stringify(rows));}catch{saved=false;}
  return {...entry,rows,rank:ranked?rows.findIndex(x=>x.id===item.id)+1:0,ranked,saved};
 }
 clear(index,last){
  const attempt=this.attempt;if(!attempt||attempt.index!==index)return null;this.attempt=null;
  this.stageResult=this.record(`braveguy.records.v2.stage.${attempt.difficulty}.${index}`,attempt);
  const run=this.run;if(!run||index!==run.next)return this.stageResult;
  run.stageTimes.push(attempt.seconds);run.seconds=run.stageTimes.reduce((sum,time)=>sum+time,0);run.eligible&&=attempt.eligible;run.next++;
  if(last){this.result=this.record(`braveguy.records.v2.total.${run.difficulty}`,run);this.run=null;}
  return this.stageResult;
 }
}
