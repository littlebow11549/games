// Presentation budget only: simulation positions, active state, damage and radar
// membership are deliberately not modified.
export const needsChaseSight=(ranged,d,reach)=>d<=reach||(ranged&&d<=7);

export function makeCrowdVisualBudget(THREE){
 const projection=new THREE.Matrix4(),frustum=new THREE.Frustum(),shape=new THREE.Sphere();
 const hidden=[],elapsed=new WeakMap();
 let pressure=false;
 function classify(enemies,camera,hero,locked){
  hidden.length=0;
  pressure=enemies.length>=36;
  if(pressure){
   camera.updateMatrixWorld();
   projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
   frustum.setFromProjectionMatrix(projection);
  }
  for(const e of enemies){
   const protectedActor=e.def.boss||e===locked;
   const dx=e.pos.x-hero.x,dz=e.pos.z-hero.z,d2=dx*dx+dz*dz;
   let omit=false,step=0;
   if(pressure&&!protectedActor&&d2>7.5*7.5){
    // Explicit generous margin for body animation, weapons, launch, shadows,
    // and camera movement. Bias toward keeping anything near the frame.
    const height=e.def.height||1.8, r=e.def.radius||.5;
    shape.center.set(e.pos.x,(e.y||0)+height*.52,e.pos.z);
    shape.radius=Math.max(height*.95,r*2.1)+1.9;
    omit=!frustum.intersectsSphere(shape);
    if(d2>10*10)step=omit?.10:.046;
   }
   e.crowdDrawOmit=omit;
   e.crowdAnimStep=step;
   if(omit&&e.visual.root.visible)hidden.push(e.visual.root);
  }
 }
 function flush(e){
  const dt=elapsed.get(e);
  if(dt>0){elapsed.delete(e);e.visual.update(dt);}
 }
 function animate(e,dt){
  const budget=e.shown&&e.state==='chase'&&!e.fly&&!e.y&&!e.vy&&!e.stun&&!e.guestHold?(e.crowdAnimStep||0):0;
  const pending=(elapsed.get(e)||0)+dt;
  if(budget>0&&pending+1e-9<budget){elapsed.set(e,pending);return;}
  elapsed.delete(e);
  e.visual.update(pending);
 }
 function draw(drawFrame){
  for(const root of hidden)root.visible=false;
  try{return drawFrame();}
  finally{for(const root of hidden)root.visible=true;}
 }
 return {classify,animate,flush,draw,get hiddenCount(){return hidden.length;}};
}

// Lower only the WebGL drawing resolution when a crowd is actually slow.
// The HTML HUD and the radar remain at their original resolution.
export function makeCrowdResolution(){
 const levels=[1,.85,.72];
 let tier=0,slow=0,fast=0,frames=0;
 return {
  get scale(){return levels[tier];},
  tick(dt,count,playing){
   if(!playing){slow=fast=frames=0;return false;}
   const t=Math.min(.18,Math.max(0,dt));
   const underLoad=count>=36&&t>1/38&&tier<levels.length-1;
   const canRecover=tier>0&&(count<30||t<1/55);
   slow=underLoad?slow+t:0;
   frames=underLoad?frames+1:0;
   fast=canRecover?fast+t:0;
   if(slow>=.48&&frames>=7){tier++;slow=fast=frames=0;return true;}
   if(fast>=1.8){tier--;slow=fast=frames=0;return true;}
   return false;
  },
 };
}
