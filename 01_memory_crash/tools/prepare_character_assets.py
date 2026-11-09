"""Validate and losslessly compress new character/menu source PNGs."""
from pathlib import Path
from PIL import Image
from io import BytesIO
import json,hashlib,concurrent.futures
ROOT=Path(__file__).resolve().parents[1]
PIC=ROOT/'assets/source/pic'
NAMES=['character/char_01.png','titles/titles_02.png']+['character/char_anim_'+name+'.png' for name in ['idle','happy','sad','celebrate']]

def optimize(name):
    p=PIC/name;raw=p.read_bytes();im=Image.open(BytesIO(raw));im.load()
    assert im.mode=='RGBA',name
    assert im.getchannel('A').getextrema()[0]==0,name
    out=BytesIO();im.save(out,format='PNG',optimize=True,compress_level=9)
    data=out.getvalue();check=Image.open(BytesIO(data));check.load()
    assert im.mode==check.mode and im.size==check.size and im.tobytes()==check.tobytes(),name
    if len(data)<len(raw):p.write_bytes(data)
    row={'image':name,'dimensions':list(im.size),'mode':im.mode,'before_bytes':len(raw),'after_bytes':p.stat().st_size,'pixel_sha256':hashlib.sha256(im.tobytes()).hexdigest(),'identical_pixels':True}
    if 'char_anim_' in name:
        # Every logical frame contains the character and a transparent surrounding region.
        for i in range(8):
            x0=round(i%4*im.width/4);y0=round(i//4*im.height/2)
            x1=round((i%4+1)*im.width/4);y1=round((i//4+1)*im.height/2)
            assert im.getchannel('A').crop((x0,y0,x1,y1)).getextrema()[1]>200
        row['frames']=8
    print(name,'validated',flush=True)
    return row
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:report=list(pool.map(optimize,NAMES))
(PIC/'character/COMPRESSION.json').write_text(json.dumps(report,indent=2)+'\n')
meta={'character':'cosmic-pug','layout':{'columns':4,'rows':2,'frames':8,'order':'left to right, top row then bottom row'},'clips':{}}
for name,fps in [('idle',3),('happy',8),('sad',5),('celebrate',8)]:
    im=Image.open(PIC/f'character/char_anim_{name}.png')
    meta['clips'][name]={'image':f'char_anim_{name}.png','image_size':list(im.size),'frame_size':[im.width/4,im.height/2],'fps':fps,'duration_seconds':8/fps,'loop':True}
(PIC/'character/character_animations.json').write_text(json.dumps(meta,indent=2)+'\n')
print('All six PNGs verified pixel-identical; all 32 animation frames nonempty.',flush=True)
