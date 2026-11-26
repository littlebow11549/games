// A single soft footprint batch keeps actors grounded when real-time shadows are off.
export function createActorShadows(THREE,scene) {
  const size=32, max=128, data=new Uint8Array(size*size*4);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const i=(y*size+x)*4;
    const r=Math.hypot((x+.5)*2/size-1,(y+.5)*2/size-1);
    const u=Math.max(0,Math.min(1,(1-r)/.62));
    data[i]=data[i+1]=data[i+2]=255;
    data[i+3]=Math.round(u*u*(3-2*u)*255);
  }
  const map=new THREE.DataTexture(data,size,size);
  map.minFilter=map.magFilter=THREE.LinearFilter;map.needsUpdate=true;
  const geo=new THREE.PlaneGeometry(2,2).rotateX(-Math.PI/2);
  const mat=new THREE.MeshBasicMaterial({color:0x15121a,map,transparent:true,opacity:.56,depthWrite:false,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-1});
  const mesh=new THREE.InstancedMesh(geo,mat,max);
  mesh.count=0;mesh.frustumCulled=false;mesh.name='Actor contact shadows';
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(mesh);
  const matrix=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3();
  let count=0;
  function stamp(root,rx,rz,minY=-Infinity){
    if(!root?.visible||root.position.y<minY||count>=max)return;
    const {x,y,z}=root.position, height=Math.max(0,y), weight=1/(1+height*.18);
    const phase=Math.max(.06,root.scale.x);
    p.set(x,.045,z);
    s.set(rx*weight*phase,1,rz*weight*phase);
    matrix.compose(p,q,s);
    mesh.setMatrixAt(count++,matrix);
  }
  return {
    update(hero,ally,enemies,ambush,realTime) {
      count=0;
      mat.opacity=realTime?.37:.59;
      stamp(hero?.visual?.root,hero?.form==='brave'?.98:.86,.65);
      stamp(ally?.visual?.root,.64,.52);
      // Prioritize boss and special silhouettes over ordinary mobs if the batch fills.
      for(const e of enemies)if(e.shown&&e.def.boss){
        const boss=e.kind==='incubus';
        stamp(e.visual?.root,boss?1.21:Math.max(.85,e.def.radius*1.15),boss?.9:Math.max(.66,e.def.radius*.8));
      }
      stamp(ambush?.visual?.root,.58,.46,-.2);
      for(const e of enemies)if(e.shown&&!e.def.boss){
        const radius=e.def.radius/(e.size||1);
        stamp(e.visual?.root,radius*1.75,radius*1.4);
      }
      mesh.count=count;
      mesh.instanceMatrix.needsUpdate=count>0;
    }
  };
}
