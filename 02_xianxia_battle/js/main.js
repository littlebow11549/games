// 勇氣超人 遊戲底層：關卡流程（14 關）、兩種型態、四條計量、拳頭與氣功、變身、守關者招式庫、三層死亡保險。
// 規格見 DESIGN.md；關卡與對白資料在 story.js。所有美術都是佔位物。
import * as THREE from '../vendor/three/three.module.min.js';
import { buildWorld, ARENA_RADIUS } from './world.js';
import { createVisual, loadModel } from './visuals.js';
import { Fx } from './fx.js';
import { Input, lockViewport } from './input.js';
import { GameAudio } from './audio.js';
import { STAGES, MAP_NAMES, FIRST_TRANSFORM, abilitiesFor } from './story.js';

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

// 無雙感：範圍大、一次掃一片、把怪打飛
const SKILLS = {
  skill1: { name: '勇氣衝拳', cd: 3, dur: 0.34, dash: 11, width: 3.4, mult: 2.8, kb: 12, launch: 6 },
  skill2: { name: '氣功彈', cd: 4.5, dur: 0.4, radius: 1.9, speed: 22, life: 1.15, mult: 3, blast: 4.5, blastMult: 2 },
  skill3: { name: '氣功震地', cd: 7, dur: 0.6, radius: 8, mult: 3.2, kb: 6, launch: 11, stun: 1.6, ripple: 11.5, rippleMult: 1.2 },
  ult: { name: '超勇氣波', dur: 2.3, length: 24, width: 5.5, tick: 0.12, mult: 1.3, turn: 1.8, endMult: 4, endRadius: 7 },
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
  qian: { name: '錢大姐', vis: 'qian', hp: 3600, speed: 3.6, radius: 0.7, height: 2.1, moves: ['fan', 'charge', 'summon'], minion: 'folaidi', minionN: 3, lines: ['過路費！', '這個場子我罩的！'] },
  lan: { name: '藍教頭', vis: 'lan', hp: 4600, speed: 3.0, radius: 0.9, height: 2.7, moves: ['whistle', 'spread', 'slam'], lines: ['立正！', '稍息！', '我沒說可以動！', '你要檢討你自己！'] },
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
const BOSS_GROUPS = { duo: ['xinji', 'baguashe'] }; // 一關有兩隻守關者時
const MAX_ATTACKERS = 4;      // 同時出手的小怪上限，避免被圍毆到無法反應
const SAVE_KEY = 'braveguy.save.v1';

// 小天使的吐槽（節錄自 SCRIPT.md 附錄 A）
const ANGEL = {
  start: '左邊那根是搖桿。不是裝飾。',
  ready: '勇氣滿了。按變身，還是你要再想三年？',
  transform: '衣服換好了？上工。',
  revert: '魔法時間結束，灰姑娘。',
  burst: '喔，終於會生氣了。',
  clutch: '……這樣都沒倒。還行。',
  revive: '起來。我可沒說你可以躺。',
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
if (!$('dialog') || !$('ov-stages')) {
  if (!location.search.includes('r=')) location.replace(`${location.pathname}?r=${Date.now()}`);
  throw new Error('頁面版本過舊，正在重新載入');
}

// ---------- 畫質分級（效能） ----------
// 手機預設中等；執行中若持續掉幀會自動往下調，並記住下次直接用較低的等級。
const QUALITY_KEY = 'braveguy.quality';
const QUALITY = [
  { name: '低', ratio: 1, shadows: false, shadowSize: 512, crowd: 0.7 },
  { name: '中', ratio: 1.5, shadows: true, shadowSize: 1024, crowd: 1 },
  { name: '高', ratio: 2, shadows: true, shadowSize: 2048, crowd: 1 },
];
const coarse = matchMedia('(pointer: coarse)').matches;
const forced = new URLSearchParams(location.search).get('q');
let quality = forced !== null ? +forced : coarse ? 1 : 2;
try { const q = localStorage.getItem(QUALITY_KEY); if (forced === null && q !== null) quality = Math.min(quality, +q); } catch { /* 無法讀取就用預設 */ }
quality = Math.max(0, Math.min(2, quality | 0));
const Q = () => QUALITY[quality];

const canvas = $('scene');
// 手機螢幕像素密度高，關掉抗鋸齒差異不大但省很多
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !coarse, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, Q().ratio));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = coarse ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 200);
const CAM_OFFSET = new THREE.Vector3(0, 13, 12.5);
let { sun } = buildWorld(scene, 'corridor', Q());
const fx = new Fx(scene);
lockViewport();
const input = new Input();
let audio = new GameAudio(null);

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
  stage: 0, rules: {}, abilities: new Set(), bossSpawned: false, midDone: false, suanle: 0, ambushT: 8, caught: 0 };
let save = { cleared: [], seenTransform: false };
try { save = { ...save, ...JSON.parse(localStorage.getItem(SAVE_KEY) || '{}') }; } catch { /* 存檔壞掉就從頭 */ }
const unlockAll = new URLSearchParams(location.search).get('unlock') === 'all';
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

const rand = (a, b) => a + Math.random() * (b - a);
const forward = (yaw, out = new THREE.Vector3()) => out.set(Math.sin(yaw), 0, Math.cos(yaw));
const dist2d = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const alive = (e) => e.state !== 'dead' && e.state !== 'spawn';
const stats = () => FORM[hero.form === 'brave' ? 'brave' : 'student']; // 上班族沿用大學生的數值
const stage = () => STAGES[game.stage];
function clampArena(p, margin = 0) {
  const r = Math.hypot(p.x, p.z), max = ARENA_RADIUS - margin;
  if (r > max) { p.x *= max / r; p.z *= max / r; }
}

function setForm(form) {
  hero.form = form;
  for (const [k, v] of Object.entries(hero.vis)) v.root.visible = k === form;
  hero.visual = hero.vis[form];
  hero.visual.glow(false);
  hero.visual.play('idle');
}

function resetHero() {
  if (!hero.vis.student) {
    for (const k of ['student', 'worker', 'brave']) { hero.vis[k] = createVisual(k); scene.add(hero.vis[k].root); }
    angel.visual = createVisual('angel');
    scene.add(angel.visual.root);
  }
  hero.base = stage().form;
  hero.maxHp = HERO.maxHp + (game.abilities.has('hp') ? 200 : 0);
  Object.assign(hero, {
    hp: hero.maxHp, courage: 0, qi: 0, guilt: 0, guiltMax: GAUGE.guiltBase,
    state: 'free', t: 0, combo: -1, queued: false, comboGap: 0, hitDone: false, invuln: 0, cds: {}, yaw: 0, data: null,
    mode: null, burstT: 0, extendLeft: 0, farT: 0, hurtStreak: 0, hurtStreakT: 0, usedClutch: false, usedRevive: false, readySaid: false,
    kb: new THREE.Vector3(), stunT: 0, slowT: 0, silenceT: 0, movingT: 9, inMeeting: false,
  });
  hero.pos.set(0, 0, 5);
  setForm(hero.base);
  angel.pos.copy(hero.pos);
  // 地圖三前段小天使縮成巴掌大，找回變身後長回來
  angel.visual.root.scale.setScalar(stage().map === 3 && !game.abilities.has('transform') ? 0.35 : 1);
}

function clearField() {
  for (const e of enemies) { scene.remove(e.visual.root); e.visual.dispose(); if (e.bar) e.bar.remove(); }
  for (const s of shots) scene.remove(s.mesh);
  for (const h of hazards) scene.remove(h.mesh);
  if (ambush) { scene.remove(ambush.visual.root); ambush = null; }
  if (beam) { scene.remove(beam); beam = null; }
  enemies = [];
  shots = [];
  hazards = [];
  fx.clear();
  $('world-ui').replaceChildren();
}

