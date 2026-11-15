import { BOSS_STORYBOARDS, createBossStoryboard } from './boss-storyboards.js?v=20261115allboss';
import * as THREE from '../vendor/three/three.module.min.js';
import { createVisual } from './visuals.js';
import { t, lang } from './i18n.js?v=20261115cinema';
// Each encounter has its own entrance, palette, motif, camera and line.
export const BOSS_PROFILES = {
 folaidiKing:['佛賴弟王','boss','#bda8ff','mist','再五分鐘啦～','laichuang'],
 qian:['錢大姐','qian','#ffd84d','coins','先付錢，再談勇氣。','qian'],
 lan:['藍教頭','lan','#49cfff','slash','站直！你還差得遠！','lan'],
 nightmare:['惡夢超人','nightmare','#bb63ff','mirror','你真的以為自己辦得到？','nightmare'],
 midKing:['特大隻的悶幹譙','midKing','#b9a5ff','impact','有種就別再忍！','ganqiao'],
 hell:['地獄超人','hell','#ff6938','inferno','讓你的罪惡感燒個夠！','hell'],
 kabanKing:['加班鬼王','kabanKing','#62ddcc','papers','再五分鐘就好～','laichuang'],
 xinji:['新雞','xinji','#ffe459','feathers','這可不是我的錯喔。','xinji'],
 baguashe:['八卦蛇','baguashe','#ee8ce3','coil','大家都在說你呢。','baguashe'],
 lanMgr:['藍經理','lanMgr','#69aaff','stamp','你的努力，我再看看。','lan'],
 ganqiaoFull:['幹譙龍','ganqiaoFull','#ffad40','quake','忍到現在，該爆發了吧！','ganqiao'],
 guan:['冠老闆','guan','#ffe9a2','crown','在這裡，我說了算。','guanlaoban'],
 incubus:['夢魘超人','incubus','#a6ffb5','fracture','不抱期待，就不會失望。','incubus'],
};
const CROPS = {
 folaidiKing:[490,180,220,320], kabanKing:[490,180,220,320],
 qian:[395,130,220,338], lan:[390,135,225,340], lanMgr:[390,135,225,340],
 nightmare:[430,128,190,335], hell:[485,165,195,355], incubus:[465,139,215,405],
 midKing:[500,284,185,140], ganqiaoFull:[495,435,190,137],
 baguashe:[365,190,250,260], xinji:[435,179,200,283], guan:[416,134,235,343],
};
const endingLines = [
 ['','我終於找回自己了。'],
 ['佛賴弟王／錢大姐／藍教頭','哼，總算站起來了。掌聲可不是免費的！'],
 ['惡夢超人／悶幹譙／地獄超人','別得意。以後照樣會怕、會痛、會失敗！'],
 ['加班鬼王／新雞／八卦蛇','拍拍手而已，明天還不是得面對爛事。'],
 ['藍經理／幹譙龍／冠老闆／夢魘超人','算你有種。領帶還是歪的，別以為我們不會再來！'],
 ['主角','我知道。你們可以繼續說。我的路，我自己走。'],
 ['','真正的強大，是不再把自己交給別人的聲音。'],
];
const roles=['企劃・導演','故事・角色設計','美術・動畫','程式・遊戲設計','音樂・音效','測試・製作'];
export function createCinematics(renderer, audioProvider) {
 const root=document.createElement('section'); root.id='cinema';root.hidden=true;root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');
 root.innerHTML='<div class="cinema-lines" aria-hidden="true"></div><div class="cinema-portrait" aria-hidden="true"></div><div class="cinema-top"><span class="cinema-kicker"></span><button class="cinema-skip"></button></div><div class="cinema-caption"><h2></h2><p></p></div><div class="cinema-progress"><i></i></div><div class="cinema-credits" hidden></div>';
 document.body.append(root);
 const storyboard=createBossStoryboard(root,audioProvider);
 const $=q=>root.querySelector(q), skip=$('.cinema-skip'), title=$('h2'), subtitle=$('p'), credits=$('.cinema-credits');
 let active=null, scene=null, camera=null, actors=[], elapsed=0, shot=-1, previousFocus=null;
 let endingTexture=null;
 new THREE.TextureLoader().load('assets/source/pic/cinematics/ending_applause.png?v=20261115canon', texture=>{endingTexture=texture;});
 let artScene=null, artMaterial=null;
 function clearScene(){if(artScene){artScene.children[0].geometry.dispose();artMaterial.dispose();artScene=null;artMaterial=null;}for(const a of actors){scene?.remove(a.root);a.dispose?.();} actors=[];scene?.traverse(o=>{if(o.isMesh){o.geometry.dispose();if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material.dispose();}});scene=null;}
 function cancel(){if(!active)return;active=null;storyboard.stop();root.hidden=true;document.body.classList.remove('in-cinematic');clearScene();previousFocus?.focus?.({preventScroll:true});}
 function finish(){const done=active?.done;cancel();done?.();}
 function base(mode,done){cancel();previousFocus=document.activeElement;active={mode,done};elapsed=0;shot=-1;root.hidden=false;document.body.classList.add('in-cinematic');root.dataset.mode=mode;credits.hidden=true;title.hidden=false;subtitle.hidden=false;skip.textContent=t('跳過');skip.focus({preventScroll:true});root.setAttribute('aria-label',t(mode==='boss'?'心魔來襲':'找回自己'));
  scene=new THREE.Scene();scene.background=new THREE.Color(mode==='boss'?0x07121b:0x0c1b19);scene.fog=new THREE.Fog(scene.background,20,55);
  camera=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,.1,100);
  scene.add(new THREE.HemisphereLight(0xe7ffd8,0x211936,2.2));const light=new THREE.DirectionalLight(0xffe6a1,3);light.position.set(-4,8,8);scene.add(light);
  const floor=new THREE.Mesh(new THREE.CircleGeometry(24,64),new THREE.MeshStandardMaterial({color:0x183b30,roughness:.35,metalness:.45}));floor.rotation.x=-Math.PI/2;floor.position.y=-.04;scene.add(floor);
  for(let i=0;i<5;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(3+i*2,.018,5,80),new THREE.MeshBasicMaterial({color:0xc6dd8f,transparent:true,opacity:.2}));ring.rotation.x=Math.PI/2;ring.position.y=.01;scene.add(ring);}
 }
 function actor(kind,x,z,height=3.2){const v=createVisual(kind,false);v.root.position.set(x,0,z);scene.add(v.root);const bounds=new THREE.Box3().setFromObject(v.root),size=bounds.getSize(new THREE.Vector3());v.root.scale.multiplyScalar(height/Math.max(size.y,.1));v.play('idle');actors.push(v);return v;}
 function boss(kinds,done){base('boss',done);active.kinds=kinds;active.starts=[];active.duration=0;for(const key of kinds){active.starts.push(active.duration);active.duration+=BOSS_STORYBOARDS[key].duration;}storyboard.prepare(kinds);showBoss(0);}
 function showBoss(index){shot=index;for(const a of actors){scene.remove(a.root);a.dispose?.();}actors=[];
  const key=active.kinds[index], p=BOSS_PROFILES[key];active.profile=p;active.loadWait=0;
  root.dataset.motif=p[3];root.style.setProperty('--cinema-color',p[2]);
  $('.cinema-kicker').textContent=t('心魔來襲');title.className='cinema-name system-lettering';title.textContent=t(p[0]);subtitle.textContent=t(p[4]);
  // Existing full-body front view: source sheet is neither edited nor regenerated.
  const portrait=$('.cinema-portrait');portrait.style.backgroundImage=`url(assets/source/pic/sheet/unified/sheet_${p[5]}.png)`;
  const [x,y,w,h]=CROPS[key];portrait.style.aspectRatio=`${w}/${h}`;portrait.style.backgroundSize=`${1728/w*100}% ${1152/h*100}%`;portrait.style.backgroundPosition=`${x/(1728-w)*100}% ${y/(1152-h)*100}%`;
  portrait.style.animation='none';void portrait.offsetWidth;portrait.style.animation='';
  actor(p[1],0,0,3.4).root.visible=false;storyboard.start(key);
 }
 function ending(done){base('ending',done);root.dataset.motif='dawn';root.style.setProperty('--cinema-color','#ffdf79');active.duration=7*4.5+8;active.clapBeat=-1;
  actor('brave',0,1.5,3.6);
  Object.values(BOSS_PROFILES).forEach((p,i)=>{const row=i<7?0:1,j=row?i-7:i,count=row?6:7;actor(p[1],(j-(count-1)/2)*2.05,-2-row*2.6,2.5);});
  artScene=new THREE.Scene();
  artMaterial=new THREE.ShaderMaterial({uniforms:{map:{value:endingTexture},viewport:{value:new THREE.Vector2(innerWidth,innerHeight)},imageSize:{value:new THREE.Vector2(1536,1024)},time:{value:0},zoom:{value:1},pan:{value:0}},
   vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
   fragmentShader:`precision mediump float;varying vec2 vUv;uniform sampler2D map;uniform vec2 viewport;uniform vec2 imageSize;uniform float time;uniform float zoom;uniform float pan;
   void main(){vec2 q=vec2(vUv.x,1.-vUv.y);float scale=min(viewport.x/imageSize.x,viewport.y*.72/imageSize.y)*zoom;vec2 extent=imageSize*scale;vec2 p=(q*viewport-vec2((viewport.x-extent.x)*.5+pan*viewport.x,viewport.y*.43-extent.y*.5))/extent;
   vec2 back=(q-.5)*.7+.5;vec3 color=texture2D(map,vec2(back.x,1.-back.y)).rgb*.14;
   if(p.x>=0.&&p.x<=1.&&p.y>=0.&&p.y<=1.){float crowd=smoothstep(.09,.19,abs(p.x-.5));float hands=exp(-pow((p.y-.43)*19.,2.))+exp(-pow((p.y-.22)*25.,2.));vec2 shift=vec2(sin(time*12.+floor(p.x*10.)*.7)*.0025*hands,sin(time*1.4+p.x*12.)*.0008)*crowd;vec2 coord=p+shift; color=texture2D(map,vec2(coord.x,1.-coord.y)).rgb;}
   gl_FragColor=vec4(color,1.);}`});
  artScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),artMaterial));
  audioProvider()?.playBgm('bgm_ending');$('.cinema-kicker').textContent=t('找回自己');
  credits.replaceChildren();const heading=document.createElement('h2');heading.textContent='STAFF';credits.append(heading);
  for(const role of roles){const row=document.createElement('p'),label=document.createElement('span'),name=document.createElement('strong');label.textContent=t(role);name.textContent='LilinS';row.append(label,name);credits.append(row);}
  const thanks=document.createElement('p');thanks.className='credits-thanks';thanks.textContent=t('謝謝你，走到了這裡。');credits.append(thanks);
 }
 skip.addEventListener('click',()=>{if(active?.mode==='ending'&&elapsed<31.5){elapsed=31.5;shot=-1;}else finish();});
 addEventListener('keydown',e=>{if(!active)return;if(['Escape','Space','Enter'].includes(e.code)){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)skip.click();}else if(e.code==='Tab'){e.preventDefault();skip.focus();}},true);
 function update(dt){if(!active)return false;
  const waiting=active.mode==='boss'&&!storyboard.ready()&&(active.loadWait||0)<5;
  if(waiting)active.loadWait=(active.loadWait||0)+dt;
  if(!document.hidden&&!waiting)elapsed+=dt;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
  if(active.mode==='boss'){
   const index=Math.max(0,active.starts.findLastIndex(start=>elapsed>=start));if(index!==shot)showBoss(index);
   const local=elapsed-active.starts[index], a=actors[0], motif=active.profile[3];
   root.dataset.shot=local<.7?'reveal':local<3.2?'hold':'exit';
   const entrance=Math.min(1,local/.85), ease=1-Math.pow(1-entrance,3);
   a.update(dt);a.root.position.x=reduced?0:(1-ease)*(motif==='slash'?-7:motif==='coil'?7:0);
   a.root.position.y=reduced?0:(1-ease)*(motif==='impact'||motif==='quake'?6:motif==='mist'?1.5:0);
   a.root.rotation.y=reduced?0:(motif==='coins'||motif==='crown'?(1-ease)*Math.PI*2:Math.sin(local*.55)*.18);
   const narrow=camera.aspect<1;camera.position.set(reduced?0:Math.sin(local*.4)*.5,2.3,(narrow?11:8.3)-Math.min(local,3)*.25);camera.lookAt(0,1.7,0);
   storyboard.render(local,reduced,active.profile[2]);
   if(['mirror','fracture'].includes(motif))a.root.position.x=Math.sin(local*23)*Math.max(0,.55-local)*.2;
  }else{
   const index=Math.floor(elapsed/4.5), isCredits=elapsed>=31.5;
   root.dataset.act=isCredits?'credits':String(index);
   if(index!==shot&&!isCredits){shot=index;const line=endingLines[Math.min(index,6)];title.className='cinema-name system-lettering';title.textContent=t(line[0]||'找回自己');subtitle.textContent=t(line[1]);}
   if(isCredits&&!active.credits){active.credits=true;credits.hidden=false;title.hidden=subtitle.hidden=true;credits.style.animation=reduced?'none':'credits-roll 8s linear both';audioProvider()?.playBgm('bgm_credits');$('.cinema-kicker').textContent='STAFF';}
   actors.forEach((a,i)=>{a.update(dt);if(i>0&&elapsed>=4.5){const clap=(Math.sin(elapsed*12+i*.8)+1)/2;if(a.p?.armL){a.p.armL.rotation.set(-1.15,0,-.35-clap*.65);a.p.armR.rotation.set(-1.15,0,.35+clap*.65);}else if(a.p?.segs){a.p.segs.at(-1).position.y=.3+clap*.45;}a.root.rotation.y=Math.atan2(-a.root.position.x,1.5-a.root.position.z)*.65;}});
   const portrait=camera.aspect<1;
   // Wide applause establishes the entire cast; close-up returns to an unshaken hero.
   const close=index===0||index>=5&&!isCredits;let distance=close?(portrait?11:8):(portrait?30:18);
   camera.position.set(reduced?0:Math.sin(elapsed*.14)*(close?.35:.8),close?2.6:7,distance);camera.lookAt(0,close?1.8:.8,close?1:-1);
   if(!isCredits&&elapsed>=4.5){const beat=Math.floor(elapsed*2);if(beat!==active.clapBeat){active.clapBeat=beat;audioProvider()?.applause?.();}}
  }
  $('.cinema-progress i').style.transform=`scaleX(${Math.min(1,elapsed/active.duration)})`;
  if(active.mode==='ending' && endingTexture && artScene){
   const act=Math.floor(elapsed/4.5), zoom=act===0||act===5?1.6:act===2||act===3?1.25:1;
   artMaterial.uniforms.map.value=endingTexture;artMaterial.uniforms.imageSize.value.set(endingTexture.image.width,endingTexture.image.height);
   artMaterial.uniforms.viewport.value.set(innerWidth,innerHeight);artMaterial.uniforms.time.value=reduced?0:elapsed;
   artMaterial.uniforms.zoom.value=zoom;artMaterial.uniforms.pan.value=act===2?.10:act===3?-.10:0;
   renderer.render(artScene,camera);
  }else renderer.render(scene,camera);
  if(elapsed>=active.duration)finish();
  return true;
 }
 return {boss,ending,cancel,update,prepareBoss:storyboard.prepare,get active(){return Boolean(active);},get state(){return active?{mode:active.mode,elapsed,duration:active.duration,cast:actors.length}:null;}};
}
