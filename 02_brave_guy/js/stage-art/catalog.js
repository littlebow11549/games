export {STORY_DESIGN} from './story-stage-design.js';
export {makeStoryMaze} from './story-maze-engine.js';
export {makeSunnyMaze} from './sunny-maze.js';
export {paintCampusRadar} from './campus-radar.js';
export {applyStageGrade} from './stage-atmosphere.js';
const prepared=new Map(),pending=new Map();
export const preparedStageArt=id=>prepared.get(id);
export function prepareStageArt(id){
 if(prepared.has(id))return Promise.resolve(prepared.get(id));
 if(pending.has(id))return pending.get(id);
 const task=(async()=>{
  if(id==='1-1'){
   const [campus,fx]=await Promise.all([import('./campus-stage-3d.js?v=20261125perf1'),import('./hallway-fx.js')]);
   await campus.prepareCampus();
   return {...campus,...fx};
  }
  const [story,paint]=await Promise.all([import('./story-polish.js?v=20261127landmarks2'),import('./story-quality-paint.js?v=20261125perf1')]);
  await paint.prepareStoryPaint(id);
  return story;
 })().then(pack=>{prepared.set(id,pack);return pack;}).finally(()=>pending.delete(id));
 pending.set(id,task);
 return task;
}
