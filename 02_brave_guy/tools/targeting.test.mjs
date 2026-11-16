import test from 'node:test';
import assert from 'node:assert/strict';
import {nextLockTarget} from '../js/targeting.js';
const pos={x:0,z:0};
const enemy=x=>({pos:{x,z:0},state:'chase',def:{radius:.5}});
test('targets cycle nearest to farthest regardless of spawn order and wrap',()=>{
 const near=enemy(1),mid=enemy(3),far=enemy(8),all=[far,near,mid];
 assert.equal(nextLockTarget(all,null,pos,10),near);
 assert.equal(nextLockTarget(all,near,pos,10),mid);
 assert.equal(nextLockTarget(all,mid,pos,10),far);
 assert.equal(nextLockTarget(all,far,pos,10),near);
 assert.equal(nextLockTarget(all,near,pos,10,-1),far);
 assert.deepEqual(all,[far,near,mid]);
});
test('movement updates distance order; unavailable targets are excluded',()=>{
 const a=enemy(1),b=enemy(3),c=enemy(8);c.pos.x=2;
 assert.equal(nextLockTarget([b,a,c],a,pos,10),c);
 c.state='dead';assert.equal(nextLockTarget([b,a,c],a,pos,10),b);
 b.state='spawn';assert.equal(nextLockTarget([b,a,c],null,pos,10),a);
 a.gone=true;assert.equal(nextLockTarget([b,a,c],null,pos,10),null);
 assert.equal(nextLockTarget([enemy(20)],null,pos,10),null);
 const left=enemy(-2),right=enemy(2);assert.equal(nextLockTarget([left,right],null,pos,10),left);
});
