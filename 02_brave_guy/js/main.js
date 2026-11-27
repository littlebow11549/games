import {enableCameraZoom} from './stage-art/camera-zoom.js';
let stageArt=null;
const stageArtReady=import('./stage-art/catalog.js?v=20261127landmarks2').then(m=>stageArt=m).catch(e=>{console.warn('Stage art unavailable; keeping the original scene',e);});
import { applyCharacterArt, applyCharacterSpeech, characterSkillTitle } from './character-art.js?v=20261120nightdialogue';
import { createPuaProjectile, disposeProjectileMaterial } from './pua-projectile.js?v=20261120assets';
import { angelText } from './angel-language.js?v=20261120assets';
import { createNightmareBossSkills } from './nightmare-boss-skills.js?v=20261126incubus';
import { ROSTER, createRosterPicker, characterUnlocked, createUnlockNotice } from './playable-roster.js?v=20261120assets';
import { createGuestCombat } from './guest-combat.js?v=20261120angelstraight';
import { placeSpeech } from './speech-layout.js?v=20261120assets';
import { createSecretToggle } from './secret-toggle.js?v=20261120assets';
import { createProgressReset } from './progress-reset.js?v=20261120assets';
import { preloadImages, prepareGameplay, gameplayIsReady, waitForArtwork, preloadLanguage, warmCharacterTitles } from './loading.js?v=20261120nightcast';
// 勇氣超人 遊戲底層：關卡流程（14 關）、兩種型態、四條計量、拳頭與氣功、變身、守關者招式庫、三層死亡保險。
// 規格見 DESIGN.md；關卡與對白在 story.js，正式介面/過場素材由美術層接入。
import { RunRecords, formatTime, words } from './run-records.js?v=20261120assets';
import { disposeOwned } from './dispose-owned.js?v=20261120assets';
import * as THREE from '../vendor/three/three.module.min.js';
import { buildWorld, ARENA_RADIUS } from './world.js?v=20261120assets';
import { createVisual, loadModel } from './visuals.js?v=20261127kaban';
import { createActorShadows } from './actor-shadows.js?v=20261127managers';
import { GANQIAO_MODELS, ganqiaoStageModels, ganqiaoMove, ganqiaoAttackDuration } from './ganqiao-motion.js?v=20261126dragon';
import { folaidiNeeded, folaidiMove, folaidiSpawn } from './folaidi-motion.js?v=20261126folaidi';
import { jiasenModels, jiasenMove, jiasenAttackTime, buildJiamangPan } from './jiasen-motion.js?v=20261126jiasen';
import { Fx } from './fx.js?v=20261120angelstraight';
import { setSystemArt, updateCombo, decorateSystemUI, burstMeter } from './system-art.js?v=20261120nightdialogue';
import { createCinematics } from './cinematics.js?v=20261120nightcast';
import { createOpening } from './opening.js?v=20261120assets';
import { createMenuMotion } from './menu-motion.js?v=20261120castfix';
import { nextLockTarget, lockCandidates, isLockTarget, directionalLockTarget } from './targeting.js?v=20261120assets';
import { Input, lockViewport } from './input.js?v=20261120assets';
import { createTransformArt, TRANSFORM_SFX } from './transform-art.js?v=20261120castfix';
import { GameAudio } from './audio.js?v=20261120castfix';
import { STAGES, MAP_NAMES, FIRST_TRANSFORM, abilitiesFor } from './story.js?v=20261120assets';
import { t, tf, lang, nextLang, setLang, applyStatic } from './i18n.js?v=20261120assets';
import { makeMaze } from './maze.js?v=20261120assets';
import { drawMinimapSprite, minimapArtReady } from './minimap-art.js?v=20261120assets';

// ---------- 數值表（調手感改這裡；基準值出自 DESIGN.md 4.8） ----------

const HERO = { maxHp: 1000, radius: 0.5, critRate: 0.2, critMult: 2 };
const FORM = {
  student: { speed: 7, atk: 12, dodgeInvuln: 0.5, dodgeCd: 0.8, hurtMult: 1 },
  brave: { speed: 8.6, atk: 34, dodgeInvuln: 0.34, dodgeCd: 1.0, hurtMult: 0.7 },
};

const GAUGE = {
  courageMax: 100,
  courageHitStudent: 1.5, courageHitBrave: 0.5, courageKill: 1,
  courageExtendCap: 50,       // 一次變身最多靠命中補回 50 → 最長約 30 秒
  courageDodge: 5, couragePerfect: 15, courageHurt: -5,
  courageFarDelay: 4, courageFarDrain: 3, courageFarDist: 11,
  courageDrain: 5,            // 變身中每秒消耗 → 基本 20 秒
  lowHp: 0.3,                 // 血量低於三成，勇氣獲得加倍
  qiMax: 100, qiHit: 4, qiPerfect: 10, qiKill: 2,
  guiltBase: 100, guiltStep: 25, guiltCap: 200, guiltPerHpPct: 1.8,
  guiltHesitate: 0.6,         // 六成以上勇氣獲得減半
  burstTime: 12, burstHeal: 0.15, burstInvuln: 1.5, burstExtend: 6,
  clutchAt: 0.8, reviveHp: 0.3,
  transformMin: 1.0, transformMax: 3.0,
};

// dur 動作總長、hitAt 判定時間點、range/arc 範圍、mult 傷害倍率、lunge 前衝、kb 擊退、launch 打飛
const COMBO = {
  student: [
    { dur: 0.3, hitAt: 0.1, range: 2.0, arc: 1.8, mult: 1, lunge: 0.5, kb: 2, anim: 'attack1' },
    { dur: 0.34, hitAt: 0.12, range: 2.0, arc: 1.8, mult: 1.2, lunge: 0.5, kb: 3, anim: 'attack2' },
  ],
  brave: [
    { dur: 0.26, hitAt: 0.09, range: 3.2, arc: 2.6, mult: 1.0, lunge: 1.0, kb: 4, anim: 'attack1' },
    { dur: 0.26, hitAt: 0.09, range: 3.2, arc: 2.6, mult: 1.1, lunge: 1.0, kb: 4, anim: 'attack2' },
    { dur: 0.46, hitAt: 0.18, range: 3.8, arc: Math.PI * 2, mult: 2.0, lunge: 1.2, kb: 10, launch: 7, heavy: true, anim: 'attack3' },
  ],
};

COMBO.nightmare=COMBO.brave.map((c,i)=>({...c,mult:c.mult*1.3,range:c.range+.6,kb:c.kb*1.2,lunge:c.lunge*1.15}));
const heroCombo=()=>COMBO[hero.character==='nightmare'?'nightmare':hero.form==='brave'?'brave':'student'];

// 無雙感：範圍大、一次掃一片、把怪打飛
const SKILLS = {
  skill1: { name: '勇氣衝拳', cd: 3, dur: 0.34, dash: 15, width: 5.5, mult: 3.2, kb: 14, launch: 7, endRadius: 6.5 },
  skill2: { name: '氣功彈', cd: 4.5, dur: 0.4, radius: 2.8, speed: 24, life: 1.25, mult: 3.4, blast: 9, blastMult: 3 },
  skill3: { name: '氣功震地', cd: 7, dur: 0.6, radius: 11, mult: 3.6, kb: 6, launch: 12, stun: 1.8, ripple: 17, rippleMult: 1.6 },
  ult: { name: '超勇氣波', dur: 2.3, length: 40, width: 10, tick: 0.1, mult: 1.6, turn: 2.2, endMult: 6, endRadius: 11, novaMult: 14 },
};

const ENEMIES = {
  ganqiao: { name: '小幹譙', hp: 90, speed: 3.8, radius: 0.42, reach: 1.5, windup: 0.5, recover: 0.8, dmg: 45, height: 1.0 },
  ganqiao_mid: { name: '悶幹譙', hp: 240, speed: 4.6, radius: 0.6, reach: 1.9, windup: 0.5, recover: 0.7, dmg: 80, height: 1.7, enrage: true },
  folaidi: { name: '佛賴弟', hp: 130, speed: 2.4, radius: 0.5, reach: 13, windup: 0.7, recover: 2.2, dmg: 90, height: 1.9, ranged: true, bar: true },
  jiasen: { name: '假森', hp: 300, speed: 2.8, radius: 0.6, reach: 1.9, windup: 0.75, recover: 1.1, dmg: 110, height: 1.4, armored: true, bar: true },
  kaban: { name: '加班鬼', hp: 150, speed: 3.4, radius: 0.5, reach: 1.7, windup: 0.55, recover: 0.9, dmg: 65, height: 1.9 },
  jiamang: { name: '假忙森', hp: 280, speed: 2.4, radius: 0.6, reach: 12, windup: 0.8, recover: 2.6, dmg: 80, height: 1.4, ranged: true, pan: true, armored: true, bar: true },
};

// 守關者。moves 是會用的招式（定義在下方 MOVES），lines 是出招時喊的話
const BOSSES = {
  folaidiKing: { name: '佛賴弟王', vis: 'boss', hp: 4200, speed: 2.6, radius: 1.5, height: 4.6, moves: ['slam', 'charge', 'summon'], minion: 'ganqiao', lines: ['再五分鐘啦～', '明天的你會處理的～'] },
  qian: { name: '錢大姐', vis: 'qian_school', hp: 3600, speed: 3.6, radius: 0.7, height: 2.1, moves: ['fan', 'charge', 'summon'], minion: 'folaidi', minionN: 3, lines: ['過路費！', '這個場子我罩的！'] },
  qianBiz: { name: '錢經理', vis: 'qian', hp: 5200, speed: 3.8, radius: 0.7, height: 2.1, moves: ['fan', 'charge', 'summon'], minion: 'jiamang', minionN: 3, lines: ['先幫我墊一下嘛～', '這個業績，算你的喔～'] },
  jiamangKing: { name: '假忙森主管', vis: 'jiamang', hp: 5600, speed: 3.0, radius: 1.2, height: 3.4, moves: ['charge', 'summon', 'slam'], minion: 'jiamang', minionN: 4, lines: ['這不是我的業務範圍～', '鍋給你，接好。', '我有 cc 你啊。'] },
  lan: { name: '藍教頭', vis: 'lan_school', hp: 4600, speed: 3.0, radius: 0.9, height: 2.7, moves: ['whistle', 'spread', 'slam'], lines: ['立正！', '稍息！', '我沒說可以動！', '你要檢討你自己！'] },
  nightmare: { name: '惡夢超人', vis: 'nightmare', hp: 4800, speed: 4.2, radius: 0.6, height: 2.1, fear: true, moves: ['mDash', 'mKi', 'mQuake', 'guiltTalk'], lines: ['我這麼做都是為你好。', '好啊你打。打死我好了。', '我沒關係。你開心就好。', '全世界只有我是真的替你想。'] },
  midKing: { name: '特大隻的悶幹譙', vis: 'midKing', hp: 5200, speed: 3.6, radius: 1.5, height: 4.4, enrage: true, moves: ['charge', 'slam', 'summon'], minion: 'ganqiao_mid', minionN: 3, lines: ['……！', '……！！'] },
  hell: { name: '地獄超人', vis: 'hell', hp: 6400, speed: 4.6, radius: 0.7, height: 2.3, enrage: true, moves: ['mDash', 'mQuake', 'firePools', 'guiltTalk', 'mKi'], lines: ['都是你害我變這樣！', '你有考慮過我的感受嗎！', '你明明答應過我！', '廢物！'] },
  kabanKing: { name: '加班鬼王', vis: 'kabanKing', hp: 5200, speed: 2.8, radius: 1.5, height: 4.6, moves: ['slam', 'charge', 'summon'], minion: 'kaban', minionN: 5, lines: ['再五分鐘就好～', '把這個弄完～'] },
  xinji: { name: '新雞', vis: 'xinji', hp: 2600, speed: 5.0, radius: 0.5, height: 1.4, moves: ['copy', 'charge'], lines: ['前輩這招我學起來了～', '我只是做紀錄嘛～'] },
  baguashe: { name: '八卦蛇', vis: 'baguashe', hp: 2600, speed: 3.6, radius: 0.6, height: 1.5, moves: ['gossip', 'spread'], lines: ['私訊～私私～', '你聽說了嗎～', '這個不要說是我講的～'] },
  lanMgr: { name: '藍經理', vis: 'lanMgr', hp: 6200, speed: 3.0, radius: 0.9, height: 2.7, moves: ['meeting', 'spread', 'heal', 'whistle'], lines: ['我們先對齊一下！', '這個我們拉個會！', '太保守！', '太冒險！'] },
  ganqiaoFull: { name: '幹譙龍', vis: 'ganqiaoFull', hp: 7200, speed: 3.0, radius: 1.8, height: 4.8, moves: ['breath', 'slam', 'charge'], lines: ['抗壓性低！', '草莓族！', '不做有的是人做！'] },
  guan: { name: '冠老闆', vis: 'guan', hp: 7000, speed: 3.2, radius: 1.1, height: 3.4, moves: ['dive', 'pies', 'spread'], lines: ['責任制！', '這是你的成長機會！', '共體時艱！', '公司不會虧待你的！'] },
  incubus: { name: '夢魘超人', vis: 'incubus', hp: 8000, speed: 4.0, radius: 0.6, height: 2.2, fear: true, incubus: true, moves: ['mDash', 'mKi', 'mQuake', 'guiltTalk', 'firePools'], lines: ['何必呢。', '你這樣讓我很難做。', '我是對你有期待，才跟你講這些。', '你離開我，還有誰要你？'] },
};
for (const b of Object.values(BOSSES)) Object.assign(b, { boss: true, reach: 4.2, windup: 0.95, recover: 1.0, dmg: 200, ...b });
for(const id of ['nightmare','hell','incubus']){const b=BOSSES[id];b.hp*=1.15;b.speed*=1.12;b.recover=.75;b.skillRate=.75;b.moves=['nPunch','nDash','nDrones','nShout','nKing',...(id==='hell'?['firePools']:[]),'guiltTalk'];}
const BOSS_GROUPS = { duo: ['xinji', 'baguashe'] }; // 一關有兩隻守關者時
// 難度：怪的數量、同場上限、嘲諷頻率、俊熊出現的次數都跟著變。
// crowd／cap 是乘在畫質表上的倍率；地獄難度的怪會直接生在整張地圖上，幾乎鋪滿。
const DIFFS = [
  { id: 'easy', name: '輕鬆', crowd: 0.6, cap: 0.6, tauntGap: 1.4, bubbles: 2, hurt: 0.75, bearMax: 3, bearGap: [9, 14], spread: false, rescues: 2, rescueCap: 5, pulse: [12, 16] },
  { id: 'normal', name: '普通', crowd: 1, cap: 1, tauntGap: 1, bubbles: 3, hurt: 1, bearMax: 5, bearGap: [6, 10], spread: true, rescues: 2, rescueCap: 4, pulse: [9, 12] },
  { id: 'hell', name: '地獄', crowd: 2, cap: 2, tauntGap: 0.5, bubbles: 6, hurt: 1, bearMax: 9, bearGap: [3, 6], spread: true, rescues: 1, rescueCap: 3, pulse: [6, 8] },
];
const DIFF_KEY = 'braveguy.diff';
let diff = 1;
try { const d = localStorage.getItem(DIFF_KEY); if (d !== null && DIFFS[+d]) diff = +d; } catch { /* 讀不到就用普通 */ }
const D = () => DIFFS[diff];
function setDiff(i) { if(i!==diff)runs.invalidate();diff = i; game.rescues = Math.min(game.rescues || 0, D().rescueCap); try { localStorage.setItem(DIFF_KEY, String(i)); } catch { /* 存不了也沒關係 */ } }

// 負面狀態：每個守關者有自己的招牌狀態，每隔一陣子在主角腳下畫圈，圈爆開時還站在裡面就中。
// 變身中持續時間減半。效果寫在 updateDebuffs 與各處的 hasDebuff() 判斷。
const DEBUFFS = {
  sleepy: { name: '想睡', tip: '走不快', color: 0x8fb4ff, dur: 5 },
  extort: { name: '被勒索', tip: '勇氣一直掉', color: 0xf4c542, dur: 5 },
  mute: { name: '禁言', tip: '招式放不出來', color: 0x9aa3b5, dur: 4 },
  guilty: { name: '內疚', tip: '罪惡感一直漲', color: 0x8a4fd6, dur: 5 },
  weak: { name: '憋氣', tip: '拳頭變軟', color: 0x7c7f86, dur: 6 },
  burn: { name: '灼燒', tip: '持續扣血', color: 0xff6a1a, dur: 5 },
  tired: { name: '爆肝', tip: '不能閃避', color: 0x5c6b84, dur: 5 },
  confuse: { name: '謠言', tip: '左右顛倒', color: 0x5fe07a, dur: 4 },
  blind: { name: '畫大餅', tip: '看不到小地圖', color: 0xf2b21c, dur: 6 },
};
const BOSS_DEBUFF = { folaidiKing: ['sleepy'], qian: ['extort'], qianBiz: ['extort', 'tired'], jiamangKing: ['tired', 'confuse'], lan: ['mute'], nightmare: ['guilty'], midKing: ['weak'], hell: ['burn', 'guilty'],
  kabanKing: ['tired', 'sleepy'], xinji: ['mute'], baguashe: ['confuse'], lanMgr: ['weak', 'mute'], ganqiaoFull: ['burn', 'mute'], guan: ['blind', 'extort'], incubus: ['confuse', 'guilty', 'weak'] };

const MAX_ATTACKERS = 6;      // 同時出手的小怪上限，避免被圍毆到無法反應
const SAVE_KEY = 'braveguy.save.v1';

// 小天使的吐槽（節錄自 SCRIPT.md 附錄 A）
const ANGEL = {
  start: '左邊那根是搖桿。不是裝飾。',
  ready: '勇氣滿了。按變身，還是你要再想三年？',
  transform: '衣服換好了？上工。',
  // 變身結束時隨機挑一句，越嗆越好
  revert: ['魔法時間結束，灰姑娘。', '沒力了嗎，小娘炮。', '就這樣？我阿嬤變身都比你久。', '時間到。廢物模式，啟動。', '帥三十秒，遜一輩子。',
    '圍巾還我。你不配戴那麼久。', '喔，變回那個只會說「沒關係」的了。', '電池這麼小顆也敢叫超人。', '剛剛那個很帥的人去哪了？喔，是你。', '喘成這樣。你是變身還是跑馬拉松。'],
  burst: '喔，終於會生氣了。',
  clutch: '……這樣都沒倒。還行。',
  // 救援時隨機挑一句。救歸救，嘴不能輸
  revive: ['起來。我可沒說你可以躺。', '又倒？地板很好睡是不是。', '我是天使，不是你的復活點。', '救你比救一隻倉鼠還累。', '你欠我一條命。利息很高。',
    '丟臉死了。起來，當我沒看到。', '這次算我的。下次也算我的。煩死了。', '躺著也能輸，你也算是一種人才。', '喂，有人在看。至少倒得帥一點。'],
  reviveLast: '沒了。再倒我就真的下班。',
  noRescue: '額度用完了。你自己保重。',
  far: '你要退到哪？退到出生前嗎？',
  perfect: '喔。',
  guilt: '你又在怪自己了。被打的是你耶。',
  wave: '下一批。別擺姿勢。',
  noSkill: '那招要先變身。你現在只有小拳。',
  hurt3: '你是用臉在防禦嗎？',
  ult: '……還行。',
  locked: '那招你還沒學會（或者還沒想起來）。',
  scared: '哈。',
  caught: '喔，這次有長眼睛。',
  suanle: '你以前至少還會喊「夠了」。現在連爆都爆不起來。',
  walk: '不要回頭看我。往前走。',
  shield: '他只會擋。衝拳、氣功彈、震地，各破他一次。',
};

// ---------- 基礎建置 ----------

const $ = (id) => document.getElementById(id);

// 瀏覽器快取到舊版頁面、卻載到新版程式時，頁面上會少元素而整個卡住。偵測到就強制重新抓一次頁面。
if (!$('dialog') || !$('ov-stages') || !$('loadbar') || !$('btn-lock') || !$('pause-menu') || !document.querySelector('[data-lang-toggle]') || !$('minimap') || !$('ov-diff') || !$('menu-art')) {
  if (!location.search.includes('r=')) location.replace(`${location.pathname}?r=${Date.now()}`);
  throw new Error('頁面版本過舊，正在重新載入');
}

// ---------- 畫質分級（效能） ----------
// 手機預設中等；執行中若持續掉幀會自動往下調，並記住下次直接用較低的等級。
const QUALITY_KEY = 'braveguy.quality';
const QUALITY = [
  // crowd：每波總數的倍率；cap：同時在場的小怪上限（超過的排隊，有怪倒下就補上）
  { name: '低', ratio: 1, shadows: false, shadowSize: 512, crowd: 5, cap: 36 },
  { name: '中', ratio: 1.5, shadows: true, shadowSize: 1024, crowd: 9, cap: 64 },
  { name: '高', ratio: 2, shadows: true, shadowSize: 2048, crowd: 11, cap: 80 },
];
const coarse = matchMedia('(pointer: coarse)').matches;
const forced = new URLSearchParams(location.search).get('q');
let quality = forced !== null ? +forced : coarse ? 1 : 2;
try { const q = localStorage.getItem(QUALITY_KEY); if (forced === null && q !== null) quality = Math.min(quality, +q); } catch { /* 無法讀取就用預設 */ }
quality = Math.max(0, Math.min(2, quality | 0));
const Q = () => QUALITY[quality];

const progress = (value, text) => { if (window.__progress) window.__progress(value, t(text)); };
progress(62, '啟動 3D 繪圖');

const canvas = $('scene');
let glReason = '';
canvas.addEventListener('webglcontextcreationerror', (e) => { glReason = e.statusMessage || glReason; });

// 3D 繪圖（WebGL）啟動不了時，告訴玩家原因與解法，而不是丟一句看不懂的英文
function explainNoWebGL() {
  const probe = (type) => { try { return !!document.createElement('canvas').getContext(type); } catch { return false; } };
  const has2 = probe('webgl2'), has1 = probe('webgl');
  const why = has2 ? '這個分頁暫時拿不到 3D 繪圖資源（可能同時開了太多 3D 網頁，或顯示卡驅動剛出狀況）。'
    : has1 ? '這個瀏覽器只支援舊版的 3D 繪圖（WebGL 1），這款遊戲需要 WebGL 2。請更新瀏覽器或系統。'
      : '這個瀏覽器目前<b>沒有開啟 3D 繪圖（WebGL）</b>，所以遊戲畫面出不來。這不是網路問題。';
  const fix = has2 ? '請關掉其他分頁後按下面的「重新載入」，或把瀏覽器整個關掉再開。'
    : '<b>解法</b>：<br>・Chrome／Edge：設定 → 系統 → 開啟「使用硬體加速」→ 重新啟動瀏覽器<br>・Safari：設定 → 進階 → 確認沒有關閉 WebGL；或更新 macOS／iOS<br>・如果是在 App 內建的瀏覽器或遠端桌面裡開的，請改用一般的 Chrome 或 Safari<br>・也可以改用手機開';
  if (window.__fail) window.__fail(`<b>3D 繪圖啟動失敗</b><br>${why}<br>${fix}${glReason ? `<br><span style="opacity:.6">瀏覽器回報：${glReason}</span>` : ''}`);
}

// 依序用越來越保守的設定嘗試建立，全部失敗才放棄
function makeRenderer() {
  const tries = [
    { antialias: !coarse, powerPreference: 'high-performance' },
    { antialias: false, powerPreference: 'default' },
    { antialias: false, powerPreference: 'low-power', failIfMajorPerformanceCaveat: false, precision: 'mediump', stencil: false },
  ];
  for (const opts of tries) {
    try { return new THREE.WebGLRenderer({ canvas, ...opts }); } catch (err) { console.warn('[WebGL] 建立失敗，改用較保守的設定重試', opts, err); }
  }
  explainNoWebGL();
  throw new Error('WebGL unavailable');
}
// 手機螢幕像素密度高，關掉抗鋸齒差異不大但省很多
const renderer = makeRenderer();
progress(70, '建立場景');
renderer.setPixelRatio(Math.min(devicePixelRatio, Q().ratio));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = coarse ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const scene = new THREE.Scene();
const actorShadows=createActorShadows(THREE,scene);
const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 200);
const CAM_OFFSET = new THREE.Vector3(0, 13, 12.5);
let { sun } = buildWorld(scene, 'corridor', Q());
const fx = new Fx(scene);
lockViewport();
const input = new Input();
let audio = new GameAudio(null);
const cinematics = createCinematics(renderer, () => audio);
const menuMotion = createMenuMotion();
const opening = createOpening(() => audio);
progress(76, '讀取設定');

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setPixelRatio(Math.min(devicePixelRatio, Q().ratio));
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.fov = w < h ? 58 : 42; // 直式畫面拉寬視野
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();

// ---------- 狀態 ----------

const game = { phase: 'loading', time: 0, kills: 0, wave: -1, waveTimer: 0, hitstop: 0, shake: 0, paused: false, combo: 0, comboT: 0, fails: 0, easy: false,
  stage: 0, rules: {}, abilities: new Set(), bossSpawned: false, midDone: false, suanle: 0, ambushT: 8, caught: 0, queue: [], queueT: 0, bossFodderT: 0 };
let save = { cleared: [], seenTransform: false, seenOpening: false, rounds: 0, freshRun: false };
try { save = { ...save, ...JSON.parse(localStorage.getItem(SAVE_KEY) || '{}') }; } catch { /* 存檔壞掉就從頭 */ }
// 正式逐關解鎖；?unlock=all 僅供選關預覽，不贈送招式。
const DEV_UNLOCK = false;
const unlockParam = new URLSearchParams(location.search).get('unlock');
const unlockAll = unlockParam === 'all' || (DEV_UNLOCK && unlockParam !== 'off');
save.cleared=Array.isArray(save.cleared)?save.cleared.filter(id=>STAGES.some(s=>s.id===id)):[];
save.secretCharacters=Array.isArray(save.secretCharacters)?[...new Set(save.secretCharacters.filter(id=>['angel','nightmare'].includes(id)))]:[];
const runs = new RunRecords({getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value)});
const tr=(zh,en,ja)=>words(lang,zh,en,ja);
const writeSave = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch { /* 無法存檔時本次仍可玩 */ } };
const hero = { pos: new THREE.Vector3(), yaw: 0, vis: {}, visual: null, cds: {} };
const angel = { visual: null, pos: new THREE.Vector3(), sayT: 0, lastKey: '', quiet: 0 };
let enemies = [];
let shots = [];       // 飛行物（敵方彈、我方氣功彈）
let beam = null;      // 超勇氣波的光束網格
let hazards = [];     // 地面上的危險區與陷阱（火、會議、大餅）
let ambush = null;    // 俊熊的埋伏
let dialog = null;    // 進行中的對話
const tmp = new THREE.Vector3();
const camTarget = new THREE.Vector3();
let stageFocusHeight = 0.9;

