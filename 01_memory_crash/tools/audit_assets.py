"""Audit source delivery separately from runtime integration and pixel dimensions."""
from pathlib import Path
from PIL import Image
import subprocess,json
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'assets/source'
entries=[
 ('pic/background/bg_01.png',True,[1080,1920]),('pic/branding/logo_01.png',True,[900,700]),('pic/branding/icon_01.png',True,[512,512]),
 ('pic/titles/titles_01.png',True,[2048,2048]),('pic/titles/titles_02.png',True,[2048,1024]),('pic/ui/ui_01.png',True,[2048,2048]),
 ('pic/gems/gems_01.png',True,[2048,1536]),('pic/numbers/numbers_01.png',True,[2048,512]),('pic/font/font_01.png',True,[2048,2048]),
 ('pic/howto/howto_01.png',False,[2048,512]),('pic/character/char_01.png',True,[2048,2048]),
 *[(f'pic/character/char_anim_{s}.png',True,None) for s in ['idle','happy','sad','celebrate']],
 ('music/bgm_01.mp3',True,None),*[(f'sfx/sfx_{n:02}.mp3',True,None) for n in range(1,6)],
 ('video/vid_warp.webm',True,[1080,1920]),('pic/branding/blade_01.png',False,[400,900]),('pic/fx/fx_01.png',False,[1536,512]),
 ('music/bgm_02.mp3',False,None),('video/vid_01.webm',False,[1080,1920]),
]
rows=[]
for name,required,target in entries:
 p=SOURCE/name;row={'path':name,'required':required,'present':p.is_file(),'target_dimensions':target}
 if p.is_file():
  row['bytes']=p.stat().st_size
  if p.suffix=='.png':
   with Image.open(p) as im:
    im.load();row.update({'dimensions':list(im.size),'mode':im.mode,'transparent_pixels':im.mode=='RGBA' and im.getchannel('A').getextrema()[0]==0})
  else:
   probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration:stream=codec_type,codec_name,width,height','-of','json',str(p)]))
   row['seconds']=float(probe['format']['duration']);row['streams']=probe['streams']
   videos=[s for s in probe['streams'] if s.get('codec_type')=='video']
   if videos:row['dimensions']=[videos[0]['width'],videos[0]['height']]
  if target:row['exact_target_dimensions']=row.get('dimensions')==target
 rows.append(row)
summary={'required_missing':[r['path'] for r in rows if r['required'] and not r['present']], 'optional_missing':[r['path'] for r in rows if not r['required'] and not r['present']], 'dimension_mismatches':[r['path'] for r in rows if r.get('exact_target_dimensions') is False], 'source_delivery_only':True,'runtime_integration':'See docs/handoffs/2026-11-09-character-animation-audit.md'}
report={'summary':summary,'assets':rows};(ROOT/'assets/ASSET_AUDIT.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(summary,indent=2))

# Optional full decode audit, including homepage source images.
import sys
if '--full' in sys.argv:
 import concurrent.futures
 source_png=list(SOURCE.rglob('*.png'))
 hub_source=ROOT.parent/'assets/source'
 hub_png=list(hub_source.rglob('*.png')) if hub_source.exists() else []
 for path in source_png+hub_png:
  with Image.open(path) as im:im.verify()
 media=[path for path in SOURCE.rglob('*') if path.suffix in ['.mp3','.webm']]
 def full_decode(path):
  subprocess.run(['ffmpeg','-v','error','-i',str(path),'-f','null','-'],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
  return str(path.relative_to(SOURCE))
 with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:decoded=list(pool.map(full_decode,media))
 report['full_source_validation']={'game_png_files_verified':len(source_png),'homepage_png_files_verified':len(hub_png),'total_source_png_verified':len(source_png)+len(hub_png),'media_files_fully_decoded':decoded,'failed_files':[]}
 (ROOT/'assets/ASSET_AUDIT.json').write_text(json.dumps(report,indent=2)+'\n')
 print(json.dumps(report['full_source_validation'],indent=2))
