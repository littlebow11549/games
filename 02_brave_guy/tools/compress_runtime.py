"""Build native-size lossless WebP delivery copies; verify every RGBA pixel."""
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
from pathlib import Path
import hashlib
import json
from PIL import Image
import argparse

ROOT = Path(__file__).resolve().parents[1]
urls = json.loads((ROOT / 'assets/runtime-images.json').read_text())
MAX_EFFORT = False

def convert(url):
    if '/runtime/lossless/pic/' not in url:
        return None
    source = url.replace('/runtime/lossless/pic/', '/source/pic/').replace('.webp', '.png')
    src, dst = ROOT / source, ROOT / url
    with Image.open(src) as image:
        original = image.convert('RGBA')
        valid = False
        previous_size = dst.stat().st_size if dst.exists() else None
        if dst.exists():
            try:
                with Image.open(dst) as check:
                    valid = check.size == original.size and check.convert('RGBA').tobytes() == original.tobytes()
            except OSError:
                pass
        if not valid or MAX_EFFORT:
            data = BytesIO()
            # In lossless mode quality controls encoder effort, not visual quality.
            original.save(data, 'WEBP', lossless=True,
                          quality=100 if MAX_EFFORT else 80,
                          method=6 if MAX_EFFORT else 4, exact=True)
            with Image.open(BytesIO(data.getvalue())) as check:
                assert check.size == original.size and check.convert('RGBA').tobytes() == original.tobytes(), source
            # Never replace a verified file with a larger candidate.
            if not valid or len(data.getvalue()) < dst.stat().st_size:
                dst.parent.mkdir(parents=True, exist_ok=True)
                dst.write_bytes(data.getvalue())
        if MAX_EFFORT:
            print(f'{dst.name}: {previous_size} -> {dst.stat().st_size}', flush=True)
        return dict(source=source, runtime=url, before=src.stat().st_size, after=dst.stat().st_size,
                    width=original.width, height=original.height, pixelIdentical=True,
                    sourceSHA256=hashlib.sha256(src.read_bytes()).hexdigest(),
                    maxEffortCompared=MAX_EFFORT,
                    previousRuntimeBytes=previous_size)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--max-effort', action='store_true', help='Compare maximum-effort lossless WebP against existing files; keep the smaller exact copy.')
    MAX_EFFORT = parser.parse_args().max_effort
    with ThreadPoolExecutor(max_workers=3) as executor:
        rows = [row for row in executor.map(convert, urls) if row]
    (ROOT / 'assets/runtime/lossless/report.json').write_text(json.dumps(rows, indent=2) + '\n')
    print(json.dumps(dict(files=len(rows), before=sum(r['before'] for r in rows), after=sum(r['after'] for r in rows))))
