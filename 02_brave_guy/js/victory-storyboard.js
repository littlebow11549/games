import { createPictureFilm } from './picture-film.js?v=20261120assets';
export const VICTORY_KEYS=['folaidiKing','qian','qianBiz','jiamangKing','lan','nightmare','midKing','hell','kabanKing','xinji','baguashe','lanMgr','ganqiaoFull','guan','incubus'];
export function createVictoryStoryboard(root){
 const film=createPictureFilm(root,'victory-storyboard');let kinds=[];
 return{
  prepare(keys){return film.prepare(keys.map(key=>`victory_${key}`));},
  start(keys){kinds=keys;film.start();root.dataset.pictureVictory='true';root.dataset.victoryBosses=keys.join(',');},
  stop(){film.stop();delete root.dataset.pictureVictory;delete root.dataset.victoryShot;delete root.dataset.victoryBosses;},
  render(time,reduced){const beat=Math.min(2,Math.floor(time/2)),local=time-beat*2;root.dataset.victoryShot=['charge','impact','finish'][beat];film.render(kinds.map(key=>({file:`victory_${key}`,row:beat})),time,{reduced,impact:beat===1?Math.max(0,1-local/.65):0,color:'#ffdf79'});}
 };
}