const rand = (a, b) => a + Math.random() * (b - a);
const forward = (yaw, out = new THREE.Vector3()) => out.set(Math.sin(yaw), 0, Math.cos(yaw));
const dist2d = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const alive = (e) => e.state !== 'dead' && e.state !== 'spawn';
const stats = () => {const base=FORM[hero.form === 'brave' ? 'brave' : 'student'];return hero.guestBurstT>0?{...base,atk:base.atk*1.5,speed:base.speed*1.15,hurtMult:base.hurtMult*.8}:base;}; // 上班族沿用大學生的數值
const stage = () => STAGES[game.stage];
let hallArt = null;
let hallFx = null;
let maze = null; // 這一關的迷宮（教學關與黑影單挑沒有）
const navTmp = new THREE.Vector3();
function clampArena(p, margin = 0) {
  if (maze) maze.collide(p, Math.max(0.3, margin));
  const r = Math.hypot(p.x, p.z), max = ARENA_RADIUS - margin;
  if (r > max) { p.x *= max / r; p.z *= max / r; }
}
// 分段推進主角：高速位移（衝刺、閃避、擊退）一次跨太多格會「穿牆」——
// maze.collide 是靜態推出，單幀位移若大於牆厚就整個跳過去。切成每段 ≤0.35（小於牆半厚 0.4）
// 逐段推進並碰撞，確保每段都被牆擋下。
function moveHeroBy(dx, dz) {
  const dist = Math.hypot(dx, dz);
  const steps = Math.max(1, Math.ceil(dist / 0.35));
  const sx = dx / steps, sz = dz / steps;
  for (let i = 0; i < steps; i++) {
    hero.pos.x += sx; hero.pos.z += sz;
    clampArena(hero.pos, HERO.radius);
  }
}
// 每張地圖的迷宮長相：格數越多路越窄，open 越小越像迷宮
const MAZE_STYLE = { 1: { n: 7, open: 0.2, color: 0x5d4f9c, top: 0xc9bfff }, 2: { n: 8, open: 0.12, color: 0x24482f, top: 0x7fcf8a }, 3: { n: 8, open: 0.18, color: 0x77808f, top: 0xe9edf2 }, 4: { n: 7, open: 0.3, color: 0x2b2440, top: 0x9b6cff } };
function buildMaze(st) {
  if (maze) { maze.dispose(); maze = null; }
  if (!st.waves.length || st.rules.tutorial || st.id === '3-0') return;
  const style = MAZE_STYLE[st.map] || MAZE_STYLE[1];
  // 同一張地圖越後面的關卡格子越多；地獄難度再多一格
  const extra = (st.id.endsWith('-3') || st.id.endsWith('-4') || st.id.endsWith('-5') ? 1 : 0) + (D().id === 'hell' ? 1 : 0);
  maze = makeMaze({ radius: ARENA_RADIUS, ...style, n: style.n + extra, open: style.open + rand(-0.05, 0.05), clear: 7.5 });
  scene.add(maze.group);
}

// 開發期間（關卡全開）每一關都能用全部招式；正式流程才照劇情逐關取得
const ALL_ABILITIES=['transform','skill1','skill2','skill3','ult','hp','qi'];
// 天下無敵（godMode）即使從序章重玩也維持全招式開掛
const stageAbilities=index=>(godMode()||save.cleared.includes(STAGES.at(-1).id))?new Set(ALL_ABILITIES):abilitiesFor(index,save.cleared);
// 輪迴（New Game+）：每破關一輪強度升一階，最多 +3 階；超過三次＝天下無敵（開掛模式）
const roundTier = () => Math.min(save.rounds || 0, 3);          // 0,1,2,3
const roundCrowd = () => 1 + roundTier() * 0.5;                 // 怪量倍率 1 / 1.5 / 2 / 2.5
const roundRush = () => 1 + roundTier() * 0.3;                  // 守關者出招頻率倍率
const godMode = () => (save.rounds || 0) > 3;                   // 超過三次：天下無敵、勇氣超人開掛
const rosterPicker = createRosterPicker();
const unlockNotice = createUnlockNotice();
async function announceUnlocks(){
 if(unlockNotice.open)return;
 for(const id of [...(save.pendingCharacters||[])]){
   if(characterUnlocked(id,save.rounds,save.secretCharacters)){await unlockNotice.show(id);}
   save.pendingCharacters=(save.pendingCharacters||[]).filter(x=>x!==id);writeSave();
 }
}
const guest = () => hero.character === 'angel' || hero.character === 'nightmare';
const supportName = () => hero.character === 'angel' ? '主角' : hero.character === 'nightmare' ? '勇氣超人' : '小天使';
const guestCombat = createGuestCombat({scene,hero,enemies:()=>enemies,fx,audio:{sfx:name=>audio.sfx(name)},arena:ARENA_RADIUS,
  hit:(e,m,o)=>{const result=damageEnemy(e,m,o);tally([result],false,true);return result;},
  line:lineStrike,move:moveHeroBy,constrain:clampArena});
function supportSpeech(text, reply=null) {
  const b=$('angel-bubble');b.textContent=`${t(supportName())}：${t(text)}`;b.hidden=false;
  angel.sayT=2.5;angel.quiet=5;angel.rescueT=1.2;
  if(reply)hero.sayNext={text:reply,t:2.5};
}
function rescueSpeech(){
 const a=hero.character==='angel';
 const pairs=a?[
  ['以前都是妳拉我起來，這次換我。','少煽情，我只是鞋帶鬆了。'],
  ['接住了！妳還能站嗎？','能。你先別擋住我的射程。'],
  ['妳也可以說需要幫忙。','我剛剛不是喊救命了嗎？']
 ]:[['你也是我的一部分。我不會把你丟下。','……我可沒有求你。'],
 ['站起來，這次不用一個人忍。','我只是怕你失望。'],
 ['幫你不代表什麼都得聽你的。','我明明都是為你好……好啦。']];
 const n=hero.rescueLines||0;hero.rescueLines=n+1;
 const pair=n===0?pairs[0]:game.rescues===0?(a?['我還在，但暫時沒力氣拉妳起來了。','那就躲好，這次我罩你。']:['力量用完了，但我還會陪你。','……那就別走。']):game.rescues===1?(a?['最後一次援護了，我們一起撐過去。','知道啦。你也別逞強。']:['最後一次了。害怕也要看著前面。','你會陪著我，對吧？']):pairs[n%pairs.length];
 supportSpeech(...pair);
}
function applyCharacterHud(){
 const id=hero.character||'brave';$('hud').dataset.character=id;applyCharacterArt($('hud'),id);
 const gem=document.querySelector('.act.transform');gem.querySelector('.burst-emblem')?.remove();
 if(guest()){const emblem=document.createElement('b');emblem.className='burst-emblem';emblem.textContent=id==='angel'?'♡':'◆';emblem.setAttribute('aria-hidden','true');gem.append(emblem);}
 $('portrait').querySelector('.guest-face')?.remove();
 if(guest()){const face=document.createElement('span');face.className=`roster-face guest-face ${id}`;$('portrait').append(face);}
 for(const btn of ACT_BUTTONS){btn.querySelector('.guest-icon')?.remove();if(btn.dataset.action==='attack')btn.setAttribute('aria-label',id==='angel'?angelText('嘴砲攻擊'):t('攻擊'));const i=['skill1','skill2','skill3','ult'].indexOf(btn.dataset.action);
  if(guest()&&(i>=0||id==='angel'&&btn.dataset.action==='attack')){const el=document.createElement('span');el.className='guest-icon';el.setAttribute('aria-hidden','true');const tile=id==='angel'?(i<0?0:i+1):i+5;el.style.backgroundPosition=`${tile%3*50}% ${Math.floor(tile/3)*50}%`;btn.append(el);}
 }
}

const unlockRequirement = ability => STAGES.find(s=>(stage().map===3?s.map===3:s.map!==3)&&s.grant?.split('+').includes(ability));
const unlockHint = ability => {const required=unlockRequirement(ability);return required?tr(`通過 ${required.id} 解鎖`,`Clear ${required.id} to unlock`,`${required.id} クリアで解放`):t('未解鎖');};

// ---------- 背景音樂 ----------
// 場面原曲保留在 game.bgm；只有可操作戰場的勇氣超人形態覆蓋配樂。
function setBgm(name) { game.bgm = name; applyBgm(); }
function applyBgm() {
  if (!game.bgm) return;
  audio.playBgm(game.phase === 'playing' && hero.form === 'brave' && audio.tracks.bgm_brave && game.bgm !== 'bgm_transform' ? 'bgm_brave' : game.bgm);
}
const stageBgm = () => { const key = `bgm_stage_${stage().id.replace('-', '_')}`; return audio.tracks[key] ? key : 'bgm_battle'; };

function setForm(form) {
  const changed = hero.form !== form;
  hero.form = form;
  const visualKind = guest() ? hero.character : form;
  for (const [k, v] of Object.entries(hero.vis)) v.root.visible = k === visualKind;
  hero.visual = hero.vis[visualKind];
  // Dialog frames do not run the combat update: place the selected model immediately.
  hero.visual.root.position.copy(hero.pos);
  hero.visual.root.rotation.y = hero.yaw;
  hero.visual.glow(false);
  if (changed) applyBgm();
  hero.visual.play('idle');
}

function playBraveCue(type){
  const dur={hit:.23,transformArrival:.56,burst:.60}[type];
  if(type==='hit'&&hero.form==='worker'&&hero.character==='brave'&&hero.state==='free'&&hero.stunT<=0&&game.phase==='playing'&&hero.visual.actions?.hit)
    hero.visual.playReaction('hit',.23);
  if(dur&&hero.character==='brave'&&hero.visual===hero.vis.brave&&hero.state==='free'&&hero.stunT<=0&&game.phase==='playing')
    hero.visual.playReaction?.(type,dur);
}

let portraitHurtTimer;
function resetHero() {
  clearTimeout(portraitHurtTimer);
  $('portrait').classList.remove('hurt');
  $('hit-feedback').classList.remove('hit');
  if (!hero.vis.student) {
    for (const k of ['student', 'worker', 'brave', 'angel', 'nightmare']) { hero.vis[k] = createVisual(k === 'angel' ? 'angel_playable' : k); scene.add(hero.vis[k].root); }
    angel.vis={angel:createVisual('angel'),student:createVisual('student_spirit'),brave:createVisual('brave_spirit')};
    for(const v of Object.values(angel.vis))scene.add(v.root);
    angel.visual=angel.vis.angel;
  }
  hero.base = stage().form;
  angel.visual=hero.character==='angel'?angel.vis.student:hero.character==='nightmare'?angel.vis.brave:angel.vis.angel;
  for(const v of Object.values(angel.vis))v.root.visible=v===angel.visual;
  angel.sayT=0;angel.quiet=0;angel.rescueT=0;hero.rescueLines=0;hero.guestHurtAt=0;$('angel-bubble').hidden=true;
  hero.maxHp = HERO.maxHp + (game.abilities.has('hp') ? 200 : 0);
  Object.assign(hero, {
    hp: hero.maxHp, courage: 0, qi: 0, guilt: 0, guiltMax: GAUGE.guiltBase,
    state: 'free', actionLockTarget: null, t: 0, combo: -1, queued: false, comboGap: 0, hitDone: false, invuln: 0, cds: {}, yaw: 0, data: null,
    mode: null, burstT: 0, guestBurstT:0, extendLeft: 0, farT: 0, hurtStreak: 0, hurtStreakT: 0, usedClutch: false, usedRevive: false, debuff: {}, readySaid: false,
    kb: new THREE.Vector3(), stunT: 0, slowT: 0, silenceT: 0, movingT: 9, inMeeting: false,
  });
  // The arena and minimap share this origin; the maze clears the central area.
  hero.pos.set(0, 0, 0);
  clampArena(hero.pos, HERO.radius);
  // 天下無敵從進場就使用勇氣超人；不觸發變身動畫或範圍傷害。
  if (godMode() || guest()) {
    hero.mode = 'courage';
    hero.courage = GAUGE.courageMax;
    hero.extendLeft = GAUGE.courageExtendCap;
    setForm('brave');
  } else setForm(hero.base);
  supportTarget(angel.pos);
  // 地圖三前段小天使縮成巴掌大，找回變身後長回來
  angel.visual.root.scale.setScalar(guest()?1:stage().map === 3 && !game.abilities.has('transform') ? 0.35 : 1);
  applyCharacterHud();
}

function clearField() {
  hallFx?.clear();
  guestCombat.clear();nightmareBossSkills.clear();
  lockTargetEnemy = null;
  manualLockTarget = null;
  for (const e of enemies) { scene.remove(e.visual.root); e.visual.dispose(); if (e.bar) e.bar.remove();if(e.controlBadge)e.controlBadge.remove(); }
  for (const s of shots) disposeShot(s.mesh);
  for (const h of hazards) disposeOwned(h.mesh);
  if (ambush) { scene.remove(ambush.visual.root); ambush.visual.dispose(); ambush = null; }
  if (beam) { disposeOwned(beam); beam = null; }
  enemies = [];
  shots = [];
  hazards = [];
  fx.clear();
  $('world-ui').replaceChildren();
  $('skill-announcements').replaceChildren();
}

// 開始（或重來）指定的關卡
const junxiongModel = stage => stage.map===3 ? "junxiong_office" : "junxiong";
const OFFICE_BOSS_MODELS={qianBiz:'qian_manager',lanMgr:'lan_manager'};
const ARCHIVE_STAGE_BOSSES=new Set(['hell','guan']);
const deferredModelKinds=new Set(['student','worker','angel_playable','nightmare','qian_school','lan_school','folaidi','jiasen','jiamang','junxiong','junxiong_office','incubus','incubus_final',...BOSS_GROUPS.duo,...Object.values(OFFICE_BOSS_MODELS),'kaban','kabanKing',...ARCHIVE_STAGE_BOSSES,...GANQIAO_MODELS]);
const deferredModels=new Map(), deferredModelLoads=new Map();
function prepareStageModel(kind) {
  if (!deferredModels.has(kind)) return deferredModelLoads.get(kind);
  if (deferredModelLoads.has(kind)) return deferredModelLoads.get(kind);
  const cfg=deferredModels.get(kind);
  const task=loadModel(kind,cfg).then(ok=>{
    deferredModels.delete(kind);
    const slot=kind==='angel_playable'?'angel':kind;
    const previous=hero.vis[slot];
    if (!ok || !previous) return;
    const next=createVisual(kind);
    next.root.visible=false;
    scene.remove(previous.root);previous.dispose();
    hero.vis[slot]=next;scene.add(next.root);
  });
  deferredModelLoads.set(kind,task);
  return task;
}
function startStage(index, character=null) {
  if(((save.rounds||0)>=3||save.secretCharacters.length>0)&&character===null){
    if(rosterPicker.open)return;
    const wasPaused=game.paused;game.paused=true;audio.stopLoops();input.takeActions();input.held.clear();input.keys.clear();input.stick.x=input.stick.y=0;
    return rosterPicker.choose(hero.character||'brave',save.rounds,save.secretCharacters).then(id=>{game.paused=wasPaused;input.takeActions();input.held.clear();input.keys.clear();if(id)return startStage(index,id);if(game.phase==='over'&&$('overlay').hidden)showMenu();});
  }
  hero.character=ROSTER[character]&&characterUnlocked(character,save.rounds,save.secretCharacters)?character:'brave';
  const selectedCharacter=hero.character;
  const stageId=STAGES[index]?.id;
  if(!stageId)return;
  const needsArt=stageArt&&(stageId==='1-1'||stageArt.STORY_DESIGN[stageId]);
  const pack=needsArt?stageArt.preparedStageArt(stageId):null;
  const stageVisualKinds=selectedCharacter==='angel'?['angel_playable']:selectedCharacter==='nightmare'?['nightmare']:[STAGES[index].form];
  if (STAGES[index].boss==='nightmare'&&!stageVisualKinds.includes('nightmare')) stageVisualKinds.push('nightmare');
  const campusModel=STAGES[index].boss==='qian'?'qian_school':STAGES[index].boss==='lan'?'lan_school':null;
  if(campusModel)stageVisualKinds.push(campusModel);
  const st=STAGES[index];
  const bosses=(BOSS_GROUPS[st.boss]||(st.boss?[st.boss]:[])).map(key=>BOSSES[key]);
  stageVisualKinds.push(...ganqiaoStageModels(st,bosses,BOSS_FODDER_KIND[st.map]));
  if(folaidiNeeded(st,bosses))stageVisualKinds.push('folaidi');
  stageVisualKinds.push(...jiasenModels(st,bosses));
  if (st.rules?.junxiong) stageVisualKinds.push(junxiongModel(st));
  const officeBossModel=OFFICE_BOSS_MODELS[st.boss];
  if(officeBossModel)stageVisualKinds.push(officeBossModel);
  if(ARCHIVE_STAGE_BOSSES.has(st.boss))stageVisualKinds.push(st.boss);
  if (st.boss==='duo') stageVisualKinds.push(...BOSS_GROUPS.duo);
  if(st.waves.some(wave=>wave.kaban)||(st.boss&&BOSS_FODDER_KIND[st.map]==='kaban'))stageVisualKinds.push('kaban');
  if(st.boss==='kabanKing')stageVisualKinds.push('kabanKing');
  if (st.boss==='incubus') stageVisualKinds.push('incubus','incubus_final');
  const pendingModels=stageVisualKinds.filter(kind=>deferredModels.has(kind));
  if(!gameplayIsReady(selectedCharacter)||(needsArt&&!pack)||pendingModels.length){
    game.phase='loading-assets';$('overlay').hidden=true;
    waitForArtwork(()=>Promise.all([prepareGameplay(selectedCharacter),needsArt?stageArt.prepareStageArt(stageId):null,...pendingModels.map(prepareStageModel)]),()=>startStage(index,selectedCharacter));
    return;
  }
  audio.stopCelebration();input.takeActions();
  runs.start(index,diff);
  if(unlockAll||guest())runs.invalidate();
  pendingVictory = null;
  opening.cancel();
  audio.stopLoops();
  cinematics.cancel();
  transformArt.hide();
  game.stage = index;
  if(index===STAGES.length-1&&!guest())cinematics.prepareEnding().catch(()=>{});
  if(st.id==='3-0')audio.sfx('punch_clock');
  if(st.boss)cinematics.prepareBoss(BOSS_GROUPS[st.boss]||[st.boss]).catch(()=>{});
  hallArt?.dispose(); hallArt = null;
  hallFx?.dispose(); hallFx = null;
  ({ sun } = buildWorld(scene, st.theme, Q()));
  if(stageArt&&st.id==='1-1') {
    maze?.dispose(); maze=stageArt.makeSunnyMaze(THREE);scene.add(maze.group);
  } else if(stageArt?.STORY_DESIGN[st.id]) {
    maze?.dispose(); maze=stageArt.makeStoryMaze(THREE, pack.STORY_QUALITY[st.id].rows);scene.add(maze.group);
    hallArt=pack.dressStoryQuality(THREE,scene,stageArt.STORY_DESIGN[st.id],maze,sun,Q(),camera,hero);
  } else buildMaze(st);
  stageArt?.applyStageGrade(st.id,stageArt.STORY_DESIGN[st.id]);
  if (stageArt && st.id === '1-1' && maze) {
    hallArt = pack.dressCampus3D(THREE,scene,{world:sun.parent,maze,sun,camera,hero,quality:Q(),radius:ARENA_RADIUS});
    hallFx = pack.createHallwayFx(THREE,scene);
  }
  // 有小怪波次的關卡最後多一波「狂潮」：前面出過的怪全部再來一次，數量再多三成
  game.waves = st.waves.slice();
  if (st.waves.length && !st.rules.tutorial && st.id !== '3-0') {
    const rush = {};
    for (const w of st.waves) for (const [k, n] of Object.entries(w)) rush[k] = Math.max(rush[k] || 0, n);
    for (const k of Object.keys(rush)) rush[k] = Math.round(rush[k] * 1.3);
    game.waves.push(rush);
  }
  game.rules = st.rules || {};
  game.abilities = stageAbilities(index);
  if(guest())for(const ability of ['transform','skill1','skill2','skill3','ult'])game.abilities.add(ability);
  if (game.rules.tutorial) game.abilities.add('transform'); // 序章就是學變身的地方
  clearField();
  resetHero();
  Object.assign(game, { phase: 'playing', time: 0, kills: 0, wave: -1, waveTimer: 0.8, hitstop: 0, shake: 0, paused: false, combo: 0, comboT: 0,
    bossFightTime:0, bossSpawned: false, bossKinds: null, bossEncounterMaxHp: 0, midDone: false, suanle: 0, ambushT: rand(...D().bearGap), caught: 0, final: false, awakened: false, victoryShown: false, bossKoPlayed: false, counterT: 0, pressure: false, rescues: D().rescues, pulse: null, pulseT: rand(5, 8), queue: [], queueT: 0, bossFodderT: 3 });
  Object.assign(taunt, { t: 2.5, recent: [], last: null, begT: 0, backT: 3 });
  if (hero.sayEl) { hero.sayEl.remove(); hero.sayEl = null; }
  hero.sayNext = null;
  updateAngel(0);
  snapStageCamera();
  $('overlay').hidden = true;
  $('hud').hidden = false;
  $('boss-bar').hidden = true;
  $('btn-pause').classList.remove('on');
  $('quest-title').textContent = `${st.id}　${t(st.name)}`;
  $('quest-wave').textContent = t(st.sub);
  $('suanle').hidden = st.map !== 3;
  // 開場對話播對話曲，講完才進該關的戰鬥曲
  const talk = st.intro && st.intro.length && audio.tracks.bgm_talk;
  setBgm(talk ? 'bgm_talk' : stageBgm());
  const lines=guest()?[[ROSTER[hero.character].name,ROSTER[hero.character].intro],[supportName(),'這是你的夢境重演。照原本的關卡目標突破，我會在旁邊。']]:st.intro;
  runDialog(lines, () => { if (talk) setBgm(stageBgm()); if (index === 0&&!guest()) say('start', true); });
}
const startGame = () => startStage(game.stage);

// ---------- 對話 ----------

// 播放一段對話，播完呼叫 done。對話期間遊戲暫停。
const transformArt = createTransformArt($('tf-art'), id => { for (const sound of TRANSFORM_SFX[id] || []) audio.sfx(sound); });
function runDialog(lines, done, cls = '') {
  if (!lines || !lines.length) { if (done) done(); return; }
  dialog = { lines, i: 0, done, prev: game.phase };
  game.phase = 'dialog';
  applyBgm();
  $('dialog').className = `dialog ${cls}`;
  $('dialog').hidden = false;
  showLine();
}
function showLine() {
  const [who, text, art] = dialog.lines[dialog.i];
  const transformation = dialog.lines === FIRST_TRANSFORM;
  transformArt.show(transformation ? art : null,
    transformation ? dialog.lines[dialog.i + 1]?.[2] : null);
  $('dialog').classList.toggle('has-transform-art', transformation && Boolean(art));
  $('dlg-name').textContent = t(who);
  $('dlg-name').hidden = !who;
  $('dlg-text').textContent = t(text);
  $('dlg-bingo').hidden = !text.includes('賓果');
  $('dialog').classList.toggle('narration', !who);
  $('dialog').dataset.who = who === '小天使' ? 'angel' : who === '主角' ? 'hero' : who ? 'other' : '';
}
function advanceDialog(skip = false) {
  if (!dialog) return;
  dialog.i = skip ? dialog.lines.length : dialog.i + 1;
  if (dialog.i < dialog.lines.length) { showLine(); if(dialog.lines!==FIRST_TRANSFORM)audio.sfx('dialog_next'); return; }
  const d = dialog;
  dialog = null;
  $('dialog').hidden = true;
  transformArt.hide();
  game.phase = d.prev === 'dialog' ? 'playing' : d.prev;
  input.takeActions(); // 對話時按的鍵不要帶進戰鬥
  if (d.done) d.done();
  if (game.phase === 'playing') applyBgm();
}

// ---------- HUD ----------

function banner(text) {
  const b = $('banner');
  setSystemArt(b, text);
  b.classList.remove('show');
  void b.offsetWidth;
  b.classList.add('show');
}

function screenPos(world, yOffset = 0) {
  tmp.set(world.x, yOffset, world.z).project(camera);
  return { x: (tmp.x * 0.5 + 0.5) * innerWidth, y: (-tmp.y * 0.5 + 0.5) * innerHeight, visible: tmp.z < 1 };
}

function popup(world, height, text, cls = '') {
  const ui = $('world-ui');
  if (ui.childElementCount > 70) return; // 大量敵人時不要塞爆 DOM
  const p = screenPos(world, height);
  const el = document.createElement('div');
  el.className = `dmg ${cls}`;
  setSystemArt(el, text);
  el.style.left = `${p.x + rand(-14, 14)}px`;
  el.style.top = `${p.y + rand(-8, 8)}px`;
  const announcement=cls==='shout'&&el.classList.contains('has-word-art');
  (announcement?$('skill-announcements'):ui).append(el);
  el.addEventListener('animationend', () => el.remove());
}

function showSkillCastName(action, label, caster = hero, character = caster.character || 'brave', height = 2.8) {
  // A confirmed cast is neither dialogue nor a damage number: do not overwrite
  // speech or let the crowd's world-UI cap suppress the name.
  const layer = $('skill-announcements');
  const el = document.createElement('div');
  el.className = 'skill-cast-name';
  el.dataset.action = action;
  el.dataset.caster = caster === hero ? 'player' : 'boss';
  const title = characterSkillTitle(character, action);
  if (title) el.append(title);
  else { el.classList.add('system-lettering'); el.textContent = angelText(t(label)); }
  const p = screenPos(caster.pos, height);
  if (p.visible) {
    el.style.setProperty('--cast-x', `${p.x}px`);
    el.style.setProperty('--cast-y', `${p.y}px`);
  }
  layer.querySelector(`.skill-cast-name[data-caster="${el.dataset.caster}"]`)?.remove();
  layer.append(el);
  el.addEventListener('animationend', () => el.remove(), { once: true });
}

// Existing 4 × 2 atlas; one non-looping burst, removed on completion.
function showGuiltBurstArt() {
  if (!document.body.classList.contains('game-art')) return;
  const p = screenPos(hero.pos, 2.4);
  const el = document.createElement('div');
  el.className = 'guilt-burst-art';
  el.setAttribute('aria-hidden', 'true');
  el.style.left = `${p.x}px`; el.style.top = `${p.y}px`;
  $('world-ui').append(el);
  el.addEventListener('animationend', () => el.remove(), { once: true });
}

// 小天使講話。force 可插隊；一般吐槽之間至少隔幾秒，同一句不連講
function say(key, force = false) {
  if (!force && (angel.quiet > 0 || angel.lastKey === key)) return;
  angel.lastKey = key;
  angel.sayT = 2.8;
  angel.quiet = 5;
  const b = $('angel-bubble');
  const line = ANGEL[key];
  b.textContent = guest()?`${t(supportName())}：${t(key==='perfect'?'閃得漂亮，換你反擊！':key==='hurt3'?'別硬撐，我在這裡。':key==='guilt'?'不必把一切都怪在自己身上。':['shield','walk','locked'].includes(key)?t(Array.isArray(line)?line[0]:line||'一起突破這裡。'):key==='wave'?'下一批來了，我會替你留意後方。':key==='ult'?'把你的力量釋放出來吧！':'我在這裡。照自己的步調前進。')}`:t(Array.isArray(line) ? line[Math.floor(Math.random() * line.length)] : line);
  applyCharacterSpeech(b,guest()?'brave':'angel','support');
  b.hidden = false;
  audio.sfx('bubble');
}

const ACTION_PANEL = document.querySelector('.actions');
const ACT_BUTTONS = [...document.querySelectorAll('.act[data-action]')]; // 每幀都要用，先查好

