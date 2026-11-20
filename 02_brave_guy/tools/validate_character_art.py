"""Validate replaceable character atlases without modifying their original pixels."""
from pathlib import Path
import hashlib,json,xml.etree.ElementTree as ET
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
data=json.loads((ROOT/'assets/records/brave_guy_character-art.json').read_text())
assert len(set(data['skill_grid']['slots']))==9
for character,entry in data['characters'].items():
 assert (ROOT/entry['reference']).exists(),entry['reference']
 for style,asset in entry['skills'].items():
  source=ROOT/asset['source'];runtime=ROOT/asset['runtime']
  assert hashlib.sha256(source.read_bytes()).hexdigest()==asset['sha256'],source
  with Image.open(source) as a,Image.open(runtime) as b:
   assert list(a.size)==asset['size'] and a.size==b.size
   assert a.width==a.height and a.width%data['skill_grid']['columns']==0
   assert a.convert('RGBA').tobytes()==b.convert('RGBA').tobytes(),runtime
 title=ROOT/entry['titles']['source']
 assert hashlib.sha256(title.read_bytes()).hexdigest()==entry['titles']['sha256']
 if entry['titles'].get('format')=='raster':
  with Image.open(title) as a,Image.open(ROOT/entry['titles']['runtime']) as b:
   assert list(a.size)==entry['titles']['size']
   assert a.convert('RGBA').tobytes()==b.convert('RGBA').tobytes()
   if 'rows' in entry['titles']:
    rows=entry['titles']['rows']
    assert len(rows)==data['title_grid']['rows'] and all(0<=lo<hi<=a.height for lo,hi in rows)
    assert all(first[1]<=second[0] for first,second in zip(rows,rows[1:]))
    if character in {'brave','angel'}:
     # Atlas cuts for transparent art should land on visible row gutters,
     # not half-way through a balloon from the preceding row.
     alpha=b.convert('RGBA').getchannel('A')
     for _,cut in rows[:-1]:
      assert sum(px>12 for px in alpha.crop((0,cut-1,b.width,cut+1)).getdata())<b.width*.05, (character,cut)
 else:
  tree=ET.parse(title);ns={'s':'http://www.w3.org/2000/svg'}
  assert len(tree.getroot().findall('s:svg',ns))==15
print('PASS all skill and dialogue source/runtime pairs: hashes, native sizes and exact lossless RGBA.')
