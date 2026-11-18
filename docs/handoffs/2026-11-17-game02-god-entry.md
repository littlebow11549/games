# 天下無敵各關勇氣超人進場

- resetHero 在 godMode（save.rounds > 3）直接使用 brave 形態、courage 模式、滿勇氣與延長額度。模型與背景音樂沿用 setForm 同步。
- 共用進場初始化涵蓋選關、下一關與重打；包含序章及 3-0／3-1 封印區域。未達門檻仍使用各關原本基礎形態。
- 不觸發變身過場、震波或免費進場傷害，不更動死亡與最終劇情流程。
- 檔案：02_brave_guy/js/main.js、play.html（主程式版本更新）、tools/tests/game02-god-entry.cjs。
- 測試：rounds 0、3、4 各遍歷全部關卡；驗證形態、模型可見、勇氣與變身能力，另檢查重打。全部通過、無 pageerror。非完整通關測試。
- 無新素材，無未完成項目；推送後 Pages 發布，聊天回報線上確認。
