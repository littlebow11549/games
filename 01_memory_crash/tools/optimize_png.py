"""Losslessly optimize PNGs; retain only smaller files with identical pixels."""
from pathlib import Path
from io import BytesIO
from PIL import Image
import hashlib
import json

ROOT = Path(__file__).resolve().parents[1]

def optimize():
    rows = []
    for path in sorted((ROOT / 'assets/source/pic').rglob('*.png')):
        before = path.read_bytes()
        with Image.open(BytesIO(before)) as original:
            original.load()
            # Existing metadata needs explicit preservation; never strip color profiles.
            if original.info:
                raise RuntimeError(f'Review metadata before optimizing {path}')
            output = BytesIO()
            original.save(output, format='PNG', optimize=True, compress_level=9)
            candidate = output.getvalue()
            with Image.open(BytesIO(candidate)) as check:
                check.load()
                assert check.size == original.size
                assert check.mode == original.mode
                assert check.tobytes() == original.tobytes(), path
            result = candidate if len(candidate) < len(before) else before
            if result is candidate:
                path.write_bytes(result)
            rows.append({'path':str(path.relative_to(ROOT)), 'width':original.width,
                'height':original.height, 'mode':original.mode,
                'before_bytes':len(before), 'after_bytes':len(result),
                'decoded_pixel_sha256':hashlib.sha256(original.tobytes()).hexdigest(),
                'identical_pixels':True})
    report = ROOT / 'assets/LOSSLESS_COMPRESSION.json'
    report.write_text(json.dumps(rows, indent=2)+'\n')
    before=sum(x['before_bytes'] for x in rows)
    after=sum(x['after_bytes'] for x in rows)
    print(json.dumps({'images':len(rows),'before_bytes':before,'after_bytes':after,
        'saved_bytes':before-after,'saved_percent':round(100*(1-after/before),2)}))

if __name__ == '__main__':
    optimize()
