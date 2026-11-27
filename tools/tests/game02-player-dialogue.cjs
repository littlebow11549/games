// Run against the actual play.html with an isolated headless Chromium profile.
// BRAVE_URL=http://127.0.0.1:8817/02_brave_guy/play.html CHROMIUM=... node tools/tests/game02-player-dialogue.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawn} = require('node:child_process');
const delay = ms => new Promise(resolve => setTimeout(resolve,ms));
const url = process.env.BRAVE_URL || 'http://127.0.0.1:8817/02_brave_guy/play.html';
const chrome = process.env.CHROMIUM || (process.platform==='win32' ?
  'C:/Program Files/Google/Chrome/Application/chrome.exe' : '/usr/bin/chromium');
const profile = fs.mkdtempSync(path.join(process.env.BRAVE_PROFILE_ROOT||os.tmpdir(),'brave-dialogue-qa-'));
const child = spawn(chrome,['--headless=new','--remote-debugging-port=0','--no-first-run',
  '--disable-background-networking','--disable-extensions','--disable-dev-shm-usage',
  '--use-angle=swiftshader','--enable-unsafe-swiftshader',
  '--no-sandbox',
  '--user-data-dir='+profile,'about:blank'],{stdio:'ignore',windowsHide:true});
async function wait(fn,ms=40000){
  const end=Date.now()+ms;let last;
  while(Date.now()<end){try{if(await fn())return;}catch(error){last=error;}await delay(125);}
  throw Error('Timeout in '+String(fn).slice(0,320)+(last?' '+last.message:''));
}
(async()=>{
  const portFile=path.join(profile,'DevToolsActivePort');
  await wait(()=>fs.existsSync(portFile),15000);
  const port=Number(fs.readFileSync(portFile,'utf8').split(/\r?\n/)[0]);
  const target=(await (await fetch('http://127.0.0.1:'+port+'/json/list')).json()).find(t=>t.type==='page');
  const sock=new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{sock.addEventListener('open',resolve,{once:true});sock.addEventListener('error',reject,{once:true});});
  let id=0;const pending=new Map(),errors=[];
  sock.addEventListener('message',e=>{
    const m=JSON.parse(e.data);
    if(m.id){
      const p=pending.get(m.id);if(!p)return;
      pending.delete(m.id);m.error?p[1](Error(m.error.message)):p[0](m.result);
    }else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);
  });
  const send=(method,params={})=>new Promise((resolve,reject)=>{
    pending.set(++id,[resolve,reject]);sock.send(JSON.stringify({id,method,params}));
  });
  const run=async expression=>{
    const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
    if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);
    return r.result.value;
  };
  const click=async selector=>{
    const pt=await run(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};})()`);
    await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',buttons:1,clickCount:1,...pt});
    await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',buttons:0,clickCount:1,...pt});
  };
  const shot=async name=>{
    const out=process.env.BRAVE_SHOT_DIR;if(!out)return;
    fs.mkdirSync(out,{recursive:true});
    const r=await send('Page.captureScreenshot',{format:'png',fromSurface:true});
    fs.writeFileSync(path.join(out,name+'.png'),Buffer.from(r.data,'base64'));
  };
  await send('Page.enable');await send('Runtime.enable');
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('braveguy.save.v1',JSON.stringify({seenOpening:true,seenTransform:true,rounds:4,cleared:[],secretCharacters:[]}));localStorage.setItem('braveguy.quality','0');`});
  await send('Page.navigate',{url});
  await wait(()=>run("window.__game?.game.phase==='ready'"),90000);
  const checks=[];
  for(const [width,height,mobile] of [[1280,720,false],[390,844,true],[844,390,true]]){
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile});
    await send('Emulation.setTouchEmulationEnabled',{enabled:mobile,maxTouchPoints:1});
    for (const [character,line] of [['brave','我聽得到好嗎。'],['angel','喂！翅膀很貴耶！'],['nightmare','你看，果然沒人在乎我。']]){
      await run(`(async()=>{const g=__game;g.game.paused=false;await g.prepareGameplay('${character}');g.startStage(1,'${character}');})()`);
      await wait(()=>run(`__game.game.phase==='dialog' && document.querySelector('#dlg-text').textContent && __game.hero.character==='${character}'`));
      const panel=await run(`(()=>{const box=document.querySelector('#dialog .dlg-box'),name=document.querySelector('#dlg-name'),
      text=document.querySelector('#dlg-text'),skip=document.querySelector('#dlg-skip');
      const [b,n,t,s]=[box,name,text,skip].map(o=>o.getBoundingClientRect());
      return {paint:getComputedStyle(box).backgroundImage,text:text.textContent,who:name.textContent,
        fits:b.left>=0&&b.right<=innerWidth+1&&b.top>=0&&b.bottom<=innerHeight+1,
        skip:s.left>=b.left&&s.right<=b.right&&s.top>=b.top&&s.bottom<=b.bottom&&s.height>=32,
        fitsText:t.left>=b.left&&t.right<=b.right,overlap:n.left<s.right&&n.right>s.left&&n.top<s.bottom&&n.bottom>s.top};})()`);
      assert.match(panel.paint,/linear-gradient/);assert(panel.text&&panel.who&&panel.fits&&panel.skip&&panel.fitsText&&!panel.overlap,JSON.stringify(panel));
      await shot('dialogue-story-'+width+'-'+character);
      const i=await run('__game.dialog.i');
      await send('Input.dispatchKeyEvent',{type:'keyDown',code:'Enter',key:'Enter',windowsVirtualKeyCode:13});
      await send('Input.dispatchKeyEvent',{type:'keyUp',code:'Enter',key:'Enter',windowsVirtualKeyCode:13});
      await wait(()=>run('__game.dialog.i==='+Number(i+1)));
      await run("__game.game.waveTimer=999;__game.game.ambushT=999;__game.game.queue=[];");
      await click('#dlg-skip');
      await wait(()=>run("__game.game.phase==='playing'&&document.querySelector('#dialog').hidden"));
      await run(`__game.hero.sayNext={text:${JSON.stringify(line)},t:0};__game.step(2,.023);`);
      await wait(()=>run("document.querySelector('.taunt.hero.character-speech')?.offsetWidth>0"));
      await run('__game.game.paused=true');
      const bubble=await run(`(()=>{const e=__game.hero.sayEl,r=e.getBoundingClientRect(),s=getComputedStyle(e),tail=getComputedStyle(e,'::after');
        return {speaker:e.dataset.speaker,text:e.textContent,paint:s.backgroundImage,accent:s.getPropertyValue('--speaker-shell').trim(),
          tail:tail.display,fits:r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom+8<=innerHeight};})()`);
      assert.equal(bubble.speaker,character);assert.match(bubble.paint,/linear-gradient/);
      assert(bubble.text && bubble.tail !== 'none' && bubble.fits,JSON.stringify(bubble));
      assert.equal(bubble.accent,{brave:'#dced77',angel:'#f5aaca',nightmare:'#bd9bee'}[character]);
      await shot('dialogue-overhead-'+width+'-'+character);
      checks.push([width,height,character]);
    }
  }
  const isolated=await run(`(()=>{
    const id='world-ui',root=document.getElementById(id);
    const sample=document.createElement('div');sample.className='taunt';
    const art=document.createElement('div');art.className='taunt hero has-word-art character-speech';
    root.append(sample,art);
    const enemy=getComputedStyle(sample).backgroundImage;
    const title=getComputedStyle(art,'::after').display;
    sample.remove();art.remove();return {enemy,title};})()`);
  assert.match(isolated.enemy,/url\(/);assert.equal(isolated.title,'none');
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({passes:checks,isolated},null,2));sock.close();
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{
  child.kill();
  if(process.exitCode) process.exit(process.exitCode);
});