// 開始（或重來）指定的關卡
function startStage(index) {
  game.stage = index;
  const st = stage();
  ({ sun } = buildWorld(scene, st.theme, Q()));
  game.rules = st.rules || {};
  game.abilities = abilitiesFor(index);
  if (game.rules.tutorial) game.abilities.add('transform'); // 序章就是學變身的地方
  clearField();
  resetHero();
  Object.assign(game, { phase: 'playing', time: 0, kills: 0, wave: -1, waveTimer: 0.8, hitstop: 0, shake: 0, paused: false, combo: 0, comboT: 0,
    bossSpawned: false, midDone: false, suanle: 0, ambushT: rand(8, 12), caught: 0, final: false });
  camTarget.copy(hero.pos);
  $('overlay').hidden = true;
  $('hud').hidden = false;
  $('boss-bar').hidden = true;
  $('btn-pause').classList.remove('on');
  $('quest-title').textContent = `${st.id}　${st.name}`;
  $('quest-wave').textContent = st.sub;
  $('suanle').hidden = st.map !== 3;
  const key = `bgm_stage_${st.id.replace('-', '_')}`;
  audio.playBgm(audio.tracks[key] ? key : 'bgm_battle');
  runDialog(st.intro, () => { if (index === 0) say('start', true); });
}
const startGame = () => startStage(game.stage);

// ---------- 對話 ----------

// 播放一段對話，播完呼叫 done。對話期間遊戲暫停。
function runDialog(lines, done, cls = '') {
  if (!lines || !lines.length) { if (done) done(); return; }
  dialog = { lines, i: 0, done, prev: game.phase };
  game.phase = 'dialog';
  $('dialog').className = `dialog ${cls}`;
  $('dialog').hidden = false;
  showLine();
}
function showLine() {
  const [who, text] = dialog.lines[dialog.i];
  $('dlg-name').textContent = who;
  $('dlg-name').hidden = !who;
  $('dlg-text').textContent = text;
  $('dialog').classList.toggle('narration', !who);
  $('dialog').dataset.who = who === '小天使' ? 'angel' : who === '主角' ? 'hero' : who ? 'other' : '';
}
function advanceDialog(skip = false) {
  if (!dialog) return;
  dialog.i = skip ? dialog.lines.length : dialog.i + 1;
  if (dialog.i < dialog.lines.length) { showLine(); audio.sfx('ui'); return; }
  const d = dialog;
  dialog = null;
  $('dialog').hidden = true;
  game.phase = d.prev === 'dialog' ? 'playing' : d.prev;
  input.takeActions(); // 對話時按的鍵不要帶進戰鬥
  if (d.done) d.done();
}

// ---------- HUD ----------

function banner(text) {
  const b = $('banner');
  b.textContent = text;
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
  el.textContent = text;
  el.style.left = `${p.x + rand(-14, 14)}px`;
  el.style.top = `${p.y + rand(-8, 8)}px`;
  ui.append(el);
  el.addEventListener('animationend', () => el.remove());
}

// 小天使講話。force 可插隊；一般吐槽之間至少隔幾秒，同一句不連講
function say(key, force = false) {
  if (!force && (angel.quiet > 0 || angel.lastKey === key)) return;
  angel.lastKey = key;
  angel.sayT = 2.8;
  angel.quiet = 5;
  const b = $('angel-bubble');
  b.textContent = ANGEL[key];
  b.hidden = false;
}

const ACT_BUTTONS = [...document.querySelectorAll('.act[data-action]')]; // 每幀都要用，先查好

function updateHud() {
  const brave = hero.form === 'brave';
  $('hp-fill').style.transform = `scaleX(${Math.max(0, hero.hp / hero.maxHp)})`;
  $('hp-text').textContent = `${Math.max(0, Math.ceil(hero.hp))} / ${hero.maxHp}`;
  const courageShown = hero.mode === 'burst' ? hero.burstT / GAUGE.burstTime : hero.courage / GAUGE.courageMax;
  $('courage-fill').style.transform = `scaleX(${Math.max(0, Math.min(1, courageShown))})`;
  $('courage').classList.toggle('full', !brave && hero.courage >= GAUGE.courageMax);
  $('courage').classList.toggle('burst', hero.mode === 'burst');
  const g = hero.guilt / hero.guiltMax;
  $('guilt-fill').style.transform = `scaleX(${Math.max(0, Math.min(1, g))})`;
  $('guilt').classList.toggle('crack', g >= 0.9);
  $('guilt').classList.toggle('heavy', g >= GAUGE.guiltHesitate);
  $('portrait').classList.toggle('brave', brave);
  $('quest-count').textContent = `擊倒 ${game.kills}`;
  $('suanle-n').textContent = game.suanle;
  $('combo').hidden = game.combo < 5;
  $('combo-n').textContent = game.combo;

  for (const btn of ACT_BUTTONS) {
    const a = btn.dataset.action;
    if (SKILLS[a] && a !== 'ult') {
      btn.style.setProperty('--cd', `${(hero.cds[a] || 0) / SKILLS[a].cd}turn`);
      btn.classList.toggle('locked', !brave || !game.abilities.has(a) || hero.silenceT > 0);
    } else if (a === 'ult') {
      btn.style.setProperty('--qi', `${hero.qi / GAUGE.qiMax}turn`);
      btn.classList.toggle('locked', !brave || !game.abilities.has('ult'));
      btn.classList.toggle('ready', brave && game.abilities.has('ult') && hero.qi >= GAUGE.qiMax);
    } else if (a === 'transform') {
      const can = canTransform();
      btn.classList.toggle('ready', !brave && can && hero.courage >= GAUGE.courageMax);
      btn.classList.toggle('locked', brave || !can || hero.courage < GAUGE.courageMax);
    } else if (a === 'dodge') {
      btn.style.setProperty('--cd', `${(hero.cds.dodge || 0) / stats().dodgeCd}turn`);
    }
  }

  let bossHp = 0, bossMax = 0;
  for (const e of enemies) {
    if (e.def.boss) { bossHp += Math.max(0, e.hp); bossMax += e.def.hp; continue; }
    if (!e.bar) continue;
    const p = screenPos(e.pos, e.def.height + 0.3 + e.y);
    const show = p.visible && e.state !== 'dead' && e.hp < e.maxHp;
    e.bar.style.display = show ? '' : 'none';
    if (show) {
      e.bar.style.left = `${p.x}px`;
      e.bar.style.top = `${p.y}px`;
      e.bar.firstChild.style.transform = `scaleX(${Math.max(0, e.hp / e.maxHp)})`;
    }
  }
  if (bossMax) $('boss-fill').style.transform = `scaleX(${bossHp / bossMax})`;

  const b = $('angel-bubble');
  if (!b.hidden) {
    const p = screenPos(angel.pos, 2.9);
    b.style.left = `${Math.min(innerWidth - 150, Math.max(150, p.x))}px`;
    b.style.top = `${Math.max(70, p.y)}px`;
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
  if (hero.form !== 'brave' && canTransform() && hero.courage >= GAUGE.courageMax && !hero.readySaid) { hero.readySaid = true; say(game.final ? 'walk' : 'ready', true); audio.sfx('skill'); }
}
function addQi(x) { if (hero.form === 'brave' && hero.state !== 'ult') hero.qi = Math.min(GAUGE.qiMax, hero.qi + x * (game.abilities.has('qi') ? 1.3 : 1)); } // 放大招期間不回氣
// 終章最後一段與地圖三找回變身之前不能變身
const canTransform = () => game.abilities.has('transform') && !game.final;

function onHit(count, killed) {
  if (!count) return;
  game.combo += count;
  game.comboT = 2.2;
  if (hero.form === 'brave') { addCourage(GAUGE.courageHitBrave * count); addQi(GAUGE.qiHit * count + GAUGE.qiKill * killed); }
  else addCourage(GAUGE.courageHitStudent * count);
  addCourage(GAUGE.courageKill * killed);
}

// ---------- 變身 ----------

function shockwave(center, radius, mult, color) {
  fx.dome(center, radius, color, 0.55);
  fx.ring(center, 1, radius, 0xffffff, 0.45);
  fx.burst(center, color, 36, 13, 0.6, 0.32);
  game.shake = Math.max(game.shake, 0.7);
  audio.sfx('boom');
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
  shockwave(hero.pos, 6 + 5 * extra, 1.6 + 1.6 * extra, 0x9be564);
  popup(hero.pos, 2.6, '勇氣超人！', 'shout');
  say('transform', true);
}

function guiltBurst() {
  if (!canTransform()) {
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
  shockwave(hero.pos, 9, 3, 0xb06cff);
  fx.pillar(hero.pos, 2, 14, 0xd9b0ff, 0.6);
  popup(hero.pos, 2.6, '夠了！！', 'shout');
  game.hitstop = 0.12;
  say('burst', true);
}

function revert() {
  setForm(hero.base);
  hero.mode = null;
  hero.courage = 0;
  hero.qi *= 0.5;
  hero.readySaid = false;
  hero.state = 'free';
  fx.ring(hero.pos, 0.5, 2.5, 0xffffff, 0.3);
  say('revert', true);
}

// ---------- 怪物 ----------

// 小怪腳下的假陰影：全部共用同一份幾何與材質
const BLOB_GEO = new THREE.CircleGeometry(1, 16);
const BLOB_MAT = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28, depthWrite: false });

