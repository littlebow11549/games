import {makeQualityKit} from './story-quality-kit.js';

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

export function mountLandmarks(T,root,maze,camera,hero,edge,specs){
 const groups=[];
 for(const spec of specs){
   const group=new T.Group();group.name=spec.name;
   const kit=makeQualityKit(T,group,{edge});
   kit.place(0,0,spec.yaw,spec.draw);kit.draw();
   const dispose=()=>{
    kit.gradient.dispose();
    for(const mesh of group.children){mesh.dispose();mesh.geometry.dispose();mesh.material.dispose();}
    group.removeFromParent();
   };
   for(const batch of group.children)batch.name=spec.name+' / instanced forms';
   const side=Math.sign(spec.x);
   const candidates=spec.candidates??[[0,0],[side*.65,0],[side*1.3,0],[side*1.7,.75],[side*2.4,0]];
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
