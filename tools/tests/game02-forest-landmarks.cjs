const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../../02_brave_guy'),read=n=>fs.readFileSync(path.join(root,'js/stage-art',n+'.js'),'utf8');
const THREE=require(path.join(root,'vendor/three/three.module.min.js'));
const load=(n,expr,env={})=>vm.runInNewContext(read(n).replace(/^import .*;$/gm,'').replaceAll('export ', '')+'\n'+expr,env);
const makeStoryMaze=load('story-maze-engine','makeStoryMaze'), makeQualityKit=load('story-quality-kit','makeQualityKit');
const rows=Array.from(load('story-quality-school','SCHOOL_QUALITY["2-1"].rows'));
const forest=load('forest-landmarks','makeForestLandmarks',{mountLandmarks:load('solid-landmarks','mountLandmarks',{makeQualityKit})});
const maze=makeStoryMaze(THREE,rows),root3d=new THREE.Group(),camera={position:new THREE.Vector3(0,9,12)},hero={pos:new THREE.Vector3(0,0,0)};
const baseline=JSON.stringify([maze.start,maze.boss,maze.exit,maze.walls,maze.walkCells]);
const art=forest(THREE,root3d,maze,camera,hero);
assert.equal(art.count,2); assert.equal(root3d.children.length,2);
for(const group of root3d.children){
 assert.ok(group.children.length<=8);
 for(const batch of group.children)assert.ok(batch.isInstancedMesh);
 const box=new THREE.Box3().setFromObject(group);
 assert.ok(box.max.y-box.min.y>2.25&&box.max.z-box.min.z>1.15);
 for(let x=box.min.x;x<=box.max.x+.001;x+=.13)for(let z=box.min.z;z<=box.max.z+.001;z+=.13)
   assert.ok(maze.blocked({x,z},.05),'landmark over walkable space');
}
assert.equal(JSON.stringify([maze.start,maze.boss,maze.exit,maze.walls,maze.walkCells]),baseline);
const box=new THREE.Box3().setFromObject(root3d.children[0]);
const x=(box.min.x+box.max.x)/2,z=(box.min.z+box.max.z)/2;
camera.position.set(x,3,z+4);hero.pos.set(x,0,z-4);art.update();
assert.equal(root3d.children[0].visible,false,'hide full geometry if it covers actor');
camera.position.set(0,9,12);hero.pos.set(0,0,0);art.update();
assert.equal(root3d.children[0].visible,true);
art.dispose();assert.equal(root3d.children.length,0);
assert.match(read('story-polish'),/d.id==='2-1'\?makeForestLandmarks/);
console.log('PASS: two forest 3D landmarks, contained footprints, mesh budget and player sightline, route unchanged');