function spawnEnemy(kind, at, delay = 0) {
  const def = ENEMIES[kind] || BOSSES[kind];
  const visual = createVisual(def.vis || kind, !!def.boss); // 只有守關者投射即時陰影
  if (!def.boss) {
    const blob = new THREE.Mesh(BLOB_GEO, BLOB_MAT);
    blob.rotation.x = -Math.PI / 2;
    blob.position.y = 0.03;
    blob.scale.setScalar(def.radius * 1.5);
    visual.root.add(blob);
  }
  const pos = at ? at.clone() : new THREE.Vector3();
  if (!at) {
    const a = rand(0, Math.PI * 2);
    const r = rand(13, ARENA_RADIUS - 2);
    pos.set(Math.cos(a) * r, 0, Math.sin(a) * r);
    if (dist2d(pos, hero.pos) < 8) pos.multiplyScalar(-1); // 不要生在主角臉上
    if (def.boss) pos.set(rand(-3, 3), 0, -7);
  }
  clampArena(pos, def.radius);
  visual.root.position.copy(pos);
  visual.root.visible = false;
  scene.add(visual.root);
  let bar = null;
  if (def.bar) {
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
    shield: !!def.incubus, broken: new Set(), phase: 0 };
  enemies.push(e);
  return e;
}

function nextWave() {
  game.wave++;
  const wave = stage().waves[game.wave];
  banner(`第 ${game.wave + 1} 波`);
  let i = 0;
  // 低畫質時同場的小怪少一些
  for (const [kind, n] of Object.entries(wave)) for (let k = 0; k < Math.max(1, Math.round(n * Q().crowd)); k++) spawnEnemy(kind, null, (i++) * 0.08);
}

function spawnBoss() {
  game.bossSpawned = true;
  const key = stage().boss;
  const kinds = BOSS_GROUPS[key] || [key];
  for (const k of kinds) spawnEnemy(k);
  const names = kinds.map((k) => BOSSES[k].name).join('＋');
  banner('心魔來襲');
  $('boss-bar').hidden = false;
  $('boss-name').textContent = names;
  $('quest-wave').textContent = `打倒${names}`;
  const own = `bgm_stage_${stage().id.replace('-', '_')}`;
  if (!audio.tracks[own] || stage().waves.length) audio.playBgm('bgm_boss');
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
  const dmg = Math.round(amount * rand(0.9, 1.1) * stats().hurtMult * (game.easy ? 0.75 : 1));
  hero.hp -= dmg;
  hero.invuln = 0.4;
  hero.visual.flash();
  popup(hero.pos, 2.2, `-${dmg}`, 'hurt');
  game.shake = Math.max(game.shake, 0.25);
  audio.sfx('hurt');
  game.combo = 0;
  if (hero.form !== 'brave') addCourage(GAUGE.courageHurt);
  hero.guilt += (dmg / hero.maxHp) * 100 * GAUGE.guiltPerHpPct + (opts.guilt || 0);
  if (game.final) hero.guilt = 0; // 終章最後一段不再累積罪惡感
  // 上班族被打會自動回話，取代學生時的「沒關係」
  if (hero.form === 'worker') popup(hero.pos, 2.9, ['好的。', '收到。', '沒問題。'][Math.floor(Math.random() * 3)], 'guard');
  hero.hurtStreak++; hero.hurtStreakT = 3;
  if (hero.hurtStreak >= 3) { say('hurt3'); hero.hurtStreak = 0; }
  else if (hero.guilt >= hero.guiltMax * GAUGE.guiltHesitate && hero.guilt < hero.guiltMax) say('guilt');

  if (hero.hp <= 0) {
    if (hero.form === 'brave') { endTransformIfDead(); return; }
    if (!hero.usedClutch && canTransform() && hero.guilt >= hero.guiltMax * GAUGE.clutchAt) {
      // 保險一：不甘心
      hero.usedClutch = true;
      hero.hp = 1;
      guiltBurst();
      say('clutch', true);
      return;
    }
    if (!hero.usedRevive) {
      // 保險二：小天使的鼓勵
      hero.usedRevive = true;
      hero.hp = hero.maxHp * GAUGE.reviveHp;
      hero.invuln = 2;
      fx.ring(hero.pos, 0.5, 7, 0xf48fc6, 0.5);
      fx.pillar(hero.pos, 1.2, 10, 0xffc4e3, 0.6);
      areaStrike(hero.pos, 6, 0.2, { kb: 14, launch: 4 });
      say('revive', true);
      audio.sfx('skill');
      return;
    }
    hero.state = 'dead';
    hero.t = 0;
    hero.visual.play('die', 1.0);
    endGame(false);
    return;
  }
  if (hero.guilt >= hero.guiltMax) guiltBurst();
}

// 回傳 { hit, killed, crit }
function damageEnemy(e, mult, o = {}) {
  if (!alive(e) || e.fly) return null;
  if (e.untouchable) return { killed: false, crit: false }; // 終章最後一段：打不到，但出手仍然算數
  if (e.shield) {
    // 夢魘超人只會擋：要用三個小招各破一次
    if (['skill1', 'skill2', 'skill3'].includes(o.src) && !e.broken.has(o.src)) {
      e.broken.add(o.src);
      popup(e.pos, e.def.height + 0.6, `破防 ${e.broken.size}/3`, 'good');
      fx.ring(e.pos, 0.5, 4, 0x9be564, 0.4);
      if (e.broken.size >= 3) { e.shield = false; popup(e.pos, e.def.height + 1.2, '……有點痛。', 'shout'); game.shake = 0.6; }
    } else if (e.lineT <= 0) { e.lineT = 1.5; popup(e.pos, e.def.height + 0.4, '何必呢。', 'guard'); }
    return { killed: false, crit: false };
  }
  const crit = Math.random() < HERO.critRate;
  let dmg = stats().atk * mult * rand(0.9, 1.1) * (crit ? HERO.critMult : 1);
  const guarded = e.def.armored && e.y === 0 && e.stun <= 0 && (e.state === 'chase' || e.state === 'spawn');
  if (e.def.incubus && !game.final && e.hp - dmg < e.maxHp * 0.3) dmg = Math.max(0, e.hp - e.maxHp * 0.3 + 1); // 不會被直接打死，要進入最後一段
  if (guarded) dmg *= 0.35; // 假森：平常打不動，出手後或被打飛時才打得痛
  dmg = Math.round(dmg);
  e.hp -= dmg;
  e.visual.flash();
  popup(e.pos, e.def.height + e.y, guarded ? `擋 ${dmg}` : `-${dmg}`, guarded ? 'guard' : crit ? 'crit' : '');
  const from = o.from || hero.pos;
  tmp.set(e.pos.x - from.x, 0, e.pos.z - from.z);
  if (tmp.lengthSq() < 0.01) tmp.set(rand(-1, 1), 0, rand(-1, 1));
  tmp.normalize();
  if (!e.def.boss) {
    e.vel.addScaledVector(tmp, o.kb || 0);
    if (o.launch && !guarded) e.vy = Math.max(e.vy, o.launch);
    if (o.stun) e.stun = Math.max(e.stun, o.stun);
  }
  const killed = e.hp <= 0;
  if (killed) {
    e.state = 'dead';
    e.t = 0;
    e.visual.play('die', 0.8);
    if (e.bar) e.bar.remove();
    game.kills++;
    if (!e.def.boss) { e.vel.addScaledVector(tmp, 6); e.vy = Math.max(e.vy, 6 + (o.launch || 0) * 0.5); } // 被打倒的怪飛出去
    else { fx.ring(e.pos, 1, 14, 0xffb347, 0.9); fx.burst(e.pos, 0xffb347, 50, 13, 2, 0.4); game.shake = 0.9; audio.sfx('boom'); }
  } else if (!e.def.boss && !guarded && e.state !== 'spawn') {
    e.state = 'stagger';
    e.t = 0;
    e.visual.play(e.stun > 0 ? 'stun' : 'hit', 0.25);
  }
  return { killed, crit };
}

