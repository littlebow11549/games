# Memory Crash 新增美術交接：立體字與教學圖集

日期：2026-11-09（台北）。需求來源：Claude 更新於 60c7845 的 01_memory_crash/assets/ASSETS.md；使用者要求先製作新美術並附交接報告。

## 完成與檔案位置

已製作並放到 repo 的正確分類位置：

1. `01_memory_crash/assets/source/pic/titles/titles_01.png`：十一組主視覺文字，透明 PNG。
2. `01_memory_crash/assets/source/pic/howto/howto_01.png`：四步驟教學圖示，透明 PNG。
3. `01_memory_crash/assets/source/pic/NEW_ART_COMPRESSION.json`：原生尺寸、容量、像素 SHA-256 與無損比對結果。

兩張均沿用深藍、金色、青光與 glossy cartoon 3D。這次為素材交付，尚未切成單件或替換遊戲中的 CSS／SVG，由 Claude 接續接入。

## 立體字讀取順序

3 欄 × 4 列，閱讀順序如下，最後一格透明留空：

| 第一欄 | 第二欄 | 第三欄 |
|---|---|---|
| START | OPTION | READY |
| YOUR TURN | PERFECT | MISS |
| GAMEOVER | MASTER MODE | HOW TO PLAY |
| HOME | AGAIN | 留空 |

MISS 與 GAMEOVER 為紅橙警示字，其餘金色；PERFECT 含星光。已目視確認十一組文字拼字。切圖請依實際 alpha 邊界，保留發光／描邊，避免裁掉 PERFECT 星光。不要將每個片語內的字母拆散。

## 教學圖讀取順序

4 欄 × 1 列：

1. 記住順序：3×3 寶石盤，依 1→2→3 發光。
2. 依序點擊：手指與點線箭頭示範重現順序。
3. 過關：綠色勾與 PERFECT 金字。
4. 小心愛心：三顆紅心，右側一顆碎裂。

教學圖沿用規格要求的簡化 3×3 示意盤；實際遊戲棋盤為 3×4，請保留文字教學說明避免把示意盤誤當實際格數。第三圖帶英文 PERFECT，是遊戲用語。教學文字仍用 HTML 顯示，維持可讀與可翻譯。各圖尺寸及留白不完全等格，切圖時依實際圖示邊界。

## 原生解析度及品質限制

生成工具實際輸出為 titles_01：1254×1254；howto_01：2172×724，與 ASSETS.md 原訂 2048×2048、2048×512 不同。完整保留原生像素與透明度，未以插值放大假裝增加細節。立體字單格約 418×313 像素，適合目前手機遊戲的顯示尺寸；如需大型印刷或放大字藝，需重新生成更高原生解析度，不能把本次成果視為已達 2048 方形規格。

僅使用 PNG 無損壓縮，解碼前後尺寸、模式、每個 RGBA 像素均一致。透明通道已確認存在完全透明像素。詳見 NEW_ART_COMPRESSION.json。

## 下一步與範圍

- Claude 切圖後套入 START／OPTION／狀態橫幅／GAMEOVER／HOME／AGAIN／MASTER MODE／HOW TO PLAY，保留文字的可存取名稱，不只用無 alt 的圖像。
- 動態狀態橫幅仍需由原遊戲事件更新，勿以靜態圖破壞 READY→YOUR TURN→PERFECT/MISS 流程。
- 替換教學圖示，保留可閱讀的步驟文字及手機版排版。
- 既有 UI 圖集已由 Claude 切圖接入，本次未重製或覆蓋那些 UI。
- blade、FX、高強度 BGM、影片仍屬未完成選做項，不能標為已交付。

## 驗證與交接規則

已完成目視檢查內容與拼字、RGBA 透明度與逐像素無損校驗。本次未接入遊戲，因此沒有宣稱新圖已通過遊戲內視覺驗收。

所有製作持續遵守 repo 根目錄 AGENTS.md／CLAUDE.md：成果與報告一起提交，更新 docs/HANDOFF.md，供 Claude 讀取。提交與部署狀態以實際 Git 記錄及 Pages build 為準。
