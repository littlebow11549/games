// 遊戲主程式：迴圈、主角、怪物 AI、戰鬥判定、波次、HUD。
import * as THREE from 'three';
import { buildWorld, ARENA_RADIUS } from './world.js';
import { createVisual, loadModel } from './visuals.js';
import { Fx } from './fx.js';
import { Input } from './input.js';
import { GameAudio } from './audio.js';

// ---------- 數值表（調手感改這裡） ----------

const HERO = { maxHp: 1000, maxMp: 100, mpRegen: 5, speed: 7.5, atk: 30, critRate: 0.25, critMult: 2, radius: 0.5 };

// dur 動作總長、hitAt 判定時間點、range/arc 扇形範圍、mult 傷害倍率、lunge 前衝距離、kb 擊退
const COMBO = [
  { dur: 0.34, hitAt: 0.12, range: 3.4, arc: 2.4, mult: 1.0, lunge: 1.0, kb: 4, dir: 1 },
  { dur: 0.34, hitAt: 0.12, range: 3.4, arc: 2.4, mult: 1.1, lunge: 1.0, kb: 4, dir: -1 },
  { dur: 0.52, hitAt: 0.24, range: 4.0, arc: 2.0, mult: 1.9, lunge: 1.6, kb: 9, dir: 1, heavy: true },
];

const SKILLS = {
  skill1: { name: '旋風斬', cd: 5, mp: 15, dur: 0.6 },
  skill2: { name: '劍氣', cd: 7, mp: 20, dur: 0.4 },
  skill3: { name: '天降巨劍', cd: 16, mp: 40, dur: 0.9 },
  dodge: { name: '閃避', cd: 1.2, mp: 0, dur: 0.26 },
};

const ENEMIES = {
  mob_spear: { hp: 130, speed: 3.2, radius: 0.55, reach: 2.0, windup: 0.55, recover: 0.7, dmg: 45, height: 1.6 },
  mob_imp: { hp: 55, speed: 5.2, radius: 0.4, reach: 1.3, windup: 0.32, recover: 0.5, dmg: 22, height: 1.0 },
  mob_plant: { hp: 95, speed: 0, radius: 0.55, reach: 15, windup: 0.6, recover: 1.8, dmg: 35, height: 1.7, ranged: true },
  boss: { hp: 2800, speed: 2.6, radius: 1.7, reach: 4.2, windup: 0.95, recover: 1.1, dmg: 150, height: 4.6, boss: true },
};

const WAVES = [
  { mob_spear: 4, mob_imp: 3 },
  { mob_spear: 5, mob_imp: 4, mob_plant: 3 },
  { mob_spear: 6, mob_imp: 6, mob_plant: 4 },
  { boss: 1 },
];

// ---------- 基礎建置 ----------

