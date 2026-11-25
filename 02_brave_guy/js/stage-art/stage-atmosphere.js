// Stage-local grade on the final WebGL canvas, never on HUD or input areas.
const NS='http://www.w3.org/2000/svg';
export const STAGE_ATMOSPHERE = Object.freeze({
 '1-1': Object.freeze({
  name:'校園暖陽',
  mood:'sunny-arcade',
  red: '0.014 0.165 0.349 0.535 0.717 0.891 1',
  green:'0.024 0.181 0.356 0.522 0.688 0.857 0.991',
  blue:'0.045 0.218 0.378 0.526 0.677 0.828 1',
 })
});
function svgNode(tag,attrs={}){
 const el=document.createElementNS(NS,tag);
 for(const [key,value] of Object.entries(attrs))el.setAttribute(key,value);
 return el;
}
function addGradeFilters(){
 const svg=svgNode('svg',{width:0,height:0,'aria-hidden':'true',focusable:'false'});
 svg.style.cssText='position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
 const defs=svgNode('defs');svg.append(defs);
 for(const value of Object.values(STAGE_ATMOSPHERE)){
  const f=svgNode('filter',{id:'stage-grade-'+value.mood,x:'0%',y:'0%',width:'100%',height:'100%','color-interpolation-filters':'sRGB'});
  const trace=svgNode('feComponentTransfer');
  for(const [name,table] of [['R',value.red],['G',value.green],['B',value.blue]])trace.append(svgNode('feFunc'+name,{type:'table',tableValues:table}));
  f.append(trace);defs.append(f);
 }
 document.body.append(svg);
}
export function applyStageGrade(id,theme){
 const canvas=document.getElementById('scene');
 let glaze=document.getElementById('stage-scene-glaze');
 if(!glaze){addGradeFilters();glaze=document.createElement('div');glaze.id='stage-scene-glaze';glaze.setAttribute('aria-hidden','true');canvas.after(glaze);}
 const preset=STAGE_ATMOSPHERE[id];
 if(preset)canvas.dataset.stageGrade=preset.mood;else delete canvas.dataset.stageGrade;
 if(theme){
   canvas.dataset.storyGrade=id;glaze.dataset.tinted='true';
   glaze.style.setProperty('--scene-warm',theme.warm);glaze.style.setProperty('--scene-shadow',theme.shadow);
 }else{delete canvas.dataset.storyGrade;delete glaze.dataset.tinted;}
}