function textIfChanged(id, value) { const el=$(id), text=String(value); if(el.textContent!==text)el.textContent=text; }
function attrIfChanged(el,name,value){if(el.getAttribute(name)!==String(value))el.setAttribute(name,value);}
function boolIfChanged(el,name,value){value=Boolean(value);if(el[name]!==value)el[name]=value;}
function updateHud() {
  const brave = hero.form === 'brave';
  ACTION_PANEL.classList.toggle('base-form', !brave);
  const transformStatus = $('transform-status');
  boolIfChanged(transformStatus,'hidden',brave || canTransform());
  if(!transformStatus.hidden){
    const message=game.final
      ? tr('閃避集滿勇氣，再走向董事長','Dodge to fill courage, then approach the chairman','回避で勇気を満たし、会長へ近づこう')
      : stage().id==='3-1'
      ? tr('先清完第一波，找回變身能力','Clear wave 1 to restore transformation','第1波を倒して変身能力を取り戻そう')
      : stage().id==='3-0'
      ? tr('變身暫時封印，下一關找回能力','Transformation sealed. Recover it next stage','変身は封印中。次のステージで取り戻そう')
      : tr('尚未解鎖變身，請先完成前面關卡','Transformation locked. Clear earlier stages first','変身は未解放。前のステージをクリアしよう');
    textIfChanged('transform-status', message);
  }

  $('hp-fill').style.transform = `scaleX(${Math.max(0, hero.hp / hero.maxHp)})`;
  textIfChanged('hp-text', `${Math.max(0, Math.ceil(hero.hp))} / ${hero.maxHp}`);
  if((godMode()||guest())&&!game.final&&hero.form==='brave'){hero.courage=GAUGE.courageMax;hero.mode='courage';}
  const courageShown = hero.mode === 'burst' ? hero.burstT / GAUGE.burstTime : hero.courage / GAUGE.courageMax;
  $('courage-fill').style.transform = `scaleX(${Math.max(0, Math.min(1, courageShown))})`;
  $('courage').classList.toggle('full', !brave && canTransform() && hero.courage >= GAUGE.courageMax);
  $('courage').classList.toggle('burst', hero.mode === 'burst');
  boolIfChanged($('courage'),'hidden',guest());
  const burstActive=guest()&&hero.guestBurstT>0;
  const resourceName=hero.character==='angel'?tr('包容心','Compassion','包容力'):hero.character==='nightmare'?tr('極限值','Limit','限界値'):t('罪惡感');
  const resourceLabel=$('guilt').querySelector('b');if(resourceLabel.hasAttribute('data-i18n'))resourceLabel.removeAttribute('data-i18n');const resourceText=burstActive?`${tr('爆氣','Burst','覚醒')} ${hero.guestBurstT.toFixed(1)}s`:resourceName;if(resourceLabel.textContent!==resourceText)resourceLabel.textContent=resourceText;
  attrIfChanged($('guilt'),'aria-label',resourceName);$('hud').classList.toggle('guest-burst',burstActive);
  const g = burstActive?hero.guestBurstT/8:hero.guilt / hero.guiltMax;
  if(game.phase==='playing'&&!game.paused){const old=hero.guiltSoundRatio||0;if(g>=.9&&old<.9)audio.sfx('guilt_crack');else if(g>old+.001)audio.sfx('guilt_tick');}
  hero.guiltSoundRatio=g;
  $('guilt-fill').style.transform = `scaleX(${Math.max(0, Math.min(1, g))})`;
  $('guilt').classList.toggle('crack', g >= 0.9);
  $('guilt').classList.toggle('full', g >= 1);
  $('hp-fill').parentElement.classList.toggle('full', hero.hp >= hero.maxHp);
  $('courage').style.setProperty('--charge', Math.max(0, Math.min(1, courageShown)));
  $('guilt').style.setProperty('--charge', Math.max(0, Math.min(1, g)));
  $('hp-fill').parentElement.style.setProperty('--charge', Math.max(0, Math.min(1, hero.hp/hero.maxHp)));
  $('guilt').classList.toggle('heavy', g >= GAUGE.guiltHesitate);
  $('portrait').classList.toggle('brave', brave);
  $('portrait').classList.toggle('worker', hero.form === 'worker');
  boolIfChanged($('btn-quick-clear'),'hidden',!secretToggle.enabled || game.phase !== 'playing' || game.paused || !!dialog || cinematics.active);
  const jumpToBoss = stage().boss && !game.bossSpawned;
  textIfChanged('btn-quick-clear', jumpToBoss
    ? (lang === 'ja' ? 'ボスへ' : lang === 'en' ? 'Jump to boss' : '跳到魔王')
    : stage().boss==='incubus'&&!game.awakened?tr('第二形態','Second form','第二形態')
    : (lang === 'ja' ? '即クリア' : lang === 'en' ? 'Clear stage' : '一鍵過關'));
  boolIfChanged($('btn-cycle-lock'),'disabled',game.phase !== 'playing' || game.paused || !!dialog);
  textIfChanged('quest-count', tf('擊倒 {0}', game.kills));
  textIfChanged('suanle-n', game.suanle);
  const hearts = '♥'.repeat(Math.max(0, game.rescues || 0)) || '—';
  textIfChanged('rescue-n', hearts);
  const rescueLabel=$('rescue').querySelector('span'),rescueText=tf('{0}救援',t(supportName()));if(rescueLabel.textContent!==rescueText)rescueLabel.textContent=rescueText;
  const miniHTML = `<b>${stage().id}</b><span>✊ ${game.kills}</span><i>${hearts}</i>`;
  if ($('quest-mini').innerHTML !== miniHTML) $('quest-mini').innerHTML = miniHTML; // 收合時只顯示這一行
  $('btn-lock').hidden = false;
  $('btn-cycle-lock').hidden = false;
  $('combo').hidden = game.combo < 5 || game.phase !== 'playing' || game.paused || Boolean(dialog);
  updateCombo(game.combo);

  for (const btn of ACT_BUTTONS) {
    const a = btn.dataset.action;
    const buttonHidden = a==='transform' ? (guest()?game.final||hero.guilt<hero.guiltMax||hero.guestBurstT>0:brave || !canTransform() || hero.courage < GAUGE.courageMax) : Boolean(SKILLS[a]) && !brave;
    boolIfChanged(btn,'hidden',buttonHidden);
    if(btn.hidden)input.held.delete(a);
    if(SKILLS[a]){const unlearned=!game.abilities.has(a);btn.classList.toggle('unlearned',unlearned);if(btn.getAttribute('aria-disabled')!==String(unlearned))btn.setAttribute('aria-disabled',String(unlearned));const hint=unlearned?unlockHint(a):(guest()?angelText(t(ROSTER[hero.character].skills[['skill1','skill2','skill3','ult'].indexOf(a)])):t(SKILLS[a].name));if(btn.title!==hint)btn.title=hint;attrIfChanged(btn,'aria-label',hint);}
    if (SKILLS[a] && a !== 'ult') {
      btn.style.setProperty('--cd', `${(hero.cds[a] || 0) / (guest()?ROSTER[hero.character].cd[['skill1','skill2','skill3'].indexOf(a)]:SKILLS[a].cd)}turn`);
      btn.classList.toggle('locked', !brave || !game.abilities.has(a) || hero.silenceT > 0);
    } else if (a === 'ult') {
      btn.style.setProperty('--qi', `${hero.qi / GAUGE.qiMax}turn`);
      btn.classList.toggle('locked', !brave || !game.abilities.has('ult'));
      btn.classList.toggle('ready', brave && game.abilities.has('ult') && hero.qi >= GAUGE.qiMax);
    } else if (a === 'transform') {
      const ready=guest()?!game.final&&hero.guilt>=hero.guiltMax&&!(hero.guestBurstT>0):!brave&&canTransform()&&hero.courage>=GAUGE.courageMax;
      btn.classList.toggle('ready',ready);btn.classList.toggle('locked',!ready);
      const burst = guest();
      const label = burst ? tr('爆氣','Burst','覚醒') : t('變身');
      attrIfChanged(btn,'aria-label',label);
      if (!burst) attrIfChanged(btn,'title',label);
      else if (btn.hasAttribute('title')) btn.removeAttribute('title');
    } else if (a === 'dodge') {
      btn.style.setProperty('--cd', `${(hero.cds.dodge || 0) / stats().dodgeCd}turn`);
    }
  }

  let bossHp = 0, bossMax = 0;
  const controlTop=$('boss-bar').hidden?12:$('boss-bar').getBoundingClientRect().bottom+12;
  for (const e of enemies) {
    updateControlBadge(e,controlTop);
    if (e.def.boss) { bossHp += Math.max(0, e.hp); bossMax += e.def.hp; continue; }
    if (!e.bar) continue;
    if(e.state==='dead'||e.state==='spawn'||!e.shown||!e.visual.root.visible){if(e.bar.style.display!=='none')e.bar.style.display='none';continue;}
    const p = screenPos(e.pos, e.def.height + 0.3 + e.y);
    const show = p.visible && e.hp > 0;
    e.bar.style.display = show ? '' : 'none';
    if (show) {
      e.bar.style.left = `${p.x}px`;
      e.bar.style.top = `${p.y}px`;
      e.bar.firstChild.style.transform = `scaleX(${Math.max(0, e.hp / e.maxHp)})`;
    }
  }
  const encounterMax = game.bossEncounterMaxHp || bossMax;
  if (encounterMax) $('boss-fill').style.transform = `scaleX(${Math.min(1,bossHp / encounterMax)})`;

  const b = $('angel-bubble');
  if (!b.hidden) {
    const p = screenPos(angel.pos, 2.9);
    placeSpeech(b, p);
  }
}

// ---------- 計量 ----------

function addCourage(x) {
  if (hero.mode === 'burst') return;
  if (hero.form === 'brave' && x > 0) {
    x = Math.min(x, hero.extendLeft); // 變身中靠命中延長的總量有上限
    hero.extendLeft -= x;
  }
  if (hero.form !== 'brave' && x > 0) {
    if (hero.inMeeting) return; // 站在「會議中」裡什麼都不會發生
    if (hero.hp < hero.maxHp * GAUGE.lowHp) x *= 2;
    if (hero.guilt >= hero.guiltMax * GAUGE.guiltHesitate) x *= 0.5;
    x *= game.rules.courageBoost || 1;
  }
  hero.courage = Math.max(0, Math.min(GAUGE.courageMax, hero.courage + x));
  if (hero.form !== 'brave' && canTransform() && hero.courage >= GAUGE.courageMax && !hero.readySaid) { hero.readySaid = true; say(game.final ? 'walk' : 'ready', true); audio.sfx('courage_full'); }
}
function addQi(x) { if (hero.form === 'brave' && hero.state !== 'ult' && !guestCombat.ultActive) {const old=hero.qi;hero.qi = Math.min(GAUGE.qiMax, hero.qi + x * (game.abilities.has('qi') ? 1.3 : 1));if(old<GAUGE.qiMax&&hero.qi>=GAUGE.qiMax)audio.sfx('qi_full');} } // 大招期間不回氣
// 終章最後一段與地圖三找回變身之前不能變身
const canTransform = () => game.abilities.has('transform') && !game.final;

function addRescues(count = 1) {
  const before = Math.min(game.rescues || 0, D().rescueCap);
  game.rescues = Math.min(D().rescueCap, before + count);
  return game.rescues - before;
}

function onHit(count, killed) {
  if (!count) return;
  const oldCombo=game.combo;
  game.combo += count;
  for(const milestone of [100,50,10])if(oldCombo<milestone&&game.combo>=milestone){audio.sfx('combo_'+milestone);break;}
  // Each threshold is awarded once per uninterrupted combo, including multi-hit jumps.
  if (oldCombo < 20 && game.combo >= 20) {
    hero.hp = Math.min(hero.maxHp, hero.hp + hero.maxHp * 0.05);
    popup(hero.pos, 3.2, tr('20 連擊：血量 +5%', '20 COMBO: HP +5%', '20 コンボ：HP +5%'), 'good');
  }
  if (oldCombo < 40 && game.combo >= 40) {
    hero.qi = Math.min(GAUGE.qiMax, hero.qi + 20);
    popup(hero.pos, 3.8, tr('40 連擊：氣量 +20', '40 COMBO: Qi +20', '40 コンボ：気 +20'), 'good');
  }
  const rescueAwards = Math.floor(game.combo / 50) - Math.floor(oldCombo / 50);
  if (rescueAwards > 0) {
    const gained = addRescues(rescueAwards);
    if(gained>0&&guest())supportSpeech(hero.character==='angel'?'勇氣回來了，我還能再接妳一次！':'看，你也能把勇氣找回來。',hero.character==='angel'?'還行。這句是說你，別得意。':'別說得好像我剛剛很丟臉。');
    if (gained > 0) popup(hero.pos, 4.4, tr(`連擊獎勵：${supportName()}救援 +${gained}`, `COMBO: Angel rescue +${gained}`, `コンボ：天使の救援 +${gained}`), 'good');
  }
  if(guest()&&!game.final&&!(hero.guestBurstT>0))hero.guilt=Math.min(hero.guiltMax,hero.guilt+count*1.5+killed*2);
  game.comboT = 2.2;
  if (hero.form === 'brave') { addCourage(GAUGE.courageHitBrave * count); addQi(GAUGE.qiHit * count + GAUGE.qiKill * killed); }
  else addCourage(GAUGE.courageHitStudent * count);
  addCourage(GAUGE.courageKill * killed);
}

// ---------- 變身 ----------

const TRANSFORM_RELEASE_RADIUS = 6;

function shockwaveVisual(center, radius, color) {
  fx.dome(center, radius, color, 0.55);
  fx.ring(center, 1, radius, 0xffffff, 0.45);
  fx.burst(center, color, 36, 13, 0.6, 0.32);
  game.shake = Math.max(game.shake, 0.7);
}

function shockwave(center, radius, mult, color, sound='quake') {
  shockwaveVisual(center, radius, color);
  audio.sfx(sound);
  areaStrike(center, radius, mult, { kb: 12, launch: 9, stun: 0.8, heavy: true });
}

function finishTransform() {
  const held = Math.min(GAUGE.transformMax, hero.t);
  const extra = (held - GAUGE.transformMin) / (GAUGE.transformMax - GAUGE.transformMin); // 0–1，拖越久越強
  setForm('brave');
  hero.mode = 'courage';
  hero.extendLeft = GAUGE.courageExtendCap;
  hero.state = 'free';
  hero.invuln = Math.max(hero.invuln, 0.4);
  hero.guilt *= 0.5;
  playBraveCue('transformArrival');
  shockwave(hero.pos, TRANSFORM_RELEASE_RADIUS + 5 * extra, 1.6 + 1.6 * extra, 0x9be564, 'transform_done');
  popup(hero.pos, 2.6, '勇氣超人！', 'shout');
  for (const e of enemies) if (e.sayEl) { e.sayEl.remove(); e.sayEl = null; } // 囂張的話收回去
  setTimeout(() => tauntFrom(TAUNTS_SCARED), 350);
  setTimeout(() => tauntFrom(TAUNTS_SCARED), 900);
  say('transform', true);
}

function startGuestBurst(){
  if(!guest()||game.final||hero.guilt<hero.guiltMax||hero.guestBurstT>0)return;
  hero.guilt=0;hero.guestBurstT=8;hero.state='free';hero.invuln=Math.max(hero.invuln,.6);
  const color=hero.character==='angel'?0xff9de0:0xb080ff;
  hero.visual.glow(true,color);
  shockwaveVisual(hero.pos, TRANSFORM_RELEASE_RADIUS, color);
  audio.sfx('guilt_burst');popup(hero.pos,2.8,tr('爆氣！','BURST!','覚醒！'),'good');
}

function guiltBurst() {
  if(guest()){hero.guilt=hero.guestBurstT>0?0:Math.min(hero.guilt,hero.guiltMax);return;} // Guests activate their full resource manually.
  burstMeter();
  if (!canTransform()) {
    audio.sfx('guilt_crack');
    // 悶爆：爆不起來，只說「……算了」
    hero.guilt = 0;
    hero.invuln = Math.max(hero.invuln, 0.8);
    fx.ring(hero.pos, 0.5, 4, 0x8a8f96, 0.4);
    areaStrike(hero.pos, 4, 0.1, { kb: 8 });
    popup(hero.pos, 2.6, '……算了。', 'guard');
    if (stage().map === 3) { game.suanle++; say('suanle'); }
    return;
  }
  hero.guilt = 0;
  showGuiltBurstArt();
  hero.guiltMax = Math.min(GAUGE.guiltCap, hero.guiltMax + GAUGE.guiltStep);
  hero.hp = Math.min(hero.maxHp, hero.hp + hero.maxHp * GAUGE.burstHeal);
  hero.invuln = Math.max(hero.invuln, GAUGE.burstInvuln);
  if (beam) endUlt();
  if (hero.form !== 'brave') {
    setForm('brave');
    hero.mode = 'burst';
    hero.burstT = GAUGE.burstTime;
  } else if (hero.mode === 'burst') {
    hero.burstT += GAUGE.burstExtend;
  } else {
    hero.courage = Math.min(GAUGE.courageMax, hero.courage + GAUGE.burstExtend * GAUGE.courageDrain); // 不受命中延長上限限制
  }
  hero.state = 'free';
  playBraveCue('burst');
  shockwave(hero.pos, 9, 3, 0xb06cff, 'guilt_burst');
  fx.pillar(hero.pos, 2, 14, 0xd9b0ff, 0.6);
  popup(hero.pos, 2.6, '夠了！！', 'shout');
  game.hitstop = 0.12;
  say('burst', true);
}

function revert(silent = false) {
  if (!silent) audio.sfx('revert');
  setForm(hero.base);
  hero.mode = null;
  hero.courage = 0;
  hero.qi *= 0.5;
  hero.readySaid = false;
  hero.state = 'free';
  fx.ring(hero.pos, 0.5, 2.5, 0xffffff, 0.3);
  if (!silent) say('revert', true);
  hero.sayNext = { text: pickLine(HERO_BACK_ANGEL), t: 1.1 }; // 主角小聲頂回去
}

// ---------- 怪物 ----------

// 小怪腳下的假陰影：全部共用同一份幾何與材質

// 小怪有大中小三種體型：小隻的跑得快但一碰就倒，大隻的血厚、打人痛、走得慢
const SIZES = [
  { w: 45, s: 0.78, hp: 0.6, dmg: 0.8, speed: 1.2 },
  { w: 40, s: 1, hp: 1, dmg: 1, speed: 1 },
  { w: 15, s: 1.4, hp: 2.2, dmg: 1.3, speed: 0.82 },
];
function pickSize() { let r = Math.random() * 100; for (const z of SIZES) { if ((r -= z.w) < 0) return z; } return SIZES[1]; }

function spawnEnemy(kind, at, delay = 0) {
  let def = ENEMIES[kind] || BOSSES[kind];
  let size = 1;
  if (!def.boss) {
    const z = pickSize();
    size = z.s;
    def = { ...def, hp: def.hp * z.hp, dmg: def.dmg * z.dmg, speed: def.speed * z.speed, radius: def.radius * z.s, height: def.height * z.s, reach: def.ranged ? def.reach : def.reach * (0.6 + 0.4 * z.s) };
  }
  const officeModel=OFFICE_BOSS_MODELS[kind];
  const visual = createVisual(def.vis || kind, !!def.boss,
    kind==='midKing'?{modelKind:'ganqiao_mid',height:def.height}:
    kind==='folaidiKing'?{modelKind:'folaidi',height:def.height,kingWake:true}:
    kind==='jiamangKing'?{height:def.height}:officeModel?{modelKind:officeModel,height:def.height}:ARCHIVE_STAGE_BOSSES.has(kind)?{height:def.height}:null); // 只有守關者投射即時陰影

  const pos = at ? at.clone() : new THREE.Vector3();
  if (!at) {
    const a = rand(0, Math.PI * 2);
    const r = D().spread ? Math.sqrt(rand(0.04, 1)) * (ARENA_RADIUS - 2) : rand(13, ARENA_RADIUS - 2); // 地獄難度：鋪滿整張地圖
    pos.set(Math.cos(a) * r, 0, Math.sin(a) * r);
    if (dist2d(pos, hero.pos) < (D().spread ? 5 : 8)) pos.multiplyScalar(-1); // 不要生在主角臉上
    if (def.boss) pos.set(rand(-3, 3), 0, -7);
    if(maze?.walkCells){
      if(def.boss) pos.set(maze.boss.x,0,maze.boss.z);
      else {
        const cells=maze.walkCells.filter(p=>{const d=dist2d(p,hero.pos);return d>4.9&&d<11.3;});
        if(cells.length){
          const k=enemies.length,c=cells[k%cells.length],twist=k*2.39996323;
          const spread=.52+(Math.floor(k/cells.length)%5)*.21;
          pos.set(c.x+Math.cos(twist)*spread,0,c.z+Math.sin(twist)*spread);
        }
      }
    }
  }
  if(maze?.nearestWalkable) pos.copy(maze.nearestWalkable(pos,def.radius));
  clampArena(pos, def.radius);
  visual.root.position.copy(pos);
  visual.root.visible = false;
  scene.add(visual.root);
  let bar = null;
  if (!def.boss) {
    bar = document.createElement('div');
    bar.className = 'ebar';
    bar.append(document.createElement('i'));
    bar.style.display = 'none';
    $('world-ui').append(bar);
  }
  let hpMult = game.rules.enemyHpMult || 1;
  if (game.rules.enemyHpMultWave0 && game.wave <= 0) hpMult = game.rules.enemyHpMultWave0;
  const maxHp = def.boss ? def.hp : Math.round(def.hp * hpMult);
  const e = { kind, def, visual, pos, y: 0, vy: 0, yaw: 0, hp: maxHp, maxHp, state: 'spawn', t: -delay, vel: new THREE.Vector3(), bar,
    cool: rand(0.6, 2.5), stun: 0, struck: false, shown: false, cds: {}, cast: null, haste: 0, fear: 0, fly: false, lineT: 0,
    shield: !!def.incubus, broken: new Set(), phase: 0, size };
  enemies.push(e);
  return e;
}

function nextWave() {
  audio.sfx('wave');
  game.wave++;
  const wave = game.waves[game.wave];
  const rush = game.waves.length > stage().waves.length && game.wave === game.waves.length - 1;
  banner(rush ? t('狂潮來襲') : tf('第 {0} 波', game.wave + 1));
  // 怪的總數是關卡表的 crowd 倍；同時在場有上限，其餘排隊陸續補進來（清不完的感覺，但不會卡）
  const list = [];
  for (const [kind, n] of Object.entries(wave)) for (let k = 0; k < Math.max(1, Math.round(n * Q().crowd * D().crowd * roundCrowd() * (game.rules.tutorial ? 0.5 : 1))); k++) list.push(kind);
  for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; }
  game.queue = list;
  game.queueT = 0;
}

// 打王時持續補一點小怪，讓玩家有東西打來集氣／集大招
const BOSS_FODDER_KIND = { 1: 'ganqiao', 2: 'ganqiao_mid', 3: 'kaban', 4: 'kaban' };
function feedBossFodder(dt) {
  if (!game.bossSpawned || game.phase !== 'playing') return;
  const boss = enemies.find((e) => e.def.boss && alive(e));
  if (!boss) return; // 王倒了就不再補，好讓關卡結算
  const base = Math.round(({ easy: 6, normal: 10, hell: 16 }[D().id] || 10) * roundCrowd());   // 同時在場的小怪數，遠少於一般波次，不會蓋過王
  const target = base + (game.desperate ? 8 : 0);                  // 危機時補更多，給割草回血的機會
  const fodder = enemies.filter((e) => !e.def.boss && e.state !== 'dead').length;
  game.bossFodderT -= dt;
  if (game.bossFodderT > 0 || fodder >= target) return;
  game.bossFodderT = rand(0.7, 1.4) * (game.desperate ? 0.4 : 1);
  const kind = boss.def.minion || BOSS_FODDER_KIND[stage().map] || 'ganqiao';
  spawnEnemy(kind);
}

// 一般波次的危機補兵（守關者戰由 feedBossFodder 處理）
function feedDesperation(dt) {
  if (!game.desperate || game.bossSpawned || game.phase !== 'playing') return;
  const mobs = enemies.filter((e) => !e.def.boss && e.state !== 'dead').length;
  game.despT = (game.despT || 0) - dt;
  if (game.despT > 0 || mobs >= 12) return;
  game.despT = rand(0.4, 0.8);
  spawnEnemy(BOSS_FODDER_KIND[stage().map] || 'ganqiao');
}

function feedQueue(dt) {
  if (!game.queue.length) return;
  game.queueT -= dt;
  if (game.queueT > 0) return;
  game.queueT = 0.04;
  // 無雙：只要畫面沒滿就一次補好幾隻，剛清掉一片馬上又塞滿
  const cap = Math.round(Q().cap * D().cap * roundCrowd());
  const onField = enemies.filter((e) => e.state !== 'dead' && !e.def.boss).length;
  let budget = Math.min(6, cap - onField, game.queue.length);
  while (budget-- > 0) spawnEnemy(game.queue.shift());
}

// 沿用各關原有配樂規則，讓登場對話／過場先播守關者原曲。
function bossBgm(entrance = false) {
  // 使用者指定：冠老闆登場沿用頂樓辦公室原曲，戰鬥配樂規則不變。
  if (entrance && stage().boss === 'guan' && audio.tracks.bgm_stage_3_5) return 'bgm_stage_3_5';
  const own = `bgm_stage_${stage().id.replace('-', '_')}`;
  const shadowFight = ['nightmare', 'hell', 'incubus'].includes(stage().boss);
  if (audio.tracks[own] && (!stage().waves.length || shadowFight)) return own;
  const specific = `bgm_boss_${stage().boss}`;
  return audio.tracks[specific] ? specific : 'bgm_boss';
}
function startBossIntro() {
  if (['nightmare', 'hell', 'incubus'].includes(stage().boss)) warmCharacterTitles('nightmare');
  if(guest())heroSay(hero.character==='angel'?'排場這麼大，是怕大家不知道你欠罵？':'你也要我忍一下？我已經忍夠了。',3);
  const names=(BOSS_GROUPS[stage().boss]||[stage().boss]).map(k=>BOSSES[k]?.name||k).join('、');
  const encounter=guest()?[[names,'這裡不是你該來的地方。'],[ROSTER[hero.character].name,hero.character==='angel'?'排場這麼大，是怕大家不知道你欠罵？':stage().boss==='nightmare'?'原來從外面看，我一直都是這個樣子……。':'你也要我忍一下？我已經忍夠了。'],[supportName(),hero.character==='angel'?'放心，我會接住妳。':'這次，你可以自己決定要不要忍。']]:stage().bossIntro;
  runDialog(encounter, spawnBoss);
  if (dialog) setBgm(bossBgm(true));
}
function spawnBoss() {
  const key = stage().boss;
  game.phase = 'cinematic';
  setBgm(bossBgm(true));
  cinematics.boss(BOSS_GROUPS[key] || [key], () => {
    input.takeActions(); game.phase = 'playing'; spawnBossActual();
  });
}
function spawnBossActual() {
  game.bossSpawned = true;
  const key = stage().boss;
  const kinds = BOSS_GROUPS[key] || [key];
  game.bossKinds = kinds; // 記下目前守關者，供切語系時重算名牌
  if (kinds.length>1) {
    const anchor=maze?.boss || {x:0,z:-7};
    game.bossEncounterMaxHp=kinds.reduce((hp,k,i)=> {
      const offset=(i-(kinds.length-1)/2)*2.8;
      return hp + spawnEnemy(k,new THREE.Vector3(anchor.x+offset,0,anchor.z)).maxHp;
    },0);
  }
  else spawnEnemy(kinds[0]);
  const names = kinds.map((k) => t(BOSSES[k].name)).join(t('＋'));
  banner('心魔來襲');
  audio.sfx('boss_appear'); // 守關者登場音效
  $('boss-bar').hidden = false;
  $('boss-name').textContent = names;
  $('quest-wave').textContent = tf('打倒{0}', names);
  setBgm(bossBgm());
  if (stage().boss === 'incubus') say('shield', true);
}

function endTransformIfDead() {
  // 變身中血量歸零：先解除變身並留 1 滴血，變身本身就是一層保護
  hero.hp = 1;
  hero.invuln = Math.max(hero.invuln, 1.2);
  if (beam) endUlt();
  revert();
}