const $ = (id) => document.getElementById(id);
const canvas = $('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 200);
const CAM_OFFSET = new THREE.Vector3(0, 13.5, 13.5);
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

const game = { phase: 'loading', time: 0, kills: 0, wave: -1, waveTimer: 0, hitstop: 0, shake: 0, paused: false };
const hero = { pos: new THREE.Vector3(), yaw: 0, visual: null, cds: {} };
let enemies = [];
let shots = []; // 飛行物（敵方彈、我方劍氣）
const tmp = new THREE.Vector3();
const camTarget = new THREE.Vector3();

const rand = (a, b) => a + Math.random() * (b - a);
const forward = (yaw, out = new THREE.Vector3()) => out.set(Math.sin(yaw), 0, Math.cos(yaw));
const dist2d = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
function clampArena(p, margin = 0) {
  const r = Math.hypot(p.x, p.z), max = ARENA_RADIUS - margin;
  if (r > max) { p.x *= max / r; p.z *= max / r; }
}

function resetHero() {
  if (!hero.visual) { hero.visual = createVisual('hero'); scene.add(hero.visual.root); }
  Object.assign(hero, { hp: HERO.maxHp, mp: HERO.maxMp, state: 'free', t: 0, combo: -1, queued: false, comboGap: 0, hitDone: false, invuln: 0, cds: {}, yaw: 0, skillData: null });
  hero.pos.set(0, 0, 5);
  hero.visual.root.visible = true;
  hero.visual.play('idle');
}

function clearField() {
  for (const e of enemies) { scene.remove(e.visual.root); e.visual.dispose(); e.bar.remove(); }
  for (const s of shots) scene.remove(s.mesh);
  enemies = [];
  shots = [];
  fx.clear();
  $('world-ui').replaceChildren();
}

function startGame() {
  clearField();
  resetHero();
  Object.assign(game, { phase: 'playing', time: 0, kills: 0, wave: -1, waveTimer: 1.0, hitstop: 0, shake: 0, paused: false });
  $('overlay').hidden = true;
  $('hud').hidden = false;
  $('boss-bar').hidden = true;
  $('btn-pause').classList.remove('on');
  $('quest-wave').textContent = '清除妖物';
  audio.playBgm('bgm_battle');
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

function damageNumber(world, height, amount, cls = '') {
  const p = screenPos(world, height);
  const el = document.createElement('div');
  el.className = `dmg ${cls}`;
  el.textContent = `-${amount}`;
  el.style.left = `${p.x + rand(-14, 14)}px`;
  el.style.top = `${p.y + rand(-8, 8)}px`;
  $('world-ui').append(el);
  el.addEventListener('animationend', () => el.remove());
}

function updateHud() {
  $('hp-fill').style.transform = `scaleX(${Math.max(0, hero.hp / HERO.maxHp)})`;
  $('mp-fill').style.transform = `scaleX(${Math.max(0, hero.mp / HERO.maxMp)})`;
  $('hp-text').textContent = `${Math.max(0, Math.ceil(hero.hp))} / ${HERO.maxHp}`;
  $('quest-count').textContent = `擊殺 ${game.kills}`;
  for (const btn of document.querySelectorAll('.act[data-action]')) {
    const def = SKILLS[btn.dataset.action];
    if (!def) continue;
    const left = hero.cds[btn.dataset.action] || 0;
    btn.style.setProperty('--cd', `${left / def.cd}turn`);
    btn.classList.toggle('nomp', hero.mp < def.mp);
  }
  for (const e of enemies) {
    if (e.def.boss) { $('boss-fill').style.transform = `scaleX(${Math.max(0, e.hp / e.def.hp)})`; continue; }
    const p = screenPos(e.pos, e.def.height + 0.3);
    const show = p.visible && e.state !== 'dead' && e.hp < e.def.hp;
    e.bar.style.display = show ? '' : 'none';
    if (show) {
      e.bar.style.left = `${p.x}px`;
      e.bar.style.top = `${p.y}px`;
      e.bar.firstChild.style.transform = `scaleX(${Math.max(0, e.hp / e.def.hp)})`;
    }
  }
}

// ---------- 怪物 ----------

function spawnEnemy(kind, at) {
  const def = ENEMIES[kind];
  const visual = createVisual(kind);
  const pos = at ? at.clone() : new THREE.Vector3();
  if (!at) {
    const a = rand(0, Math.PI * 2);
    const r = def.boss ? 0 : rand(12, ARENA_RADIUS - 2);
    pos.set(Math.cos(a) * r, 0, Math.sin(a) * r);
    if (!def.boss && dist2d(pos, hero.pos) < 7) pos.multiplyScalar(-1); // 不要生在主角臉上
    if (def.boss) pos.set(0, 0, -6);
  }
  visual.root.position.copy(pos);
  scene.add(visual.root);
  const bar = document.createElement('div');
  bar.className = 'ebar';
  bar.append(document.createElement('i'));
  bar.style.display = 'none';
  $('world-ui').append(bar);
  const e = { kind, def, visual, pos, yaw: 0, hp: def.hp, state: 'spawn', t: 0, vel: new THREE.Vector3(), bar, cool: rand(0.3, 1.2), summoned: false, chargeT: rand(5, 8), struck: false };
  enemies.push(e);
  fx.ring(pos, 0.3, def.radius * 3, 0xb48cff, 0.5);
  fx.burst(pos, 0xb48cff, 10, 4, 0.6);
  return e;
}

function nextWave() {
  game.wave++;
  const wave = WAVES[game.wave];
  if (wave.boss) {
    banner('BOSS 來襲');
    $('boss-bar').hidden = false;
    $('quest-wave').textContent = '擊敗山嶽妖王';
    audio.playBgm('bgm_boss');
  } else {
    banner(`第 ${game.wave + 1} 波`);
    $('quest-wave').textContent = `清除妖物（${game.wave + 1}/${WAVES.length - 1}）`;
  }
  for (const [kind, n] of Object.entries(wave)) for (let i = 0; i < n; i++) spawnEnemy(kind);
}

function hurtHero(amount) {
  if (hero.invuln > 0 || hero.state === 'dead' || game.phase !== 'playing') return;
  const dmg = Math.round(amount * rand(0.9, 1.1));
  hero.hp -= dmg;
  hero.invuln = 0.45;
  hero.visual.flash();
  damageNumber(hero.pos, 2.0, dmg, 'hurt');
  game.shake = Math.max(game.shake, 0.25);
  audio.sfx('hurt');
  if (hero.hp <= 0) {
    hero.state = 'dead';
    hero.t = 0;
    hero.visual.play('die', 1.0);
    endGame(false);
  }
}

function damageEnemy(e, mult, kb, from) {
  if (e.state === 'dead' || e.state === 'spawn') return false;
  const crit = Math.random() < HERO.critRate;
  const dmg = Math.round(HERO.atk * mult * rand(0.9, 1.1) * (crit ? HERO.critMult : 1));
  e.hp -= dmg;
  e.visual.flash();
  damageNumber(e.pos, e.def.height, dmg, crit ? 'crit' : '');
  fx.burst(e.pos, crit ? 0xffb300 : 0xfff2c0, crit ? 16 : 9, crit ? 8 : 5, e.def.height * 0.6);
  tmp.set(e.pos.x - from.x, 0, e.pos.z - from.z).normalize();
  if (!e.def.boss && e.def.speed > 0) e.vel.addScaledVector(tmp, kb);
  if (e.hp <= 0) {
    e.state = 'dead';
    e.t = 0;
    e.visual.play('die', 0.7);
    e.bar.remove();
    game.kills++;
    if (e.def.boss) { fx.ring(e.pos, 1, 12, 0xffb347, 0.9); fx.burst(e.pos, 0xffb347, 40, 12, 2, 0.4); game.shake = 0.8; audio.sfx('boom'); }
  } else if (!e.def.boss && e.state !== 'windup') {
    // 蓄力中的怪不會被普通攻擊打斷動作，避免永遠打不出手
    e.state = 'stagger';
    e.t = 0;
    e.visual.play('hit', 0.25);
  }
  return crit;
}

// 扇形範圍判定，回傳是否有命中
function strike(center, yaw, range, arc, mult, kb, heavy) {
  const f = forward(yaw);
  let hit = false, anyCrit = false;
  for (const e of enemies) {
    if (e.state === 'dead' || e.state === 'spawn') continue;
    const dx = e.pos.x - center.x, dz = e.pos.z - center.z;
    const d = Math.hypot(dx, dz);
    if (d > range + e.def.radius) continue;
    if (arc < Math.PI * 1.9 && d > 0.6) {
      const ang = Math.acos(THREE.MathUtils.clamp((dx * f.x + dz * f.z) / d, -1, 1));
      if (ang > arc / 2 + Math.atan2(e.def.radius, d)) continue;
    }
    anyCrit = damageEnemy(e, mult, kb, center) || anyCrit;
    hit = true;
  }
  if (hit) {
    game.hitstop = Math.max(game.hitstop, heavy || anyCrit ? 0.085 : 0.045);
    game.shake = Math.max(game.shake, heavy ? 0.35 : 0.15);
    audio.sfx(anyCrit || heavy ? 'crit' : 'hit');
  }
  return hit;
}

function updateEnemy(e, dt) {
  e.t += dt;
  e.visual.update(dt);
  const def = e.def;

  if (e.state === 'dead') {
    if (e.t > 0.7) { scene.remove(e.visual.root); e.visual.dispose(); e.gone = true; }
    return;
  }
  if (e.state === 'spawn') {
    e.visual.root.scale.setScalar(Math.min(1, e.t / 0.4));
    if (e.t > 0.5) { e.state = 'chase'; e.t = 0; }
    return;
  }

  // 擊退速度衰減
  e.pos.addScaledVector(e.vel, dt);
  e.vel.multiplyScalar(Math.max(0, 1 - 9 * dt));

  const dx = hero.pos.x - e.pos.x, dz = hero.pos.z - e.pos.z;
  const d = Math.hypot(dx, dz);
  const heroAlive = hero.state !== 'dead';

  if (e.state === 'stagger') {
    if (e.t > 0.28) { e.state = 'chase'; e.t = 0; }
  } else if (e.state === 'chase') {
    e.cool -= dt;
    e.yaw = Math.atan2(dx, dz);
    if (def.boss) {
      e.chargeT -= dt;
      if (!e.summoned && e.hp < def.hp * 0.5) {
        e.summoned = true;
        banner('妖王召喚爪牙');
        for (let i = 0; i < 4; i++) spawnEnemy('mob_imp', new THREE.Vector3(e.pos.x + rand(-4, 4), 0, e.pos.z + rand(-4, 4)));
      }
      if (heroAlive && e.chargeT <= 0 && d > 6) {
        // 衝撞：短暫蓄力後朝主角方向直衝
        e.state = 'charge'; e.t = 0; e.struck = false; e.chargeT = rand(6, 9);
        e.chargeDir = new THREE.Vector3(dx / d, 0, dz / d);
        e.visual.play('attack', 0.7);
        fx.ring(e.pos, 1, 4, 0xff3b30, 0.6);
        return;
      }
    }
    if (heroAlive && d <= def.reach && e.cool <= 0) {
      e.state = 'windup'; e.t = 0; e.struck = false;
      e.visual.play('attack', def.windup / 0.6);
      if (def.boss) { e.aim = e.pos.clone(); fx.telegraph(e.aim, 5.5, def.windup); }
    } else if (def.speed > 0 && d > def.reach * 0.8) {
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
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), new THREE.MeshBasicMaterial({ color: 0xc86bff }));
        mesh.position.set(e.pos.x, 1.1, e.pos.z);
        scene.add(mesh);
        shots.push({ mesh, vel: forward(e.yaw).multiplyScalar(10), life: 2.6, radius: 0.6, dmg: def.dmg, hostile: true });
        audio.sfx('shoot');
      } else if (def.boss) {
        fx.ring(e.aim, 1, 6.5, 0xff8a3d, 0.5);
        fx.burst(e.aim, 0xffb347, 26, 10, 0.4, 0.3);
        game.shake = Math.max(game.shake, 0.6);
        audio.sfx('boom');
        if (dist2d(hero.pos, e.aim) < 5.5 + HERO.radius) hurtHero(def.dmg);
      } else {
        const f = forward(e.yaw);
        const ang = d > 0.01 ? Math.acos(THREE.MathUtils.clamp((dx * f.x + dz * f.z) / d, -1, 1)) : 0;
        if (d < def.reach + 0.6 && ang < 0.9) hurtHero(def.dmg);
      }
    }
    if (e.t >= def.windup + 0.25) { e.state = 'recover'; e.t = 0; e.visual.play('idle'); }
  } else if (e.state === 'recover') {
    if (e.t >= def.recover) { e.state = 'chase'; e.t = 0; e.cool = rand(0.2, 0.8); }
  } else if (e.state === 'charge') {
    if (e.t > 0.7 && e.t < 1.5) {
      e.pos.addScaledVector(e.chargeDir, 15 * dt);
      e.yaw = Math.atan2(e.chargeDir.x, e.chargeDir.z);
      if (!e.struck && d < def.radius + 1.2) { e.struck = true; hurtHero(110); }
    }
    if (e.t >= 1.5) { e.state = 'recover'; e.t = 0; e.visual.play('idle'); }
  }

  clampArena(e.pos, def.radius);
  e.visual.root.position.copy(e.pos);
  e.visual.root.rotation.y = e.yaw;
}

