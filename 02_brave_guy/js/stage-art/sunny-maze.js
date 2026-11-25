// Sunny Campus play-test navigation. Geometry lives in the separate art layer.
// Non-walkable cells are solid, including the exterior between campus and arena.
const ROWS = [
  '##S...###', // north: entrance to winding loop
  '#..##...#',
  '#.###.#.#',
  '#.......#',
  '###...###', // central plaza
  '###...###',
  '#...#...#', // western branch ends; east opens into boss court
  '#.###.B.#',
  '####E.###', // south: exit
];
const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];
const CELL = 4.6;
const HALF = CELL / 2;
const HEDGE = .34;
const EPS = 1e-7;
const SPAWN_PAD = .025;
const CENTRE = Math.floor(ROWS.length / 2);
const world = index => (index - CENTRE) * CELL;
const grid = x => Math.floor((x + CENTRE * CELL + HALF) / CELL);
const nodeId = (x, z) => z * ROWS.length + x;
const inside = (x, z) => x >= 0 && z >= 0 && x < ROWS.length && z < ROWS.length;
const walkable = (x, z) => inside(x, z) && ROWS[z][x] !== '#';
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const finitePoint = p => p != null && Number.isFinite(p.x) && Number.isFinite(p.z);
const point = (x, z) => ({ x, z });

function intersectsDisc(p, rect, r) {
  const dx = p.x - clamp(p.x, rect.x0, rect.x1);
  const dz = p.z - clamp(p.z, rect.z0, rect.z1);
  return dx * dx + dz * dz < r * r - EPS;
}

function segmentIntersectsBox(a, b, w, r) {
  let lo = 0, hi = 1;
  // Conservative square inflation rigorously encloses the swept actor disc.
  for (const [o, d, min, max] of [[a.x, b.x - a.x, w.x0 - r, w.x1 + r], [a.z, b.z - a.z, w.z0 - r, w.z1 + r]]) {
    if (Math.abs(d) < EPS) {
      if (o < min || o > max) return false;
    } else {
      const f = (min - o) / d, g = (max - o) / d;
      lo = Math.max(lo, Math.min(f, g));
      hi = Math.min(hi, Math.max(f, g));
      if (lo > hi) return false;
    }
  }
  return lo <= hi;
}

