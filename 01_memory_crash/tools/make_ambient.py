"""Animate native atmospheric plate; periodic particles and rays, no spatial upscale."""
from pathlib import Path
import subprocess,json
import numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
source=ROOT/'assets/source'
base=np.asarray(Image.open(source/'pic/fx/ambient_plate.png').convert('RGB'),dtype=np.float32)
h,w=base.shape[:2]; y,x=np.mgrid[:h,:w].astype(np.float32);x/=w;y/=h
out=source/'video/vid_ambient.webm'
cmd=['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{w}x{h}','-r','24','-i','-','-an','-c:v','libvpx-vp9','-lossless','1','-pix_fmt','gbrp','-threads','4',str(out)]
p=subprocess.Popen(cmd,stdin=subprocess.PIPE)
rng=np.random.default_rng(188);dots=rng.random((24,4))
first=None;last=None
for n in range(144):
 phase=2*np.pi*n/144
 light=np.zeros((h,w),np.float32)
 for dx,dy,speed,offset in dots:
  px=dx+.018*np.sin(phase+offset*6.28);py=(dy+n/144*(1 if speed>.5 else -1))%1
  light+=np.exp(-((x-px)**2+(y-py)**2)/.000008)*(.25+.75*(.5+.5*np.sin(phase+offset*6.28)))
 rays=np.exp(-((x-(.12+.045*np.sin(phase)+y*.12))/.065)**2)*(1-y)**2
 rays+=np.exp(-((x-(.88+.045*np.sin(phase+1)-y*.12))/.07)**2)*(1-y)**2
 frame=np.clip(base+light[:,:,None]*np.array([26,80,104])+rays[:,:,None]*np.array([1.5,5,7]),0,255).astype(np.uint8)
 if n==0:first=frame.copy()
 last=frame;p.stdin.write(frame.tobytes())
p.stdin.close();assert p.wait()==0
runtime=ROOT/'assets/runtime/video/vid_ambient.webm'
subprocess.run(['ffmpeg','-v','error','-y','-i',str(out),'-vf','crop=trunc(iw/2)*2:trunc(ih/2)*2','-an','-c:v','libvpx-vp9','-crf','18','-b:v','0','-pix_fmt','yuv420p','-threads','4',str(runtime)],check=True)
meta=dict(width=w,height=h,fps=24,frames=144,seconds=6,audio=False,source_encoding='VP9 RGB lossless',runtime_encoding='VP9 CRF18 lossy playback derivative, cropped to even dimensions, no resize',periodic=True,seam_mean_abs_delta=float(np.abs(first.astype(float)-last.astype(float)).mean()),source_bytes=out.stat().st_size,runtime_bytes=runtime.stat().st_size)
(source/'video/vid_ambient.json').write_text(json.dumps(meta,indent=2));print(meta)