// 怪物之間、怪物與主角互推，避免疊成一團
function separate() {
  for (let i = 0; i < enemies.length; i++) {
    const a = enemies[i];
    if (a.state === 'dead') continue;
    for (let j = i + 1; j < enemies.length; j++) {
      const b = enemies[j];
      if (b.state === 'dead') continue;
      const dx = b.pos.x - a.pos.x, dz = b.pos.z - a.pos.z;
      const d = Math.hypot(dx, dz) || 0.001, min = a.def.radius + b.def.radius;
      if (d < min) {
        const push = (min - d) / 2;
        const wa = a.def.speed === 0 || a.def.boss ? 0 : 1, wb = b.def.speed === 0 || b.def.boss ? 0 : 1;
        a.pos.x -= (dx / d) * push * wa; a.pos.z -= (dz / d) * push * wa;
        b.pos.x += (dx / d) * push * wb; b.pos.z += (dz / d) * push * wb;
      }
    }
    const dx = hero.pos.x - a.pos.x, dz = hero.pos.z - a.pos.z;
    const d = Math.hypot(dx, dz) || 0.001, min = a.def.radius + HERO.radius;
    if (d < min && hero.state !== 'dodge') { hero.pos.x += (dx / d) * (min - d); hero.pos.z += (dz / d) * (min - d); }
  }
}

