import test from 'node:test';
import assert from 'node:assert/strict';
import {reserveHitSpark} from '../js/hit-spark-budget.js';
const hits=(n,essential=false)=>Array.from({length:n},()=>({obj:{userData:{hitSpark:true,essential}}}));
test('ordinary fights can show 18 cosmetic hits; crowds keep at most eight ordinary hits',()=>{
 assert.deepEqual(reserveHitSpark(hits(17),false,false),{show:true,replace:-1});
 assert.deepEqual(reserveHitSpark(hits(18),false,false),{show:false,replace:-1});
 assert.equal(reserveHitSpark(hits(7),false,true).show,true);
 assert.equal(reserveHitSpark(hits(8),false,true).show,false);
 assert.equal(reserveHitSpark(hits(8),true,true).show,true);
});
test('heavy, guards, counters and Boss hits can replace the oldest ordinary hit without losing warnings',()=>{
 const warning={obj:{userData:{telegraph:true}}};
 assert.deepEqual(reserveHitSpark([warning,...hits(18)],true,true),{show:true,replace:1});
 assert.deepEqual(reserveHitSpark([warning,...hits(18,true)],true,true),{show:false,replace:-1});
 assert.deepEqual(reserveHitSpark(Array(25).fill(warning),true,true),{show:true,replace:-1});
});