function tally(results, heavy) {
  const hits = results.filter(Boolean);
  if (!hits.length) return 0;
  const killed = hits.filter((r) => r.killed).length;
  const crit = hits.some((r) => r.crit);
  onHit(hits.length, killed);
  game.hitstop = Math.max(game.hitstop, heavy || crit ? 0.07 : 0.035);
  game.shake = Math.max(game.shake, heavy ? 0.4 : 0.15);
  audio.sfx(heavy || crit ? 'crit' : 'hit');
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
    const t = THREE.MathUtils.clamp(((e.pos.x - a.x) * dx + (e.pos.z - a.z) * dz) / len2, 0, 1);
    const px = a.x + dx * t, pz = a.z + dz * t;
    if (Math.hypot(e.pos.x - px, e.pos.z - pz) > width / 2 + e.def.radius) continue;
    if (skip) skip.add(e);
    res.push(damageEnemy(e, mult, { from: a, ...o }));
  }
  return tally(res, o.heavy);
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
  fx.ring(pos, 1, r, 0xff8a3d, 0.5);
  fx.burst(pos, 0xffb347, 26, 10, 0.4, 0.3);
  game.shake = Math.max(game.shake, 0.6);
  audio.sfx('boom');
}
function hostileShot(from, yaw, o = {}) {
  const r = o.radius || 0.3;
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), new THREE.MeshBasicMaterial({ color: o.color || 0xff5a4f }));
  mesh.position.set(from.x, 1.2, from.z);
  scene.add(mesh);
  shots.push({ mesh, vel: forward(yaw).multiplyScalar(o.speed || 11), life: o.life || 2.4, radius: r + 0.3, dmg: o.dmg || 80, hostile: true, pan: o.pan, silence: o.silence });
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
const MOVES = {
  slam: { range: 5, cd: 3,
    start(e) { e.aim = e.pos.clone(); e.visual.play('attack', 0.95 / 0.6); fx.telegraph(e.aim, 5.5, 0.95); },
    update(e) { if (e.cast.t < 0.95) return false; boomAt(e.aim, 6.5); if (dist2d(hero.pos, e.aim) < 5.5 + HERO.radius) hurtHero(e.def.dmg); return true; } },
  charge: { minRange: 6, cd: 7,
    start(e, dx, dz, d) { e.chargeDir = new THREE.Vector3(dx / d, 0, dz / d); e.struck = false; e.visual.play('attack', 0.7); fx.ring(e.pos, 1, 4, 0xff3b30, 0.6); },
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
    start(e) { bossLine(e); banner('心魔召喚爪牙'); for (let i = 0; i < (e.def.minionN || 7); i++) spawnEnemy(e.def.minion, new THREE.Vector3(e.pos.x + rand(-5, 5), 0, e.pos.z + rand(-5, 5)), i * 0.06); },
    update: (e) => e.cast.t > 0.5 },
  fan: { range: 7, cd: 3.5,   // 錢大姐的紙扇：把人扇回場邊
    start(e) { e.visual.play('attack', 1); fx.telegraph(e.pos, 7, 0.6, 0xf4c542); bossLine(e); },
    update(e, dt, d) {
      if (e.cast.t < 0.6) return false;
      fx.slash(e.pos, e.yaw, 7.5, 2.4, 0xffffff, 1, 1.2);
      if (d < 7.5 && hero.invuln <= 0) { hurtHero(70); knockHero(e.pos, 22); }
      return true;
    } },
  whistle: { cd: 6,           // 藍教頭吹哨：站著不動就是罰站
    start(e) { bossLine(e); fx.telegraph(e.pos, 10, 1.0, 0x3a6fd0); audio.sfx('skill'); },
    update(e, dt, d) {
      if (e.cast.t < 1.0) return false;
      fx.ring(e.pos, 1, 10, 0x9fd4ff, 0.4);
      if (d < 10 && hero.movingT > 0.2 && stunHero(1.3, '罰站！')) hurtHero(90);
      return true;
    } },
  spread: { minRange: 4, cd: 5,
    start(e) { bossLine(e); e.visual.play('attack', 0.5 / 0.6); },
    update(e) { if (e.cast.t < 0.5) return false; for (let i = -2; i <= 2; i++) hostileShot(e.pos, e.yaw + i * 0.25, { dmg: 80, speed: 12, color: 0xf2efe0 }); audio.sfx('shoot'); return true; } },
  mDash: { minRange: 4, cd: 4, // 鏡像的勇氣衝拳
    start(e, dx, dz, d) { e.chargeDir = new THREE.Vector3(dx / d, 0, dz / d); e.struck = false; e.visual.play('skill1', 0.9); fx.trail(e.pos, e.pos.clone().addScaledVector(e.chargeDir, 11), 3, 0xb06cff, 0.55); },
    update(e, dt, d) {
      const t = e.cast.t;
      if (t > 0.5 && t < 0.72) {
        e.pos.addScaledVector(e.chargeDir, (11 / 0.22) * dt);
        if (!e.struck && d < 2.2) { e.struck = true; hurtHero(140); knockHero(e.pos, 8); }
      }
      return t >= 0.95;
    } },
  mKi: { minRange: 5, cd: 5,   // 鏡像的氣功彈
    start(e) { e.visual.play('skill2', 0.7); },
    update(e) { if (e.cast.t < 0.5) return false; hostileShot(e.pos, e.yaw, { dmg: 150, speed: 13, radius: 1.3, color: 0xb06cff, life: 2.6 }); audio.sfx('shoot'); return true; } },
  mQuake: { range: 6.5, cd: 6, // 鏡像的氣功震地
    start(e) { e.aim = e.pos.clone(); e.visual.play('skill3', 0.9); fx.telegraph(e.aim, 7, 0.8, 0xb06cff); },
    update(e) { if (e.cast.t < 0.8) return false; boomAt(e.aim, 8); fx.dome(e.aim, 7, 0xb06cff, 0.5); if (dist2d(hero.pos, e.aim) < 7.5) hurtHero(180); return true; } },
  guiltTalk: { cd: 5,          // 情勒：不扣血，但罪惡感會漲
    start(e) { bossLine(e); if (hero.state !== 'transforming' && !game.final) { hero.guilt += 8; if (hero.guilt >= hero.guiltMax) guiltBurst(); } },
    update: (e) => e.cast.t > 0.7 },
  firePools: { cd: 9,          // 寫著難聽話的黑火
    start(e) { bossLine(e); for (let i = 0; i < 5; i++) { const a = rand(0, 6.28), r = i === 0 ? 0 : rand(2, 7); addHazard('fire', tmp.set(hero.pos.x + Math.cos(a) * r, 0, hero.pos.z + Math.sin(a) * r), 2.4, 0.9, 5); } },
    update: (e) => e.cast.t > 0.5 },
  heal: { cd: 16, cond: (e) => e.hp < e.maxHp * 0.6, // 「會後再討論」：沒被打斷就回血
    start(e) { popup(e.pos, e.def.height + 0.5, '這個我們會後再討論！', 'shout'); e.cast.hp0 = e.hp; fx.telegraph(e.pos, 3, 2.2, 0x5fe07a); },
    update(e) {
      if (e.cast.hp0 - e.hp > e.maxHp * 0.03) { popup(e.pos, e.def.height + 0.5, '（被打斷了）', 'good'); e.stun = 1.2; return true; }
      if (e.cast.t < 2.2) return false;
      e.hp = Math.min(e.maxHp, e.hp + e.maxHp * 0.12);
      popup(e.pos, e.def.height + 0.5, '回血', 'good');
      return true;
    } },
  meeting: { cd: 9,            // 「會議中」：站在裡面什麼都不會發生，只有勇氣一直掉
    start(e) { bossLine(e, hazards.length % 2); addHazard('meeting', hero.pos, 6, 0.8, 7); },
    update: (e) => e.cast.t > 0.5 },
  breath: { range: 13, cd: 5,  // 幹譙龍用噴的
    start(e) { bossLine(e); e.cast.n = 0; e.cast.yaw0 = e.yaw; e.visual.play('attack', 1.9); },
    update(e) {
      const t = e.cast.t;
      while (e.cast.n < 12 && t >= 0.5 + e.cast.n * 0.1) {
        hostileShot(e.pos, e.cast.yaw0 - 0.6 + e.cast.n * 0.11, { dmg: 70, speed: 13, radius: 0.5, color: 0x9cc7f0, silence: 2 });
        e.cast.n++;
      }
      return t >= 1.9;
    } },
  dive: { cd: 8,               // 冠老闆飛起來打不到，俯衝落地後才有空檔
    start(e) { bossLine(e); e.fly = true; e.aim = null; },
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
    start(e) { bossLine(e, 3); for (let i = 0; i < 3; i++) { const a = rand(0, 6.28); addHazard('pie', tmp.set(hero.pos.x + Math.cos(a) * rand(3, 7), 0, hero.pos.z + Math.sin(a) * rand(3, 7)), 1.2, 0, 9); } },
    update: (e) => e.cast.t > 0.4 },
  copy: { minRange: 4, cd: 4.5, // 新雞模仿主角的氣功彈
    start(e) { bossLine(e, 0); e.visual.play('attack', 0.8); },
    update(e) { if (e.cast.t < 0.5) return false; hostileShot(e.pos, e.yaw, { dmg: 90, speed: 14, radius: 0.9, color: 0x9be564 }); audio.sfx('shoot'); return true; } },
  gossip: { cd: 8,             // 八卦蛇咬耳朵：其他敵人加速
    start(e) { bossLine(e); fx.ring(e.pos, 1, 12, 0xff9a3c, 0.6); for (const x of enemies) if (x !== e && alive(x)) x.haste = 5; e.visual.play('attack', 0.6); },
    update: (e) => e.cast.t > 0.6 },
};

