#!/usr/bin/env python3
"""Deterministic, noise-free replacement cues selected by the saved spectral audit.
Keep original media, write PCM masters under source/sfx/clean, update all aliases.
Spectral screening is not a substitute for the user's listening review.
"""
import json, math, wave, hashlib
from pathlib import Path
import numpy as np
from scipy import signal
ROOT=Path(__file__).resolve().parents[1]; GAME=ROOT/'02_brave_guy'; SR=44100
OUT=GAME/'assets/source/sfx/clean';OUT.mkdir(exist_ok=True)
rows=json.loads((ROOT/'docs/reports/2026-11-16-sfx-before.json').read_text())
manifest=GAME/'assets/manifest.json'; m=json.loads(manifest.read_text()); changes=[]
def voice(d, f, end=None):
 t=np.arange(round(d*SR))/SR;end=f if end is None else end
 phase=2*np.pi*(f*t+(end-f)*t*t/(2*d))
 env=np.minimum(1,t/.006)*np.exp(-5*t/d)*np.minimum(1,(d-t)/.025)
 return (np.sin(phase)+.12*np.sin(phase*2))*env
def arrange(notes):
 out=np.zeros(round(max(at+len(x)/SR for at,x in notes)*SR)+1)
 for at,x in notes: out[round(at*SR):round(at*SR)+len(x)]+=x
 return out
for r in rows:
 old=r['url'];name=Path(old).stem.removeprefix('sfx_');seed=int(hashlib.sha256(name.encode()).hexdigest()[:6],16)
 ui=name.startswith('ui_') or name in ['lock_switch','punch_clock','bubble','notify','guilt_tick','folaidi_tick']
 if not (r['flatness']>=.06 or r['high_ratio']>=.25 or ui):continue
 if name=='crowd_cheer':
  # Keep the recorded voices; remove hiss and lower level instead of inventing a crowd.
  import subprocess
  x=np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',str(GAME/old),'-f','f32le','-ac','1','-ar',str(SR),'-']),np.float32)
  x=signal.sosfilt(signal.butter(4,3200,fs=SR,output='sos'),x);kind='crowd_filtered';level=-14
 elif name=='beam_loop':
  t=np.arange(SR)/SR;x=(np.sin(2*np.pi*110*t)+.22*np.sin(2*np.pi*220*t))*(.8+.2*np.cos(2*np.pi*3*t));kind='energy_loop';level=-16
 elif ui:
  f=440*2**((seed%8)/12);notes=[(0,voice(.12,f))]
  if name in ['ui_confirm','notify']:notes.append((.065,voice(.18,f*1.5)*.75))
  if name=='ui_back':notes.append((.06,voice(.14,f*.75)*.7))
  x=arrange(notes);kind='soft_ui';level=-21 if name in ['bubble','guilt_tick','folaidi_tick'] else -17
 elif name.startswith(('tf_','combo_')) or name in ['courage_full','qi_full','dodge_perfect','lose']:
  base=440*2**((seed%5)/12);ratios=[1,1.25,1.5] if name!='lose' else [1,.84,.67]
  x=arrange([(i*.09,voice(.28,base*f)*(.8**i)) for i,f in enumerate(ratios)]);kind='harmonic_chime';level=-15
 elif name.startswith(('hit','enemy_down','kick')) or name in ['ki_blast','guilt_burst']:
  f=130+seed%70;x=arrange([(0,voice(.23,f,55)),(.012,voice(.065,650+seed%200,220)*.3)]);kind='body_impact';level=-10
 elif name.startswith('punch_') or name in ['dodge','dash','pan_fly']:
  x=arrange([(0,voice(.19,420+seed%180,150)),(.018,voice(.15,620,230)*.15)]);kind='rounded_sweep';level=-16
 else:
  x=arrange([(0,voice(.34,220+seed%180,90)),(.025,voice(.24,660,330)*.3)]);kind='energy_impact';level=-13
 x=x/max(np.max(np.abs(x)),1e-8)*10**(level/20)
 if name!='beam_loop':
  n=min(441,len(x)//2);x[:n]*=np.linspace(0,1,n);x[-n:]*=np.linspace(1,0,n)
 target=OUT/f'sfx_{name}_clean.wav'
 with wave.open(str(target),'wb') as w:
  w.setparams((1,2,SR,0,'NONE','not compressed'));w.writeframes(np.round(x*32767).astype('<i2').tobytes())
 new=str(target.relative_to(GAME))
 for k,v in m['sfx'].items():m['sfx'][k]=[new if u==old else u for u in v] if isinstance(v,list) else new if v==old else v
 changes.append(dict(original=old,replacement=new,design=kind,peak_target_db=level))
manifest.write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n')
(ROOT/'docs/reports/2026-11-16-sfx-replacements.json').write_text(json.dumps(changes,indent=2)+'\n')
print('Replaced/processed',len(changes),'unique files; originals retained.')
