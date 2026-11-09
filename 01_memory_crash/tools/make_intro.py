"""Original four-second logo reveal using the lossless warp scene."""
from pathlib import Path
from PIL import Image
import numpy as np,subprocess,json,hashlib
import make_warp as warp
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'assets/source/video'
logo=Image.open(ROOT/'assets/source/pic/branding/logo_01.png').convert('RGBA');logo.thumbnail((820,700),Image.Resampling.LANCZOS)
def frame(n):
    t=n/warp.FPS
    image=Image.frombytes('RGB',(warp.W,warp.H),warp.frame(n))
    fade=min(1,max(0,(t-.25)/.8))*min(1,max(0,(4-t)/.5))
    mark=logo.copy();mark.putalpha(mark.getchannel('A').point(lambda x:round(x*fade)))
    image.paste(mark,((warp.W-mark.width)//2,round(warp.H*.36)-mark.height//2),mark)
    return image.tobytes()
path=OUT/'vid_01.webm';cmd=['ffmpeg','-y','-v','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{warp.W}x{warp.H}','-r',str(warp.FPS),'-i','pipe:0','-an','-c:v','libvpx-vp9','-lossless','1','-pix_fmt','gbrp','-deadline','good','-cpu-used','4','-row-mt','1',str(path)]
p=subprocess.Popen(cmd,stdin=subprocess.PIPE)
try:
 for i in range(warp.FRAMES):
  p.stdin.write(frame(i))
  if i%24==0:print(f'Intro {i}/{warp.FRAMES}',flush=True)
finally:p.stdin.close()
assert p.wait()==0
check=subprocess.check_output(['ffmpeg','-v','error','-i',str(path),'-frames:v','1','-f','rawvideo','-pix_fmt','rgb24','pipe:1']);assert check==frame(0)
(OUT/'vid_01.json').write_text(json.dumps({'file':path.name,'width':warp.W,'height':warp.H,'seconds':4,'fps':warp.FPS,'codec':'VP9 lossless RGB','audio':False,'first_frame_matches_source':True,'bytes':path.stat().st_size,'source':'Original procedural warp plus existing logo'},indent=2)+'\n')
print('Intro rendered and RGB verified',path,flush=True)
