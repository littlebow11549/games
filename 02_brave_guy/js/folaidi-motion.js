// Presentation for Folaidi only. Spawn time, projectile and boss hit rules remain in main.js.
const moves={slam:['skill1',.95],charge:['skill2',1.5],summon:['skill3',.5]};

export function folaidiNeeded(stage,bosses){
  return (stage.waves||[]).some(wave=>Object.hasOwn(wave,'folaidi'))
    || bosses.some(boss=>boss.vis==='boss'||boss.minion==='folaidi');
}

export function folaidiMove(enemy,key){
  const pose=enemy.kind==='folaidiKing'?moves[key]:null;
  return pose&&enemy.visual.actions?.[pose[0]]?pose:null;
}

export function folaidiSpawn(kind,visual){
  return (kind==='folaidi'||kind==='folaidiKing') && visual.actions?.spawn ? .45 : 0;
}

// Intro prop, not a collider. Flat quilt motif remains legible from the game camera.
export function buildFolaidiBed(THREE,lang){
  const group=new THREE.Group();group.name='Folaidi King | deadline bed';group.visible=false;
  const paint=(color,opts)=>new THREE.MeshToonMaterial({color,...opts});
  const wood=paint(0x7c5041),trim=paint(0xffb66d),foam=paint(0xffecc6),cover=paint(0x9057a0),pillow=paint(0xffdea3);
  function solid(geometry,material,x,y,z){
    const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);group.add(m);return m;
  }
  function rounded(w,d,r,h){
    const x=-w/2,y=-d/2,p=new THREE.Shape();
    p.moveTo(x+r,y);p.lineTo(x+w-r,y);p.quadraticCurveTo(x+w,y,x+w,y+r);
    p.lineTo(x+w,y+d-r);p.quadraticCurveTo(x+w,y+d,x+w-r,y+d);
    p.lineTo(x+r,y+d);p.quadraticCurveTo(x,y+d,x,y+d-r);
    p.lineTo(x,y+r);p.quadraticCurveTo(x,y,x+r,y);
    const g=new THREE.ExtrudeGeometry(p,{depth:h,bevelEnabled:false,curveSegments:5});g.rotateX(-Math.PI/2);return g;
  }
  solid(rounded(2.55,4.65,.24,.24),wood,0,.15,0);
  solid(rounded(2.38,4.48,.20,.17),foam,0,.39,0);
  solid(rounded(2.32,3.24,.18,.10),cover,0,.51,.55);
  solid(rounded(1.89,.94,.20,.15),pillow,0,.55,-1.53);
  solid(new THREE.BoxGeometry(2.43,.60,.16),wood,0,.45,-2.29);
  solid(new THREE.BoxGeometry(2.54,.09,.23),trim,0,.77,-2.29);
  const posts=new THREE.CylinderGeometry(.125,.16,.78,10);
  for(const x of [-1.12,1.12]) {
    solid(posts,wood,x,.4,-2.30);
    solid(new THREE.SphereGeometry(.145,12,8),trim,x,.83,-2.30);
    solid(new THREE.CylinderGeometry(.11,.13,.21,10),wood,x,.11,1.89);
  }
  const cvs=document.createElement('canvas');cvs.width=256;cvs.height=352;
  const ctx=cvs.getContext('2d');
  if(ctx){
    const word=lang?.startsWith('en')?'DUE':lang?.startsWith('ja')?'締切':'截止';
    ctx.fillStyle='#9057a0';ctx.fillRect(0,0,256,352);
    ctx.strokeStyle='#eec4e5';ctx.lineWidth=2;ctx.strokeRect(9,9,238,334);
    for(let row=0;row<4;row++)for(let col=0;col<3;col++){
      const x=37+col*80,y=25+row*87;ctx.strokeRect(x-18,y,37,34);
      ctx.fillStyle='#f4cce5';ctx.fillRect(x-18,y,37,7);ctx.textAlign='center';
      ctx.font='bold 15px sans-serif';ctx.fillText(word,x,y+24);
    }
    const map=new THREE.CanvasTexture(cvs);map.colorSpace=THREE.SRGBColorSpace;
    const sheet=solid(new THREE.PlaneGeometry(2.22,3.13),paint(0xffffff,{map}),0,.617,.55);sheet.rotation.x=-Math.PI/2;
  }
  return group;
}