export function makeSunnyMaze(THREE) {
  const group = new THREE.Group();
  group.name = 'Sunny Campus | maze collision anchor';
  const nodes = [];
  const byId = new Map();
  const walls = [];
  let start, exit, boss;
  for (let row = 0; row < ROWS.length; row++) {
    for (let col = 0; col < ROWS.length; col++) {
      if (!walkable(col, row)) continue;
      const x = world(col), z = world(row), kind = ROWS[row][col];
      const edges = DIRS.map(([dx, dz]) => walkable(col + dx, row + dz));
      const node = { x, z, col, row, kind, edges };
      byId.set(nodeId(col, row), nodes.length);
      nodes.push(node);
      if (kind === 'S') start = point(x, z);
      if (kind === 'E') exit = point(x, z);
      if (kind === 'B') boss = point(x, z);
      for (let i = 0; i < 4; i++) {
        if (edges[i]) continue;
        const [dx, dz] = DIRS[i];
        const cx = x + HALF * dx, cz = z + HALF * dz;
        const sx = dx ? HEDGE : HALF + HEDGE, sz = dz ? HEDGE : HALF + HEDGE;
        walls.push({ x0: cx - sx, x1: cx + sx, z0: cz - sz, z1: cz + sz });
      }
    }
  }
  const walkCells = nodes.map(({x, z, row, col, kind}) => ({ x, z, row, col, kind }));
  const minX = Math.min(...nodes.map(p => p.x)) - HALF;
  const maxX = Math.max(...nodes.map(p => p.x)) + HALF;
  const minZ = Math.min(...nodes.map(p => p.z)) - HALF;
  const maxZ = Math.max(...nodes.map(p => p.z)) + HALF;
  const bounds = { minX, maxX, minZ, maxZ, x0: minX, x1: maxX, z0: minZ, z1: maxZ };
  const obstaclesByCell = new Map();
  for (const node of nodes) {
    // Radius 1.5 bosses and their flow margin can intersect only nearby edges.
    obstaclesByCell.set(nodeId(node.col, node.row), walls.filter(w =>
      w.x0 < node.x + CELL * 1.3 && w.x1 > node.x - CELL * 1.3 &&
      w.z0 < node.z + CELL * 1.3 && w.z1 > node.z - CELL * 1.3));
  }
  const blocked = (p, radius = .2) => {
    if (!finitePoint(p)) return true;
    const col = grid(p.x), row = grid(p.z);
    if (!walkable(col, row)) return true;
    const r = Math.max(.001, Number.isFinite(radius) ? radius : .2);
    const candidates = r <= CELL * .8 ? obstaclesByCell.get(nodeId(col, row)) : walls;
    return candidates.some(w => intersectsDisc(p, w, r));
  };
  const lineClear = (a, b, r = .2) =>
    finitePoint(a) && finitePoint(b) && !blocked(a, r) && !blocked(b, r) &&
    !walls.some(w => segmentIntersectsBox(a, b, w, Math.max(0, r) + EPS));

  function nearestWalkable(pos, radius = .5) {
    const raw = finitePoint(pos) ? pos : start;
    const r = Math.max(.001, Number.isFinite(radius) ? radius : .5) + SPAWN_PAD;
    const y = Number.isFinite(pos?.y) ? pos.y : 0;
    if (!blocked(raw, r)) return new THREE.Vector3(raw.x, y, raw.z);
    let best = null, bestScore = Infinity;
    function offer(x, z) {
      const score = (x - raw.x) ** 2 + (z - raw.z) ** 2;
      if (score < bestScore && !blocked({x, z}, r - EPS)) {
        best = {x, z};
        bestScore = score;
      }
    }
    for (const node of nodes) {
      const [east, south, west, north] = node.edges;
      const pad = HEDGE + r + EPS;
      const loX = node.x - HALF + (west ? EPS : pad);
      const hiX = node.x + HALF - (east ? EPS : pad);
      const loZ = node.z - HALF + (north ? EPS : pad);
      const hiZ = node.z + HALF - (south ? EPS : pad);
      if (loX <= hiX && loZ <= hiZ) {
        const x = clamp(raw.x, loX, hiX), z = clamp(raw.z, loZ, hiZ);
        offer(x, z);
        // At an inner corner a diagonal obstruction can make (x,z) invalid.
        // Approach the clamped target from this cell's clean centre, once per axis.
        offer(node.x, z);
        offer(x, node.z);
      }
      offer(node.x, node.z);
    }
    return new THREE.Vector3(best?.x ?? start.x, y, best?.z ?? start.z);
  }

  function collide(p, r = .3) {
    if (!blocked(p, r)) return false;
    const q = nearestWalkable(p, r);
    p.x = q.x;
    p.z = q.z;
    return true;
  }

  const fields = new Map();
  let flowVersion = '', fieldTarget = start;
  function updateFlow(heroPos) {
    if (!finitePoint(heroPos)) return;
    const version = Math.round(heroPos.x * 3) + ',' + Math.round(heroPos.z * 3);
    if (version === flowVersion) return;
    flowVersion = version;
    fieldTarget = point(heroPos.x, heroPos.z);
  }
  function fieldFor(r) {
    const clearance = Math.ceil((r + .08) * 20) / 20;
    let f = fields.get(clearance);
    if (!f) {
      const edges = nodes.map(node => DIRS.flatMap(([dx, dz], i) => {
        if (!node.edges[i]) return [];
        const index = byId.get(nodeId(node.col + dx, node.row + dz));
        return index !== undefined && lineClear(node, nodes[index], clearance) ? [index] : [];
      }));
      f = { edges, version: null, costs: [] };
      fields.set(clearance, f);
    }
    if (f.version !== flowVersion) {
      f.version = flowVersion;
      const target = nearestWalkable(fieldTarget, clearance + .04);
      const visited = new Uint8Array(nodes.length);
      f.costs = nodes.map(node => lineClear(node, target, clearance)
        ? Math.hypot(node.x - target.x, node.z - target.z) : Infinity);
      for (let k = 0; k < nodes.length; k++) {
        let best = -1;
        for (let i = 0; i < nodes.length; i++) {
          if (!visited[i] && Number.isFinite(f.costs[i]) && (best < 0 || f.costs[i] < f.costs[best])) best = i;
        }
        if (best < 0) break;
        visited[best] = 1;
        for (const j of f.edges[best]) f.costs[j] = Math.min(f.costs[j], f.costs[best] + CELL);
      }
    }
    return {f, clearance};
  }
  function steer(pos, heroPos, out, r = .6) {
    if (!finitePoint(pos) || !finitePoint(heroPos)) return out.set(0, 0, 0);
    if (blocked(pos, r)) {
      const p = nearestWalkable(pos, r);
      return out.set(p.x - pos.x, 0, p.z - pos.z).normalize();
    }
    updateFlow(heroPos);
    const aim = blocked(heroPos, r + .09) ? nearestWalkable(heroPos, r + .09) : heroPos;
    if (lineClear(pos, aim, r + .04)) return out.set(aim.x - pos.x, 0, aim.z - pos.z).normalize();
    const {f, clearance} = fieldFor(r);
    let selected = -1, best = Infinity;
    for (const margin of [clearance, r]) {
      for (let i = 0; i < nodes.length; i++) {
        if (!Number.isFinite(f.costs[i])) continue;
        const node = nodes[i], d = Math.hypot(node.x - pos.x, node.z - pos.z);
        const score = d + 1.012 * f.costs[i];
        if (d > .05 && score < best && lineClear(pos, node, margin)) {
          selected = i; best = score;
        }
      }
      if (selected >= 0) break;
    }
    if (selected < 0) {
      const recovery = nearestWalkable(pos, r + .15);
      return out.set(recovery.x - pos.x, 0, recovery.z - pos.z).normalize();
    }
    const target = nodes[selected];
    return out.set(target.x - pos.x, 0, target.z - pos.z).normalize();
  }

  function dispose() {
    group.removeFromParent();
    fields.clear();
  }

  return {
    group, walls, collide, blocked, lineClear, steer, updateFlow, dispose,
    cell: CELL, n: ROWS.length, walkCells, bounds, start, exit, boss, courtyard: point(0, 0),
    nearestWalkable, rows: ROWS.slice(),
  };
}
