# 🎨 Memory Crash — 素材製作列表（完整規格）

> 依全專案標準範本（`/ASSETS_TEMPLATE.md`）。本款風格：**深藍科技感**。
> 產出後依「路徑」放檔，**檔名勿改**（含編號），我才接得到。
> 圖片優先用「系列圖集（sprite sheet）」一次生成，風格統一又省資源；排版不需完全對齊，我會依實際位置切圖。
>
> ⭐ **完整性原則（最高原則）**：遊戲內**所有**視覺/音訊元素，凡是以 CSS/placeholder 暫代、
> 需更高質感者，一律列入本表交外部 AI 美化，**不遺漏**。新增設計需求也直接補進本表。

## 📁 資料夾結構（媒體分類 + 編號）
```
assets/source/
├── pic/                  # 圖片
│   ├── background/  bg_01.png
│   ├── branding/    logo_01.png · blade_01.png · icon_01.png (icon_01.svg 已有)
│   ├── character/   char_01.png            # 主角（太空巴哥）；char_placeholder.svg 墊底
│   ├── titles/      titles_01.png · titles_02.png   # 主視覺文字 + 主選單字
│   ├── ui/          ui_01.png
│   ├── gems/        gems_01.png
│   ├── numbers/     numbers_01.png         # 數字 0–9 + LV + :
│   ├── font/        font_01.png            # 字型 A–Z / a–z / 符號
│   ├── fx/          fx_01.png
│   └── howto/       howto_01.png           # 教學步驟圖示
├── music/           bgm_01.mp3 · bgm_02.mp3     # 背景音樂
├── sfx/             sfx_01.mp3 … sfx_05.mp3     # 音效
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

## 3. 主視覺文字（word-art）　`pic/titles/`
> 遊戲裡的大型文字標語，做成與 LOGO 同風格的立體字圖（取代目前的 CSS 字）。
> 每個詞各自獨立、可個別切出使用。

| 檔案 | 內含文字 | 尺寸 | 背景 |
|------|----------|------|------|
| `titles_01.png` | START · OPTION · READY · YOUR TURN · PERFECT · MISS · GAMEOVER · MASTER MODE · HOW TO PLAY · HOME · AGAIN | 2048×2048 | 去背 |
| `titles_02.png` | **（主選單）** ARCADE · CONTINUE · EXIT · MENU · PAUSE · RESUME | 2048×1024 | 去背 |
```
sprite sheet of game word-art phrases, transparent background, laid out in a neat grid with
clear spacing, consistent chunky cartoon 3D style matching the game logo: glossy GOLD letters
with thick dark-blue outline, bevel, highlights and slight skew, bright and arcade. Each
phrase a separate clean piece, not overlapping, not cropped. Phrases:
"START", "OPTION", "READY", "YOUR TURN", "PERFECT", "MISS", "GAMEOVER", "MASTER MODE",
"HOW TO PLAY", "HOME", "AGAIN". High detail. 2048x2048 PNG, transparent.
```
**titles_02（主選單字，同風格）**
```
sprite sheet of menu word-art, same chunky cartoon 3D gold style as the logo, transparent
background, clear spacing, each phrase separate and not overlapping:
"ARCADE", "CONTINUE", "EXIT", "MENU", "PAUSE", "RESUME". High detail. 2048x1024 PNG, transparent.
```
> 註：`PERFECT` 為慶祝金字、`MISS`/`GAMEOVER` 可偏紅警示色；其餘金色。
> 開關字（SOUND / MUSIC / ON / OFF）字數多，可留用字型，不一定要做圖。

## 4. 介面 UI　`pic/ui/`
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
> **含元件（都要有）**：▭ 金色按鈕（一般/按下/禁用）、▢ 藍色面板框、
> **❤ 愛心（滿 / 空）**、⚙ 齒輪鈕、▣ 寶石格子框（一般 / 發光）。

## 5. 遊戲元件（寶石）　`pic/gems/`
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

## 6. 數字 / 字型　`pic/numbers/` · `pic/font/`
> 遊戲要有**一套主體一致的字型**（與 LOGO 同風格）。數字給分數/LV；字母+符號給一般文字。

| 檔案 | 用途 | 尺寸 | 背景 |
|------|------|------|------|
| `numbers_01.png` | 數字 0–9 ＋「LV」＋「:」（分數/等級用） | 2048×512 | 去背 |
| `font_01.png` | 字型：A–Z、a–z、常用符號（一般文字用） | 2048×2048 | 去背 |

**numbers_01**
```
sprite sheet of numbers 0 1 2 3 4 5 6 7 8 9 plus "LV" and a colon ":", chunky cartoon 3D
gold lettering with thick dark-blue outline, bevel and glossy highlights, each character in
its own equal cell, evenly spaced in a single row, clear gaps, transparent background. 2048x512 PNG.
```
**font_01**（整套字型，與數字/LOGO 同一主體風格）
```
bitmap font sprite sheet, SAME style as the game logo/numbers: chunky cartoon 3D glossy GOLD
letters with thick dark-blue outline, bevel and highlights. Include uppercase A-Z, lowercase
a-z, and symbols: . , : ; ! ? ' " - + / % & ( ) and space. Each glyph centered in its own
equal cell, arranged in a neat grid, evenly spaced with clear gaps, consistent baseline and
size, transparent background, not overlapping. High detail. 2048x2048 PNG, transparent.
```
> 註：字母/符號須**等高、同基線、同風格**，方便當 bitmap 字型逐字拼排。

## 7. 特效　`pic/fx/`（選做）
| 檔案 | 用途 | 尺寸 | 背景 |
|------|------|------|------|
| `fx_01.png` | 特效圖集（PERFECT 爆閃／寶石碎裂／GAME OVER 裂痕） | 1536×512 | 透明 |
```
VFX sprite sheet, transparent background, 3 effects side by side with clear gaps, consistent
style: 1) golden celebration burst with light rays and sparkles; 2) shattering gemstone into
glowing shards; 3) cracked glass overlay in dark-blue tint. High detail. 1536x512 PNG.
```

## 8. 教學步驟圖示　`pic/howto/`（選做）
> HOW TO PLAY 的 4 步驟小圖（目前為 CSS/SVG），可美化成精緻圖示。

| 檔案 | 用途 | 尺寸 | 背景 |
|------|------|------|------|
| `howto_01.png` | 4 格教學圖示（記住順序／照順序點／PERFECT／小心愛心） | 2048×512 | 去背 |
```
sprite sheet of 4 small tutorial step icons in a row, transparent background, clear gaps,
consistent glossy cartoon style, deep navy-blue + cyan + gold:
1) a 3x3 grid of gems with three gems glowing in numbered order (memorize);
2) a hand tapping gems following a dotted path (repeat in order);
3) a green check with "PERFECT" sparkle (level clear);
4) three red hearts with one breaking (careful, 3 lives).
High detail, not overlapping. 2048x512 PNG, transparent.
```

## 9. 音樂　`music/`
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

## 10. 音效　`sfx/`
| 檔案 | 用途 | 長度 | 說明 |
|------|------|------|------|
| `sfx_01.mp3` | 點擊 | <0.4s | 清脆短「叮」(bright blip) |
| `sfx_02.mp3` | 正確 | <0.6s | 悅耳上揚兩音 (positive chime) |
| `sfx_03.mp3` | 點錯 | <0.6s | 低沉錯誤 buzz (soft error) |
| `sfx_04.mp3` | 過關 PERFECT | 1–2s | 歡樂上行琶音 (success fanfare) |
| `sfx_05.mp3` | GAME OVER | 1–2s | 下行失落音 (game-over descend) |

## 11. 影片　`video/`（選做）
| 檔案 | 用途 | 規格 |
|------|------|------|
| `vid_01.webm` | 開場/背景動態（透明或不透明） | 1080×1920, WebM |
| `vid_warp.webm` | **穿梭次元背景動畫**（循環，疊在背景上） | 1080×1920, WebM alpha 或不透明循環 |

**vid_warp（穿梭次元）提示詞**
```
seamless looping "dimension warp / hyperspace travel" background, vertical 9:16, deep
navy-blue to cyan, streaks of light and stars rushing outward from a central vanishing
point, glowing energy ripples and particles, fast but smooth, perfectly loopable, no text.
1080x1920 WebM.
```

---

## 12. 主角 / 角色（Character）　`pic/character/`
> 主角：**可愛宇宙冒險巴哥狗**，痞痞（帶壞笑、挑眉、自信）又富正義感（英雄站姿、金星徽章）。
> 深藍科技＋金色風格一致。目前為 SVG 墊底（`char_placeholder.svg`），待高質感版替換。

**角色設定（Character Bible）**
- 物種：巴哥犬（大眼、短皺鼻、垂耳、捲尾），可愛比例、頭大身小
- 個性：痞痞（嘴角壞笑、單邊挑眉、翹下巴）＋ 正義感（挺胸、手插腰或比讚）
- 服裝：太空探險裝＋透明頭盔（可開可關），胸口金色星形徽章，藍/白太空衣配金邊
- 世界觀：宇宙冒險，背景星雲、水晶、次元穿梭

| 檔案 | 用途 | 尺寸 | 背景 |
|------|------|------|------|
| `char_01.png` | 多姿態圖集（下列 6 姿態） | 2048×2048 | 去背 |

**姿態（sprite sheet，6 格）**
1. idle 待機（自信站姿，手插腰，微笑）
2. cheer 歡呼（過關 PERFECT，雙手舉起、興奮）
3. hurt 沮喪（GAME OVER，頭暈/失落）
4. think 專注（記憶階段，手托下巴、盯著看）
5. wave 打招呼 / thumbs-up 比讚（選單）
6. point 指引（教學）

```
character sprite sheet, 6 poses in a grid, transparent background, a cute cosmic-adventure
PUG DOG mascot: big expressive eyes, wrinkly short muzzle, floppy ears, chibi proportions,
wearing a space explorer suit with a clear helmet and a gold star badge on the chest.
Personality: a bit cheeky/roguish (smirk, raised eyebrow, confident) yet heroic and
righteous (hands on hips, chest out). Glossy cartoon 3D style, deep navy-blue + cyan glow +
gold, same lighting across all poses. Poses: 1 idle confident (hands on hips), 2 cheering
(arms up, excited), 3 dizzy/sad (knocked out), 4 focused thinking (paw on chin), 5 waving /
thumbs-up, 6 pointing. Each pose separate, not overlapping, not cropped. High detail.
2048x2048 PNG, transparent.
```

### 角色動態（交他 AI 做動畫；此處列規格）
> 原先另交其他 AI；使用者後續已明確要求本次直接製作及套用四種動態，詳見最新交接報告。以下保留原規格：
- **呼吸/待機動態（idle breathing）**：胸口/身體輕微起伏＋微浮動，2–3s 無縫循環
- **眨眼（blink）**：每 3–6s 隨機眨一次
- **歡呼/受傷/專注**的小動畫（配合過關/失敗/記憶階段）
- 交付格式：序列幀 sprite sheet（`char_anim_*.png`）、或透明 WebM、或 Lottie JSON（`char_idle.json`）

---

## ✅ 交付清單（越前面越重要）
- [x] `pic/background/bg_01.png`（來源已交付／已接入，原生尺寸見 audit）
- [x] `pic/branding/logo_01.png`（已交付／已接入）
- [x] `pic/titles/titles_01.png`（已交付／已切圖接入；原生 1254×1254，非 2048×2048）
- [x] `pic/ui/ui_01.png`（已交付；按鈕、愛心、齒輪、面板已接入，格子框備用）
- [x] `pic/gems/gems_01.png`（已交付／已接入）
- [x] `pic/numbers/numbers_01.png`（已交付，已接 LV）
- [x] `pic/font/font_01.png`（單張字型原圖已交付，原生 1254×1254；含 JSON 字元座標，待校正 baseline／字距與接入）
- [x] `music/bgm_01.mp3`（已交付／已接入）
- [x] `sfx/sfx_01.mp3` … `sfx_05.mp3`（已交付／已接入）
- [x] `pic/branding/icon_01.png`（已交付／已接入）
- [x] `pic/character/char_01.png`（6 姿態來源）與 `char_anim_idle/happy/sad/celebrate.png`（32 格，四種動態已套用）
- [x] `pic/titles/titles_02.png`（六詞已交付；ARCADE／CONTINUE／EXIT 已套用）
- [x] `video/vid_warp.webm`（1080×1920 無損來源已交付，尚未接入）
- [x] 選做：`pic/howto/howto_01.png`（已交付／已接入）
- [ ] 尚缺選做：`pic/branding/blade_01.png`、`pic/fx/fx_01.png`、`music/bgm_02.mp3`、`video/vid_01.webm`

> 給 GPT 的總指示：「請依這份清單做一套**風格統一**（深藍科技＋青光＋金色）的手機益智遊戲素材，
> 圖片透明背景、元件排整齊等距方便切圖。」
> 放好後跟我說「素材更新了」，我會切圖、替換 placeholder 並預覽。

## 圖片品質與檔案壓縮要求（2026-11-09）
- 圖片須大而清晰：後續生成或重新繪製以本表原定尺寸為交付目標；不得以放大小圖宣稱增加細節。
- 來源圖保留完整原始解析度、RGBA 透明度；禁止有損量化、減色或 JPEG 壓縮。
- PNG 僅接受無損壓縮，解碼後尺寸、色彩模式與每個像素必須完全相同；色彩描述資訊需保留。
- 現有圖保留原生尺寸；實際像素仍以 DELIVERY_V2.md 為準，部分尚未達本表指定尺寸。
- 已對現有八張 PNG 執行無損最佳化；逐張驗證見 LOSSLESS_COMPRESSION.json，重跑工具為 ../tools/optimize_png.py。
- 接手切圖時保留來源原圖，另產遊戲使用尺寸，避免重複縮放與失真。

## 最新新增素材交付（2026-11-09）
- `pic/titles/titles_01.png`：已交付，3 欄×4 列、十一組字與一格留白。
- `pic/howto/howto_01.png`：已交付，4 欄×1 列，原生 2172×724。
- 兩者皆透明 PNG，完成無損壓縮與逐像素驗證，尚待 Claude 切圖接入。
- 原生尺寸與原訂規格不同，保留真實解析度，不插值放大；詳見 repo 根目錄 docs/handoffs/2026-11-09-titles-howto.md。

## 字型單張交付（2026-11-09）
`pic/font/font_01.png` 已依使用者要求合併為一整張透明 PNG，包含大寫、小寫與常用符號；實際切圖座標見同資料夾 font_01.json，無損壓縮見 COMPRESSION.json。原生解析度未達原訂 2048×2048，未插值放大。接入前需光學校正基線／字距，報告見根目錄 docs/handoffs/2026-11-09-font-atlas.md。

## 最新素材核對與角色動態（2026-11-09）
勾選代表來源檔案已交付，並非每張圖片都符合原訂精確像素；實際尺寸與缺檔見 `assets/ASSET_AUDIT.json`（相對遊戲根目錄）。四種巴哥動態已按使用者要求製作並套用；32 格在 `pic/character/char_anim_*.png`。完整驗證、待接入項及四項尚缺選做素材見 repo 根目錄 `docs/handoffs/2026-11-09-character-animation-audit.md`。
