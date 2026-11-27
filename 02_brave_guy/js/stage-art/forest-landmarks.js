import {makeQualityKit} from './story-quality-kit.js';

// Chapter 2 landmark silhouettes are composed out of solid, instanced toon meshes.
// Shape numbers are in world units so the full footprint can be verified against the maze.
const c={
 bark:0x92776e,darkBark:0x564551,grain:0xb5a886,moss:0x71a486,fern:0x8dc497,
 shade:0x42656a,stone:0x647b8a,face:0x8ca99d,cap:0xec819f,capCool:0xb79fe1,
 rim:0xf6bac4,cream:0xeecfa9,honey:0xffda81,moon:0xe0ffba,deep:0x2d494e
};

function foliage(p,x,z,s){
 const at=(u,y,v,w,h,d,col)=>p.ball(x+u*s,y*s,z+v*s,w*s,h*s,d*s,col);
 at(0,.08,0,.33,.11,.23,c.shade);
 for(const [u,v,i] of [[-.18,.04,0],[.0,-.10,1],[.19,.02,0],[-.02,.12,1]]){
   at(u,.22,v,.14,.24,.115,i?c.fern:c.moss);
   at(u,.31,v+.047,.048,.12,.046,c.moon);
 }
}

function mushroom(p,x,z,s,color){
 const at=(u,y,v,w,h,d,col)=>p.ball(x+u*s,y*s,z+v*s,w*s,h*s,d*s,col);
 p.cyl(x,.31*s,z,.16*s,.30*s,.62*s,c.cream,12);
 at(0,.58,0,.65,.16,.56,c.darkBark);
 at(0,.66,0,.70,.18,.60,c.rim);
 at(0,.82,-.04,.68,.35,.59,color);
 for(const [u,y,v,r] of [[-.38,.95,.28,.073],[.30,1.01,.21,.095],[.10,1.08,-.09,.067],[-.17,.89,.48,.054],[.49,.88,-.13,.05]]){
  at(u,y,v,r,.058,r*.91,c.cream);
 }
}

function woodland(p){
 p.ball(0,.07,-.12,1.87,.17,.84,c.shade);
 p.ball(-.08,.16,-.10,1.68,.19,.75,c.moss);
 const x=-.37,z=-.31;
 // Flared roots and carved bark, with the lantern recessed into the front.
 for(const [u,v,i] of [[-.57,.24,0],[.49,.18,1],[-.19,-.50,1],[.14,.53,0]]){
   p.ball(x+u,.28,z+v,.44,.25,.38,i?c.bark:c.darkBark);
 }
 p.cyl(x,1.06,z,.57,.72,1.96,c.darkBark,12);
 p.cyl(x,1.12,z,.55,.64,1.87,c.bark,12);
 p.cyl(x,2.06,z,.56,.59,.17,c.cream,12);
 p.cyl(x,2.155,z,.42,.42,.033,c.grain,12);
 p.cyl(x,2.178,z,.30,.30,.018,c.cream,12);
 p.cyl(x,2.192,z,.14,.14,.014,c.grain,12);
 p.ball(x,1.23,z+.54,.38,.48,.19,c.deep);
 p.ball(x,1.23,z+.66,.23,.32,.11,c.honey);
 p.round(x,1.23,z+.771,.052,.57,.025,c.bark);
 p.round(x,1.24,z+.77,.45,.044,.027,c.bark);
 p.round(x-.44,.73,z+.43,.105,.68,.09,c.grain);
 p.round(x+.43,1.49,z+.35,.10,.58,.08,c.grain);
 p.ball(x-.39,2.12,z-.14,.30,.22,.25,c.fern);
 p.ball(x+.31,2.17,z-.14,.32,.16,.25,c.moss);
 mushroom(p,.86,-.07,1.21,c.cap);
 mushroom(p,1.25,.34,.64,c.capCool);
 mushroom(p,-1.45,.10,.57,c.capCool);
 foliage(p,.15,.50,.86);
 foliage(p,-1.26,-.48,.84);
 p.ball(-.98,.17,.47,.27,.22,.18,c.stone);
 p.ball(.53,.14,.61,.19,.17,.18,c.face);
}

