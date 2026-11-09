# 📋 Memory Crash — 製作進度 / 交接筆記

> 跨裝置接手請先讀這份。最後更新：2026-11-09

## ✅ 已完成
- [x] 專案結構（index.html / css / js / assets）
- [x] 標題畫面（LOGO、發光刀刃、START、齒輪入口）
- [x] 選項畫面（HOW TO PLAY / SOUND ON-OFF / HOME / MASTER MODE）
- [x] 遊戲畫面（HUD：齒輪+3愛心+LV、3×4 寶石棋盤、橫幅、狀態列）
- [x] GAME OVER 畫面（到達關卡、最佳紀錄、AGAIN / HOME）
- [x] 說明彈窗（HOW TO PLAY 內容）
- [x] 核心玩法：序列展示 → 玩家重現 → PERFECT / MISS → 扣愛心 / 過關
- [x] 關卡難度曲線（序列長度、閃示速度隨關卡增加）
- [x] MASTER MODE（更快、起始關卡較高）
- [x] WebAudio 音效（寶石音高、過關、失敗；可開關）
- [x] WebAudio 背景音樂（合成循環；OPTION 內 MUSIC ON/OFF，記憶設定）
- [x] HOW TO PLAY 縮圖步驟教學（4 步 SVG 圖示）；首次遊玩自動顯示
- [x] 最佳紀錄 localStorage（key: `mc_best`）
- [x] 截圖驗證四畫面、無 JS 錯誤
- [x] 完整素材製作列表 `assets/ASSETS.md`（背景/Logo/UI/寶石/數字/特效/音樂音效/Icon，依全專案標準範本）

## 🟡 進行中 / 待辦
- [ ] **接入外部美術素材**（等使用者產出後；路徑/檔名見 `assets/ASSETS.md`）
  - 圖集需切圖：`gems_01`(4×3)、`ui_01`、`numbers_01` 各切成單件再套用
  - 接法建議：
    - `source/pic/background/bg_01.png` → `.app` 背景改 `background-image`
    - `source/pic/branding/logo_01.png` → 用 `<img>` 取代 `.logo` 文字
    - `source/pic/gems/gems_01.png` → `buildBoard()` 內把 `.stone` 的 CSS 造型換成切好的寶石圖（依 index 對應）
    - `source/pic/ui/ui_01.png` → 按鈕用九宮格 `border-image`、愛心/齒輪/格子框改 `<img>`
    - `source/video/vid_01.webm` → 新增 `<video>` 疊層
- [ ] 音訊改用真實音檔（`music/bgm_01.mp3`、`sfx/sfx_01..05.mp3`；目前為 WebAudio 合成）
- [ ] 加入「連續過關 combo」與分數系統（可選）
- [ ] 手機觸控測試 / 不同螢幕比例微調
- [ ] 之後若要上線，考慮部署（GitHub Pages / Netlify）

## 🐞 已知事項
- 美術目前全為 CSS placeholder，非最終視覺。
- Google Fonts 需連網才會載入；離線時字體退回系統字（版面不受影響）。
- 瀏覽器政策：音效需使用者先互動（點擊）才會發聲，屬正常現象。

## 🔑 關鍵程式位置（給接手者）
| 功能 | 檔案 : 位置 |
|------|-------------|
| 棋盤格數 / 寶石顏色 | `js/game.js` 頂部 `COLS/ROWS/GEM_COLORS` |
| 難度（序列長度、速度）| `js/game.js` `seqLength()` / `flashTiming()` |
| 關卡流程 | `js/game.js` `nextLevel / playSequence / onGemClick / levelClear / gameOver` |
| 音效 | `js/game.js` `beep()` 與 `snd*` |
| 視覺樣式 | `css/style.css`（分區註解）|

## 🤝 協作備忘
- AI 寫規格+提示詞 → 使用者用外部工具（含影片生成）產出 → 放進 assets → AI 接上。
- 使用者更新素材後，告知「素材更新了」即可。
