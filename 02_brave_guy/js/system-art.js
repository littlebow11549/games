// Native atlas windows: sources remain unmodified and retain their alpha channel.
import { lang, t } from './i18n.js?v=20261115cinema';
const groups = {
 combat: ['心魔來襲','狂潮來襲','心魔召喚爪牙','沒有超能力的時候','完美閃避','超勇氣波！'],
 outcomes: ['勇氣超人！','夠了！！','突破','倒下','醒來','暫停'],
 labels: ['連擊','第','波','還行。','目標切換','鎖定解除'],
};
const clean = s => String(s).replace(/\s/g, '');
export function artSprite(group, index, label = '') {
 const el = document.createElement('span'); el.className = 'word-art';
 const locale = lang === 'zh-Hant' ? 'zh' : lang;
 // Labels in the Chinese sheet have taller first and second rows.
 const rows = group === 'labels' && locale === 'zh' ? [0,370,735,1024] : [0,341,683,1024];
 const row = Math.floor(index / 2), x = index % 2 * 768, y = rows[row], h = rows[row+1]-y;
 el.style.aspectRatio = `768 / ${h}`;
 el.style.backgroundImage = `url("assets/source/pic/titles/system_${group}_${locale}.png")`;
 el.style.backgroundSize = `200% ${1024/h*100}%`;
 el.style.backgroundPosition = `${x ? 100 : 0}% ${y/(1024-h)*100}%`;
 el.setAttribute('role','img'); el.setAttribute('aria-label', label || t(groups[group][index]));
 return el;
}
export function setSystemArt(el, text) {
 el.classList.remove('wave-art');
 const value = clean(text);
 for (const [group, keys] of Object.entries(groups)) {
  const index = keys.findIndex(k => clean(k) === value || clean(t(k)) === value);
  if(index >= 0) { el.replaceChildren(artSprite(group,index,t(text))); el.classList.add('has-word-art'); return; }
 }
 const wave = String(text).match(/^(?:第\s*(\d+)\s*波|WAVE\s*(\d+))$/i);
 if(wave) {
  const n = document.createElement('b'); n.className='art-number'; n.textContent=wave[1]||wave[2];
  el.replaceChildren(artSprite('labels',1),n); if(lang !== 'en') el.append(artSprite('labels',2));
  el.classList.add('has-word-art','wave-art'); return;
 }
 el.classList.remove('has-word-art','wave-art'); el.classList.add('system-lettering'); el.textContent=t(text);
}
let previous = -1;
export function updateCombo(value) {
 const el=document.getElementById('combo-n');
 if(previous === value) return;
 const old=previous; previous=value; el.textContent=value;
 for(const a of el.getAnimations()) a.cancel();
 if(value < 5 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
 const milestone = Math.floor(value/10)>Math.floor(old/10);
 el.animate([
 {transform:'translateY(9px) scale(.62) rotate(-8deg)',opacity:.35,filter:'brightness(2)'},
 {transform:`translateY(-7px) scale(${milestone?1.65:1.32}) rotate(3deg)`,opacity:1,offset:.4},
 {transform:'translateY(2px) scale(.94) rotate(-1deg)',offset:.75},
 {transform:'translateY(0) scale(1) rotate(0)',filter:'brightness(1)'}
 ],{duration:milestone?440:300,easing:'cubic-bezier(.2,.8,.3,1)'});
}
export function decorateSystemUI() {

 for(const el of document.querySelectorAll('#pause-menu h1, #combo [data-i18n]')) setSystemArt(el,el.dataset.i18n);
 for(const el of document.querySelectorAll('[aria-label]')) {
  if(el.id==='btn-cycle-lock'){el.setAttribute('aria-label',t('切換鎖定目標'));el.title=t('切換鎖定目標')+' · Y / Shift+Y';}
 }
}
let meterReset;
export function burstMeter() {
 const meter=document.getElementById('guilt');
 meter.classList.remove('meter-exploding');void meter.offsetWidth;meter.classList.add('meter-exploding');
 clearTimeout(meterReset);meterReset=setTimeout(()=>meter.classList.remove('meter-exploding'),700);
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const box=meter.getBoundingClientRect(), layer=document.createElement('div');layer.className='meter-shards';layer.style.left=`${box.x+box.width/2}px`;layer.style.top=`${box.y+box.height/2}px`;document.body.append(layer);
 for(let i=0;i<12;i++){const shard=document.createElement('i');const a=i*Math.PI/6;shard.style.setProperty('--sx',`${Math.cos(a)*(35+i%3*15)}px`);shard.style.setProperty('--sy',`${Math.sin(a)*(30+i%4*10)}px`);shard.style.setProperty('--sr',`${i*47}deg`);layer.append(shard);}
 layer.addEventListener('animationend',()=>layer.remove(),{once:true});
}
