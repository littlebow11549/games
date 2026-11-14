// Native atlas regions. A failed/unfinished load leaves the original vector map usable.
export const MINIMAP_REGIONS = {
  frame: [58, 26, 646, 646],
  enemy: [100, 808, 124, 124],
  elite: [334, 780, 184, 184],
  boss: [602, 724, 270, 270],
  hero: [932, 744, 238, 238],
};
const atlas = new Image();
atlas.src = new URL('../assets/source/pic/ui/minimap_sheet.png', import.meta.url).href;
export function minimapArtReady() {
  return atlas.complete && atlas.naturalWidth > 0;
}
export function drawMinimapSprite(ctx, id, x, y, size, rotation = 0) {
  if (!minimapArtReady()) return false;
  const rect = MINIMAP_REGIONS[id];
  if (!rect) return false;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.drawImage(atlas, ...rect, -size / 2, -size / 2, size, size);
  ctx.restore();
  return true;
}
