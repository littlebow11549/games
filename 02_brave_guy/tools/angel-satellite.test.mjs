import test from 'node:test';
import assert from 'node:assert/strict';
import * as art from '../js/angel-seal.js';

test('the satellite marker and impact bloom stay legible but within the bomb footprint',()=>{
 assert.equal(typeof art.angelSatellitePose,'function');
 const before=art.angelSatellitePose(.05,3.2,false),after=art.angelSatellitePose(.35,3.2,true);
 assert(before.scale<1.5&&before.opacity>.25);
 assert(after.scale>before.scale&&after.scale<3.2&&after.opacity>.60);
 assert.equal(art.angelSatellitePose(1,3.2,true).opacity,0);
});
