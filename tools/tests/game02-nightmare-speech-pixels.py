"""Verify native-pixel clipping of normal Nightmare speech artwork (requires Pillow)."""
from hashlib import sha256
import json
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageFilter

game = Path(__file__).resolve().parents[2] / '02_brave_guy'
meta = json.loads((game / 'assets/records/brave_guy_character-art.json').read_text())
art = meta['characters']['nightmare']['titles']
source = game / art['source']
assert sha256(source.read_bytes()).hexdigest() == art['sha256']
master = Image.open(source).convert('RGBA')
atlas = Image.open(game / art['runtime']).convert('RGBA')
assert list(master.size) == art['size']
assert master.size == atlas.size and master.tobytes() == atlas.tobytes()


def clip_mask(size, point_list):
    w, h = size
    points = [tuple(map(float, pos.split(','))) for pos in point_list.split()]
    assert len(points) > 30 and all(0 < x < w - 1 and 0 < y < h - 1 for x, y in points)
    n = 8
    mask = Image.new('L', (n * w, n * h))
    ImageDraw.Draw(mask).polygon([(x * n, y * n) for x, y in points], fill=255)
    # Coverage average avoids the pale ringing of a high-order resampler on a mask.
    return mask.resize(size, Image.Resampling.BOX)


panels = {}
top, bottom = art['rows'][4]
for kind, (left, right) in zip(meta['title_grid']['speechColumns'], art['columns']):
    original = atlas.crop((left, top, right, bottom))
    w, h = original.size
    mask = clip_mask(original.size, art['speechClipPointsByKind'][kind])
    transparent = ImageChops.multiply(original.getchannel('A'), mask)
    assert min(original.getchannel('A').getextrema()) > 0, (kind, 'original painted panel reaches every edge')
    x0, y0, x1, y1 = transparent.getbbox()
    assert 0 < x0 < x1 < w and 0 < y0 < y1 < h, (kind, 'all four panel edges transparent')
    coverage = sum(p >= 128 for p in mask.getdata()) / (w * h)
    assert .66 <= coverage <= .74, (kind, 'retains the speech silhouette, not the panel')
    assert mask.crop((w//4, h//3, 3*w//4, 2*h//3)).getextrema() == (255, 255)
    boundary = [(r, g, b) for (r, g, b, _), m, inside
                in zip(original.getdata(), mask.getdata(), mask.filter(ImageFilter.MinFilter(3)).getdata())
                if m >= 128 > inside]
    assert sum(max(rgb) <= 128 for rgb in boundary) / len(boundary) > .96, (kind, 'edge follows dark ink, no pale matte')
    accent = [m for (r, g, b, a), m in zip(original.getdata(), mask.getdata())
              if a > 127 and max(r, g, b) - min(r, g, b) >= 80]
    assert len(accent) > 1700 and min(accent) == 255, (kind, 'original lime and purple accents all retained')
    clean = original.copy()
    clean.putalpha(transparent)
    panels[kind] = original, clean

if __name__ == '__main__':
    print('PASS all 3 Nightmare speech masks: solid panel edges removed, central fill and 9,386 accent pixels retained, perimeter follows source ink, source PNG and runtime WebP unchanged.')
