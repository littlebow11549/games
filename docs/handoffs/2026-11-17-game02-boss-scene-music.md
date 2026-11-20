# Boss 過場原曲與變身戰場配樂

- 使用者最終規則：Boss 過場使用原本各 Boss 配樂；返回戰場且已變身時改回勇氣超人音樂。
- main.js 限制 bgm_brave 覆蓋只在 playing；對話開始／結束重新套用場面配樂。抽出 bossBgm 保留既有專屬曲、黑影關卡曲與通用曲選擇。
- 正常推進與秘技跳 Boss 共用 startBossIntro；登場對話、登場動畫、終章覺醒及勝利過場使用 Boss 原曲。返回戰場時重新依形態選曲。
- 冠老闆沿用 assets/source/music/brave_guy_bgm06_boss_guan.ogg，未替換或重新生成任何音樂素材。
- 檔案：02_brave_guy/js/main.js、02_brave_guy/play.html（快取版本）、tools/tests/game02-boss-music.cjs。
- 驗證：Playwright 28 組（14 Boss × 一般／天下無敵）過場原曲與回戰場形態分流、關卡開場對話、冠老闆專屬曲、無 pageerror。此測試替代動畫載入器並執行真實回戰場 callback，驗證選曲路由，不宣稱真人試聽或完整通關。
- 無新素材、無待辦；提交推送後由 Pages 發布，發布結果於聊天確認。
