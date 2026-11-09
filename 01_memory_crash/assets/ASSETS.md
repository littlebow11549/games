# 🎨 Memory Crash — 素材製作列表（完整規格）

> 依全專案標準範本（`/ASSETS_TEMPLATE.md`）。本款風格：**深藍科技感**。
> 產出後依「路徑」放檔，**檔名勿改**（含編號），我才接得到。
> 圖片優先用「系列圖集（sprite sheet）」一次生成，風格統一又省資源；排版不需完全對齊，我會依實際位置切圖。

## 📁 資料夾結構（媒體分類 + 編號）
```
assets/source/
├── pic/                  # 圖片
│   ├── background/  bg_01.png
│   ├── branding/    logo_01.png · blade_01.png · icon_01.png (icon_01.svg 已有)
│   ├── ui/          ui_01.png
│   ├── gems/        gems_01.png
│   ├── numbers/     numbers_01.png
│   └── fx/          fx_01.png
├── music/                # 音訊
│   ├── bgm/         bgm_01.mp3 · bgm_02.mp3
│   └── sfx/         sfx_01.mp3 … sfx_05.mp3
└── video/           vid_01.webm（選做）
```
> 同類型多檔就遞增編號（`bg_01`、`bg_02`…）。

---

## 0. 全域設定
- **風格**：深藍科技感 · glossy cartoon 3D · 青色發光 · 金色 UI
- **統一風格提示詞（貼在每則圖片開頭）**：
  ```
  consistent game art series, glossy cartoon 3D style, deep navy-blue sci-fi theme with
  glowing cyan accents, gold UI elements, same lighting and finish across all items,
  vibrant saturated colors, high detail, clean, centered
  ```
- **配色**：深藍 `#061a3a`／藍光 `#49c7ff`／金 `#ffe17a→#ffc02e→#e88a12`／金邊 `#7a3d04`／愛心紅 `#ff3b53`
- **畫面比例**：手機直式 9:16

---

## 1. 背景　`pic/background/`
| 檔案 | 用途 | 尺寸 | 背景 |
|------|------|------|------|
| `bg_01.png` | 主背景（全畫面共用） | 1080×1920 | 不透明 |
```
mobile puzzle game background, vertical 9:16, deep navy-blue sci-fi scene, glowing cyan
perspective grid floor fading into darkness at the bottom, soft radial blue glow from top
center, subtle floating particles and bokeh, clean empty center for UI, no text, no
characters, high detail. Opaque. 1080x1920.
```

## 2. 品牌　`pic/branding/`
| 檔案 | 用途 | 尺寸 | 背景 |
|------|------|------|------|
| `logo_01.png` | 遊戲 LOGO「MEMORY CRASH」 | 900×700 | 去背 |
| `blade_01.png` | 標題裝飾：能量劍刃 | 400×900 | 去背 |
| `icon_01.png` | App Icon（點陣版；向量版 `icon_01.svg` 已有） | 512×512 | 圓角方形 |

**logo_01**
```
game logo text "MEMORY CRASH", chunky cartoon 3D lettering, top word "MEMORY" glossy gold
with thick dark-blue outline and 3D extrude, bottom word "CRASH" glossy white-to-ice-blue
gradient, bevel and highlights, slight skew, transparent background, centered. 900x700 PNG.
```
**blade_01**
```
glowing blue energy blade / crystal sword blade pointing down, cyan to deep-blue gradient,
bright rim light and glow, sci-fi fantasy item, symmetrical, transparent background. 400x900 PNG.
```
**icon_01**
```
app icon, rounded square, deep navy-blue sci-fi background with faint cyan grid, a big glossy
faceted blue gemstone glowing in the center, small gold sparkles, polished, game icon style,
high detail. 512x512 PNG.
```

## 3. 介面 UI　`pic/ui/`
| 檔案 | 用途 | 尺寸 | 背景 |
|------|------|------|------|
| `ui_01.png` | UI 圖集（按鈕三態／面板／愛心／齒輪／格子框） | 2048×2048 | 去背 |
```
UI kit sprite sheet for a mobile puzzle game, transparent background, items neatly laid out
with clear spacing, consistent glossy cartoon 3D style, deep navy-blue + cyan glow + gold.
Include, each a separate clean element with NO text:
- gold rounded-rectangle button in 3 states: normal, pressed (darker), disabled (grey-gold);
- blue sci-fi panel frame with glowing cyan neon border (9-slice, empty inside);
- red glossy crystal heart (full) and dark grey heart (empty);
- round blue settings button with glowing cyan rim and a gold gear;
- rounded-square grid cell slot in 2 states: normal (thin blue border) and lit (bright white
  glowing border), both empty inside.
High detail, not overlapping, not cropped. 2048x2048 PNG, transparent.
```

