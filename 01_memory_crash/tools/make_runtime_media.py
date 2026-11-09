"""Retain lossless source masters; create small HD video playback derivatives."""
from pathlib import Path
import subprocess,json,concurrent.futures
from PIL import Image
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'assets/runtime';(OUT/'video').mkdir(parents=True,exist_ok=True);(OUT/'pic').mkdir(parents=True,exist_ok=True)
def video(name):
 source=ROOT/'assets/source/video'/name;dest=OUT/'video'/name
 subprocess.run(['ffmpeg','-y','-v','error','-i',str(source),'-an','-c:v','libvpx-vp9','-pix_fmt','yuv420p','-b:v','0','-crf','18','-deadline','good','-cpu-used','4','-threads','2','-row-mt','1','-g','96',str(dest)],check=True)
 return {'file':str(dest.relative_to(ROOT)),'source':str(source.relative_to(ROOT)),'source_bytes':source.stat().st_size,'bytes':dest.stat().st_size,'width':1080,'height':1920,'codec':'VP9','lossless':False,'quality':'CRF18 web playback; lossless RGB source master retained'}
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:rows=list(pool.map(video,['vid_01.webm','vid_warp.webm']))
source=ROOT/'assets/source/pic/fx/fx_01.png';dest=OUT/'pic/fx_01.webp';im=Image.open(source);im.save(dest,format='WEBP',lossless=True,exact=True,method=6)
check=Image.open(dest);assert check.mode==im.mode and check.size==im.size and check.tobytes()==im.tobytes()
rows.append({'file':str(dest.relative_to(ROOT)),'source':str(source.relative_to(ROOT)),'source_bytes':source.stat().st_size,'bytes':dest.stat().st_size,'lossless':True,'decoded_pixels_identical':True})
(OUT/'MEDIA.json').write_text(json.dumps(rows,indent=2)+'\n');print(json.dumps(rows,indent=2),flush=True)
