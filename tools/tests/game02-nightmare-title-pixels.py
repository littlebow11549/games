"""Audit transparent game overlays against existing approved lettering; requires Pillow."""
from hashlib import sha256
import json
from pathlib import Path
from PIL import Image, ImageDraw

game = Path(__file__).resolve().parents[2] / '02_brave_guy'
meta = json.loads((game / 'assets/records/brave_guy_character-art.json').read_text())
art = meta['characters']['nightmare']['titles']
source = game / art['source']
assert sha256(source.read_bytes()).hexdigest() == art['sha256']
master = Image.open(source).convert('RGBA')
atlas = Image.open(game / art['runtime']).convert('RGBA')
assert list(master.size) == art['size']
assert master.size == atlas.size and master.tobytes() == atlas.tobytes()

total = 0
for row, (top, bottom) in enumerate(art['rows'][:4]):
    for col, (left, right) in enumerate(art['columns']):
        image = atlas.crop((left, top, right, bottom))
        width, height = image.size
        points = [tuple(map(int, p.split(','))) for p in art['clipPointsByRowAndLocale'][row][col].split()]
        assert len(points) > 20 and all(0 <= x < width and 0 <= y < height for x, y in points)
        scale = 4
        mask = Image.new('L', (width * scale, height * scale))
        ImageDraw.Draw(mask).polygon([(x * scale, y * scale) for x, y in points], fill=255)
        mask = mask.resize(image.size, Image.Resampling.LANCZOS)
        assert all(mask.getpixel(corner) == 0 for corner in [(0, 0), (0, height-1), (width-1, 0), (width-1, height-1)])
        masked = mask.tobytes()
        cut = sum(a < 128 for a in masked) / (width * height)
        assert .03 < cut < .35, (row, col, cut)
        glyphs = [alpha for (r,g,b,a), alpha in zip(image.get_flattened_data() if hasattr(image, "get_flattened_data") else image.getdata(), masked) if a > 127 and r-g > 70 and b-g > 75]
        assert len(glyphs) > 5000 and all(alpha >= 128 for alpha in glyphs), (row, col)
        total += len(glyphs)
print(f'PASS: 12 masks have transparent corners and remove opaque panel fringe; {total:,} saturated purple letter pixels retained; original PNG hash and runtime RGBA exact.')
