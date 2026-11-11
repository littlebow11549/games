#!/usr/bin/env python3
"""產生「簡單版」美術圖（SVG）。全部是程式繪製的暫代圖，檔名對應 assets/ASSETS.md，
正式圖（PNG）到位後替換並改掉引用即可。用法：python3 tools/make_simple_art.py"""
import math, os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'source', 'pic')
# 配色取自《勇氣超人》概念圖：勇氣綠、外套黃、圍巾紅
JADE, JADE_D, JADE_L, GOLD, PINK, INK = '#3fb53a', '#1f6b25', '#c8f5a8', '#f6c21c', '#f48fc6', '#111111'
RED = '#e23a1e'
FONT = "font-family=\"'Noto Sans TC','PingFang TC','Microsoft JhengHei',sans-serif\""
count = 0


def save(folder, name, w, h, body, defs=''):
    global count
    os.makedirs(os.path.join(ROOT, folder), exist_ok=True)
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">'
           f'<defs>{DEFS}{defs}</defs>{body}</svg>\n')
    with open(os.path.join(ROOT, folder, name + '.svg'), 'w', encoding='utf-8') as f:
        f.write(svg)
    count += 1


def grad(i, c0, c1, kind='radial'):
    if kind == 'radial':
        return f'<radialGradient id="{i}" cx="40%" cy="32%" r="75%"><stop offset="0" stop-color="{c0}"/><stop offset="1" stop-color="{c1}"/></radialGradient>'
    return f'<linearGradient id="{i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{c0}"/><stop offset="1" stop-color="{c1}"/></linearGradient>'


DEFS = ''.join([
    grad('gJade', '#9be564', JADE_D), grad('gRed', '#ff9a7a', '#a3271f'), grad('gBlue', '#9fd4ff', '#1f5fa3'),
    grad('gGold', '#ffe08a', '#b06a00'), grad('gDark', '#2c4a45', '#0d1b1a'), grad('gPurple', '#c9a2ff', '#4a2a8a'),
    grad('lGold', '#fff3c4', GOLD, 'linear'), grad('lJade', '#22402a', '#12241a', 'linear'),
    grad('lBlade', '#ffd9c9', '#e23a1e', 'linear'), grad('lSky', '#2a1f4a', '#5a4a8f', 'linear'),
])


def sword(cx, cy, length, width, rot=0, blade='url(#lBlade)'):
    """舊版畫的是劍；《勇氣超人》用拳頭，所以改畫一顆拳頭（函式名沿用，呼叫處不用改）。"""
    r = length * 0.3
    knuckles = ''.join(f'<rect x="{-r + i * r * 0.5 + r * 0.04:.1f}" y="{-r * 0.95:.1f}" width="{r * 0.44:.1f}" height="{r * 0.6:.1f}" rx="{r * 0.16:.1f}" fill="{blade}" stroke="{INK}" stroke-width="{r * 0.08:.1f}"/>' for i in range(4))
    return (f'<g transform="translate({cx},{cy}) rotate({rot * 0.3:.0f})">'
            f'<rect x="{-r:.1f}" y="{-r * 0.6:.1f}" width="{r * 2:.1f}" height="{r * 1.5:.1f}" rx="{r * 0.35:.1f}" fill="{blade}" stroke="{INK}" stroke-width="{r * 0.1:.1f}"/>'
            f'{knuckles}<rect x="{-r * 1.15:.1f}" y="{-r * 0.1:.1f}" width="{r * 0.6:.1f}" height="{r * 0.8:.1f}" rx="{r * 0.25:.1f}" fill="{blade}" stroke="{INK}" stroke-width="{r * 0.08:.1f}"/>'
            f'<rect x="{-r * 0.8:.1f}" y="{r * 0.9:.1f}" width="{r * 1.6:.1f}" height="{r * 0.5:.1f}" rx="{r * 0.1:.1f}" fill="{GOLD}" stroke="{INK}" stroke-width="{r * 0.08:.1f}"/></g>')


