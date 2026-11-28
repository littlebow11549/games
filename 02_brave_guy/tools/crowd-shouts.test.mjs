import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source=readFileSync(new URL('../js/main.js',import.meta.url),'utf8');
const fn=source.slice(source.indexOf('function popup('),source.indexOf('function showSkillCastName('));
function fixture(size){
 const element=(layer=null)=>{
  const tags=new Set();
  return {style:{setProperty(){}},dataset:{},classList:{add:k=>tags.add(k),contains:k=>tags.has(k)},
   remove(){layer?.splice(layer.indexOf(this),1);},addEventListener(){}};
 };
 const world=[],ann=[];
 const layer=(items,occupied)=>({get childElementCount(){return occupied+items.length;},
  querySelector(sel){return items.find(n=>n.classList.contains(sel.slice(1)));},
  append(el){items.push(el);el.remove=()=>items.splice(items.indexOf(el),1);}});
 const ui=layer(world,size),overlay=layer(ann,0);
 const popup=runInNewContext(fn+'\npopup',{ $:id=>id==='world-ui'?ui:overlay, screenPos:()=>({x:200,y:300}),rand:()=>0,
  document:{createElement:()=>element()},innerWidth:390,innerHeight:844,setSystemArt(el,text){if(text==='atlas')el.classList.add('has-word-art');} });
 return {world,ann,show:(text,kind,voice)=>popup({},0,text,kind,voice)};
}
test('critical battle shouts remain visible at 71 and 160 world elements while damage numbers remain capped',()=>{
 for(const n of [71,160]){
  const v=fixture(n);
  v.show('damage');v.show('speech','shout','xinji');v.show('new speech','shout','baguashe');
  assert.equal(v.world.length,1);
  assert(v.world[0].classList.contains('battle-shout'));
  assert.equal(v.world[0].dataset.voice,'baguashe');
 }
});
test('atlas shouts survive the crowd cap and replace only the previous atlas shout',()=>{
 const v=fixture(160);
 const skill={classList:{contains:k=>k==='skill-cast-name'}};
 v.ann.push(skill);
 v.show('atlas','shout');const previous=v.ann[1];v.show('atlas','shout');
 assert.equal(v.ann.length,2);
 assert.equal(v.ann[0],skill);
 assert(v.ann[1].classList.contains('popup-announcement'));
 assert.notEqual(v.ann[1],previous);
});
test('ordinary damage numbers still show without crowd pressure',()=>{
 const v=fixture(70);v.show('damage');v.show('damage');assert.equal(v.world.length,1);
});
