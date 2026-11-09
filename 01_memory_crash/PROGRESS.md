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

## ✅ 已接入實體素材
- [x] 背景 `bg_01.png`（`.app` 背景；關閉原 CSS 格線/暗角）
- [x] Logo `logo_01.png`（`<img>` 取代標題文字）
- [x] favicon `icon_01.png`
- [x] 寶石 `gems_01.png`（4×3 圖集，含浮動/發光動畫）← 前一棒接入
- [x] 音訊：背景音樂 `bgm_01.mp3`（循環）、音效 `sfx_01..05`（點擊/正確/點錯/過關/結束）
      ；保留 SFX/MUSIC 獨立開關、記憶設定、互動後播放；寶石音高仍用 WebAudio

## 🟡 進行中 / 待辦
- [ ] **UI 圖集 `ui_01.png` 切圖替換**（3×3：按鈕三態／面板框/紅心/空心/齒輪/格子框兩態）
  - 愛心（滿/空）、齒輪：切成單圖替換 `.heart`、`.icon-btn`
  - 金色按鈕三態：九宮格 `border-image`
  - 面板框、寶石格子框：切圖替換（注意圖集邊緣有雜訊，需裁乾淨）
- [ ] 數字 `numbers_01.png`（6×2）切圖替換 LV 數字（選做）
- [ ] 實機聽測音樂循環接縫、混音音量
- [ ] 加入「連續過關 combo」與分數系統（可選）
- [ ] 手機觸控測試 / 不同螢幕比例微調

## 🐞 已知事項
- UI 按鈕/面板/愛心/齒輪目前仍為 CSS placeholder（視覺已佳），待 `ui_01` 切圖替換。
- `ui_01.png` 與 `numbers_01.png` 邊緣有生成雜訊，切圖需依實際邊界裁切。
- Google Fonts 需連網才會載入；離線時字體退回系統字（版面不受影響）。
- 瀏覽器政策：音效/音樂需使用者先互動（點擊）才會發聲，屬正常現象。

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

## Codex 素材交接（2026-11-09）
- 六項主要圖片、主 BGM 與五種音效已依 ASSETS.md 分類放入 assets/source/。
- 寶石已接上浮動、發光與點擊動畫，其餘素材待 Claude 接入。
- 詳見 CLAUDE_HANDOFF.md 與 assets/DELIVERY_V2.md，包含原始尺寸與尚待聽測項目。
