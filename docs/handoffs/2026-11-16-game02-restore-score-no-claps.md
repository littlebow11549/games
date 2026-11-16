# 2026-11-16 恢復結算分數音、停用舊掌聲

使用者試聽確認問題是舊掌聲，要求恢復分數結算音。

- main.js：勝利結算恢復win（sfx_result_clean.wav），保留bgm_victory與使用者提供的y2004.wav。
- cinematics.js：最終結局亦不再呼叫舊掌聲／舊歡呼混音，改於4.5秒起播放一次victory_human_cheer，避免原本每半秒呼叫造成重複播放。
- audio.js：移除applause混播入口；舊檔與manifest保留供追溯／試聽，遊戲流程已無舊applause/crowd_cheer播放呼叫。
- play.html與音訊／過場模組快取更新20261116score。無新增或修改音檔。

驗證：音效11項單元測試通過；瀏覽器檢查結算呼叫bgm_victory、win、victory_human_cheer，最終結局連續推進只播放一次新錄音、無舊掌聲／歡呼。連擊與鎖定回歸通過。git diff --check通過。

路徑：/workspace/games/02_brave_guy/js/{main,audio,cinematics}.js、play.html、tools/tests/game02-combat-rewards.cjs、02_brave_guy/tools/audio-sfx.test.mjs。與交接一併推送並檢查Pages部署。
