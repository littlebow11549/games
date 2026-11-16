import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMaze} from '../js/maze.js';
import {Vector3} from '../vendor/three/three.module.min.js';
function seeded(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
test('enemies navigate walls and outer-rim hero positions across maze seeds and body sizes',()=>{
 const original=Math.random;let routes=0;
 try{for(let seed=1;seed<=12;seed++){
 Math.random=seeded(seed);const maze=makeMaze({radius:26,n:7+seed%4,open:.12,clear:7.5});
 for(const body of [.42,.84,1.8])for(const goal of [new Vector3(),new Vector3(21,0,0),new Vector3(-15,0,-15)]){
  maze.collide(goal,.5);maze.updateFlow(goal);
  for(let k=0;k<8;k++){
   const a=k*Math.PI/4;const pos=new Vector3(Math.cos(a)*(25-body),0,Math.sin(a)*(25-body));maze.collide(pos,body);const out=new Vector3();
   let steps=0;
   for(;steps<2400&&pos.distanceTo(goal)>2.8;steps++){
    maze.steer(pos,goal,out,body);pos.addScaledVector(out,.08);maze.collide(pos,body);
    if(pos.length()>26-body)pos.setLength(26-body);
   }
   assert(pos.distanceTo(goal)<=2.8,`seed ${seed} radius ${body} start ${k} goal ${goal.x},${goal.z} stopped ${pos.x},${pos.z}`);routes++;
  }
 }
 maze.dispose();
 }}finally{Math.random=original;}
 console.log('verified routes',routes);
});
