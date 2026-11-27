import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../vendor/three/three.module.min.js';
import * as mod from '../js/stage-art/story-ambient.js';

test('many identical ambience sprites are submitted as one batch with isolated per-sprite data',()=>{
 assert.equal(typeof mod.makeAmbientBatch,'function');
 const root=new T.Group(),tex=new T.Texture();
 const b=mod.makeAmbientBatch(T,root,tex,'#c5d2df',24,'fog');
 assert.equal(root.children.length,1);
 assert.equal(root.children[0].geometry.instanceCount,24);
 b.set(7,1,2,3,.5,.7,.25,.9);
 assert.deepEqual(Array.from(root.children[0].geometry.getAttribute('ambientCenter').array.slice(21,24)),[1,2,3]);
 b.commit();
 assert.equal(root.children[0].geometry.getAttribute('ambientCenter').version,1);
 b.dispose();
 assert.equal(root.children.length,0);
});
