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

## ✅ UI 圖集已接入（ui_01 切成 9 張乾淨單圖 → `assets/source/pic/ui/`）
- [x] 金色按鈕三態（`btn_normal/pressed/disabled.png`）→ `.gold-btn` `border-image`
- [x] 藍色面板框（`panel.png`）→ `.panel` `border-image`
- [x] 愛心滿/空（`heart_full/empty.png`）→ `.heart`
- [x] 齒輪鈕（`gear.png`）→ `.icon-btn`
- [x] 切圖工具：`tools/`（slice 腳本於 scratchpad；已產出 `ui/*.png`）

## ✅ 文字/數字/教學素材已接入
- [x] 數字 `numbers_01.png`（6×2）→ 切成 n0–n9/lv/colon，HUD LV 用圖顯示
- [x] 主視覺文字 `titles_01.png`（3×4）→ 切成 11 字藝：START/OPTION/READY/
      YOUR TURN/PERFECT/MISS/GAMEOVER/MASTER MODE/HOW TO PLAY/HOME/AGAIN
      （標題、動態橫幅、GAMEOVER、按鈕字、彈窗標題皆已替換）
- [x] 教學圖示 `howto_01.png`（4 格）→ 切成 step1–4，替換說明彈窗 SVG（保留文字）

## 🟡 進行中 / 待辦
- [ ] 字型 `font_01.png` 單張素材及 JSON 座標已交付；待基線／字距校正與一般文字接入，詳見根目錄 docs/handoffs/2026-11-09-font-atlas.md
- [ ] 寶石格子框 `slot.png`/`slot_lit.png`（已切好備用；棋盤目前用 CSS 框）
- [ ] 實機聽測音樂循環接縫、混音音量
- [ ] 加入「連續過關 combo」與分數系統（可選）
- [ ] 手機觸控測試 / 不同螢幕比例微調

## 🐞 已知事項
- UI 按鈕、面板、愛心、齒輪已換成切圖素材；格子框仍保留 CSS。
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

## 新增美術交付（2026-11-09）
- 已補齊 `assets/source/pic/titles/titles_01.png` 與 `assets/source/pic/howto/howto_01.png`。
- 已確認透明與無損像素一致，尚待切圖與接入。
- 完整切圖順序、實際解析度與後續事項見根目錄 `docs/handoffs/2026-11-09-titles-howto.md`；全專案交接入口 `docs/HANDOFF.md`。

## 遊戲新分頁與關閉（2026-11-09）
- 首頁遊戲入口皆另開新分頁；遊戲右下角新增六語「關閉遊戲」，不允許關閉時返回中心。
- 實作、測試與限制見根目錄 docs/handoffs/2026-11-09-compact-banner-game-tabs.md。

## 巴哥動畫與素材核對（2026-11-09）
- 呼吸眨眼／高興／難過／慶祝：四張 8 格圖集，共 32 格，已接入選單、點對、失誤、過關與結算。
- 主選單 ARCADE／CONTINUE／EXIT 已接 titles_02。
- 字型單張及穿梭 WebM 來源已交付；字型排版與影片接入仍待處理。
- 核對必要來源均有檔案，但四項選做仍缺，部分原生尺寸與原規格不同，不宣稱全數達規格。
- 詳見根目錄 docs/handoffs/2026-11-09-character-animation-audit.md 與 assets/ASSET_AUDIT.json。
