const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const p=await b.newPage({viewport:{width:390,height:844}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8000/02_brave_guy/play.html');await p.waitForFunction(()=>window.__game?.audio,{timeout:90000});
 await p.evaluate(async()=>{const g=__game;await g.prepareGameplay();g.startStage(2);while(g.dialog)g.advanceDialog(true);g.game.waveTimer=999;g.hero.invuln=999;window.targets=[];for(const [x,z] of [[6,0],[2,0],[-3,0],[0,-3],[0,3]]){const at=g.hero.pos.clone();at.x+=x;at.z+=z;g.spawnEnemy('ganqiao',at);const e=g.enemies.at(-1);e.state='chase';e.shown=true;e.visual.root.visible=true;e.def.speed=0;e.cool=999;targets.push(e);}g.setLock(true);});
 await p.waitForTimeout(100);
 assert.equal(await p.evaluate(()=>targets.indexOf(__game.lockTarget)),1);
 assert(await p.evaluate(()=>{const g=__game;g.damageEnemy(targets[1],100000);return targets[1].state==='dead'&&g.lockTarget===targets[2]&&g.lockMarker.position.x===targets[2].pos.x;}),'actual damage death immediately selects nearest');
 for(const [key,index] of [['ArrowRight',0],['ArrowLeft',2],['ArrowUp',3],['ArrowDown',4]]){
  await p.keyboard.down(key);await p.keyboard.press('t');await p.keyboard.up(key);
  assert.equal(await p.evaluate(()=>targets.indexOf(__game.lockTarget)),index,key);
 }
 const stick=await p.locator('#stick-base').boundingBox();
 await p.mouse.move(stick.x+stick.width/2+35,stick.y+stick.height/2);await p.mouse.down();await p.keyboard.press('t');await p.mouse.up();
 assert.equal(await p.evaluate(()=>targets.indexOf(__game.lockTarget)),0,'held joystick chooses right target');
 await p.keyboard.press('j');await p.waitForTimeout(60);
 assert(await p.evaluate(()=>{const g=__game,e=g.lockTarget;return Math.abs(g.hero.yaw-Math.atan2(e.pos.x-g.hero.pos.x,e.pos.z-g.hero.pos.z))<0.1;}),'attack faces selected target');
 await p.screenshot({path:'/tmp/game02-combat-check.png'});
 assert(await p.evaluate(()=>{const g=__game;g.game.paused=true;g.hero.form='student';g.hero.hp=500;g.hero.maxHp=1000;g.hero.qi=0;g.game.combo=19;g.game.rescues=0;g.onHit(1,0);if(g.hero.hp!==550)return false;g.onHit(1,0);if(g.hero.hp!==550)return false;g.game.combo=39;g.onHit(1,0);if(g.hero.qi!==20)return false;g.game.combo=49;g.onHit(1,0);if(g.game.rescues!==1)return false;g.onHit(10,0);if(g.game.rescues!==1)return false;g.game.combo=0;g.onHit(50,0);if(g.hero.hp!==600||g.hero.qi!==40||g.game.rescues!==2)return false;g.hero.hp=990;g.hero.qi=95;g.game.combo=19;g.onHit(31,0);return g.hero.hp===1000&&g.hero.qi===100&&g.game.rescues===3;}),'thresholds, no duplicates, jumps, reset and caps');
 assert(await p.evaluate(()=>{
  const g=__game,original=g.diff;
  for(const [difficulty,cap] of [[0,5],[1,4],[2,3]]){
   g.setDiff(difficulty);g.game.rescues=0;g.game.combo=49;
   g.onHit(1,0);if(g.game.rescues!==1)return false;
   g.onHit(49,0);if(g.game.rescues!==1)return false;
   g.onHit(1,0);if(g.game.rescues!==2)return false;
   g.onHit(50,0);if(g.game.rescues!==3)return false;
   g.onHit(1000,0);if(g.game.rescues!==cap)return false;
   if(g.addRescues()!==0||g.game.rescues!==cap)return false;
   g.game.rescues--;g.onHit(1,0);if(g.game.rescues!==cap-1)return false;
   g.onHit(49,0);if(g.game.rescues!==cap)return false;
   g.game.combo=0;g.game.rescues=0;g.onHit(150,0);if(g.game.rescues!==3)return false;
  }
  g.setDiff(0);g.game.rescues=5;g.setDiff(2);if(g.game.rescues!==3)return false;
  g.setDiff(original);return true;
 }),'50-hit intervals, no duplicates, multi-threshold jumps, difficulty caps and shared rewards');
 await p.evaluate(()=>{__game.game.paused=false;for(const e of targets)if(e.state!=='dead')__game.damageEnemy(e,100000);});
 assert(await p.evaluate(()=>__game.lockTarget===null&&!__game.lockMarker.visible),'last death hides marker');
 assert(await p.evaluate(async()=>{const a=__game.audio;a.unlock();a.muted=false;await a.loadSfx('victory_human_cheer',a.resolve(a.sfxTracks.victory_human_cheer));a.stopCelebration();a.sfx('victory_human_cheer');return a.sfxBuffers.get('victory_human_cheer')?.duration>20&&a.crowdVoices.size>0;}),'cheer file decodes and creates a playing voice');
 assert(await p.evaluate(()=>{const g=__game,calls=[];g.audio.sfx=name=>calls.push(name);g.audio.playBgm=name=>calls.push(name);g.game.victoryShown=true;g.hero.form='brave';g.clearStage();return g.game.phase==='over'&&JSON.stringify(calls)===JSON.stringify(['bgm_victory','win','victory_human_cheer']);}),'victory retains music with restored score cue and user recording, no old applause');
 await p.evaluate(async()=>{const g=__game;await g.cinematics.prepareEnding();window.endingSounds=[];g.audio.sfx=name=>endingSounds.push(name);g.cinematics.ending(()=>{});});
 await p.waitForFunction(()=>__game.cinematics.state?.mode==='ending');
 assert(await p.evaluate(()=>{__game.cinematics.update(5);__game.cinematics.update(5);return endingSounds.filter(x=>x==='victory_human_cheer').length===1&&!endingSounds.includes('applause')&&!endingSounds.includes('crowd_cheer');}),'ending plays user recording once, never old applause');
 assert.deepEqual(errors,[]);await b.close();console.log('PASS: actual kills, immediate nearest retarget/marker, four arrow directions, combo 20/40/50, reset, caps, no duplicates');
})().catch(e=>{console.error(e);process.exit(1)});
