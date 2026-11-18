# 受擊頭像與紅光

- 實際扣血時頭像短暫顯示既有表情圖集：勇氣超人 HIT、學生 TERRIFIED、上班族 RECOGNITION；700ms 後恢復，重複命中延長，換關清理。
- CSS 原圖窗口沿用 sheet_braveguy/student/worker.webp，沒有新增或修改圖片；保留 HUD 原框。
- 原本較弱橘色邊線改為紅色邊緣漸層，0.5秒淡出，中央透明、HUD維持上層且不攔截點擊。減少動態模式使用低強度0.7秒淡出。
- 修改 js/main.js、play.html；新增 css/hurt-feedback.css、tools/tests/game02-hurt-feedback.cjs。
- 測試：實際扣血觸發、頭像恢復、無敵不觸發、學生／超人畫面截圖。測試暫停場景時手動同步頭像形態class，以免停更HUD造成錯誤快照。
- 無未完成項目；推送後由 Pages 發布，聊天確認線上結果。
