const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const dir=path.resolve(__dirname,'../../02_brave_guy');
const THREE=require(path.join(dir,'vendor/three/three.module.min.js'));
const js=fs.readFileSync(path.join(dir,'js/burst-aura.js'),'utf8').replace(/^import .+;\r?$/gm,'').replace(/^export /gm,'');
const {activeBurstRoster,makeBurstAura}=vm.runInNewContext(js+'\n({activeBurstRoster,makeBurstAura})',{THREE});
const api=()=>{
 const scene=new THREE.Scene(), root=new THREE.Group(), original=new THREE.MeshStandardMaterial({color:0xa12312});
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(1,2,1),original);root.add(mesh);
 const game={phase:'playing',final:false,time:10};
 const hero={visual:{root},character:'brave',form:'brave',mode:'burst',burstT:12,guestBurstT:0,state:'free',hp:10,pos:new THREE.Vector3(5,0,2)};
 return {aura:makeBurstAura(scene),game,hero,scene,mesh,original};
};
test('all three roster palettes track real burst states, not transformation, while transitions always stop the effect',()=>{
 const {hero,game}=api();
 assert.equal(activeBurstRoster(hero,game),'brave');
 hero.form='student';assert.equal(activeBurstRoster(hero,game),null);
 hero.form='brave';hero.mode='courage';assert.equal(activeBurstRoster(hero,game),null);
 hero.burstAuraUntil=16;assert.equal(activeBurstRoster(hero,game),'brave');
 game.time=16;assert.equal(activeBurstRoster(hero,game),null);
 for(const id of ['angel','nightmare']){
  hero.character=id;hero.guestBurstT=8;assert.equal(activeBurstRoster(hero,game),id);
  for(const phase of ['menu','loading','cinematic','ending','over']){game.phase=phase;assert.equal(activeBurstRoster(hero,game),null);}
  game.phase='playing';
  hero.state='dead';assert.equal(activeBurstRoster(hero,game),null);hero.state='free';
  game.final=true;assert.equal(activeBurstRoster(hero,game),null);game.final=false;
  hero.guestBurstT=0;assert.equal(activeBurstRoster(hero,game),null);
 }
});
test('volumetric effect uses only seven draw objects, follows the player, pulses only on simulation time, and cleans up',()=>{
 const {aura,hero,game,scene,mesh,original}=api();aura.update(hero,game);
 const group=scene.getObjectByName('Burst | sustained brave aura');assert.ok(group);
 assert.equal(group.children.length,7);assert.ok(group.children.filter(m=>m.isMesh&&m.position.y>1).length>=5);
 assert.equal(group.children.filter(m=>m.isPoints).length,1);
 assert.notEqual(mesh.material,original);
 const baseline=mesh.material.color.clone();
 hero.pos.x=8;aura.update(hero,game);assert.equal(group.position.x,8);
 assert.ok(mesh.material.color.equals(baseline));
 game.time+=.1;aura.update(hero,game);assert.ok(!mesh.material.color.equals(baseline));
 let resources=0;
 group.traverse(o=>{if(o.material){o.material.addEventListener('dispose',()=>resources++);o.geometry.addEventListener('dispose',()=>resources++);}});
 const clone=mesh.material;clone.addEventListener('dispose',()=>resources++);
 game.phase='over';aura.update(hero,game);aura.clear();
 assert.equal(mesh.material,original);
 assert.equal(scene.children.length,0);assert.equal(resources,15);
});
