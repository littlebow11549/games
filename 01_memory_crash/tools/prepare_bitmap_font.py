"""Calibrate optical glyph bounds, row baselines, advances and kerning."""
from pathlib import Path
from PIL import Image
import numpy as np,json,statistics
ROOT=Path(__file__).resolve().parents[1];D=ROOT/'assets/source/pic/font'
atlas=json.loads((D/'font_01.json').read_text());image=Image.open(D/'font_01.png');a=np.array(image.getchannel('A'));glyphs={}
for g in atlas['glyphs']:
 char=g['character'];f=g['frame']
 if char==' ':continue
 box=a[f['y']:f['y']+f['height'],f['x']:f['x']+f['width']]>32
 ys,xs=np.where(box);assert len(xs)
 glyphs[char]={'x':int(f['x']+xs.min()),'y':int(f['y']+ys.min()),'width':int(xs.max()-xs.min()+1),'height':int(ys.max()-ys.min()+1),'row':g['row']}
anchors=['ABCDEFGH','IJKLMNOP','RSTUVWX','YZabcde','hiklmn','orstuv','wxz','!?','&']
baselines=[statistics.median(glyphs[c]['y']+glyphs[c]['height'] for c in chars) for chars in anchors]
cap=statistics.median(glyphs[c]['height'] for c in 'ABCDEFGHIKLMNOPRSTUVWX')
for c,g in glyphs.items():
 g['baseline_offset_em']=(g['y']+g['height']-baselines[g['row']])/cap
 g['advance_em']=g['width']/cap+.075
 g.pop('row')
glyphs[' ']={'advance_em':.34}
metrics={'image':'font_01.png','native_size':list(image.size),'cap_height_pixels':cap,'glyphs':glyphs,'kerning_em':{'AV':-.07,'WA':-.04,'To':-.05,'Yo':-.05,'Ta':-.05,'LT':-.035,'PA':-.04},'method':'Alpha>32 optical bounds; per-row baseline anchors; preserved descenders; shared cap height and explicit advances.','source_png_unchanged':True}
(D/'font_01.metrics.json').write_text(json.dumps(metrics,ensure_ascii=False,indent=2)+'\n');print('Calibrated',len(glyphs),'glyphs; cap height',cap)
