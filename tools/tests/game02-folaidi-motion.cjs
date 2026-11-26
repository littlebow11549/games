const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../../02_brave_guy');
const read=n=>fs.readFileSync(path.join(root,n),'utf8');
const main=read('js/main.js');
const models=JSON.parse(read('assets/manifest.json')).models;
const visual=read('js/visuals.js');
const kit=vm.runInNewContext(read('js/folaidi-motion.js').replaceAll('export ','')+'\n({folaidiNeeded,folaidiMove,folaidiSpawn})');

assert.equal(kit.folaidiNeeded({waves:[{folaidi:2}]},[]),true);
assert.equal(kit.folaidiNeeded({waves:[]},[{vis:'boss'}]),true);
assert.equal(kit.folaidiNeeded({waves:[]},[{vis:'qian_school',minion:'folaidi'}]),true);
assert.equal(kit.folaidiNeeded({waves:[{kaban:2}]},[{vis:'kabanKing',minion:'kaban'}]),false);
for(const [name,duration,joint] of [['slam',.95,'skill1'],['charge',1.50,'skill2'],['summon',.50,'skill3']]){
 const boss={kind:'folaidiKing',visual:{actions:{[joint]:{}}}};
 assert.deepEqual(Array.from(kit.folaidiMove(boss,name)),[joint,duration]);
 assert.equal(kit.folaidiMove({...boss,kind:'kabanKing'},name),null);
 assert.equal(kit.folaidiMove({...boss,visual:{}},name),null);
}
assert.equal(kit.folaidiSpawn('folaidi',{actions:{spawn:{}}}),.45);
assert.equal(kit.folaidiSpawn('folaidiKing',{actions:{spawn:{}}}),.45);
assert.equal(kit.folaidiSpawn('kaban',{actions:{spawn:{}}}),0);
assert.equal(kit.folaidiSpawn('folaidi',{}),0);
const glb=fs.readFileSync(path.join(root,models.folaidi.url));
const g=JSON.parse(glb.subarray(20,20+glb.readUInt32LE(12)));
assert.equal(g.skins[0].joints.length,17);
assert.equal(g.animations.length,12);
assert.ok(glb.length<1900000);
for(const key of ['idle','run','backstep','attack','hit','stun','die','spawn','skill1','skill2','skill3','kingSpawn']){
 const name=key==='kingSpawn'?'KingWake':models.folaidi.clips[key];
 assert.ok(g.animations.some(a=>a.name===name),key);
}
assert.match(main,/kind==='folaidiKing'\?\{modelKind:'folaidi',height:def.height,kingWake:true\}/);
assert.match(main,/if \(def\.ranged\) \{[\s\S]{0,550}hostileShot\(e\.pos, e\.yaw, \{ dmg: def\.dmg/);
assert.match(main,/if \(!e\.struck && e\.t >= def\.windup\)/);
assert.match(main,/if \(t > 0\.7 && t < 1\.5\)/);
assert.match(main,/if \(e\.cast\.t < 0\.95\)/);
assert.match(visual,/buildFolaidiBed/);
console.log('PASS: Folaidi rig, both birth sequences, stage preloads, Boss moves, workplace unaffected and original trigger times');
