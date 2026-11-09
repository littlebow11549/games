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
| `bg_01.png` | 主背景（全畫面共用） | 941×1672（原建議 1080×1920） | 不透明 |
```
mobile puzzle game background, vertical 9:16, deep navy-blue sci-fi scene, glowing cyan
perspective grid floor fading into darkness at the bottom, soft radial blue glow from top
center, subtle floating particles and bokeh, clean empty center for UI, no text, no
characters, high detail. Opaque. 1080x1920.
```

## 2. 品牌　`pic/branding/`

2026-11-10 更新：正式遊戲 icon 改 `icon_02.png`（1254×1254 衝鋒巴哥＋Logo，舊 icon_01 保留）。OPTION 標題新增 `pic/titles/option_hero.png`（1774×887）；首頁同系列 Banner 存根目錄 `assets/source/pic/banner/banner_02.png`。詳見 `docs/handoffs/2026-11-10-hero-brand-refresh.md`。
| 檔案 | 用途 | 尺寸 | 背景 |
|------|------|------|------|
| `logo_01.png` | 遊戲 LOGO「MEMORY CRASH」 | 1422×1106（原建議 900×700） | 去背 |
| `blade_01.png` | 標題裝飾：能量劍刃 | 845×1862（原建議 400×900） | 去背 |
| `icon_01.png` | App Icon（點陣版；向量版 `icon_01.svg` 已有） | 1254×1254（原建議 512×512） | 圓角方形 |

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
| `titles_01.png` | START · OPTION · READY · YOUR TURN · PERFECT · MISS · GAMEOVER · MASTER MODE · HOW TO PLAY · HOME · AGAIN | 1254×1254（原建議 2048×2048） | 去背 |
| `titles_02.png` | **（主選單）** ARCADE · CONTINUE · EXIT · MENU · PAUSE · RESUME | 1774×887（原建議 2048×1024） | 去背 |
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
| `ui_01.png` | UI 圖集（按鈕三態／面板／愛心／齒輪／格子框） | 1254×1254（原建議 2048×2048） | 去背 |
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
| `gems_01.png` | 12 顆寶石圖集（4欄×3列） | 1448×1086（原建議 2048×1536） | 去背 |
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
| `numbers_01.png` | 數字 0–9 ＋「LV」＋「:」（分數/等級用） | 2172×724（原建議 2048×512） | 去背 |
| `font_01.png` | 字型：A–Z、a–z、常用符號（一般文字用） | 1254×1254（原建議 2048×2048） | 去背 |

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
| `fx_01.png` | 特效圖集（PERFECT 爆閃／寶石碎裂／GAME OVER 裂痕） | 2172×724（原建議 1536×512） | 透明 |
```
VFX sprite sheet, transparent background, 3 effects side by side with clear gaps, consistent
style: 1) golden celebration burst with light rays and sparkles; 2) shattering gemstone into
glowing shards; 3) cracked glass overlay in dark-blue tint. High detail. 1536x512 PNG.
```

## 8. 教學步驟圖示　`pic/howto/`（選做）
> HOW TO PLAY 的 4 步驟小圖（目前為 CSS/SVG），可美化成精緻圖示。

| 檔案 | 用途 | 尺寸 | 背景 |
|------|------|------|------|
| `howto_01.png` | 4 格教學圖示（記住順序／照順序點／PERFECT／小心愛心） | 2172×724（原建議 2048×512） | 去背 |
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
> 深藍科技＋金色風格一致。正式六姿態及四種連續動態已交付並套用；`char_placeholder.svg` 僅作載入 fallback。

**角色設定（Character Bible）**
- 物種：巴哥犬（大眼、短皺鼻、垂耳、捲尾），可愛比例、頭大身小
- 個性：痞痞（嘴角壞笑、單邊挑眉、翹下巴）＋ 正義感（挺胸、手插腰或比讚）
- 服裝：太空探險裝＋透明頭盔（可開可關），胸口金色星形徽章，藍/白太空衣配金邊
- 世界觀：宇宙冒險，背景星雲、水晶、次元穿梭

