#!/usr/bin/env python3
"""Original layered DSP sound design, deterministic seed; no external samples.
Render native mono 44.1kHz WAV masters + mobile MP3, seamless beam OGG.
Run from repo root. Requires numpy, scipy, ffmpeg.
"""
import json, hashlib, subprocess, concurrent.futures
from pathlib import Path
import numpy as np
from scipy import signal
from scipy.io import wavfile
ROOT=Path(__file__).resolve().parents[1]; OUT=ROOT/'02_brave_guy/assets/source/sfx'; MASTER=ROOT/'_archive/game02/sfx/2026-11-15'
OUT.mkdir(parents=True,exist_ok=True); MASTER.mkdir(parents=True,exist_ok=True)
SR=44100; rng=np.random.default_rng(20261115)
def tone(d,f0,f1=None,decay=5,metal=False):
 t=np.arange(round(d*SR))/SR; f1=f0 if f1 is None else f1
 phase=2*np.pi*np.cumsum(np.geomspace(max(f0,1),max(f1,1),len(t)))/SR
 y=np.sin(phase)
 if metal:y+=.4*np.sin(phase*2.71)+.2*np.sin(phase*4.13)
 return y*np.exp(-decay*t/d)
def noise(d,lo=100,hi=5000,decay=6):
 n=round(d*SR);x=rng.normal(0,1,n);sos=signal.butter(2,[lo,hi],btype='bandpass',fs=SR,output='sos');x=signal.sosfilt(sos,x)
 return x*np.exp(-decay*np.arange(n)/n)
def mix(d,*layers):
 out=np.zeros(round(d*SR))
 for x,at,vol in layers:
  pos=round(at*SR);end=min(len(out),pos+len(x));out[pos:end]+=x[:end-pos]*vol
 return out
def bell(d,f=1100):return tone(d,f,decay=5,metal=True)
def whoosh(d=.22,bright=1800):
 t=np.arange(round(d*SR))/SR;return noise(d,250,min(10000,bright*3),0)*np.sin(np.pi*t/d)**1.7+tone(d,bright,bright*.3,4)*.1
sounds={}
def add(name,x,level=-5,loop=False):sounds[name]=(x,level,loop)
for i in range(1,4):
 add(f'punch_{i}',whoosh(.16+i*.035,1100+i*400),-8)
 add(f'hit_{i}',mix(.26,(tone(.2,170+i*30,52,9),0,.8),(noise(.13,500,6500),0,.5),(noise(.08,1800,9500),.012*i,.2)))
 add(f'enemy_down_{i}',mix(.32,(tone(.28,340+i*80,85+i*20,5,True),0,.5),(noise(.14,200,2000),.05,.2)),-11)
