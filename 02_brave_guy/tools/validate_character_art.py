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
 title=ROOT/entry['titles']['source'];tree=ET.parse(title);ns={'s':'http://www.w3.org/2000/svg'}
 assert tree.getroot().get('viewBox')=='0 0 3600 1800'
 assert len(tree.getroot().findall('s:svg',ns))==15
 assert hashlib.sha256(title.read_bytes()).hexdigest()==entry['titles']['sha256']
print('PASS all source/runtime pairs: byte provenance, native grids, lossless pixels; 3 references and 36 vector title cells.')