def lotus(cx, cy, r, fill=GOLD):
    """舊版畫的是蓮花；改畫一顆星（函式名沿用）。"""
    pts = []
    for k in range(10):
        a = -math.pi / 2 + k * math.pi / 5
        rr = r * (0.6 if k % 2 == 0 else 0.26)
        pts.append(f'{cx + rr * math.cos(a):.1f},{cy - r * 0.45 + rr * math.sin(a):.1f}')
    return f'<polygon points="{" ".join(pts)}" fill="{fill}" stroke="{INK}" stroke-width="{r * 0.06:.1f}" stroke-linejoin="round"/>'


def badge(body, bg='url(#gJade)', size=256):
    c = size / 2
    return (f'<circle cx="{c}" cy="{c}" r="{c-8}" fill="{bg}" stroke="{GOLD}" stroke-width="10"/>'
            f'<circle cx="{c}" cy="{c}" r="{c-22}" fill="none" stroke="#ffffff33" stroke-width="3"/>{body}')


def text(x, y, s, size, fill='#fff7dc', stroke='#7a4a08', sw=None, anchor='middle', extra=''):
    sw = sw if sw is not None else size * 0.12
    return (f'<text x="{x}" y="{y}" font-size="{size}" font-weight="900" text-anchor="{anchor}" {FONT} '
            f'fill="{fill}" stroke="{stroke}" stroke-width="{sw}" paint-order="stroke" stroke-linejoin="round" {extra}>{s}</text>')


def mountains(w, h, base, color, seed, peaks=7, amp=0.25):
    pts = [f'0,{h}']
    for i in range(peaks * 2 + 1):
        x = w * i / (peaks * 2)
        y = base - (amp * h * (0.5 + 0.5 * math.sin(i * 2.4 + seed)) if i % 2 else amp * h * 0.15 * math.cos(i + seed))
        pts.append(f'{x:.0f},{y:.0f}')
    pts.append(f'{w},{h}')
    return f'<polygon points="{" ".join(pts)}" fill="{color}"/>'


def clouds(w, y, n, seed, op=0.7):
    out = ''
    for i in range(n):
        x = (w * (i + 0.5) / n + 97 * math.sin(i * 3.1 + seed)) % w
        r = 60 + 30 * math.sin(i * 1.7 + seed)
        out += f'<ellipse cx="{x:.0f}" cy="{y + 20*math.sin(i+seed):.0f}" rx="{r*2.2:.0f}" ry="{r*0.5:.0f}" fill="#fff" opacity="{op}"/>'
    return out


def chibi_head(cx, cy, r, brave=False):
    """主角頭像。student：黃色棒球帽；brave：棕色刺蝟頭。"""
    face = (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#f7c9a0" stroke="{INK}" stroke-width="{r*0.07}"/>'
            f'<ellipse cx="{cx-r*0.38}" cy="{cy+r*0.15}" rx="{r*0.11}" ry="{r*0.17}" fill="{"#d21f1f" if brave else INK}"/><ellipse cx="{cx+r*0.38}" cy="{cy+r*0.15}" rx="{r*0.11}" ry="{r*0.17}" fill="{"#d21f1f" if brave else INK}"/>'
            f'<path d="M{cx-r*0.16},{cy+r*0.52} Q{cx},{cy+r*(0.68 if brave else 0.58)} {cx+r*0.16},{cy+r*0.52}" fill="none" stroke="{INK}" stroke-width="{r*0.06}" stroke-linecap="round"/>')
    if brave:
        spikes = ''.join(f'<polygon points="{cx + r*x0:.0f},{cy - r*0.35:.0f} {cx + r*x1:.0f},{cy - r*y1:.0f} {cx + r*x2:.0f},{cy - r*0.35:.0f}" fill="#8a4b1f" stroke="{INK}" stroke-width="{r*0.05}" stroke-linejoin="round"/>'
                         for x0, x1, y1, x2 in ((-1.05, -1.35, 1.0, -0.55), (-0.75, -0.7, 1.55, -0.2), (-0.35, 0.0, 1.75, 0.35), (0.2, 0.7, 1.55, 0.75), (0.55, 1.35, 1.0, 1.05)))
        return face + spikes + f'<path d="M{cx-r},{cy-r*0.1} Q{cx},{cy-r*0.75} {cx+r},{cy-r*0.1} L{cx+r*0.9},{cy-r*0.5} Q{cx},{cy-r*1.2} {cx-r*0.9},{cy-r*0.5}Z" fill="#8a4b1f" stroke="{INK}" stroke-width="{r*0.05}"/>'
    return (face + f'<path d="M{cx-r*1.02},{cy-r*0.12} A{r*1.02},{r*1.02} 0 0 1 {cx+r*1.02},{cy-r*0.12}Z" fill="{GOLD}" stroke="{INK}" stroke-width="{r*0.07}"/>'
            f'<path d="M{cx-r*0.2},{cy-r*0.12} H{cx+r*1.45} Q{cx+r*1.5},{cy+r*0.08} {cx+r*1.3},{cy+r*0.08} H{cx-r*0.2}Z" fill="{GOLD}" stroke="{INK}" stroke-width="{r*0.07}"/>')


