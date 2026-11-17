# 全 Boss 勝利 KO

- 原本只接死亡事件，一鍵過關直接走 clearStage，會漏播。
- 所有 Boss 關卡的 clearStage 在進入勝利過場前補播 KO；死亡事件與最終收尾共用 playBossKO。
- 每場戰鬥 bossKoPlayed 防重複，startStage 重置，重打仍會再播。
- 檔案 js/main.js、play.html、tools/tests/game02-all-boss-ko.cjs；無新素材。
- 測試遍歷所有 Boss 關卡直接勝利，重複呼叫不重播。這是勝利路徑測試，非全關卡完整通關。
- 推送後由 Pages 發布，聊天回報線上核對結果；無未完成項目。
