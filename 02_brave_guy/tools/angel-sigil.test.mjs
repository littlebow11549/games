import test from 'node:test';
import assert from 'node:assert/strict';
import * as art from '../js/angel-ice-fx.js';

test('Angel seal builds and fades within its existing visual life and footprint',()=>{
 assert.equal(typeof art.angelSealPose,'function');
 for(const [phase,r] of [['nova',9],['vortex',13],['barrier',4.5],['finish',17]]){
  const start=art.angelSealPose(phase,0,r), full=art.angelSealPose(phase,.52,r), done=art.angelSealPose(phase,1,r);
  assert.equal(start.opacity,0);
  assert(done.opacity<.001);
  assert(full.opacity>.65);
  assert(full.outer<=r&&full.inner<full.outer);
  assert(full.outer>.75*Math.min(r,10));
  assert(full.yawA*full.yawB<0);
 }
 assert.equal(art.angelSealPose('barrier-pop',.5,3.2),null);
});