// ---------- 主角 ----------

function nearestEnemy(maxDist) {
  let best = null, bd = maxDist;
  for (const e of enemies) {
    if (e.state === 'dead' || e.state === 'spawn') continue;
    const d = dist2d(e.pos, hero.pos) - e.def.radius;
    if (d < bd) { bd = d; best = e; }
  }
  return best;
}

function faceForAction(mv) {
  if (mv.len > 0) { hero.yaw = Math.atan2(mv.x, mv.y); return; }
  const target = nearestEnemy(8); // 沒推搖桿時自動朝向最近的怪
  if (target) hero.yaw = Math.atan2(target.pos.x - hero.pos.x, target.pos.z - hero.pos.z);
}

function startAttack(index, mv) {
  faceForAction(mv);
  hero.state = 'attack'; hero.t = 0; hero.combo = index; hero.queued = false; hero.hitDone = false;
  hero.visual.play(`attack${index + 1}`, COMBO[index].dur);
  audio.sfx('swing');
}

function startSkill(name, mv) {
  const def = SKILLS[name];
  if ((hero.cds[name] || 0) > 0 || hero.mp < def.mp) return;
  hero.cds[name] = def.cd;
  hero.mp -= def.mp;
  faceForAction(mv);
  hero.state = name; hero.t = 0; hero.skillData = { step: 0 };
  hero.visual.play(name, def.dur);
  if (name === 'dodge') { hero.invuln = Math.max(hero.invuln, def.dur + 0.08); audio.sfx('dodge'); return; }
  audio.sfx('skill');
  if (name === 'skill3') {
    const target = nearestEnemy(11);
    const at = target ? target.pos.clone() : hero.pos.clone().addScaledVector(forward(hero.yaw), 5);
    hero.skillData.at = at;
    fx.telegraph(at, 7, 0.45, 0xffe08a);
    hero.invuln = Math.max(hero.invuln, def.dur);
  }
}

