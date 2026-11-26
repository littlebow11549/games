// Render-only routing for the three dragon forms. Combat and collision stay in main.js.
export const GANQIAO_MODELS = ['ganqiao','ganqiao_mid','ganqiaoFull'];
const BIPED = new Set(GANQIAO_MODELS.slice(0,2));
const BOSS_MOVES = {
  midKing: {summon:['skill1',.5],charge:['skill2',1.5],slam:['skill3',.95]},
  ganqiaoFull: {breath:['skill1',1.9],charge:['skill2',1.5],slam:['skill3',.95]},
};

export function ganqiaoStageModels(stage, bosses, fodder) {
  const kinds = new Set((stage.waves||[]).flatMap(wave=>Object.keys(wave)));
  if(fodder) kinds.add(fodder);
  for (const boss of bosses) {
    kinds.add(boss.minion);
    kinds.add(boss.vis==='midKing'?'ganqiao_mid':boss.vis);
  }
  return GANQIAO_MODELS.filter(kind=>kinds.has(kind));
}

export function ganqiaoAttackDuration(kind, windup) {
  // Claw contact is authored at 2/3 of the clip. Preserve the original .5s damage step.
  return BIPED.has(kind)?windup*1.5:windup/.6;
}

export function ganqiaoMove(enemy,key) {
  const clip=BOSS_MOVES[enemy.def.vis]?.[key];
  return clip&&enemy.visual.actions?.[clip[0]]?clip:null;
}
