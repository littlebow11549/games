# 客串爆氣圖示去字

- 基於已上線等同 `6b9c0f3` 的爆氣衝擊波功能。本次只改小天使、惡夢超人的爆氣寶石：圖示外不顯示「爆氣／Burst／覚醒」字樣，也不補出桌面空白鍵鍵帽或滑鼠停留提示。原有寶石、標誌、配色、發光、尺寸與位置不變。
- 按鈕保留中英日 `aria-label`，另保留空白鍵與觸控操作，並提供 `aria-keyshortcuts="Space"`。主角變身按鈕與原提示、其他按鍵標籤、招式名稱、成功爆氣提示、量表倒數、爆氣效果與玩法均不變。
- `playable-roster.css`、主模組及 iframe 入口快取更新為 `20261120bursticon`。不新增或重出素材。

## 驗證

- `node tools/tests/game02-burst-icon-only.cjs`：確認去字選擇器僅涵蓋兩位客串的爆氣按鈕；執行正式 HUD 分支驗證三語無障礙名稱、移除殘留提示、切回主角時恢復提示及靜止 HUD 無屬性改寫；執行正式輸入監聽驗證空白鍵和觸控仍發出同一動作。
- `node tools/tests/game02-burst-wave.cjs`、`node tools/tests/game02-lock-glow.cjs`、語法檢查與 `git diff --check` 通過。
- 提供使用正式圖集裁切的前後對照，非實機畫面。Chromium 在目前工作環境受啟動權限限制；未於實機瀏覽器驗證、未部署，視覺驗收待使用者。