add('hit_heavy',mix(.45,(tone(.4,150,37,7),0,1),(noise(.2,200,6000),0,.6),(tone(.2,95,42,7),.11,.3)),-4)
add('kick_spin',mix(.46,(whoosh(.38,2000),0,.6),(tone(.2,145,45,8),.24,.8)))
add('dodge',mix(.22,(whoosh(.19,1300),0,.8),(noise(.12,1200,6500),.06,.2)),-9)
add('dodge_perfect',mix(.65,(bell(.6,1568),0,.7),(bell(.48,2352),.045,.3),(whoosh(.18,2500),0,.25)),-7)
add('hurt',mix(.25,(tone(.23,240,94,7),0,.7),(noise(.18,120,1800),0,.35)),-7)
add('student_punch',mix(.16,(noise(.12,200,1400),0,.5),(tone(.12,155,90,8),0,.4)),-11)
add('dash',mix(.6,(whoosh(.2,1600),0,.4),(whoosh(.33,3000),.1,.8),(tone(.25,130,35,8),.3,.8)))
add('ki_shot',mix(.42,(tone(.38,1100,180,5,True),0,.4),(whoosh(.32,2400),0,.6)))
add('ki_blast',mix(.55,(noise(.4,200,5500),0,.7),(tone(.45,180,42,6),0,.9),(bell(.4,1800),.02,.15)))
add('quake',mix(.8,(tone(.7,100,28,8),0,1),(noise(.65,40,700),0,.8),(noise(.16,1500,6000),.015,.4),(noise(.23,400,2500),.18,.25)),-4)
add('beam_start',mix(.7,(tone(.6,240,1800,1,True),0,.3),(whoosh(.6,2200),0,.6),(noise(.2,180,3500),.45,.7)))
t=np.arange(2*SR)/SR
# Integer-frequency harmonics and periodic noise make both value and slope loop naturally.
f=np.fft.rfftfreq(len(t),1/SR);spec=(rng.normal(size=len(f))+1j*rng.normal(size=len(f)))*np.exp(-((f-700)/600)**2);bed=np.fft.irfft(spec,n=len(t));bed/=max(abs(bed))
add('beam_loop',(.3*np.sin(2*np.pi*90*t)+.15*np.sin(2*np.pi*180*t)+.2*bed)*(.85+.15*np.cos(2*np.pi*8*t)),-11,True)
add('beam_end',mix(.8,(tone(.7,130,25,8),0,1),(noise(.65,90,5500),0,.8),(bell(.65,1200),.07,.25)),-4)
for name,notes,d in [('courage_full',[523,659,784],.58),('qi_full',[1047,1319,1568],.42),('revive',[784,1175,1568],.75),('wave',[262,392,523],.6),('combo_10',[659,988],.34),('combo_50',[659,988,1319],.46),('combo_100',[659,988,1319,1976],.65),('win',[523,659,784,1047],.9),('lose',[392,330,262],.9)]:
 add(name,mix(d,*[(bell(max(.14,d-i*.09),n),i*.09,.6) for i,n in enumerate(notes)]),-9 if name.startswith('combo') else -7)
add('transform_charge',mix(3,(tone(3,95,900,.1,True),0,.5),(noise(3,300,5000,0)*np.linspace(.02,.5,3*SR),0,.3)),-10)
add('transform_done',mix(.9,(tone(.7,180,45,7),0,1),(noise(.5,350,7000),0,.7),(bell(.8,784),.04,.3),(bell(.7,1175),.1,.25)),-4)
add('revert',mix(.45,(tone(.4,600,70,3,True),0,.5),(noise(.35,500,3000),0,.15)),-9)
add('guilt_tick',mix(.16,(tone(.14,100,70,7),0,.7),(noise(.1,150,700),.02,.3)),-15)
add('guilt_crack',mix(.45,*[(noise(.055,2200,12000),i*.065,.4) for i in range(5)],(bell(.36,2800),0,.2)),-9)
add('guilt_burst',mix(1,(tone(.8,130,28,8),0,1),(noise(.7,60,8000),0,.8),*[(bell(.4,1800+i*430),i*.055,.14) for i in range(7)]),-4)
add('spawn',mix(.17,(tone(.14,330,115,5),0,.7),(noise(.08,350,2100),0,.2)),-14)
add('enemy_fly',whoosh(.32,2700),-13)
add('guard',mix(.2,(bell(.18,420),0,.7),(noise(.055,2000,7500),0,.25)),-8)
add('mask_off',mix(.4,(tone(.35,700,180,5,True),0,.5),(bell(.28,1700),.02,.4)),-9)
add('enemy_shot',whoosh(.2,1800),-10)
add('boss_warn',mix(.5,(tone(.45,350,1100,1,True),0,.6),(tone(.4,370,1140,1),0,.2)),-9)
add('boss_slam',mix(.85,(tone(.75,90,26,8),0,1),(noise(.7,50,1800),0,.9),(noise(.14,900,7000),.015,.4)),-4)
add('junxiong_pop',mix(.4,(tone(.35,300,1150,6,True),0,.6),(noise(.14,250,5000),0,.25)),-8)
for name,fs in [('ui_tap',[900]),('ui_confirm',[784,1175]),('ui_back',[660,440]),('notify',[1397,1760]),('punch_clock',[1200]),('lock_switch',[880,1320])]:
 add(name,mix(.25,*[(tone(.15,f,decay=7),i*.05,.5) for i,f in enumerate(fs)]),-11)
