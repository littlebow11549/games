import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three/three.module.min.js';
import {createNightmareDrone} from '../js/nightmare-drone-art.js';

test('the child aircraft uses the dedicated chibi geometry without loading a humanoid rig',()=>{
 const scene=new THREE.Scene();
 const m=createNightmareDrone(scene);
 assert.equal(m.userData.modelKind,'nightmare_spirit');
 assert.equal(m.parent,scene);
 assert.equal(m.children.length,3);
 const a=m.children[1].rotation.y;m.userData.advanceSpirit(.12);
 assert.notEqual(m.children[1].rotation.y,a);
 assert(m.children.reduce((n,x)=>n+x.geometry.attributes.position.count,0)<11000);
 m.userData.releaseSpirit();
});
