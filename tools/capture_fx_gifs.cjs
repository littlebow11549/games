// Capture actual game events and CSS animations, then export GIF previews.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..');const output=path.join(root,'01_memory_crash/assets/preview');const tmp=fs.mkdtempSync('/workspace/scratch/fx-recording-');
const run=(args,extra={})=>cp.execFileSync('ffmpeg',args,{maxBuffer:32*1024*1024,...extra});
(async()=>{const b=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});let video;
try{
 const context=await b.newContext({viewport:{width:390,height:844},recordVideo:{dir:tmp,size:{width:390,height:844}}});
 await context.addInitScript(()=>{let r=0;Math.random=()=>((r++%12)+.5)/12;localStorage.setItem('mc_seen_howto','1');localStorage.setItem('mc_music','0');});
 const p=await context.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(process.env.GAME_URL||'http://127.0.0.1:8000/01_memory_crash/');
 await p.evaluate(()=>MemoryCrashPresentation.fontReady);
 await p.evaluate(async()=>{const image=new Image();image.src='assets/runtime/pic/fx_01.webp';await image.decode();const marker=document.createElement('div');marker.id='captureMarker';marker.style.cssText='position:fixed;top:0;left:0;width:8px;height:8px;z-index:10000;background:#303030;pointer-events:none';document.body.append(marker);});
 const marker=color=>p.evaluate(c=>{document.querySelector('#captureMarker').style.background=c;},color);
 const box=await p.locator('#btnStart').boundingBox();await p.mouse.click(box.x+box.width/2,box.y+box.height/2);await p.locator('#skipIntro').click();await p.waitForSelector('#screen-menu.active');await p.locator('#btnArcade').click();
 await p.waitForFunction(()=>!document.querySelector('#board').classList.contains('locked'));await p.locator('.gem').nth(0).click();await p.locator('.gem').nth(1).click();
 await marker('#f00000');await p.locator('.gem').nth(2).click();await p.waitForSelector('.fx-burst');await p.waitForTimeout(1100);await marker('#303030');console.log('Captured PERFECT');
 await p.waitForFunction(()=>!document.querySelector('#board').classList.contains('locked'));await marker('#00e000');await p.locator('.gem').nth(11).click();await p.waitForSelector('.fx-shatter');await p.waitForTimeout(900);await marker('#303030');console.log('Captured MISS');
 await p.waitForFunction(()=>!document.querySelector('#board').classList.contains('locked'));await p.locator('.gem').nth(11).click();await p.waitForFunction(()=>!document.querySelector('#board').classList.contains('locked'));
 await p.evaluate(()=>{const over=document.querySelector('#screen-over');const observer=new MutationObserver(()=>{if(over.classList.contains('active')){document.querySelector('#captureMarker').style.background='#0000f0';observer.disconnect();}});observer.observe(over,{attributes:true,attributeFilter:['class']});});
 await p.locator('.gem').nth(11).click();await p.waitForSelector('#screen-over.active');await p.waitForSelector('.fx-crack');await p.waitForTimeout(1700);await marker('#303030');console.log('Captured GAME OVER');
 if(errors.length)throw new Error(errors.join('\n'));
 video=await p.video().path();await context.close();
}finally{await b.close();}
const samples=run(['-v','error','-i',video,'-vf','fps=25,crop=8:8:0:0,format=rgb24','-f','rawvideo','pipe:1']);
const bounds={burst:[],shatter:[],crack:[]};
for(let i=0;i<samples.length/(8*8*3);i++){let r=0,g=0,b=0;for(let j=0;j<64;j++){const k=i*192+j*3;r+=samples[k];g+=samples[k+1];b+=samples[k+2];}r/=64;g/=64;b/=64;
 if(r>110&&r>g*1.8&&r>b*1.8)bounds.burst.push(i);
 if(g>110&&g>r*1.8&&g>b*1.8)bounds.shatter.push(i);
 if(b>110&&b>r*1.8&&b>g*1.8)bounds.crack.push(i);
}
const clips=Object.entries(bounds).map(([name,indexes])=>{if(!indexes.length)throw new Error('No marker found '+name);return {name,start:indexes[0]/25,duration:(indexes.at(-1)-indexes[0]+1)/25};});
const chain=c=>`trim=start=${c.start}:duration=${c.duration},setpts=PTS-STARTPTS,crop=iw:ih-8:0:8,fps=15,tpad=stop_mode=clone:stop_duration=0.5`;
const palette='split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=sierra2_4a:diff_mode=rectangle';
for(const clip of clips){const file=path.join(output,`fx_${clip.name}.gif`);run(['-y','-v','error','-filter_complex_threads','1','-i',video,'-filter_complex',chain(clip)+','+palette,'-loop','0',file]);clip.file=path.basename(file);clip.bytes=fs.statSync(file).size;}
const filters=clips.map((clip,i)=>`[0:v]${chain(clip)}[v${i}]`).join(';')+';[v0][v1][v2]concat=n=3:v=1:a=0,'+palette;
const all=path.join(output,'fx_all.gif');run(['-y','-v','error','-filter_complex_threads','1','-i',video,'-filter_complex',filters,'-loop','0',all]);
fs.writeFileSync(path.join(output,'fx_gif_preview.json'),JSON.stringify({source:'Actual Chromium game recording; genuine PERFECT, MISS and GAME OVER events; all native CSS, particle, shake and character animations retained.',viewport:[390,844],output_size:[390,836],marker_removed_by_top_crop:8,fps:15,clips,combined:{file:'fx_all.gif',bytes:fs.statSync(all).size},game_source_unchanged:true},null,2)+'\n');console.log(JSON.stringify({clips,combined_bytes:fs.statSync(all).size}));
})().catch(e=>{console.error(e);process.exitCode=1;});
