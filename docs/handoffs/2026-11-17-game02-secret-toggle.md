# 三連點秘技開關

- 一鍵過關／跳到魔王／第二形態按鈕預設隱藏，操作處也檢查秘技開關。
- 戰鬥畫面同一區域快速點三下（850ms 內、相距 48px 內、單次不超過 300ms、拖曳不超過 16px）打開小天使確認對話框。滑鼠與觸控均支援。
- 確認後顯示原按鈕，再三連點立即隱藏。取消或 Escape 不開啟；確認期間暫停戰鬥並停止循環音效，關閉恢復。
- 排除按鈕、連結、輸入區、方向搖桿；暫停、劇情、過場不接受手勢。狀態僅在記憶體，刷新恢復預設，不寫入存檔。
- 原生 dialog 在瀏覽器 top layer；開啟時隱藏戰鬥裝飾。小天使沿用 assets/runtime/lossless/pic/concept/angel_front.webp，未新增素材。
- 檔案：js/secret-toggle.js、css/secret-toggle.css、js/main.js、play.html。
- 測試：tools/tests/game02-secret-toggle.cjs（本機 8000）：預設隱藏、觸控三點、取消、確認、再次隱藏、操作鍵排除、滑鼠三點、Escape 恢復，無 pageerror；390×844 截圖檢查。
- 無未完成項目；提交推送後由 Pages 發布，結果於聊天確認。
