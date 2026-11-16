// Re-evaluate distance on every press; equal distances retain spawn order.
export function nextLockTarget(enemies, current, position, range, direction = 1) {
  const distance = e => Math.hypot(e.pos.x - position.x, e.pos.z - position.z);
  const eligible = enemies.filter(e => !e.gone && e.state !== 'dead' && e.state !== 'spawn' &&
    distance(e) - e.def.radius < range).sort((a, b) => distance(a) - distance(b));
  if (!eligible.length) return null;
  const index = eligible.indexOf(current);
  if (index < 0) return eligible[0];
  return eligible[(index + (direction < 0 ? -1 : 1) + eligible.length) % eligible.length];
}