| 檔案 | 用途 | 尺寸 | 背景 |
|------|------|------|------|
| `char_01.png` | 多姿態圖集（下列 6 姿態） | 1254×1254（原建議 2048×2048） | 去背 |

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
- [x] `pic/ui/ui_01.png`（按鈕、愛心、齒輪、面板、一般／發光格子框皆已接入）
- [x] `pic/gems/gems_01.png`（已交付／已接入）
- [x] `pic/numbers/numbers_01.png`（已交付，已接 LV）
- [x] `pic/font/font_01.png`（68 字元 metrics 已校正，bitmap 短標籤已接入，含原圖與 JSON）
- [x] `music/bgm_01.mp3`（已交付／已接入）
- [x] `sfx/sfx_01.mp3` … `sfx_05.mp3`（已交付／已接入）
- [x] `pic/branding/icon_01.png`（已交付／已接入）
- [x] `pic/character/char_01.png`（6 姿態來源）與 `char_anim_idle/happy/sad/celebrate.png`（32 格，四種動態已套用）
- [x] `pic/titles/titles_02.png`（六詞已交付；ARCADE／CONTINUE／EXIT 已套用）
- [x] `video/vid_warp.webm`（無損母檔已交付，輕量播放版已接標題與選單）
- [x] 選做：`pic/howto/howto_01.png`（已交付／已接入）
- [x] `pic/branding/blade_01.png`（已接標題）
- [x] `pic/fx/fx_01.png`（已接過關／失誤／結束）
- [x] `music/bgm_02.mp3`（已接 Master／LV10+，含 Ogg）
- [x] `video/vid_01.webm`（已接可跳過開場，無損母檔保留）

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
- 兩者皆透明 PNG，已完成無損壓縮、逐像素驗證及切圖接入。
- 原生尺寸與原訂規格不同，保留真實解析度，不插值放大；詳見 repo 根目錄 docs/handoffs/2026-11-09-titles-howto.md。

## 字型單張交付（2026-11-09）
`pic/font/font_01.png` 已依使用者要求合併為一整張透明 PNG，包含大寫、小寫與常用符號；實際切圖座標見同資料夾 font_01.json，無損壓縮見 COMPRESSION.json。原生解析度未達原訂 2048×2048，未插值放大。基線／字距現已校正並接入，舊交付報告保留歷史，最新狀態見根目錄 docs/handoffs/2026-11-09-finish-assets-integration.md。

## 最新素材核對與角色動態（2026-11-09）
勾選代表來源檔案已交付，並非每張圖片都符合原訂精確像素；實際尺寸與缺檔見 `assets/ASSET_AUDIT.json`（相對遊戲根目錄）。四種巴哥動態已按使用者要求製作並套用；32 格在 `pic/character/char_anim_*.png`。完整驗證、待接入項及四項尚缺選做素材見 repo 根目錄 `docs/handoffs/2026-11-09-character-animation-audit.md`。

## 清單收尾完成（2026-11-09）
前述四項選做素材已補齊並接入；字型 metrics、穿梭影片、格子框已完成接入。來源表尺寸已如實列原生值，保留原建議作對照，沒有插值假放大。標題與選單使用輕量視訊播放版，RGB 無損母檔仍保留。完整收尾與驗證報告：repo 根目錄 docs/handoffs/2026-11-09-finish-assets-integration.md。舊段落提到的待辦以此及勾選清單為準。

---

## 🆕 設計需求（2026-11-09 第二批，交 GPT 製作）
> 以下為目前用 CSS 暫代、需 GPT 做高質感版的項目。風格一律沿用：深藍科技＋青光＋金色，與現有素材一致。

### D1. 彈出主視覺文字（衝擊版）　`pic/titles/`
遊戲中的彈出提示（READY / YOUR TURN / PERFECT / MISS / AGAIN / COMBO）要**大且有衝擊力**。
- 需求：每個詞做成**帶能量爆裂/光爆背景**的立體字，置中彈出用。可做兩種交付：
  - (a) 單張去背 PNG（字＋光爆一體），檔名 `titles_fx_<word>.png`，每張約 1200×700，去背。
  - (b) 或序列幀 sprite sheet `titles_fx_<word>_seq.png`（6–8 格）做出「砸下→抖動→殘光」動態。
```
game popup word-art "{WORD}" with explosive impact: chunky gold 3D letters (blue outline,
bevel, glossy) bursting out of a radial energy shockwave, light rays, sparks and shards,
cyan + gold, dramatic, centered, transparent background. PERFECT=celebratory gold burst,
MISS/GAMEOVER=red alert burst. 1200x700 PNG (or 6-8 frame sprite sheet for the slam anim).
```

