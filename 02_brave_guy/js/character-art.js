import { CHARACTER_ART as art } from './character-art-data.js?v=20261120castfix';
import { lang } from './i18n.js?v=20261120assets';
const requested=new URLSearchParams(location.search).get('skillStyle');
let style=requested==='legacy'||art.reviewStyles.includes(requested)?requested:art.defaultStyle;
export const characterArtEnabled=()=>art.reviewStyles.includes(style);
export function applyCharacterArt(hud,id){
 const record=art.characters[id]||art.characters.brave;
 for(const button of hud.querySelectorAll('.act'))delete button.dataset.atlasSlot;
 if(!characterArtEnabled()||!record.skills[style]){delete hud.dataset.artStyle;return;}
 hud.dataset.artStyle=style;
 const cols=art.skill_grid.columns,rows=art.skill_grid.rows;hud.style.setProperty('--atlas-size',`${cols*100}% ${rows*100}%`);
 hud.style.setProperty('--character-skill-atlas',`url("${new URL(record.skills[style].runtime,document.baseURI).href}")`);
 hud.style.setProperty('--character-art-accent',record.palette[1]);
 for(const button of hud.querySelectorAll('.act')){
  const key=button.dataset.action||(button.id==='btn-lock'?'lock':button.id==='btn-cycle-lock'?'cycle':'');
  if(style!=='classic2d'&&(key==='lock'||key==='cycle')){delete button.dataset.atlasSlot;continue;}
  const index=art.skill_grid.slots.indexOf(key);if(index<0)continue;
  button.dataset.atlasSlot=key;
  if(!button.querySelector('.art-lock-mark')){const mark=document.createElement('span');mark.className='art-lock-mark';mark.setAttribute('aria-hidden','true');button.append(mark);}
  button.style.setProperty('--atlas-x',`${index%cols*100/(cols-1)}%`);
  button.style.setProperty('--atlas-y',`${Math.floor(index/cols)*100/(rows-1)}%`);
 }
}
// Review both editions in the actual game, without changing saves or choosing a default for the user.
export function setCharacterArtStyle(value){
 if(!['legacy',...art.reviewStyles].includes(value))throw new Error('Unknown art style');
 style=value;const hud=document.getElementById('hud');applyCharacterArt(hud,hud.dataset.character||'brave');
 return style;
}
function titleWindow(record,col,row){
 const a=record.titles,[W,H]=a.size||[3600,1800];
 const [x,x2]=a.columns?.[col]||[col*W/3,(col+1)*W/3];
 const [y,y2]=a.rows?.[row]||[row*H/5,(row+1)*H/5];
 return {ratio:`${x2-x} / ${y2-y}`,size:`${W/(x2-x)*100}% ${H/(y2-y)*100}%`,pos:`${x/(W-x2+x)*100}% ${y/(H-y2+y)*100}%`};
}
function renderCharacterTitle(id,record,row){
 const col=Math.max(0,art.title_grid.columnsByLanguage.indexOf(lang));
 const el=document.createElement('span');el.className='word-art character-title-art';
 el.dataset.character=id;el.dataset.action=art.title_grid.rowsByAction[row];el.dataset.locale=lang;
 el.setAttribute('role','img');el.setAttribute('aria-label',record.titles.labels[row][col]);
 const win=titleWindow(record,col,row);el.style.aspectRatio=win.ratio;el.style.backgroundImage=`url("${record.titles.runtime}")`;
 el.style.backgroundSize=win.size;el.style.backgroundPosition=win.pos;
 return el;
}
export function characterTitle(text,characterId=document.getElementById('hud')?.dataset.character||'brave'){
 const record=art.characters[characterId];
 if(!characterArtEnabled()||!record)return null;
 const normalize=value=>String(value).replace(/[\s！!～~]/g,'');
 const row=record.titles.labels.findIndex(labels=>labels.some(label=>normalize(label)===normalize(text)));
 return row<0?null:renderCharacterTitle(characterId,record,row);
}
// Cast labels use the approved dialogue atlas regardless of the control icon skin.
export function characterSkillTitle(characterId,action){
 const record=art.characters[characterId];
 const row=art.title_grid.rowsByAction.indexOf(action);
 return record?.titles.labels[row]?renderCharacterTitle(characterId,record,row):null;
}
export function applyCharacterSpeech(el,id,kind='talk'){
 const c=art.characters[id]||art.characters.brave;
 el.classList.add('character-speech');el.dataset.speaker=id;
 el.style.setProperty('--speech-atlas',`url("${new URL(c.titles.runtime,document.baseURI).href}")`);
 const win=titleWindow(c,Math.max(0,art.title_grid.speechColumns.indexOf(kind)),4);
 el.style.setProperty('--speech-size',win.size);el.style.setProperty('--speech-position',win.pos);
}
