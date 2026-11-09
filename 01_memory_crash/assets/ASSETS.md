# 🎨 Memory Crash — 美術 / 音樂素材製作列表（完整規格）

> 依全專案標準範本（`/ASSETS_TEMPLATE.md`）填寫。本款風格已定：**深藍科技感**。
> 產出後依「檔名」放進 `assets/img/`（圖片）、`assets/audio/`（音訊）；檔名勿改，我才接得到。
> 圖片優先用「系列圖集（sprite sheet）」一次生成一整套，風格統一又省資源；AI 排版不需完全對齊，我會依實際位置切圖。

---

## 0. 全域設定
- **遊戲名稱**：Memory Crash（記憶序列）
- **主題風格**：深藍科技感 · glossy cartoon 3D · 青色發光 · 金色 UI
- **統一風格提示詞（貼在每則圖片開頭）**：
  ```
  consistent game art series, glossy cartoon 3D style, deep navy-blue sci-fi theme with
  glowing cyan accents, gold UI elements, same lighting and finish across all items,
  vibrant saturated colors, high detail, clean, centered
  ```
- **配色**：深藍 `#061a3a`／藍光 `#49c7ff`／金 `#ffe17a→#ffc02e→#e88a12`／金邊 `#7a3d04`／愛心紅 `#ff3b53`
- **畫面比例**：手機直式 9:16
- **檔案規範**：圖片 PNG 去背（背景除外）

---

## 1. 背景 Backgrounds
| ID | 用途 | 檔名 | 尺寸 | 背景 |
|----|------|------|------|------|
| BG-01 | 主背景（標題/選項/遊戲/結算共用） | `bg_main.png` | 1080×1920 | 不透明 |

**BG-01 提示詞**
```
mobile puzzle game background, vertical 9:16, deep navy-blue sci-fi scene, glowing cyan
perspective grid floor fading into darkness at the bottom, soft radial blue glow from top
center, subtle floating particles and bokeh, clean empty center area for UI, no text, no
characters, high detail. Opaque. 1080x1920.
```

---

## 2. Logo / 品牌 Branding
| ID | 用途 | 檔名 | 尺寸 | 背景 |
|----|------|------|------|------|
| LG-01 | 遊戲 LOGO「MEMORY CRASH」 | `logo.png` | 900×700 | 去背 |
| LG-02 | 標題裝飾：能量劍刃 | `blade.png` | 400×900 | 去背 |

**LG-01**
```
game logo text "MEMORY CRASH", chunky cartoon 3D lettering, top word "MEMORY" glossy gold
with thick dark-blue outline and 3D extrude, bottom word "CRASH" glossy white-to-ice-blue
gradient, bold playful arcade style, strong bevel and highlights, slight skew, transparent
background, centered, high detail. 900x700 PNG.
```
**LG-02**
```
glowing blue energy blade / crystal sword blade pointing down, cyan to deep-blue gradient,
bright rim light and glow, sci-fi fantasy game item, symmetrical, transparent background,
centered. 400x900 PNG.
```

---

## 3. 介面 UI（圖集）
| ID | 用途 | 檔名 | 尺寸 | 背景 |
|----|------|------|------|------|
| UI-01 | UI 介面系列（按鈕三態／面板／愛心／齒輪／格子框） | `sheet_ui.png` | 2048×2048 | 去背 |

**內容**：金色按鈕（一般／按下／禁用）、藍色發光面板框、愛心（滿／空）、齒輪鈕、寶石格子框（一般／發光）。
**UI-01 提示詞**
```
UI kit sprite sheet for a mobile puzzle game, transparent background, all items neatly laid
out with clear spacing, consistent glossy cartoon 3D style, deep navy-blue + cyan glow + gold.
Include, each as a separate clean element with NO text on them:
- gold rounded-rectangle button, 3 states: normal, pressed (darker), disabled (grey-gold);
- blue sci-fi panel frame with glowing cyan neon border (9-slice style, empty inside);
- red glossy crystal heart (full) and dark grey heart (empty);
- round blue settings button with glowing cyan rim and a gold gear;
- rounded-square grid cell slot, 2 states: normal (thin blue border) and lit (bright white
  glowing border), both empty inside.
High detail, items not overlapping, not cropped. 2048x2048 PNG, transparent.
```

---

## 4. 遊戲元件 Components（寶石圖集）
| ID | 用途 | 檔名 | 尺寸 | 背景 |
|----|------|------|------|------|
| GC-01 | 12 顆寶石系列（4欄×3列） | `sheet_gems.png` | 2048×1536 | 去背 |

**GC-01 提示詞**
```
sprite sheet of 12 faceted gemstones arranged in a neat 4x3 grid, evenly spaced with clear
gaps, each gem centered in its own equal cell, transparent background, glossy cartoon 3D
crystal style, sharp facets, bright specular highlights, inner glow, subtle dark outline,
consistent lighting across all gems. Colors in reading order:
1 sky-blue #49c7ff (teardrop), 2 light-cyan #7fe0ff (emerald cut), 3 violet #9b7bff (marquise),
4 mint-green #5effa0 (rhombus), 5 emerald-green #3ddc84 (cushion), 6 lime-green #b6ff4e (swirl),
7 orange-red #ff7a3c (square), 8 pink-magenta #ff5ea8 (heart), 9 red #ff4e4e (sharp crystal),
10 amber-orange #ffb14e (raw shard), 11 warm-brown #c98b5a (lava), 12 icy-white #eaf2ff (diamond).
High detail. 2048x1536 PNG, transparent.
```

