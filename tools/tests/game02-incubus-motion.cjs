const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const root=path.resolve(__dirname,'../../02_brave_guy'),rd=n=>fs.readFileSync(path.join(root,n),'utf8');
const main=rd('js/main.js'), visuals=rd('js/visuals.js'), skills=rd('js/nightmare-boss-skills.js');
const f=main.slice(main.indexOf('function swapIncubusArmor('),main.indexOf('function updateControlBadge('));
const THREE=require(path.join(root,'vendor/three/three.module.min.js'));
const c={game:{phase:'playing',awakened:false,final:false},hero:{form:'student',visual:{glow(){}},pos:new THREE.Vector3()},
 guestCombat:{clear(){}},nightmareBossSkills:{clear(){}},setBgm(){},bossBgm(){},stageBgm(){},
 audio:{stopLoops(){}},input:{takeActions(){}},beam:false,hazards:[{life:3}],hud:{hidden:false},
 $:()=>c.hud,cinematics:{firstStrike:fn=>{c.first=fn},awakening:fn=>{c.second=fn}},
 scene:new THREE.Scene(),createVisual:(kind,shadow,appearance)=>({kind:c.missing?kind:appearance.modelKind,root:new THREE.Group(),dispose(){c.fallbackDisposed=true},playReaction:(name,dur)=>c.reaction=[name,dur]}),guest:()=>false,banner(){},popup(){},fx:{ring(){}}};
vm.createContext(c);vm.runInContext(f+'\nthis.go=startAwakening;this.finish=startFinalPhase;this.swap=swapIncubusArmor',c);
let e={kind:'incubus',def:{height:2.2},hp:5520,maxHp:9200,shield:false,cast:{name:'nDrones'},size:1,shown:true,visual:{root:new THREE.Group()}};
const obj=e,original=e.visual;original.dispose=()=>c.disposed=true;c.scene.add(original.root);e.visual.root.position.set(2,0,7);e.visual.root.rotation.y=2;
c.go(e);assert.equal(c.game.phase,'cinematic');assert.equal(c.hud.hidden,true);
assert.equal(e.visual,original);c.first();assert.equal(e.visual,original);c.second();
assert.equal(e,obj);assert.equal(e.visual.kind,'incubus_final');assert.equal(e.visual.root.parent,c.scene);
assert.equal(original.root.parent,null);assert.equal(c.disposed,true);
assert.deepEqual(e.visual.root.position.toArray(),[2,0,7]);assert.deepEqual(e.visual.root.quaternion.toArray(),original.root.quaternion.toArray());
assert.deepEqual(c.reaction,['spawn',.72]);const armored=e.visual;c.swap(e);assert.equal(e.visual,armored);
c.missing=true;const fallback={visual:original};c.swap(fallback);assert.equal(fallback.visual,original);assert.equal(c.fallbackDisposed,true);
assert.equal(c.game.phase,'playing');assert.equal(c.hud.hidden,false);
assert.equal(e.hp,5520);assert.equal(e.shield,false);assert.equal(e.cast,null);
assert.equal(e.visual.root.scale.x,1.2);assert.equal(c.hero.invuln,2);assert.equal(c.hazards[0].life,0);
e.hp=921;c.finish(e);
assert.equal(c.game.final,true);assert.equal(e.untouchable,true);assert.equal(e.hp,921);
const dmg=main.slice(main.indexOf('function damageEnemy('),main.indexOf('function tally('));
const d={alive:e=>e.state!=='dead',audio:{sfx(){}},tf:()=>'',popup(){},fx:{ring(){},hitSpark(){},burst(){}},updateLockMarker(){},playBossKO(){},
 stats:()=>({atk:1000}),hasDebuff:()=>false,godMode:()=>false,rand:()=>1,HERO:{critRate:0,critMult:1.5},game:{combo:30,counterT:0,awakened:false,final:false,time:1},
 tmp:new THREE.Vector3(),hero:{character:'brave',pos:new THREE.Vector3()},Math};
vm.createContext(d);vm.runInContext(dmg+'\nthis.hit=damageEnemy',d);
const boss={kind:'incubus',maxHp:9200,hp:9200,def:{boss:true,incubus:true,height:2.2},shield:true,broken:new Set(),state:'chase',
 y:0,pos:new THREE.Vector3(1,0,2),visual:{flash(){},play(){}}};
for(const src of ['attack','skill1','skill1','skill2'])d.hit(boss,100,{src});
assert.equal(boss.hp,9200);assert.equal(boss.shield,true);assert.equal(boss.broken.size,2);
d.hit(boss,100,{src:'skill3'});assert.equal(boss.shield,false);assert.equal(boss.hp,9200);
d.hit(boss,100);assert.equal(boss.hp,5520);
d.game.awakened=true;d.game.counterT=.5;
assert.equal(d.hit(boss,100).killed,false,'a counter on an armored boss must not bypass the 10% finale');
assert.equal(boss.hp,921);
d.game.final=true;boss.untouchable=true;assert.equal(d.hit(boss,100).damaged,false);assert.equal(boss.hp,921);
assert.match(main,/e\.hp<=e\.maxHp\*\.6\+2/);
assert.match(main,/e\.hp <= e\.maxHp \* 0\.1 \+ 2/);
assert.match(main,/st\.boss==='incubus'\)\s*stageVisualKinds\.push\('incubus','incubus_final'\)/);
assert.match(skills,/e\.def\.incubus.*attackWindup/);
const configs=JSON.parse(rd('assets/manifest.json')).models;
for(const [key,bones] of [['incubus',17],['incubus_final',18]]){
 const cfg=configs[key]; const file=fs.readFileSync(path.join(root,cfg.url)),j=JSON.parse(file.subarray(20,20+file.readUInt32LE(12)));
 assert.equal(j.skins[0].joints.length,bones);assert.ok(file.length<2200000);
 for(const [k,v] of Object.entries(cfg.clips)) assert.ok(j.animations.find(a=>a.name===v&&a.channels.length>0),key+': '+k);
}
console.log('PASS: both rigs; stage-only loading; awakening and finale keep the original boss state');