### D2. 計量表 / 倒數進度條　`pic/ui/`
目前倒數條是純 CSS，需要有質感的框與填充。
- `gauge_frame.png`：進度條外框（膠囊狀，金屬/能量框，兩端有端蓋），約 1000×160，去背，九宮格可拉伸。
- `gauge_fill.png`：填充條（青→金漸層、帶流動高光），約 1000×120，可水平裁切顯示。
- `gauge_fill_low.png`：剩餘不多時的紅色警示填充（帶脈動光）。
```
sci-fi game progress/timer bar, horizontal capsule, glossy metal-and-energy frame with glowing
cyan rim and gold end-caps (empty inside), plus a separate fill bar (cyan-to-gold gradient with
a flowing highlight) and a red "low/danger" fill variant. Deep navy + cyan + gold, transparent
background. Frame 1000x160, fills 1000x120 PNG, 9-slice friendly.
```

### D3. 場景氣氛（光線 / 次元風暴）　`video/` 或 `pic/fx/`
畫面要有動態場景氣氛（目前 CSS 暫代）。
- 首選影片：`video/vid_ambient.webm`（1080×1920，無縫循環，可疊在背景上）：緩慢流動的**次元風暴**、光束、漂浮粒子、能量波紋。
- 或序列/透明疊圖：`pic/fx/ambient_sheet.png`（光束掃動＋粒子，多格）。
```
seamless looping atmospheric overlay for a deep-blue sci-fi puzzle game, vertical 9:16:
slow swirling dimension-storm energy, soft god-ray light beams sweeping from the top, drifting
glowing particles and faint energy ripples, subtle (must not overpower UI), loopable, mostly
transparent/dark. 1080x1920 WebM (alpha preferred) or a particle+rays sprite sheet PNG.
```

### D4. Logo 流光（選做）　`pic/branding/`
- `logo_shine.png`：可疊在 logo 上掃過的高光帶（白色柔光斜帶，去背），或直接交付**已內建流光的 logo 動態** `logo_anim.webm`（透明循環，光帶定時掃過字面）。
```
glossy sweeping light streak / shine band overlay (soft white diagonal highlight) to animate
across the game logo, transparent background; OR a transparent looping WebM of the "MEMORY
CRASH" logo with a light sweep crossing the letters every few seconds.
```

> 交付後放入對應資料夾並告知「素材更新了」，我接圖/影片、替換 CSS 暫代版。


### 第二批交付更新（Codex，2026-11-09）
- [x] D1 六組高解析獨立透明衝擊字藝 `titles_fx_{ready,your_turn,perfect,miss,again,combo}.png`。
- [x] D2 `gauge_frame.png`／`gauge_fill.png`／`gauge_fill_low.png`。
- [x] D3 `video/vid_ambient.webm` 六秒24fps循環，原生941×1672；無 alpha，RGB無損母檔＋940×1672輕量播放版。不是1080×1920，未插值放大。
- [x] D4 `branding/logo_shine.png` 1024×1536透明斜光帶。
- 以上勾選代表素材交付，**正式遊戲尚待 Claude 接入**。圖片真實原生尺寸、無損核對與容量：`source/BATCH2_DELIVERY.json`。
- 獨立動態展示：`assets/preview/batch2.html`（相對遊戲根目錄）；完整交接：根目錄 `docs/handoffs/2026-11-09-batch2-art.md`。

---

## 🆕 設計需求（2026-11-09 第三批，交 GPT）— 重繪主視覺
> 使用者回饋：主選單/標題的巴哥用 CSS 裁切做不出想要的構圖；請 GPT **重繪整張合成主視覺**。狗頭要大、要有衝擊力與動感。

### KV1. 主選單/標題 主視覺大圖　`pic/kv/kv_main.png`
- 一張**合成好的主視覺直式圖**（1080×1920 或更高，去背或含氛圍背景皆可，另附去背角色層更佳）。
- 主角：太空英雄巴哥**衝鋒陷陣**的動感姿勢（向前衝/出拳/飛撲擇一），**狗頭佔畫面顯眼比例**（約畫面寬 55–70%）。
- 周圍：**所有寶石（12 色）漂浮環繞**，要有飄動感（錯落、景深、發光）。
- 風格：深藍科技＋青光＋金色，與現有一致。
- 交付建議：`kv_main.png`（整張）＋ `kv_pug.png`（去背主角）＋ `kv_gems/`（單顆去背寶石供飄浮動畫），這樣我可做視差飄動。

### KV2. 主角大頭像（選單用，備案）　`pic/character/pug_head.png`
- 若不做整張 KV，至少給一張**去背大頭像半身**（頭大、清晰、英雄表情），1024×1024，供選單置中大圖。

