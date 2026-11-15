// Local, difficulty-separated full-campaign records. No remote leaderboard.
export const words=(lang,zh,en,ja)=>lang==='en'?en:lang==='ja'?ja:zh;
export function formatTime(seconds){const n=Math.max(0,Math.floor(seconds));return `${Math.floor(n/3600).toString().padStart(2,'0')}:${Math.floor(n/60)%60}`.replace(/:(\d)$/,':0$1')+`:${(n%60).toString().padStart(2,'0')}`;}
export class RunRecords {
 constructor(storage){this.storage=storage;this.run=null;this.result=null;}
 start(index,difficulty){if(index===0&&!this.run)this.run={seconds:0,next:0,difficulty,eligible:true};if(this.run&&(index!==this.run.next||difficulty!==this.run.difficulty))this.run.eligible=false;this.result=null;}
 tick(dt){if(this.run&&Number.isFinite(dt)&&dt>0)this.run.seconds+=dt;}
 invalidate(){if(this.run)this.run.eligible=false;}
 reset(){this.run=null;this.result=null;}
 clear(index,last){const r=this.run;if(!r||index!==r.next)return null;r.next++;if(!last)return null;
 const key=`braveguy.records.v1.${r.difficulty}`;let rows=[];try{const data=JSON.parse(this.storage.getItem(key)||'[]');if(Array.isArray(data))rows=data.filter(x=>Number.isFinite(x.seconds)&&x.seconds>0&&typeof x.id==='string').sort((a,b)=>a.seconds-b.seconds).slice(0,5);}catch{}
 const entry={seconds:r.seconds,id:globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random()}`,date:new Date().toISOString().slice(0,10)};
 const ranked=r.eligible&&r.seconds>0;if(ranked)rows=[...rows,entry].sort((a,b)=>a.seconds-b.seconds).slice(0,5);
 let saved=true;if(ranked)try{this.storage.setItem(key,JSON.stringify(rows));}catch{saved=false;}
 this.result={...r,rows,rank:ranked?rows.findIndex(x=>x.id===entry.id)+1:0,ranked,saved};this.run=null;return this.result;
 }
}
