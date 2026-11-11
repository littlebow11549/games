// 勇氣超人 設計底 D1：兩種型態、四條計量、拳頭與氣功（三小招一大招）、兩種變身、三層死亡保險。
// 規格見 DESIGN.md 4.2–4.8。所有美術都是佔位物。
import * as THREE from 'three';
import { buildWorld, ARENA_RADIUS } from './world.js';
import { createVisual, loadModel } from './visuals.js';
import { Fx } from './fx.js';
import { Input } from './input.js';
import { GameAudio } from './audio.js';

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
  folaidi: { name: '佛賴弟', hp: 130, speed: 2.4, radius: 0.5, reach: 13, windup: 0.7, recover: 2.2, dmg: 90, height: 1.9, ranged: true, bar: true },
  jiasen: { name: '假森', hp: 300, speed: 2.8, radius: 0.6, reach: 1.9, windup: 0.75, recover: 1.1, dmg: 110, height: 1.4, armored: true, bar: true },
  boss: { name: '佛賴弟王', hp: 4200, speed: 2.6, radius: 1.5, reach: 4.2, windup: 0.95, recover: 1.1, dmg: 220, height: 4.6, boss: true },
};
const MAX_ATTACKERS = 4;      // 同時出手的小怪上限，避免被圍毆到無法反應
const SPEECH = { 佛賴弟王: ['再五分鐘啦～', '明天的你會處理的～'] };

const WAVES = [
  { ganqiao: 12 },
  { ganqiao: 16, folaidi: 3 },
  { ganqiao: 18, jiasen: 4, folaidi: 3 },
  { boss: 1, ganqiao: 8 },
];

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
};

// ---------- 基礎建置 ----------

const $ = (id) => document.getElementById(id);
const canvas = $('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 200);
const CAM_OFFSET = new THREE.Vector3(0, 13, 12.5);
const { sun } = buildWorld(scene);
const fx = new Fx(scene);
const input = new Input();
let audio = new GameAudio(null);

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.fov = w < h ? 58 : 42; // 直式畫面拉寬視野
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();

// ---------- 狀態 ----------

const game = { phase: 'loading', time: 0, kills: 0, wave: -1, waveTimer: 0, hitstop: 0, shake: 0, paused: false, combo: 0, comboT: 0, fails: 0, easy: false };
const hero = { pos: new THREE.Vector3(), yaw: 0, vis: {}, visual: null, cds: {} };
const angel = { visual: null, pos: new THREE.Vector3(), sayT: 0, lastKey: '', quiet: 0 };
let enemies = [];
let shots = [];       // 飛行物（敵方彈、我方氣功彈）
let beam = null;      // 超勇氣波的光束網格
const tmp = new THREE.Vector3();
const camTarget = new THREE.Vector3();

const rand = (a, b) => a + Math.random() * (b - a);
const forward = (yaw, out = new THREE.Vector3()) => out.set(Math.sin(yaw), 0, Math.cos(yaw));
const dist2d = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const alive = (e) => e.state !== 'dead' && e.state !== 'spawn';
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
    hero.vis.student = createVisual('student');
    hero.vis.brave = createVisual('brave');
    scene.add(hero.vis.student.root, hero.vis.brave.root);
    angel.visual = createVisual('angel');
    scene.add(angel.visual.root);
  }
  Object.assign(hero, {
    hp: HERO.maxHp, courage: 0, qi: 0, guilt: 0, guiltMax: GAUGE.guiltBase,
    state: 'free', t: 0, combo: -1, queued: false, comboGap: 0, hitDone: false, invuln: 0, cds: {}, yaw: 0, data: null,
    mode: null, burstT: 0, extendLeft: 0, farT: 0, hurtStreak: 0, hurtStreakT: 0, usedClutch: false, usedRevive: false, readySaid: false,
  });
  hero.pos.set(0, 0, 5);
  setForm('student');
  angel.pos.copy(hero.pos);
}

function clearField() {
  for (const e of enemies) { scene.remove(e.visual.root); e.visual.dispose(); if (e.bar) e.bar.remove(); }
  for (const s of shots) scene.remove(s.mesh);
  if (beam) { scene.remove(beam); beam = null; }
  enemies = [];
  shots = [];
  fx.clear();
  $('world-ui').replaceChildren();
}