function hurtHero(amount, opts = {}) {
  if (hero.invuln > 0 || hero.state === 'dead' || hero.state === 'transforming' || game.phase !== 'playing') return;
  const dmg = Math.round(amount * rand(0.9, 1.1) * stats().hurtMult * D().hurt);
  hero.hp -= dmg;
  hero.invuln = 0.4;
  hero.visual.flash();
  popup(hero.pos, 2.2, `-${dmg}`, 'hurt');
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  game.shake = Math.max(game.shake,reducedMotion?0:Math.min(.65,.35+dmg/hero.maxHp));
  game.hitstop=Math.max(game.hitstop,.065);
  if(dmg>0){
    clearTimeout(portraitHurtTimer);$('portrait').classList.add('hurt');
    portraitHurtTimer=setTimeout(()=>$('portrait').classList.remove('hurt'),700);
    const feedback=$('hit-feedback');feedback.classList.remove('hit');void feedback.offsetWidth;feedback.classList.add('hit');
  }
  audio.sfx('hurt');
  if(guest()&&game.time>=(hero.guestHurtAt||0)){hero.guestHurtAt=game.time+5;heroSay(hero.character==='angel'?'喂！翅膀很貴耶！':'你看，果然沒人在乎我。');}
  tauntFrom(TAUNTS_HIT, 0.6);
  game.combo = 0;
  if (hero.form !== 'brave') addCourage(GAUGE.courageHurt);
  if(!(guest()&&hero.guestBurstT>0))hero.guilt = Math.min(hero.guiltMax,hero.guilt+(dmg / hero.maxHp) * 100 * GAUGE.guiltPerHpPct + (opts.guilt || 0));
  if (game.final) hero.guilt = 0; // 終章最後一段不再累積罪惡感
  // 上班族被打會自動回話，取代學生時的「沒關係」
  if (hero.form === 'worker') popup(hero.pos, 2.9, ['好的。', '收到。', '沒問題。'][Math.floor(Math.random() * 3)], 'guard');
  hero.hurtStreak++; hero.hurtStreakT = 3;
  if (hero.hurtStreak >= 3) { say('hurt3'); hero.hurtStreak = 0; }
  else if (hero.guilt >= hero.guiltMax * GAUGE.guiltHesitate && hero.guilt < hero.guiltMax) say('guilt');

  if (hero.hp <= 0) {
    if (hero.form === 'brave'&&!guest()) { endTransformIfDead(); return; }
    if (!guest() && !hero.usedClutch && canTransform() && hero.guilt >= hero.guiltMax * GAUGE.clutchAt) {
      // 保險一：不甘心
      hero.usedClutch = true;
      hero.hp = 1;
      guiltBurst();
      say('clutch', true);
      return;
    }
    if (game.rescues > 0) {
      // 保險二：小天使救援。每關有幾次額度，抓到俊熊可以加
      game.rescues--;
      hero.hp = hero.maxHp * 0.45;
      hero.invuln = 2.5;
      hero.debuff = {};
      popup(hero.pos, 3.4, guest()?tf('{0}救援！剩 {1} 次',t(supportName()),game.rescues):tf('小天使救援！剩 {0} 次', game.rescues), 'good');
      fx.ring(hero.pos, 0.5, 7, guest()?0xcaff70:0xf48fc6, 0.5);
      fx.pillar(hero.pos, 1.2, 10, guest()?0xffed8a:0xffc4e3, 0.6);
      areaStrike(hero.pos, 6, 0.2, { kb: 14, launch: 4 });
      if(guest()){hero.state='free';hero.kb.set(0,0,0);hero.stunT=hero.slowT=hero.silenceT=0;rescueSpeech();}else say(game.rescues > 0 ? 'revive' : 'reviveLast', true);
      audio.sfx('revive');
      return;
    }
    hero.state = 'dead';
    hero.t = 0;
    hero.visual.play('die', 1.0);
    endGame(false);
    return;
  }
  if (hero.guilt >= hero.guiltMax) guiltBurst();
  else playBraveCue('hit');
}

// 回傳 { hit, killed, crit }
function damageEnemy(e, mult, o = {}) {
  if (!alive(e) || e.fly) return null;
  if (e.untouchable) return { killed: false, crit: false, damaged: false }; // 終章最後一段：打不到，但出手仍然算數
  if (e.castInvuln) { audio.sfx('guard'); return { killed: false, crit: false, damaged: false }; } // 放超惡夢波時無敵
  if (e.shield) {
    audio.sfx('guard');
    // 夢魘超人只會擋：要用三個小招各破一次
    if (['skill1', 'skill2', 'skill3'].includes(o.src) && !e.broken.has(o.src)) {
      e.broken.add(o.src); audio.sfx('mask_off');
      popup(e.pos, e.def.height + 0.6, tf('破防 {0}/3', e.broken.size), 'good');
      fx.ring(e.pos, 0.5, 4, 0x9be564, 0.4);
      if (e.broken.size >= 3) { e.shield = false; popup(e.pos, e.def.height + 1.2, '……有點痛。', 'shout'); game.shake = 0.6; }
    } else if (e.lineT <= 0) { e.lineT = 1.5; popup(e.pos, e.def.height + 0.4, '何必呢。', 'guard'); }
    return { killed: false, crit: false, damaged: false };
  }
  const crit = Math.random() < HERO.critRate;
  let dmg = stats().atk * mult * rand(0.9, 1.1) * (crit ? HERO.critMult : 1) * (hasDebuff('weak') ? 0.6 : 1);
  if (hero.character === 'angel' && e.def.boss) dmg *= 1.35; // Angel boss-only balance; keep all boss phase rules below.
  if(godMode())dmg/=2; // 天下無敵：承傷由1/3提高至1/2，相較上一版增加50%。
  if (e.def.boss && game.pressure) dmg *= 0.5; // 魔王二型態防禦力提升，更硬更難打
  const guarded = e.def.armored && e.y === 0 && e.stun <= 0 && (e.state === 'chase' || e.state === 'spawn');
  if (guarded) {dmg *= 0.35;audio.sfx('guard');} // 假森：平常打不動，出手後或被打飛時才打得痛
  dmg *= game.counterT>0?1.5:game.combo>=20?1.25:1;
  dmg = Math.round(dmg);
  if (e.def.incubus && !game.final) {
    // 套用反擊／連擊倍率後仍保留轉場門檻，避免重擊跳過最終收尾。
    const phaseFloor=game.awakened?Math.floor(e.maxHp*.1)+1:Math.ceil(e.maxHp*.6);
    dmg=Math.min(dmg,Math.max(0,e.hp-phaseFloor));
  }
  e.hp -= dmg;
  if (dmg > 0 && !guarded && game.time >= (e.nextHitSparkAt || 0)) {
    fx.hitSpark(e.pos, e.y + Math.max(.6, e.def.height * .65), crit || mult >= 1.8);
    e.nextHitSparkAt = game.time + .08;
  }
  e.visual.flash();
  popup(e.pos, e.def.height + e.y, guarded ? tf('擋 {0}', dmg) : `-${dmg}`, guarded ? 'guard' : crit ? 'crit' : '');
  const from = o.from || hero.pos;
  tmp.set(e.pos.x - from.x, 0, e.pos.z - from.z);
  if (tmp.lengthSq() < 0.01) tmp.set(rand(-1, 1), 0, rand(-1, 1));
  tmp.normalize();
  if (!e.def.boss) {
    e.vel.addScaledVector(tmp, o.kb || 0);
    if (o.launch && !guarded) {e.vy = Math.max(e.vy, o.launch);audio.sfx(e.def.armored?'mask_off':'enemy_fly');}
    if (o.stun) e.stun = Math.max(e.stun, o.stun);
  }
  const killed = e.hp <= 0;
  if (killed) {
    e.state = 'dead';
    updateLockMarker(0); // Release the killed target in the damage event, even during hitstop.
    if(!e.def.boss)audio.sfx('enemy_down');
    e.t = 0;
    e.visual.play('die', 0.8);
    if (e.bar) e.bar.remove();if(e.controlBadge)e.controlBadge.remove();
    game.kills++;
    if (!e.def.boss && TAUNTS_BEG[e.kind] && taunt.begT <= 0 && Math.random() < 0.3) { taunt.begT = 1.4; popup(e.pos, e.def.height + 0.6 + e.y, pickLine(TAUNTS_BEG[e.kind]), 'beg'); }
    if (!e.def.boss) { e.vel.addScaledVector(tmp, 6); e.vy = Math.max(e.vy, 6 + (o.launch || 0) * 0.5); // 被打倒的怪飛出去
      if (game.desperate) { hero.hp = Math.min(hero.maxHp, hero.hp + hero.maxHp * 0.045); fx.ring(e.pos, 0.3, 2.2, 0x7dff9a, 0.4); } } // 危機時割草回血
    else { fx.ring(e.pos, 1, 14, 0xffb347, 0.9); fx.burst(e.pos, 0xffb347, 50, 13, 2, 0.4); game.shake = 0.9; playBossKO(); }
  } else if (!e.def.boss && !guarded && e.state !== 'spawn') {
    e.state = 'stagger';
    e.t = 0;
    e.visual.play(e.stun > 0 ? 'stun' : 'hit', 0.25);
  }
  if(hero.character==='angel'&&o.src==='skill1'&&dmg>0&&!guarded)e.guestKnockT=.8;
  return { killed, crit, damaged: dmg > 0 && !guarded };
}

function tally(results, heavy, quiet) {
  const hits = results.filter(Boolean);
  if (!hits.length) return 0;
  const killed = hits.filter((r) => r.killed).length;
  const crit = hits.some((r) => r.crit);
  onHit(hits.length, killed);
  // 超勇氣波持續命中（quiet）不逐 tick 播拳擊音、也不每 tick 頓幀，避免吵雜與卡頓；聲音由 beam_loop 與節流的 beam_hit 擔當
  if (!quiet && hits.some(r => r.damaged)) {
    game.hitstop = Math.max(game.hitstop, heavy || crit ? 0.07 : 0.035);
    audio.sfx(heavy || crit ? 'crit' : 'hit');
  }
  game.shake = Math.max(game.shake, heavy ? 0.4 : 0.15);
  return hits.length;
}

// 扇形判定（arc 接近 2π 時等於圓形）
function arcStrike(center, yaw, range, arc, mult, o = {}) {
  const f = forward(yaw);
  const res = [];
  for (const e of enemies) {
    if (!alive(e)) continue;
    const dx = e.pos.x - center.x, dz = e.pos.z - center.z;
    const d = Math.hypot(dx, dz);
    if (d > range + e.def.radius) continue;
    if (arc < Math.PI * 1.9 && d > 0.6) {
      const ang = Math.acos(THREE.MathUtils.clamp((dx * f.x + dz * f.z) / d, -1, 1));
      if (ang > arc / 2 + Math.atan2(e.def.radius, d)) continue;
    }
    res.push(damageEnemy(e, mult, { from: center, ...o }));
  }
  return tally(res, o.heavy);
}
const areaStrike = (center, radius, mult, o = {}) => arcStrike(center, 0, radius, Math.PI * 2, mult, o);

// 直線判定：從 a 到 b、寬度 width 的帶狀範圍。skip 可排除已命中的怪
function lineStrike(a, b, width, mult, o = {}, skip = null) {
  const dx = b.x - a.x, dz = b.z - a.z;
  const len2 = dx * dx + dz * dz || 1;
  const res = [];
  for (const e of enemies) {
    if (!alive(e) || (skip && skip.has(e))) continue;
    const along=((e.pos.x-a.x)*dx+(e.pos.z-a.z)*dz)/len2;
    if(o.forwardOnly&&(along<0||along>1))continue;
    const t = THREE.MathUtils.clamp(along, 0, 1);
    const px = a.x + dx * t, pz = a.z + dz * t;
    if (Math.hypot(e.pos.x - px, e.pos.z - pz) > width / 2 + e.def.radius) continue;
    if (skip) skip.add(e);
    res.push(damageEnemy(e, mult, { from: a, ...o }));
  }
  return tally(res, o.heavy, o.quiet);
}

// ---------- 嘲諷 ----------
// 怪會輪流用賤賤的話嘲諷主角：一次只有一隻開口、每句之間有間隔、同一句短時間內不重複。
// 主角變身後，小怪的台詞會從囂張變成卑微。
const TAUNTS = {
  ganqiao: ['就這？', '打不到～打不到～', '你出拳像在趕蚊子', '回去睡啦', '我阿嬤閃得比你快', '欸他在喘耶', '手痠了齁', '這拳有吃飯嗎', '好了啦可以放棄了', '你期中考準備了嗎？', '再練十年啦', '廢物～', '你是不是在放水？喔沒有，這就是全力', '看他那個認真的臉，好好笑', '加油喔（敷衍）', '打這麼慢是在等誰', '你剛剛那下是在按摩嗎', '同學，動作不標準喔'],
  ganqiao_mid: ['你也只敢打我們', '回去又要一個人生悶氣了齁', '有種去跟本人講啊', '……（嘆氣，很大聲）', '這口氣你吞得下去的啦', '……（翻譯：遜）', '……！（翻譯：就這？）', '嗯？有人打我嗎', '吞下去啊，你不是很會吞', '……（鄙視的眼神）', '講啊，你不是有話要講', '又不敢講了齁', '悶著吧，習慣就好'],
  folaidi: ['再睡五分鐘啦～', '這麼拚幹嘛，明天再打', '你鬧鐘響了喔，按掉按掉', '打我？你醒了我就不見了，白打', '報告寫了沒？', '你眼袋好重喔', '躺著不是比較舒服嗎', '明天的你會感謝現在偷懶的你', '我在夢裡等你很久了', '欸你今天是不是又遲到', '這麼努力要給誰看'],
  jiasen: ['我很兇喔（抖）', '怕了吧！……怕了嗎？', '吼～～（小聲）', '面具很貴不要打臉', '不要看我裡面', '我、我可是恐怖片主角', '你小時候看到我會哭的', '我今天狀態不好而已', '有種你不要閃', '嚇到了吧（自己先嚇到）'],
  kaban: ['這個今天要喔', '你要下班？真好，我沒有', '加一下班啦，又不會死', '打卡了沒？', '老闆在看喔', '我也不想這樣，但我有房貸', '這個很急，那個也很急', '你走了誰來做', '年輕人肝很新鮮嘛', '假日可以聯絡你吧？', '辛苦了（沒有加班費）'],
  jiamang: ['我很忙不要吵', '這不是我的業務範圍', '當初是你提的', '我再確認一下（不會確認）', '鍋給你，接好', '已讀', '我手上三個案子耶', '這個要問你主管', '我有 cc 你啊', '你自己沒看信', '我只是轉達'],
};
// 主角變身後，小怪改講這些
const TAUNTS_SCARED = ['等一下等一下', '我只是路過', '大哥我錯了', '剛剛那句是牠講的不是我', '有話好說', '我有小孩（沒有）', '可以用講的嗎', '我今天其實請假', '不公平啦，換衣服犯規', '我要回家了', '欸欸欸他看這邊了', '剛剛是開玩笑的啦', '我其實很尊敬你'];
// 主角被打中時，附近的怪補一句
const TAUNTS_HIT = ['哈哈哈', '痛齁', '就說打不到嘛', '中了中了', '再來一下', '臉接得很準喔', '欸他是不是要哭了', '好可憐喔（笑）'];
// 小怪被打倒時偶爾講一句（取自腳本附錄 B）
const TAUNTS_BEG = {
  ganqiao: ['我只是嘴巴壞！', '你打人就有禮貌嗎！'],
  ganqiao_mid: ['我沒有生氣！！', '……！！'],
  folaidi: ['再讓我躺五分鐘～', '是你自己按掉鬧鐘的！'],
  jiasen: ['不要拿我面具！', '我裡面是棉花，不要打！'],
  kaban: ['我也想下班啦～', '你先走我才能走～'],
  jiamang: ['我很忙！我真的很忙！', '螢幕沒開是省電！'],
};
// 主角也會頂嘴。括號是心裡話
const HERO_BACK = ['（真想變成勇氣超人揍你……）', '你才廢物！', '吵死了！', '等我變身你就知道。', '我有在準備期中考啦！', '（忍住……先記起來。）', '一個一個來好不好！', '嘴巴這麼壞，你媽知道嗎。'];
const HERO_BACK_BRAVE = ['剛剛誰說我廢物？', '再講一次？', '現在知道怕了？', '排好隊，一個一個來。', '剛剛不是很會講嗎。'];
const HERO_BACK_ANGEL = ['（真想變成勇氣超人揍妳……）', '妳到底是哪一邊的！', '我聽得到好嗎。', '（忍住。她會飛，我追不到。）', '……等我集滿再跟妳算。', '妳行妳來啊！'];
const taunt = { t: 2.5, recent: [], last: null, begT: 0, backT: 3 };
function heroSay(text, dur = 1.8) {
  if (hero.sayEl) hero.sayEl.remove();
  const el = document.createElement('div');
  el.className = 'taunt hero';
  setSystemArt(el, text);
  if(!el.classList.contains('has-word-art'))applyCharacterSpeech(el,hero.character||'brave');
  $('world-ui').append(el);
  hero.sayEl = el; hero.sayT = dur;
}

function pickLine(pool) {
  // 先挑最近沒講過的；句子不夠用時，至少不跟畫面上正在講的重複
  const showing = enemies.filter((e) => e.sayEl).map((e) => e.sayRaw);
  let fresh = pool.filter((l) => !taunt.recent.includes(l) && !showing.includes(l));
  if (!fresh.length) fresh = pool.filter((l) => !showing.includes(l));
  if (!fresh.length) fresh = pool;
  const line = fresh[Math.floor(Math.random() * fresh.length)];
  taunt.recent.push(line);
  if (taunt.recent.length > 10) taunt.recent.shift(); // 最近講過的十句不重複
  return line;
}

function enemySay(e, text, dur = 2.0) {
  if (e.sayEl) e.sayEl.remove();
  const el = document.createElement('div');
  el.className = `taunt ${hero.form === 'brave' && !e.def.boss ? 'scared' : ''}`;
  setSystemArt(el, text);
  $('world-ui').append(el);
  e.sayEl = el;
  e.sayRaw = text;
  e.sayT = dur;
  taunt.last = e;
}

function onScreen(e) { const p = screenPos(e.pos, e.def.height); return p.visible && p.x > 60 && p.x < innerWidth - 60 && p.y > 70 && p.y < innerHeight - 40; }

function updateTaunts(dt) {
  let talking = 0;
  for (const e of enemies) {
    if (!e.sayEl) continue;
    e.sayT -= dt;
    const p = screenPos(e.pos, e.def.height + 0.9 + e.y);
    if (e.sayT <= 0 || e.state === 'dead' || !p.visible) { e.sayEl.remove(); e.sayEl = null; continue; }
    talking++;
    placeSpeech(e.sayEl, p);
  }
  if (hero.sayEl) {
    hero.sayT -= dt;
    const p = screenPos(hero.pos, 2.9);
    if (hero.sayT <= 0 || game.phase !== 'playing') { hero.sayEl.remove(); hero.sayEl = null; }
    else { placeSpeech(hero.sayEl, p); }
  }
  if (hero.sayNext && (hero.sayNext.t -= dt) <= 0) { heroSay(hero.sayNext.text); hero.sayNext = null; }
  taunt.backT -= dt;
  taunt.begT -= dt;
  taunt.t -= dt;
  if (taunt.t > 0 || talking >= D().bubbles || game.phase !== 'playing') return; // 同時開口的上限看難度
  taunt.t = rand(0.55, 1.1) * D().tauntGap;                                          // 每句之間的間隔
  const pool = enemies.filter((e) => alive(e) && e !== taunt.last && !e.sayEl && e.y === 0 && !e.def.boss && TAUNTS[e.kind] && dist2d(e.pos, hero.pos) < 18 && onScreen(e));
  if (!pool.length) return;
  const e = pool[Math.floor(Math.random() * pool.length)];
  enemySay(e, pickLine(hero.form === 'brave' ? TAUNTS_SCARED : TAUNTS[e.kind]));
  // 被嗆了幾句之後，主角偶爾回嘴
  if (taunt.backT <= 0 && !hero.sayEl && Math.random() < 0.3) {
    taunt.backT = rand(4, 7);
    const back = guest()?(hero.character==='angel'?pickLine(['嘴這麼忙，腳倒是跑快點啊。','你們一起上，省得我重複罵。','別誤會，我對你沒有期待。']):pickLine(['我已經很努力了，你還想怎樣？','這都是你逼我的。','忍一下，很快就過去了。'])):pickLine(hero.form === 'brave' ? HERO_BACK_BRAVE : HERO_BACK);
    hero.sayNext = { text: back, t: 0.6 };
  }
}

// 事件觸發的嘲諷：找一隻附近、沒在講話的怪來講
function tauntFrom(lines, chance = 1) {
  if (Math.random() > chance) return;
  const pool = enemies.filter((e) => alive(e) && !e.sayEl && !e.def.boss && e.y === 0 && dist2d(e.pos, hero.pos) < 12);
  if (pool.length) { enemySay(pool[Math.floor(Math.random() * pool.length)], pickLine(lines)); taunt.t = Math.max(taunt.t, 0.7); }
}

// 讓主角受到擊退、定身、緩速、封招
const knockHero = (from, power) => { tmp.set(hero.pos.x - from.x, 0, hero.pos.z - from.z).normalize(); hero.kb.addScaledVector(tmp, power); };
function stunHero(sec, text) {
  if (hero.form === 'brave' || hero.invuln > 0 || hero.state === 'transforming') return false;
  hero.stunT = sec;
  hero.state = 'free';
  if (text) popup(hero.pos, 2.8, text, 'hurt');
  return true;
}
const bossLine = (e, i) => popup(e.pos, e.def.height + 0.5, e.def.lines[i === undefined ? Math.floor(Math.random() * e.def.lines.length) : i % e.def.lines.length], 'shout');
function boomAt(pos, r) {
  audio.sfx('boss_slam');
  fx.ring(pos, 1, r, 0xff8a3d, 0.5);
  fx.burst(pos, 0xffb347, 26, 10, 0.4, 0.3);
  game.shake = Math.max(game.shake, 0.6);
}
function disposeShot(mesh){if(mesh.isSprite){disposeProjectileMaterial(mesh.material);mesh.removeFromParent();}else disposeOwned(mesh);}
function hostileShot(from, yaw, o = {}) {
  if(o.pan)audio.sfx('pan_fly');
  const r = o.radius || 0.3;
  const mesh = o.pan ? buildJiamangPan(THREE,r*.95) : o.pua !== undefined ? createPuaProjectile(o.pua) : new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), new THREE.MeshBasicMaterial({ color: o.color || 0xff5a4f }));
  mesh.position.set(from.x, 1.2, from.z);
  if(o.pan){mesh.rotation.x=.23;mesh.rotation.y=yaw;}
  scene.add(mesh);
  shots.push({ mesh, vel: forward(yaw).multiplyScalar(o.speed || 11), life: o.life || 2.4, radius: r + 0.3, dmg: o.dmg || 80, hostile: true, owner:o.owner, pan: o.pan, silence: o.silence });
}
function addHazard(type, pos, r, warn, life) {
  const color = { fire: 0x9b3bd6, meeting: 0x8a8f96, pie: 0xffd98a }[type];
  const mesh = new THREE.Mesh(new THREE.CircleGeometry(r, 32), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.25, depthWrite: false }));
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(pos.x, 0.06, pos.z);
  scene.add(mesh);
  hazards.push({ type, pos: pos.clone(), r, warn, life, t: 0, tick: 0, mesh });
}

