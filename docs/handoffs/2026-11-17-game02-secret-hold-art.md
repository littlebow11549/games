# 秘技長按與表情包對話卡

- 依最新要求移除三連點：在可操作的戰鬥畫面同一位置按住 5000ms 才開啟確認；已開啟時同樣長按直接關閉。
- 放開、移動超過 16px、第二指／操作按鈕、pointercancel、視窗失焦或頁面隱藏取消計時。保留按鈕／搖桿排除、暫停確認與本次工作階段設定。
- 修正失焦監聽：只監聽 window blur，不捕捉子元素焦點變動。
- 改用既有 sheet/unified/sheet_angel.webp 的 SMIRK 表情，CSS 視窗取原圖 (810,538,186,172) 區域；未重繪或修改來源圖片。
- 粉紅漫畫外框與陰影、近照表情、奶油色對話氣泡、金色主按鈕、柔焦背景；保留三語與鍵盤焦點。
- 檔案：js/secret-toggle.js、css/secret-toggle.css、js/main.js、play.html、tools/tests/game02-secret-toggle.cjs。
- 驗證：三連點／短按不開啟、5秒確認／取消／開啟／隱藏、控制鍵排除、Escape恢復；觸控長按、直橫式截圖。測試等待略長於5秒以容許 headless GPU 排程，產品門檻仍為5000ms。
- 無新增素材，無未完成項目；推送後 Pages 發布，結果於聊天確認。