// 守關者決定下一招。回傳 true 表示開始出招
function bossThink(e, d, dx, dz) {
  if (e.cool > 0 || hero.state === 'dead') return false;
  let pool = e.def.moves;
  if (e.shield) pool = ['guiltTalk'];                 // 夢魘第一段只會擋和講話
  if (e.untouchable) pool = hero.courage >= GAUGE.courageMax ? [] : ['mDash', 'mQuake']; // 最後一段給玩家閃的機會
  const options = pool.filter((m) => {
    const M = MOVES[m];
    return (e.cds[m] || 0) <= 0 && (M.range === undefined || d <= M.range) && (M.minRange === undefined || d >= M.minRange) && (!M.cond || M.cond(e));
  });
  if (!options.length) return false;
  const name = options[Math.floor(Math.random() * options.length)];
  e.cds[name] = MOVES[name].cd * (e.untouchable ? 1.6 : 1);
  e.state = 'cast';
  e.cast = { name, t: 0 };
  MOVES[name].start(e, dx, dz, d);
  return true;
}

// 終章最後一段：把主角打回平常型態，兩種變身都封住；他不再能被打，只能靠閃避撐到勇氣滿，然後走上前
function startFinalPhase(e) {
  game.final = true;
  e.untouchable = true;
  e.cast = null; e.state = 'chase'; e.cool = 2.5;
  if (beam) endUlt();
  if (hero.form === 'brave') revert();
  hero.courage = 0; hero.guilt = 0; hero.readySaid = false;
  hazards.forEach((h) => { h.life = 0; });
  banner('沒有超能力的時候');
  popup(e.pos, e.def.height + 0.6, '這次沒有這個。', 'shout');
  fx.ring(e.pos, 1, 16, 0x2e8b2e, 0.8);
  game.shake = 0.7;
}

