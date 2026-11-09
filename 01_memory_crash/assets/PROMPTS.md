# 🎨 Memory Crash — 美術圖集提示詞（系列合併版 / Sprite Sheets）

> 作法：**一張圖＝一個系列**（多個元件排在同一張透明圖上），GPT 一次生成一整套，
> 風格統一又省資源；我再用程式切圖套進遊戲。
>
> 📏 **切圖友善要求（每張都已內含）**：透明背景、元件**排成整齊網格、等距、每格等大、
> 元件間留明顯空隙、不重疊、不裁切**。檔案放 `assets/img/`，檔名照下方。
>
> 🎯 **全系列統一風格（請在每張都沿用，確保是一套的）**：
> ```
> consistent game art series, glossy cartoon 3D style, deep navy-blue sci-fi theme with
> glowing cyan accents, gold UI elements, same lighting and finish across all items,
> vibrant, high detail, clean
> ```
> **配色**：深藍 `#061a3a`／藍光 `#49c7ff`／金 `#ffe17a→#ffc02e→#e88a12`／金邊 `#7a3d04`／愛心紅 `#ff3b53`

---

## 🖼️ 圖集 1 — 寶石系列 `sheet_gems.png`
**版面**：4 欄 × 3 列 = 12 顆，透明背景，等距網格。建議 2048×1536（每格約 512）。
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

## 🖼️ 圖集 2 — UI 介面系列 `sheet_ui.png`
**內容**：金色按鈕（一般／按下／禁用）、藍色發光面板框、愛心（滿／空）、齒輪鈕、
寶石格子框（一般／發光）。透明背景、排整齊、各元件間留空隙。建議 2048×2048。
```
UI kit sprite sheet for a mobile puzzle game, transparent background, all items neatly laid
out with clear spacing, consistent glossy cartoon 3D style, deep navy-blue + cyan glow + gold.
Include, each as a separate clean element with NO text on them:
- gold rounded-rectangle button, 3 states: normal, pressed (darker), disabled (grey-gold);
- blue sci-fi panel frame with glowing cyan neon border (9-slice style, empty inside);
- red glossy crystal heart (full) and dark grey heart (empty);
- round blue settings button with a glowing cyan rim and a gold gear;
- rounded-square grid cell slot, 2 states: normal (thin blue border) and lit (bright white
  glowing border), both empty inside.
High detail, items not overlapping, not cropped. 2048x2048 PNG, transparent.
```

---

## 🖼️ 圖集 3 — 數字系列 `sheet_numbers.png`
**內容**：0–9 數字 + `LV` + `:`，金色卡通立體字，透明、等距一排（或兩排）。建議 2048×512。
```
sprite sheet of numbers 0 1 2 3 4 5 6 7 8 9 plus the letters "LV" and a colon ":",
chunky cartoon 3D gold lettering with thick dark-blue outline, bevel and glossy highlights,
each character in its own equal cell, evenly spaced in a single row, clear gaps, transparent
background, consistent style. 2048x512 PNG, transparent.
```

---

## 🖼️ 圖集 4 — 標題字系列 `sheet_titles.png`
**內容**：LOGO「MEMORY CRASH」、`START`、`OPTION`、`PERFECT`、`GAMEOVER`。
金色卡通立體字藝，透明、各自分開、上下排列。建議 1536×2048。
```
sprite sheet of game word-art titles, transparent background, stacked with clear spacing,
same chunky cartoon 3D style across all: thick gold letters ("MEMORY" gold, "CRASH" in
white-to-ice-blue) with dark-blue outline, bevel, highlights, slight skew. Include the pieces:
the two-line logo "MEMORY CRASH", and the words "START", "OPTION", "PERFECT", "GAMEOVER",
each as a separate clean art piece, not overlapping. High detail. 1536x2048 PNG, transparent.
```

---

## 🖼️ 圖 5 — 主背景 `bg_main.png`（單張，非圖集）
**規格**：1080×1920，不透明。
```
mobile puzzle game background, vertical 9:16, deep navy-blue sci-fi scene, glowing cyan
perspective grid floor fading into darkness at the bottom, soft radial blue glow from top,
subtle particles and bokeh, clean empty center for UI, no text, no characters, high detail.
Opaque. 1080x1920.
```

---

## 🖼️ 圖集 6 — 特效系列 `sheet_fx.png`（選做）
**內容**：PERFECT 金色爆閃、寶石碎裂、GAME OVER 玻璃裂痕。透明、分格排列。建議 1536×512。
```
VFX sprite sheet, transparent background, 3 effects side by side with clear gaps, consistent
style: 1) golden celebration burst with light rays and sparkles; 2) shattering gemstone
breaking into glowing shards; 3) cracked glass overlay in dark-blue tint. High detail.
1536x512 PNG, transparent.
```

---

## ✅ 交付清單（共 6 張，越前面越重要）
1. `sheet_gems.png` — 12 寶石（**必要**）
2. `sheet_ui.png` — 按鈕/面板/愛心/齒輪/格子（**必要**）
3. `sheet_numbers.png` — 數字 0–9 + LV（建議）
4. `sheet_titles.png` — LOGO 與橫幅字（建議）
5. `bg_main.png` — 背景（建議）
6. `sheet_fx.png` — 特效（選做）

> 💡 給 GPT 的總指示（可一次貼）：
> 「請做一套**風格統一**的手機益智遊戲 UI 美術，深藍科技感＋青色發光＋金色按鈕。
> 依我附上的 6 段提示詞各生成一張，透明背景、元件排整齊等距方便切圖。」
>
> 放好後跟我說「素材更新了」，我會切圖、替換 placeholder 並給你預覽。
> （AI 排版不會完全對齊沒關係，我會依實際位置切。）