# ---------- 品牌 ----------
save('branding', 'icon_01', 1024, 1024,
     '<rect width="1024" height="1024" rx="180" fill="#1a1230"/>'
     + ''.join(f'<polygon points="512,512 {512 + 900*math.cos(a):.0f},{512 + 900*math.sin(a):.0f} {512 + 900*math.cos(a+0.16):.0f},{512 + 900*math.sin(a+0.16):.0f}" fill="#f6c21c" opacity=".16"/>' for a in [k * math.pi / 8 for k in range(16)])
     + '<circle cx="512" cy="500" r="330" fill="url(#gJade)" stroke="#111" stroke-width="26"/><ellipse cx="420" cy="380" rx="130" ry="80" fill="#fff" opacity=".45"/>'
     + text(512, 640, 'B', 440, fill='#f6c21c', stroke='#111', sw=40, extra='font-style="italic"')
     + '<rect x="24" y="24" width="976" height="976" rx="160" fill="none" stroke="#f6c21c" stroke-width="26"/>')
save('branding', 'logo_01', 1600, 520,
     '<circle cx="800" cy="230" r="210" fill="url(#gJade)" stroke="#111" stroke-width="16"/><ellipse cx="740" cy="150" rx="80" ry="46" fill="#fff" opacity=".45"/>' + text(800, 300, '勇氣超人', 250, fill='#f6c21c', stroke='#111', sw=34)
     + text(800, 450, 'BRAVE GUY', 96, fill='#e23a1e', stroke='#111', sw=18, extra='letter-spacing="14" font-style="italic"')
     + lotus(180, 330, 90) + lotus(1420, 330, 90))
save('branding', 'banner_01', 1920, 720,
     '<rect width="1920" height="720" fill="url(#lSky)"/>' + clouds(1920, 180, 6, 0.3)
     + mountains(1920, 720, 520, '#7fc3ae', 0.4, 6, 0.3) + mountains(1920, 720, 600, '#3f9a84', 1.9, 7, 0.22)
     + mountains(1920, 720, 690, '#1f6f62', 3.1, 9, 0.12) + clouds(1920, 600, 5, 2.0, 0.5)
     + sword(1420, 330, 620, 90, 24) + chibi_head(1250, 430, 120) + text(560, 330, '勇氣超人', 160, sw=22)
     + text(560, 440, '突破自我的旅程', 56, fill=JADE_L, stroke=JADE_D, sw=10))

