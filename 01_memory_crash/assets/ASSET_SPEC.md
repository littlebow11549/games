# 🎨 MEMORY CRASH — 素材規格 & 提示詞總表

> 合作方式：此表由 Claude 撰寫規格與提示詞 → 你用外部工具（圖片／影片生成）產出 →
> 檔案依「檔名」放進對應資料夾 → Claude 負責接進遊戲。
>
> 放置位置：
> - 圖片 → `assets/img/`
> - 影片 → `assets/video/`
>
> 命名請**完全照「檔名」欄**，我程式會直接用這些名字去讀，改名就接不到。

---

## 0. 全域美術方向（請在每個提示詞沿用，確保風格一致）

**風格關鍵字（建議貼在每個提示詞開頭）：**
```
mobile puzzle game UI art, glossy cartoon 3D style, deep navy-blue sci-fi background
with glowing cyan perspective grid floor, polished gold beveled elements, vibrant
saturated colors, soft rim light, high detail, clean, centered, game asset
```

**配色參考：**
| 用途 | 色碼 |
|---|---|
| 深藍背景 | `#061a3a` → `#0b3f7a` |
| 科技藍光 | `#49c7ff` |
| 金色按鈕 | `#ffe17a` → `#ffc02e` → `#e88a12`（上亮下深）|
| 金邊/描邊 | `#7a3d04` |
| 愛心紅 | `#ff3b53` |

**通用技術規格：**
- 格式：**PNG（去背 / 透明背景）**，除非該列另有標註
- 色彩：sRGB
- 若工具支援，請輸出 **@2x / @3x**（我會自動對應），檔名加 `@2x`、`@3x`

---

## 1. 圖片素材一覽表

| ID | 用途 | 檔名 | 尺寸 (px) | 背景 | 備註 |
|----|------|------|-----------|------|------|
| IMG-01 | 遊戲主背景（直式） | `bg_main.png` | 1080 × 1920 | 不透明 | 深藍＋藍光格線地板，中央留白放 UI |
| IMG-02 | 標題 LOGO「MEMORY CRASH」 | `logo.png` | 900 × 700 | 去背 | 金色卡通立體字＋藍白漸層 |
| IMG-03 | 標題裝飾：發光寶劍/刀刃 | `blade.png` | 400 × 900 | 去背 | 藍色能量劍，可發光 |
| IMG-04 | 金色按鈕（一般態） | `btn_gold.png` | 600 × 180 | 去背 | 九宮格可拉伸，純底無文字 |
| IMG-05 | 金色按鈕（按下態） | `btn_gold_press.png` | 600 × 180 | 去背 | 同上，壓深/變暗 |
| IMG-06 | 金色按鈕（禁用態） | `btn_gold_off.png` | 600 × 180 | 去背 | 灰金、半透明，給 MASTER MODE 鎖定用 |
| IMG-07 | 藍色發光面板框 | `panel_blue.png` | 720 × 900 | 去背 | 九宮格可拉伸的藍光外框 |
| IMG-08 | 愛心（滿） | `heart_full.png` | 120 × 120 | 去背 | 紅色水晶愛心＋高光 |
| IMG-09 | 愛心（空） | `heart_empty.png` | 120 × 120 | 去背 | 灰暗愛心輪廓 |
| IMG-10 | 齒輪/設定按鈕 | `icon_gear.png` | 120 × 120 | 去背 | 藍色圓底金齒輪 |
| IMG-11 | 寶石格子底框（單格） | `tile_frame.png` | 240 × 240 | 去背 | 深色圓角方框，藍邊 |
| IMG-12 | 寶石格子底框（發光態） | `tile_frame_lit.png` | 240 × 240 | 去背 | 同上，白邊強發光 |
| GEM-01~12 | 12 顆寶石 | `gem_01.png` … `gem_12.png` | 220 × 220 | 去背 | 見下方「寶石清單」顏色對應 |

