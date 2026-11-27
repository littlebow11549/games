const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../../02_brave_guy');
const {makeCrowdResolution}=require(path.join(root,'js/crowd-visual-budget.js'));
test('intermittent 31 FPS crowds lower resolution without penalizing healthy or isolated slow frames',()=>{
 const run=(f,count=180)=>{const g=makeCrowdResolution();for(let i=0;i<120;i++)g.tick(f(i),count,true);return g.scale;};
 assert.equal(run(i=>i%10===9?.020:1/30),.72);
 assert.equal(run(()=>1/60),1);
 assert.equal(run(i=>i===49?.3:1/60),1);
 assert.equal(run(()=>1/30,20),1);
});
test('boot queues actual module graph without waiting on a probe request',()=>{
 const html=fs.readFileSync(path.join(root,'play.html'),'utf8');
 const src=html.split('<script>').find(x=>x.includes('var note =')).split('</script>')[0];
 const scripts=[];
 const dummy=()=>({style:{},addEventListener(){},classList:{add(){}}});
 const dom=new Map();
 const document={getElementById(id){if(!dom.has(id))dom.set(id,dummy());return dom.get(id);},createElement:dummy,body:{appendChild(s){scripts.push(s);}}};
 const env={document,window:{fetch:true,ReadableStream:true,addEventListener(){}},fetch:()=>new Promise(()=>{}),setInterval(){},clearInterval(){},setTimeout(){},URLSearchParams,location:{search:''},localStorage:{getItem(){}}};
 vm.runInNewContext(src,env);
 assert.equal(scripts.length,1);
 assert.equal(scripts[0].type,'module');
 assert(html.includes('rel="modulepreload" href="'+scripts[0].src+'"'));
 env.window.__progress(80,'critical load');
 env.window.__progress(59,'late resource callback');
 assert.equal(dom.get('boot-caption').textContent,'critical load');
});
test('pause provides semantic help without taking space on combat HUD',()=>{
 const html=fs.readFileSync(path.join(root,'play.html'),'utf8');
 const main=fs.readFileSync(path.join(root,'js/main.js'),'utf8');
 assert.match(html,/<div id="pause-menu"[\s\S]*?<details id="pm-guide"[\s\S]*?<summary id="pm-guide-label">/);
 assert.match(main,/pm-guide-touch[\s\S]*pm-guide-pc/);
});

test('transformation status lives with quest info, not on the action menu',()=>{
 const html=fs.readFileSync(path.join(root,'play.html'),'utf8');
 const quest=html.slice(html.indexOf('class="quest"'),html.indexOf('class="boss-bar"'));
 const actions=html.slice(html.indexOf('class="actions"'),html.indexOf('id="combo"'));
 assert(quest.includes('id="transform-status"'));
 assert(!actions.includes('id="transform-status"'));
});