function startGame() {
  clearField();
  resetHero();
  Object.assign(game, { phase: 'playing', time: 0, kills: 0, wave: -1, waveTimer: 1.2, hitstop: 0, shake: 0, paused: false, combo: 0, comboT: 0 });
  $('overlay').hidden = true;
  $('hud').hidden = false;
  $('boss-bar').hidden = true;
  $('btn-pause').classList.remove('on');
  $('quest-wave').textContent = '打倒心魔';
  audio.playBgm('bgm_battle');
  say('start', true);
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

function updateHud() {
  const brave = hero.form === 'brave';
  $('hp-fill').style.transform = `scaleX(${Math.max(0, hero.hp / HERO.maxHp)})`;
  $('hp-text').textContent = `${Math.max(0, Math.ceil(hero.hp))} / ${HERO.maxHp}`;
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
  $('combo').hidden = game.combo < 5;
  $('combo-n').textContent = game.combo;

  for (const btn of document.querySelectorAll('.act[data-action]')) {
    const a = btn.dataset.action;
    if (SKILLS[a] && a !== 'ult') {
      btn.style.setProperty('--cd', `${(hero.cds[a] || 0) / SKILLS[a].cd}turn`);
      btn.classList.toggle('locked', !brave);
    } else if (a === 'ult') {
      btn.style.setProperty('--qi', `${hero.qi / GAUGE.qiMax}turn`);
      btn.classList.toggle('locked', !brave);
      btn.classList.toggle('ready', brave && hero.qi >= GAUGE.qiMax);
    } else if (a === 'transform') {
      btn.classList.toggle('ready', !brave && hero.courage >= GAUGE.courageMax);
      btn.classList.toggle('locked', brave || hero.courage < GAUGE.courageMax);
    } else if (a === 'dodge') {
      btn.style.setProperty('--cd', `${(hero.cds.dodge || 0) / FORM[hero.form].dodgeCd}turn`);
    }
  }

  for (const e of enemies) {
    if (e.def.boss) { $('boss-fill').style.transform = `scaleX(${Math.max(0, e.hp / e.def.hp)})`; continue; }
    if (!e.bar) continue;
    const p = screenPos(e.pos, e.def.height + 0.3 + e.y);
    const show = p.visible && e.state !== 'dead' && e.hp < e.def.hp;
    e.bar.style.display = show ? '' : 'none';
    if (show) {
      e.bar.style.left = `${p.x}px`;
      e.bar.style.top = `${p.y}px`;
      e.bar.firstChild.style.transform = `scaleX(${Math.max(0, e.hp / e.def.hp)})`;
    }
  }

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
  if (hero.form === 'student' && x > 0) {
    if (hero.hp < HERO.maxHp * GAUGE.lowHp) x *= 2;
    if (hero.guilt >= hero.guiltMax * GAUGE.guiltHesitate) x *= 0.5;
  }
  hero.courage = Math.max(0, Math.min(GAUGE.courageMax, hero.courage + x));
  if (hero.form === 'student' && hero.courage >= GAUGE.courageMax && !hero.readySaid) { hero.readySaid = true; say('ready', true); audio.sfx('skill'); }
}
function addQi(x) { if (hero.form === 'brave' && hero.state !== 'ult') hero.qi = Math.min(GAUGE.qiMax, hero.qi + x); } // 放大招期間不回氣

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
  hero.guilt = 0;
  hero.guiltMax = Math.min(GAUGE.guiltCap, hero.guiltMax + GAUGE.guiltStep);
  hero.hp = Math.min(HERO.maxHp, hero.hp + HERO.maxHp * GAUGE.burstHeal);
  hero.invuln = Math.max(hero.invuln, GAUGE.burstInvuln);
  if (beam) endUlt();
  if (hero.form === 'student') {
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
  setForm('student');
  hero.mode = null;
  hero.courage = 0;
  hero.qi *= 0.5;
  hero.readySaid = false;
  hero.state = 'free';
  fx.ring(hero.pos, 0.5, 2.5, 0xffffff, 0.3);
  say('revert', true);
}

// ---------- 怪物 ----------

function spawnEnemy(kind, at, delay = 0) {
  const def = ENEMIES[kind];
  const visual = createVisual(kind);
  const pos = at ? at.clone() : new THREE.Vector3();
  if (!at) {
    const a = rand(0, Math.PI * 2);
    const r = rand(13, ARENA_RADIUS - 2);
    pos.set(Math.cos(a) * r, 0, Math.sin(a) * r);
    if (dist2d(pos, hero.pos) < 8) pos.multiplyScalar(-1); // 不要生在主角臉上
    if (def.boss) pos.set(0, 0, -7);
  }
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
  const e = { kind, def, visual, pos, y: 0, vy: 0, yaw: 0, hp: def.hp, state: 'spawn', t: -delay, vel: new THREE.Vector3(), bar, cool: rand(0.6, 2.5), stun: 0, summons: 0, chargeT: rand(5, 8), struck: false, shown: false };
  enemies.push(e);
  return e;
}

function nextWave() {
  game.wave++;
  const wave = WAVES[game.wave];
  if (wave.boss) {
    banner('心魔來襲');
    $('boss-bar').hidden = false;
    $('boss-name').textContent = ENEMIES.boss.name;
    $('quest-wave').textContent = `打倒${ENEMIES.boss.name}`;
    audio.playBgm('bgm_boss');
  } else {
    banner(`第 ${game.wave + 1} 波`);
    $('quest-wave').textContent = `打倒心魔（${game.wave + 1}/${WAVES.length - 1}）`;
  }
  let i = 0;
  for (const [kind, n] of Object.entries(wave)) for (let k = 0; k < n; k++) spawnEnemy(kind, null, kind === 'boss' ? 0 : (i++) * 0.08);
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
  const dmg = Math.round(amount * rand(0.9, 1.1) * FORM[hero.form].hurtMult * (game.easy ? 0.75 : 1));
  hero.hp -= dmg;
  hero.invuln = 0.4;
  hero.visual.flash();
  popup(hero.pos, 2.2, `-${dmg}`, 'hurt');
  game.shake = Math.max(game.shake, 0.25);
  audio.sfx('hurt');
  game.combo = 0;
  if (hero.form === 'student') addCourage(GAUGE.courageHurt);
  hero.guilt += (dmg / HERO.maxHp) * 100 * GAUGE.guiltPerHpPct + (opts.guilt || 0);
  hero.hurtStreak++; hero.hurtStreakT = 3;
  if (hero.hurtStreak >= 3) { say('hurt3'); hero.hurtStreak = 0; }
  else if (hero.guilt >= hero.guiltMax * GAUGE.guiltHesitate && hero.guilt < hero.guiltMax) say('guilt');

  if (hero.hp <= 0) {
    if (hero.form === 'brave') { endTransformIfDead(); return; }
    if (!hero.usedClutch && hero.guilt >= hero.guiltMax * GAUGE.clutchAt) {
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
      hero.hp = HERO.maxHp * GAUGE.reviveHp;
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
  if (!alive(e)) return null;
  const crit = Math.random() < HERO.critRate;
  let dmg = FORM[hero.form].atk * mult * rand(0.9, 1.1) * (crit ? HERO.critMult : 1);
  const guarded = e.def.armored && e.y === 0 && e.stun <= 0 && (e.state === 'chase' || e.state === 'spawn');
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

function updateEnemy(e, dt, attackers) {
  e.t += dt;
  e.visual.update(dt);
  const def = e.def;

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
  if (e.y > 0 || e.vy > 0) {
    e.vy -= 30 * dt;
    e.y = Math.max(0, e.y + e.vy * dt);
    if (e.y === 0) { e.vy = 0; if (alive(e)) fx.ring(e.pos, 0.2, 1.4, 0xffffff, 0.2); }
  }
  clampArena(e.pos, def.radius);
  e.visual.root.position.set(e.pos.x, e.y, e.pos.z);
  e.visual.root.rotation.set(e.y > 0 ? e.t * 9 : 0, e.yaw, 0);

  if (e.state === 'dead') {
    if (e.t > 0.9) { scene.remove(e.visual.root); e.visual.dispose(); e.gone = true; }
    return;
  }
  if (e.y > 0) return; // 空中無法行動
  if (e.stun > 0) { e.stun -= dt; e.visual.play('stun'); e.state = 'stagger'; e.t = 0; return; }

  const dx = hero.pos.x - e.pos.x, dz = hero.pos.z - e.pos.z;
  const d = Math.hypot(dx, dz) || 0.001;
  const heroAlive = hero.state !== 'dead';

  if (e.state === 'stagger') {
    if (e.t > 0.3) { e.state = 'chase'; e.t = 0; }
  } else if (e.state === 'chase') {
    e.cool -= dt;
    e.yaw = Math.atan2(dx, dz);
    if (def.boss) {
      e.chargeT -= dt;
      const stage = e.hp < def.hp * 0.3 ? 2 : e.hp < def.hp * 0.6 ? 1 : 0;
      if (e.summons < stage) {
        e.summons = stage;
        banner('心魔召喚爪牙');
        popup(e.pos, def.height, SPEECH[def.name][stage - 1], 'shout');
        for (let i = 0; i < 8; i++) spawnEnemy('ganqiao', new THREE.Vector3(e.pos.x + rand(-5, 5), 0, e.pos.z + rand(-5, 5)), i * 0.06);
      }
      if (heroAlive && e.chargeT <= 0 && d > 6) {
        e.state = 'charge'; e.t = 0; e.struck = false; e.chargeT = rand(6, 9);
        e.chargeDir = new THREE.Vector3(dx / d, 0, dz / d);
        e.visual.play('attack', 0.7);
        fx.ring(e.pos, 1, 4, 0xff3b30, 0.6);
        return;
      }
    }
    const canAttack = def.boss || (def.ranged ? attackers.ranged < 2 : attackers.melee < MAX_ATTACKERS);
    if (heroAlive && d <= def.reach && e.cool <= 0 && canAttack) {
      e.state = 'windup'; e.t = 0; e.struck = false;
      if (def.ranged) attackers.ranged++; else attackers.melee++;
      e.visual.play('attack', def.windup / 0.6);
      if (def.boss) { e.aim = e.pos.clone(); fx.telegraph(e.aim, 5.5, def.windup); }
    } else if (def.ranged) {
      // 遠程：保持距離
      const want = d > 11 ? 1 : d < 6 ? -1 : 0;
      e.pos.x += (dx / d) * def.speed * want * dt;
      e.pos.z += (dz / d) * def.speed * want * dt;
      e.visual.play(want ? 'run' : 'idle');
    } else if (d > def.reach * 0.8) {
      e.pos.x += (dx / d) * def.speed * dt;
      e.pos.z += (dz / d) * def.speed * dt;
      e.visual.play('run');
    } else {
      e.visual.play('idle');
    }
  } else if (e.state === 'windup') {
    if (!e.struck && e.t >= def.windup) {
      e.struck = true;
      if (def.ranged) {
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), new THREE.MeshBasicMaterial({ color: 0xff5a4f }));
        mesh.position.set(e.pos.x, 1.2, e.pos.z);
        scene.add(mesh);
        shots.push({ mesh, vel: forward(e.yaw).multiplyScalar(11), life: 2.4, radius: 0.6, dmg: def.dmg, hostile: true });
        audio.sfx('shoot');
      } else if (def.boss) {
        fx.ring(e.aim, 1, 6.5, 0xff8a3d, 0.5);
        fx.burst(e.aim, 0xffb347, 26, 10, 0.4, 0.3);
        game.shake = Math.max(game.shake, 0.6);
        audio.sfx('boom');
        if (dist2d(hero.pos, e.aim) < 5.5 + HERO.radius) hurtHero(def.dmg);
      } else {
        const f = forward(e.yaw);
        const ang = Math.acos(THREE.MathUtils.clamp((dx * f.x + dz * f.z) / d, -1, 1));
        if (d < def.reach + 0.6 && ang < 0.9) hurtHero(def.dmg);
      }
    }
    if (e.t >= def.windup + 0.25) { e.state = 'recover'; e.t = 0; e.visual.play('idle'); }
  } else if (e.state === 'recover') {
    if (e.t >= def.recover) { e.state = 'chase'; e.t = 0; e.cool = rand(1.0, 3.0); }
  } else if (e.state === 'charge') {
    if (e.t > 0.7 && e.t < 1.5) {
      e.pos.addScaledVector(e.chargeDir, 15 * dt);
      e.yaw = Math.atan2(e.chargeDir.x, e.chargeDir.z);
      if (!e.struck && d < def.radius + 1.2) { e.struck = true; hurtHero(150); }
    }
    if (e.t >= 1.5) { e.state = 'recover'; e.t = 0; e.visual.play('idle'); }
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
  for (const s of shots) if (s.hostile && dist2d(s.mesh.position, hero.pos) < 3) return true;
  return false;
}

function startAttack(index, mv) {
  faceForAction(mv, 6);
  const c = COMBO[hero.form][index];
  hero.state = 'attack'; hero.t = 0; hero.combo = index; hero.queued = false; hero.hitDone = false;
  hero.visual.play(c.anim, c.dur);
  audio.sfx('swing');
}

function startDodge(mv) {
  if ((hero.cds.dodge || 0) > 0) return;
  const f = FORM[hero.form];
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
  if (hero.form !== 'brave') { say('noSkill'); return; }
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
  const speed = FORM[hero.form].speed;
  const combo = COMBO[hero.form];

  const act = (a) => {
    if (a === 'attack') startAttack((hero.combo + 1) % combo.length, mv);
    else if (a === 'dodge') startDodge(mv);
    else if (a === 'transform') {
      if (hero.form === 'student' && hero.courage >= GAUGE.courageMax) {
        hero.state = 'transforming'; hero.t = 0;
        hero.visual.play('transform');
        hero.visual.glow(true, 0xfff7c2);
        audio.sfx('skill');
      }
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
      arcStrike(hero.pos, hero.yaw, c.range, c.arc, c.mult, { kb: c.kb, launch: c.launch, heavy: c.heavy });
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
    lineStrike(before, hero.pos, s.width, s.mult, { kb: s.kb, launch: s.launch, heavy: true }, hero.data.hitSet);
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
      shots.push({ mesh: g, vel: forward(hero.yaw).multiplyScalar(s.speed), life: s.life, radius: s.radius, mult: s.mult, hostile: false, hitSet: new Set(), blast: s.blast, blastMult: s.blastMult });
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
      areaStrike(hero.pos, s.radius, s.mult, { kb: s.kb, launch: s.launch, stun: s.stun, heavy: true });
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
      if (dist2d(s.mesh.position, hero.pos) < s.radius + HERO.radius && hero.invuln <= 0 && hero.state !== 'transforming') { hurtHero(s.dmg); s.life = 0; }
      // 我方的大招可以把敵方彈打掉
      for (const o of shots) if (!o.hostile && dist2d(o.mesh.position, s.mesh.position) < o.radius) s.life = 0;
    } else {
      const res = [];
      for (const e of enemies) {
        if (s.hitSet.has(e) || !alive(e)) continue;
        if (dist2d(s.mesh.position, e.pos) < s.radius + e.def.radius) { s.hitSet.add(e); res.push(damageEnemy(e, s.mult, { from: hero.pos, kb: 9, launch: 6 })); }
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

function endGame(win) {
  game.phase = 'ending';
  if (!win) game.fails++; else game.fails = 0;
  setTimeout(() => {
    game.phase = 'over';
    audio.playBgm(win ? 'bgm_victory' : null);
    audio.sfx(win ? 'win' : 'lose');
    $('ov-logo').hidden = true;
    $('ov-title').hidden = false;
    $('overlay').classList.add('result');
    $('ov-title').textContent = win ? '突 破' : '倒 下';
    $('ov-text').textContent = `用時 ${game.time.toFixed(1)} 秒　擊倒 ${game.kills}`;
    $('ov-load').textContent = win ? '小天使：「還行。」' : '小天使：「起來。再一次。」';
    $('ov-btn').textContent = '再來一次';
    $('ov-btn').disabled = false;
    // 同一關連續失敗三次，小天使提議調簡單
    $('ov-easy').hidden = !(game.fails >= 3 && !game.easy);
    $('overlay').hidden = false;
  }, win ? 1600 : 1200);
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
  fx.update(dt);
  hero.visual.root.position.copy(hero.pos);
  hero.visual.root.rotation.y = hero.yaw;

  if (game.phase === 'playing' && enemies.every((e) => e.state === 'dead')) {
    if (game.wave >= WAVES.length - 1) { if (enemies.length === 0) endGame(true); }
    else {
      game.waveTimer -= dt;
      if (game.waveTimer <= 0) { if (game.wave >= 0) say('wave'); nextWave(); game.waveTimer = 1.6; }
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

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!game.paused && (game.phase === 'playing' || game.phase === 'ending')) { update(dt); updateAngel(dt); }
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

  resetHero();
  camTarget.copy(hero.pos);
  game.phase = 'ready';
  $('ov-load').textContent = models.length ? `已載入模型 ${ok}/${models.length}，其餘使用佔位角色` : '目前全部使用佔位素材';
  $('ov-btn').disabled = false;
  $('btn-mute').classList.toggle('off', audio.muted);
}

$('ov-btn').addEventListener('click', () => { audio.unlock(); audio.sfx('ui'); startGame(); });
$('ov-easy').addEventListener('click', () => { game.easy = true; game.fails = 0; audio.unlock(); audio.sfx('ui'); startGame(); });
$('btn-mute').addEventListener('click', () => { audio.setMuted(!audio.muted); $('btn-mute').classList.toggle('off', audio.muted); });
$('btn-pause').addEventListener('click', () => {
  if (game.phase !== 'playing') return;
  game.paused = !game.paused;
  $('btn-pause').classList.toggle('on', game.paused);
  if (game.paused) banner('暫停');
});
document.addEventListener('visibilitychange', () => { if (document.hidden && game.phase === 'playing') { game.paused = true; $('btn-pause').classList.add('on'); } });

// 供自動化測試與除錯讀取狀態
window.__game = { game, hero, get audio() { return audio; }, get enemies() { return enemies; }, startGame, spawnEnemy, hurtHero, HERO, GAUGE, SKILLS };

requestAnimationFrame(frame);
boot();
