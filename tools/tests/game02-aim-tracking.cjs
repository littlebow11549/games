const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const p=await b.newPage();await p.goto('http://127.0.0.1:8000/02_brave_guy/play.html');await p.waitForFunction(()=>window.__game?.audio,{timeout:90000});
const result=await p.evaluate(async()=>{const g=__game;await g.prepareGameplay();g.startStage(0);while(g.dialog)g.advanceDialog(true);g.game.paused=true;g.game.waveTimer=999;g.hero.invuln=999;g.hero.form='brave';g.hero.courage=100;g.hero.pos.set(0,0,0);
const spawn=(x,z)=>{const at=g.hero.pos.clone();at.x=x;at.z=z;g.spawnEnemy('ganqiao',at);const e=g.enemies.at(-1);e.state='chase';e.shown=true;e.visual.root.visible=true;e.def.speed=0;e.cool=999;e.hp=99999;return e;};const a=spawn(2,0),c=spawn(0,3),d=spawn(-7,0);g.setLock(true);g.step(1,.001);
const checks=[];const check=(name,v)=>checks.push([name,!!v]);
// Move target after windup begins; actual impact must damage that target.
g.hero.state='attack';g.hero.combo=0;g.hero.t=.08;g.hero.hitDone=false;g.hero.yaw=Math.PI/2;a.pos.set(0,0,-2);const hp=a.hp;g.step(1,.02);check('moving target hit at impact',a.hp<hp);check('impact faces new position',Math.abs(g.hero.yaw-Math.PI)<.01);
// Selected enemy dies during windup, next punch must face replacement.
g.game.hitstop=0;g.hero.state='attack';g.hero.t=.08;g.hero.hitDone=false;g.damageEnemy(a,100000);c.pos.set(-2,0,0);const hp2=c.hp;g.step(1,.02);check('death retarget impact',c.hp<hp2&&g.lockTarget===c);
// Close target cannot be crossed by a lunge.
g.game.hitstop=0;c.pos.set(.8,0,0);g.hero.pos.set(0,0,0);g.hero.state='attack';g.hero.t=0;g.hero.hitDone=false;g.step(1,.03);check('lunge cannot pass target',g.hero.pos.x<c.pos.x);
// Projectile windup tracks relocation at release.
g.game.hitstop=0;g.game.abilities.add('skill2');g.hero.state='free';g.hero.cds.skill2=0;g.startSkill('skill2',{x:0,y:0,len:0});c.pos.set(0,0,-3);const releaseYaw=Math.atan2(c.pos.x-g.hero.pos.x,c.pos.z-g.hero.pos.z);g.hero.t=.13;g.step(1,.02);check('projectile release direction',Math.abs(g.hero.yaw-releaseYaw)<.01);
// Repeated presses must alternate nearest alternatives, never visit far third.
g.hero.state='free';g.hero.pos.set(0,0,0);c.pos.set(2,0,0);d.pos.set(4,0,0);const far=spawn(9,0);g.setLock(true);g.game.paused=false;g.cycleLockTarget();check('first nearest',g.lockTarget===c);g.cycleLockTarget();check('nearest alternative',g.lockTarget===d);g.cycleLockTarget();check('returns nearest, not farthest',g.lockTarget===c);d.pos.set(8,0,0);far.pos.set(3,0,0);g.cycleLockTarget();check('distance recalculated',g.lockTarget===far);g.game.paused=true;return checks;});for(const [name,ok]of result)assert(ok,name);console.log(result);await b.close();})().catch(e=>{console.error(e);process.exit(1)});
