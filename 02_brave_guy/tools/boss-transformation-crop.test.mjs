import assert from 'node:assert/strict';
import {createPictureFilm} from '../js/picture-film.js';

const atlas={
  awakening_armor_a:[[0,509],[514,474],[993,543]],
  awakening_armor_b:[[0,436],[445,480],[934,602]],
  incubus_firststrike:[[0,509],[514,507],[1026,510]]
};
const calls=[];
const ctx=new Proxy({}, {get:(target,key)=>target[key]??((...args)=>{
  if(key==='drawImage'||key==='rect'||key==='strokeRect')calls.push([key,...args]);
})});
globalThis.document={createElement:()=>({setAttribute(){},getContext:()=>ctx})};
globalThis.Image=class {naturalWidth=1024; width=1024; naturalHeight=1536; height=1536; async decode(){}};
const header={offsetTop:20,offsetHeight:42},caption={offsetTop:0};
const root={prepend(){},dataset:{},querySelector:sel=>sel==='.cinema-top'?header:caption};
const film=createPictureFilm(root);
await film.prepare(Object.keys(atlas));
for(const [w,h] of [[320,568],[390,844],[844,390],[1280,720]]){
  Object.assign(globalThis,{innerWidth:w,innerHeight:h,devicePixelRatio:2});
  caption.offsetTop=Math.round(h*(h<=450?.68:.73));
  for(const reduced of [false,true]){
    for(const [file,rows] of Object.entries(atlas)){
      for(const [row,[sy,sh]] of rows.entries()){
        calls.length=0;
        film.start();
        film.render([{file,row}],10.92,{reduced,impact:1,zoom:1.08});
        const draws=calls.filter(([key])=>key==='drawImage');
        assert.equal(draws.length,2);
        for(const [,image,...drawing] of draws){
          assert.deepEqual(drawing.slice(0,4),[0,sy,1024,sh],file+' shot '+row+' leaks into adjacent panel');
        }
        const [,,,,,,x,y,dw,dh]=draws[1];
        assert(x>=0 && x+dw<=w && y>=header.offsetTop+header.offsetHeight && y+dh<caption.offsetTop,'sharp art fits between actual overlay controls');
        assert(Math.abs(dw/dh-1024/sh)<1e-8,'original art proportions preserved');
        const clip=calls.find(([key])=>key==='rect');
        if(clip){const [,cx,cy,cw,ch]=clip;assert(x>=cx && y>=cy && x+dw<=cx+cw+1e-6 && y+dh<=cy+ch+1e-6,'camera cannot clip sharp art');}
        assert.deepEqual(calls.find(([key])=>key==='strokeRect').slice(1),[x,y,dw,dh],'frame follows animated artwork');
      }
    }
  }
}
console.log('Boss transformation: 9 panel ranges, 4 viewports, 2 motion settings passed');