function updateHero(dt) {
  hero.t += dt;
  hero.invuln = Math.max(0, hero.invuln - dt);
  hero.mp = Math.min(HERO.maxMp, hero.mp + HERO.mpRegen * dt);
  for (const k of Object.keys(hero.cds)) hero.cds[k] = Math.max(0, hero.cds[k] - dt);
  hero.visual.update(dt);
  if (hero.state === 'dead') return;

  const mv = input.move();
  const actions = input.takeActions();
  if (input.held.has('attack') && !actions.includes('attack')) actions.push('attack'); // 按住連打

  if (hero.state === 'free') {
    hero.comboGap += dt;
    if (hero.comboGap > 0.6) hero.combo = -1;
    if (mv.len > 0) {
      hero.pos.x += mv.x * HERO.speed * dt;
      hero.pos.z += mv.y * HERO.speed * dt;
      hero.yaw = Math.atan2(mv.x, mv.y);
      hero.visual.play('run');
    } else {
      hero.visual.play('idle');
    }
    for (const a of actions) {
      if (hero.state !== 'free') break;
      if (a === 'attack') startAttack((hero.combo + 1) % COMBO.length, mv);
      else startSkill(a, mv);
    }
  } else if (hero.state === 'attack') {
    const c = COMBO[hero.combo];
    if (hero.t < c.hitAt) hero.pos.addScaledVector(forward(hero.yaw), (c.lunge / c.hitAt) * dt);
    if (!hero.hitDone && hero.t >= c.hitAt) {
      hero.hitDone = true;
      fx.slash(hero.pos, hero.yaw, c.range, c.arc, c.heavy ? 0xfff0b0 : 0xdffff6, c.dir);
      if (c.heavy) fx.ring(tmp.copy(hero.pos).addScaledVector(forward(hero.yaw), 2).clone(), 0.5, 3.2, 0xfff0b0, 0.35);
      strike(hero.pos, hero.yaw, c.range, c.arc, c.mult, c.kb, c.heavy);
    }
    for (const a of actions) {
      if (a === 'attack') hero.queued = true;
      else if (hero.hitDone) { startSkill(a, mv); if (hero.state !== 'attack') return; } // 命中後可用技能取消收招
    }
    if (hero.t >= c.dur) {
      if (hero.queued && hero.combo < COMBO.length - 1) startAttack(hero.combo + 1, mv);
      else { hero.state = 'free'; hero.comboGap = 0; if (hero.combo === COMBO.length - 1) hero.combo = -1; }
    }
  } else if (hero.state === 'dodge') {
    hero.pos.addScaledVector(forward(hero.yaw), 17 * dt);
    if (hero.t >= SKILLS.dodge.dur) hero.state = 'free';
  } else if (hero.state === 'skill1') {
    // 旋風斬：邊轉邊可緩慢移動，兩段全圓判定
    hero.pos.x += mv.x * HERO.speed * 0.5 * dt;
    hero.pos.z += mv.y * HERO.speed * 0.5 * dt;
    const times = [0.12, 0.36];
    if (hero.skillData.step < 2 && hero.t >= times[hero.skillData.step]) {
      hero.skillData.step++;
      fx.slash(hero.pos, hero.yaw, 4.8, Math.PI * 2, 0x9ff0dc);
      fx.ring(hero.pos, 1, 5, 0x9ff0dc, 0.3);
      strike(hero.pos, hero.yaw, 4.8, Math.PI * 2, 1.3, 6, hero.skillData.step === 2);
      audio.sfx('swing');
    }
    if (hero.t >= SKILLS.skill1.dur) hero.state = 'free';
  } else if (hero.state === 'skill2') {
    // 劍氣：貫穿的飛行斬擊
    if (hero.skillData.step === 0 && hero.t >= 0.16) {
      hero.skillData.step = 1;
      const g = new THREE.Group();
      const m = new THREE.Mesh(new THREE.RingGeometry(1.5, 2.6, 24, 1, -Math.PI / 2 - 0.9, 1.8), new THREE.MeshBasicMaterial({
        color: 0x8ff5ff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
      }));
      m.rotation.x = -Math.PI / 2;
      g.add(m);
      g.position.set(hero.pos.x, 0.9, hero.pos.z);
      g.rotation.y = hero.yaw;
      scene.add(g);
      shots.push({ mesh: g, vel: forward(hero.yaw).multiplyScalar(24), life: 0.75, radius: 2.4, mult: 2.2, hostile: false, hitSet: new Set() });
      audio.sfx('swing');
    }
    if (hero.t >= SKILLS.skill2.dur) hero.state = 'free';
  } else if (hero.state === 'skill3') {
    if (hero.skillData.step === 0 && hero.t >= 0.3) {
      hero.skillData.step = 1;
      const at = hero.skillData.at;
      fx.giantSword(at, () => {
        fx.ring(at, 1, 8.5, 0xffe08a, 0.6);
        fx.ring(at, 0.5, 5, 0xffffff, 0.4);
        fx.pillar(at, 2.4, 14, 0xfff0b0, 0.5);
        fx.burst(at, 0xffe08a, 40, 13, 0.4, 0.32);
        game.shake = Math.max(game.shake, 0.8);
        audio.sfx('boom');
        strike(at, 0, 7, Math.PI * 2, 5, 12, true);
        game.hitstop = Math.max(game.hitstop, 0.12);
      });
    }
    if (hero.t >= SKILLS.skill3.dur) hero.state = 'free';
  }

  clampArena(hero.pos, HERO.radius);
}

