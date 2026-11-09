# 💎 Memory Crash（記憶序列遊戲）

參考使用者的 Figma 設計稿製作的網頁小遊戲。純前端（HTML / CSS / JavaScript），
開啟 `index.html` 即可遊玩，無需安裝、可離線。

## 🎯 玩法
1. 每關寶石會**依序發光**，記住它的順序。
2. 發光結束後，**照順序點回寶石**。
3. 全部點對 → **PERFECT**，進入下一關（關卡越高：序列越長、速度越快）。
4. 點錯會**扣一顆愛心**；愛心（3 顆）用完就 **GAME OVER**。
5. **MASTER MODE**：速度更快、從較高關卡起跳的挑戰模式。

## 🗂️ 檔案結構
```
01_memory_crash/
├── index.html            # 頁面結構（四個畫面 + 說明彈窗）
├── css/
│   └── style.css         # 全部視覺（背景/按鈕/寶石/愛心/標題，純 CSS）
├── js/
│   └── game.js           # 遊戲邏輯、音效(WebAudio)、關卡流程
├── assets/
│   ├── ASSETS.md         # 美術/音樂素材製作列表（完整規格＋提示詞）
│   ├── source/           # 外部素材（放這）
│   │   ├── pic/          #   圖片：background·branding·ui·gems·numbers·fx
│   │   ├── music/        #   背景音樂（bgm_01…）
│   │   ├── sfx/          #   音效（sfx_01…）
│   │   └── video/        #   影片
│   └── preview/          # 開發截圖（參考用）
├── README.md             # 本說明
└── PROGRESS.md           # 進度 / 待辦 / 交接筆記
```

## 🧩 目前狀態
- ✅ 四畫面（標題 / 選項 / 遊戲 / GAME OVER）+ 說明彈窗
- ✅ 記憶序列玩法、愛心、關卡、PERFECT/MISS 回饋
- ✅ WebAudio 音效（可在選項開關）、最佳紀錄（localStorage）
- ✅ MASTER MODE、鍵盤 Enter 開始
- 🟡 美術為 **CSS placeholder**，待外部素材替換（見 `assets/ASSETS.md`）

## 🔧 技術備註
- 版面為手機直式（9:16），桌機會置中顯示。
- 字體用 Google Fonts（Luckiest Guy / Fredoka），離線時自動退回系統粗體。
- 寶石 = CSS `clip-path` 幾何造型 + 每顆專屬顏色（共 12 色）。
- 之後接上 `assets/img/gem_01.png`… 時，會改以圖片顯示（替換邏輯見 PROGRESS 待辦）。

## ▶️ 執行
用瀏覽器直接開 `index.html`。（若音效無聲，點一下畫面以啟用瀏覽器音訊。）
