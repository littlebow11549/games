"""GIF previews of the existing sprite frames, without modifying source PNGs."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import math,json,hashlib
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'assets/source/pic/character';OUT=ROOT/'assets/preview';OUT.mkdir(parents=True,exist_ok=True)
W,H=320,360
clips=[('idle',3,'BREATHING + BLINK'),('happy',8,'HAPPY'),('sad',5,'SAD'),('celebrate',8,'CELEBRATE')]
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',16)
frames={};source_hashes={}
for name,fps,label in clips:
 p=SOURCE/f'char_anim_{name}.png';source_hashes[p.name]=hashlib.sha256(p.read_bytes()).hexdigest();sheet=Image.open(p).convert('RGBA');parts=[]
 for i in range(8):
  c=i%4;r=i//4
  crop=sheet.crop((round(c*sheet.width/4),round(r*sheet.height/2),round((c+1)*sheet.width/4),round((r+1)*sheet.height/2)))
  crop.thumbnail((W-22,H-50),Image.Resampling.LANCZOS)
  canvas=Image.new('RGB',(W,H),(7,19,34));draw=ImageDraw.Draw(canvas)
  draw.rounded_rectangle((8,8,W-9,H-9),radius=20,outline=(40,73,98),width=1)
  draw.text((W/2,24),label,font=font,fill=(248,213,119),anchor='mt')
  canvas.paste(crop,((W-crop.width)//2,H-17-crop.height),crop)
  parts.append(canvas)
 frames[name]=parts
# A shared palette keeps colors stable between frames (GIF is preview-only).
training=Image.new('RGB',(8*W,4*H))
for row,(name,_,_) in enumerate(clips):
 for col,img in enumerate(frames[name]):training.paste(img,(col*W,row*H))
palette=training.quantize(colors=256,method=Image.Quantize.MEDIANCUT)
def save(name,sequence,durations):
 indexed=[im.quantize(palette=palette,dither=Image.Dither.NONE) for im in sequence]
 p=OUT/name;indexed[0].save(p,save_all=True,append_images=indexed[1:],duration=durations,loop=0,optimize=False,disposal=2)
 with Image.open(p) as gif:
  duration=0
  for i in range(gif.n_frames):gif.seek(i);gif.load();duration+=gif.info.get('duration',0)
  assert gif.n_frames>1
  return {'file':name,'frames':gif.n_frames,'duration_ms':duration,'bytes':p.stat().st_size,'size':list(gif.size)}
results=[]
for name,fps,_ in clips:
 times=[round(i*100/fps)*10 for i in range(9)]
 results.append(save(f'character_{name}.gif',frames[name],[times[i+1]-times[i] for i in range(8)]))
combined=[];count=96
for n in range(count):
 t=n/12;canvas=Image.new('RGB',(2*W,2*H),(7,19,34))
 for i,(name,fps,_) in enumerate(clips):canvas.paste(frames[name][int(t*fps)%8],((i%2)*W,(i//2)*H))
 combined.append(canvas)
times=[round(i*100/12)*10 for i in range(count+1)]
results.append(save('character_all.gif',combined,[times[i+1]-times[i] for i in range(count)]))
for name,digest in source_hashes.items():assert hashlib.sha256((SOURCE/name).read_bytes()).hexdigest()==digest
(OUT/'character_gif_preview.json').write_text(json.dumps({'previews':results,'source_png_unchanged':True,'purpose':'GIF preview only; PNG source assets remain lossless','layout':'combined: top-left idle, top-right happy, bottom-left sad, bottom-right celebrate'},indent=2)+'\n')
print(json.dumps(results,indent=2),flush=True)
