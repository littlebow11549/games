const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'../../02_brave_guy'),T=require(path.join(root,'vendor/three/three.module.min.js'));
const read=name=>fs.readFileSync(path.join(root,'js',name),'utf8').replace(/^import .*;$/gm,'').replaceAll('export ','');
const ctx=()=>new Proxy({},{get:(o,k)=>k in o?o[k]:(()=>{})});
const THREE={...T,TextureLoader:class{loadAsync(){return Promise.resolve(new T.Texture());}}};
const env={THREE,URL,document:{createElement:()=>({getContext:ctx})}};
const {Fx}=vm.runInNewContext(read('impact-art.js')+'\n'+read('dispose-owned.js')+'\n'+read('fx.js').replace('import.meta.url',"'https://example.test/js/fx.js'")+'\n({Fx})',env);
async function main(){
 await new Promise(r=>setImmediate(r));
 const f=new Fx(new T.Scene()),pos={x:7,z:-2};
 const light=f.hitSpark(pos,1),heavy=f.hitSpark(pos,1,true),counter=f.hitSpark(pos,1,'counter'),guard=f.hitSpark(pos,1,'guard');
 const hits=[light,heavy,counter,guard];
 assert.deepEqual(hits.map(o=>o.userData.kind),['light','heavy','counter','guard']);
 assert.equal(new Set(hits.map(o=>o.material.map)).size,4);
 hits.forEach(o=>{assert.equal(o.position.x,7);assert.equal(o.position.y,1);assert.equal(o.position.z,-2);assert.equal(o.material.depthWrite,false);});
 const heavyTexture=heavy.material.map;let materialDispose=0,textureDispose=0;
 heavy.material.addEventListener('dispose',()=>materialDispose++);
 heavyTexture.addEventListener('dispose',()=>textureDispose++);
 for(let i=1;i<8;i++){f.update(.025001);assert.equal(light.userData.frame,i);}
 assert.ok(heavy.material.opacity<1);
 f.update(.1);assert.equal(f.items.length,0);
 assert.equal(materialDispose,1);assert.equal(textureDispose,0);
 for(let i=0;i<40;i++)f.hitSpark(pos,1,'heavy');
 assert.equal(f.items.length,18);assert.equal(f.items[0].obj.material.map,heavyTexture);
 f.clear();assert.equal(f.scene.children.length,0);assert.equal(textureDispose,0);
 console.log('PASS 8 original light frames; heavy/counter/guard sprite identity, position, fade, cap, shared texture lifetime, cleanup');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