function moonGarden(p){
 p.ball(0,.07,-.12,1.89,.17,.86,c.shade);
 p.ball(.04,.17,-.12,1.67,.19,.76,c.moss);
 // Taller stones flank a clean silhouette and leave a bright moonstone in the middle.
 for(const [x,z,h] of [[-1.15,-.25,1.36],[1.08,-.25,1.75],[.66,-.62,2.48]]){
   p.round(x,h*.48,z,.71,h,.63,c.stone);
   p.ball(x-.03,h*.74,z+.03,.35,h*.21,.32,c.face);
   p.round(x+.075,h*.48,z+.321,.23,.049,.026,c.grain);
   p.round(x+.075,h*.48+.12,z+.321,.21,.045,.026,c.grain);
   p.ball(x,h*.94,z-.02,.35,.132,.30,c.moss);
 }
 p.cyl(-.18,.29,.02,.63,.76,.35,c.stone,12);
 p.cyl(-.18,.53,.02,.65,.63,.14,c.face,12);
 p.cyl(-.18,.82,.02,.32,.30,.53,c.moon,6);
 p.cone(-.18,1.28,.02,.322,.42,c.moon,6);
 p.ball(-.24,1.01,.291,.037,.19,.027,c.cream);
 for(const [x,z] of [[-.62,.19],[.23,.17]]){
  p.cyl(x,.72,z,.12,.15,.30,c.fern,6);
  p.cone(x,.95,z,.12,.16,c.moon,6);
 }
 mushroom(p,-1.38,.36,.60,c.cap);
 mushroom(p,1.32,.29,.49,c.capCool);
 foliage(p,.48,.53,.83);
 foliage(p,-.71,-.53,.72);
 p.ball(-.96,.22,.46,.28,.19,.26,c.darkBark);
 p.ball(.94,.19,.48,.34,.22,.22,c.face);
}

function blockedFootprint(maze,box){
 // Test against open grid rectangles, not just a center ray; no canopy overhang into a path.
 const r=maze.cell/2+.09;
 return maze.walkCells.every(p=>p.x+r<=box.min.x||p.x-r>=box.max.x||p.z+r<=box.min.z||p.z-r>=box.max.z);
}
function cutsSight(box,a,b){
 let lo=.37,hi=1.015;
 for(const k of ['x','y','z']){
   const from=a[k],d=b[k]+(k==='y'?1.05:0)-from;
   const pad=k==='y'?.14:.28,min=box.min[k]-pad,max=box.max[k]+pad;
   if(Math.abs(d)<1e-6){if(from<min||from>max)return false;continue;}
   const u=(min-from)/d,v=(max-from)/d;
   lo=Math.max(lo,Math.min(u,v));hi=Math.min(hi,Math.max(u,v));
   if(lo>hi)return false;
 }
 return true;
}

export function makeForestLandmarks(T,root,maze,camera,hero){
 const groups=[];
 const specs=[
  {name:'Forest | Carved lantern grove',x:-9.03,z:-4.13,yaw:.16,draw:woodland},
  {name:'Forest | Moonstone garden',x:9.10,z:-7.35,yaw:-.16,draw:moonGarden}
 ];
 for(const spec of specs){
   const group=new T.Group();group.name=spec.name;
   const kit=makeQualityKit(T,group,{edge:c.deep});
   kit.place(0,0,spec.yaw,spec.draw);kit.draw();
   const dispose=()=>{
    kit.gradient.dispose();
    for(const mesh of group.children){mesh.dispose();mesh.geometry.dispose();mesh.material.dispose();}
    group.removeFromParent();
   };
   for(const batch of group.children)batch.name=spec.name+' / instanced forms';
   const side=Math.sign(spec.x);
   const candidates=[[0,0],[side*.65,0],[side*1.3,0],[side*1.7,.75],[side*2.4,0]];
   let box;
   for(const [dx,dz] of candidates){
     group.position.set(spec.x+dx,0,spec.z+dz);
     const b=new T.Box3().setFromObject(group);
     if(blockedFootprint(maze,b)){box=b;break;}
   }
   if(!box){dispose();continue;}
   root.add(group);groups.push({group,box,dispose,parts:kit.partCount()});
 }
 return {
   count:groups.length,
   solids:groups.reduce((n,o)=>n+o.parts,0),
   entries:groups.map(({group})=>[group.position.x,group.position.z]),
   update(){for(const {group,box} of groups)group.visible=!cutsSight(box,camera.position,hero.pos);},
   dispose(){for(const {dispose} of groups)dispose();}
 };
}
