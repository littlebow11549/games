import test from 'node:test';
import assert from 'node:assert/strict';
import {bossHealthRows} from '../js/boss-health.js';

test('duo bars track their own maximum and damage, including when one is defeated',()=>{
 const a={kind:'xinji',hp:240,maxHp:400},b={kind:'baguashe',hp:600,maxHp:600};
 assert.deepEqual(bossHealthRows([a,b],false).map(x=>[x.kind,x.fill]),[['xinji',.6],['baguashe',1]]);
 b.hp=0;
 assert.deepEqual(bossHealthRows([a,b],false).map(x=>x.fill),[.6,0]);
});
test('only the current final-boss bar is exposed; phase 2 appears full',()=>{
 const b={kind:'incubus',hp:1000,maxHp:1000};
 const rows=awakened=>bossHealthRows([b],awakened).map(r=>[r.phase,r.fill,r.active]);
 assert.deepEqual(rows(false),[[1,1,true]]);
 b.hp=600;
 assert.deepEqual(rows(false),[[1,0,true]]);
 assert.deepEqual(rows(true),[[2,1,true]]);
 b.hp=101;
 assert.deepEqual(rows(true),[[2,0,true]]);
});
