import test from 'node:test';
import assert from 'node:assert/strict';
import {nextLockTarget, directionalLockTarget, isLockTarget} from '../js/targeting.js';
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

test('one current target never reports a switch, but can be acquired when unlocked',()=>{
 const a=enemy(2);assert.equal(nextLockTarget([a],a,pos,16),null);assert.equal(nextLockTarget([a],null,pos,16),a);
});
test('hidden, zero HP, gone and out of range targets cannot be selected',()=>{
 const a=enemy(2),b=enemy(3),c=enemy(4),d=enemy(5),edge=enemy(16.5);
 a.shown=false;b.hp=0;c.gone=true;d.state='spawn';
 assert.equal(nextLockTarget([a,b,c,d,edge],null,pos,16),edge);
 edge.pos.x=16.51;assert.equal(nextLockTarget([edge],null,pos,16),null);
 const stale=enemy(1);const live=enemy(3);assert.equal(nextLockTarget([live],stale,pos,16),live);
});

test('detached or invisible rendered enemies are rejected',()=>{
 const e=enemy(2);e.visual={root:{visible:true,parent:{}}};assert(isLockTarget(e,pos,16));
 e.visual.root.visible=false;assert(!isLockTarget(e,pos,16));
 e.visual.root.visible=true;e.visual.root.parent=null;assert(!isLockTarget(e,pos,16));
});
test('directional selection prioritizes nearest within cone, no opposite fallback',()=>{
 const near=enemy(3),far=enemy(8),left=enemy(-1);
 assert.equal(directionalLockTarget([far,left,near],pos,16,{x:1,y:0}),near);
 assert.equal(directionalLockTarget([left],pos,16,{x:1,y:0}),null);
 near.pos.z=3;assert.equal(directionalLockTarget([near,far],pos,16,{x:1,y:1}),near);
});
