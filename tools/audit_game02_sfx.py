import json,subprocess,numpy as np
from pathlib import Path
root=Path(__file__).resolve().parents[1]/'02_brave_guy'; m=json.loads((root/'assets/manifest.json').read_text()); rows=[]
for url in sorted({u for v in m['sfx'].values() for u in (v if isinstance(v,list) else [v]) if u}):
 x=np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',str(root/url),'-f','f32le','-ac','1','-ar','22050','-']),np.float32)
 frames=np.lib.stride_tricks.sliding_window_view(x,512)[::256]; rms=np.sqrt((frames**2).mean(1)); frames=frames[rms>max(rms.max()*.1,1e-5)]
 p=abs(np.fft.rfft(frames*np.hanning(512)))**2; f=np.fft.rfftfreq(512,1/22050); band=p[:,(f>150)&(f<9000)]+1e-15
 flat=np.exp(np.log(band).mean(1))/band.mean(1); weights=(frames**2).sum(1)
 row=dict(url=url,seconds=round(len(x)/22050,3),peak_db=round(float(20*np.log10(max(abs(x))+1e-12)),2),flatness=round(float(np.average(flat,weights=weights)),4),high_ratio=round(float(p[:,f>5000].sum()/p.sum()),4)); rows.append(row)
Path(__import__('sys').argv[1] if len(__import__('sys').argv)>1 else '/tmp/sfx-audit.json').write_text(json.dumps(rows,indent=2));
for r in sorted(rows,key=lambda r:r['flatness'],reverse=True): print(Path(r['url']).name, r['flatness'],r['high_ratio'],r['peak_db'])
print('TOTAL',len(rows))
