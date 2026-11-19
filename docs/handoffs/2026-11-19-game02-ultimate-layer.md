# 大招名稱置於小對話框上方

- 原因：藝術字 popup 位於 z-index:0 的 #world-ui stacking context，無法跨過兄弟 #angel-bubble（z-index:1）；同層主角 taunt 也可能覆蓋。
- play.html 新增 HUD 內 #skill-announcements；ui-layers.css 設獨立公告層 z-index:7、pointer-events:none。主角／小天使／惡夢與 Boss 的 shout 藝術字移入此層，普通傷害數字及小對話仍留原層。
- main.js popup 保留原本藝術字、位置與 animationend 清理；clearWorld 同時清除公告，避免換關／返回選單殘留。仍隨 HUD 隱藏，不超越阻擋式劇情、選單或暫停畫面。
- 未新增美術；沿用單層爆炸框。入口 main.js 與 ui-layers.css 快取版本 20261119ultlayer。
- 驗證：Playwright 390×844 實際啟動三角色大招，確認每次只一張藝術字，公告層高於一般／救援對話，返回選單清空。刻意重疊截圖 /tmp/ult-layer-{brave,angel,nightmare}.png 視檢，惡夢招式名清楚覆蓋兩類對話。node --check、git diff --check 通過。測試腳本僅 /tmp/check-ult-layer.cjs，沒有新增預覽頁或 repo 截圖。
- 發布：本次提交推送 Pages 分支，正式部署結果於回覆確認。
