const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'../../02_brave_guy'),rd=f=>fs.readFileSync(path.join(root,f),'utf8');
const src=rd('js/main.js'), selector=src.split('\n').find(l=>l.includes('const stageVisualKinds='));
assert.ok(selector);
const choose=(form,selectedCharacter)=>vm.runInNewContext(selector+'\nArray.from(stageVisualKinds)',{STAGES:[{form}],index:0,selectedCharacter});
for(const [f,c,wanted] of [['worker','brave','worker'],['student','brave','student'],['worker','angel','angel_playable'],['worker','nightmare','nightmare']])
  assert.equal(choose(f,c).join(),wanted);
assert.match(src,/new Set\(\[.*'worker'/);
const cfg=JSON.parse(rd('assets/manifest.json')).models.worker;
const file=fs.readFileSync(path.join(root,cfg.url)),j=JSON.parse(file.subarray(20,20+file.readUInt32LE(12)));
assert.equal(j.skins[0].joints.length,17);assert.ok(file.length<2250000);
for(const state of ['idle','run','attack1','attack2','dodge','hit','stun','die','transform'])
 assert.ok(j.animations.find(a=>a.name===cfg.clips[state]&&a.channels.length>=4),state);
assert.match(src,/function revert[\s\S]{0,125}setForm\(hero.base\)/);
console.log('PASS: worker is stage-gated; model includes stable timing for all base-form motions and hero still reverts to base form');