add('bubble',mix(.3,(tone(.16,440,180,8),0,.4),(bell(.25,1800),.025,.2)),-14)
add('pan_fly',mix(.35,(whoosh(.32,1500),0,.5),(bell(.3,730),0,.2)),-10)
add('pan_hit',mix(.55,(bell(.5,430),0,.7),(bell(.45,910),0,.35),(noise(.07,1200,9000),0,.2)),-7)
add('applause',mix(.6,*[(noise(.09,650+i*120,9000),at,.5) for i,at in enumerate([0,.03,.19,.23,.41,.46])]),-13)
add('chips',mix(.55,*[(noise(.055,1300,10000),at,.5) for at in [0,.07,.19,.27,.36]]),-13)
t=np.arange(round(.5*SR))/SR
add('whistle',np.sin(2*np.pi*2300*t+2*np.sin(2*np.pi*18*t))*np.sin(np.pi*t/.5)**.6,-14)
add('fan',mix(.28,(noise(.06,1500,9000),0,.6),(noise(.15,400,5500),.04,.5),(tone(.16,300,120,8),.02,.3)),-9)
add('pie',mix(.6,(bell(.3,1047),0,.4),(tone(.3,450,65,3,True),.24,.5)),-10)
add('folaidi_tick',mix(.24,(bell(.18,760),0,.4),(noise(.04,1500,6000),0,.2)),-12)
add('folaidi_flicker',mix(.55,*[(noise(.07,200,7500),at,.4) for at in [0,.12,.16,.33]],(tone(.5,60,decay=4),0,.25)),-12)
add('folaidi_rise',mix(1.6,(tone(1.6,65,520,.2,True),0,.35),(whoosh(1.6,900),0,.6)),-10)
add('folaidi_reveal',mix(1.1,(tone(.9,110,30,7),0,1),(noise(.7,100,4500),0,.75),(bell(.8,440),.04,.2),(bell(.7,466),.04,.2)),-5)
rows=[]
for name,(x,level,loop) in sounds.items():
 x=x-np.mean(x)
 if not loop:
  fade=min(len(x)//4,round(.008*SR));x[:80]*=np.linspace(0,1,80);x[-fade:]*=np.linspace(1,0,fade)
 x=x/max(abs(x))*10**(level/20)
 filename='sfx_'+name;wav=MASTER/(filename+'.wav');wavfile.write(wav,SR,(x*32767).astype(np.int16))
 rows.append({'name':name,'file':filename,'duration':len(x)/SR,'sampleRate':SR,'channels':1,'peakDbFS':round(20*np.log10(max(abs(x))),2),'rmsDbFS':round(20*np.log10(np.sqrt(np.mean(x*x))),2),'loop':loop,'loopSeconds':len(x)/SR if loop else None,'master':str(wav.relative_to(ROOT))})
def encode(r):
 src=ROOT/r['master'];target=OUT/(r['file']+'.mp3');subprocess.run(['ffmpeg','-v','error','-y','-i',str(src),'-c:a','libmp3lame','-b:a','96k',str(target)],check=True)
 r['url']='assets/source/sfx/'+target.name;r['bytes']=target.stat().st_size;r['sha256']=hashlib.sha256(target.read_bytes()).hexdigest()
 if r['loop']:
  target=OUT/(r['file']+'.ogg');subprocess.run(['ffmpeg','-v','error','-y','-i',str(src),'-c:a','libvorbis','-q:a','4',str(target)],check=True);r['url']='assets/source/sfx/'+target.name
 r['bytes']=target.stat().st_size;r['sha256']=hashlib.sha256(target.read_bytes()).hexdigest()
 return r
with concurrent.futures.ThreadPoolExecutor(4) as ex:rows=list(ex.map(encode,rows))
report={'date':'2026-11-15','tool':'Original layered DSP: Python/numpy/scipy + ffmpeg; reproducible tools/make_game02_sfx.py','rights':'Original synthesis; no recordings, third-party samples, cloned voices or commercial sound packs.','encoding':'MP3 96kbps mono 44.1kHz; seamless beam also OGG q4','files':rows,'runtimeBytes':sum(p.stat().st_size for p in OUT.iterdir())}
(ROOT/'02_brave_guy/assets/source/SFX_DELIVERY.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(len(rows),'SFX;',report['runtimeBytes'],'runtime bytes')
