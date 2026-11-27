const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const path=require('node:path');
const base=path.resolve(__dirname,'../../02_brave_guy');
const manifest=require(path.join(base,'assets/manifest.json'));
for(const [slot,id] of [['student_spirit','5364d389-551b-4cb6-a3c3-8f484908be6f'],['brave_spirit','ab22ce64-ef92-42b0-8128-df59aab35545']]){
 const conf=manifest.models[slot];
 assert(conf,'support slot must have its own asset');
 const b=readFileSync(path.join(base,conf.url)), js=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)));
 assert(b.length===b.readUInt32LE(8)&&b.length<1_150_000);
 assert.equal(js.extras.tripoAsset,id);
 assert.match(js.extras.sourceSha256,/^[a-f0-9]{64}$/);
 assert.deepEqual(js.skins[0].joints.map(n=>js.nodes[n].name),['Body','Wing_L','Wing_R']);
 const pr=js.meshes[0].primitives[0], pos=js.accessors[pr.attributes.POSITION];
 assert(pos.max[0]-pos.min[0]>.70 && pos.max[2]-pos.min[2]>.28);
 assert(js.accessors[pr.indices].count<=24_000);
 assert.equal(js.animations[0].name,conf.clips.idle);
 assert.equal(js.animations[0].channels.length,3);
 assert(conf.height<1.15);
}
assert.notEqual(manifest.models.angel.url,manifest.models.student_spirit.url);
assert.notEqual(manifest.models.angel_playable.url,manifest.models.brave_spirit.url);
console.log('PASS: distinct, textured Tripo-derived wing rigs with one draw and mobile geometry limits');