// 守關者的招式庫。start 在出招瞬間呼叫；update 每幀呼叫，回傳 true 表示這招結束。
// range／minRange 是與主角距離的條件，cd 是這招的冷卻。
const nightmareBossSkills=createNightmareBossSkills({scene,hero,fx,arena:ARENA_RADIUS,hurt:n=>hurtHero(n),shot:hostileShot,say:(e,text)=>popup(e.pos,e.def.height+.5,text,'shout'),announce:(e,action)=>showSkillCastName(action,'',e,'nightmare',e.def.height+.9+(e.y||0)),clamp:pos=>clampArena(pos,1)});
const MOVES = {
 ...nightmareBossSkills.moves,
  slam: { range: 5, cd: 3,
    start(e) { e.aim = e.pos.clone(); e.visual.play(...(jiasenMove(e,'slam')||folaidiMove(e,'slam')||ganqiaoMove(e,'slam')||(e.visual.actions?.kabanSlam?['kabanSlam',.95]:null)||(e.def.vis==='lan_school'&&e.visual.actions?.skill3?['skill3',0.95/0.6]:['attack',0.95/0.6]))); fx.telegraph(e.aim, 5.5, 0.95); },
    update(e) { if (e.cast.t < 0.95) return false; boomAt(e.aim, 6.5); if (dist2d(hero.pos, e.aim) < 5.5 + HERO.radius) hurtHero(e.def.dmg); return true; } },
  charge: { minRange: 6, cd: 7,
    start(e, dx, dz, d) { e.chargeDir = new THREE.Vector3(dx / d, 0, dz / d); e.struck = false; e.visual.play(...(jiasenMove(e,'charge')||folaidiMove(e,'charge')||ganqiaoMove(e,'charge')||(e.visual.actions?.chargeRush?['chargeRush',1.5]:null)||(e.def.vis==='qian_school'&&e.visual.actions?.skill2?['skill2',.7]:['attack',.7]))); fx.ring(e.pos, 1, 4, 0xff3b30, 0.6); },
    update(e, dt, d) {
      const t = e.cast.t;
      if (t > 0.7 && t < 1.5) {
        e.pos.addScaledVector(e.chargeDir, 15 * dt);
        e.yaw = Math.atan2(e.chargeDir.x, e.chargeDir.z);
        if (!e.struck && d < e.def.radius + 1.2) { e.struck = true; hurtHero(150); knockHero(e.pos, 10); }
      }
      return t >= 1.5;
    } },
  summon: { cd: 16, cond: (e) => enemies.filter((x) => alive(x) && !x.def.boss).length < 4 && e.hp < e.maxHp * 0.8,
    start(e) { const pose=jiasenMove(e,'summon')||folaidiMove(e,'summon')||ganqiaoMove(e,'summon');if(pose)e.visual.play(...pose);else if(e.visual.actions?.kabanSummon)e.visual.play('kabanSummon',.52);else if(e.visual.actions?.officeSummon)e.visual.play('officeSummon',.52);else if(e.def.vis==='qian_school'&&e.visual.actions?.skill3)e.visual.play('skill3',.52); bossLine(e); banner('心魔召喚爪牙'); for (let i = 0; i < (e.def.minionN || 7); i++) spawnEnemy(e.def.minion, new THREE.Vector3(e.pos.x + rand(-5, 5), 0, e.pos.z + rand(-5, 5)), i * 0.06); },
    update: (e) => e.cast.t > 0.5 },
  fan: { range: 7, cd: 3.5,   // 錢大姐的紙扇：把人扇回場邊
    start(e) { e.visual.play(e.visual.actions?.officeFan?'officeFan':e.def.vis==='qian_school'&&e.visual.actions?.skill1?'skill1':'attack', 1); fx.telegraph(e.pos, 7, 0.6, 0xf4c542); bossLine(e); },
    update(e, dt, d) {
      if (e.cast.t < 0.6) return false;
      audio.sfx('fan');
      fx.slash(e.pos, e.yaw, 7.5, 2.4, 0xffffff, 1, 1.2);
      if (d < 7.5 && hero.invuln <= 0) { hurtHero(70); knockHero(e.pos, 22); }
      return true;
    } },
  whistle: { cd: 6,           // 藍教頭吹哨：站著不動就是罰站
    start(e) { if(e.visual.actions?.officeWhistle)e.visual.play('officeWhistle',1);else if(e.def.vis==='lan_school'&&e.visual.actions?.skill1)e.visual.play('skill1',1); bossLine(e); fx.telegraph(e.pos, 10, 1.0, 0x3a6fd0); audio.sfx('whistle'); },
    update(e, dt, d) {
      if (e.cast.t < 1.0) return false;
      fx.ring(e.pos, 1, 10, 0x9fd4ff, 0.4);
      if (d < 10 && hero.movingT > 0.2 && stunHero(1.3, '罰站！')) hurtHero(90);
      return true;
    } },
  spread: { minRange: 4, cd: 5,
    start(e) { bossLine(e); e.visual.play(e.visual.actions?.spreadCast?'spreadCast':e.def.vis==='lan_school'&&e.visual.actions?.skill2?'skill2':'attack', e.visual.actions?.spreadCast?.getClip().duration ?? 0.5 / 0.6); },
    update(e) { if (e.cast.t < 0.5) return false; for (let i = -2; i <= 2; i++) hostileShot(e.pos, e.yaw + i * 0.25, { dmg: 80, speed: 12, color: 0xf2efe0 }); audio.sfx('shoot'); return true; } },
  mDash: { minRange: 4, cd: 4, // 鏡像的勇氣衝拳
    start(e, dx, dz, d) { e.chargeDir = new THREE.Vector3(dx / d, 0, dz / d); e.struck = false; e.visual.play(...(e.def.incubus&&e.visual.actions?.finalDash?['finalDash',.95]:e.visual.actions?.hellRush?['hellRush',.95]:['skill1',.9])); fx.trail(e.pos, e.pos.clone().addScaledVector(e.chargeDir, 11), 3, 0xb06cff, 0.55); },
    update(e, dt, d) {
      const t = e.cast.t;
      if (t > 0.5 && t < 0.72) {
        e.pos.addScaledVector(e.chargeDir, (11 / 0.22) * dt);
        if (!e.struck && d < 2.2) { e.struck = true; hurtHero(140); knockHero(e.pos, 8); }
      }
      return t >= 0.95;
    } },
  mKi: { minRange: 5, cd: 5,   // 鏡像的氣功彈
    start(e) { e.visual.play(e.visual.actions?.hellKi?'hellKi':'skill2', 0.7); },
    update(e) { if (e.cast.t < 0.5) return false; hostileShot(e.pos, e.yaw, { dmg: 150, speed: 13, radius: 1.3, color: 0xb06cff, life: 2.6 }); audio.sfx('shoot'); return true; } },
  mQuake: { range: 6.5, cd: 6, // 鏡像的氣功震地
    start(e) { e.aim = e.pos.clone(); e.visual.play(...(e.def.incubus&&e.visual.actions?.finalQuake?['finalQuake',.85]:e.visual.actions?.hellQuake?['hellQuake',.9]:['skill3',.9])); fx.telegraph(e.aim, 7, 0.8, 0xb06cff); },
    update(e) { if (e.cast.t < 0.8) return false; boomAt(e.aim, 8); fx.dome(e.aim, 7, 0xb06cff, 0.5); if (dist2d(hero.pos, e.aim) < 7.5) hurtHero(180); return true; } },
  guiltTalk: { cd: 5,          // 情勒：不扣血，但罪惡感會漲
    start(e) { if(e.visual.actions?.hellTaunt)e.visual.play('hellTaunt',.7);else if(e.def.incubus&&e.visual.actions?.talk)e.visual.play('talk',.7); bossLine(e); if (hero.state !== 'transforming' && !game.final && !(guest()&&hero.guestBurstT>0)) { hero.guilt += 8; if (hero.guilt >= hero.guiltMax) guiltBurst(); } },
    update: (e) => e.cast.t > 0.7 },
  firePools: { cd: 9,          // 寫著難聽話的黑火
    start(e) { if(e.visual.actions?.hellFire)e.visual.play('hellFire',.51); bossLine(e); for (let i = 0; i < 5; i++) { const a = rand(0, 6.28), r = i === 0 ? 0 : rand(2, 7); addHazard('fire', tmp.set(hero.pos.x + Math.cos(a) * r, 0, hero.pos.z + Math.sin(a) * r), 2.4, 0.9, 5); } },
    update: (e) => e.cast.t > 0.5 },
  heal: { cd: 16, cond: (e) => e.hp < e.maxHp * 0.6, // 「會後再討論」：沒被打斷就回血
    start(e) { popup(e.pos, e.def.height + 0.5, '這個我們會後再討論！', 'shout'); e.cast.hp0 = e.hp; if(e.visual.actions?.officeHeal)e.visual.play('officeHeal',2.2); fx.telegraph(e.pos, 3, 2.2, 0x5fe07a); },
    update(e) {
      if (e.cast.hp0 - e.hp > e.maxHp * 0.03) { popup(e.pos, e.def.height + 0.5, '（被打斷了）', 'good'); e.stun = 1.2; return true; }
      if (e.cast.t < 2.2) return false;
      e.hp = Math.min(e.maxHp, e.hp + e.maxHp * 0.12);
      popup(e.pos, e.def.height + 0.5, '回血', 'good');
      return true;
    } },
  meeting: { cd: 9,            // 「會議中」：站在裡面什麼都不會發生，只有勇氣一直掉
    start(e) { if(e.visual.actions?.officeMeeting)e.visual.play('officeMeeting',.52); bossLine(e, hazards.length % 2); addHazard('meeting', hero.pos, 6, 0.8, 7); },
    update: (e) => e.cast.t > 0.5 },
  breath: { range: 13, cd: 5,  // 幹譙龍用噴的
    start(e) { bossLine(e); e.cast.n = 0; e.cast.yaw0 = e.yaw; e.visual.play(...(ganqiaoMove(e,'breath')||['attack',1.9])); },
    update(e) {
      const t = e.cast.t;
      while (e.cast.n < 12 && t >= 0.5 + e.cast.n * 0.1) {
        hostileShot(e.pos, e.cast.yaw0 - 0.6 + e.cast.n * 0.11, { dmg: 70, speed: 13, radius: 0.5, color: 0x9cc7f0, silence: 2 });
        e.cast.n++;
      }
      return t >= 1.9;
    } },
  dive: { cd: 8,               // 冠老闆飛起來打不到，俯衝落地後才有空檔
    start(e) { if(e.visual.actions?.guanDive)e.visual.play('guanDive',2.2); bossLine(e); e.fly = true; e.aim = null; },
    update(e, dt) {
      const t = e.cast.t;
      if (t < 1.6) {
        e.y = Math.min(9, e.y + 14 * dt);
        tmp.set(hero.pos.x - e.pos.x, 0, hero.pos.z - e.pos.z);
        if (tmp.length() > 0.5) e.pos.addScaledVector(tmp.normalize(), 9 * dt);
        return false;
      }
      if (!e.aim) { e.aim = hero.pos.clone(); fx.telegraph(e.aim, 4.4, 0.6); }
      e.pos.lerp(e.aim, Math.min(1, 6 * dt));
      e.y = Math.max(0, 9 * (1 - (t - 1.6) / 0.6));
      if (t < 2.2) return false;
      e.y = 0; e.fly = false;
      boomAt(e.aim, 5.5);
      if (dist2d(hero.pos, e.aim) < 4.8) hurtHero(200);
      e.stun = 2.2; // 落地後的空檔
      return true;
    } },
  pies: { cd: 10,              // 畫大餅：看起來像補血道具
    start(e) { if(e.visual.actions?.guanPies)e.visual.play('guanPies',.41); bossLine(e, 3); for (let i = 0; i < 3; i++) { const a = rand(0, 6.28); addHazard('pie', tmp.set(hero.pos.x + Math.cos(a) * rand(3, 7), 0, hero.pos.z + Math.sin(a) * rand(3, 7)), 1.2, 0, 9); } },
    update: (e) => e.cast.t > 0.4 },
  copy: { minRange: 4, cd: 4.5, // 新雞模仿主角的氣功彈
    start(e) { bossLine(e, 0); e.visual.play(e.visual.actions?.copyCast?'copyCast':'attack', 0.8); },
    update(e) { if (e.cast.t < 0.5) return false; hostileShot(e.pos, e.yaw, { dmg: 90, speed: 14, radius: 0.9, color: 0x9be564 }); audio.sfx('shoot'); return true; } },
  gossip: { cd: 8,             // 八卦蛇咬耳朵：其他敵人加速
    start(e) { audio.sfx('notify');bossLine(e); fx.ring(e.pos, 1, 12, 0xff9a3c, 0.6); for (const x of enemies) if (x !== e && alive(x)) x.haste = 5; e.visual.play(e.visual.actions?.gossipCast?'gossipCast':'attack', 0.6); },
    update: (e) => e.cast.t > 0.6 },
  // 超惡夢波：魔王二型態的大招。蓄力後放出三道擴張的惡夢衝擊波；施放全程無敵，玩家要靠走位閃到場邊。
  nightmareWave: { cd: 8,
    start(e) { bossLine(e); e.castInvuln = true; e.cast.wv = 0; audio.sfx('beam_start'); popup(e.pos, e.def.height + 0.9, '超惡夢波！', 'shout'); fx.telegraph(e.pos, 3.5, 2.2, 0x8a4fd6); e.visual.play(...(e.def.incubus&&e.visual.actions?.wave?['wave',2]:['attack',1.4])); game.shake = 0.4; },
    update(e) {
      const t = e.cast.t;
      if (t > 0.9 && e.cast.wv < 3 && t > 0.9 + e.cast.wv * 0.33) {
        const r = 7 + e.cast.wv * 4.5;
        fx.ring(e.pos, 1, r, 0x8a4fd6, 0.7); fx.dome(e.pos, r * 0.7, 0xb06cff, 0.4);
        if (dist2d(hero.pos, e.pos) < r && hero.invuln <= 0 && hero.state !== 'transforming') { hurtHero(210); hero.invuln = Math.max(hero.invuln, 0.45); }
        audio.sfx('beam_hit');
        e.cast.wv++;
      }
      if (t >= 2.0) { e.castInvuln = false; audio.sfx('beam_end'); game.shake = 0.7; fx.burst(e.pos, 0x8a4fd6, 40, 16, 1.5, 0.4); return true; }
      return false;
    } },
};

// 守關者決定下一招。回傳 true 表示開始出招
function bossThink(e, d, dx, dz) {
  if (e.cool > 0 || hero.state === 'dead') return false;
  let pool = e.def.moves;
  if (e.shield) pool = ['guiltTalk'];                 // 夢魘第一段只會擋和講話
  else if (e.untouchable) pool = hero.courage >= GAUGE.courageMax ? [] : ['mDash', 'mQuake']; // 最後一段給玩家閃的機會
  else if (game.pressure) { // 二型態：追加超惡夢波大招；boss 快死時提高觸發機率
    pool = [...pool, 'nightmareWave'];
    if (e.hp <= e.maxHp * 0.25) pool.push('nightmareWave', 'nightmareWave');
  }
  const options = pool.filter((m) => {
    const M = MOVES[m];
    return (e.cds[m] || 0) <= 0 && (M.range === undefined || d <= M.range) && (M.minRange === undefined || d >= M.minRange) && (!M.cond || M.cond(e));
  });
  if (!options.length) return false;
  const name = options[Math.floor(Math.random() * options.length)];
  e.cds[name] = MOVES[name].cd * (e.def.skillRate||1) * (e.untouchable ? 1.6 : 1);
  e.state = 'cast';
  e.cast = { name, t: 0 };
  audio.sfx('boss_warn');
  MOVES[name].start(e, dx, dz, d);
  return true;
}

// 終章最後一段：把主角打回平常型態，兩種變身都封住；他不再能被打，只能靠閃避撐到勇氣滿，然後走上前
function swapIncubusArmor(e) {
  const old=e.visual;
  if(old.kind==='incubus_final')return;
  const next=createVisual('incubus',true,{modelKind:'incubus_final'});
  if(next.kind!=='incubus_final'){next.dispose();return;}
  next.root.position.copy(old.root.position);
  next.root.quaternion.copy(old.root.quaternion);
  next.root.scale.copy(old.root.scale);
  next.root.visible=old.root.visible;
  scene.add(next.root);
  scene.remove(old.root);
  old.dispose();
  e.visual=next;
  e.guestTint=null;
  next.playReaction('spawn',.72);
}
function startAwakening(e) {
  guestCombat.clear();nightmareBossSkills.clear();
  game.awakened=true;game.phase='cinematic';setBgm(bossBgm());audio.stopLoops();input.takeActions();
  if(beam)endUlt();e.cast=null;e.castInvuln=false;e.state='chase';e.t=0;e.cool=2.5;
  e.shown=true;e.visual.root.visible=true;
  hazards.forEach(h=>h.life=0);$('hud').hidden=true;
  // 第一階段打完：先播勇氣超人一拳打倒董事長的過場（新圖），再接原本的甦醒鎧甲過場
  cinematics.firstStrike(()=>cinematics.awakening(()=>{game.phase='playing';$('hud').hidden=false;e.visual.root.scale.setScalar(e.size*1.2);swapIncubusArmor(e);hero.invuln=2;input.takeActions();setBgm(stageBgm());}));
}
function startFinalPhase(e) {
  guestCombat.clear();nightmareBossSkills.clear();
  game.final = true;hero.guestBurstT=0;hero.visual.glow(false);
  e.untouchable = true;
  e.cast = null; e.castInvuln = false; e.state = 'chase'; e.cool = 2.5;
  if (beam) endUlt();
  if (hero.form === 'brave') revert(guest());
  if(guest()){hero.sayNext=null;heroSay(hero.character==='angel'?'不用魔法也能往前走。看好了。':'這一次，我不會再叫自己忍下去。',3);}
  hero.courage = 0; hero.guilt = 0; hero.readySaid = false;
  hazards.forEach((h) => { h.life = 0; });
  banner('沒有超能力的時候');
  popup(e.pos, e.def.height + 0.6, '這次沒有這個。', 'shout');
  fx.ring(e.pos, 1, 16, 0x2e8b2e, 0.8);
  game.shake = 0.7;
}

function updateControlBadge(e,bottom=12){
 const kind=e.guestHold>0?(e.guestStatus||'stun'):e.guestKnockT>0?'knock':e.guestPullT>0?'pull':e.def.boss&&e.guestControlCooldown>0?'resist':null;
 if(!kind||!alive(e)||!e.shown||e.hp<=0){e.controlBadge?.remove();e.controlBadge=null;return;}
 const point=screenPos(e.pos,e.def.height+.75+e.y);if(!point.visible){if(e.controlBadge)e.controlBadge.hidden=true;return;}
 if(!e.controlBadge){e.controlBadge=document.createElement('span');e.controlBadge.className='control-badge';$('world-ui').append(e.controlBadge);}
 const badge=e.controlBadge;badge.hidden=false;badge.dataset.status=kind;
 const names={freeze:['❄ 凍結','❄ Frozen','❄ 凍結'],paralyze:['ϟ 麻痺','ϟ Paralyzed','ϟ 麻痺'],stun:['✦ 震懾','✦ Stunned','✦ スタン'],knock:['↗ 吹飛','↗ Blown away','↗ 吹き飛ばし'],pull:['◎ 聚攏','◎ Pulled','◎ 引き寄せ'],resist:['控制抗性','Control resist','制御耐性']};
 const seconds=kind==='resist'?e.guestControlCooldown:e.guestHold;
 badge.textContent=names[kind][lang==='en'?1:lang==='ja'?2:0]+(seconds>0&&kind!=='pull'&&kind!=='knock'?` ${seconds.toFixed(1)}s`:'');
 badge.style.left=`${Math.max(65,Math.min(innerWidth-65,point.x))}px`;badge.style.top=`${Math.max(bottom,Math.min(innerHeight-30,point.y))}px`;
}

function updateEnemy(e, dt, attackers) {
  guestCombat.repelEnemy(e);
  e.guestPullT=Math.max(0,(e.guestPullT||0)-dt);e.guestKnockT=Math.max(0,(e.guestKnockT||0)-dt);
  const tint=alive(e)&&e.guestHold>0?e.guestStatus:null;
  if(tint!==e.guestTint){e.visual.glow(!!tint,tint==='freeze'?0x7bdfff:0xffd751);e.guestTint=tint;}
  e.guestControlCooldown=Math.max(0,(e.guestControlCooldown||0)-dt);
  if(alive(e)&&e.guestHold>0){e.guestHold=Math.max(0,e.guestHold-dt);e.visual.play('stun');e.visual.root.position.set(e.pos.x,e.y,e.pos.z);return;}
  e.t += dt;
  e.visual.update(dt);
  const def = e.def;
  if (e.lineT > 0) e.lineT -= dt;
  for (const k of Object.keys(e.cds)) e.cds[k] -= dt*(def.boss&&game.pressure?1.7:1)*(def.incubus&&game.awakened?1.2:1)*(def.boss?roundRush():1);

  if (e.state === 'spawn') {
    if (e.t < 0) return;
    const intro=folaidiSpawn(e.kind,e.visual);
    if (!e.shown) {
      e.shown = true; audio.sfx('spawn'); e.visual.root.visible = true; fx.ring(e.pos, 0.3, def.radius * 3, 0xb48cff, 0.4);
      if(intro)e.visual.play('spawn',intro);
      else if((e.kind==='kabanKing'||OFFICE_BOSS_MODELS[e.kind]||ARCHIVE_STAGE_BOSSES.has(e.kind)||BOSS_GROUPS.duo.includes(e.kind))&&e.visual.actions?.spawn)e.visual.play('spawn',.45);
    }
    e.visual.root.scale.setScalar((intro?1:Math.min(1, e.t / 0.35)) * e.size);
    if(intro)e.visual.updateSpawn?.(e.t/intro);
    if (e.t > 0.45) { e.state = 'chase'; e.t = 0; if(intro)e.visual.play('idle'); }
    return;
  }

  // 擊退與打飛
  e.pos.addScaledVector(e.vel, dt);
  e.vel.multiplyScalar(Math.max(0, 1 - 6 * dt));
  if (!e.fly && (e.y > 0 || e.vy > 0)) {
    e.vy -= 30 * dt;
    e.y = Math.max(0, e.y + e.vy * dt);
    if (e.y === 0) { e.vy = 0; if (alive(e)) fx.ring(e.pos, 0.2, 1.4, 0xffffff, 0.2); }
  }
  clampArena(e.pos, def.radius);guestCombat.repelEnemy(e);
  e.visual.root.position.set(e.pos.x, e.y, e.pos.z);
  e.visual.root.rotation.set(e.y > 0 && !e.fly ? e.t * 9 : 0, e.yaw, 0);

  if (e.state === 'dead') {
    if (e.t > 0.9) { scene.remove(e.visual.root); e.visual.dispose(); e.gone = true; }
    return;
  }
  if (e.y > 0 && !e.fly) return; // 被打飛時無法行動
  if (e.stun > 0 && !e.cast) { e.stun -= dt; e.visual.play('stun'); if (!def.boss) { e.state = 'stagger'; e.t = 0; } return; }
  if (e.haste > 0) e.haste -= dt;

  const dx = hero.pos.x - e.pos.x, dz = hero.pos.z - e.pos.z;
  const d = Math.hypot(dx, dz) || 0.001;
  const heroAlive = hero.state !== 'dead';
  let speed = def.speed * (e.haste > 0 ? 1.5 : 1);
  if (def.enrage) speed *= 1 + (1 - e.hp / e.maxHp) * 0.7;      // 血越少越快
  if (def.fear) {                                               // 玩家越逃，黑影越強
    e.fear = Math.max(0, Math.min(6, e.fear + (d > 9 ? dt : -dt * 0.5)));
    speed *= 1 + e.fear / 6;
  }

  if (def.boss) {
    if(def.incubus&&!game.awakened&&!e.shield&&e.hp<=e.maxHp*.6+2){startAwakening(e);return;}
    if (def.incubus && !game.final && !e.shield && e.hp <= e.maxHp * 0.1 + 2) startFinalPhase(e); // 剩一成血才進入走上前收尾（原本 3 成太早）
    if (e.state === 'cast') {
      e.cast.t += dt;
      if (MOVES[e.cast.name].update(e, dt, d)) { e.cast = null; e.state = 'recover'; e.t = 0; e.visual.play('idle'); }
      return;
    }
    if (e.state === 'recover') { if (e.t >= def.recover * (def.enrage ? 0.4 + 0.6 * e.hp / e.maxHp : 1) * (def.boss && game.pressure ? 0.55 : 1)) { e.state = 'chase'; e.t = 0; e.cool = rand(0.3, 0.9) * (def.boss && game.pressure ? 0.5 : 1); } return; }
    e.state = 'chase';
    e.cool -= dt*(game.pressure?1.7:1)*(e.def.incubus&&game.awakened?1.2:1)*(e.def.boss?roundRush():1);
    e.yaw = Math.atan2(dx, dz);
    if (e.untouchable && hero.courage >= GAUGE.courageMax) {
      // 等主角走上前
      e.visual.play('idle');
      if (d < 3.2 && game.phase === 'playing') { e.hp = 0; e.state = 'dead'; e.t = 0; playBossKO(); e.visual.play('die', 0.9); fx.pillar(e.pos, 2, 14, 0xffffff, 0.9); fx.ring(e.pos, 1, 12, 0x9be564, 0.9); }
      return;
    }
    const clearSight = !maze || maze.lineClear(e.pos, hero.pos, 0.2);
    if (heroAlive && clearSight && bossThink(e, d, dx, dz)) return;
    if (!clearSight || d > Math.max(2.2, def.radius + 1.6)) {
      const go = maze ? maze.steer(e.pos, hero.pos, navTmp, def.radius) : navTmp.set(dx / d, 0, dz / d); // 迷宮裡繞路走
      e.pos.x += go.x * speed * dt;
      e.pos.z += go.z * speed * dt;
      e.visual.play('run');
    } else e.visual.play('idle');
    return;
  }

  if (e.state === 'stagger') {
    if (e.t > 0.3) { e.state = 'chase'; e.t = 0; }
  } else if (e.state === 'chase') {
    e.cool -= dt*(game.pressure?1.7:1)*(e.def.incubus&&game.awakened?1.2:1)*(e.def.boss?roundRush():1);
    e.yaw = Math.atan2(dx, dz);
    const canAttack = def.ranged ? attackers.ranged < 2 : attackers.melee < MAX_ATTACKERS;
    const clearSight = !maze || maze.lineClear(e.pos, hero.pos, 0.2);
    if (heroAlive && clearSight && d <= def.reach && e.cool <= 0 && canAttack) {
      e.state = 'windup'; e.t = 0; e.struck = false;
      if (def.ranged) attackers.ranged++; else attackers.melee++;
      const jiasenDur=e.visual.actions?.attack?jiasenAttackTime(e.kind,def.windup):null;
      e.visual.play('attack', (e.kind==='kaban'&&e.visual.actions?.attack?.getClip().duration)||jiasenDur||(e.kind==='folaidi'&&e.visual.actions?.spawn?def.windup+.25:ganqiaoAttackDuration(e.kind,def.windup)));
    } else if (def.ranged) {
      // 遠程：保持距離
      const want = !clearSight || d > 7 ? 1 : d < 4 ? -1 : 0;
      const go = want > 0 && maze ? maze.steer(e.pos, hero.pos, navTmp, def.radius) : navTmp.set(dx / d, 0, dz / d);
      e.pos.x += go.x * speed * want * dt;
      e.pos.z += go.z * speed * want * dt;
      e.visual.play(want<0&&e.visual.actions?.backstep?'backstep':want?'run':'idle');
    } else {
      // 近戰：還沒輪到出手的也一直往主角擠（被 separate() 推開 → 整團不停湧動，不會定在原地）
      const go = (maze && (!clearSight || d > def.reach)) ? maze.steer(e.pos, hero.pos, navTmp, def.radius) : navTmp.set(dx / d, 0, dz / d);
      const press = d > def.reach * 0.8 ? 1 : 0.55; // 已經貼到就慢慢頂
      e.pos.x += go.x * speed * press * dt;
      e.pos.z += go.z * speed * press * dt;
      e.visual.play('run');
    }
  } else if (e.state === 'windup') {
    if (!e.struck && e.t >= def.windup) {
      e.struck = true;
      if (def.ranged) {
        // 假忙森丟的是鍋：被砸到要揹著走（緩速）
        if(def.pan)e.visual.releasePan?.();
        hostileShot(e.pos, e.yaw, { dmg: def.dmg, pan: def.pan, color: def.pan ? 0x39404f : 0xff5a4f, radius: def.pan ? 0.5 : 0.3 });
        audio.sfx('shoot');
      } else {
        const f = forward(e.yaw);
        const ang = Math.acos(THREE.MathUtils.clamp((dx * f.x + dz * f.z) / d, -1, 1));
        if (d < def.reach + 0.6 && ang < 0.9) hurtHero(def.dmg);
      }
    }
    if (e.t >= def.windup + 0.25) { e.state = 'recover'; e.t = 0; e.visual.play('idle'); }
  } else if (e.state === 'recover') {
    if (e.t >= def.recover) { e.state = 'chase'; e.t = 0; e.cool = rand(1.0, 3.0); }
  }
}

// 地面危險區與陷阱
function updateHazards(dt) {
  hero.inMeeting = false;
  for (const h of hazards) {
    h.t += dt;
    const active = h.t >= h.warn;
    const inside = dist2d(hero.pos, h.pos) < h.r;
    h.mesh.material.opacity = active ? 0.55 : 0.2 + 0.2 * Math.sin(h.t * 20);
    if (active && inside && game.phase === 'playing') {
      if (h.type === 'fire') { h.tick -= dt; if (h.tick <= 0) { h.tick = 0.5; hurtHero(45); } }
      else if (h.type === 'meeting') {
        hero.inMeeting = true;
        hero.courage = Math.max(0, hero.courage - 12 * dt);
        h.tick -= dt;
        if (h.tick <= 0) { h.tick = 1.2; popup(hero.pos, 2.8, '（會議中）', 'guard'); }
      } else if (h.type === 'pie') {
        audio.sfx('pie');
        popup(h.pos, 1.5, '「明年一定調薪」', 'guard');
        popup(hero.pos, 2.8, '……空的。', 'hurt');
        hero.courage = Math.max(0, hero.courage - 10);
        h.life = 0;
      }
    }
    if (h.t >= h.life) { scene.remove(h.mesh); h.mesh.geometry.dispose(); h.mesh.material.dispose(); h.gone = true; }
  }
  hazards = hazards.filter((h) => !h.gone);
}

