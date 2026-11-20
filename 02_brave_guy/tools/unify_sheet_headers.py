"""Validate canonical unified sheets. Legacy wrong-logo inputs were retired on 2026-11-20.

The composition is complete: unified PNGs are now the editable native-size masters.
This command does not overwrite artwork or recreate the removed drafts.
"""
from pathlib import Path
import hashlib
import json
from PIL import Image
ROOT = Path(__file__).resolve().parents[1]
manifest = json.loads((ROOT/'assets/source/UNIFIED_SHEET_HEADERS.json').read_text())
logos = set()
for row in manifest['sheets']:
    path = ROOT/row['source']
    assert hashlib.sha256(path.read_bytes()).hexdigest() == row['sha256'], path
    with Image.open(path) as image:
        assert list(image.size) == row['size'], path
        logos.add(hashlib.sha256(image.convert('RGBA').crop((0,0,250,120)).tobytes()).hexdigest())
assert len(logos) == 1
print(f"Verified {len(manifest['sheets'])} canonical sheets, native sizes and identical logo regions.")
