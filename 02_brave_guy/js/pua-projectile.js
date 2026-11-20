import * as THREE from '../vendor/three/three.module.min.js';
import { lang } from './i18n.js?v=20261119dialogue';
const lines=[
 ['都是為你好','It’s for your own good.','全部君のためだよ'],
 ['你想太多了','You’re overthinking it.','考えすぎだよ'],
 ['你讓我很失望','You disappoint me.','がっかりさせないで'],
 ['都是你的錯','This is all your fault.','全部君のせいだ'],
 ['別人都可以','Everyone else can do it.','他の人はできるのに'],
 ['我沒關係','I’m fine. Whatever.','僕は別にいいけど']
];
export function puaLine(index){return lines[index%lines.length][lang==='en'?1:lang==='ja'?2:0];}
const textures=new Map();
function drawTexture(text){
 const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=384;
 const c=canvas.getContext('2d');c.scale(2,2);c.lineJoin='round';c.lineWidth=12;c.strokeStyle='#140b21';
 c.beginPath();c.moveTo(28,25);c.lineTo(710,15);c.lineTo(748,86);c.lineTo(713,145);c.lineTo(455,151);c.lineTo(411,180);c.lineTo(391,151);c.lineTo(35,157);c.lineTo(12,90);c.closePath();
 const fill=c.createLinearGradient(0,0,0,170);fill.addColorStop(0,'#fff4ff');fill.addColorStop(.5,'#dcb6ff');fill.addColorStop(1,'#a05bec');c.fillStyle=fill;c.fill();c.stroke();
 c.strokeStyle='#bcff57';c.lineWidth=5;c.beginPath();c.moveTo(37,35);c.lineTo(697,25);c.stroke();
 const family=lang==='ja'?'"BG JP","BG Black",sans-serif':'"BG Black",sans-serif';c.font=`900 64px ${family}`;const size=Math.min(64,64*665/Math.max(1,c.measureText(text).width));c.font=`900 ${size}px ${family}`;c.textAlign='center';c.textBaseline='middle';c.fillStyle='#29123d';c.fillText(text,384,87);
 const texture=new THREE.CanvasTexture(canvas);texture.userData.sharedPua=true;return texture;
}

// Share only immutable pixels. Every projectile retains its own material and transform.
// The final material owner releases the texture; no scene/menu lifetime cache remains.
export function createPuaProjectile(index=0){
 const text=puaLine(index),key=lang+':'+text;
 let entry=textures.get(key);
 if(!entry){entry={texture:drawTexture(text),refs:0};textures.set(key,entry);}
 entry.refs++;
 const material=new THREE.SpriteMaterial({map:entry.texture,depthWrite:false,toneMapped:false});
 const release=()=>{material.removeEventListener('dispose',release);if(--entry.refs===0){entry.texture.dispose();textures.delete(key);}};
 material.addEventListener('dispose',release);
 const sprite=new THREE.Sprite(material);sprite.name='nightmare-pua-projectile';sprite.scale.set(5.2,1.3,1);sprite.userData.text=text;return sprite;
}
export function disposeProjectileMaterial(material){
 if(!material.map?.userData.sharedPua)material.map?.dispose();
 material.dispose();
}
