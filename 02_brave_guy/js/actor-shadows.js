// One soft contact batch grounds actors and complements a projected sun shadow.
export function createActorShadows(THREE,scene) {
  // Up to 400 live mobs, plus special actors and the brief death-animation overlap.
  const size=32, max=512, data=new Uint8Array(size*size*4);
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
  const strength=new THREE.InstancedBufferAttribute(new Float32Array(max),1).setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('contactOpacity',strength);
  const mat=new THREE.MeshBasicMaterial({color:0x191523,map,transparent:true,alphaTest:.016,depthWrite:false,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-1});
  mat.onBeforeCompile=shader=>{
    shader.vertexShader='attribute float contactOpacity;\nvarying float vContactOpacity;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvContactOpacity=contactOpacity;');
    shader.fragmentShader='varying float vContactOpacity;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <alphatest_fragment>','diffuseColor.a*=vContactOpacity;\n#include <alphatest_fragment>');
  };
  const mesh=new THREE.InstancedMesh(geo,mat,max);
  mesh.count=0;mesh.frustumCulled=false;mesh.name='Actor contact shadows';
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(mesh);
  const matrix=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3();
  let count=0,realTime=false;
  function casts(root){
    let active=false;
    root.traverseVisible(o=>{if(o.isMesh&&o.castShadow)active=true;});
    return active;
  }
  function stamp(root,rx,rz,opacity,mayCast=true,minY=-Infinity){
    if(!root?.visible||root.position.y<minY||count>=max)return;
    // Keep the shadow on the floor, not on the sprite. A higher source gives a
    // larger, dimmer and softer penumbra instead of a dark shrinking dot.
    // A caster does not guarantee a readable projection: the illustrated floor
    // uses a faint separate ShadowMaterial receiver. Retain a tight contact
    // anchor rather than drawing a second full-strength silhouette.
    const projected=realTime&&mayCast&&casts(root);
    if(projected)opacity*=.61;
    const {x,y,z}=root.position,height=Math.max(0,y),spread=(1+Math.min(height,3)*.11)*(projected?.81:1);
    const phase=Math.max(.06,root.scale.x);
    p.set(x,.045,z);
    s.set(rx*spread*phase,1,rz*spread*phase);
    matrix.compose(p,q,s);
    strength.setX(count,opacity*Math.min(1,phase*1.5)/(1+height*.69));
    mesh.setMatrixAt(count++,matrix);
  }
  return {
    update(hero,ally,enemies,ambush,sunShadows) {
      count=0;realTime=sunShadows;
      stamp(hero?.visual?.root,hero?.form==='brave'?.98:.86,.65,.57);
      stamp(ally?.visual?.root,.64,.52,.46);
      // Prioritize boss and special silhouettes over ordinary mobs if the batch fills.
      for(const e of enemies)if(e.shown&&e.def.boss){
        const boss=e.kind==='incubus';
        stamp(e.visual?.root,boss?1.21:Math.max(.85,e.def.radius*1.15),boss?.9:Math.max(.66,e.def.radius*.8),.58);
      }
      stamp(ambush?.visual?.root,.58,.46,.49,true,-.2);
      for(const e of enemies)if(e.shown&&!e.def.boss){
        const radius=e.def.radius/(e.size||1);
        stamp(e.visual?.root,radius*1.75,radius*1.4,.54,false);
      }
      mesh.count=count;
      // Only upload matrices used this frame; normal density keeps the same draw workload.
      if(count>0){
        mesh.instanceMatrix.clearUpdateRanges();
        mesh.instanceMatrix.addUpdateRange(0,count*16);
        mesh.instanceMatrix.needsUpdate=true;
        strength.clearUpdateRanges();strength.addUpdateRange(0,count);strength.needsUpdate=true;
      }
    }
  };
}
