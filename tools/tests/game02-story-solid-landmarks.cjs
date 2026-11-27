const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../../02_brave_guy'),read=n=>fs.readFileSync(path.join(root,'js/stage-art',n+'.js'),'utf8');
const T=require(path.join(root,'vendor/three/three.module.min.js'));
const load=(n,expr,env={})=>vm.runInNewContext(read(n).replace(/^import .*;$/gm,'').replaceAll('export ', '')+'\n'+expr,env);
const makeStoryMaze=load('story-maze-engine','makeStoryMaze');
const mountLandmarks=load('solid-landmarks','mountLandmarks',{makeQualityKit:load('story-quality-kit','makeQualityKit')});
const create=load('chapter-landmarks','makeChapterLandmarks',{mountLandmarks});
const setups={...load('story-quality-school','SCHOOL_QUALITY'),...load('story-quality-office','OFFICE_QUALITY'),...load('story-quality-finale','FINALE_QUALITY')};
const ids=Object.keys(setups).filter(id=>!id.startsWith('2-'));
assert.equal(ids.length,13);
const all=new Set();
for(const id of ids){
 const world=new T.Group(),maze=makeStoryMaze(T,setups[id].rows);
 const camera={position:new T.Vector3(0,9,12)},hero={pos:new T.Vector3()};
 const baseline=JSON.stringify([maze.start,maze.boss,maze.exit,maze.walls,maze.walkCells]);
 const art=create(T,world,maze,camera,hero,id);
 assert.equal(art.count,2,id+' needs two distinct solid landmarks');
 assert.ok(art.solids>=40,id+' detail budget');
 assert.equal(world.children.length,2);
 for(const [i,group] of world.children.entries()){
  assert.ok(!all.has(group.name));all.add(group.name);
  assert.equal(Math.sign(group.position.x),i===0?-1:1);
  const b=new T.Box3().setFromObject(group);
  assert.ok(b.max.y>1.6&&b.max.z-b.min.z>1.05,id+' physical depth');
  assert.ok(group.children.length<=8&&group.children.every(m=>m.isInstancedMesh),id+' draw budget');
  for(let x=b.min.x;x<=b.max.x+.001;x+=.14)for(let z=b.min.z;z<=b.max.z+.001;z+=.14)assert.ok(maze.blocked({x,z},.05),id+' path overlap');
  const x=(b.min.x+b.max.x)/2,z=(b.min.z+b.max.z)/2;
  assert.ok(maze.walkCells.some(q=>Math.hypot(x-q.x,z-q.z)<6.4),id+' close to reachable approach');
  camera.position.set(x,3,z+4);hero.pos.set(x,0,z-4);art.update();assert.equal(group.visible,false);
  camera.position.set(0,9,12);hero.pos.set(0,0,0);art.update();assert.equal(group.visible,true);
 }
 art.dispose();assert.equal(world.children.length,0);
 assert.equal(JSON.stringify([maze.start,maze.boss,maze.exit,maze.walls,maze.walkCells]),baseline);
}
assert.equal(all.size,26);
assert.match(read('story-polish'),/:makeChapterLandmarks/);
console.log('PASS: 26 unique solid landmarks across all 13 remaining stages, geometry, reach, sightlines, batching and original navigation');
