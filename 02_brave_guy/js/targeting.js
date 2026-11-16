// Shared by auto-lock, manual cycling and the button's availability feedback.
export function isLockTarget(enemy, position, range) {
  if (!enemy || enemy.gone || enemy.state === 'dead' || enemy.state === 'spawn' ||
      enemy.shown === false || (enemy.hp !== undefined && enemy.hp <= 0)) return false;
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
