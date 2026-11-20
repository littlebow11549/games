import { CHARACTER_ART as art } from './character-art-data.js?v=20261120archive';
import { lang } from './i18n.js?v=20261120assets';
const requested=new URLSearchParams(location.search).get('skillStyle');
let style=art.reviewStyles.includes(requested)?requested:art.defaultStyle;
export const characterArtEnabled=()=>art.reviewStyles.includes(style);
export function applyCharacterArt(hud,id){
 const record=art.characters[id]||art.characters.brave;
 if(!characterArtEnabled()){delete hud.dataset.artStyle;return;}
 hud.dataset.artStyle=style;
 const cols=art.skill_grid.columns,rows=art.skill_grid.rows;hud.style.setProperty('--atlas-size',`${cols*100}% ${rows*100}%`);
 hud.style.setProperty('--character-skill-atlas',`url("${new URL(record.skills[style].runtime,document.baseURI).href}")`);
 hud.style.setProperty('--character-art-accent',record.palette[1]);
 for(const button of hud.querySelectorAll('.act')){
  const key=button.dataset.action||(button.id==='btn-lock'?'lock':button.id==='btn-cycle-lock'?'cycle':'');
  if(key==='lock'||key==='cycle'){delete button.dataset.atlasSlot;continue;}
  const index=art.skill_grid.slots.indexOf(key);if(index<0)continue;
  button.dataset.atlasSlot=key;
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
export function characterTitle(text,characterId=document.getElementById('hud')?.dataset.character||'brave'){
 if(!characterArtEnabled())return null;
 const normalize=value=>String(value).replace(/[\s！!～~]/g,'');
 for(const [id,record] of Object.entries(art.characters)){
  if(id!==characterId)continue;
  const row=record.titles.labels.findIndex(labels=>labels.some(label=>normalize(label)===normalize(text)));
  if(row<0)continue;
  const col=Math.max(0,art.title_grid.columnsByLanguage.indexOf(lang));
  const el=document.createElement('span');el.className='word-art character-title-art';
  el.dataset.character=id;el.dataset.action=art.title_grid.rowsByAction[row];el.dataset.locale=lang;
  el.setAttribute('role','img');el.setAttribute('aria-label',record.titles.labels[row][col]);
  el.style.aspectRatio='1200 / 360';el.style.backgroundImage=`url("${record.titles.runtime}")`;
  el.style.backgroundSize='300% 400%';el.style.backgroundPosition=`${col*50}% ${row*100/3}%`;
  return el;
 }
 return null;
}
