import test from 'node:test';import assert from 'node:assert/strict';
globalThis.location={search:''};
const {clearProgress}=await import('../js/progress-reset.js');
function storage(data){const map=new Map(Object.entries(data));return{map,get length(){return map.size},key:i=>[...map.keys()][i],getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)}}
test('reset removes saves and every ranking version, retaining preferences and other games',()=>{const s=storage({'braveguy.save.v1':'save','braveguy.records.v2.stage.1.0':'rank','braveguy.records.v1.total':'old','braveguy.lang':'ja','braveguy.quality':'1','game02.muted':'1','other.save':'keep'});clearProgress(s);assert.deepEqual([...s.map.keys()],['braveguy.lang','braveguy.quality','game02.muted','other.save']);});
test('failed delete restores earlier removed progress and reports failure',()=>{const s=storage({'braveguy.save.v1':'save','braveguy.records.v2.total.1':'rank'});const before=[...s.map];s.removeItem=k=>{if(k.includes('records'))throw Error('denied');s.map.delete(k)};assert.throws(()=>clearProgress(s),/denied/);assert.equal(s.map.size,2);for(const [k,v] of before)assert.equal(s.getItem(k),v);});
