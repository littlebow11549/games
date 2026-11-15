// Stable spawn order makes repeated cycling predictable while enemies move.
export function nextLockTarget(enemies, current, position, range, direction = 1) {
  const eligible = enemies.filter(e => !e.gone && e.state !== 'dead' && e.state !== 'spawn' &&
    Math.hypot(e.pos.x - position.x, e.pos.z - position.z) - e.def.radius < range);
  if (!eligible.length) return null;
  const index = eligible.indexOf(current);
  if (index < 0) return eligible.reduce((best, e) =>
    Math.hypot(e.pos.x-position.x,e.pos.z-position.z) < Math.hypot(best.pos.x-position.x,best.pos.z-position.z) ? e : best);
  return eligible[(index + (direction < 0 ? -1 : 1) + eligible.length) % eligible.length];
}
