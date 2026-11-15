# 勝利圖片展演、漫畫回饋與無損讀取優化

## 完成內容
- `js/victory-storyboard.js`：Boss 勝利改為 6 秒三鏡圖片展演（蓄勢／拳擊交錯／擊飛收勢）。沿用 `tf_pose`、`tf_glove` 與各 Boss 已交付分鏡，雙 Boss 同框。不是新增逐格手繪動畫，也沒有重製角色圖。
- `js/cinematics.js`：勝利不建立或繪製 3D 場景；圖片完成 decode 才播放，失敗顯示重試。跳過／自然播完均接回既有結算、結局及排行。Canvas 上限 30 Hz／DPR 1.5，減少動態模式每鏡只畫一次；只保留當次 Boss 圖片引用。
- `css/comic-polish.css`：依使用者參考設計金色切面按鈕、立體金色數字；沿用等寬操作排列。過場用白底爆裂框，怒吼／終結重擊用橘金色；換句短促彈入震動。中英日共用造型、文字仍是可翻譯 DOM。
- `js/system-art.js`：連擊數字上彈、過衝與回彈，里程碑幅度更大；四／五位數縮字。受擊增加 65ms hitstop、隨傷害的短震動與淡出邊緣閃光；減少動態偏好停用震動及閃光。
- `js/fx.js`：拳風／技能環加入漸尖金橘火焰帶與亮芯，單一 mesh，沿用資源銷毀。勝利圖片上另有短火花及金色弧線。未直接使用參考圖、未處理參考圖浮水印。

## 載入壓縮與分類
- 原圖完整保留於 `assets/source/pic/`；75 張實際配送圖新增於 `assets/runtime/lossless/pic/`，不是新增美術設計。保留原生尺寸與透明度。
- `tools/compress_runtime.py` 使用 Pillow lossless WebP，重新解碼比對每個 RGBA 像素（包含透明像素）及尺寸；所有來源 SHA256／尺寸／前後大小在 `assets/runtime/lossless/report.json`。執行 `python 02_brave_guy/tools/compress_runtime.py` 可重建及驗證。
- 75 檔合計 **144,867,890 → 108,505,414 bytes**，降低 25.1%；沒有降解析度或有損壓縮。
- CSS、Canvas、Three 貼圖、動態圖片 URL 與 `runtime-images.json` 一致改用配送版。Apple touch icon 仍保留 PNG。模組及入口版本鍵統一 `20261115fast`，避免同時載入兩份 i18n／loading 模組。
- `js/loading.js` 首屏只預載符合當前畫面方向的主視覺，略過未使用 branding 圖；其餘開場／選單必需圖仍 decode 後才放行。戰鬥與個別 Boss／結局維持各自準備閘門，不一次下載全遊戲。
- 相同 Chromium 390×694、全新瀏覽器頁面：首屏 **30,166,992 → 18,569,626 bytes（-38.44%）**。這是資源下載量，不是手機秒數或 FPS 提升承諾；原始測量在 `assets/preview/victory-comic-fast/`。主選單無隱藏 scene draw、暫停只保留快照、Boss 圖片不畫 3D 的既有優化保持。

## 驗證
- 16 Node 單元測試通過，包含新增火焰 mesh 的資源回收。
- `game02-victory-pictures.cjs`：13 Boss × 3 語 × 3 鏡共 117，雙 Boss、減少動態、跳過、自然結束、缺圖重試及勝利零 3D draw 通過。
- `game02-comic-polish.cjs`：白／橘框、台詞震動、連擊過衝、受擊停頓／震動、等寬按鈕、減少動態通過。
- `game02-finish-flow.cjs`：勝利→結算、最終二次變身、結局→排行、三語失敗重試、單關前三通過。
- `game02-loading-gate.cjs`：慢圖阻止進入、戰鬥圖等待、Boss 缺圖阻擋及重試通過。
- `game02-delivery.cjs`：首屏低於舊版七成、沒有 source PNG 請求／不需要的橫版主視覺請求、能進入戰鬥、零頁面錯誤／404。
- `game02-stage-victories.cjs`：14關×3語42組通過；結算成績凍結、單次授予、最終勝利→結局→Staff、三種尺寸不橫向溢出、重試／回選單均正確，零錯誤／404。
- 新截圖與測量保存在 `assets/preview/victory-comic-fast/`。不覆寫歷史交付預覽。

## 範圍與發布
- 14 張既有未提交爭議稿原樣保留，沒有加入提交；沒有恢復生成佇列。
- 此次不將覺醒／失敗的既有 3D 過場宣稱為圖片動畫。
- 本報告與實作一併提交 PR，合併預設分支後由 GitHub Pages 發布；正式部署結果另於交付訊息回報。

## 發布補記
- PR #50 已合併（`1d76e1fad2593e249979058fa7cc11b965bade4c`），Pages #43721658502 成功。
- 線上查核發現直式外框以 `URLSearchParams.set` 指定的版本字串仍為 victory；補正為 fast，與 play.html／模組版本一致。
