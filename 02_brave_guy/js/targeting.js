// Shared by auto-lock, manual cycling and the button's availability feedback.
export function isLockTarget(enemy, position, range) {
  if (!enemy || enemy.gone || enemy.state === 'dead' || enemy.state === 'spawn' ||
      enemy.shown === false || (enemy.hp !== undefined && enemy.hp <= 0)) return false;
  const root = enemy.visual?.root;
  if (root && (!root.visible || !root.parent)) return false;
  const distance = Math.hypot(enemy.pos.x - position.x, enemy.pos.z - position.z);
  return Number.isFinite(distance) && distance - enemy.def.radius <= range;
}
export function lockCandidates(enemies, position, range) {
  const distance = e => Math.hypot(e.pos.x-position.x,e.pos.z-position.z);
  return enemies.filter(e=>isLockTarget(e,position,range)).sort((a,b)=>distance(a)-distance(b));
}
// Re-evaluate distances on every press; ties retain spawn order.
export function nextLockTarget(enemies, current, position, range, direction = 1) {
  const eligible = lockCandidates(enemies, position, range);
  if (!eligible.length || (eligible.length === 1 && eligible[0] === current)) return null;
  const index = eligible.indexOf(current);
  if (index < 0) return eligible[0];
  return eligible[(index + (direction < 0 ? -1 : 1) + eligible.length) % eligible.length];
}

// Nearest within a 90-degree cone in the same world axes as movement.
export function directionalLockTarget(enemies, position, range, movement) {
  const length = Math.hypot(movement.x, movement.y);
  if (!length) return null;
  return lockCandidates(enemies, position, range).find(e => {
    const dx = e.pos.x - position.x, dz = e.pos.z - position.z;
    const distance = Math.hypot(dx, dz);
    return distance > 0 && (dx * movement.x + dz * movement.y) / (distance * length) >= Math.SQRT1_2 - 1e-9;
  }) || null;
}
