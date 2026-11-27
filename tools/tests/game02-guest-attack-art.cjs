const assert=require('node:assert/strict');
const {test}=require('node:test'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../../02_brave_guy');
const THREE=require(path.join(root,'vendor/three/three.module.min.js'));
const pua=i=>{const m=new THREE.Sprite(new THREE.SpriteMaterial());m.userData.text='PUA '+i;return m;};
const disposeProjectileMaterial=m=>m.dispose();
const context={THREE,createPuaProjectile:pua,disposeProjectileMaterial,
  angelText:t=>t,angelFont:()=>'',document:{createElement:()=>({getContext:()=>({measureText:()=>({width:100}),strokeText(){},fillText(){}})})}};
function load(file,symbol,other={}){
 const source=fs.readFileSync(path.join(root,'js',file),'utf8').replace(/^import .+;\r?$/gm,'').replace(/^export /gm,'');
 return vm.runInNewContext(source+'\n'+symbol,{...context,...other});
}
const createAngelIceFx=load('angel-ice-fx.js','createAngelIceFx');
const createRoyalArsenal=load('royal-arsenal.js','createRoyalArsenal');
const createGuestCombat=load('guest-combat.js','createGuestCombat',{createRoyalArsenal,createAngelIceFx});
function build(character,z=6){
 const scene=new THREE.Scene(),hero={character,pos:new THREE.Vector3(),yaw:0,hp:100};
 const e={hp:100,def:{radius:1},pos:new THREE.Vector3(0,0,z),state:'chase',shown:true};
 const calls={};const spy=s=>(...args)=>{(calls[s]??=[]).push(args);};
 const fx=Object.fromEntries(['releaseWave','projectileWake','trail','burst','ring','telegraph'].map(n=>[n,spy(n)]));
 const api=createGuestCombat({scene,hero,enemies:()=>[e],fx,hit:(...args)=>{spy('hit')(...args);return{damaged:true}},line:spy('line'),move:(x,z)=>{hero.pos.x+=x;hero.pos.z+=z},audio:{sfx(){}} ,arena:50});
 return {api,scene,hero,e,calls};
}
test('Angel text remains on normal piercing bolts, and Q draws forward only',()=>{
 const {api,scene,calls}=build('angel');
 for(let i=0;i<3;i++)api.attack();
 assert.deepEqual(Array.from(api.state.projectiles,p=>p.mult),[1.45,1.95,2.75]);
 assert.ok(api.state.projectiles.every(b=>b.text.length));
 assert.equal(calls.projectileWake.length,3);
 api.begin('angel','skill1');
 const [a,b,w,,flags]=calls.line[0];
 assert.equal(w,8);assert.equal(b.clone().sub(a).length(),28);assert.equal(flags.forwardOnly,true);
 assert.equal(calls.trail[0][0].z,0); assert.equal(calls.trail[0][1].z,28);
 assert.equal(calls.projectileWake.length,4);
 api.clear();assert.equal(scene.children.length,0);
});
test('Nightmare visuals cover Q, E, R, and F without changing dash hit steps, drones or arsenal',()=>{
 const {api,scene,hero,calls}=build('nightmare');
 api.begin('nightmare','skill1');
 for(let i=0;i<35;i++)api.update(.01);
 assert.equal(calls.line.length,105);
 assert.ok(calls.trail.length<=24);
 assert.ok(Math.abs(hero.pos.z-45*.35)<1e-6);
 api.clear();hero.pos.set(0,0,0);api.begin('nightmare','skill2');
 for(let i=0;i<45;i++)api.update(.02);
 assert.equal(api.state.casts[0].nodes,5);
 assert.equal(scene.children.filter(o=>o.name==='Nightmare | PUA omen drone').length,5);
 assert.ok(calls.projectileWake.some(([m])=>/^PUA/.test(m.userData.text)));
 api.clear();const before=calls.releaseWave.length;api.begin('nightmare','skill3');
 assert.equal(calls.releaseWave.length-before,2);assert.equal(calls.hit.at(-1)[1],4);
 api.clear();api.begin('nightmare','ult');
 for(let i=0;i<60;i++)api.update(.02);
 assert.ok(scene.getObjectByName('nightmare-royal-arsenal'));
 assert.equal(api.state.casts[0].arsenal.portals,10);
 assert.ok(api.state.casts[0].arsenal.fired>0);
 for(let i=0;i<450;i++)api.update(.02);
 assert.ok(calls.hit.some(([,m])=>m===4.5));assert.equal(api.ultActive,false);
 api.clear();assert.equal(scene.children.length,0);
});
