import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three/three.module.min.js';
import * as art from '../js/nightmare-drone-art.js';

test('a Nightmare shot is a forward-facing wave with one fixed flat launch heading',()=>{
 assert.equal(typeof art.nightmareShotAim,'function');
 const a=new THREE.Vector3(1,2.9,-3),b=new THREE.Vector3(4,0,1),aim=art.nightmareShotAim(a,b);
 assert(Math.abs(aim.x-.6)<1e-8&&Math.abs(aim.z-.8)<1e-8&&aim.y===0);
 b.set(-8,0,3);
 assert.equal(aim.x,.6);
 assert.equal(art.nightmareShotAim(a,a),null);
 const m=art.createNightmareWave(aim);
 const heading=new THREE.Vector3(0,0,1).applyQuaternion(m.quaternion);
 assert(heading.distanceTo(aim)<.00001);
 assert.equal(m.children.length,2);
 const {geometry,material}=m.children[0];
 assert.equal(geometry.parameters.height,4.25);
 assert.equal(geometry.parameters.width,1.82);
 assert.match(material.fragmentShader,/float bevel=/);
 assert.doesNotMatch(material.fragmentShader,/\bpip\b|vec3\(\.73,1\.,\.33\)/);
});
