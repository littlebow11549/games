#!/usr/bin/env python3
"""Original short wooden UI tap; no noise/sample layers. 44.1kHz PCM16 mono."""
import math,struct,wave
from pathlib import Path
rate=44100;duration=.085
notes=[(420,.085,.10),(1159,.05,.012)]
samples=[]
for i in range(round(rate*duration)):
 t=i/rate;v=0
 for frequency,length,gain in notes:
  if t>=length:continue
  if t<.008:env=t/.008
  elif t<length-.025:env=.025**((t-.008)/(length-.025-.008))
  else:env=.025*(length-t)/.025
  v+=math.sin(2*math.pi*frequency*t)*env*gain
 samples.append(round(v*32767))
p=Path(__file__).resolve().parents[1]/'02_brave_guy/assets/source/sfx/brave_guy_sfx33_dialog_next.wav'
with wave.open(str(p),'wb') as w:
 w.setparams((1,2,rate,0,'NONE','not compressed'));w.writeframes(struct.pack('<'+'h'*len(samples),*samples))
print(p.name, len(samples)/rate, 'seconds; peak',20*math.log10(max(map(abs,samples))/32767),'dBFS')
