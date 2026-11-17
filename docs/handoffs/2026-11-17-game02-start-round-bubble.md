# 開始按鈕整合輪迴提示

- 移除主選單底部獨立滿寬 round-badge 與第七列配置。
- js/main.js 將既有三語輪迴文字掛在 ov-btn 的 data-round-label；css/menu-layout.css 以小黑色對話框顯示在開始／繼續／重玩按鈕右上角，隨按鈕移動，不攔截點擊。
- rounds 0 不顯示；1–3 顯示尋找勇氣次數；>3 整個主按鈕使用彩色漸層、對話框仍為黑底並顯示「你已經天下無敵了」。沿用原本天下無敵門檻，不更動玩法或進度。
- 支援減少動態效果偏好，停用彩色流動。CSS 僅在主選單套用，選關與結算不顯示氣泡／彩色按鈕。
- play.html 移除舊 badge 並更新主程式、選單 CSS 快取版本。
- 未新增美術素材，使用 CSS 製作。檔案：02_brave_guy/js/main.js、css/menu-layout.css、play.html。
- 驗證：Playwright 檢查 0／2／4 輪，390×844 直式、844×390 橫式截圖，按鈕命中、三語更新及 pageerror。無未完成項目。
- 發布：本次提交推送後由 GitHub Pages 發布，部署結果於聊天回報。