// ---------- 飛行物 ----------

function updateShots(dt) {
  for (const s of shots) {
    s.life -= dt;
    s.mesh.position.addScaledVector(s.vel, dt);
    if (s.hostile) {
      if (dist2d(s.mesh.position, hero.pos) < s.radius + HERO.radius) {
        if (hero.invuln <= 0) { hurtHero(s.dmg); s.life = 0; }
      }
    } else {
      for (const e of enemies) {
        if (s.hitSet.has(e) || e.state === 'dead' || e.state === 'spawn') continue;
        if (dist2d(s.mesh.position, e.pos) < s.radius + e.def.radius) {
          s.hitSet.add(e);
          damageEnemy(e, s.mult, 7, hero.pos);
          game.hitstop = Math.max(game.hitstop, 0.04);
          audio.sfx('hit');
        }
      }
      s.mesh.scale.setScalar(1 + (0.75 - s.life) * 0.5);
    }
    if (s.life <= 0 || Math.hypot(s.mesh.position.x, s.mesh.position.z) > ARENA_RADIUS + 4) {
      scene.remove(s.mesh);
      if (s.hostile) fx.burst(s.mesh.position, 0xc86bff, 6, 3, s.mesh.position.y);
      s.gone = true;
    }
  }
  shots = shots.filter((s) => !s.gone);
}

