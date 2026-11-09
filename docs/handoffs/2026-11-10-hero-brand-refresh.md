# 主視覺 Icon、Banner 與 OPTION 字藝（2026-11-10）

## 使用者需求與成果

使用者指定以衝鋒巴哥主視覺搭配 MEMORY CRASH Logo 做遊戲 icon，要求 OPTION 文字也經過設計，首頁 Banner 改採同組主視覺。

- `01_memory_crash/assets/source/pic/branding/icon_02.png`：1254×1254 方形合成主視覺，衝鋒角色完整入鏡、十二色寶石與 Logo。依原 KV 和 Logo 參考重新構圖生成，不是來源素材逐像素拼貼。
- `01_memory_crash/assets/source/pic/titles/option_hero.png`：1774×887 透明金色立體字，深藍厚邊、青色光線與水晶點綴。
- `assets/source/pic/banner/banner_02.png`：2172×724 橫幅，左側留給六語系 HTML 文案，右側是衝鋒角色、寶石與 Logo。
- 三張來源保留生成原始 PNG 與原生尺寸；對應 `runtime` 的 WebP 使用 lossless + exact，RGBA 逐像素一致。路徑、尺寸與像素 SHA256 見 `assets/source/BRAND_REFRESH_DELIVERY.json`，路徑相對 repo 根目錄。

## 接入

- `assets/js/hub.js` 遊戲收藏 icon 改引用 `icon_02.webp`。
- 首頁與遊戲頁 favicon 改為 `icon_02.png`，舊 icon 保留；favicon 很小時完整字樣可能無法辨讀，未另繪簡化版。
- `index.html` Banner 使用 picture；桌面顯示橫幅，760px 以下使用同系列方形圖置於文案上方。圖片採 contain，不把角色裁去；保留原六語系文案、入口與最愛功能。
- `01_memory_crash/index.html` OPTION 頁標題改為專用字藝，alt 保留 OPTION；CSS 使用 contain。一般設定按鈕文字保留原可操作文字。
- 本批沒有修改主角全身修正分支的檔案內容；PR #2 的全身角色變更仍由該 PR 獨立交付。

## 驗證

- 3/3 PNG／WebP RGBA 逐像素比對通過。
- `node tools/check_hub.cjs`：六語系×四種寬度，無水平溢出；語言／最愛記憶、分類、空狀態、停用／損壞儲存、減少動態與遊戲新分頁入口通過。
- Chromium 手機 OPTION 頁字藝解碼、標題替代文字、選項入口通過；Banner 手機與桌面 picture 選圖正確。
- 截圖：`assets/preview/hero_brand_desktop.png`、`hero_brand_mobile.png`；遊戲 `assets/preview/option_hero_mobile.png`。既有 hub 三張驗證截圖同步更新。
- 未重跑完整遊戲／音訊回歸，手機實機未驗收。

## 交付狀態

素材、程式與報告一併提交於 `codex/hero-game-icon`。待 PR 合併；未宣稱已部署，未透過外部訊息通知 Claude。
