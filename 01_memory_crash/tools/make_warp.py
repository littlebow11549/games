"""Original deterministic seamless hyperspace animation, no external footage.
Requires numpy, Pillow, ffmpeg. Encodes 1080x1920 VP9 lossless WebM.
"""
from pathlib import Path
import hashlib,json,math,subprocess
import numpy as np
from PIL import Image,ImageDraw,ImageFilter
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/source/video';OUT.mkdir(parents=True,exist_ok=True)
W,H=1080,1920;FPS=24;SECONDS=4;FRAMES=FPS*SECONDS
rng=np.random.default_rng(20261109)
stars=[(float(rng.uniform(0,2*math.pi)),float(rng.random()),float(rng.uniform(.5,1.3))) for _ in range(130)]
y,x=np.mgrid[0:H,0:W];cx,cy=W/2,H*.43
r=np.sqrt(((x-cx)/W)**2+((y-cy)/H)**2)
glow=np.exp(-r*5)
base=np.stack([5+glow*2,12+glow*15,29+glow*37],axis=-1).astype('uint8')
base=Image.fromarray(base)
R=math.hypot(W,H)*.64

def frame(n):
    phase=(n%FRAMES)/FRAMES
    canvas=base.copy();light=Image.new('RGB',(W,H));d=ImageDraw.Draw(light)
    for angle,offset,strength in stars:
        q=(offset+phase)%1
        fade=math.sin(math.pi*q)**1.5
        radius=R*q*q
        length=(8+q**3*155)*strength
        x0=cx+math.cos(angle)*radius;y0=cy+math.sin(angle)*radius
        x1=cx+math.cos(angle)*(radius+length);y1=cy+math.sin(angle)*(radius+length)
        color=tuple(int(v*fade*strength/1.3) for v in (68,193,255))
        d.line((x0,y0,x1,y1),fill=color,width=2 if q<.6 else 3)
        if q>.4:d.ellipse((x1-1.4,y1-1.4,x1+1.4,y1+1.4),fill=tuple(int(v*fade) for v in (180,233,255)))
    for offset in (0,.33,.66):
        q=(phase+offset)%1;rad=40+q*R*.65;opacity=math.sin(math.pi*q)**2
        d.ellipse((cx-rad,cy-rad*.78,cx+rad,cy+rad*.78),outline=(0,int(50*opacity),int(85*opacity)),width=2)
    bloom=light.filter(ImageFilter.GaussianBlur(7))
    # Additive glow with a deterministic 8-bit output; no temporal noise.
    rgb=np.minimum(np.array(canvas,dtype=np.uint16)+np.array(light,dtype=np.uint16)+np.array(bloom,dtype=np.uint16)*2,255).astype('uint8')
    return rgb.tobytes()

first=frame(0);assert first==frame(FRAMES),'Loop endpoint mismatch'
cmd=['ffmpeg','-y','-v','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','pipe:0','-an','-c:v','libvpx-vp9','-lossless','1','-pix_fmt','gbrp','-deadline','good','-cpu-used','4','-row-mt','1',str(OUT/'vid_warp.webm')]
p=subprocess.Popen(cmd,stdin=subprocess.PIPE)
try:
    for n in range(FRAMES):
        p.stdin.write(frame(n))
        if n%24==0:print(f'Rendered {n}/{FRAMES}',flush=True)
finally:p.stdin.close()
if p.wait()!=0:raise RuntimeError('ffmpeg failed')
# Decode the first encoded frame and compare RGB bytes to the source.
check=subprocess.check_output(['ffmpeg','-v','error','-i',str(OUT/'vid_warp.webm'),'-frames:v','1','-f','rawvideo','-pix_fmt','rgb24','pipe:1'])
assert first==check,'Encoded RGB differs from source'
report={'file':'vid_warp.webm','width':W,'height':H,'fps':FPS,'frames':FRAMES,'seconds':SECONDS,'codec':'VP9 lossless RGB','opaque':True,'audio':False,'source':'Original procedural animation','loop_endpoint_identical':True,'decoded_first_frame_matches_source':True,'first_frame_sha256':hashlib.sha256(first).hexdigest(),'bytes':(OUT/'vid_warp.webm').stat().st_size}
(OUT/'vid_warp.json').write_text(json.dumps(report,indent=2)+'\n');print(report,flush=True)
