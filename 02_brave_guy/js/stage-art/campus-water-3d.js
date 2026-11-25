// A small, freestanding two-tier campus cascade. All art is solid mesh geometry.
// Local +Z flows downstream; update's dt is seconds.
export function makeWaterfall(THREE) {
  const root = new THREE.Group();
  root.name = 'SunnyCampusWaterfall3D';
  const disposables = new Set();
  const keep = r => (disposables.add(r), r);
  const basic = (color, extra) => keep(new THREE.MeshBasicMaterial({color, toneMapped:false, ...extra}));
  const edge = basic('#37506a', {side:THREE.BackSide});
  const rockMat = basic('#ffffff', {vertexColors:true});
  const waterEdge = basic('#227caf');
  const waterBlue = basic('#43c7ed');
  const mint = basic('#a6f3f8');
  const white = basic('#fffef6');
  const color = x => new THREE.Color(x);
  const darkRock = color('#556881'), middleRock = color('#8699aa'), litRock = color('#b2c3c3');
  const darkWarm = color('#70798b'), midWarm = color('#9ba9b3'), lightWarm = color('#bcc8c7');
  const sourceSphere = keep(new THREE.SphereGeometry(1,16,10));
  const shape = sourceSphere.attributes.position;
  const obj = new THREE.Object3D();
  const pathPoint = new THREE.Vector3();
  let dead = false;

  function mesh(geometry, material, name) {
    const m = new THREE.Mesh(geometry,material); m.name = name; root.add(m); return m;
  }
  function setTransform(target, index, x,y,z, sx,sy,sz, ry=0) {
    obj.position.set(x,y,z); obj.scale.set(sx,sy,sz); obj.rotation.set(0,ry,0); obj.updateMatrix();
    target.setMatrixAt(index,obj.matrix);
  }

  // Squat fitted rocks curve around the back and each bank, leaving the notch,
  // middle terrace and apron visible. Rear rocks carry their own cel colors.
  const stones = [
    [-.07,.82,-.92, 1.28,.84,.66,.03], [ -1.20,.85,-.76,.97,.95,.75,-.17],
    [ 1.08,.88,-.83,1.12,.98,.75,.22], [-.68,1.67,-1.02,.84,.88,.56,.20],
    [ .65,1.73,-1.00,.91,.98,.54,-.21],[-1.56,1.55,-.58,.71,.97,.73,.18],
    [ 1.58,1.46,-.54,.76,.94,.76,-.32],[-.99,2.16,-.75,.64,.57,.56,-.25],
    [ 1.05,2.15,-.72,.63,.66,.52,.19],[-1.65,1.18,.14,.74,.65,.67,-.30],
    [ 1.60,1.13,.12,.77,.65,.70,.22],[-1.14,.63,.63,.75,.62,.60,.16],
    [ 1.12,.61,.65,.77,.62,.62,-.37],[-1.98,.45,.62,.57,.46,.49,-.18],
    [ 1.99,.42,.65,.54,.42,.52,.18],[-.93,.26,1.21,.50,.26,.37,.31],
    [ 1.02,.31,1.17,.53,.31,.39,-.32],
  ];
  const vertices=[], outlines=[], colors=[], indices=[];
  const blend = new THREE.Color();
  stones.forEach(([x,y,z,sx,sy,sz,rot],i)=>{
    const start=vertices.length/3, sin=Math.sin(rot), cos=Math.cos(rot);
    const warm=i%4===2;
    for(let j=0;j<shape.count;j++){
      const a=shape.getX(j), b=shape.getY(j), c=shape.getZ(j);
      const wr=1+.067*Math.sin(a*5+c*4+i)*Math.cos(b*4-c*3);
      // Slight superellipse and asymmetry keep the forms round, not spherical.
      const curve=t=>Math.sign(t)*Math.pow(Math.abs(t),.82);
      const ax=sx*(curve(a)*wr+.09*b), az=sz*curve(c)*wr;
      const dy=sy*curve(b)*wr, dx=ax*cos+az*sin, dz=-ax*sin+az*cos;
      vertices.push(x+dx,Math.max(.025,y+dy),z+dz);
      outlines.push(x+dx*1.038,Math.max(.015,y+dy*1.038),z+dz*1.038);
      const shade=b*.83-a*.34+c*.40;
      const smooth=(lo,hi,v)=>{const t=THREE.MathUtils.clamp((v-lo)/(hi-lo),0,1);return t*t*(3-2*t);};
      blend.copy(warm?darkWarm:darkRock).lerp(warm?midWarm:middleRock,smooth(-.30,-.15,shade))
           .lerp(warm?lightWarm:litRock,smooth(.36,.53,shade));
      colors.push(blend.r,blend.g,blend.b);
    }
    for(let j=0;j<sourceSphere.index.count;j++) indices.push(start+sourceSphere.index.getX(j));
  });
  function rockGeometry(v,includeColor) {
    const g=keep(new THREE.BufferGeometry());
    g.setIndex(indices);g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));
    if(includeColor)g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
    g.computeVertexNormals();return g;
  }
  mesh(rockGeometry(outlines,false),edge,'Rock ink silhouette');
  mesh(rockGeometry(vertices,true),rockMat,'Round cel stone terraces');

  // Geometry sweeps an elliptical cross-section through the bend and falls.
  // Split into dark body and a smaller light front sheet for legible sides.
  function sweep(points,widths,material,name,{inset=0,thickness=.10}={}){
    const v=[], index=[], sides=14, n=points.length;
    for(let i=0;i<n;i++){
      const p=points[i], prev=points[Math.max(0,i-1)], next=points[Math.min(n-1,i+1)];
      const dy=next[0]-prev[0], dz=next[1]-prev[1], len=Math.hypot(dy,dz)||1;
      const ny=dz/len, nz=-dy/len;
      for(let j=0;j<sides;j++){
        const a=j*Math.PI*2/sides;
        const r=1+.035*Math.sin(i*1.47+j*.87);
        const h=inset+Math.sin(a)*thickness*r;
        v.push((p[2]??0)+Math.cos(a)*widths[i]*r,p[0]+ny*h,p[1]+nz*h);
      }
      if(i>0)for(let j=0;j<sides;j++){
        const k=(j+1)%sides,a=(i-1)*sides+j,b=(i-1)*sides+k,c=i*sides+j,d=i*sides+k;
        index.push(a,b,c,b,d,c);
      }
    }
    for(let j=1;j<sides-1;j++) index.push(0,j+1,j,(n-1)*sides,(n-1)*sides+j,(n-1)*sides+j+1);
    const g=keep(new THREE.BufferGeometry());
    g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(index);g.computeVertexNormals();
    return mesh(g,material,name);
  }
  const top=[[2.54,-1.05,-.08],[2.55,-.68,-.07],[2.50,-.35,-.05],[2.32,-.18,-.01],
             [1.97,-.09,.025],[1.53,-.035,.03],[1.36,.15,.02],[1.34,.37,.00]];
  const lower=[[1.34,-.09,.04],[1.35,.29,.07],[1.31,.58,.07],[1.15,.75,.06],
               [.81,.84,.04],[.31,.96,.02],[.13,1.17,.02],[.12,1.44,.04]];
  const paths=[top,lower];
  const widths=[[.38,.56,.60,.52,.48,.48,.61,.70],[.68,.81,.81,.72,.64,.67,.81,.68]];
  paths.forEach((p,i)=>{
    const w=widths[i];
    sweep(p,w,waterEdge,'Deep blue cascade '+(i+1),{thickness:.14});
    sweep(p,w.map(q=>q*.88),waterBlue,'Vivid face curtain '+(i+1),{inset:.128,thickness:.074});
  });
  function disk(name,x,y,z,sx,sy,sz,m){
    const o=mesh(sourceSphere,m,name);o.position.set(x,y,z);o.scale.set(sx,sy,sz);return o;
  }
  disk('Middle basin blue lip',.045,1.34,.26,.785,.125,.45,waterEdge);
  disk('Middle basin turquoise surface',.062,1.411,.36,.704,.075,.32,waterBlue);
  disk('Foot dispersal',.03,.092,1.22,.93,.065,.45,waterBlue);
  disk('Foot shoreline light',.07,.127,1.23,.78,.046,.37,mint);

  function animatedMesh(material,count,name) {
    const im=new THREE.InstancedMesh(sourceSphere,material,count);
    im.name=name;im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);im.frustumCulled=false;
    root.add(im);return im;
  }
  const streams=animatedMesh(white,12,'Flowing white graphic strokes');
  const foam=animatedMesh(white,15,'Bobbing white scalloped foam');
  const drops=animatedMesh(mint,15,'Pale cyan droplets');
  const poolArcs=animatedMesh(white,4,'Short expanding basin glints');
  const segments=paths.map(p=>p.map((a,i)=>i>0?Math.hypot(a[0]-p[i-1][0],a[1]-p[i-1][1]):0));
  const lengths=segments.map(a=>a.reduce((sum,d)=>sum+d,0));
  let elapsed=0;
  function sample(p,t) {
    const a=paths[p], len=segments[p];
    let rest=t*lengths[p], i=1;
    while(i<a.length-1&&rest>len[i]) rest-=len[i++];
    const f=THREE.MathUtils.clamp(rest/len[i],0,1), v=a[i-1], w=a[i];
    const dy=w[0]-v[0],dz=w[1]-v[1];
    pathPoint.set(0,v[0]+dy*f,v[1]+dz*f);
    return {s:i,f,dy,dz,dist:len[i]};
  }
  function update(dt) {
    if(dead) return;
    if(Number.isFinite(dt)) elapsed=(elapsed+Math.max(0,Math.min(.12,dt)))%7000;
    for(let i=0;i<12;i++){
      const p=i<5?0:1,j=i-(p?5:0),t=(elapsed*(p?.72:.81)+i*.247)%1;
      const {s,f,dy,dz,dist}=sample(p,t), u=widths[p][s-1]*(1-f)+widths[p][s]*f;
      const tFade=Math.min(1,t*11,(1-t)*11);
      const center=paths[p][s][2]??0;
      obj.position.set(center+(j%3-1)*u*.43+Math.sin(i*2.9)*.08,pathPoint.y+dz/dist*.205,pathPoint.z-dy/dist*.207);
      obj.rotation.set(Math.atan2(dz,dy),0,0);
      obj.scale.set((i%3===1?.065:.038)*tFade,(.11+.067*(i%3))*tFade,.022*tFade);
      obj.updateMatrix();streams.setMatrixAt(i,obj.matrix);
    }
    for(let i=0;i<15;i++){
      const p=i<6?0:1, j=i-(p?6:0), spread=p?8:5;
      const xx=(j/spread-.5)*(p?1.56:1.20)+.05;
      const wobble=Math.sin(elapsed*7.5+i*1.7);
      const z=p?1.36:.39,y=p?.17:1.45;
      setTransform(foam,i,xx,y+wobble*.027,z+.077*Math.sin(i*1.4+elapsed*3),
        .10+.042*(i%3),.072+.025*((i+1)%4),.103+.024*(i%4),i);
      const t=(elapsed*(.89+.071*(i%4))+i*.219)%1;
      const f=Math.sin(t*Math.PI),r=.024+.016*(i%3);
      setTransform(drops,i,xx+(j/spread-.5)*t*.34,y+.06+f*(.14+.055*(i%5)),z+.04+t*.23,
        r*f,r*(1.1+.30*f)*f,r*f);
    }
    for(let i=0;i<4;i++){
      const p=i<2?0:1,t=(elapsed*.92+i*.389)%1,f=Math.sin(t*Math.PI);
      setTransform(poolArcs,i,.08+(i%2-.5)*.53,(p?.147:1.49)+.016*f,(p?1.36:.38)+.18*t,
        (.10+.19*t)*f,.012*f,.024*f,i%2?.08:-.09);
    }
    [streams,foam,drops,poolArcs].forEach(m=>{m.instanceMatrix.needsUpdate=true;});
  }
  update(0);
  function dispose(){
    if(dead)return;
    dead=true;
    root.removeFromParent();
    root.clear();
    [streams,foam,drops,poolArcs].forEach(o=>o.dispose());
    for(const object of disposables) object.dispose();
    disposables.clear();
  }
  return {root,update,dispose};
}
