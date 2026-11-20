"""Master licensed real audience recordings; sources/rights in crowd-v4/SOURCES.json."""
from pathlib import Path
import subprocess,json,hashlib
root=Path(__file__).resolve().parents[1]
archive=root/'_archive/game02/sfx/2026-11-15/crowd-v4'
out=root/'02_brave_guy/assets/source/sfx'
rows=[]
for name,source,filters in [
 ('applause_crowd','original-applause-cc0.wav','highpass=f=140,lowpass=f=10000,equalizer=f=3200:t=q:w=1:g=-2,loudnorm=I=-20:TP=-5:LRA=9,afade=t=in:d=0.12,afade=t=out:st=4.7:d=1.62'),
 ('crowd_cheer','original-cheers-public-domain.ogg','highpass=f=120,lowpass=f=8500,loudnorm=I=-23:TP=-8:LRA=9,afade=t=in:d=0.15,afade=t=out:st=9.4:d=2.2')]:
 master=archive/('sfx_'+name+'.wav');target=out/('sfx_'+name+'.mp3')
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(archive/source),'-af',filters,'-ar','44100','-ac','2','-c:a','pcm_s16le',str(master)],check=True)
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(master),'-c:a','libmp3lame','-b:a','192k',str(target)],check=True)
 rows.append({'name':name,'source':str((archive/source).relative_to(root)),'master':str(master.relative_to(root)),'url':'assets/source/sfx/'+target.name,'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'filters':filters})
(root/'02_brave_guy/assets/records/brave_guy_record11_crowd_sfx_delivery.json').write_text(json.dumps({'sources':json.loads((archive/'SOURCES.json').read_text()),'files':rows,'tool':'tools/make_game02_crowd.py','note':'Real audience applause (CC0) and human woo/woohoo crowd shouts (public domain), mastered separately and layered at runtime. Mono cheer source encoded stereo, not a stereo field recording.'},ensure_ascii=False,indent=2)+'\n')
