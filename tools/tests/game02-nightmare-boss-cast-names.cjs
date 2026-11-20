const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const art = require('../../02_brave_guy/assets/records/brave_guy_character-art.json');
const game = path.resolve(__dirname, '../../02_brave_guy/js');
const read = name => fs.readFileSync(path.join(game, name), 'utf8');
function element(){
  return {className:'', dataset:{}, style:{setProperty(k,v){this[k]=v;}}, attrs:{}, items:[],
    setAttribute(k,v){this.attrs[k]=v;}, append(e){this.items.push(e);},
    addEventListener(k,fn){this[k]=fn;}};
}
class Vector3 {
  constructor(x=0,y=0,z=0){Object.assign(this,{x,y,z});}
  clone(){return new Vector3(this.x,this.y,this.z);}
  normalize(){const d=Math.hypot(this.x,this.y,this.z);if(d){this.x/=d;this.y/=d;this.z/=d;}return this;}
  addScaledVector(v,s){this.x+=v.x*s;this.y+=v.y*s;this.z+=v.z*s;return this;}
}
(async () => {
  const main = read('main.js');
  const factory = /const nightmareBossSkills=(createNightmareBossSkills\([^\n]+\));/.exec(main)[1];
  const showFn = /function showSkillCastName\([\s\S]+?\n}/.exec(main)[0];
  const characterModule = /from '(\.\/character-art\.js[^']+)'/.exec(main)[1];
  global.location={search:''};
  global.document={documentElement:{},querySelectorAll:()=>[],createElement:element};
  const {setLang}=await import('../../02_brave_guy/js/i18n.js?v=20261120assets');
  const {characterSkillTitle}=await import('../../02_brave_guy/js/'+characterModule.slice(2));
  const layer=element(), calls={popup:[],telegraph:[],screen:[]};
  layer.append=function(e){e.remove=()=>{const idx=this.items.indexOf(e);if(idx>=0)this.items.splice(idx,1);};this.items.push(e);};
  layer.querySelector=function(sel){const m=/data-caster="([^"]+)"/.exec(sel);return this.items.find(e=>e.dataset.caster===m?.[1]);};
  const hero={character:'brave',pos:new Vector3(1,0,2)};
  const ctx=vm.createContext({
    hero, document:global.document, characterSkillTitle,
    $:id=>{assert.equal(id,'skill-announcements');return layer;},
    angelText:v=>v,t:v=>v, THREE:{Vector3}, scene:{}, ARENA_RADIUS:40,
    hurtHero(){}, hostileShot(){}, clampArena(){}, fx:{trail(){},telegraph(...args){calls.telegraph.push(args);}},
    popup(...args){calls.popup.push(args);},
    screenPos(pos,height){calls.screen.push([pos,height]);return {x:145,y:300,visible:true};}
  });
  vm.runInContext(read('nightmare-boss-skills.js').replace(/^import .*\n/gm,'').replace('export function','function')+'\n'+showFn+'\nvar bossSkills='+factory+';',ctx);
  const moves=ctx.bossSkills.moves;
  const rows=['nDash','nDrones','nShout','nKing'];
  let passes=0;
  for(const [col,locale] of art.title_grid.columnsByLanguage.entries()){
    setLang(locale);
    for(const player of ['brave','angel','nightmare']){
      hero.character=player;
      ctx.showSkillCastName('skill1','');
      const playerTile=layer.items.find(e=>e.dataset.caster==='player');
      assert.equal(playerTile.items[0].dataset.character,player);
      for(const [row,move] of rows.entries()){
        const boss={pos:new Vector3(4,0,5),def:{height:2.5},y:.4,cast:{},visual:{played:[],play(k){this.played.push(k);}}};
        const action=art.title_grid.rowsByAction[row];
        moves[move].start(boss,1,0,4);
        assert.deepEqual(boss.visual.played,[action]);
        assert.equal(calls.telegraph.at(-1)[0],boss.pos);
        assert.equal(calls.telegraph.at(-1)[1],[3,3,13,6][row]);
        const bossTile=layer.items.find(e=>e.dataset.caster==='boss');
        assert.equal(layer.items.length,2,'player and boss channels do not erase each other');
        assert.equal(layer.items.find(e=>e.dataset.caster==='player'),playerTile);
        assert.equal(bossTile.items.length,1,'one localized art sticker and no generic speech');
        const title=bossTile.items[0];
        assert.equal(title.dataset.character,'nightmare');
        assert.equal(title.dataset.locale,locale);
        assert.equal(title.dataset.action,action);
        assert.equal(title.attrs['aria-label'],art.characters.nightmare.titles.labels[row][col]);
        assert.match(title.style.clipPath,/^polygon\(/);
        assert.equal(calls.screen.at(-1)[0],boss.pos);
        assert(Math.abs(calls.screen.at(-1)[1]-3.8)<1e-9);
        ++passes;
      }
    }
  }
  assert.equal(calls.popup.length,0,'the named Q/E/R/F starts never use the old popup route');
  layer.items.length=0;
  const boss={pos:new Vector3(),def:{height:2.5},cast:{},visual:{play(){}}};
  moves.nPunch.start(boss);
  assert.equal(calls.popup.length,1);
  assert.equal(calls.popup[0][2],'別以為我會手下留情。');
  assert.equal(layer.items.length,0,'the unrelated normal line is not a cast label');
  console.log('PASS: '+passes+' Nightmare boss casts by 4 actions × 3 locales × 3 player choices; distinct announcement channels, caster anchor, and normal dialogue.');
})().catch(error=>{console.error(error);process.exitCode=1;});
