// 迷宮：每次進關卡隨機生成。場地仍是圓形，裡面用矮牆隔出一格一格的通道。
// 做法：把場地切成 n×n 格，只用落在圓內的格子；先用深度優先走出一座「完美迷宮」，
// 再依 open 比例敲掉一些牆，讓路線有岔路、有迴圈，不會只剩一條死巷，適合無雙割草。
// 中央留一塊空地給主角起手與守關者戰。
import * as THREE from '../vendor/three/three.module.min.js';

const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]]; // 東、南、西、北
const HALF = 0.4; // 牆的半厚度

export function makeMaze({ radius, n = 6, open = 0.35, clear = 9, color = 0x4a5a70, top = 0xffffff, height = 1.5 }) {
  const cell = (radius * 2) / n;
  const inside = (cx, cz) => cx >= 0 && cz >= 0 && cx < n && cz < n && Math.hypot((cx + 0.5) * cell - radius, (cz + 0.5) * cell - radius) < radius - cell * 0.28;
  const id = (cx, cz) => cz * n + cx;
  // passage[id] 的第 d 個位元 = 往 DIRS[d] 走得通
  const passage = new Uint8Array(n * n);
  const link = (cx, cz, d) => { passage[id(cx, cz)] |= 1 << d; passage[id(cx + DIRS[d][0], cz + DIRS[d][1])] |= 1 << ((d + 2) % 4); };

  // 1. 深度優先
  const seen = new Uint8Array(n * n);
  const start = [Math.floor(n / 2), Math.floor(n / 2)];
  const stack = [start];
  seen[id(...start)] = 1;
  while (stack.length) {
    const [cx, cz] = stack[stack.length - 1];
    const opts = [];
    for (let d = 0; d < 4; d++) { const nx = cx + DIRS[d][0], nz = cz + DIRS[d][1]; if (inside(nx, nz) && !seen[id(nx, nz)]) opts.push(d); }
    if (!opts.length) { stack.pop(); continue; }
    const d = opts[Math.floor(Math.random() * opts.length)];
    link(cx, cz, d);
    const next = [cx + DIRS[d][0], cz + DIRS[d][1]];
    seen[id(...next)] = 1;
    stack.push(next);
  }
  // 2. 敲牆：多開一些路；靠近中央的一律打通
  const centre = (cx, cz) => new THREE.Vector3((cx + 0.5) * cell - radius, 0, (cz + 0.5) * cell - radius);
  for (let cz = 0; cz < n; cz++) for (let cx = 0; cx < n; cx++) {
    if (!inside(cx, cz)) continue;
    for (const d of [0, 1]) {
      const nx = cx + DIRS[d][0], nz = cz + DIRS[d][1];
      if (!inside(nx, nz) || (passage[id(cx, cz)] >> d) & 1) continue;
      const mx = ((cx + nx) / 2 + 0.5) * cell - radius, mz = ((cz + nz) / 2 + 0.5) * cell - radius;
      if (Math.hypot(mx, mz) < clear || Math.random() < open) link(cx, cz, d);
    }
  }
  // 3. 牆的幾何：兩個圓內格子之間不通的邊。牆兩端各留一點缺口感（短一點），轉角不會卡住人
  const walls = [];
  for (let cz = 0; cz < n; cz++) for (let cx = 0; cx < n; cx++) {
    if (!inside(cx, cz)) continue;
    for (const d of [0, 1]) {
      const nx = cx + DIRS[d][0], nz = cz + DIRS[d][1];
      if (!inside(nx, nz) || (passage[id(cx, cz)] >> d) & 1) continue;
      const x = (cx + 1) * cell - radius, z = (cz + 1) * cell - radius;
      const len = cell * 0.5 + HALF;
      walls.push(d === 0
        ? { x0: x - HALF, x1: x + HALF, z0: z - cell / 2 - len, z1: z - cell / 2 + len }   // 東邊：南北向的牆
        : { x0: x - cell / 2 - len, x1: x - cell / 2 + len, z0: z - HALF, z1: z + HALF }); // 南邊：東西向的牆
    }
  }

  // 模型：一個合批的方塊群
  const group = new THREE.Group();
  if (walls.length) {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const body = new THREE.InstancedMesh(geo, new THREE.MeshToonMaterial({ color }), walls.length);
    const cap = new THREE.InstancedMesh(geo, new THREE.MeshToonMaterial({ color: top }), walls.length);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion();
    walls.forEach((w, i) => {
      const cx = (w.x0 + w.x1) / 2, cz = (w.z0 + w.z1) / 2, sx = w.x1 - w.x0, sz = w.z1 - w.z0;
      body.setMatrixAt(i, m.compose(new THREE.Vector3(cx, height / 2, cz), q, new THREE.Vector3(sx, height, sz)));
      cap.setMatrixAt(i, m.compose(new THREE.Vector3(cx, height + 0.06, cz), q, new THREE.Vector3(sx + 0.16, 0.12, sz + 0.16)));
    });
    body.castShadow = true; body.receiveShadow = true;
    group.add(body, cap);
  }

  const cellOf = (p) => {
    const cx = Math.floor((p.x + radius) / cell), cz = Math.floor((p.z + radius) / cell);
    return inside(cx, cz) ? [cx, cz] : null;
  };

  // Test the whole swept circle, not just the endpoint or logical cell.
  function lineClear(a, b, r = 0.2) {
    for (const w of walls) {
      let lo = 0, hi = 1;
      for (const [origin, delta, min, max] of [[a.x,b.x-a.x,w.x0-r,w.x1+r],[a.z,b.z-a.z,w.z0-r,w.z1+r]]) {
        if (Math.abs(delta) < 1e-9) { if (origin < min || origin > max) { lo=2; break; } }
        else { const t1=(min-origin)/delta,t2=(max-origin)/delta;lo=Math.max(lo,Math.min(t1,t2));hi=Math.min(hi,Math.max(t1,t2)); }
      }
      if (lo <= hi) return false;
    }
    return true;
  }
  const nodes=[];
  const nodeAt=new Map();
  for(let z=0;z<n;z++)for(let x=0;x<n;x++)if(inside(x,z)){
    nodeAt.set(id(x,z),nodes.length);nodes.push({x,z,pos:centre(x,z)});
  }
  const fields=new Map();let flowVersion='';
  function updateFlow(heroPos) {
    // Includes the outer rim, which has no logical maze cell.
    const version=Math.round(heroPos.x*2)+','+Math.round(heroPos.z*2);
    if(version!==flowVersion){flowVersion=version;for(const f of fields.values())f.version=null;}
  }
  function fieldFor(heroPos,r) {
    const clearance=Math.ceil((r+0.08)*10)/10;
    let f=fields.get(clearance);
    if(!f){
      const edges=nodes.map(node=>DIRS.flatMap(([dx,dz],d)=>{
        const j=nodeAt.get(id(node.x+dx,node.z+dz));
        return (passage[id(node.x,node.z)]&(1<<d)) && j!==undefined && lineClear(node.pos,nodes[j].pos,clearance)?[j]:[];
      }));
      f={edges,version:null,cost:[]};fields.set(clearance,f);
    }
    if(f.version!==flowVersion){
      f.version=flowVersion;
      f.cost=nodes.map(node=>lineClear(node.pos,heroPos,clearance)?Math.hypot(node.pos.x-heroPos.x,node.pos.z-heroPos.z):Infinity);
      const visited=new Set();
      for(let k=0;k<nodes.length;k++){
        let best=-1;for(let i=0;i<nodes.length;i++)if(!visited.has(i)&&(best<0||f.cost[i]<f.cost[best]))best=i;
        if(best<0||!Number.isFinite(f.cost[best]))break;
        visited.add(best);for(const j of f.edges[best])f.cost[j]=Math.min(f.cost[j],f.cost[best]+cell);
      }
    }
    return {f,clearance};
  }
  function safePoint(pos,r) {
    const p={x:pos.x,z:pos.z};
    for(let pass=0;pass<4;pass++)for(const w of walls){
      const left=w.x0-r,right=w.x1+r,top=w.z0-r,bottom=w.z1+r;
      if(p.x>left&&p.x<right&&p.z>top&&p.z<bottom){
        const distances=[p.x-left,right-p.x,p.z-top,bottom-p.z];
        const side=distances.indexOf(Math.min(...distances));
        if(side===0)p.x=left-.01;else if(side===1)p.x=right+.01;else if(side===2)p.z=top-.01;else p.z=bottom+.01;
      }
    }
    return p;
  }
  function steer(pos,heroPos,out,r=0.6) {
    updateFlow(heroPos);
    // A hero can stand closer to a wall than a large enemy can fit.
    heroPos=safePoint(heroPos,r+0.2);
    const safe=safePoint(pos,r+0.12);
    if(Math.hypot(safe.x-pos.x,safe.z-pos.z)>.01)return out.set(safe.x-pos.x,0,safe.z-pos.z).normalize();
    if(lineClear(pos,heroPos,r+0.05))return out.set(heroPos.x-pos.x,0,heroPos.z-pos.z).normalize();
    const {f,clearance}=fieldFor(heroPos,r);
    const c=cellOf(pos);let best=-1,score=Infinity;
    const select=local=>{
      for(let i=0;i<nodes.length;i++){
        const node=nodes[i];
        if(local&&c&&(Math.abs(node.x-c[0])>1||Math.abs(node.z-c[1])>1))continue;
        const distance=Math.hypot(node.pos.x-pos.x,node.pos.z-pos.z);
        const cost=distance+f.cost[i]*1.001; // Prefer advancing on equal-cost segments.
        if(cost<score&&distance>0.05&&lineClear(pos,node.pos,clearance)) {best=i;score=cost;}
      }
    };
    select(true);if(best<0&&c)select(false);
    if(best>=0)return out.set(nodes[best].pos.x-pos.x,0,nodes[best].pos.z-pos.z).normalize();
    // A pushed actor may touch the safety margin: recover using its real body radius.
    for(let i=0;i<nodes.length;i++)if(Number.isFinite(f.cost[i])&&lineClear(pos,nodes[i].pos,r)){
      const cost=Math.hypot(nodes[i].pos.x-pos.x,nodes[i].pos.z-pos.z)+f.cost[i]*1.001;
      if(cost<score){best=i;score=cost;}
    }
    return best>=0?out.set(nodes[best].pos.x-pos.x,0,nodes[best].pos.z-pos.z).normalize():out.set(0,0,0);
  }

  // 把圓形的東西推出牆外。回傳有沒有碰到
  function collide(p, r) {
    let hit = false;
    for (const w of walls) {
      const nx = Math.max(w.x0, Math.min(p.x, w.x1)), nz = Math.max(w.z0, Math.min(p.z, w.z1));
      const dx = p.x - nx, dz = p.z - nz, d2 = dx * dx + dz * dz;
      if (d2 >= r * r) continue;
      hit = true;
      if (d2 > 1e-6) { const d = Math.sqrt(d2); p.x = nx + (dx / d) * r; p.z = nz + (dz / d) * r; }
      else {
        // 圓心在牆裡：往最近的那一面推出去
        const l = p.x - w.x0, rr = w.x1 - p.x, t = p.z - w.z0, b = w.z1 - p.z, m = Math.min(l, rr, t, b);
        if (m === l) p.x = w.x0 - r; else if (m === rr) p.x = w.x1 + r; else if (m === t) p.z = w.z0 - r; else p.z = w.z1 + r;
      }
    }
    return hit;
  }
  const blocked = (p, r = 0.2) => walls.some((w) => p.x > w.x0 - r && p.x < w.x1 + r && p.z > w.z0 - r && p.z < w.z1 + r);

  function dispose() {
    group.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    if (group.parent) group.parent.remove(group);
  }
  return { group, walls, collide, blocked, lineClear, steer, updateFlow, dispose, cell, n };
}