# ---------- 背景 ----------
for name, sky in (('bg_loading', 'url(#lSky)'), ('bg_result', 'url(#lJade)')):
    dark = name == 'bg_result'
    save('background', name, 1920, 1080,
         f'<rect width="1920" height="1080" fill="{sky}"/>'
         + ('<circle cx="960" cy="420" r="300" fill="#fff7dc" opacity=".12"/>' if dark else '<circle cx="1500" cy="220" r="120" fill="#fff7dc" opacity=".9"/>')
         + clouds(1920, 260, 6, 0.9, 0.25 if dark else 0.75)
         + mountains(1920, 1080, 760, '#0f4a40' if dark else '#8fcdb9', 0.7, 6, 0.3)
         + mountains(1920, 1080, 880, '#0b352e' if dark else '#4aa58e', 2.3, 8, 0.2)
         + mountains(1920, 1080, 1010, '#07231f' if dark else '#1f6f62', 3.9, 10, 0.1)
         + clouds(1920, 900, 5, 2.6, 0.15 if dark else 0.5))
save('background', 'sky_01', 4096, 1024,
     '<rect width="4096" height="1024" fill="url(#lSky)"/>' + clouds(4096, 300, 10, 0.2, 0.6)
     + mountains(4096, 1024, 880, '#9fd3c0', 0.0, 12, 0.28) + mountains(4096, 1024, 980, '#6bb8a2', 6.283, 16, 0.16))

# ---------- 字藝 ----------
for name, s, size, fill, stroke in (
        ('title_start', 'START', 220, '#fff7dc', '#7a4a08'), ('title_victory', '突 破', 260, '#fff3c4', '#b06a00'),
        ('title_defeat', '倒 下', 260, '#d9dde2', '#3a3f4a'), ('title_boss', '心魔來襲', 200, '#ffd0c4', '#a3271f'),
        ('title_wave_a', '第', 220, '#fff7dc', '#14564b'), ('title_wave_b', '波', 220, '#fff7dc', '#14564b'),
        ('title_pause', '暫 停', 220, '#eaf6ff', '#1f5fa3'), ('title_combo', 'COMBO', 200, '#ffe08a', '#a3271f')):
    w = 1200 if len(s) > 1 else 360
    save('titles', name, w, 400, text(w / 2, 290, s, size, fill, stroke, size * 0.14))

# ---------- UI ----------
save('ui', 'hud_portrait_frame', 512, 512,
     '<circle cx="256" cy="256" r="226" fill="none" stroke="#e9c46a" stroke-width="30"/><circle cx="256" cy="256" r="246" fill="none" stroke="#7a4a08" stroke-width="6"/>'
     + lotus(256, 500, 70) + f'<circle cx="420" cy="420" r="70" fill="{INK}" stroke="{GOLD}" stroke-width="12"/>')
save('ui', 'hud_portrait_hero', 512, 512,
     '<circle cx="256" cy="256" r="256" fill="#c8f5a8"/><path d="M96,512 Q256,330 416,512Z" fill="#f6c21c" stroke="#111" stroke-width="12"/>' + chibi_head(236, 270, 150))
save('ui', 'hud_portrait_brave', 512, 512,
     '<circle cx="256" cy="256" r="256" fill="#ffd9c9"/><path d="M96,512 Q256,330 416,512Z" fill="#f6c21c" stroke="#111" stroke-width="12"/><path d="M130,430 Q256,380 382,430 L370,480 Q256,430 142,480Z" fill="#e23a1e" stroke="#111" stroke-width="10"/>' + chibi_head(256, 290, 140, brave=True))