// 俊熊：躲在場上各處，跳出來用恐懼攻擊。預兆期間打牠或閃開就會抓到牠。
function updateAmbush(dt) {
  if (!game.rules.junxiong) return;
  if (!ambush) {
    if (game.caught >= D().bearMax) return;
    game.ambushT -= dt;
    if (game.ambushT > 0 || !enemies.some(alive)) return;
    const a = rand(0, 6.28), r = rand(3.5, 6);
    const pos = new THREE.Vector3(hero.pos.x + Math.cos(a) * r, 0, hero.pos.z + Math.sin(a) * r);
    clampArena(pos, 1);
    const visual = createVisual('junxiong',true,{modelKind:junxiongModel(STAGES[game.stage])});
    visual.root.position.set(pos.x, -0.6, pos.z);
    scene.add(visual.root);
    ambush = { pos, t: 0, warn: 1.2, visual, done: false };
    fx.ring(pos, 0.3, 1.6, 0xf4f4f0, 0.5);
    popup(pos, 1.2, '蛤……', 'guard');
    return;
  }
  const a = ambush;
  a.t += dt;
  a.visual.update(dt);
  a.visual.root.rotation.y = Math.atan2(hero.pos.x - a.pos.x, hero.pos.z - a.pos.z);
  const d = dist2d(hero.pos, a.pos);
  if (!a.done) {
    a.visual.root.position.y = -0.6 + 0.3 * Math.sin(a.t * 14) * 0.2 + Math.min(0.2, a.t * 0.2);
    const striking = ['attack', 'skill1', 'skill3'].includes(hero.state) || hero.state === 'dodge';
    if ((striking && d < 3.4) || (a.t >= a.warn && hero.form === 'brave' && d < 4.5)) {
      // 被抓到（變身中不會被嚇到，等於直接抓到）
      a.done = true; a.t = 0; a.caught = true; audio.sfx('revive');
      if (a.visual.actions?.hit) a.visual.play('hit',.9);
      game.caught++;
      if (addRescues() > 0) { popup(hero.pos, 3.8, tf('救援 +1（共 {0} 次）', game.rescues), 'good'); }
      addCourage(15);
      const heal = Math.round(hero.maxHp * 0.1);
      hero.hp = Math.min(hero.maxHp, hero.hp + heal);
      popup(hero.pos, 3.2, `+${heal} HP`, 'good heal');
      fx.ring(hero.pos, 0.4, 2.4, 0x7dff9a, 0.45);
      popup(a.pos, 1.8, '你怎麼知道我在這裡啦～～', 'good');
      say('caught');
    } else if (a.t >= a.warn) {
      a.done = true; a.t = 0;
      a.visual.root.position.y = 0; audio.sfx('junxiong_pop');
      if (a.visual.actions?.attack) a.visual.play('attack',.9);
      popup(a.pos, 2.2, '蛤～～～', 'shout');
      fx.ring(a.pos, 0.5, 4.5, 0x4a4458, 0.5);
      if (d < 4.5 && stunHero(0.8, '嚇！')) { hero.courage = Math.max(0, hero.courage - 10); hero.guilt += 6; say('scared'); }
    }
  } else {
    if (a.caught) a.visual.root.position.y = Math.max(-1.2, a.visual.root.position.y - dt * 2);
    if (a.t > 0.9) { scene.remove(a.visual.root); a.visual.dispose(); ambush = null; game.ambushT = rand(...D().bearGap); }
  }
}

// 怪物之間、怪物與主角互推，避免疊成一團。
// 用空間網格只檢查鄰近格子，避免 O(n²)（地獄模式上百隻時明顯）；行為與逐對比較等價。
const sepGrid = new Map();
function separate() {
  const CELL = 3; // 大於任何一對的互推距離（最大 min≈2.4），±1 格即可涵蓋
  const live = [];
  for (const e of enemies) if (alive(e) && e.y <= 0) { e._si = live.length; live.push(e); }
  sepGrid.clear();
  for (const e of live) {
    const k = Math.floor(e.pos.x / CELL) + ',' + Math.floor(e.pos.z / CELL);
    let cell = sepGrid.get(k); if (!cell) { cell = []; sepGrid.set(k, cell); } cell.push(e);
  }
  for (const a of live) {
    const cx = Math.floor(a.pos.x / CELL), cz = Math.floor(a.pos.z / CELL);
    for (let ox = -1; ox <= 1; ox++) for (let oz = -1; oz <= 1; oz++) {
      const cell = sepGrid.get((cx + ox) + ',' + (cz + oz)); if (!cell) continue;
      for (const b of cell) {
        if (b._si <= a._si) continue; // 每對只處理一次
        let dx = b.pos.x - a.pos.x, dz = b.pos.z - a.pos.z;
        if(Math.abs(dx)+Math.abs(dz)<1e-6){const angle=(a._si*2.399+b._si)*2.399;dx=Math.cos(angle)*.001;dz=Math.sin(angle)*.001;}
        const min = (a.def.radius + b.def.radius) * (a.def.boss || b.def.boss ? 1 : 0.7); // 小怪擠緊一點，圍滿主角
        if (Math.abs(dx) > min || Math.abs(dz) > min) continue;
        const d = Math.hypot(dx, dz) || 0.001;
        if (d < min) {
          const push = (min - d) / 2;
          const wa = a.def.boss ? 0 : 1, wb = b.def.boss ? 0 : 1;
          a.pos.x -= (dx / d) * push * wa; a.pos.z -= (dz / d) * push * wa;
          b.pos.x += (dx / d) * push * wb; b.pos.z += (dz / d) * push * wb;
        }
      }
    }
    const dx = hero.pos.x - a.pos.x, dz = hero.pos.z - a.pos.z;
    const d = Math.hypot(dx, dz) || 0.001, min = a.def.radius + HERO.radius;
    if (d < min && hero.state !== 'dodge' && hero.state !== 'skill1') {
      // 守關者推得動主角；小怪推不動，自己被擠開（不然一大群會把主角一路推到場邊）
      if (a.def.boss) { hero.pos.x += (dx / d) * (min - d); hero.pos.z += (dz / d) * (min - d); }
      else { a.pos.x -= (dx / d) * (min - d); a.pos.z -= (dz / d) * (min - d); }
    }
  }
}

// ---------- 主角 ----------

function nearestEnemy(maxDist) {
  let best = null, bd = maxDist;
  for (const e of enemies) {
    if (!alive(e)) continue;
    const d = dist2d(e.pos, hero.pos) - e.def.radius;
    if (d < bd) { bd = d; best = e; }
  }
  return best;
}

// 滑鼠游標指到的地面位置 → 主角該面向的角度。沒在用滑鼠時回傳 null
const raycaster = new THREE.Raycaster();
const GROUND = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const aimPoint = new THREE.Vector3();
function mouseYaw() {
  if (!input.mouse.active) return null;
  tmp.set((input.mouse.x / innerWidth) * 2 - 1, -(input.mouse.y / innerHeight) * 2 + 1, 0);
  raycaster.setFromCamera(tmp, camera);
  if (!raycaster.ray.intersectPlane(GROUND, aimPoint)) return null;
  const dx = aimPoint.x - hero.pos.x, dz = aimPoint.z - hero.pos.z;
  return Math.hypot(dx, dz) < 0.3 ? null : Math.atan2(dx, dz);
}

// ---------- 自動鎖定 ----------
// 開啟時，普攻與招式一律朝鎖定的敵人打，不看游標也不看移動方向。
// 目標會黏住同一隻，直到牠倒下或離太遠才換最近的一隻。
const LOCK_KEY = 'braveguy.lock';
const LOCK_RANGE = 16;
const LOCK_RELEASE_RANGE = 18; // Small hysteresis prevents boundary flicker.
let lockOn = false;
try { lockOn = localStorage.getItem(LOCK_KEY) === '1'; } catch { /* 讀不到就預設關閉 */ }
let lockTargetEnemy = null;
let manualLockTarget = null;
let manualLockUntil = 0;
const lockMarker = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 4, 1), new THREE.MeshBasicMaterial({ color: 0xff3b30, transparent: true, opacity: 0.9, depthWrite: false, side: THREE.DoubleSide }));
// Reuse the ground-lock window from the existing atlas; retain the vector fallback.
if (document.body.classList.contains('game-art')) {
  new THREE.TextureLoader().load('assets/runtime/lossless/pic/icons/brave_guy_ui35_鎖定治療圖集.webp', texture => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.repeat.set(884 / 1536, 368 / 1024);
    texture.offset.set(54 / 1536, 1 - (610 + 368) / 1024);
    lockMarker.geometry.dispose();
    lockMarker.geometry = new THREE.PlaneGeometry(2, 2);
    lockMarker.material.map = texture;
    lockMarker.material.color.set(0xffffff);
    lockMarker.material.needsUpdate = true;
  }, undefined, () => { /* Keep the original marker when art is unavailable. */ });
}
lockMarker.rotation.x = -Math.PI / 2;
lockMarker.visible = false;
scene.add(lockMarker);

function lockTarget(fresh = false) {
  if (!lockOn) return null;
  if (!fresh && ['attack','skill1','skill2'].includes(hero.state)) {
    const committed = hero.actionLockTarget;
    lockTargetEnemy = enemies.includes(committed) && isLockTarget(committed, hero.pos, LOCK_RELEASE_RANGE) ? committed : null;
    return lockTargetEnemy;
  }
  const t = lockTargetEnemy;
  // Briefly honor an explicit switch so automatic search cannot undo the same input.
  if (game.time < manualLockUntil && t === manualLockTarget && enemies.includes(t) && isLockTarget(t, hero.pos, LOCK_RELEASE_RANGE)) return t;
  manualLockTarget = null;
  lockTargetEnemy = lockCandidates(enemies, hero.pos, LOCK_RANGE)[0] || null;
  return lockTargetEnemy;
}
const yawTo = (e) => Math.atan2(e.pos.x - hero.pos.x, e.pos.z - hero.pos.z);

function setLock(on) {
  lockOn = on;
  manualLockUntil = 0;
  lockTargetEnemy = null;
  manualLockTarget = null;
  try { localStorage.setItem(LOCK_KEY, on ? '1' : '0'); } catch { /* 存不了也沒關係 */ }
  $('btn-lock').classList.toggle('on', on);
  $('btn-lock').setAttribute('aria-pressed', String(on));
  if (game.phase === 'playing') popup(hero.pos, 2.8, on ? '自動鎖定：開' : '鎖定解除', on ? 'good' : 'guard');
}

function selectLock() {
  if (game.phase !== 'playing' || game.paused || dialog) return;
  if (input.move().len > 0) cycleLockTarget();
  else { setLock(!lockOn); updateLockMarker(0); }
}

function cycleLockTarget(direction = 1) {
  if (game.phase !== 'playing' || game.paused || dialog) return;
  const current = lockOn ? lockTargetEnemy : null;
  const candidates = lockCandidates(enemies, hero.pos, LOCK_RANGE);
  const movement = input.move();
  const next = movement.len > 0 ? directionalLockTarget(candidates.filter(e => e !== current), hero.pos, LOCK_RANGE, movement) : nextLockTarget(candidates, current, hero.pos, LOCK_RANGE, direction);
  const button = $('btn-cycle-lock');
  button.getAnimations().forEach(animation => animation.cancel());
  button.animate([{filter:'brightness(1.8)'},{filter:'brightness(1)'}],{duration:180});
  if (!next) {
    const message = movement.len > 0 ? tr('該方向沒有目標', 'No target in that direction', 'その方向に標的がいない') : candidates.length
      ? tr('附近沒有其他目標','No other target nearby','近くに他の標的はいない')
      : tr('附近沒有可鎖定目標','No target in range','範囲内に標的がいない');
    popup(hero.pos, 2.8, message, 'guard');
    audio.sfx('ui_back');
    return;
  }
  if (!lockOn) setLock(true);
  lockTargetEnemy = next;
  manualLockTarget = next;
  manualLockUntil = game.time + 1.2;
  popup(next.pos, next.def.height + 0.7, next===current
    ? tr('已鎖定最近目標','Nearest target locked','最も近い標的をロック済み')
    : t('目標切換'), 'good');
  audio.sfx('lock_switch');
}

function updateLockMarker(dt) {
  const t = game.phase === 'playing' ? lockTarget() : null;
  lockMarker.visible = !!t;
  if (!t) return;
  lockMarker.position.set(t.pos.x, Math.max(0, t.y || 0) + 0.08, t.pos.z);
  lockMarker.scale.setScalar(t.def.radius * 1.9 + 0.5 + Math.sin(game.time * 8) * 0.08);
  lockMarker.rotation.z += dt * 2.5;
}

function faceForAction(mv, autoRange = 9) {
  const locked = lockTarget(true);
  hero.actionLockTarget = locked;
  if (locked) { hero.yaw = yawTo(locked); return; } // 自動鎖定優先
  const aim = mouseYaw();
  if (aim !== null) { hero.yaw = aim; return; } // 電腦：朝游標方向打
  if (mv.len > 0) { hero.yaw = Math.atan2(mv.x, mv.y); return; }
  const target = nearestEnemy(autoRange); // 沒推搖桿時自動朝向最近的怪
  if (target) hero.yaw = Math.atan2(target.pos.x - hero.pos.x, target.pos.z - hero.pos.z);
}

// Refresh only the lock: unlocked attacks retain their committed input direction.
function trackAttackLock() {
  const target = lockTarget();
  if (target && dist2d(target.pos, hero.pos) > 0.001) hero.yaw = yawTo(target);
  return target;
}
function advanceLockedAttack(distance) {
  const target = trackAttackLock();
  if (target) distance = Math.min(distance, Math.max(0, dist2d(target.pos, hero.pos) - target.def.radius - HERO.radius));
  const f = forward(hero.yaw);
  moveHeroBy(f.x * distance, f.z * distance);
  trackAttackLock();
}

// 有攻擊即將命中時閃避，才算完美閃避
function threatNear() {
  for (const e of enemies) {
    if (e.state === 'windup' && !e.struck && e.def.windup - e.t < 0.45) {
      const reach = e.def.boss ? 6.5 : e.def.ranged ? 0 : e.def.reach + 1.4;
      if (dist2d(e.pos, e.def.boss ? e.aim : hero.pos) < reach || (!e.def.boss && dist2d(e.pos, hero.pos) < reach)) return true;
    }
    if (e.state === 'charge' && dist2d(e.pos, hero.pos) < 5) return true;
  }
  for (const e of enemies) if (e.def.boss && e.state === 'cast' && dist2d(e.pos, hero.pos) < 9) return true; // 守關者出招中
  for (const s of shots) if (s.hostile && dist2d(s.mesh.position, hero.pos) < 3.5) return true;
  return false;
}

function startAttack(index, mv) {
  faceForAction(mv, hero.character==='angel'?18:6);
  if(hero.character==='angel'){hero.state='guestCast';hero.t=0;hero.guestCastDuration=.38;hero.visual.play('attack',.38);guestCombat.attack();return;}
  const c = heroCombo()[index];
  hero.state = 'attack'; hero.t = 0; hero.combo = index; hero.queued = false; hero.hitDone = false;
  hero.visual.play(c.anim, c.dur);
  audio.sfx('swing'); // Every attack has a whoosh, even when it misses.
}

function startDodge(mv) {
  if ((hero.cds.dodge || 0) > 0) return;
  if (hasDebuff('tired')) { popup(hero.pos, 2.6, '（肝不動了）', 'guard'); hero.cds.dodge = 0.5; return; }
  const f = stats();
  hero.cds.dodge = f.dodgeCd;
  if (mv.len > 0) hero.yaw = Math.atan2(mv.x, mv.y);
  const perfect = threatNear();
  hero.state = 'dodge'; hero.t = 0;
  hero.invuln = Math.max(hero.invuln, f.dodgeInvuln);
  hero.visual.play('dodge', 0.28);
  audio.sfx(perfect?'dodge_perfect':'dodge');
  if (perfect) {
    game.counterT=3;
    popup(hero.pos,3.1,tr('反擊窗口 ×1.5','COUNTER ×1.5','反撃チャンス ×1.5'),'good');
    addCourage(GAUGE.couragePerfect);
    addQi(GAUGE.qiPerfect);
    popup(hero.pos, 2.4, '完美閃避', 'good');
    fx.ring(hero.pos, 0.4, 2.6, 0x9be564, 0.3);
    say('perfect');
  } else if (nearestEnemy(5)) {
    addCourage(GAUGE.courageDodge);
  }
}

const isAngelStraightCast = action => hero.character === 'angel' && action === 'skill1';

function startSkill(name, mv) {
  if (!game.abilities.has(name)) { popup(hero.pos,2.8,unlockHint(name),'guard');say('locked');return; }
  if (hero.form !== 'brave') { say('noSkill'); return; }
  if (hero.silenceT > 0) { popup(hero.pos, 2.6, '（被噴到說不出話）', 'guard'); return; }
  if(guest()){
    const idx=['skill1','skill2','skill3','ult'].indexOf(name);if(idx<0)return;
    if(name==='ult'){if(hero.qi<GAUGE.qiMax||guestCombat.ultActive)return;hero.qi=0;}
    else {if((hero.cds[name]||0)>0)return;hero.cds[name]=ROSTER[hero.character].cd[idx];}
    // Q uses the direction she already faces, never the cursor or a newly acquired lock.
    if(isAngelStraightCast(name))hero.actionLockTarget=null;
    else faceForAction(mv,18);
    hero.state='guestCast';hero.t=0;hero.guestCastDuration=.4;
    hero.invuln=Math.max(hero.invuln,.45);hero.visual.play(name,.4);
    guestCombat.begin(hero.character,name);
    showSkillCastName(name,ROSTER[hero.character].skills[idx]);
    return;
  }
  const def = SKILLS[name];
  if (name === 'ult') { if (hero.qi < GAUGE.qiMax) return; hero.qi = 0; }
  else { if ((hero.cds[name] || 0) > 0) return; hero.cds[name] = def.cd; }
  faceForAction(mv, 12);
  hero.state = name; hero.t = 0; hero.data = { step: 0, hitSet: new Set(), from: hero.pos.clone(), tick: 0 };
  hero.visual.play(name, def.dur);
  if(name==='ult')audio.sfx('beam_start');else if(name==='skill1')audio.sfx('dash');
  if (name === 'skill1') hero.invuln = Math.max(hero.invuln, def.dur);
  if (name === 'ult') {
    hero.invuln = Math.max(hero.invuln, def.dur + 0.3);
    const mat = new THREE.MeshBasicMaterial({ color: 0x5fd83a, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false });
    beam = new THREE.Group();
    const outer = new THREE.Mesh(new THREE.CylinderGeometry(def.width / 2, def.width / 2, def.length, 20, 1, true), mat);
    const core = new THREE.Mesh(new THREE.CylinderGeometry(def.width / 9, def.width / 9, def.length, 12), new THREE.MeshBasicMaterial({ color: 0xf4ffd6 }));
    for (const m of [outer, core]) { m.rotation.x = Math.PI / 2; m.position.z = def.length / 2 + 0.8; beam.add(m); }
    beam.userData.mat = mat;
    scene.add(beam);
    game.shake = 0.5;
    say('ult');
  }
  showSkillCastName(name,def.name);
}

function endUlt() {
  audio.stopLoop('beam_loop');
  if(beam)audio.sfx('beam_end');
  if (beam) { disposeOwned(beam); beam = null; }
}