function updateEnemy(e, dt, attackers) {
  e.t += dt;
  e.visual.update(dt);
  const def = e.def;
  if (e.lineT > 0) e.lineT -= dt;
  for (const k of Object.keys(e.cds)) e.cds[k] -= dt;

  if (e.state === 'spawn') {
    if (e.t < 0) return;
    if (!e.shown) { e.shown = true; e.visual.root.visible = true; fx.ring(e.pos, 0.3, def.radius * 3, 0xb48cff, 0.4); }
    e.visual.root.scale.setScalar(Math.min(1, e.t / 0.35));
    if (e.t > 0.45) { e.state = 'chase'; e.t = 0; }
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
  clampArena(e.pos, def.radius);
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
    if (def.incubus && !game.final && !e.shield && e.hp <= e.maxHp * 0.3 + 2) startFinalPhase(e);
    if (e.state === 'cast') {
      e.cast.t += dt;
      if (MOVES[e.cast.name].update(e, dt, d)) { e.cast = null; e.state = 'recover'; e.t = 0; e.visual.play('idle'); }
      return;
    }
    if (e.state === 'recover') { if (e.t >= def.recover * (def.enrage ? 0.4 + 0.6 * e.hp / e.maxHp : 1)) { e.state = 'chase'; e.t = 0; e.cool = rand(0.3, 0.9); } return; }
    e.state = 'chase';
    e.cool -= dt;
    e.yaw = Math.atan2(dx, dz);
    if (e.untouchable && hero.courage >= GAUGE.courageMax) {
      // 等主角走上前
      e.visual.play('idle');
      if (d < 3.2 && game.phase === 'playing') { e.hp = 0; e.state = 'dead'; e.t = 0; e.visual.play('die', 0.9); fx.pillar(e.pos, 2, 14, 0xffffff, 0.9); fx.ring(e.pos, 1, 12, 0x9be564, 0.9); }
      return;
    }
    if (heroAlive && bossThink(e, d, dx, dz)) return;
    if (d > Math.max(2.2, def.radius + 1.6)) {
      e.pos.x += (dx / d) * speed * dt;
      e.pos.z += (dz / d) * speed * dt;
      e.visual.play('run');
    } else e.visual.play('idle');
    return;
  }

  if (e.state === 'stagger') {
    if (e.t > 0.3) { e.state = 'chase'; e.t = 0; }
  } else if (e.state === 'chase') {
    e.cool -= dt;
    e.yaw = Math.atan2(dx, dz);
    const canAttack = def.ranged ? attackers.ranged < 2 : attackers.melee < MAX_ATTACKERS;
    if (heroAlive && d <= def.reach && e.cool <= 0 && canAttack) {
      e.state = 'windup'; e.t = 0; e.struck = false;
      if (def.ranged) attackers.ranged++; else attackers.melee++;
      e.visual.play('attack', def.windup / 0.6);
    } else if (def.ranged) {
      // 遠程：保持距離
      const want = d > 11 ? 1 : d < 6 ? -1 : 0;
      e.pos.x += (dx / d) * speed * want * dt;
      e.pos.z += (dz / d) * speed * want * dt;
      e.visual.play(want ? 'run' : 'idle');
    } else if (d > def.reach * 0.8) {
      e.pos.x += (dx / d) * speed * dt;
      e.pos.z += (dz / d) * speed * dt;
      e.visual.play('run');
    } else {
      e.visual.play('idle');
    }
  } else if (e.state === 'windup') {
    if (!e.struck && e.t >= def.windup) {
      e.struck = true;
      if (def.ranged) {
        // 假忙森丟的是鍋：被砸到要揹著走（緩速）
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
  if (!game.rules.junxiong || game.caught >= 3) return;
  if (!ambush) {
    game.ambushT -= dt;
    if (game.ambushT > 0 || !enemies.some(alive)) return;
    const a = rand(0, 6.28), r = rand(3.5, 6);
    const pos = new THREE.Vector3(hero.pos.x + Math.cos(a) * r, 0, hero.pos.z + Math.sin(a) * r);
    clampArena(pos, 1);
    const visual = createVisual('junxiong');
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
      a.done = true; a.t = 0; a.caught = true;
      game.caught++;
      addCourage(15);
      popup(a.pos, 1.8, '你怎麼知道我在這裡啦～～', 'good');
      say('caught');
    } else if (a.t >= a.warn) {
      a.done = true; a.t = 0;
      a.visual.root.position.y = 0;
      popup(a.pos, 2.2, '蛤～～～', 'shout');
      fx.ring(a.pos, 0.5, 4.5, 0x4a4458, 0.5);
      if (d < 4.5 && stunHero(0.8, '嚇！')) { hero.courage = Math.max(0, hero.courage - 10); hero.guilt += 6; say('scared'); }
    }
  } else {
    if (a.caught) a.visual.root.position.y = Math.max(-1.2, a.visual.root.position.y - dt * 2);
    if (a.t > 0.9) { scene.remove(a.visual.root); a.visual.dispose(); ambush = null; game.ambushT = rand(9, 14); }
  }
}

// 怪物之間、怪物與主角互推，避免疊成一團
function separate() {
  for (let i = 0; i < enemies.length; i++) {
    const a = enemies[i];
    if (!alive(a) || a.y > 0) continue;
    for (let j = i + 1; j < enemies.length; j++) {
      const b = enemies[j];
      if (!alive(b) || b.y > 0) continue;
      const dx = b.pos.x - a.pos.x, dz = b.pos.z - a.pos.z;
      const min = a.def.radius + b.def.radius;
      if (Math.abs(dx) > min || Math.abs(dz) > min) continue;
      const d = Math.hypot(dx, dz) || 0.001;
      if (d < min) {
        const push = (min - d) / 2;
        const wa = a.def.boss ? 0 : 1, wb = b.def.boss ? 0 : 1;
        a.pos.x -= (dx / d) * push * wa; a.pos.z -= (dz / d) * push * wa;
        b.pos.x += (dx / d) * push * wb; b.pos.z += (dz / d) * push * wb;
      }
    }
    const dx = hero.pos.x - a.pos.x, dz = hero.pos.z - a.pos.z;
    const d = Math.hypot(dx, dz) || 0.001, min = a.def.radius + HERO.radius;
    if (d < min && hero.state !== 'dodge' && hero.state !== 'skill1') { hero.pos.x += (dx / d) * (min - d); hero.pos.z += (dz / d) * (min - d); }
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

function faceForAction(mv, autoRange = 9) {
  if (mv.len > 0) { hero.yaw = Math.atan2(mv.x, mv.y); return; }
  const target = nearestEnemy(autoRange); // 沒推搖桿時自動朝向最近的怪
  if (target) hero.yaw = Math.atan2(target.pos.x - hero.pos.x, target.pos.z - hero.pos.z);
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
  faceForAction(mv, 6);
  const c = COMBO[hero.form === 'brave' ? 'brave' : 'student'][index];
  hero.state = 'attack'; hero.t = 0; hero.combo = index; hero.queued = false; hero.hitDone = false;
  hero.visual.play(c.anim, c.dur);
  audio.sfx('swing');
}

function startDodge(mv) {
  if ((hero.cds.dodge || 0) > 0) return;
  const f = stats();
  hero.cds.dodge = f.dodgeCd;
  if (mv.len > 0) hero.yaw = Math.atan2(mv.x, mv.y);
  const perfect = threatNear();
  hero.state = 'dodge'; hero.t = 0;
  hero.invuln = Math.max(hero.invuln, f.dodgeInvuln);
  hero.visual.play('dodge', 0.28);
  audio.sfx('dodge');
  if (perfect) {
    addCourage(GAUGE.couragePerfect);
    addQi(GAUGE.qiPerfect);
    popup(hero.pos, 2.4, '完美閃避', 'good');
    fx.ring(hero.pos, 0.4, 2.6, 0x9be564, 0.3);
    say('perfect');
  } else if (nearestEnemy(5)) {
    addCourage(GAUGE.courageDodge);
  }
}

function startSkill(name, mv) {
  if (!game.abilities.has(name)) { say('locked'); return; }
  if (hero.form !== 'brave') { say('noSkill'); return; }
  if (hero.silenceT > 0) { popup(hero.pos, 2.6, '（被噴到說不出話）', 'guard'); return; }
  const def = SKILLS[name];
  if (name === 'ult') { if (hero.qi < GAUGE.qiMax) return; hero.qi = 0; }
  else { if ((hero.cds[name] || 0) > 0) return; hero.cds[name] = def.cd; }
  faceForAction(mv, 12);
  hero.state = name; hero.t = 0; hero.data = { step: 0, hitSet: new Set(), from: hero.pos.clone(), tick: 0 };
  hero.visual.play(name, def.dur);
  audio.sfx('skill');
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
    popup(hero.pos, 2.8, '超勇氣波！', 'shout');
    game.shake = 0.5;
    say('ult');
  }
}

function endUlt() {
  if (beam) { scene.remove(beam); beam.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); beam = null; }
}

function updateHero(dt) {
  hero.t += dt;
  hero.invuln = Math.max(0, hero.invuln - dt);
  for (const k of Object.keys(hero.cds)) hero.cds[k] = Math.max(0, hero.cds[k] - dt);
  if (hero.hurtStreakT > 0) { hero.hurtStreakT -= dt; if (hero.hurtStreakT <= 0) hero.hurtStreak = 0; }
  hero.visual.update(dt);
  if (hero.state === 'dead') return;

  // 擊退、定身、緩速、封招
  hero.pos.addScaledVector(hero.kb, dt);
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
    if (hero.mode === 'burst') hero.burstT -= dt; else hero.courage -= GAUGE.courageDrain * dt;
    const over = hero.mode === 'burst' ? hero.burstT <= 0 : hero.courage <= 0;
    if (over && hero.state === 'free') { revert(); return; }
  } else if (enemies.some(alive)) {
    hero.farT = nearestEnemy(GAUGE.courageFarDist) ? 0 : hero.farT + dt;
    if (hero.farT > GAUGE.courageFarDelay) { addCourage(-GAUGE.courageFarDrain * dt); say('far'); }
  }

  const mv = input.move();
  const actions = input.takeActions();
  if (input.held.has('attack') && !actions.includes('attack')) actions.push('attack'); // 按住連打
  const speed = stats().speed * (hero.slowT > 0 ? 0.55 : 1); // 揹鍋時變慢
  hero.movingT = mv.len > 0 ? 0 : hero.movingT + dt;
  const combo = COMBO[hero.form === 'brave' ? 'brave' : 'student'];

  const act = (a) => {
    if (a === 'attack') startAttack((hero.combo + 1) % combo.length, mv);
    else if (a === 'dodge') startDodge(mv);
    else if (a === 'transform') {
      if (hero.form !== 'brave' && canTransform() && hero.courage >= GAUGE.courageMax) {
        hero.state = 'transforming'; hero.t = 0;
        hero.visual.play('transform');
        hero.visual.glow(true, 0xfff7c2);
        audio.sfx('skill');
        if (!save.seenTransform) {
          // 全遊戲只播一次的完整變身演出（企劃書 4.6）
          save.seenTransform = true; writeSave();
          audio.playBgm('bgm_transform');
          runDialog(FIRST_TRANSFORM, () => {
            const key = `bgm_stage_${stage().id.replace('-', '_')}`;
            audio.playBgm(audio.tracks[key] ? key : 'bgm_battle');
            hero.t = GAUGE.transformMax;
          }, 'stars');
        }
      } else if (!canTransform() && hero.form !== 'brave') popup(hero.pos, 2.6, stage().map === 3 ? '（圍巾是灰的）' : '（還不會變身）', 'guard');
    } else startSkill(a, mv);
  };

  if (hero.state === 'free') {
    hero.comboGap += dt;
    if (hero.comboGap > 0.6) hero.combo = -1;
    if (mv.len > 0) {
      hero.pos.x += mv.x * speed * dt;
      hero.pos.z += mv.y * speed * dt;
      hero.yaw = Math.atan2(mv.x, mv.y);
      hero.visual.play('run');
    } else {
      hero.visual.play('idle');
    }
    for (const a of actions) { if (hero.state !== 'free') break; act(a); }
  } else if (hero.state === 'transforming') {
    // 可按住拖延 1–3 秒，全程無敵；拖越久衝擊波越強
    hero.invuln = Math.max(hero.invuln, 0.2);
    if (Math.floor(hero.t * 6) !== Math.floor((hero.t - dt) * 6)) fx.ring(hero.pos, 3 + hero.t, 0.6, 0xfff7c2, 0.3);
    const holding = input.held.has('transform');
    if ((hero.t >= GAUGE.transformMin && !holding) || hero.t >= GAUGE.transformMax) finishTransform();
  } else if (hero.state === 'attack') {
    const c = combo[hero.combo];
    if (hero.t < c.hitAt) hero.pos.addScaledVector(forward(hero.yaw), (c.lunge / c.hitAt) * dt);
    if (!hero.hitDone && hero.t >= c.hitAt) {
      hero.hitDone = true;
      const brave = hero.form === 'brave';
      if (brave) fx.slash(hero.pos, hero.yaw, c.range, Math.min(c.arc, Math.PI * 2), c.heavy ? 0xfff0b0 : 0xffe9a8, hero.combo === 1 ? -1 : 1, 1.0);
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
    hero.pos.addScaledVector(forward(hero.yaw), 17 * dt);
    if (hero.t >= 0.28) hero.state = 'free';
  } else if (hero.state === 'skill1') {
    // 勇氣衝拳：長距離突進，路徑上的怪全部打飛
    const s = SKILLS.skill1;
    const before = hero.pos.clone();
    if (hero.t < 0.24) hero.pos.addScaledVector(forward(hero.yaw), (s.dash / 0.24) * dt);
    clampArena(hero.pos, HERO.radius);
    lineStrike(before, hero.pos, s.width, s.mult, { kb: s.kb, launch: s.launch, heavy: true, src: 'skill1' }, hero.data.hitSet);
    if (hero.data.step === 0 && hero.t >= 0.24) {
      hero.data.step = 1;
      fx.trail(hero.data.from, hero.pos, s.width, 0xffe08a, 0.35);
      fx.ring(hero.pos, 0.5, 4, 0xffe08a, 0.3);
      areaStrike(hero.pos, 3.5, 1.2, { kb: 8, launch: 5 });
      game.shake = Math.max(game.shake, 0.4);
    }
    if (hero.t >= s.dur) hero.state = 'free';
  } else if (hero.state === 'skill2') {
    // 氣功彈：大顆、貫穿、飛到底會爆
    const s = SKILLS.skill2;
    if (hero.data.step === 0 && hero.t >= 0.14) {
      hero.data.step = 1;
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.SphereGeometry(s.radius, 18, 14), new THREE.MeshBasicMaterial({ color: 0x9be564, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false })));
      g.add(new THREE.Mesh(new THREE.SphereGeometry(s.radius * 0.5, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffffff })));
      g.position.set(hero.pos.x, 1.2, hero.pos.z).addScaledVector(forward(hero.yaw), 1.2);
      scene.add(g);
      shots.push({ mesh: g, vel: forward(hero.yaw).multiplyScalar(s.speed), life: s.life, radius: s.radius, mult: s.mult, hostile: false, hitSet: new Set(), blast: s.blast, blastMult: s.blastMult, src: 'skill2' });
      fx.ring(hero.pos, 0.5, 3, 0x9be564, 0.25);
      audio.sfx('swing');
    }
    if (hero.t >= s.dur) hero.state = 'free';
  } else if (hero.state === 'skill3') {
    // 氣功震地：大範圍把怪震飛並暈眩，外圈再一波餘震
    const s = SKILLS.skill3;
    if (hero.data.step === 0 && hero.t >= 0.26) {
      hero.data.step = 1;
      fx.dome(hero.pos, s.radius, 0xffe08a, 0.5);
      fx.ring(hero.pos, 1, s.radius, 0xfff0b0, 0.45);
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
    if (mv.len > 0) {
      const want = Math.atan2(mv.x, mv.y);
      let diff = ((want - hero.yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      hero.yaw += THREE.MathUtils.clamp(diff, -s.turn * dt, s.turn * dt);
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
    if (hero.data.tick <= 0 && k < 0.92) {
      hero.data.tick = s.tick;
      const a = hero.pos.clone().addScaledVector(f, 1);
      const b = hero.pos.clone().addScaledVector(f, s.length);
      lineStrike(a, b, s.width, s.mult, { kb: 9, launch: 4, from: hero.pos });
      game.shake = Math.max(game.shake, 0.3);
    }
    if (hero.t >= s.dur) {
      endUlt();
      const end = hero.pos.clone().addScaledVector(f, s.length * 0.5);
      areaStrike(end, s.endRadius, s.endMult, { kb: 12, launch: 10, heavy: true });
      fx.dome(end, s.endRadius, 0xc8ff8a, 0.5);
      hero.state = 'free';
    }
  }

  clampArena(hero.pos, HERO.radius);
}

// ---------- 飛行物 ----------

function updateShots(dt) {
  for (const s of shots) {
    s.life -= dt;
    s.mesh.position.addScaledVector(s.vel, dt);
    const out = Math.hypot(s.mesh.position.x, s.mesh.position.z) > ARENA_RADIUS + 3;
    if (s.hostile) {
      if (dist2d(s.mesh.position, hero.pos) < s.radius + HERO.radius && hero.invuln <= 0 && hero.state !== 'transforming') {
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
        fx.dome(s.mesh.position, s.blast, 0x9be564, 0.4);
        fx.burst(s.mesh.position, 0x9be564, 24, 10, 1, 0.3);
        areaStrike(s.mesh.position, s.blast, s.blastMult, { kb: 10, launch: 8, heavy: true });
        s.life = 0;
      }
    }
    if (s.life <= 0 || out) {
      scene.remove(s.mesh);
      if (s.hostile) fx.burst(s.mesh.position, 0xff5a4f, 6, 3, s.mesh.position.y);
      s.gone = true;
    }
  }
  shots = shots.filter((s) => !s.gone);
}

// ---------- 流程 ----------

function showOverlay({ title, text, note, btn, next, easy }) {
  $('ov-logo').hidden = true;
  $('ov-title').hidden = false;
  $('overlay').classList.add('result');
  $('ov-title').textContent = title;
  $('ov-text').textContent = text;
  $('ov-load').textContent = note || '';
  $('ov-btn').textContent = btn;
  $('ov-btn').disabled = false;
  $('ov-next').hidden = !next;
  $('ov-easy').hidden = !easy;
  $('ov-menu').hidden = false;
  $('ov-stages').hidden = true;
  $('hud').hidden = true;
  $('overlay').hidden = false;
}

function endGame(win) {
  if (win) return clearStage();
  game.phase = 'ending';
  game.fails++;
  setTimeout(() => {
    game.phase = 'over';
    audio.playBgm(null);
    audio.sfx('lose');
    // 同一關連續失敗三次，小天使提議調簡單
    showOverlay({ title: '倒 下', text: `${stage().id}　${stage().name}`, note: '小天使：「起來。再一次。」', btn: '再來一次', easy: game.fails >= 3 && !game.easy });
  }, 1200);
}

function clearStage() {
  game.phase = 'ending';
  game.fails = 0;
  const st = stage();
  if (!save.cleared.includes(st.id)) { save.cleared.push(st.id); writeSave(); }
  if (hero.form === 'brave') revert();
  setTimeout(() => {
    audio.playBgm('bgm_victory');
    audio.sfx('win');
    runDialog(st.outro, () => {
      game.phase = 'over';
      const last = game.stage >= STAGES.length - 1;
      showOverlay({
        title: last ? '醒 來' : '突 破',
        text: last ? '他知道自己要往哪走了。' : `${st.id}　${st.name}　用時 ${game.time.toFixed(0)} 秒　擊倒 ${game.kills}`,
        note: last ? '小天使留下的便利貼：「還行。」' : st.grantName ? `得到：${st.grantName}` : '小天使：「還行。」',
        btn: '再打一次', next: !last,
      });
    });
  }, 1400);
}

function update(dt) {
  if (game.hitstop > 0) { game.hitstop -= dt; fx.update(dt * 0.2); return; } // 命中頓幀
  game.time += dt;
  if (game.comboT > 0) { game.comboT -= dt; if (game.comboT <= 0) game.combo = 0; }
  updateHero(dt);
  const attackers = { melee: 0, ranged: 0 };
  for (const e of enemies) if (e.state === 'windup' && !e.def.boss) { if (e.def.ranged) attackers.ranged++; else attackers.melee++; }
  for (const e of enemies) updateEnemy(e, dt, attackers);
  enemies = enemies.filter((e) => !e.gone);
  separate();
  updateShots(dt);
  updateHazards(dt);
  updateAmbush(dt);
  fx.update(dt);
  hero.visual.root.position.copy(hero.pos);
  hero.visual.root.rotation.y = hero.yaw;

  // 關卡流程：一波一波 →（中途事件）→ 守關者 → 過關
  if (game.phase === 'playing' && enemies.every((e) => e.state === 'dead')) {
    const st = stage();
    game.waveTimer -= dt;
    if (game.waveTimer > 0) return;
    game.waveTimer = 1.4;
    if (st.mid && !game.midDone && game.wave === st.mid.afterWave) {
      // 中途找回能力（地圖三）
      game.midDone = true;
      runDialog(st.mid.dialog, () => {
        st.mid.grant.split('+').forEach((g) => game.abilities.add(g));
        angel.visual.root.scale.setScalar(1);
        hero.readySaid = false;
        popup(hero.pos, 2.8, '可以變身了', 'good');
      });
    } else if (game.wave < st.waves.length - 1) {
      if (game.wave >= 0) say('wave');
      nextWave();
    } else if (st.boss && !game.bossSpawned) {
      runDialog(st.bossIntro, spawnBoss);
    } else if (enemies.length === 0) {
      clearStage();
    }
  }
}

function updateAngel(dt) {
  if (!angel.visual) return;
  tmp.set(hero.pos.x - 1.3, 0, hero.pos.z - 0.6);
  angel.pos.lerp(tmp, 1 - Math.exp(-4 * dt));
  angel.visual.root.position.set(angel.pos.x, 1.5, angel.pos.z);
  angel.visual.root.rotation.y = Math.atan2(hero.pos.x - angel.pos.x, hero.pos.z - angel.pos.z);
  angel.visual.update(dt);
  angel.quiet = Math.max(0, angel.quiet - dt);
  if (angel.sayT > 0) { angel.sayT -= dt; if (angel.sayT <= 0) $('angel-bubble').hidden = true; }
}

function updateCamera(dt) {
  camTarget.lerp(hero.pos, 1 - Math.exp(-8 * dt));
  camera.position.copy(camTarget).add(CAM_OFFSET);
  if (camera.aspect < 1) camera.position.addScaledVector(CAM_OFFSET, 0.25);
  if (game.shake > 0) {
    game.shake = Math.max(0, game.shake - dt * 2.2);
    const s = game.shake * game.shake * 1.2;
    camera.position.x += rand(-s, s);
    camera.position.y += rand(-s, s);
  }
  camera.lookAt(camTarget.x, 0.9, camTarget.z);
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

let last = performance.now();
function frame(now) {
  const rawDt = (now - last) / 1000;
  const dt = Math.min(0.05, rawDt);
  last = now;
  watchPerformance(rawDt);
  if (!game.paused && (game.phase === 'playing' || game.phase === 'ending')) { update(dt); updateAngel(dt); }
  else if (game.phase === 'dialog' && hero.visual) { hero.visual.update(dt); updateAngel(dt); fx.update(dt); }
  else if (hero.visual) { hero.visual.update(dt); updateAngel(dt); }
  updateCamera(dt);
  if (game.phase !== 'loading') updateHud();
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

// ---------- 啟動 ----------

async function boot() {
  let manifest = {};
  try {
    const url = new URLSearchParams(location.search).get('manifest') || 'assets/manifest.json';
    manifest = await (await fetch(url)).json();
  } catch (err) {
    console.warn('[manifest] 讀取失敗，全部使用佔位素材', err);
  }
  audio = new GameAudio(manifest);
  const models = Object.entries(manifest.models || {}).filter(([, cfg]) => cfg && cfg.url);
  const loaded = await Promise.all(models.map(([kind, cfg]) => loadModel(kind, cfg)));
  const ok = loaded.filter(Boolean).length;

  game.stage = firstOpenStage();
  game.abilities = abilitiesFor(game.stage);
  resetHero();
  camTarget.copy(hero.pos);
  game.phase = 'ready';
  $('ov-load').textContent = models.length ? `已載入模型 ${ok}/${models.length}，其餘使用佔位角色` : '目前全部使用佔位美術';
  $('btn-mute').classList.toggle('off', audio.muted);
  showMenu();
  window.__booted = true; // 讓 index.html 的載入逾時提示知道已經開好了
}

// ---------- 選關 ----------

const isOpen = (i) => unlockAll || i === 0 || save.cleared.includes(STAGES[i - 1].id);
function firstOpenStage() {
  for (let i = 0; i < STAGES.length; i++) if (!save.cleared.includes(STAGES[i].id)) return isOpen(i) ? i : Math.max(0, i - 1);
  return STAGES.length - 1;
}

function showMenu() {
  game.phase = 'ready';
  audio.playBgm(null);
  clearField();
  $('hud').hidden = true;
  $('dialog').hidden = true;
  $('overlay').classList.remove('result');
  $('ov-logo').hidden = false;
  $('ov-title').hidden = true;
  $('ov-next').hidden = true;
  $('ov-easy').hidden = true;
  $('ov-menu').hidden = true;
  $('ov-text').innerHTML = '搖桿／WASD 移動　J 出拳　Shift 閃避<br>勇氣滿了按空白鍵變身（可按住拖延）　K・L・I 小招　O 大招';
  const next = firstOpenStage();
  game.stage = next;
  $('ov-btn').textContent = save.cleared.length ? `繼續　${STAGES[next].id} ${STAGES[next].name}` : '開始';
  $('ov-btn').disabled = false;
  const box = $('ov-stages');
  box.replaceChildren();
  let group = null, map = 0;
  STAGES.forEach((st, i) => {
    if (st.map !== map) {
      map = st.map;
      const h = document.createElement('h4');
      h.textContent = MAP_NAMES[map];
      group = document.createElement('div');
      group.className = 'stage-row';
      box.append(h, group);
    }
    const b = document.createElement('button');
    b.className = 'stage';
    b.textContent = st.id;
    b.title = `${st.name}：${st.sub}`;
    b.disabled = !isOpen(i);
    b.classList.toggle('done', save.cleared.includes(st.id));
    b.classList.toggle('current', i === next);
    b.addEventListener('click', () => { audio.unlock(); audio.sfx('ui'); startStage(i); });
    group.append(b);
  });
  box.hidden = false;
  $('overlay').hidden = false;
}

$('ov-btn').addEventListener('click', () => { audio.unlock(); audio.sfx('ui'); startStage(game.stage); });
$('ov-next').addEventListener('click', () => { audio.unlock(); audio.sfx('ui'); startStage(Math.min(STAGES.length - 1, game.stage + 1)); });
$('ov-menu').addEventListener('click', () => { audio.sfx('ui'); showMenu(); });
$('ov-easy').addEventListener('click', () => { game.easy = true; game.fails = 0; audio.unlock(); audio.sfx('ui'); startStage(game.stage); });
$('btn-mute').addEventListener('click', () => { audio.setMuted(!audio.muted); $('btn-mute').classList.toggle('off', audio.muted); });
$('btn-pause').addEventListener('click', () => {
  if (game.phase !== 'playing') return;
  game.paused = !game.paused;
  $('btn-pause').classList.toggle('on', game.paused);
  if (game.paused) banner('暫停');
});
$('dialog').addEventListener('pointerdown', (e) => { e.preventDefault(); advanceDialog(e.target.id === 'dlg-skip'); });
addEventListener('keydown', (e) => {
  if (!dialog) return;
  if (['Space', 'Enter', 'KeyJ'].includes(e.code)) { e.preventDefault(); advanceDialog(); }
  else if (e.code === 'Escape') advanceDialog(true);
});
document.addEventListener('visibilitychange', () => { if (document.hidden && game.phase === 'playing') { game.paused = true; $('btn-pause').classList.add('on'); } });

// 供自動化測試與除錯讀取狀態
window.__game = { game, hero, save, STAGES, get quality() { return quality; }, get audio() { return audio; }, get enemies() { return enemies; }, get dialog() { return dialog; }, get hazards() { return hazards; },
  startGame, startStage, spawnEnemy, hurtHero, advanceDialog, showMenu, damageEnemy, MOVES, HERO, GAUGE, SKILLS,
  // 測試用：不經過畫面更新直接推進模擬
  step(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) { if (game.phase === 'playing' || game.phase === 'ending') { update(dt); updateAngel(dt); } } } };

requestAnimationFrame(frame);
boot();