### 寶石清單（GEM-01 ~ GEM-12）
程式已用這 12 個顏色排序，請讓寶石**顏色依序對應**，方便辨識：

| 檔名 | 顏色 | 形狀建議 |
|---|---|---|
| `gem_01.png` | 天藍 `#49c7ff` | 水滴切割鑽 |
| `gem_02.png` | 淺青 `#7fe0ff` | 長方祖母綠切割 |
| `gem_03.png` | 紫 `#9b7bff` | 多角尖晶 |
| `gem_04.png` | 青綠 `#5effa0` | 菱形 |
| `gem_05.png` | 翠綠 `#3ddc84` | 方形切割 |
| `gem_06.png` | 萊姆綠 `#b6ff4e` | 螺旋/棒棒糖寶石 |
| `gem_07.png` | 橘紅 `#ff7a3c` | 方墊切割 |
| `gem_08.png` | 桃紅 `#ff5ea8` | 心形 |
| `gem_09.png` | 紅 `#ff4e4e` | 尖水晶 |
| `gem_10.png` | 橘 `#ffb14e` | 碎片原石 |
| `gem_11.png` | 琥珀棕 `#c98b5a` | 熔岩原石 |
| `gem_12.png` | 白 `#eaf2ff` | 鑽石 |

---

## 2. 圖片提示詞（可直接複製）

> 每則都已含全域風格。生成時固定要求：**透明背景、置中、單一物件、無文字**（LOGO 除外）。

### IMG-01 主背景
```
mobile puzzle game background, vertical 9:16, deep navy-blue sci-fi scene, glowing
cyan perspective grid floor fading into darkness at the bottom, soft radial blue glow
from top center, subtle particles and bokeh, empty clean center area for UI, no text,
no characters, high detail, game art. Opaque background. 1080x1920.
```

### IMG-02 LOGO
```
game logo text "MEMORY CRASH", chunky cartoon 3D lettering, top word "MEMORY" in glossy
gold with thick dark-blue outline and 3D extrude, bottom word "CRASH" in glossy white-to-
ice-blue gradient, bold playful arcade style, strong bevel and highlights, slight skew,
transparent background, centered, high detail. 900x700 PNG.
```

### IMG-03 發光刀刃
```
glowing blue energy blade / crystal sword blade pointing down, cyan to deep-blue gradient,
bright rim light and glow, sci-fi fantasy game item, symmetrical, transparent background,
centered. 400x900 PNG.
```

### IMG-04 / 05 / 06 金色按鈕（三態）
```
mobile game UI button base, horizontal pill/rounded-rectangle, glossy gold gradient
(light gold top to deep amber bottom), thick dark-amber bevel border, glass highlight on
top, NO text, clean, transparent background, centered. 600x180 PNG.
-- 按下態：same button but pressed/darker, highlight reduced.
-- 禁用態：same button but desaturated grey-gold, 60% opacity, looks locked/disabled.
```

### IMG-07 藍光面板
```
sci-fi UI panel frame, rounded rectangle, dark translucent navy fill, glowing cyan neon
border, soft inner glow, 9-slice stretchable, no text, transparent background. 720x900 PNG.
```

### IMG-08 / 09 愛心
```
glossy red crystal heart icon, game life/HP heart, bright specular highlight, subtle dark
outline, slight 3D, transparent background, centered. 120x120 PNG.
-- 空心態：same heart but dark grey, dim, empty/lost state.
```

### IMG-10 齒輪
```
settings gear icon inside a round button, blue circular base with cyan glowing rim, golden
cog in center, clean game UI icon, transparent background, centered. 120x120 PNG.
```

### IMG-11 / 12 寶石格子底框
```
game grid cell frame, rounded square slot, dark glossy interior, thin glowing blue border,
empty (no gem inside), transparent background, centered. 240x240 PNG.
-- 發光態：same slot but bright white glowing border, strong neon highlight (active state).
```

