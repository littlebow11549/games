#!/usr/bin/env python3
"""把《勇氣超人》用到的字裁成小的 woff2。

用法：python3 tools/make_game02_fonts.py <放原始字型的資料夾>
需要：pip install fonttools brotli

原始字型（都是 SIL Open Font License 1.1，可商用、可內嵌）不放進 repo，執行前先下載：
  jf-openhuninn-2.1.ttf   https://github.com/justfont/open-huninn-font/releases/download/v2.1/jf-openhuninn-2.1.ttf
  NotoSansTC[wght].ttf    https://raw.githubusercontent.com/google/fonts/main/ofl/notosanstc/NotoSansTC%5Bwght%5D.ttf

遊戲裡新增或修改文字之後要重跑一次，否則新字會退回系統字型（不會壞，只是不一致）。
"""
import glob, os, sys
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '02_xianxia_battle')
OUT = os.path.join(ROOT, 'assets', 'fonts')
src = sys.argv[1]

files = glob.glob(os.path.join(ROOT, 'js', '*.js')) + [os.path.join(ROOT, 'index.html'), os.path.join(ROOT, 'SCRIPT.md')]
chars = set(chr(c) for c in range(0x20, 0x7F))
chars |= set('　、。，．・：；？！「」『』（）《》〈〉【】—…～％＋－／＝＜＞▼▲►◄★☆♪←→↑↓×÷°·“”‘’')
for f in files:
    chars |= set(open(f, encoding='utf-8').read())
chars = ''.join(sorted(c for c in chars if c >= ' '))
print(len(chars), 'chars')

def build(font, name):
    opts = subset.Options()
    opts.flavor = 'woff2'
    opts.layout_features = ['*']
    opts.name_IDs = [1, 2, 4, 6, 13, 14]
    sub = subset.Subsetter(opts)
    sub.populate(text=chars)
    sub.subset(font)
    path = os.path.join(OUT, name)
    font.flavor = 'woff2'
    font.save(path)
    print(name, os.path.getsize(path) // 1024, 'KB')

build(TTFont(os.path.join(src, 'jf-openhuninn-2.1.ttf')), 'huninn-subset.woff2')
black = instantiateVariableFont(TTFont(os.path.join(src, 'NotoSansTC[wght].ttf')), {'wght': 900})
build(black, 'notosanstc-black-subset.woff2')
