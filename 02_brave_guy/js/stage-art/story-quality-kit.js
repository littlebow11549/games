const css=v=>typeof v==='number'?'#'+v.toString(16).padStart(6,'0'):v;
function rounded(T){
  const geo=new T.BoxGeometry(1,1,1,5,5,5),p=geo.attributes.position;
  const radius=.16,inside=.5-radius, dir=new T.Vector3(), q=new T.Vector3();
  for(let i=0;i<p.count;i++){
    dir.fromBufferAttribute(p,i);
    q.set(...dir.toArray().map(n=>Math.max(-inside,Math.min(inside,n))));
    dir.sub(q).normalize().multiplyScalar(radius).add(q);
    p.setXYZ(i,dir.x,dir.y,dir.z);
  }
  geo.computeVertexNormals();return geo;
}
export function makeQualityKit(T,root,stage){
  const calls=new Map(),labels=[],gradient=new T.DataTexture(new Uint8Array([113,181,250]),3,1,T.RedFormat);
  gradient.minFilter=gradient.magFilter=T.NearestFilter;gradient.generateMipmaps=false;gradient.needsUpdate=true;
  const slots=[[-4.6,-9.2,0],[4.6,-9.2,0],[-9.6,-9.45,.14],[9.6,-9.45,-.14],[-14.7,0,.75],[14.7,0,-.75],[-15,8,1.08],[15,8,-1.08],[-13.35,.2,.6],[13.35,.2,-.6],[-7.7,-18.8,.18],[7.7,-18.8,-.18],[0,-22.1,0]];
  const temp=new T.Object3D(),col=new T.Color();
  const contour=new T.Color(stage.edge).multiplyScalar(.61);
  function call(key,data){
    if(!calls.has(key))calls.set(key,[]);
    calls.get(key).push(data);
  }
  function at(slot,cb){
    if(!slots[slot])return;
    const [ox,oz,yaw]=slots[slot];
    assemble(ox,oz,yaw,cb,slot<4?.87:.90,slot<4?.58:.61);
  }
  function place(x,z,yaw,cb){assemble(x,z,yaw,cb,1,1);}
  function assemble(ox,oz,yaw,cb,scale,zscale){

    const rot=(x,z)=>[ox+x*Math.cos(yaw)+z*Math.sin(yaw),oz-x*Math.sin(yaw)+z*Math.cos(yaw)];
    const put=(key,x,y,z,w,h,d,color)=>{
      const [xx,zz]=rot(x*scale,z*zscale);
      call(key,[xx,y*scale,zz,w*scale,h*scale,d*zscale,color,yaw]);
    };
    cb({
      box:(...a)=>put('box',...a),
      round:(...a)=>put('round',...a),
      ball:(...a)=>put('ball',...a),
      cyl:(x,y,z,rt,rb,h,color,verts=12)=>put('cyl|'+Number(rt/rb).toFixed(2)+'|'+verts,x,y,z,rb,h,rb,color),
      cone:(x,y,z,r,h,color,verts=8)=>put('cyl|0|'+verts,x,y,z,r,h,r,color),
      sign:(x,y,z,w,h,label,fg,bg)=>{
        const [xx,zz]=rot(x*scale,z*zscale);labels.push([xx,y*scale,zz,w*scale,h*scale,label,fg,bg,yaw]);
      },
    });
  }
  function draw(){
    for(const [kind,items] of calls){
      let geo;
      if(kind==='round')geo=rounded(T);
      else if(kind==='ball')geo=new T.SphereGeometry(1,12,8);
      else if(kind.startsWith('cyl')){
        const [,ratio,vert]=kind.split('|');geo=new T.CylinderGeometry(+ratio,1,1,+vert);
      } else geo=new T.BoxGeometry();
      const mat=new T.MeshToonMaterial({color:0xffffff,gradientMap:gradient});
      const group=new T.InstancedMesh(geo,mat,items.length);
      group.receiveShadow=true;
      group.castShadow=kind==='round'||kind==='box';
      items.forEach(([x,y,z,w,h,d,color,yaw],i)=>{
        temp.position.set(x,y,z);temp.scale.set(w,h,d);temp.rotation.set(0,yaw,0);temp.updateMatrix();
        group.setMatrixAt(i,temp.matrix);group.setColorAt(i,col.set(color));
      });
      root.add(group);
    }
    if(labels.length){
      const cv=document.createElement('canvas');cv.width=1024;cv.height=Math.ceil(labels.length/4)*128;
      const c=cv.getContext('2d'),p=[],uv=[],positions=[];
      labels.forEach(([x,y,z,w,h,label,fg,bg,yaw],i)=>{
        const sx=(i%4)*256,sy=Math.floor(i/4)*128;
        c.fillStyle='#342b39';c.beginPath();c.roundRect(sx+3,sy+4,250,120,19);c.fill();
        c.fillStyle=css(bg);c.beginPath();c.roundRect(sx+8,sy+9,240,108,16);c.fill();
        c.fillStyle=css(fg);c.textAlign='center';c.textBaseline='middle';
        const n=[...String(label)].length,f=Math.min(65,Math.floor(223/Math.max(1,n)));
        c.font='900 '+f+'px system-ui,"Microsoft JhengHei",sans-serif';c.fillText(label,sx+128,sy+65,222);
        const base=positions.length/3;
        for(const [a,b] of [[-1,-1],[1,-1],[1,1],[-1,1]]){
          const dx=a*w/2;positions.push(x+dx*Math.cos(yaw),y+b*h/2,z-dx*Math.sin(yaw)+.035);
          uv.push((sx+(a+1)*128)/1024,1-(sy+(1-b)*64)/cv.height);
        }
        p.push(base,base+1,base+2,base,base+2,base+3);
      });
      const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;
      const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(p);
      root.add(new T.Mesh(geo,new T.MeshBasicMaterial({map:tex,alphaTest:.3,transparent:false,side:T.DoubleSide})));
    }
    root.userData.signCount=labels.length;
  }
  return {at,place,draw,gradient,contour,partCount:()=>[...calls.values()].reduce((a,b)=>a+b.length,0)};
}