### GEM-01 ~ GEM-12 寶石（單顆範本，換顏色/形狀即可）
```
single faceted gemstone, {顏色名/色碼} color, glossy crystal, sharp facets, bright specular
highlights, inner glow, slight dark outline, floating, transparent background, centered,
game item icon style, high detail. 220x220 PNG.
```
> 逐顆把 `{顏色}` 換成「寶石清單」的顏色與形狀，共 12 顆。

---

## 3. 影片 / 動態素材一覽表

| ID | 用途 | 檔名 | 規格 | 格式 | 備註 |
|----|------|------|------|------|------|
| VID-01 | 開場動畫（LOGO 進場） | `intro.webm` | 1080×1920, 3–5s | WebM(VP9)+MP4 備援 | 可跳過；結尾定格在標題 |
| VID-02 | 背景循環動態 | `bg_loop.webm` | 1080×1920, 6–10s loop | WebM 透明或不透明 | 格線流動＋粒子，無縫循環 |
| VID-03 | PERFECT 過關特效 | `fx_perfect.webm` | 1080×1080, 1–1.5s | WebM **透明通道** | 金色爆閃＋星光，疊在棋盤上 |
| VID-04 | 寶石碎裂特效 | `fx_crash.webm` | 512×512, 0.6s | WebM **透明通道** | 單顆寶石碎裂，疊在格子上 |
| VID-05 | GAME OVER 轉場 | `fx_gameover.webm` | 1080×1920, 1.5–2s | WebM/MP4 | 畫面變暗＋裂痕 |

> ⚠️ 透明背景影片請輸出 **WebM（VP9 / alpha channel）**；若工具只給 MP4，請改用**純黑或純綠背景**並告訴我，我用 CSS/blend 去背或改走 sprite 動畫。
> 檔案盡量壓到單檔 < 3MB（網頁載入快）。

---

## 4. 影片提示詞（可直接複製）

### VID-01 開場
```
3-5 second game intro animation, vertical 9:16, deep blue sci-fi space, a glowing blue
energy sword drops and strikes, shockwave of light reveals the gold cartoon logo
"MEMORY CRASH", sparks and lens flare, cinematic, ends holding on the title. 1080x1920.
```

### VID-02 背景循環
```
seamless looping background, vertical 9:16, deep navy-blue, slow flowing cyan grid floor,
drifting glowing particles and soft bokeh, calm ambient sci-fi, perfectly loopable, no
text, no characters. 1080x1920, 8s loop.
```

### VID-03 PERFECT 特效
```
short 1.2s celebration VFX on transparent background (alpha), golden burst, radial light
rays, sparkling stars and glints expanding outward then fading, arcade "perfect" feel,
centered. 1080x1080 WebM with alpha.
```

### VID-04 寶石碎裂
```
0.6s single gemstone shattering into glowing shards, bright flash then pieces fly out and
fade, transparent background (alpha), centered, game VFX. 512x512 WebM with alpha.
```

### VID-05 GAME OVER
```
1.5s game-over transition, vertical 9:16, screen cracks like glass, light drains away,
color desaturates to dark blue, dramatic, ends dark. 1080x1920.
```

---

## 5. 交付清單（Checklist）

**圖片（共 27 檔）**
- [ ] bg_main.png
- [ ] logo.png
- [ ] blade.png
- [ ] btn_gold.png / btn_gold_press.png / btn_gold_off.png
- [ ] panel_blue.png
- [ ] heart_full.png / heart_empty.png
- [ ] icon_gear.png
- [ ] tile_frame.png / tile_frame_lit.png
- [ ] gem_01.png … gem_12.png（12 顆）

**影片（共 5 檔，選做）**
- [ ] intro.webm
- [ ] bg_loop.webm
- [ ] fx_perfect.webm
- [ ] fx_crash.webm
- [ ] fx_gameover.webm

> 你可以**分批交**，交多少我接多少；沒交的部分我就維持目前的 CSS 版本，不影響遊戲運作。
> 檔案放好後，跟我說「素材更新了」，我就會把它們接進遊戲並讓你預覽。
