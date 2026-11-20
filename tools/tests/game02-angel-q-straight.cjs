const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { pathToFileURL } = require('node:url');
const game = path.resolve(__dirname, '../../02_brave_guy');
const read = f => fs.readFileSync(path.join(game, f), 'utf8');
const main = read('js/main.js');
const clip = (a,b) => main.slice(main.indexOf(a), main.indexOf(b, main.indexOf(a)));
const casting = clip('const isAngelStraightCast', 'function endUlt(');
const hits = clip('function lineStrike(', '// ---------- 嘲諷');
const freeBody = clip("  else if (hero.state === 'free') {\n    hero.comboGap", "  } else if (hero.state === 'transforming')").split('\n').slice(1).join('\n');
assert(freeBody.includes('trackAttackLock'));
const entry = read('index.html'), play = read('play.html');
assert(entry.includes("'v','20261120angelstraight'"));
assert(play.includes('main.js?v=20261120angelstraight'));
assert(main.includes('guest-combat.js?v=20261120angelstraight') && main.includes('fx.js?v=20261120angelstraight'));

const canvas = { getContext: () => ({ measureText: () => ({width:300}), strokeText(){}, fillText(){} }) };
global.document={createElement:()=>canvas,createElementNS:()=>{throw new Error('not loading textures in fixture')}};
global.location={search:''};
const url = f => pathToFileURL(path.join(game,f)).href;
(async()=>{
 const THREE=await import(url('vendor/three/three.module.min.js'));
 const {Fx}=await import(url('js/fx.js'));
 const {createGuestCombat}=await import(url('js/guest-combat.js'));
 const near=(a,b)=>assert(Math.abs(a-b)<1e-6, `${a} differs from ${b}`);
 const testedAngles=[0,Math.PI/4,Math.PI/2,3*Math.PI/4,Math.PI,5*Math.PI/4,3*Math.PI/2,7*Math.PI/4,.31];
 for(const yaw of testedAngles){
  const from=new THREE.Vector3(4,0,-2),dir=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw)),side=new THREE.Vector3(dir.z,0,-dir.x);
  const scene=new THREE.Scene(),fx=new Fx(scene);
  const got=[],sounds=[],titles=[],otherAim=[];
  const hero={character:'angel',form:'brave',pos:from.clone(),yaw,cds:{},state:'free',actionLockTarget:{old:true},visual:{play(){}},invuln:0,comboGap:0,qi:100};
  const enemy=(id,along,across)=>({id,pos:from.clone().addScaledVector(dir,along).addScaledVector(side,across),def:{radius:.5}});
  const enemies=[enemy('forward',7,0),enemy('forward-end',27.99,0),enemy('inside-width',12,3.99),enemy('left',7,5),enemy('right',7,-5),enemy('behind',-.1,0),enemy('beyond',28.01,0)];
  const context=vm.createContext({hero,THREE,enemies,fx,alive:()=>true,
     damageEnemy:(e,mult,opts)=>{got.push({id:e.id,mult,opts});return {damaged:true};},tally:r=>r,
     game:{abilities:new Set(['skill1','skill2'])},mv:{len:0,x:0,y:0},dt:1/60,
     actions:['skill1'], guest:()=>true,speed:0,moveHeroBy(){},
     faceForAction(){otherAim.push('action');hero.yaw=yaw+1;},
     trackAttackLock(){otherAim.push('idle');hero.yaw=yaw-1;},
     ROSTER:{angel:{cd:[4,8],skills:['Q','E']}},
     showSkillCastName:(...args)=>titles.push(args)});
  vm.runInContext(`${hits}\n${casting}\nfunction inputFrame(){const act=a=>startSkill(a,mv);\n${freeBody}\n}`,context);
  const combat=createGuestCombat({scene,hero,enemies:()=>enemies,fx,hit(){},line:context.lineStrike,
     move:()=>assert.fail('Angel Q must not move the caster'),arena:40,audio:{sfx:n=>sounds.push(n)}});
  context.guestCombat=combat;
  // A held joystick updates the model's facing before Q; an idle cast retains it.
  if (yaw === Math.PI/4) {
   hero.yaw = 0;
   context.mv = {len:1,x:dir.x,y:dir.z};
  }
  context.inputFrame();
  assert.deepEqual(otherAim,[],'neither idle lock nor cast aim may change Angel Q');
  near(hero.yaw,yaw);
  assert.equal(hero.actionLockTarget,null);
  assert.deepEqual(titles,[['skill1','Q']]);
  assert.deepEqual(got.map(x=>x.id),['forward','forward-end','inside-width']);
  for(const hit of got){
   assert.equal(hit.mult,4.8);assert.equal(hit.opts.kb,22);assert.equal(hit.opts.launch,9);
   near(hit.opts.from.distanceTo(from),0);
  }
  assert.deepEqual(sounds,['dash']);
  assert.equal(fx.items.length,1,'exactly one ground trail');
  const plane=fx.items[0].obj;
  near(plane.position.x,from.x+dir.x*14); near(plane.position.z,from.z+dir.z*14);
  near(plane.geometry.parameters.width,8);near(plane.geometry.parameters.height,28);
  near(Math.abs(new THREE.Vector3(0,1,0).applyQuaternion(plane.quaternion).dot(dir)),1);
  const text=scene.children.find(x=>x.isSprite);
  assert(text,'original decorative shout stays');
  combat.update(.2);
  near(text.position.x,from.x+dir.x*5.6);near(text.position.z,from.z+dir.z*5.6);
  assert.equal(got.length,3,'decorative shout does not hit a second time');
  combat.clear();fx.clear();
  assert.equal(scene.children.length,0);
  // Regular guest cast preserves its existing target selection.
  hero.state='free';context.actions=['skill2'];context.mv={len:0,x:0,y:0};
  context.guestCombat={begin(){}};
  context.inputFrame();
  assert.deepEqual(otherAim,['idle','action']);
 }
 console.log('PASS 9 angles: live Q dispatch, no retarget, single real Three effect aligned with hit lane, front/side/back/end checks; other aim unchanged.');
})().catch(error=>{console.error(error);process.exitCode=1});
