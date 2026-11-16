const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const p=await b.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:8000/02_brave_guy/play.html');await p.waitForFunction(()=>window.__game?.audio,{timeout:90000});
await p.evaluate(async()=>{const g=__game;await g.prepareGameplay();g.startStage(2);while(g.dialog)g.advanceDialog(true);g.game.paused=true;g.game.waveTimer=999;g.hero.invuln=999;g.hero.pos.set(0,0,0);window.hunters=[];
 for(let i=0;i<32;i++){const angle=i*Math.PI*2/32,at=g.hero.pos.clone().set(Math.cos(angle)*23,0,Math.sin(angle)*23);g.spawnEnemy(i%3===0?'folaidi':'ganqiao',at);const e=g.enemies.at(-1);e.state='chase';e.shown=true;e.visual.root.visible=true;hunters.push(e);}
 const boss=g.spawnEnemy('ganqiaoFull',g.hero.pos.clone().set(-16,0,16));boss.state='chase';boss.shown=true;boss.visual.root.visible=true;boss.cool=999;hunters.push(boss);
 // Exercise exact overlap in the existing separation pass.
 hunters[1].pos.copy(hunters[2].pos);
});
for(const goal of [[0,0],[-20,0]]){
 await p.evaluate(([x,z])=>{__game.hero.pos.set(x,0,z);__game.maze.collide(__game.hero.pos,.5);},goal);
 for(let i=0;i<8;i++)await p.evaluate(()=>__game.step(300,1/30));
 const report=await p.evaluate(()=>hunters.map(e=>({kind:e.kind,state:e.state,distance:e.pos.distanceTo(__game.hero.pos),sight:__game.maze.lineClear(e.pos,__game.hero.pos,.2)})));
 console.log('goal',goal,'max distance',Math.max(...report.map(e=>e.distance)),'outside',report.filter(e=>e.distance>9));
 assert(report.every(e=>e.distance<9),'every spawned hunter approaches hero');
 assert(report.filter(e=>e.kind==='folaidi').every(e=>e.sight),'ranged hunters get line of sight');
}
assert.deepEqual(errors,[]);await b.close();console.log('PASS: 32 mixed enemies and large boss converge from rim, then follow hero to outer wall; ranged acquire sight');})().catch(e=>{console.error(e);process.exit(1)});
