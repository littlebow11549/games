"""User-authorized deterministic logo/header composition. No artwork upscaling."""
from pathlib import Path
import hashlib
import json
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PIC = ROOT / 'assets/source/pic'
OUT = PIC / 'sheet/unified'
OUT.mkdir(exist_ok=True)
BG = (14, 26, 20, 255)
# id, Chinese, English, original-header cutoff, left logo area width/bottom
SPECS = [
    ('student','主角・大學生','THE STUDENT',80,264,103),
    ('braveguy','勇氣超人','BRAVE GUY',80,264,103),
    ('angel','小天使','LITTLE ANGEL',80,264,111),
    ('nightmare','惡夢超人','NIGHTMARE GUY',80,264,103),
    ('ganqiao','幹譙龍','GANQIAO DRAGON',80,270,103),
    ('qian','錢大姐','QIAN',80,265,103),
    ('lan','藍教頭','LAN',58,259,103),
    ('zhuangxiong','假森','JIASEN',72,280,110),
    ('laichuang','佛賴弟','FOLAIDI',80,0,80),
    ('junxiong','俊熊','JUNXIONG',62,260,104),
    ('hell','地獄超人','HELL GUY',60,330,78),
    ('worker','主角・上班族','THE WORKER',86,350,104),
    ('incubus','夢魘超人','INCUBUS',70,0,70),
    ('guanlaoban','冠老闆','GUANLAOBAN',78,0,78),
    ('xinji','新雞','XINJI',92,0,92),
    ('baguashe','八卦蛇','BAGUASHE',78,0,78),
]
logo_path = PIC / 'branding/logo_01_review_v1.png'
logo = Image.open(logo_path).convert('RGBA')
assert logo.size == (1536,1024)
logo = logo.resize((156,104), Image.Resampling.LANCZOS)
font_path = Path('C:/Windows/Fonts/msjhbd.ttc')
font = lambda size: ImageFont.truetype(str(font_path), size)
records = []
for idx,(id,zh,en,cut,lw,lb) in enumerate(SPECS):
    src = PIC / 'sheet' / (f'sheet_{id}.png' if idx < 5 else f'sheet_{id}_draft_v1.png')
    original = Image.open(src).convert('RGBA')
    assert original.size == (1536,1024), (id,original.size)
    body = original.crop((0,cut,1536,1024))
    if lw and lb > cut:
        ImageDraw.Draw(body).rectangle((0,0,lw-1,lb-cut-1), fill=BG)
    result = Image.new('RGBA',(1728,1152),BG)
    result.paste(body,(96,128))
    result.alpha_composite(logo,(48,12))
    d = ImageDraw.Draw(result)
    d.line((250,20,250,108), fill='#3FB53A', width=2)
    d.text((290,40),'CHARACTER TURNAROUND SHEET',font=font(34),fill='#F6C21C')
    d.line((1382,20,1382,108), fill='#3FB53A', width=2)
    d.text((1552,43),zh,font=font(29),fill='#F6C21C',anchor='mm')
    d.text((1552,82),en,font=font(22),fill='#FFF4CE',anchor='mm')
    d.line((8,120,1720,120),fill='#3FB53A',width=2)
    dest = OUT / f'sheet_{id}.png'
    result.save(dest,compress_level=9)
    # All retained body pixels outside the explicit obsolete-logo mask are exact copies.
    retained_src = original.crop((0,lb,1536,1024))
    retained_out = result.crop((96,128+lb-cut,1632,128+1024-cut))
    assert retained_src.tobytes() == retained_out.tobytes(), id
    records.append(dict(id=id,path=str(dest.relative_to(ROOT)).replace('\\','/'),source=str(src.relative_to(ROOT)).replace('\\','/'),size=list(result.size),logo_box=[48,12,156,104],header_height=128,source_cutoff=cut,obsolete_logo_mask=[0,cut,lw,max(0,lb-cut)],retained_body_pixel_exact=True,logo_region_sha256=hashlib.sha256(result.crop((0,0,250,120)).tobytes()).hexdigest()))
assert len({r['logo_region_sha256'] for r in records}) == 1
manifest=dict(status='header_unified_character_art_still_draft',logo_source='assets/source/pic/branding/logo_01_review_v1.png',logo_source_sha256=hashlib.sha256(logo_path.read_bytes()).hexdigest(),canvas_note='Canvas extended; original character artwork not resized. Approved logo downsampled once and reused.',sheets=records)
(ROOT/'assets/source/UNIFIED_SHEET_HEADERS.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print('Verified 16 identical logo regions; retained character pixels exact; output 1728x1152 (3:2).')
