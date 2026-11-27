const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const dir=path.resolve(__dirname,'../../02_brave_guy'),read=f=>fs.readFileSync(path.join(dir,f),'utf8');
const config=JSON.parse(read('assets/manifest.json')).models;
const src=read('js/main.js'), visuals=read('js/visuals.js');
for(const [id,height,bones,clipLengths] of [
 ['hell',2.3,18,{hellRush:.95,hellQuake:.9,hellFire:.51,hellTaunt:.7,hellKi:.7}],
 ['guan',3.4,12,{guanDive:2.2,guanPies:.41,spreadCast:.72}]
]){
 const c=config[id];
 assert.equal(c.height,height);
 const b=fs.readFileSync(path.join(dir,c.url));
 const j=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)));
 assert.equal(j.skins[0].joints.length,bones);
 assert.ok(b.length<2400000);
 for(const key of ['idle','run','spawn','die',...Object.keys(clipLengths)]){
  const anim=j.animations.find(a=>a.name===c.clips[key]);assert.ok(anim?.channels.length>=(key==='idle'?3:4),id+' '+key);
  if(clipLengths[key]) {
   const seconds=j.accessors[anim.samplers[0].input].max[0];
   assert.ok(Math.abs(seconds-clipLengths[key])<1e-5,key+' seconds');
   assert.ok(visuals.split('const ONE_SHOT')[1].split(';')[0].includes("'"+key+"'"),key+' one shot');
  }
 }
}
assert.match(src,/ARCHIVE_STAGE_BOSSES=new Set\(\['hell','guan'\]\)/);
assert.match(src,/if\(ARCHIVE_STAGE_BOSSES.has\(st.boss\)\)stageVisualKinds.push\(st.boss\)/);
console.log('PASS: correct stage-only boss rigs, geometry budgets and dedicated combat clip lengths');