// ---------- 流程 ----------

function endGame(win) {
  game.phase = 'ending';
  setTimeout(() => {
    game.phase = 'over';
    audio.playBgm(win ? 'bgm_victory' : null);
    audio.sfx(win ? 'win' : 'lose');
    $('ov-logo').hidden = true;
    $('ov-title').hidden = false;
    $('overlay').classList.add('result');
    $('ov-title').textContent = win ? '勝 利' : '落 敗';
    $('ov-text').textContent = `用時 ${game.time.toFixed(1)} 秒　擊殺 ${game.kills}`;
    $('ov-load').textContent = '';
    $('ov-btn').textContent = '再來一次';
    $('ov-btn').disabled = false;
    $('overlay').hidden = false;
  }, win ? 1600 : 1200);
}

function update(dt) {
  if (game.hitstop > 0) { game.hitstop -= dt; fx.update(dt * 0.2); return; } // 命中頓幀
  game.time += dt;
  updateHero(dt);
  for (const e of enemies) updateEnemy(e, dt);
  enemies = enemies.filter((e) => !e.gone);
  separate();
  updateShots(dt);
  fx.update(dt);
  hero.visual.root.position.copy(hero.pos);
  hero.visual.root.rotation.y = hero.yaw;

  if (game.phase === 'playing' && enemies.every((e) => e.state === 'dead')) {
    if (game.wave >= WAVES.length - 1 && game.wave >= 0) { if (enemies.length === 0) endGame(true); }
    else {
      game.waveTimer -= dt;
      if (game.waveTimer <= 0) { nextWave(); game.waveTimer = 1.6; }
    }
  }
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
  camera.lookAt(camTarget.x, 0.8, camTarget.z);
  sun.position.set(camTarget.x - 14, 26, camTarget.z + 10);
  sun.target.position.copy(camTarget);
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!game.paused && (game.phase === 'playing' || game.phase === 'ending')) update(dt);
  else if (hero.visual) hero.visual.update(dt);
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
$('btn-mute').addEventListener('click', () => { audio.setMuted(!audio.muted); $('btn-mute').classList.toggle('off', audio.muted); });
$('btn-pause').addEventListener('click', () => {
  if (game.phase !== 'playing') return;
  game.paused = !game.paused;
  $('btn-pause').classList.toggle('on', game.paused);
  if (game.paused) banner('暫停');
});
document.addEventListener('visibilitychange', () => { if (document.hidden && game.phase === 'playing') { game.paused = true; $('btn-pause').classList.add('on'); } });

// 供自動化測試與除錯讀取狀態
window.__game = { game, hero, get enemies() { return enemies; }, startGame, spawnEnemy, HERO };

requestAnimationFrame(frame);
boot();
