import {STORY_DESIGN} from './story-stage-design.js';
import {SCHOOL_QUALITY} from './story-quality-school.js';
import {OFFICE_QUALITY} from './story-quality-office.js';
import {FINALE_QUALITY} from './story-quality-finale.js';
import {addOfficeProps} from './story-office-props.js';
import {addFinaleProps} from './story-finale-props.js';
import {makeQualityKit} from './story-quality-kit.js';
import {paintArtStage} from './story-quality-paint.js?v=20261125perf1';
import {addStoryAmbient} from './story-ambient.js';
export const STORY_QUALITY=Object.freeze({...SCHOOL_QUALITY,...OFFICE_QUALITY,...FINALE_QUALITY});

function detachShell(world,sun){
 const owned=new Set();
 for(const child of [...world.children]){
  if(child===sun||child===sun.target||child.isHemisphereLight)continue;
  child.removeFromParent();
  child.traverse(o=>{if(o.isInstancedMesh)o.dispose();if(o.geometry)owned.add(o.geometry);if(o.material){if(o.material.map)owned.add(o.material.map);owned.add(o.material);}});
 }
 owned.forEach(a=>a.dispose());
}

export function dressStoryQuality(T,scene,d,maze,sun,quality,camera,hero){
 const style=STORY_QUALITY[d.id],world=sun.parent,art=new T.Group();art.name='Illustrated Story | '+d.id;
 detachShell(world,sun);world.add(art);
 const [base,high,dark,mid,lite,line]=style.palette;
 const fogColor=new T.Color(lite).lerp(new T.Color(mid),.53);
 scene.background=fogColor;scene.fog=new T.Fog(fogColor,30,78);
 const hemi=world.children.find(o=>o.isHemisphereLight);
 hemi.color.set(d.warm);hemi.groundColor.set(d.shadow);hemi.intensity=1.52;
 sun.color.set(d.warm);sun.intensity=1.30;

 const pad=new T.Mesh(new T.PlaneGeometry(125,125),new T.MeshBasicMaterial({color:mid}));
 pad.rotation.x=-Math.PI/2;pad.position.y=-.040;art.add(pad);

 const painted=paintArtStage(T,art,maze,style,d.id,camera,hero);
 const kit=makeQualityKit(T,art,{edge:mid,trim:line});
 style.backdrop(kit);
 // Existing unique story pieces are retained as midground subjects. They use
 // several topology-aware placements rather than occupying a fixed prop shelf.
 const wanted=[[-4.6,-9.2],[4.6,-9.2],[-9.2,-9.2],[9.2,-9.2],[-14,0],[14,0],[-14,8],[14,8]];
 const oldMap=(index,cb)=>{
  if(OFFICE_QUALITY[d.id]&&index>1)return;
  // With stage-specific architecture developing deeper, look for blocked pads.
  const override=style.landmarks?.[index], [x,z,a=0]=override||wanted[index];
  const offsets=override?[[0,0]]:[[0,0],[0,-4.6],[-4.6,0],[4.6,0],[0,-9.2],[-9.2,0],[9.2,0]];
  const pad=offsets.map(([dx,dz])=>[x+dx,z+dz])
   .find(([X,Z])=>maze.blocked({x:X,z:Z},.04)&&Math.abs(X)<20&&Math.abs(Z)<22);
  if(!pad)return;
  kit.place(pad[0],pad[1],a,p=>{
    const wide=.92,depth=override?.length>=4?override[3]:.66,height=.96;
    cb({
      box:(x,y,z,w,h,d,col)=>p.box(x*wide,y*height,z*depth,w*wide,h*height,d*depth,col),
      round:(x,y,z,w,h,d,col)=>p.round(x*wide,y*height,z*depth,w*wide,h*height,d*depth,col),
      ball:(x,y,z,w,h,d,col)=>p.ball(x*wide,y*height,z*depth,w*wide,h*height,d*depth,col),
      cyl:(x,y,z,r,b,h,col,n)=>p.cyl(x*wide,y*height,z*depth,r*.90,b*.90,h*height,col,n),
      cone:(x,y,z,r,h,col,n)=>p.cone(x*wide,y*height,z*depth,r*.90,h*height,col,n),
      sign:(x,y,z,w,h,label,fg,bg)=>p.sign(x*wide,y*height,z*depth,w*wide,h*height,label,fg,bg)
    });
  });
 };
 const composed={at:oldMap};
 if(!SCHOOL_QUALITY[d.id])addOfficeProps(d.id,composed)||addFinaleProps(d.id,composed);
 kit.draw();

 // True route barriers stay unchanged physically; treat the risers as low
 // topography rather than tall bands of blocking tape across the screen.
 const box=new T.BoxGeometry(),body=new T.InstancedMesh(box,new T.MeshToonMaterial({color:mid}),maze.walls.length);
 const top=new T.InstancedMesh(box,new T.MeshToonMaterial({color:new T.Color(line).lerp(new T.Color(mid),.55)}),maze.walls.length);
 const q=new T.Object3D(),h=style.ground==='moss'?.25:.13;
 maze.walls.forEach((w,i)=>{
   const x=(w.x0+w.x1)/2,z=(w.z0+w.z1)/2,dx=w.x1-w.x0,dz=w.z1-w.z0;
   q.position.set(x,h*.48,z);q.scale.set(dx*.94,h,dz*.94);q.updateMatrix();body.setMatrixAt(i,q.matrix);
   q.position.y=h+.012;q.scale.set(dx*.97,.035,dz*.97);q.updateMatrix();top.setMatrixAt(i,q.matrix);
 });
 art.add(body,top);
 const marker=new T.Mesh(new T.CylinderGeometry(.46,.55,.10,4),new T.MeshToonMaterial({color:line}));
 marker.position.set(maze.exit.x,.05,maze.exit.z);marker.rotation.y=Math.PI/4;art.add(marker);
 const ambient=addStoryAmbient(T,art,STORY_DESIGN[d.id]);
 const stats={id:d.id,quality:'illustrated',pattern:style.ground,get fxMotion(){return ambient.digest();},fx:ambient.types,payload:ambient.count,
  detailSprites:painted.count,solidPieces:kit.partCount(),meshCount:art.children.length,signs:art.userData.signCount,cells:maze.walkCells.length,wallCount:maze.walls.length};
 return {
  stats,
  update(dt){painted.update();ambient.update(dt);},
  dispose(){ambient.dispose();kit.gradient.dispose();}
 };
}
