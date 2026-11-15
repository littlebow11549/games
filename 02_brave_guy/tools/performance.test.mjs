import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three/three.module.min.js';
import { Fx } from '../js/fx.js';
import { disposeOwned } from '../js/dispose-owned.js';
import { GameAudio } from '../js/audio.js';
globalThis.localStorage={getItem:()=>null};
test('clearing unfinished effects disposes each owned GPU resource exactly once',()=>{
 const scene=new THREE.Scene(),fx=new Fx(scene);fx.ring(new THREE.Vector3(),1,3,0xffffff,2);fx.burst(new THREE.Vector3(),0xffffff,5,2);fx.dome(new THREE.Vector3(),3,0xffffff,2);
 fx.slash(new THREE.Vector3(),0,4,Math.PI*1.8);const resources=new Set();scene.traverse(o=>{if(o.geometry)resources.add(o.geometry);for(const m of [].concat(o.material||[]))resources.add(m)});let count=0;for(const r of resources)r.addEventListener('dispose',()=>count++);assert(resources.size>0);fx.clear();assert.equal(count,resources.size);assert.equal(scene.children.length,0);fx.clear();assert.equal(count,resources.size);
 const shared=new THREE.Group(),g=new THREE.BoxGeometry(),m=new THREE.MeshBasicMaterial();shared.add(new THREE.Mesh(g,m),new THREE.Mesh(g,m));let disposed=0;g.addEventListener('dispose',()=>disposed++);m.addEventListener('dispose',()=>disposed++);disposeOwned(shared);assert.equal(disposed,2);
});
test('BGM races reuse downloads and cannot resurrect stopped music; decoded cache bounded',async()=>{
 const tracks=Object.fromEntries(['a','b','c','d','e'].map(n=>[n,n+'.mp3'])),g=new GameAudio({audio:tracks}),pending={},calls={},played=[];
 globalThis.fetch=url=>{calls[url]=(calls[url]||0)+1;return new Promise(resolve=>pending[url]=()=>resolve({ok:true,arrayBuffer:async()=>url}))};
 g.ctx={decodeAudioData:async name=>({name,length:5*1024*1024,numberOfChannels:2}),createBufferSource:()=>({connect(){},start(){played.push(this.buffer.name)},stop(){}})};
 const a=g.playBgm('a'),b=g.playBgm('b'),a2=g.playBgm('a');pending['a.mp3']();pending['b.mp3']();await Promise.all([a,b,a2]);assert.equal(calls['a.mp3'],1);assert.deepEqual(played,['a.mp3']);
 for(const n of ['c','d','e']){const p=g.playBgm(n);pending[n+'.mp3']();await p;assert(Object.keys(g.buffers).length<=3);assert(Object.values(g.buffers).reduce((s,b)=>s+b.length*b.numberOfChannels*4,0)<=64*1024*1024);assert(g.buffers[n+'.mp3']);}
 const stopped=g.playBgm('b');g.stopBgm();pending['b.mp3']();await stopped;assert.equal(played.at(-1),'e.mp3');
});
test('SFX aliases share one fetch and decoded buffer',async()=>{
 const g=new GameAudio(null);let fetched=0,decoded=0;globalThis.fetch=async()=>{fetched++;return{ok:true,arrayBuffer:async()=>new ArrayBuffer(1)}};g.ctx={decodeAudioData:async()=>{decoded++;return{sound:true}}};await Promise.all([g.loadSfx('hit','same.mp3'),g.loadSfx('impact','same.mp3')]);assert.equal(fetched,1);assert.equal(decoded,1);assert.equal(g.sfxBuffers.get('hit'),g.sfxBuffers.get('impact'));
});