save('ui', 'hud_bar_frame', 900, 80, f'<rect x="6" y="6" width="888" height="68" rx="34" fill="#000a" stroke="{GOLD}" stroke-width="8"/>')
save('ui', 'hud_bar_hp', 860, 48, '<rect width="860" height="48" rx="24" fill="url(#h)"/><rect y="6" width="860" height="10" rx="5" fill="#fff" opacity=".35"/>', grad('h', '#ff7a6e', '#e2413d', 'linear'))
save('ui', 'hud_bar_mp', 860, 48, '<rect width="860" height="48" rx="24" fill="url(#m)"/><rect y="6" width="860" height="10" rx="5" fill="#fff" opacity=".35"/>', grad('m', '#8fd0ff', '#3aa0ff', 'linear'))
save('ui', 'enemy_bar', 200, 60, '<rect x="2" y="2" width="196" height="24" rx="12" fill="#000a" stroke="#fff8" stroke-width="3"/><rect x="6" y="36" width="188" height="16" rx="8" fill="#ff5a4f"/>')
save('ui', 'boss_bar', 1200, 140, f'<rect x="250" y="6" width="700" height="56" rx="14" fill="url(#lJade)" stroke="{GOLD}" stroke-width="6"/><rect x="8" y="80" width="1184" height="48" rx="24" fill="#000a" stroke="{GOLD}" stroke-width="8"/>'
     + '<rect x="20" y="92" width="1160" height="24" rx="12" fill="url(#b)"/>', grad('b', '#ffb36b', '#c0392b', 'linear'))
save('ui', 'joystick_base', 512, 512, f'<circle cx="256" cy="256" r="240" fill="{JADE}" opacity=".55" stroke="#fff" stroke-opacity=".5" stroke-width="10"/><circle cx="256" cy="256" r="140" fill="#3fd0a9" opacity=".35"/>'
     + ''.join(f'<polygon points="256,40 286,84 226,84" fill="#fff" opacity=".7" transform="rotate({a} 256 256)"/>' for a in (0, 90, 180, 270)))
save('ui', 'joystick_knob', 256, 256, '<circle cx="128" cy="128" r="116" fill="url(#k)" stroke="#fff" stroke-width="8"/>' + lotus(128, 170, 60, '#fff'), grad('k', '#ffffff', '#6fcfb6'))
save('ui', 'btn_attack', 512, 512, badge(sword(256, 250, 380, 60, 35), 'url(#gRed)', 512))
save('ui', 'btn_dodge', 256, 256, badge('<path d="M60,150 Q120,60 200,96 M70,180 Q130,110 196,136 M96,204 Q140,160 190,172" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round"/>', 'url(#gBlue)'))
save('ui', 'btn_skill_frame', 256, 256, f'<circle cx="128" cy="128" r="116" fill="none" stroke="{GOLD}" stroke-width="14"/><circle cx="128" cy="128" r="126" fill="none" stroke="#7a4a08" stroke-width="4"/>')


def panel(w, h, r=36):
    corners = ''.join(lotus(x, y, 34) for x, y in ((60, 74), (w - 60, 74)))
    return (f'<rect x="8" y="8" width="{w-16}" height="{h-16}" rx="{r}" fill="url(#lJade)" stroke="{GOLD}" stroke-width="10"/>'
            f'<rect x="26" y="26" width="{w-52}" height="{h-52}" rx="{r-12}" fill="none" stroke="#ffffff33" stroke-width="3"/>{corners}')


save('ui', 'panel_quest', 600, 500, panel(600, 500))
save('ui', 'panel_dialog', 1400, 260, panel(1400, 260))
save('ui', 'panel_popup', 900, 700, panel(900, 700, 48))
save('ui', 'btn_text', 520, 150, f'<rect x="8" y="8" width="504" height="134" rx="67" fill="url(#lGold)" stroke="#7a4a08" stroke-width="8"/><rect x="30" y="22" width="460" height="30" rx="15" fill="#fff" opacity=".45"/>')
save('ui', 'minimap_frame', 512, 512, f'<rect x="14" y="14" width="484" height="484" rx="60" fill="#12403a" opacity=".8" stroke="{GOLD}" stroke-width="16"/><polygon points="256,200 296,300 256,280 216,300" fill="{GOLD}"/>')
save('ui', 'tab_01', 600, 120, f'<rect x="6" y="6" width="288" height="108" rx="24" fill="url(#lGold)" stroke="#7a4a08" stroke-width="6"/><rect x="306" y="6" width="288" height="108" rx="24" fill="#12403a" stroke="{GOLD}" stroke-width="6" opacity=".8"/>')