## 4. 遊戲元件（寶石）　`pic/gems/`
| 檔案 | 用途 | 尺寸 | 背景 |
|------|------|------|------|
| `gems_01.png` | 12 顆寶石圖集（4欄×3列） | 2048×1536 | 去背 |
```
sprite sheet of 12 faceted gemstones in a neat 4x3 grid, evenly spaced with clear gaps,
each gem centered in its own equal cell, transparent background, glossy cartoon 3D crystal
style, sharp facets, bright specular highlights, inner glow, subtle dark outline, consistent
lighting. Colors in reading order:
1 sky-blue #49c7ff (teardrop), 2 light-cyan #7fe0ff (emerald cut), 3 violet #9b7bff (marquise),
4 mint-green #5effa0 (rhombus), 5 emerald-green #3ddc84 (cushion), 6 lime-green #b6ff4e (swirl),
7 orange-red #ff7a3c (square), 8 pink-magenta #ff5ea8 (heart), 9 red #ff4e4e (sharp crystal),
10 amber-orange #ffb14e (raw shard), 11 warm-brown #c98b5a (lava), 12 icy-white #eaf2ff (diamond).
High detail. 2048x1536 PNG, transparent.
```

## 5. 數字　`pic/numbers/`
| 檔案 | 用途 | 尺寸 | 背景 |
|------|------|------|------|
| `numbers_01.png` | 數字 0–9 ＋「LV」＋「:」 | 2048×512 | 去背 |
```
sprite sheet of numbers 0 1 2 3 4 5 6 7 8 9 plus "LV" and a colon ":", chunky cartoon 3D
gold lettering with thick dark-blue outline, bevel and glossy highlights, each character in
its own equal cell, evenly spaced in a single row, clear gaps, transparent background. 2048x512 PNG.
```

## 6. 特效　`pic/fx/`（選做）
| 檔案 | 用途 | 尺寸 | 背景 |
|------|------|------|------|
| `fx_01.png` | 特效圖集（PERFECT 爆閃／寶石碎裂／GAME OVER 裂痕） | 1536×512 | 透明 |
```
VFX sprite sheet, transparent background, 3 effects side by side with clear gaps, consistent
style: 1) golden celebration burst with light rays and sparkles; 2) shattering gemstone into
glowing shards; 3) cracked glass overlay in dark-blue tint. High detail. 1536x512 PNG.
```

## 7. 音樂　`music/bgm/`
| 檔案 | 用途 | 長度 | 循環 |
|------|------|------|------|
| `bgm_01.mp3` | 背景音樂（主） | 60–120s | 可無縫循環 |
| `bgm_02.mp3` | 大師模式/高關（選做） | 60–120s | 循環 |

**bgm_01**
```
Upbeat, bright puzzle-game background music, playful and futuristic, light electronic with
sparkly synth bells and a bouncy groove, ~110 BPM, cheerful but not distracting, seamless
loop, no vocals.
```
**bgm_02（選做）**
```
Faster, tense version of the same puzzle-game theme, driving beat ~130 BPM, more urgency,
still bright and electronic, seamless loop, no vocals.
```

## 8. 音效　`music/sfx/`
| 檔案 | 用途 | 長度 | 說明 |
|------|------|------|------|
| `sfx_01.mp3` | 點擊寶石 | <0.4s | 清脆短「叮」(bright blip) |
| `sfx_02.mp3` | 正確 | <0.6s | 悅耳上揚兩音 (positive chime) |
| `sfx_03.mp3` | 點錯 | <0.6s | 低沉錯誤 buzz (soft error) |
| `sfx_04.mp3` | 過關 PERFECT | 1–2s | 歡樂上行琶音 (success fanfare) |
| `sfx_05.mp3` | GAME OVER | 1–2s | 下行失落音 (game-over descend) |

## 9. 影片　`video/`（選做）
| 檔案 | 用途 | 規格 |
|------|------|------|
| `vid_01.webm` | 開場/背景動態（透明或不透明） | 1080×1920, WebM |

---

## ✅ 交付清單（越前面越重要）
- [ ] `pic/background/bg_01.png`
- [ ] `pic/branding/logo_01.png`
- [ ] `pic/ui/ui_01.png`
- [ ] `pic/gems/gems_01.png`
- [ ] `pic/numbers/numbers_01.png`
- [ ] `music/bgm/bgm_01.mp3`
- [ ] `music/sfx/sfx_01.mp3` … `sfx_05.mp3`
- [ ] `pic/branding/icon_01.png`
- [ ] 選做：`blade_01.png`、`pic/fx/fx_01.png`、`bgm_02.mp3`、`video/vid_01.webm`

> 給 GPT 的總指示：「請依這份清單做一套**風格統一**（深藍科技＋青光＋金色）的手機益智遊戲素材，
> 圖片透明背景、元件排整齊等距方便切圖。」
> 放好後跟我說「素材更新了」，我會切圖、替換 placeholder 並預覽。