---

## 5. 數字 / 字型 Numbers
| ID | 用途 | 檔名 | 尺寸 | 背景 |
|----|------|------|------|------|
| NM-01 | 數字 0–9 ＋「LV」＋「:」 | `sheet_numbers.png` | 2048×512 | 去背 |

**NM-01 提示詞**
```
sprite sheet of numbers 0 1 2 3 4 5 6 7 8 9 plus the letters "LV" and a colon ":",
chunky cartoon 3D gold lettering with thick dark-blue outline, bevel and glossy highlights,
each character in its own equal cell, evenly spaced in a single row, clear gaps, transparent
background, consistent style. 2048x512 PNG, transparent.
```
> （可選）標題字系列 `sheet_titles.png`：LOGO 與 `START/OPTION/PERFECT/GAMEOVER` 字藝，1536×2048 去背。

---

## 6. 特效 FX（圖集，選做）
| ID | 用途 | 檔名 | 規格 | 背景 |
|----|------|------|------|------|
| FX-01 | 特效系列（PERFECT 爆閃／寶石碎裂／GAME OVER 裂痕） | `sheet_fx.png` | 1536×512 | 透明 |

**FX-01 提示詞**
```
VFX sprite sheet, transparent background, 3 effects side by side with clear gaps, consistent
style: 1) golden celebration burst with light rays and sparkles; 2) shattering gemstone
breaking into glowing shards; 3) cracked glass overlay in dark-blue tint. High detail.
1536x512 PNG, transparent.
```

---

## 7. 音樂 / 音效 Audio
> 放 `assets/audio/`。音樂可用 Suno/Udio 類工具；音效可用音效庫或生成工具。
> 目前遊戲內是 WebAudio 合成版（placeholder），有音檔後我替換成真實音源。

| ID | 用途 | 檔名 | 長度/規格 | 循環 |
|----|------|------|-----------|------|
| MU-01 | 背景音樂（主） | `bgm_main.mp3` | 60–120s | 可無縫循環 |
| MU-02 | 大師模式/高關音樂（選做） | `bgm_intense.mp3` | 60–120s | 循環 |
| SE-01 | 點擊寶石 | `se_tap.mp3` | <0.4s | 否 |
| SE-02 | 正確 | `se_good.mp3` | <0.6s | 否 |
| SE-03 | 點錯 | `se_wrong.mp3` | <0.6s | 否 |
| SE-04 | 過關 PERFECT | `se_win.mp3` | 1–2s | 否 |
| SE-05 | GAME OVER | `se_over.mp3` | 1–2s | 否 |

**MU-01 提示詞（音樂）**
```
Upbeat, bright puzzle-game background music, playful and futuristic, light electronic with
sparkly synth bells and a bouncy groove, ~110 BPM, cheerful but not distracting, seamless
loop, no vocals. Mood: clever, energetic, arcade.
```
**MU-02 提示詞（選做）**
```
Faster, tense version of the same puzzle-game theme, driving beat ~130 BPM, more intensity
and urgency, still bright and electronic, seamless loop, no vocals.
```
**音效說明**
- `se_tap`：清脆短「叮」(bright blip)
- `se_good`：悅耳上揚兩音 (positive chime)
- `se_wrong`：低沉錯誤 buzz (soft error)
- `se_win`：歡樂上行琶音 (success fanfare, short)
- `se_over`：下行失落音 (game-over descend)

---

## 8. App Icon / Favicon
| ID | 用途 | 檔名 | 尺寸 | 背景 |
|----|------|------|------|------|
| IC-01 | App Icon / Favicon | `icon.png` | 512×512 | 圓角方形 |

> 目前已有向量版 `icon.svg`（藍寶石＋金星光＋格線）。若要點陣高質感版用下方提示詞。
**IC-01 提示詞**
```
app icon, rounded square, deep navy-blue sci-fi background with faint cyan grid floor, a big
glossy faceted blue gemstone glowing in the center, small gold sparkles, polished, vibrant,
game icon style, high detail. 512x512 PNG.
```

---

## ✅ 交付清單（越前面越重要）
- [ ] `bg_main.png`（背景）
- [ ] `logo.png`（Logo）
- [ ] `sheet_ui.png`（按鈕/面板/愛心/齒輪/格子）
- [ ] `sheet_gems.png`（12 寶石）
- [ ] `sheet_numbers.png`（數字）
- [ ] `bgm_main.mp3`（背景音樂）
- [ ] `se_tap/good/wrong/win/over.mp3`（音效）
- [ ] `icon.png`（App Icon）
- [ ] `blade.png`、`sheet_fx.png`、`sheet_titles.png`、`bgm_intense.mp3`（選做）

> 給 GPT 的總指示（可一次貼）：
> 「請依這份清單做一套**風格統一**（深藍科技＋青光＋金色）的手機益智遊戲素材，
> 每段提示詞各生成一張/一軌，圖片透明背景、元件排整齊等距方便切圖。」
>
> 產好後放進 `assets/img/`、`assets/audio/`，跟我說「素材更新了」，我會切圖、替換 placeholder 並預覽。
