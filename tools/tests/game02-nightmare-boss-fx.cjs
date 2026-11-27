const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const dir=path.resolve(__dirname,'../../02_brave_guy');
const THREE=require(path.join(dir,'vendor/three/three.module.min.js'));
const read=name=>fs.readFileSync(path.join(dir,'js',name),'utf8').replace(/^import .*;$/gm,'').replaceAll('export ','');
const extract=(file,name,context)=>vm.runInNewContext(read(file)+'\n'+name,context);
const ctx={THREE,createPuaProjectile:i=>Object.assign(new THREE.Group(),{userData:{text:String(i)}}),disposeProjectileMaterial(){}};
ctx.createRoyalArsenal=extract('royal-arsenal.js','createRoyalArsenal',ctx);
const create=extract('nightmare-boss-skills.js','createNightmareBossSkills',ctx);
const scene=new THREE.Scene(),hero={pos:new THREE.Vector3(3.4,0,4),hp:2000,state:'idle'};
const events={warning:[],burst:0,wake:0,waves:[],trails:[],shots:[],hits:[],dome:0};
const fx={telegraph:(...a)=>events.warning.push(a),add:(m,life,tick)=>events.warning.push({m,life,tick}),burst:()=>events.burst++,releaseWave:(...a)=>events.waves.push(a),trail:(...a)=>events.trails.push(a),projectileWake:()=>events.wake++,dome:()=>events.dome++};
const b=create({scene,hero,fx,hurt:n=>events.hits.push(n),shot:(...a)=>events.shots.push(a),announce(){},say(){},clamp(){}});
const actor={pos:new THREE.Vector3(),hp:700,maxHp:1000,state:'cast',cast:{t:0},def:{incubus:true},visual:{play(){}}};
const dash=b.moves.nDash;
dash.start(actor,0,1,4);
const rails=events.warning.filter(x=>x.m);
assert.deepEqual(rails.map(x=>x.m.position.x),[-3.4,0,3.4]);
for(const r of rails){assert.equal(r.life,.8);assert.equal(r.m.geometry.parameters.width,3.6);assert.equal(r.m.geometry.parameters.height,15.75);r.tick(.5);assert.equal(r.m.material.uniforms.phase.value,.5);}
for(let i=1;i<=130;i++){actor.cast.t=i/100;dash.update(actor,.01);}
assert.ok(Math.abs(actor.pos.z-15.75)<.001);assert.deepEqual(events.hits,[175]);assert.ok(events.trails.length<=21&&events.trails.length>=9);
actor.pos.set(0,0,0);actor.cast.t=.8;b.moves.nDrones.update(actor);assert.equal(scene.children.length,5);
b.update(.45);assert.equal(events.shots.length,5);assert.equal(events.burst,5);assert.ok(events.shots.every(a=>a[2].dmg===85&&a[2].speed===16));
b.clear();assert.equal(scene.children.length,0);
actor.cast.t=1.15;b.moves.nKing.update(actor);assert.equal(b.state[0].count,10);
for(let i=0;i<501;i++)b.update(.02);
assert.equal(b.state.length,0);assert.equal(scene.children.length,0);
assert.equal(events.dome,10);assert.ok(events.wake>0);assert.equal(events.hits.filter(n=>n===130).length,1);
assert.equal(events.warning.filter(x=>Array.isArray(x)&&x[1]===4).length,10);
console.log('PASS three fixed 3.6-wide dash warning lanes, bounded strokes, preserved 15.75 surge and hit, five unchanged drone shots, ten armed Royal gates/bombs and cleanup');
