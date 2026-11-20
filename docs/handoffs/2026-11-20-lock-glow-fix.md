# 鎖定 T 圖示方形光暈修正

- 基線：b71bb8a63763f3f9146d03112ff93e82742d5635；使用者截圖指出綠色鎖定圖示外有硬邊棕色方塊。
- 根因：classic2d 保留圖集透明四角而採 `border-radius:0`，啟用態卻以 `box-shadow` 沿矩形窗口繪製陰影；不是需要重畫角色技能母圖。
- `02_brave_guy/css/character-art.css`：啟用態保留 brightness(1.3)，移除矩形 box-shadow，改為依透明輪廓的 drop-shadow。原圖、格位、四方向標記、T 鍵標籤、點擊範圍與存檔均不改。
- 聚焦回歸：`node tools/tests/game02-lock-glow.cjs` 通過；三角色鎖定格位四角 alpha 均為 0。`git diff --check` 通過。
- 瀏覽器查核：本工作階段 Chromium 啟動遭環境 socket Operation not permitted 阻擋，升權重試仍失敗；不可宣稱此處已完成視覺驗收。整合階段需另補手機／桌面、三角色、開關及按下態截圖。
- 沒有新增美術、沒有重新編碼、沒有建立預覽 HTML 或 repo 截圖資料夾。尚未推送／部署；使用者尚未審閱修正後畫面。
