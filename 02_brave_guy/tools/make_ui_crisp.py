"""Original short glass/wood UI clicks, deterministic PCM masters used directly in game."""
from pathlib import Path
import json
import numpy as np
from scipy import signal
from scipy.io import wavfile
R=Path(__file__).resolve().parents[1];sr=44100;rng=np.random.default_rng(20261116)
report=[]
for name,length,notes in [('tap',.115,[(0,1700,.7),(0,3000,.18)]),('confirm',.205,[(0,1700,.55),(.045,2550,.6),(.045,3400,.13)]),('back',.145,[(0,1900,.55),(.035,1250,.5)])]:
 t=np.arange(round(length*sr))/sr;y=np.zeros_like(t)
 for at,hz,gain in notes:
  q=np.maximum(t-at,0);env=(t>=at)*(1-np.exp(-q/.0007))*np.exp(-q/.023)
  y+=gain*np.sin(2*np.pi*hz*q)*env
 # Dry, tiny transient gives a crisp press rather than a long musical note.
 noise=signal.sosfilt(signal.butter(2,[1600,6500],btype='bandpass',fs=sr,output='sos'),rng.normal(size=len(t)))
 y+=.22*noise*(1-np.exp(-t/.0006))*np.exp(-t/.004)
 y*=np.minimum(1,np.maximum(0,(length-t)/.012));y-=y.mean();y*=10**(-4/20)/np.max(np.abs(y))
 path=R/f'assets/source/sfx/sfx_ui_{name}_crisp_v3.wav';wavfile.write(path,sr,np.round(y*32767).astype(np.int16))
 report.append(dict(name=name,path=str(path.relative_to(R)),sampleRate=sr,duration=length,bytes=path.stat().st_size,peakDBFS=round(20*np.log10(np.max(np.abs(y))),2)))
p=R/'assets/manifest.json';d=json.loads(p.read_text());
for name in ['tap','confirm','back']:d['sfx']['ui_'+name]=f'assets/source/sfx/sfx_ui_{name}_crisp_v3.wav'
d['sfx']['ui']=d['sfx']['ui_tap'];p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
(R/'assets/source/UI_CRISP_V3.json').write_text(json.dumps(report,indent=2)+'\n');print(report)
