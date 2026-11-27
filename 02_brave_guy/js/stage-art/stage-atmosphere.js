// Original art direction for each room. Existing geometry and the maze are untouched.
const look=(warm,shadow,near,far,veil,origin,key,fill)=>Object.freeze({
 warm,shadow,depth:Object.freeze([near,far]),veil,origin,key,fill
});
export const CAMPAIGN_LOOK=Object.freeze({
 '1-0':look('#ffd6a2','#70536e',31,84,.14,'16% 1%',1.28,1.52),
 '1-1':look('#ffecaa','#466954',49,106,.13,'15% -4%',1.35,1.43),
 '1-2':look('#fff0ad','#477b86',35,95,.12,'69% -2%',1.47,1.42),
 '1-3':look('#ffcfa4','#59456d',30,82,.15,'22% 4%',1.40,1.41),
 '1-4':look('#ffc586','#483360',27,69,.18,'79% 3%',1.49,1.35),
 '2-1':look('#e9ffc7','#264c55',22,63,.22,'22% 9%',1.43,1.42),
 '2-2':look('#ffb66f','#392d59',24,67,.18,'67% 3%',1.52,1.34),
 '3-0':look('#ffc583','#2f365b',25,71,.18,'16% 3%',1.40,1.34),
 '3-1':look('#e2fffb','#466680',35,91,.11,'72% -1%',1.42,1.51),
 '3-2':look('#ffe2a2','#3e655c',31,83,.15,'76% 1%',1.31,1.51),
 '3-3':look('#dce4ff','#473657',29,79,.14,'28% 4%',1.46,1.39),
 '3-4':look('#bff4ff','#384965',30,86,.13,'70% 0%',1.46,1.45),
 '3-5':look('#ffbf95','#47354f',38,104,.19,'79% 1%',1.51,1.33),
 '3-6':look('#ffd574','#45324c',25,73,.19,'50% 0%',1.48,1.37),
 '3-7':look('#ffca92','#433455',27,76,.18,'48% -2%',1.43,1.43),
 '4-1':look('#e9a9ff','#30254d',23,67,.21,'70% 8%',1.52,1.37)
});
export function applyStageGrade(id,scene,sun){
 const canvas=document.getElementById('scene');
 let glaze=document.getElementById('stage-scene-glaze');
 if(!glaze){
  glaze=document.createElement('div');glaze.id='stage-scene-glaze';
  glaze.setAttribute('aria-hidden','true');canvas.after(glaze);
 }
 const p=CAMPAIGN_LOOK[id];
 if(!p){delete glaze.dataset.look;delete canvas.dataset.storyGrade;return;}
 canvas.dataset.storyGrade=glaze.dataset.look=id;
 glaze.style.setProperty('--scene-warm',p.warm);
 glaze.style.setProperty('--scene-shadow',p.shadow);
 glaze.style.setProperty('--scene-key-origin',p.origin);
 glaze.style.setProperty('--scene-veil',p.veil);
 if(scene.fog){[scene.fog.near,scene.fog.far]=p.depth;}
 sun.intensity=p.key;
 const fill=sun.parent?.children.find(o=>o.isHemisphereLight);
 if(fill){fill.intensity=p.fill;fill.groundColor.lerp(fill.groundColor.clone().set(p.shadow),.24);}
}