### KV3. START 立體字（重新設計）　`pic/titles/start_hero.png`
- 高級、乾淨俐落、有份量的「START」立體字（金屬金＋藍描邊或能量感），去背 PNG，約 1200×600。目前 CSS 字與舊字藝都不夠好。

### KV4. 彈出精靈特效優化　`pic/titles/` 或 `pic/fx/`
- 現有 `titles_fx_*` 彈出效果使用者覺得「差」。請做**更精緻的彈出字特效**：字體更俐落、光爆/粒子/能量環更有層次；可交**序列幀 sprite sheet**（8–12 格，砸下→爆裂→殘光）讓動態更到位，或更高質感的單張。
- 詞：READY / YOUR TURN / PERFECT / MISS / AGAIN / COMBO。

> 交付後放對應資料夾，告知「素材更新了」，我接入並做視差/飄動/切幀。

### 第三批交付更新（Codex，2026-11-09）
- [x] KV1 `pic/kv/kv_main.png`（941×1672 不透明，未達原建議1080×1920）及 `kv_pug.png`（1090×1443去背角色）。
- [x] KV2 `pic/character/pug_head.png`（1254×1254透明半身像）。
- [x] KV3 `pic/titles/start_hero.png`（1774×887透明）。
- [x] KV4 `pic/titles/titles_fx_{ready,your_turn,perfect,miss,again,combo}_v3.png`（各1774×887透明高品質單張，非序列幀）。
- 全數有同原生解析度、逐像素相同的無損 WebP，見 `runtime/pic/batch3/`；容量／雜湊／alpha 見 `source/BATCH3_DELIVERY.json`。
- 獨立預覽 `preview/batch3.html`，12顆漂浮寶石重用既有圖集；選配新寶石獨立圖未製作。
- **勾選代表素材交付，正式遊戲尚未接入。** 接入說明、驗證與限制見根目錄 `docs/handoffs/2026-11-09-batch3-hero-art.md`。

## 🆕 設計需求（2026-11-09 第四批，交 GPT）— 全身主角

使用者回饋：首頁/選單主角目前用 KV2 半身像（`pug_head`），下半身被切掉看起來像被截斷。需要「完整身體、站姿」的主角去背圖，取代首頁與選單的半身像。

### KV5. 全身站姿主角（待機）　`pic/character/pug_full.png`
- **用途**：首頁 START 畫面與主選單的主角。需完整從頭到腳、不裁切。
- **造型**：沿用現有巴哥太空英雄（圓形玻璃頭盔、深藍+金色太空戰衣、胸口金色星星、青色能量點、金色手套與靴子），與 `kv_main`/`pug_head` 同一角色、同配色，確保一致性。
- **姿勢**：正面站姿、雙腳著地、昂首挺胸的「待機準備戰鬥」英雄感；可微微 3/4 側身增加立體感，但雙腳與身體須完整可見。表情自信微笑（露一點舌頭/虎牙，親切但英勇）。
- **構圖**：角色置中，頭頂到腳底完整入框，四周留足透明邊距（上下各約 8–12%），避免任何部位貼邊。角色在畫面中**水平置中**（內容質心接近 50%），方便程式直接置中不需補償。
- **尺寸 / 格式**：直式 **1024×1536 PNG，透明去背（RGBA，含完整 alpha）**；原生輸出、不插值放大、不減色。角色主體高度約佔畫面 80–88%。
- **光影**：柔和頂光 + 角色邊緣淡青色輪廓光，與深藍次元場景相融；地面可有極淡接觸陰影（或完全去背、由程式加陰影）。
- **一致性**：臉部比例、頭盔反光、戰衣細節與 `pug_head.png` 一致，讓半身像與全身像可互換不違和。
- **交付**：來源 `pic/character/pug_full.png` + 對應 `runtime/pic/batch3/pug_full.webp`（或新批次夾）；附尺寸/雜湊/alpha 範圍於交付 JSON。

### KV5b.（選做）全身動態分解
- 若行有餘力，另出「待機呼吸」2–3 格或輕微上下浮動版本（同構圖、分層），供程式做更自然的待機動畫；非必要，先交靜態全身即可。

### 接入方式（Claude）
- 收到 `pug_full` 後，首頁 `.title-char` 與選單 `.menu-char` 由 `pug_head.webp` 改為 `pug_full.webp`，移除目前的底部柔化 mask，改為完整顯示全身；保留待機呼吸動態與漂浮寶石。
