"""Original crystal synth score and effects. Requires numpy and ffmpeg."""
from pathlib import Path
import subprocess
import tempfile
import wave
import numpy as np

RATE = 44100
OUT = Path(__file__).resolve().parents[1] / 'assets/source'
(OUT / 'music').mkdir(parents=True, exist_ok=True)
(OUT / 'sfx').mkdir(parents=True, exist_ok=True)

def bell(freq, duration=.38):
    t = np.arange(int(RATE * duration)) / RATE
    attack = 1 - np.exp(-t * 700)
    return attack * sum(amp * np.sin(2*np.pi*freq*ratio*t) * np.exp(-t/decay)
        for ratio, amp, decay in [(1,.65,.18),(2,.18,.10),(3.01,.08,.055),(5.02,.025,.025)])

def place(track, note, when, gain=1, pan=0, loop=False):
    idx = np.arange(len(note)) + int(when * RATE)
    if loop:
        idx %= len(track)
    else:
        ok = idx < len(track)
        idx, note = idx[ok], note[ok]
    track[idx,0] += note * gain * np.sqrt((1-pan)/2)
    track[idx,1] += note * gain * np.sqrt((1+pan)/2)

def finish(name, track, loop=False):
    dry = track.copy()
    for sec, gain in [(.037,.12),(.071,.08),(.113,.055)]:
        shift = int(sec*RATE)
        if loop: track += np.roll(dry[:,::-1], shift, axis=0)*gain
        else: track[shift:] += dry[:-shift,::-1]*gain
    track = np.tanh(track*1.2)
    peak = np.max(np.abs(track))
    if peak > .88: track *= .88/peak
    if not loop:
        n = min(400, len(track)); track[-n:] *= np.linspace(1,0,n)[:,None]
    with tempfile.NamedTemporaryFile(suffix='.wav') as f:
        with wave.open(f.name,'wb') as w:
            w.setnchannels(2); w.setsampwidth(2); w.setframerate(RATE)
            w.writeframes((track*32767).astype('<i2').tobytes())
        subprocess.run(['ffmpeg','-y','-v','error','-i',f.name,'-codec:a','libmp3lame','-b:a','192k',str(OUT / ('music' if name.startswith('bgm_') else 'sfx') / name)],check=True)
        if name.startswith('bgm_'):
            subprocess.run(['ffmpeg','-y','-v','error','-i',f.name,'-codec:a','libvorbis','-q:a','6',str(OUT/'music'/name.replace('.mp3','.ogg'))],check=True)

for name, notes, duration in [
 ('sfx_01.mp3',[(784,0,.23)],.32),
 ('sfx_02.mp3',[(784,0,.28),(1174.66,.10,.33)],.52),
 ('sfx_03.mp3',[(196,0,.27),(185,.055,.25)],.45),
 ('sfx_04.mp3',[(523.25,0,.5),(659.25,.12,.5),(784,.24,.5),(1046.5,.38,.8),(1568,.43,.7)],1.5),
 ('sfx_05.mp3',[(523.25,0,.5),(440,.20,.5),(349.23,.40,.6),(261.63,.64,.7)],1.6)]:
    track=np.zeros((int(duration*RATE),2))
    for f,at,d in notes: place(track,bell(f,d),at,.62)
    finish(name,track)

beat=60/110
length=128*beat
track=np.zeros((round(length*RATE),2))
melody=[0,4,7,11,9,7,4,2, 0,4,7,12,11,7,4,2]
roots=[0,-3,-5,-7]
for bar in range(32):
    root=roots[(bar//2)%4]
    for step in range(8):
        when=(bar*4+step*.5)*beat
        semi=melody[(bar%2)*8+step]+root
        place(track,bell(523.25*2**(semi/12),.48),when,.17,(-1 if step%2 else 1)*.25,True)
    for step in range(4):
        t=np.arange(int(.30*RATE))/RATE
        f=130.8128*2**(root/12)
        bass=np.sin(2*np.pi*f*t)*(1-np.exp(-t*130))*np.exp(-t*13)
        place(track,bass,(bar*4+step)*beat,.22,0,True)
        t=np.arange(int(.13*RATE))/RATE
        kick=np.sin(2*np.pi*(49*t+3*(1-np.exp(-t*35))))*np.exp(-t*38)
        place(track,kick,(bar*4+step)*beat,.16,0,True)
finish('bgm_01.mp3',track,True)
print('Rendered original crystal BGM and five effects:', OUT)

# Master/high-level score: same melodic identity, faster groove, 40 complete bars.
beat=60/130
track=np.zeros((round(160*beat*RATE),2))
rng=np.random.default_rng(20261109)
for bar in range(40):
    root=roots[(bar//2)%4]
    for step in range(8):
        when=(bar*4+step*.5)*beat
        semi=melody[(bar%2)*8+step]+root
        place(track,bell(523.25*2**(semi/12),.42),when,.17,(-1 if step%2 else 1)*.3,True)
        t=np.arange(int(.055*RATE))/RATE
        noise=rng.normal(0,1,len(t));noise=np.r_[0,np.diff(noise)]
        hat=noise*(1-np.exp(-t*1000))*np.exp(-t*75)
        place(track,hat,when,.015,.35,True)
    for step in range(4):
        when=(bar*4+step)*beat
        t=np.arange(int(.30*RATE))/RATE
        freq=130.8128*2**(root/12)
        bass=(np.sin(2*np.pi*freq*t)+.18*np.sin(2*np.pi*freq*2*t))*(1-np.exp(-t*160))*np.exp(-t*13)
        place(track,bass,when,.23,0,True)
        t=np.arange(int(.16*RATE))/RATE
        kick=np.sin(2*np.pi*(48*t+3*(1-np.exp(-t*36))))*np.exp(-t*32)
        place(track,kick,when,.18,0,True)
        if step in (1,3):
            t=np.arange(int(.12*RATE))/RATE
            snare=(rng.normal(0,1,len(t))*.25+np.sin(2*np.pi*170*t)*.35)*(1-np.exp(-t*800))*np.exp(-t*35)
            place(track,snare,when,.07,-.15,True)
finish('bgm_02.mp3',track,True)
print('Master BGM plus gapless Ogg playback variants rendered.')
