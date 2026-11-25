// Cache shared decode requests, and let a failed network/decode retry.
const requests=new Map();
export function loadStageAtlas(name){
 if(requests.has(name))return requests.get(name);
 const base=new URL('../../assets/runtime/stage-art/'+name,import.meta.url);
 const read=ext=>new Promise((resolve,reject)=>{
  const img=new Image();
  let timer;
  const fail=()=>{clearTimeout(timer);img.onload=img.onerror=null;img.removeAttribute('src');reject(new Error('Stage atlas failed: '+name+ext));};
  img.onload=()=>{clearTimeout(timer);img.onload=img.onerror=null;resolve(img);};
  img.onerror=fail;
  timer=setTimeout(fail,15000);
  img.src=base.href+ext;
 });
 const task=read('.webp').catch(()=>read('.png')).catch(error=>{requests.delete(name);throw error;});
 requests.set(name,task);
 return task;
}