# ---------- 圖示 ----------
arc = lambda r, w, c, rot=0: f'<path d="M{128-r},128 A{r},{r} 0 0 1 {128+r},128" fill="none" stroke="{c}" stroke-width="{w}" stroke-linecap="round" transform="rotate({rot} 128 128)"/>'
rays = lambda n, r0, r1, c, w=10: ''.join(f'<line x1="128" y1="{128-r0}" x2="128" y2="{128-r1}" stroke="{c}" stroke-width="{w}" stroke-linecap="round" transform="rotate({360*i/n} 128 128)"/>' for i in range(n))
ICONS = {
    'skill_01': badge(arc(70, 26, '#eaffff', -40) + arc(46, 14, '#8ff5ff', -40), 'url(#gBlue)'),
    'skill_02': badge(''.join(arc(30 + i * 22, 12, '#eafff8', i * 95) for i in range(4))),
    'skill_03': badge(sword(128, 112, 190, 32, 180) + '<ellipse cx="128" cy="196" rx="76" ry="16" fill="none" stroke="#fff3c4" stroke-width="8"/>', 'url(#gPurple)'),
    'skill_04': badge('<circle cx="128" cy="128" r="80" fill="none" stroke="#fff" stroke-width="8" stroke-dasharray="14 10"/>' + lotus(128, 176, 76)),
    'skill_05': badge(rays(12, 30, 86, '#fff7dc') + '<circle cx="128" cy="128" r="30" fill="#fff"/>', 'url(#gBlue)'),
    'skill_06': badge(rays(16, 70, 100, '#fff', 6) + sword(128, 124, 210, 44, 180), 'url(#gGold)'),
    'fn_bag': badge('<path d="M76,112 h104 l12,84 h-128z" fill="#fff7dc" stroke="#7a4a08" stroke-width="8"/><path d="M100,112 a28,34 0 0 1 56,0" fill="none" stroke="#fff7dc" stroke-width="10"/>', 'url(#gDark)'),
    'fn_character': badge('<circle cx="128" cy="96" r="36" fill="#fff7dc"/><path d="M64,204 a64,60 0 0 1 128,0z" fill="#fff7dc"/>', 'url(#gDark)'),
    'fn_settings': badge(rays(8, 52, 80, '#fff7dc', 24) + '<circle cx="128" cy="128" r="56" fill="#fff7dc"/><circle cx="128" cy="128" r="24" fill="#0d1b1a"/>', 'url(#gDark)'),
    'fn_pause': badge('<rect x="88" y="80" width="28" height="96" rx="8" fill="#fff7dc"/><rect x="140" y="80" width="28" height="96" rx="8" fill="#fff7dc"/>', 'url(#gDark)'),
    'fn_sound_on': badge('<polygon points="70,108 100,108 138,78 138,178 100,148 70,148" fill="#fff7dc"/><path d="M158,100 a40,40 0 0 1 0,56 M176,82 a66,66 0 0 1 0,92" fill="none" stroke="#fff7dc" stroke-width="10" stroke-linecap="round"/>', 'url(#gDark)'),
    'fn_sound_off': badge('<polygon points="70,108 100,108 138,78 138,178 100,148 70,148" fill="#fff7dc"/><path d="M160,104 l44,48 M204,104 l-44,48" stroke="#ff7a6e" stroke-width="12" stroke-linecap="round"/>', 'url(#gDark)'),
    'fn_quest': badge('<rect x="80" y="64" width="96" height="128" rx="10" fill="#fff7dc" stroke="#7a4a08" stroke-width="8"/><path d="M98,100 h60 M98,128 h60 M98,156 h36" stroke="#7a4a08" stroke-width="8" stroke-linecap="round"/>', 'url(#gDark)'),
    'buff_atk': badge(sword(112, 136, 170, 30, 0) + '<polygon points="186,70 214,110 198,110 198,150 174,150 174,110 158,110" fill="#fff3c4"/>', 'url(#gRed)'),
    'buff_def': badge('<path d="M128,56 l64,22 v52 c0,40 -30,62 -64,76 c-34,-14 -64,-36 -64,-76 v-52z" fill="#eaf6ff" stroke="#1f5fa3" stroke-width="8"/>', 'url(#gBlue)'),
    'buff_speed': badge(''.join(f'<polyline points="{70+i*40},80 {110+i*40},128 {70+i*40},176" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>' for i in range(3))),
    'drop_coin': '<circle cx="128" cy="128" r="96" fill="url(#gGold)" stroke="#7a4a08" stroke-width="10"/><rect x="100" y="100" width="56" height="56" fill="none" stroke="#7a4a08" stroke-width="10"/>',
    'drop_hp': '<path d="M128,36 C76,108 60,136 60,164 a68,68 0 0 0 136,0 C196,136 180,108 128,36z" fill="url(#gRed)" stroke="#7a1a14" stroke-width="10"/><ellipse cx="104" cy="150" rx="14" ry="24" fill="#fff" opacity=".5"/>',
    'drop_mp': '<path d="M128,36 C76,108 60,136 60,164 a68,68 0 0 0 136,0 C196,136 180,108 128,36z" fill="url(#gBlue)" stroke="#123f70" stroke-width="10"/><ellipse cx="104" cy="150" rx="14" ry="24" fill="#fff" opacity=".5"/>',
}
for name, body in ICONS.items():
    save('icons', name, 256, 256, body)

