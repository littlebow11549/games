"""Decode all audio and record levels/seams without changing the source."""
from pathlib import Path
import subprocess,json,numpy as np
ROOT=Path(__file__).resolve().parents[1];rows=[]
files=sorted((ROOT/'assets/source/music').glob('*'))+sorted((ROOT/'assets/source/sfx').glob('*.mp3'))
for path in files:
 if path.suffix not in ['.mp3','.ogg']:continue
 raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(path),'-f','f32le','-ac','2','-ar','44100','pipe:1'])
 pcm=np.frombuffer(raw,dtype='<f4').reshape(-1,2);assert np.isfinite(pcm).all()
 peak=float(np.abs(pcm).max());rms=float(np.sqrt(np.mean(pcm*pcm)))
 row={'file':str(path.relative_to(ROOT)),'seconds':len(pcm)/44100,'peak_dbfs':round(float(20*np.log10(max(peak,1e-12))),2),'rms_dbfs':round(float(20*np.log10(max(rms,1e-12))),2),'clipped_samples':int((np.abs(pcm)>=1).sum())}
 if 'bgm_' in path.name:row['loop_boundary_step']=float(np.abs(pcm[0]-pcm[-1]).max())
 assert row['clipped_samples']==0,row
 rows.append(row)
(ROOT/'assets/AUDIO_QA.json').write_text(json.dumps({'audio':rows,'runtime_music_gain':.38,'ducked_music_gain':.18,'runtime_sfx_gain':.55,'method':'Complete decode, peak/RMS and loop-boundary measurement; browser playback/loop tests separately. Physical handset listening not performed.'},indent=2)+'\n')
print(json.dumps(rows,indent=2))