function updateHero(dt) {
  hero.t += dt;
  if(hero.guestBurstT>0){hero.guestBurstT=Math.max(0,hero.guestBurstT-dt);if(!hero.guestBurstT)hero.visual.glow(false);}
  if((godMode()||guest())&&!game.final&&hero.form==='brave'){hero.courage=GAUGE.courageMax;hero.mode='courage';}
  hero.invuln = Math.max(0, hero.invuln - dt);
  for (const k of Object.keys(hero.cds)) hero.cds[k] = Math.max(0, hero.cds[k] - dt);
  if (hero.hurtStreakT > 0) { hero.hurtStreakT -= dt; if (hero.hurtStreakT <= 0) hero.hurtStreak = 0; }
  hero.visual.update(dt);
  if (hero.state === 'dead') return;

  // 擊退、定身、緩速、封招
  moveHeroBy(hero.kb.x * dt, hero.kb.z * dt);
  hero.kb.multiplyScalar(Math.max(0, 1 - 7 * dt));
  hero.slowT = Math.max(0, hero.slowT - dt);
  hero.silenceT = Math.max(0, hero.silenceT - dt);
  if (hero.stunT > 0) {
    hero.stunT -= dt;
    hero.visual.play('stun');
    input.takeActions();
    clampArena(hero.pos, HERO.radius);
    return;
  }

  // 計量隨時間的變化
  if (hero.form === 'brave') {
    if (hero.mode === 'burst') hero.burstT -= dt; else if (!godMode()&&!guest()) hero.courage -= GAUGE.courageDrain * dt; // 天下無敵：勇氣不衰減，保持勇氣超人
    const over = !guest()&&(!godMode()||game.final)&&(hero.mode === 'burst' ? hero.burstT <= 0 : hero.courage <= 0);
    if (over && hero.state === 'free') { revert(); return; }
  } else if (enemies.some(alive)) {
    hero.farT = nearestEnemy(GAUGE.courageFarDist) ? 0 : hero.farT + dt;
    if (hero.farT > GAUGE.courageFarDelay) { addCourage(-GAUGE.courageFarDrain * dt); say('far'); }
  }

  const mv = input.move();
  const actions = input.takeActions();
  if (input.held.has('attack') && !actions.includes('attack')) actions.push('attack'); // 按住連打
  const speed = stats().speed * (hero.slowT > 0 ? 0.55 : 1) * (hasDebuff('sleepy') ? 0.6 : 1); // 揹鍋、想睡時變慢
  if (hasDebuff('confuse')) { mv.x = -mv.x; mv.y = -mv.y; } // 謠言：方向顛倒
  hero.movingT = mv.len > 0 ? 0 : hero.movingT + dt;
  const combo = heroCombo();

  const act = (a) => {
    if (a === 'attack') startAttack((hero.combo + 1) % combo.length, mv);
    else if (a === 'dodge') startDodge(mv);
    else if (a === 'transform') {
      if(guest()){startGuestBurst();return;}
      if (hero.form !== 'brave' && canTransform() && hero.courage >= GAUGE.courageMax) {
        hero.state = 'transforming'; hero.t = 0;
        hero.visual.play('transform');
        hero.visual.glow(true, 0xfff7c2);
        audio.startLoop('transform_charge',false);
        if (!save.seenTransform) {
          // 全遊戲只播一次的完整變身演出（企劃書 4.6）
          save.seenTransform = true; writeSave();
          const back = game.bgm;
          setBgm('bgm_transform');
          runDialog(FIRST_TRANSFORM, () => {
            setBgm(back);
            hero.t = GAUGE.transformMax;
          }, 'stars');
        }
      } else if (!canTransform() && hero.form !== 'brave') popup(hero.pos, 2.6, stage().map === 3 ? '（圍巾是灰的）' : '（還不會變身）', 'guard');
    } else startSkill(a, mv);
  };

  if(hero.state==='guestCast'){if(hero.t>=hero.guestCastDuration)hero.state='free';}
  else if (hero.state === 'free') {
    hero.comboGap += dt;
    if (hero.comboGap > 0.6) hero.combo = -1;
    if (mv.len > 0) {
      moveHeroBy(mv.x * speed * dt, mv.y * speed * dt);
      hero.yaw = Math.atan2(mv.x, mv.y);
      hero.visual.play('run');
    } else {
      hero.visual.play('idle');
    }
    // Do not turn the idle model toward a target on the same frame that Angel Q fires.
    if (mv.len === 0 && !actions.some(isAngelStraightCast)) trackAttackLock();
    for (const a of actions) { if (hero.state !== 'free') break; act(a); }
  } else if (hero.state === 'transforming') {
    // 可按住拖延 1–3 秒，全程無敵；拖越久衝擊波越強
    hero.invuln = Math.max(hero.invuln, 0.2);
    if (Math.floor(hero.t * 6) !== Math.floor((hero.t - dt) * 6)) fx.ring(hero.pos, 3 + hero.t, 0.6, 0xfff7c2, 0.3);
    const holding = input.held.has('transform');
    if ((hero.t >= GAUGE.transformMin && !holding) || hero.t >= GAUGE.transformMax) finishTransform();
  } else if (hero.state === 'attack') {
    const c = combo[hero.combo];
    if (!hero.hitDone) trackAttackLock();
    if (hero.t < c.hitAt) advanceLockedAttack((c.lunge / c.hitAt) * dt);
    if (!hero.hitDone && hero.t >= c.hitAt) {
      hero.hitDone = true;
      const brave = hero.form === 'brave';
      if (brave) fx.slash(hero.pos, hero.yaw, c.range, Math.min(c.arc, Math.PI * 2), hero.character==='nightmare'?0xb46cff:c.heavy ? 0xfff0b0 : 0xffe9a8, hero.combo === 1 ? -1 : 1, 1.0);
      if (c.heavy) fx.ring(hero.pos, 0.6, c.range, 0xfff0b0, 0.3);
      arcStrike(hero.pos, hero.yaw, c.range, c.arc, c.mult, { kb: c.kb, launch: c.launch, heavy: c.heavy, src: 'combo' });
    }
    for (const a of actions) {
      if (a === 'attack') hero.queued = true;
      else if (hero.hitDone || a === 'dodge') { act(a); if (hero.state !== 'attack') return; } // 命中後可用招式取消收招；閃避隨時可取消
    }
    if (hero.t >= c.dur) {
      if (hero.queued && hero.combo < combo.length - 1) startAttack(hero.combo + 1, mv);
      else { hero.state = 'free'; hero.comboGap = 0; if (hero.combo === combo.length - 1) hero.combo = -1; }
    }
  } else if (hero.state === 'dodge') {
    const f = forward(hero.yaw);
    moveHeroBy(f.x * 17 * dt, f.z * 17 * dt);
    if (hero.t >= 0.28) hero.state = 'free';
  } else if (hero.state === 'skill1') {
    // 勇氣衝拳：長距離突進，路徑上的怪全部打飛
    const s = SKILLS.skill1;
    const before = hero.pos.clone();
    if (hero.t < 0.24) advanceLockedAttack((s.dash / 0.24) * dt);
    lineStrike(before, hero.pos, s.width, s.mult, { kb: s.kb, launch: s.launch, heavy: true, src: 'skill1' }, hero.data.hitSet);
    if (hero.data.step === 0 && hero.t >= 0.24) {
      hero.data.step = 1;
      fx.trail(hero.data.from, hero.pos, s.width, 0xffe08a, 0.35);
      fx.ring(hero.pos, 0.5, s.endRadius, 0xffe08a, 0.35);
      fx.dome(hero.pos, s.endRadius * 0.7, 0xffe08a, 0.35);
      fx.burst(hero.pos, 0xffe08a, 24, 12, 0.4, 0.3);
      areaStrike(hero.pos, s.endRadius, 1.8, { kb: 10, launch: 7, heavy: true });
      game.shake = Math.max(game.shake, 0.4);
    }
    if (hero.t >= s.dur) hero.state = 'free';
  } else if (hero.state === 'skill2') {
    // 氣功彈：大顆、貫穿、飛到底會爆
    const s = SKILLS.skill2;
    if (hero.data.step === 0) trackAttackLock();
    if (hero.data.step === 0 && hero.t >= 0.14) {
      hero.data.step = 1;
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.SphereGeometry(s.radius, 18, 14), new THREE.MeshBasicMaterial({ color: 0x9be564, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false })));
      g.add(new THREE.Mesh(new THREE.SphereGeometry(s.radius * 0.5, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffffff })));
      g.position.set(hero.pos.x, 1.2, hero.pos.z).addScaledVector(forward(hero.yaw), 1.2);
      scene.add(g);
      shots.push({ mesh: g, vel: forward(hero.yaw).multiplyScalar(s.speed), life: s.life, radius: s.radius, mult: s.mult, hostile: false, hitSet: new Set(), blast: s.blast, blastMult: s.blastMult, src: 'skill2' });
      if (!hallFx?.attachKiShot(g, shots.at(-1).vel)) fx.ring(hero.pos, 0.5, 3, 0x9be564, 0.25);
      audio.sfx('ki_shot');
    }
    if (hero.t >= s.dur) hero.state = 'free';
  } else if (hero.state === 'skill3') {
    // 氣功震地：大範圍把怪震飛並暈眩，外圈再一波餘震
    const s = SKILLS.skill3;
    if (hero.data.step === 0 && hero.t >= 0.26) {
      hero.data.step = 1;
      fx.dome(hero.pos, s.radius, 0xffe08a, 0.5);
      fx.slash(hero.pos,hero.yaw,s.radius,Math.PI*1.85,0xfff6bf,1,.25);
      fx.burst(hero.pos, 0xffe08a, 40, 14, 0.3, 0.34);
      game.shake = Math.max(game.shake, 0.8);
      audio.sfx('boom');
      areaStrike(hero.pos, s.radius, s.mult, { kb: s.kb, launch: s.launch, stun: s.stun, heavy: true, src: 'skill3' });
      game.hitstop = Math.max(game.hitstop, 0.1);
    }
    if (hero.data.step === 1 && hero.t >= 0.46) {
      hero.data.step = 2;
      fx.ring(hero.pos, s.radius * 0.7, s.ripple, 0xffe08a, 0.4);
      areaStrike(hero.pos, s.ripple, s.rippleMult, { kb: 5, launch: 5 });
    }
    if (hero.t >= s.dur) hero.state = 'free';
  } else if (hero.state === 'ult') {
    // 超勇氣波：粗大的光束，可左右轉向，施放中無敵
    const s = SKILLS.ult;
    const locked = lockTarget();
    const aim = locked ? yawTo(locked) : mouseYaw();
    if (aim !== null || mv.len > 0) {
      const want = aim !== null ? aim : Math.atan2(mv.x, mv.y); // 鎖定時追著目標；否則電腦用游標帶著光束掃
      let diff = ((want - hero.yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      if (locked) hero.yaw = want;
      else hero.yaw += THREE.MathUtils.clamp(diff, -s.turn * dt, s.turn * dt);
    }
    const f = forward(hero.yaw);
    const k = hero.t / s.dur;
    if (beam) {
      beam.position.set(hero.pos.x, 1.2, hero.pos.z);
      beam.rotation.y = hero.yaw;
      const w = k < 0.08 ? k / 0.08 : k > 0.9 ? (1 - k) / 0.1 : 1 + Math.sin(hero.t * 50) * 0.06;
      beam.scale.set(Math.max(0.01, w), Math.max(0.01, w), 1);
    }
    hero.data.tick -= dt;
    hero.data.zapT = (hero.data.zapT || 0) - dt;
    if (hero.data.tick <= 0 && k < 0.92) {
      hero.data.tick = s.tick;
      const a = hero.pos.clone().addScaledVector(f, 1);
      const b = hero.pos.clone().addScaledVector(f, s.length);
      const hits = lineStrike(a, b, s.width, s.mult, { kb: 9, launch: 4, from: hero.pos, quiet: true });
      if (hits > 0 && hero.data.zapT <= 0) { hero.data.zapT = 0.18; audio.sfx('beam_hit'); } // 節流的能量 zap，取代每 tick 的拳擊音
      game.shake = Math.max(game.shake, 0.3);
    }
    if (hero.t >= s.dur) {
      endUlt();
      const end = hero.pos.clone().addScaledVector(f, s.length * 0.5);
      areaStrike(end, s.endRadius, s.endMult, { kb: 12, launch: 10, heavy: true });
      fx.dome(end, s.endRadius, 0xc8ff8a, 0.5);
      // 收尾：以主角為中心的全場衝擊波，場上小怪基本上一次清光（守關者只是受重傷）
      areaStrike(hero.pos, ARENA_RADIUS * 2.2, s.novaMult, { kb: 16, launch: 14, stun: 1.5, heavy: true });
      for (let i = 0; i < 4; i++) fx.ring(hero.pos, 1 + i * 2, ARENA_RADIUS * (0.5 + i * 0.25), i % 2 ? 0xffffff : 0xc8ff8a, 0.5 + i * 0.15);
      fx.dome(hero.pos, ARENA_RADIUS * 0.9, 0xc8ff8a, 0.8);
      for (let i = 0; i < 14; i++) { const a = Math.random() * 6.283, r = rand(4, ARENA_RADIUS - 2); fx.pillar(new THREE.Vector3(hero.pos.x + Math.sin(a) * r, 0, hero.pos.z + Math.cos(a) * r), 1.4, 16, 0xe8ffc0, 0.7); }
      fx.burst(hero.pos, 0xc8ff8a, 60, 22, 0.6, 0.4);
      game.shake = 1.4; game.hitstop = Math.max(game.hitstop, 0.16);
      audio.sfx('boom');
      popup(hero.pos, 3.2, '全．場．清．空', 'shout');
      hero.state = 'free';
    }
  }

  clampArena(hero.pos, HERO.radius);
}

// ---------- 飛行物 ----------

function updateShots(dt) {
  for (const s of shots) {
    s.life -= dt;
    if(s.owner&&(!alive(s.owner)||s.owner.shield||s.owner.untouchable)){s.life=0;continue;}
    s.mesh.position.addScaledVector(s.vel, dt);
    if(s.pan)s.mesh.rotation.y+=dt*13;
    const out = Math.hypot(s.mesh.position.x, s.mesh.position.z) > ARENA_RADIUS + 3;
    if (s.hostile && maze && maze.blocked(s.mesh.position)) s.life = 0; // 敵人的子彈會被牆擋下
    if (s.hostile) {
      if (dist2d(s.mesh.position, hero.pos) < s.radius + HERO.radius && hero.invuln <= 0 && hero.state !== 'transforming') {
        if(s.pan)audio.sfx('pan_hit');
        if (s.pan && hero.form !== 'brave') { hero.slowT = 2.5; popup(hero.pos, 2.9, '（揹鍋）', 'guard'); }
        if (s.silence) hero.silenceT = s.silence;
        hurtHero(s.dmg); s.life = 0;
      }
      // 我方的大招可以把敵方彈打掉
      for (const o of shots) if (!o.hostile && dist2d(o.mesh.position, s.mesh.position) < o.radius) s.life = 0;
    } else {
      const res = [];
      for (const e of enemies) {
        if (s.hitSet.has(e) || !alive(e)) continue;
        if (dist2d(s.mesh.position, e.pos) < s.radius + e.def.radius) { s.hitSet.add(e); res.push(damageEnemy(e, s.mult, { from: hero.pos, kb: 9, launch: 6, src: s.src })); }
      }
      tally(res, false);
      s.mesh.rotation.y += dt * 6;
      if (s.life <= 0 || out) {
        audio.sfx('ki_blast');
        if(!(s.src==='skill2' && hallFx?.impactKi(s.mesh.position,s.vel))) {
          fx.dome(s.mesh.position, s.blast, 0x9be564, 0.4);
          fx.burst(s.mesh.position, 0x9be564, 24, 10, 1, 0.3);
        }
        areaStrike(s.mesh.position, s.blast, s.blastMult, { kb: 10, launch: 8, heavy: true });
        s.life = 0;
      }
    }
    if (s.life <= 0 || out) {
      disposeShot(s.mesh);
      if (s.hostile) fx.burst(s.mesh.position, 0xff5a4f, 6, 3, s.mesh.position.y);
      s.gone = true;
    }
  }
  shots = shots.filter((s) => !s.gone);
}

// ---------- 流程 ----------

let lastOverlay = null;
let pendingVictory = null;
function showOverlay(config) {
  progressReset.refresh();
  lastOverlay = config;
  $('ov-run').hidden=true;
  $('ov-opening').hidden = true;
  $('ov-replay').hidden = config.outcome !== 'ending';
  if(config.outcome === 'ending') $('ov-replay').textContent = t('重播結局');
  const { title, text, note, btn, next, easy, outcome = 'clear', stats, nextLabel = '下一關' } = config;
  $('overlay').dataset.outcome = outcome;
  if(outcome!=='clear')$('overlay').classList.remove('victory-arrive');
  $('overlay').classList.remove('menu', 'stages');
  $('ov-menu').textContent = t(outcome === 'ending' ? '直接選關' : '選關'); // 破關結算：直接選關＝自由挑戰、不計刷
  $('ov-logo').hidden = true;
  $('ov-local-logo').hidden = true;
  $('ov-title').hidden = false;
  $('overlay').classList.add('result');
  setSystemArt($('ov-title'), title);
  $('ov-text').textContent = typeof text === 'function' ? text() : text;
  $('ov-text').classList.toggle('result-stats', Boolean(stats));
  if (stats) {
    const heading = document.createElement('strong');
    heading.className = 'result-stage';
    heading.textContent = `${stats.id}　${t(stats.name)}`;
    const time = document.createElement('span');
    const kills = document.createElement('span');
    time.className = kills.className = 'result-metric';
    for (const [node, label, value] of [[time, t('用時・秒'), stats.time], [kills, t('擊倒'), stats.kills]]) {
      const caption = document.createElement('small'); caption.textContent = label;
      const number = document.createElement('b'); number.textContent = value;
      node.append(caption, number);
    }
    $('ov-text').replaceChildren(heading, time, kills);
  }
  $('ov-load').textContent = (typeof note === 'function' ? note() : note) || '';
  $('ov-btn').textContent = typeof btn==='function'?btn():t(btn);
  $('ov-btn').disabled = false;
  $('ov-next').hidden = !next;
  $('ov-next').textContent = t(nextLabel);
  $('ov-easy').hidden = !easy;
  $('ov-menu').hidden = false;
  $('ov-stages').hidden = true;
  $('ov-diff').hidden = true;
  $('hud').hidden = true;
  $('overlay').hidden = false;
  renderRunResult(outcome);
}

function renderRunResult(outcome){
  document.getElementById('run-result')?.remove();if(!['ending','clear'].includes(outcome))return;
  const total=outcome==='ending',result=total?runs.result:runs.stageResult,box=document.createElement('section');box.id='run-result';
  const title=document.createElement('h3');title.textContent=total?tr('全關通關時間總和','TOTAL OF ALL STAGES','全ステージ合計タイム'):tr('本關最快 3 次','STAGE BEST 3','このステージのベスト3');box.append(title);
  const time=document.createElement('strong');time.textContent=result?formatTime(result.seconds):tr('選關體驗・不列榜','Stage preview · unranked','ステージ体験・ランキング対象外');if(total)box.append(time);
  const heading=document.createElement('p');heading.textContent=tr('本機・同難度 TOP 3','LOCAL · SAME DIFFICULTY · TOP 3','この端末・同難易度 TOP 3');box.append(heading);
  const list=document.createElement('ol');for(const row of result?.rows||[]){const li=document.createElement('li');li.textContent=`${formatTime(row.seconds)}  ·  ${row.date||''}`;list.append(li);}box.append(list);
  const note=document.createElement('p');note.textContent=guest()?t('夢境換角：通關進度照常保存，不列入一般計時排行。'):!result?.ranked?(total?tr('完整從序章挑戰，不使用跳關，才能列入總榜。','Complete all stages without shortcuts to rank.','全ステージをスキップなしでクリアすると合計記録対象になります。'):tr('跳關預覽不列入紀錄。','Preview shortcuts are unranked.','スキップ体験は記録対象外です。')):result.rank?tr(`第 ${result.rank} 名！再快一點，突破自己。`,`Rank ${result.rank}! Beat your best.`,`${result.rank} 位！自分の記録を超えよう。`):tr('這記錄太爛，我還需要更多勇氣！','This record sucks. I need more courage!','この記録はひどい。もっと勇気が必要だ！');box.append(note);
  if(result&&!result.saved){const warning=document.createElement('p');warning.textContent=tr('無法保存紀錄，本次仍可查看。','Record could not be saved.','記録を保存できませんでした。');box.append(warning);}
  $('ov-text').after(box);if(total)$('ov-btn').textContent=tr('從序章開始重玩（進度歸零）','RESTART FROM PROLOGUE (reset)','序章からやり直す（進捗リセット）');
}
function endGame(win) {
  if(win)return clearStage();
  if(game.phase!=='playing')return;
  guestCombat.clear();nightmareBossSkills.clear();
  audio.stopCelebration();game.fails++;game.phase='cinematic';game.paused=false;audio.stopLoops();input.takeActions();$('hud').hidden=true;
  cinematics.defeat(()=>{game.phase='over';game.bgm=null;audio.playBgm(audio.tracks.bgm_defeat?'bgm_defeat':null);
    showOverlay({outcome:'defeat',title:'倒 下',text:()=>`${stage().id}　${t(stage().name)}`,note:()=>tr('只要還願意站起來，這就不是結局。','If you stand up again, this is not the end.','もう一度立ち上がれば、これで終わりじゃない。'),btn:()=>tr('我不甘心，我還要再試一次','I WILL NOT GIVE UP. LET ME TRY AGAIN.','諦めたくない。もう一度挑戦する！'),easy:game.fails>=3&&diff>0});
  });
}

function playBossKO() {
  if (game.bossKoPlayed) return;
  game.bossKoPlayed = true;
  audio.sfx('boss_ko');
}
function clearStage() {
  if (game.phase !== 'playing') return; // One award / one victory screen per clear.
  guestCombat.clear();nightmareBossSkills.clear();
  const st = stage(), index = game.stage, last = index === STAGES.length - 1;
  if(st.boss)playBossKO(); // Includes quick-clear and scripted victory paths.
  if(st.boss&&!guest()&&!game.victoryShown){game.victoryShown=true;game.phase='cinematic';setBgm(bossBgm());$('hud').hidden=true;audio.stopLoops();input.takeActions();cinematics.victory(BOSS_GROUPS[st.boss]||[st.boss],()=>{game.phase='playing';clearStage();});return;}
  runs.clear(index,last);
  const stats = { id: st.id, name: st.name, time: (runs.stageResult?.seconds??game.time).toFixed(0), kills: game.kills };
  game.phase = 'over'; game.fails = 0; game.paused = false;
  audio.stopLoops(); input.takeActions();
  const newlyCleared=!save.cleared.includes(st.id);
  if(newlyCleared){save.cleared.push(st.id);writeSave();}
  if(st.grant)st.grant.split('+').forEach(ability=>game.abilities.add(ability));
  game.bgm = null; audio.stopBgm(); audio.stopCelebration();
  if (hero.form === 'brave'&&!guest()) revert(true);
  audio.playBgm('bgm_victory'); audio.sfx('win'); audio.sfx('victory_human_cheer');
  pendingVictory = { index, st, last, stats };
  showOverlay({outcome:'clear', title:'突 破', stats,
    note:()=>guest()?`${t(ROSTER[hero.character].name)}：「${t(ROSTER[hero.character].win)}」`:st.grantName ? tf('得到：{0}',st.grantName.split('、').map(t).join(lang==='en'?', ':'、')) : t('小天使：「還行。」'),
    btn:'再打一次', next:true, nextLabel:last?'繼續':'下一關'});
  $('overlay').classList.remove('victory-arrive');void $('overlay').offsetWidth;
  $('overlay').classList.add('victory-arrive');
  $('ov-next').focus({preventScroll:true});
}

function continueVictory() {
  const result = pendingVictory;
  if (!result || game.phase !== 'over') return;
  pendingVictory = null; // Repeated taps cannot advance twice.
  $('overlay').hidden = true;
  if (result.last) {
    // 只有「第一次破關」或「從序章重玩的那一輪」破關才計入一刷，避免重複打最終話刷輪數
    const previousRounds=save.rounds||0;
    if (save.rounds === 0 || save.freshRun) save.rounds = previousRounds + 1;
    for(const [id,threshold] of [['nightmare',3],['angel',4]])if(previousRounds<threshold&&save.rounds>=threshold)save.pendingCharacters=[...new Set([...(save.pendingCharacters||[]),id])];
    save.freshRun = false; writeSave();
    playEnding(async () => {
      await announceUnlocks();
      game.phase = 'over';
      showOverlay({outcome:'ending',title:'醒 來',stats:result.stats,
        text:()=>t('他知道自己要往哪走了。'),note:()=>t('小天使留下的便利貼：「還行。」'),btn:'再打一次'});
    });
  } else {
    if(guest()){startStage(result.index+1);return;}
    if (result.st.outro?.length) setBgm('bgm_talk');
    const outro=guest()?[[supportName(),hero.character==='angel'?'妳剛剛真的很帥。':'你做到了。'],[ROSTER[hero.character].name,hero.character==='angel'?'現在才知道？':'……你沒有走，真好。']]:result.st.outro;
    runDialog(outro, () => startStage(result.index + 1));
  }
}

function playEnding(done) {
  game.phase = 'cinematic';
  $('overlay').hidden = true; $('hud').hidden = true;
  cinematics.ending(() => { input.takeActions(); done(); },guest());
}

function update(dt) {
  if (game.hitstop > 0) { game.hitstop -= dt; fx.update(dt * 0.2); return; } // 命中頓幀
  game.time += dt;
  // 危機模式：血快見底又沒救援次數時，補更多小兵給玩家割草回血的機會
  game.desperate = game.phase === 'playing' && hero.state !== 'dead' && hero.hp > 0 && hero.hp < hero.maxHp * 0.25 && game.rescues <= 0;
  game.counterT=Math.max(0,game.counterT-dt);
  if(game.bossSpawned&&!game.pressure&&(game.bossFightTime=(game.bossFightTime||0)+dt)>=45){game.pressure=true;banner(tr('久戰加壓：魔王加速','PRESSURE: Boss accelerates','長期戦：ボス加速'));if(audio.tracks['bgm_boss_rage'])setBgm('bgm_boss_rage');}
  if (game.comboT > 0) { game.comboT -= dt; if (game.comboT <= 0) game.combo = 0; }
  updateHero(dt);
  if(guest()&&hero.state!=='dead')guestCombat.update(dt);
  nightmareBossSkills.update(dt);
  if(game.phase!=='playing'&&game.phase!=='ending')return;
  if (maze) maze.updateFlow(hero.pos);
  updateDebuffs(dt);
  const attackers = { melee: 0, ranged: 0 };
  for (const e of enemies) if (e.state === 'windup' && !e.def.boss) { if (e.def.ranged) attackers.ranged++; else attackers.melee++; }
  for (const e of enemies){updateEnemy(e, dt, attackers);if(game.phase!=='playing'&&game.phase!=='ending')return;}
  enemies = enemies.filter((e) => !e.gone);
  separate();
  // Movement and separation must finish before rendering either enemy or lock marker.
  for (const e of enemies) { clampArena(e.pos, e.def.radius);guestCombat.repelEnemy(e); e.visual.root.position.set(e.pos.x, e.y, e.pos.z); }
  updateShots(dt);
  updateHazards(dt);
  updateAmbush(dt);
  updateTaunts(dt);
  fx.update(dt);
  hero.visual.root.position.copy(hero.pos);
  hero.visual.root.rotation.y = hero.yaw;

  // 關卡流程：一波一波 →（中途事件）→ 守關者 → 過關
  feedQueue(dt);
  feedBossFodder(dt);
  feedDesperation(dt);
  // 王倒了直接過關：清掉場上剩下的小兵，不用再補刀。
  // 用 state!=='dead'（而非 alive）判斷：登場中(spawn)的王也算存在，只有真的死了才過關，否則王一出場就被誤判成過關。
  if (game.phase === 'playing' && game.bossSpawned && !game.victoryShown && enemies.some((e) => e.def.boss) && !enemies.some((e) => e.def.boss && e.state !== 'dead')) {
    for (const e of enemies) if (alive(e) && !e.def.boss) { e.state = 'dead'; e.t = 0; if (e.bar) e.bar.remove();if(e.controlBadge)e.controlBadge.remove(); e.visual.play('die', 0.6); fx.ring(e.pos, 0.2, 2, 0xffffff, 0.3); }
    clearStage();
    return;
  }
  if (game.phase === 'playing' && !game.queue.length && enemies.every((e) => e.state === 'dead')) {
    const st = stage();
    game.waveTimer -= dt;
    if (game.waveTimer > 0) return;
    game.waveTimer = 1.4;
    if (st.mid && !game.midDone && game.wave === st.mid.afterWave) {
      // 中途找回能力（地圖三）
      game.midDone = true;
      runDialog(guest()?[[supportName(),'下一段路打開了，繼續前進。'],[ROSTER[hero.character].name,hero.character==='angel'?'知道了，別搶我的台詞。':'……我會走下去的。']]:st.mid.dialog, () => {
        st.mid.grant.split('+').forEach((g) => game.abilities.add(g));
        angel.visual.root.scale.setScalar(guest()?1:1);
        hero.readySaid = false;
        if(st.mid.grant.split('+').includes('transform')){
          hero.courage = GAUGE.courageMax;
          hero.farT = 0;
          addCourage(0);
        }
        popup(hero.pos, 2.8, guest()?'前路開啟':'可以變身了', 'good');
      });
    } else if (game.wave < game.waves.length - 1) {
      if (game.wave >= 0) say('wave');
      nextWave();
    } else if (st.boss && !game.bossSpawned) {
      startBossIntro();
    } else if (enemies.length === 0) {
      clearStage();
    }
  }
}

function supportTarget(out) {
  return out.set(hero.pos.x - (angel.rescueT > 0 ? 0.3 : 1.3), 0, hero.pos.z - 0.6);
}

function updateAngel(dt) {
  if (!angel.visual) return;
  angel.rescueT=Math.max(0,(angel.rescueT||0)-dt);
  angel.pos.lerp(supportTarget(tmp), 1 - Math.exp(-4 * dt));
  angel.visual.root.position.set(angel.pos.x, guest()?2.1+Math.sin(game.time*4)*.15:1.5, angel.pos.z);
  angel.visual.root.rotation.y = Math.atan2(hero.pos.x - angel.pos.x, hero.pos.z - angel.pos.z);
  angel.visual.update(dt);
  angel.quiet = Math.max(0, angel.quiet - dt);
  if (angel.sayT > 0) { angel.sayT -= dt; if (angel.sayT <= 0) $('angel-bubble').hidden = true; }
}

// ---------- 小地圖 ----------
// 整個場地縮在一個圓裡：小怪小點、較強的怪中點、守關者大點；主角是黃色箭頭，前方扇形是目前的瞄準方向。
// 畫面上方 = 遠離鏡頭的方向，和主畫面一致。
const mini = { cv: $('minimap'), ctx: $('minimap').getContext('2d'), skip: 0 };
const isElite = (e) => e.def.bar || e.def.armored || e.def.enrage || e.maxHp >= 220 || e.size > 1.2;
function aimYaw() {
  const locked = lockTarget();
  if (locked) return yawTo(locked);
  const m = mouseYaw();
  return m !== null ? m : hero.yaw;
}
// 點一下放大、再點一下縮小；記住上次的大小
const MINI_KEY = 'braveguy.minimap';
try { mini.cv.classList.toggle('big', localStorage.getItem(MINI_KEY) === 'big'); } catch { /* 讀不到就用小的 */ }
mini.cv.addEventListener('pointerdown', (e) => {
  e.preventDefault(); e.stopPropagation();
  const big = mini.cv.classList.toggle('big');
  try { localStorage.setItem(MINI_KEY, big ? 'big' : 'small'); } catch { /* 存不了也沒關係 */ }
});
function updateMinimap() {
  if (mini.skip++ % 3) return; // 每三幀畫一次就夠
  mini.cv.classList.toggle('campus-radar',!!maze?.walkCells);
  if(maze?.walkCells){stageArt.paintCampusRadar(mini,maze,hero,enemies,hazards,ambush,lockOn ? lockTargetEnemy : null);return;}
  const useArt = document.body.classList.contains('game-art') && minimapArtReady();
  mini.cv.classList.toggle('art-loaded', useArt);
  const c = mini.ctx, S = mini.cv.width, R = S / 2, k = (R - (useArt ? 28 : 10)) / ARENA_RADIUS;
  const X = (p) => R + p.x * k, Y = (p) => R + p.z * k;
  c.clearRect(0, 0, S, S);
  if (useArt) drawMinimapSprite(c, 'frame', R, R, S);
  c.save();
  c.beginPath(); c.arc(R, R, useArt ? R - 22 : R, 0, Math.PI * 2); c.clip();
  if (useArt) drawMinimapSprite(c, 'ground', R, R, S - 44);
  c.strokeStyle = '#ffffff30'; c.lineWidth = 2;
  c.beginPath(); c.arc(R, R, ARENA_RADIUS * k, 0, 6.283); c.stroke();
  c.beginPath(); c.arc(R, R, ARENA_RADIUS * k * 0.5, 0, 6.283); c.stroke();
  if (maze) { c.fillStyle = '#e9f2ffb0'; for (const w of maze.walls) c.fillRect(X({ x: w.x0, z: 0 }), R + w.z0 * k, (w.x1 - w.x0) * k, (w.z1 - w.z0) * k); }
  // 危險區
  for (const h of hazards) { c.fillStyle = '#ff3b3040'; c.beginPath(); c.arc(X(h.pos), Y(h.pos), Math.max(3, h.r * k), 0, 6.283); c.fill(); }
  // 瞄準方向：扇形
  const yaw = aimYaw(), a = Math.atan2(Math.cos(yaw), Math.sin(yaw)); // 世界 +z 對應畫面往下
  const hx = X(hero.pos), hy = Y(hero.pos);
  const g = c.createRadialGradient(hx, hy, 0, hx, hy, 80);
  g.addColorStop(0, lockOn && lockTargetEnemy ? '#ff5a4fcc' : '#ffe98acc'); g.addColorStop(1, '#ffe98a00');
  c.fillStyle = g;
  c.beginPath(); c.moveTo(hx, hy); c.arc(hx, hy, 80, a - 0.32, a + 0.32); c.closePath(); c.fill();
  // 怪
  const locked = lockOn ? lockTargetEnemy : null;
  for (const e of enemies) {
    if (e.state === 'dead') continue;
    const boss = !!e.def.boss, r = boss ? 11 : isElite(e) ? 6.5 : 3.6;
    c.fillStyle = boss ? '#c05cff' : isElite(e) ? '#ff9a2e' : '#ff4a3d';
    c.globalAlpha = e.state === 'spawn' ? 0.4 : 1;
    if (!useArt || !drawMinimapSprite(c, boss ? 'boss' : isElite(e) ? 'elite' : 'enemy', X(e.pos), Y(e.pos), r * 2.3)) {
      c.beginPath(); c.arc(X(e.pos), Y(e.pos), r, 0, 6.283); c.fill();
    }
    c.beginPath(); c.arc(X(e.pos), Y(e.pos), r + (useArt ? 2 : 0), 0, 6.283);
    if (boss || e === locked) { c.strokeStyle = '#fff'; c.lineWidth = 2.5; c.stroke(); }
  }
  c.globalAlpha = 1;
  if (ambush && !ambush.done) {
    if (!useArt || !drawMinimapSprite(c, 'bear', X(ambush.pos), Y(ambush.pos), 22)) {
      c.fillStyle = '#b58048'; c.fillRect(X(ambush.pos) - 5, Y(ambush.pos) - 5, 10, 10);
    }
  }
  // 主角：朝向的小箭頭
  const f = Math.atan2(Math.cos(hero.yaw), Math.sin(hero.yaw));
  c.save(); c.translate(hx, hy); c.rotate(f);
  c.fillStyle = hero.form === 'brave' ? '#9be564' : '#ffd23c'; c.strokeStyle = '#10131a'; c.lineWidth = 2.5;
  if (!useArt || !drawMinimapSprite(c, 'hero', 0, 0, 26, Math.PI / 2)) {
    c.beginPath(); c.moveTo(12, 0); c.lineTo(-8, 8); c.lineTo(-4, 0); c.lineTo(-8, -8); c.closePath(); c.fill(); c.stroke();
  }
  if (useArt && hero.form === 'brave') { c.strokeStyle = '#9be564'; c.beginPath(); c.arc(0, 0, 15, 0, Math.PI * 2); c.stroke(); }
  c.restore();
  c.restore();
}

// ---------- 負面狀態 ----------
const hasDebuff = (k) => (hero.debuff[k] || 0) > 0;
function applyDebuff(k, by) {
  const def = DEBUFFS[k];
  hero.debuff[k] = def.dur * (hero.form === 'brave' ? 0.5 : 1);
  if (k === 'mute') hero.silenceT = Math.max(hero.silenceT, hero.debuff[k]);
  popup(hero.pos, 3.3, `${t(def.name)}！`, 'hurt');
  fx.ring(hero.pos, 0.4, 3, def.color, 0.5);
  audio.sfx('hurt');
  if (by) bossLine(by);
}
function updateDebuffs(dt) {
  const box = $('debuffs');
  let html = '';
  for (const k of Object.keys(hero.debuff)) {
    if (hero.debuff[k] <= 0) continue;
    hero.debuff[k] -= dt;
    html += `<span style="--c:#${DEBUFFS[k].color.toString(16).padStart(6, '0')}"><b>${t(DEBUFFS[k].name)}</b> ${t(DEBUFFS[k].tip)} ${Math.max(0, hero.debuff[k]).toFixed(0)}</span>`;
  }
  if (box.dataset.h !== html) { box.dataset.h = html; box.innerHTML = html; }
  if (hasDebuff('extort')) hero.courage = Math.max(0, hero.courage - 7 * dt);
  if (hasDebuff('guilty') && hero.form !== 'brave') hero.guilt = Math.min(hero.guiltMax * 0.98, hero.guilt + hero.guiltMax * 0.06 * dt);
  if (hasDebuff('burn')) hero.hp = Math.max(1, hero.hp - hero.maxHp * 0.02 * dt);
  mini.cv.style.visibility = hasDebuff('blind') ? 'hidden' : '';
  document.body.classList.toggle('blind', hasDebuff('blind'));

  // 守關者的狀態圈：先在主角腳下預告，一秒後爆開
  const boss = enemies.find((e) => e.def.boss && alive(e) && BOSS_DEBUFF[e.kind] && !e.untouchable);
  if (!boss || game.phase !== 'playing') { game.pulse = null; return; }
  if (game.pulse) {
    game.pulse.t -= dt;
    if (game.pulse.t <= 0) {
      const p = game.pulse; game.pulse = null;
      fx.dome(p.pos, p.r, DEBUFFS[p.kind].color, 0.4);
      if (dist2d(hero.pos, p.pos) < p.r && hero.invuln <= 0 && hero.state !== 'transforming' && hero.state !== 'dead') applyDebuff(p.kind, boss);
    }
    return;
  }
  game.pulseT -= dt;
  if (game.pulseT > 0) return;
  game.pulseT = rand(...D().pulse);
  const kinds = BOSS_DEBUFF[boss.kind], kind = kinds[Math.floor(Math.random() * kinds.length)];
  game.pulse = { pos: hero.pos.clone(), r: 4.2, t: 1.1, kind };
  fx.telegraph(game.pulse.pos, 4.2, 1.1, DEBUFFS[kind].color);
  popup(game.pulse.pos, 0.6, t(DEBUFFS[kind].name), 'guard');
}

function snapStageCamera() {
  // Evaluate the entry idle pose once, not the bobbing or attack pose every frame.
  hero.visual.update(0);
  const box = new THREE.Box3().setFromObject(hero.visual.root);
  const centerY = (box.min.y + box.max.y) * 0.5 - hero.pos.y;
  stageFocusHeight = Number.isFinite(centerY) ? centerY : 0.9;
  camTarget.copy(hero.pos);
  updateCamera(0);
  camera.updateMatrixWorld(); // First-frame projection/aiming, before rendering.
}

function updateCamera(dt) {
  camTarget.lerp(hero.pos, 1 - Math.exp(-8 * dt));
  camera.position.copy(camTarget).add(CAM_OFFSET);
  if(stage().id==='1-2')camera.position.addScaledVector(CAM_OFFSET,.17);
  if (camera.aspect < 1) camera.position.addScaledVector(CAM_OFFSET, 0.25);
  if (game.shake > 0) {
    game.shake = Math.max(0, game.shake - dt * 2.2);
    const s = matchMedia('(prefers-reduced-motion: reduce)').matches?0:game.shake * game.shake * 1.2;
    camera.position.x += rand(-s, s);
    camera.position.y += rand(-s, s);
  }
  camera.lookAt(camTarget.x, camTarget.y + stageFocusHeight, camTarget.z - (stageArt?.STORY_DESIGN[stage().id] ? 2.95 : 0));
  sun.position.set(camTarget.x - 14, 26, camTarget.z + 10);
  sun.target.position.copy(camTarget);
}

// 持續掉幀就自動降一級畫質（只降不升，避免來回跳）
const perf = { acc: 0, n: 0, slow: 0 };
function watchPerformance(rawDt) {
  if (game.phase !== 'playing' || game.paused || quality === 0 || forced !== null) return;
  perf.acc += rawDt; perf.n++;
  if (perf.n < 90) return;
  const avg = perf.acc / perf.n;
  perf.acc = 0; perf.n = 0;
  perf.slow = avg > 1 / 38 ? perf.slow + 1 : 0;   // 平均低於約 38 FPS
  if (perf.slow < 2) return;
  perf.slow = 0;
  quality--;
  try { localStorage.setItem(QUALITY_KEY, String(quality)); } catch { /* 存不了也沒關係 */ }
  sun.castShadow = Q().shadows;
  resize();
  console.info(`[效能] 畫質自動降為「${Q().name}」`);
}

let last = performance.now(), lastHud=0, staticFrame=null;
addEventListener('resize',()=>{staticFrame=null;});
document.addEventListener('visibilitychange',()=>{last=performance.now();});
function frame(now) {
  const rawDt = (now - last) / 1000;
  const dt = Math.min(0.05, rawDt);
  last = now;
  if (document.hidden||game.phase==='loading'||game.phase==='loading-assets') { requestAnimationFrame(frame); return; }
  if (opening.active) { requestAnimationFrame(frame); return; }
  audio.syncCombatLoops(game.phase==='playing'&&!game.paused&&!cinematics.active?hero.state:null);
  if (cinematics.update(dt)) { requestAnimationFrame(frame); return; }
  if(game.phase==='cinematic'){requestAnimationFrame(frame);return;}
  menuMotion.update(now, game.phase === 'ready');
  if(game.phase==='ready'){staticFrame=null;requestAnimationFrame(frame);return;}
  const frozen=game.paused||game.phase==='over';
  const frameKey=frozen?`${game.phase}:${game.stage}:${game.paused}`:null;
  if(frameKey!==null&&staticFrame===frameKey){requestAnimationFrame(frame);return;}
  staticFrame=frameKey;
  watchPerformance(rawDt);
  if(game.phase==='playing'&&!game.paused)runs.tick(rawDt);
  if (!game.paused && (game.phase === 'playing' || game.phase === 'ending')) { update(dt); updateAngel(dt); }
  else if (game.phase === 'dialog' && hero.visual) { hero.visual.update(dt); updateAngel(dt); fx.update(dt); }
  else if (hero.visual) { hero.visual.update(dt); updateAngel(dt); }
  updateCamera(dt);
  updateLockMarker(dt);
  if (game.phase !== 'loading' && (frozen || now-lastHud>=1000/30)) {updateHud();lastHud=now;}
  if (game.phase === 'playing' || game.phase === 'dialog') updateMinimap();
  hallArt?.update(frozen?0:dt);
  hallFx?.update(frozen?0:dt);
  actorShadows.update(hero,angel,enemies,ambush,!!sun?.castShadow);
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

// ---------- 啟動 ----------

async function boot() {
  await stageArtReady;
  async function loadManifest(){
  try {
    const url = new URLSearchParams(location.search).get('manifest') || 'assets/manifest.json?v=20261127kaban';
    return await (await fetch(url)).json();
  } catch (err) {
    console.warn('[manifest] 讀取失敗，全部使用佔位素材', err);
  }
  return {};
  }
  const [manifest]=await Promise.all([loadManifest(),preloadImages((done,total)=>progress(76+done/total*15,tr('準備圖像','Preparing artwork','画像を準備中')+' '+done+'/'+total))]);
  audio = new GameAudio(manifest);
  audio.onLoading = (on) => { $('music-loading').hidden = !on; }; // 音樂進關後才下載，載的時候在任務欄提示
  const availableModels = Object.entries(manifest.models || {}).filter(([,cfg])=>cfg?.url);
  for (const [kind,cfg] of availableModels) if (deferredModelKinds.has(kind)) deferredModels.set(kind,cfg);
  const models = availableModels.filter(([kind])=>!deferredModelKinds.has(kind));
  progress(91, models.length ? '載入角色模型' : '準備角色');
  let got = 0;
  const loaded = await Promise.all(models.map(([kind, cfg]) => loadModel(kind, cfg).then((r) => { progress(91 + (++got / models.length) * 4, tf('載入角色模型 {0}/{1}', got, models.length)); return r; })));
  const ok = loaded.filter(Boolean).length;

  await document.fonts.load('900 64px "BG JP"','バカ！あっち行って！黙りなさい！近寄らないで！');
  await document.fonts.ready;
  game.stage = firstOpenStage();
  game.abilities = stageAbilities(game.stage);
  resetHero();
  camTarget.copy(hero.pos);
  game.phase = 'ready';
  progress(96, '準備選關畫面');
  $('ov-load').textContent = models.length ? tf('已載入模型 {0}/{1}，其餘使用佔位角色', ok, models.length) : t('3D 角色目前使用佔位模型');
  $('btn-mute').classList.toggle('off', audio.muted);
  if (!models.length) document.getElementById('ov-load').dataset.i18n = '3D 角色目前使用佔位模型';
  showMenu();
  window.__booted = true; // 讓 index.html 的載入逾時提示知道已經開好了
  progress(100, '完成');
  document.getElementById('boot-scene').hidden=true;
  if (!save.seenOpening) playOpening();
}

// ---------- 選關 ----------

const isOpen = (i) => godMode() || save.cleared.includes(STAGES.at(-1).id) || unlockAll || i === 0 || save.cleared.includes(STAGES[i - 1].id);
// 從序章開始重玩：進度歸零、標記這一輪的破關要計入「第幾次尋找勇氣」
async function restartJourney() { if(unlockNotice.open)return;await announceUnlocks();save.cleared = []; save.freshRun = true; writeSave(); runs.reset(); menuView = 'title'; startStage(0); }
function firstOpenStage() {
  for (let i = 0; i < STAGES.length; i++) if (!save.cleared.includes(STAGES[i].id)) return isOpen(i) ? i : Math.max(0, i - 1);
  return STAGES.length - 1;
}

let menuView = 'title'; // 主選單有兩個畫面：標題（title）與選關（stages）
function showMenu() {
  guestCombat.clear();nightmareBossSkills.clear();
  progressReset.refresh();
  audio.stopCelebration();
  document.getElementById('run-result')?.remove();
  $('ov-run').hidden=menuView!=='title';
  $('ov-run').textContent=tr('完整通關計時挑戰','FULL RUN · TIME ATTACK','全ステージ・タイムアタック');
  pendingVictory = null;
  opening.cancel();
  audio.stopLoops();
  cinematics.cancel();
  $('ov-replay').textContent = t('重播變身');
  $('overlay').classList.remove('victory-arrive');
  transformArt.hide();
  dialog = null;
  $('ov-replay').hidden = menuView !== 'title';
  $('ov-opening').hidden = menuView !== 'title';
  $('ov-opening').textContent = lang === 'en' ? 'Replay prologue' : lang === 'ja' ? 'プロローグ再生' : '重播開場';
  game.phase = 'ready';
  game.bgm = null; audio.playBgm(audio.tracks.bgm_title ? 'bgm_title' : null);
  clearField();
  $('hud').hidden = true;
  $('dialog').hidden = true;
  $('overlay').classList.remove('result');
  $('overlay').classList.add('menu');
  $('overlay').classList.toggle('stages', menuView === 'stages');
  $('ov-logo').hidden = lang === 'ja';
  $('ov-local-logo').hidden = lang !== 'ja';
  if (lang === 'ja' && !$('ov-local-logo').src && $('ov-local-logo').dataset.src) $('ov-local-logo').src = $('ov-local-logo').dataset.src; // 日文才載日文 logo
  $('ov-title').hidden = true;
  $('ov-next').hidden = true;
  $('ov-easy').hidden = true;
  $('ov-menu').hidden = false;
  $('ov-menu').textContent = t(menuView === 'stages' ? '← 返回' : '選關');
  $('ov-load').textContent = ''; // 清掉上一個結算畫面留下的說明
  // 主選單的小天使：泡泡隨機講一句，底下的跑馬燈輪播她的吐槽
  const quips = ['又來了？', '今天也要被我笑嗎。', '按開始啊，還要我幫你按？', '還行。', '你的內心在等你。很亂，但在等你。', '選地獄難度的人通常活不久。', '怕成這樣還敢做夢？'];
  $('menu-bubble').textContent = t(quips[Math.floor(Math.random() * quips.length)]);
  // 輪迴標示：第幾次尋找勇氣 / 天下無敵
  const startButton = $('ov-btn'), rounds = save.rounds || 0;
  startButton.classList.toggle('god', rounds > 3);
  if (rounds >= 1) startButton.dataset.roundLabel = rounds > 3 ? t('你已經天下無敵了') : tf('你已經第 {0} 次去尋找勇氣', rounds);
  else delete startButton.dataset.roundLabel;
  const tickerQuips = quips.slice();
  if (rounds >= 1 && rounds <= 3) tickerQuips.push('多找幾次勇氣，說不定你就會天下無敵唷，你這個小嫩逼。'); // 輪迴提示
  $('menu-ticker').firstElementChild.textContent = tickerQuips.map((q) => `${t('小天使')}：「${t(q)}」`).join('　　★　　');
  $('ov-text').innerHTML = t(coarse
    ? '左下搖桿移動　右下按鍵出拳、閃避、放招<br>勇氣滿了按「變身」（可按住拖延）　變身鍵旁的「鎖」開關自動鎖定'
    : 'WASD 移動　滑鼠左鍵出拳（朝游標方向）　右鍵或 Shift 閃避<br>Q・E・R 小招　F 大招　空白鍵變身（可按住拖延）　T 自動鎖定　Esc 暫停');
  $('ov-text').append(document.createElement('br'), document.createTextNode(t('切換鎖定目標') + (coarse ? ' ↻' : ' · Y / Shift+Y')));
  const next = firstOpenStage();
  game.stage = next;
  const fullyCleared = save.cleared.includes(STAGES.at(-1).id);
  $('ov-btn').textContent = fullyCleared ? t('從序章開始重玩') : save.cleared.length ? tf('繼續　{0} {1}', STAGES[next].id, t(STAGES[next].name)) : t('開始');
  $('ov-btn').disabled = false;
  const dbox = $('ov-diff');
  dbox.replaceChildren();
  DIFFS.forEach((d, i) => {
    const b = document.createElement('button');
    b.className = `diff ${d.id}`;
    b.textContent = t(d.name);
    b.classList.toggle('on', i === diff);
    b.setAttribute('aria-pressed', String(i === diff));
    b.addEventListener('click', () => { audio.unlock(); audio.sfx('ui'); setDiff(i); showMenu(); });
    dbox.append(b);
  });
  dbox.hidden = false;
  const box = $('ov-stages');
  box.replaceChildren();
  let group = null, map = 0;
  STAGES.forEach((st, i) => {
    if (st.map !== map) {
      map = st.map;
      const h = document.createElement('h4');
      h.textContent = t(MAP_NAMES[map]);
      group = document.createElement('div');
      group.className = 'stage-row';
      box.append(h, group);
    }
    const b = document.createElement('button');
    b.className = 'stage';
    const bossName = st.boss ? (BOSS_GROUPS[st.boss] || [st.boss]).map((k) => t(BOSSES[k].name)).join(t('＋')) : '';
    b.innerHTML = `<i>${st.id}</i><b></b><small></small>${bossName ? '<em></em>' : ''}`;
    b.querySelector('b').textContent = t(st.name);
    b.querySelector('small').textContent = t(st.sub);
    if (bossName) b.querySelector('em').textContent = `BOSS　${bossName}`;
    b.disabled = !isOpen(i);
    b.classList.toggle('done', save.cleared.includes(st.id));
    b.classList.toggle('current', i === next);
    b.addEventListener('click', () => { audio.unlock(); audio.sfx('stage_select'); startStage(i); });
    group.append(b);
  });
  box.hidden = false;
  $('overlay').hidden = false;
}

function playOpening() {
  audio.stopLoops(); cinematics.cancel(); transformArt.hide(); input.takeActions();
  $('overlay').hidden = true; $('hud').hidden = true; $('dialog').hidden = true;
  game.phase = 'opening';
  opening.play(() => { input.takeActions(); save.seenOpening = true; writeSave(); menuView = 'title'; showMenu(); });
}
$('ov-run').addEventListener('click',()=>{audio.unlock();runs.reset();startStage(0);});
$('ov-opening').addEventListener('click', playOpening);
const progressReset=createProgressReset(()=>audio);
$('ov-btn').addEventListener('click', () => { audio.unlock(); audio.sfx('ui_confirm');
  if (lastOverlay?.outcome === 'ending' && game.phase === 'over') restartJourney(); // 破關結算：從序章重玩（進度歸零、計一刷）
  else if (game.phase === 'ready' && save.cleared.includes(STAGES.at(-1).id)) restartJourney(); // 全破後主選單主按鈕＝從序章重玩
  else startStage(game.stage);
});
$('ov-replay').addEventListener('click', () => {
  audio.unlock();
  if (game.phase === 'over' && lastOverlay?.outcome === 'ending') {
    playEnding(() => { game.phase = 'over'; showOverlay(lastOverlay); $('ov-replay').hidden = false; $('ov-replay').textContent = t('重播結局'); }); return;
  }
  if(!gameplayIsReady()){game.phase='loading-assets';waitForArtwork(prepareGameplay,()=>{$('ov-replay').click();});return;}
  $('overlay').hidden = true;
  setBgm('bgm_transform');
  runDialog(FIRST_TRANSFORM, showMenu, 'stars');
});
$('ov-next').addEventListener('click', () => { audio.unlock(); audio.sfx('ui_confirm'); if(pendingVictory)continueVictory(); });
$('ov-menu').addEventListener('click', () => {
  audio.sfx('ui');
  // 在主選單裡是「選關／返回」的切換；破關結算的「直接選關」直接進選關；其餘回主選單
  if (game.phase === 'over' && lastOverlay?.outcome === 'ending') menuView = 'stages';
  else menuView = game.phase === 'ready' && menuView === 'title' ? 'stages' : 'title';
  showMenu();
});
$('ov-easy').addEventListener('click', () => { setDiff(diff - 1); game.fails = 0; audio.unlock(); audio.sfx('ui'); startStage(game.stage); });
$('btn-mute').addEventListener('click', () => { audio.setMuted(!audio.muted); $('btn-mute').classList.toggle('off', audio.muted); });
$('btn-lock').addEventListener('click', () => { audio.sfx('ui'); selectLock(); });
$('btn-cycle-lock').addEventListener('pointerdown', e => {
  if(e.button!==0 || $('btn-cycle-lock').disabled)return;
  e.preventDefault();audio.unlock();cycleLockTarget();
});
// Keyboard/assistive activation has no pointerdown; avoid a second pointer click.
$('btn-cycle-lock').addEventListener('click', e => {if(e.detail===0){audio.unlock();cycleLockTarget();}});
addEventListener('keydown', e => { if (e.code === 'KeyY' && !e.repeat && game.phase === 'playing' && !game.paused && !dialog) { e.preventDefault(); cycleLockTarget(e.shiftKey ? -1 : 1); } });
addEventListener('keydown', (e) => { if (e.code === 'KeyT' && !e.repeat && !dialog) { audio.sfx('ui'); selectLock(); } });
$('btn-lock').classList.toggle('on', lockOn);
// 暫停：跳出選單，可以繼續、重打這一關，或回標題選關
function setPaused(on) {
  if (secretToggle.opened) return;
  if (on && (game.phase !== 'playing' || dialog)) return;
  game.paused = on;
  if(on)audio.stopLoops();
  $('btn-pause').classList.toggle('on', on);
  $('pause-menu').hidden = !on;
}
const secretToggle = createSecretToggle({
  canUseMenu:()=>game.phase==='ready'&&menuView==='title'&&!$('overlay').hidden&&!rosterPicker.open&&!unlockNotice.open&&!document.querySelector('dialog[open]')&&!opening.active&&!cinematics.active&&save.secretCharacters.length<2,
  onMenuHold:()=>{
    const id=save.secretCharacters.includes('angel')?'nightmare':'angel';
    save.secretCharacters.push(id);writeSave();input.takeActions();
    const message=id==='angel'
      ?tr('小娘炮你又想作弊！\n可以使用小天使了！','You little wimp, cheating again!\nLittle Angel is now playable!','またズルする気、この弱虫！\n小天使が使用可能になった！')
      :tr('你這廢物，我阿媽都比你強。滾開！\n可以使用惡夢超人了！','You loser. My grandma is stronger than you. Move aside!\nNightmare Superman is now playable!','この役立たず。うちのばあちゃんの方が強いぞ。どけ！\n悪夢超人が使用可能になった！');
    unlockNotice.show(id,message);
  },
  canUse:()=>game.phase==='playing'&&!game.paused&&!dialog&&!cinematics.active&&!$('hud').hidden,
  pause:()=>{game.paused=true;audio.stopLoops();input.takeActions();},
  resume:()=>{input.takeActions();game.paused=false;},
  onChange:()=>{$('btn-quick-clear').hidden=!secretToggle.enabled;},
  labels:()=>({name:tr('小天使','Little Angel','小天使'),question:tr('要開啟秘技嗎？','Enable cheats?','秘技を有効にする？'),no:tr('取消','Cancel','キャンセル'),yes:tr('開啟','Enable','有効にする')})
});
$('btn-quick-clear').addEventListener('click', () => {
  if (!secretToggle.enabled || game.phase !== 'playing' || game.paused || dialog || cinematics.active) return;
  audio.unlock();
  runs.invalidate();
  if (beam) endUlt();
  $('btn-quick-clear').hidden = true;
  const st = stage();
  if (st.boss && !game.bossSpawned) {
    audio.stopLoops(); input.takeActions();
    clearField();
    game.queue = []; game.queueT = 0;
    game.wave = game.waves.length - 1; game.waveTimer = 1.4;
    // Preserve abilities normally restored by the skipped mid-stage event.
    if (st.mid && !game.midDone) {
      st.mid.grant.split('+').forEach(g => game.abilities.add(g));
      angel.visual.root.scale.setScalar(guest()?1:1); hero.readySaid = false;
    }
    game.midDone = true;
    startBossIntro();
  } else if(st.boss==='incubus'&&!game.awakened){
    // Preview must also work immediately after skipping the entrance, while
    // the boss is still in its otherwise untargetable spawn animation.
    const boss=enemies.find(e=>e.def.incubus&&e.state!=='dead'&&!e.gone&&e.hp>0);
    if(boss){boss.shield=false;boss.hp=boss.maxHp*.6;startAwakening(boss);}
  } else {
    clearStage();
  }
});
$('btn-pause').addEventListener('click', () => { audio.sfx('ui'); setPaused(!game.paused); });
// 語系切換：標題畫面與暫停選單各有一顆。切換後立刻重畫目前看得到的文字
function refreshLang() {
  preloadLanguage(lang); // 切語言後背景補載該語言字藝
  applyStatic();
  decorateSystemUI();
  if (game.phase === 'ready') showMenu();
  else if (game.phase === 'over' && lastOverlay) showOverlay(lastOverlay);
  else if (game.phase === 'playing' || game.phase === 'dialog') {
    const st = stage();
    $('quest-title').textContent = `${st.id}　${t(st.name)}`;
    if (game.bossKinds) {
      // 守關者戰中切語系：名牌與任務字要跟著換語系
      const names = game.bossKinds.map((k) => t(BOSSES[k].name)).join(t('＋'));
      $('boss-name').textContent = names;
      $('quest-wave').textContent = tf('打倒{0}', names);
    } else if (!game.bossSpawned) {
      $('quest-wave').textContent = t(st.sub);
    }
    if (dialog) showLine();
  }
}
for (const el of document.querySelectorAll('[data-lang-toggle]')) el.addEventListener('click', e => { audio.unlock(); audio.sfx('ui'); const code=e.target.closest('[data-lang]')?.dataset.lang; if(code) setLang(code); else nextLang(); refreshLang(); });
applyStatic();
decorateSystemUI();
// 瀏覽器要等玩家第一次點擊才准播聲音：第一次點擊時啟動音訊，人還在標題畫面就補播標題曲
addEventListener('pointerdown', () => {
  if (audio.ctx) return;
  audio.unlock();
  if (game.phase === 'ready' && audio.tracks.bgm_title) { audio.stopBgm(); audio.bgmName = null; audio.playBgm('bgm_title'); }
}, true);
// 任務欄：點一下收合成一行（關卡、擊倒數、救援次數），再點展開。手機預設收合
const QUEST_KEY = 'braveguy.quest';
{
  const q = document.querySelector('.quest');
  let mini = coarse;
  try { const v = localStorage.getItem(QUEST_KEY); if (v) mini = v === 'mini'; } catch { /* 讀不到就用預設 */ }
  q.classList.toggle('mini', mini);
  q.addEventListener('pointerdown', (e) => {
    e.preventDefault(); e.stopPropagation();
    const now = q.classList.toggle('mini');
    try { localStorage.setItem(QUEST_KEY, now ? 'mini' : 'full'); } catch { /* 存不了也沒關係 */ }
  });
}
$('pm-resume').addEventListener('click', () => { audio.sfx('ui_confirm'); setPaused(false); });
$('pm-restart').addEventListener('click', () => { audio.sfx('ui_confirm'); setPaused(false); startStage(game.stage); });
$('pm-menu').addEventListener('click', () => { audio.sfx('ui_back'); setPaused(false); showMenu(); });
addEventListener('keydown', (e) => { if ((e.code === 'Escape' || e.code === 'KeyP') && !e.repeat && !dialog && (game.phase === 'playing')) setPaused(!game.paused); });
$('dialog').addEventListener('pointerdown', (e) => { e.preventDefault(); advanceDialog(e.target.id === 'dlg-skip'); });
addEventListener('keydown', (e) => {
  if (!dialog) return;
  if (['Space', 'Enter', 'KeyJ'].includes(e.code)) { e.preventDefault(); advanceDialog(); }
  else if (e.code === 'Escape') advanceDialog(true);
});
document.addEventListener('visibilitychange', () => { if (document.hidden && game.phase === 'playing') setPaused(true); });

// 供自動化測試與除錯讀取狀態
window.__game = { camera, updateHud, nightmareBossSkills, COMBO, guestCombat, rosterPicker, get support(){return {name:supportName(),visual:angel.visual}}, game, hero, save, STAGES, setDiff, get maze() { return maze; }, hurt: (n) => hurtHero(n), get diff() { return diff; }, get quality() { return quality; }, get lockOn() { return lockOn; }, get lockTarget() { return lockTargetEnemy; }, setLock, cycleLockTarget, get audio() { return audio; }, get enemies() { return enemies; }, get dialog() { return dialog; }, get hazards() { return hazards; },
  onHit, addRescues, get lockMarker() { return lockMarker; }, runs, prepareGameplay, startAwakening, endGame, startSkill, startGame, startStage, spawnEnemy, spawnBoss, clearStage, guiltBurst, cinematics, hurtHero, advanceDialog, showMenu, damageEnemy, MOVES, HERO, GAUGE, SKILLS,
  // 測試用：不經過畫面更新直接推進模擬
  step(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) { if (game.phase === 'playing' || game.phase === 'ending') { update(dt); updateAngel(dt); } } } };

enableCameraZoom({camera,game});
requestAnimationFrame(frame);
boot().catch(err=>window.__fail?.(err.message));