# ---------- 數字 ----------
for name, chars, fill, stroke in (('numbers_dmg', '0123456789-', '#ff4a3d', '#ffffff'), ('numbers_crit', '0123456789-!', '#ffb300', '#7a1a14'),
                                  ('numbers_heal', '0123456789+', '#5fe07a', '#0f4a20'), ('numbers_ui', '0123456789/:LV', '#fff7dc', INK)):
    cell = 160
    save('numbers', name, cell * len(chars), 200, ''.join(text(cell * i + cell / 2, 150, c, 150, fill, stroke, 18) for i, c in enumerate(chars)))

# ---------- 特效貼圖（供 3D 粒子與網格使用） ----------
glow = lambda i, c: f'<radialGradient id="{i}"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="{c}"/><stop offset="1" stop-color="{c}" stop-opacity="0"/></radialGradient>'
save('fx', 'fx_spark', 512, 512, '<rect width="512" height="512" fill="#000"/><circle cx="256" cy="256" r="250" fill="url(#g)"/>'
     '<ellipse cx="256" cy="256" rx="250" ry="14" fill="#fff"/><ellipse cx="256" cy="256" rx="14" ry="250" fill="#fff"/>', glow('g', '#ffd070'))
save('fx', 'fx_smoke', 512, 512, '<rect width="512" height="512" fill="#000"/>' + ''.join(
    f'<circle cx="{256+110*math.cos(i*1.9):.0f}" cy="{256+110*math.sin(i*2.3):.0f}" r="{120+30*math.sin(i):.0f}" fill="url(#g)" opacity=".5"/>' for i in range(7)), glow('g', '#9a9a9a'))
save('fx', 'fx_petal', 512, 512, '<ellipse cx="256" cy="256" rx="110" ry="230" fill="url(#p)" stroke="#d9879a" stroke-width="8" transform="rotate(25 256 256)"/>', grad('p', '#fff', PINK))
save('fx', 'fx_leaf', 512, 512, '<path d="M256,30 Q440,220 256,482 Q72,220 256,30z" fill="url(#l)" stroke="#2f7a3a" stroke-width="8"/><path d="M256,60 V460" stroke="#2f7a3a" stroke-width="8"/>', grad('l', '#b6f08a', '#3f9a4a'))
save('fx', 'fx_ring', 512, 512, '<rect width="512" height="512" fill="#000"/><circle cx="256" cy="256" r="200" fill="none" stroke="#fff" stroke-width="40" filter="url(#bl)"/>'
     '<circle cx="256" cy="256" r="200" fill="none" stroke="#fff" stroke-width="10"/>', '<filter id="bl" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14"/></filter>')
