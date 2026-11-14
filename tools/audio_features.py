#!/usr/bin/env python3
"""量測音樂的節奏、調性、頻段比例與動態，用來和參考曲比較。

用法：先把音檔轉成單聲道 22050 Hz 的 WAV，再丟給這支程式（需 numpy）：
  ffmpeg -i 曲子.ogg -ac 1 -ar 22050 曲子.wav
  python3 tools/audio_features.py 曲子.wav [其他.wav ...]
響度另外用：ffmpeg -i 曲子.ogg -af loudnorm=print_format=summary -f null -
"""
import sys, wave, numpy as np
def load(p):
    w=wave.open(p); x=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float32)/32768; return x,w.getframerate()
def feats(p):
    x,sr=load(p); N=2048; H=512
    fr=np.lib.stride_tricks.sliding_window_view(x,N)[::H]*np.hanning(N)
    S=np.abs(np.fft.rfft(fr,axis=1)); f=np.fft.rfftfreq(N,1/sr)
    P=S**2; tot=P.sum()+1e-9
    band=lambda a,b: 100*P[:,(f>=a)&(f<b)].sum()/tot
    cent=(S*f).sum(1)/(S.sum(1)+1e-9)
    flux=np.maximum(0,np.diff(np.log1p(S),axis=0)).sum(1); flux-=flux.mean()
    # tempo by autocorrelation
    ac=np.correlate(flux,flux,'full')[len(flux)-1:]; fps=sr/H
    lags=np.arange(int(fps*60/200),int(fps*60/60)); bpm=60*fps/lags; w=np.exp(-0.5*((np.log2(bpm/120))/0.9)**2)
    best=lags[np.argmax(ac[lags]*w)]; tempo=60*fps/best
    top=sorted([(ac[l],60*fps/l) for l in lags],reverse=True)[:1]
    # onsets per second
    th=flux.mean()+1.0*flux.std(); pk=(flux[1:-1]>th)&(flux[1:-1]>flux[:-2])&(flux[1:-1]>=flux[2:]); ons=pk.sum()/(len(x)/sr)
    # chroma / key
    chroma=np.zeros(12)
    for i,fq in enumerate(f):
        if 60<fq<4000: chroma[int(round(12*np.log2(fq/440)+69))%12]+=P[:,i].sum()
    maj=np.array([6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88]); mi=np.array([6.33,2.68,3.52,5.38,2.6,3.53,2.54,4.75,3.98,2.69,3.34,3.17])
    names=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']; best=(-9,'')
    for k in range(12):
        for prof,nm in((maj,'大調'),(mi,'小調')):
            c=np.corrcoef(np.roll(prof,k),chroma)[0,1]
            if c>best[0]: best=(c,names[k]+nm)
    rms=np.sqrt((fr**2).mean(1)); dyn=20*np.log10(np.percentile(rms,95)/(np.percentile(rms,10)+1e-9))
    # percussive ratio: energy in transient frames
    print(f"{p:22s} {len(x)/sr:5.1f}s tempo≈{tempo:5.1f}BPM onsets/s={ons:4.1f} key≈{best[1]}({best[0]:.2f}) centroid={np.median(cent):5.0f}Hz  sub<120={band(20,120):4.1f}% low120-400={band(120,400):4.1f}% mid400-2k={band(400,2000):4.1f}% hi2k-6k={band(2000,6000):4.1f}% air>6k={band(6000,11025):4.1f}% dyn={dyn:4.1f}dB")
for p in sys.argv[1:]: feats(p)
