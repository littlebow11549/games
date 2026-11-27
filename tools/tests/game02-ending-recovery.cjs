const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'../../02_brave_guy/js');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const {queueEnding,creditEnding,restoreEnding}=vm.runInNewContext(read('ending-save.js').replaceAll('export ','')+'\n({queueEnding,creditEnding,restoreEnding})');
const roundtrip=s=>JSON.parse(JSON.stringify(s));
for(const [before,fresh,after,unlock] of [[0,false,1,undefined],[2,true,3,'nightmare'],[3,true,4,'angel'],[4,false,4,undefined]]){
 let save={rounds:before,freshRun:fresh,cleared:['1-0','4-1'],pendingCharacters:['existing']};
 const stats={id:'4-1',name:'test',time:'60',kills:2};
 queueEnding(save,stats,false);
 save=roundtrip(save);
 assert.ok(restoreEnding(save,'4-1'));
 assert.equal(save.rounds,before);assert.equal(save.pendingEnding.stats.time,'60');
 creditEnding(save);save=roundtrip(save);
 assert.equal(save.rounds,after);assert.equal(save.pendingEnding.credited,true);
 assert.equal(save.freshRun,false);
 assert.deepEqual(Array.from(save.pendingCharacters),unlock?['existing',unlock]:['existing']);
 creditEnding(save);assert.equal(save.rounds,after);
 assert.deepEqual(save.cleared,['1-0','4-1']);
}
for(const rounds of [0,2]){const old={rounds,freshRun:rounds===2,cleared:['4-1']};assert.ok(restoreEnding(old,'4-1'));creditEnding(old);assert.equal(old.rounds,rounds+1);}
assert.equal(restoreEnding({rounds:2,cleared:['4-1']},'4-1'),null);
assert.equal(restoreEnding({rounds:0,cleared:['1-0']},'4-1'),null);
const main=read('main.js');assert.match(main,/if\(last\)queueEnding/);assert.match(main,/game.phase === 'ready' && save.pendingEnding\) finishJourney/);
console.log('PASS: final clear survives reload, awards round once, preserves clears, handles both unlock thresholds and replay');