save('fx', 'fx_slash', 1024, 256, '<rect width="1024" height="256" fill="#000"/><rect width="1024" height="256" fill="url(#s)"/>',
     '<linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".75" stop-color="#bff"/><stop offset=".92" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>')
save('fx', 'fx_magic_circle', 1024, 1024, '<rect width="1024" height="1024" fill="#000"/><g fill="none" stroke="#ffe08a" stroke-width="10">'
     '<circle cx="512" cy="512" r="480"/><circle cx="512" cy="512" r="430" stroke-dasharray="40 22"/><circle cx="512" cy="512" r="250"/>'
     + ''.join(f'<polygon points="512,90 877,723 147,723" transform="rotate({a} 512 512)"/>' for a in (0, 180)) + '</g>' + lotus(512, 600, 170, '#ffe08a'))
save('fx', 'fx_noise', 512, 512, '<rect width="512" height="512" filter="url(#n)"/>',
     '<filter id="n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".02" numOctaves="4" seed="7" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>')
frames = ''
for i in range(16):
    k = i / 15
    cx, cy, r = 128 + 256 * (i % 4), 128 + 256 * (i // 4), 30 + 90 * math.sin(min(1, k * 1.4) * math.pi / 2)
    frames += f'<circle cx="{cx}" cy="{cy}" r="{r:.0f}" fill="url(#f)" opacity="{1 - k*k:.2f}"/><circle cx="{cx}" cy="{cy}" r="{r*0.5*(1-k):.0f}" fill="#fff"/>'
save('fx', 'fx_fire_sheet', 1024, 1024, '<rect width="1024" height="1024" fill="#000"/>' + frames, glow('f', '#ff7a1a'))

# ---------- 教學圖 ----------
steps = [('移動', '<circle cx="240" cy="330" r="110" fill="#2fa88f" opacity=".6" stroke="#fff" stroke-width="8"/><circle cx="280" cy="300" r="50" fill="#fff"/>', '左下搖桿'),
         ('連段', '<circle cx="240" cy="330" r="110" fill="url(#gRed)" stroke="#e9c46a" stroke-width="10"/>' + sword(240, 326, 170, 28, 35), '連按攻擊三連斬'),
         ('技能', ''.join(f'<circle cx="{140+i*100}" cy="330" r="44" fill="url(#g{c})" stroke="#e9c46a" stroke-width="8"/>' for i, c in enumerate(('Jade', 'Blue', 'Gold'))), '冷卻好就放'),
         ('閃避', '<circle cx="240" cy="330" r="80" fill="url(#gBlue)" stroke="#e9c46a" stroke-width="10"/><circle cx="240" cy="330" r="150" fill="none" stroke="#ff3b30" stroke-width="8" stroke-dasharray="20 14"/>', '紅圈出現快閃開')]
body = '<rect width="1920" height="1080" fill="url(#lJade)"/>' + text(960, 130, '玩法說明', 90)
for i, (t, art, note) in enumerate(steps):
    x = 60 + i * 460
    body += (f'<g transform="translate({x},220)"><rect width="420" height="760" rx="36" fill="#0d1b1a" opacity=".55" stroke="#e9c46a" stroke-width="6"/>'
             f'<circle cx="70" cy="70" r="40" fill="#e9c46a"/>{text(70, 92, str(i+1), 56, INK, "none", 0)}'
             f'<g transform="translate(-30,60)">{art}</g>{text(210, 600, t, 80)}{text(210, 680, note, 38, "#bfeee0", "#0d1b1a", 6)}</g>')
save('howto', 'howto_01', 1920, 1080, body)

print(f'已產生 {count} 張 SVG → {os.path.normpath(ROOT)}')
