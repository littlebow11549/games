// School Jiasen and office Jiamang share a character concept but not costumes or attacks.
const forms=['jiasen','jiamang'];
const bossMoves={slam:['skill1',.95],charge:['skill2',1.5],summon:['skill3',.5]};

export function jiasenModels(stage,bosses){
  return forms.filter(kind=>(stage.waves||[]).some(wave=>Object.hasOwn(wave,kind))
    || bosses.some(boss=>boss.vis===kind||boss.minion===kind));
}

export function jiasenMove(enemy,key){
  const clip=enemy.kind==='jiamangKing'?bossMoves[key]:null;
  return clip&&enemy.visual.actions?.[clip[0]]?clip:null;
}

export function jiasenAttackTime(kind,windup){
  return forms.includes(kind)?windup+.25:null;
}

// The pan object is presentation only; its flight group stays on the existing hit-test center.
export function buildJiamangPan(THREE,radius){
  const pan=new THREE.Group();pan.name='Jiamang | frying pan';
  const edge=new THREE.MeshToonMaterial({color:0x354054});
  const inner=new THREE.MeshToonMaterial({color:0x65778b});
  const metal=new THREE.MeshToonMaterial({color:0x9aaabe});
  const V=(u,v)=>new THREE.Vector2(u*radius,v*radius);
  const base=new THREE.LatheGeometry([V(0,-.13),V(.70,-.13),V(.87,-.06),V(.98,.05),V(1,.16),V(.96,.19),
    V(.87,.17),V(.79,.04),V(.68,0),V(0,0)],18);
  pan.add(new THREE.Mesh(base,edge));
  const well=new THREE.Mesh(new THREE.CircleGeometry(.66*radius,22),inner);well.rotation.x=-Math.PI/2;well.position.y=.006*radius;pan.add(well);
  const bar=new THREE.Mesh(new THREE.CapsuleGeometry(.118*radius,.84*radius,5,9),edge);
  bar.rotation.x=Math.PI/2;bar.position.set(0,.017*radius,-1.41*radius);pan.add(bar);
  const mount=new THREE.Mesh(new THREE.BoxGeometry(.37*radius,.13*radius,.31*radius),metal);
  mount.position.set(0,.047*radius,-.91*radius);pan.add(mount);
  return pan;
}
