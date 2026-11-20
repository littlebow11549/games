# 使用者打擊與 KO 音效

- 原封不動保存上傳 brave_guy_sfx72_import_hit.wav（130044 bytes，PCM16 stereo 44100Hz，0.737s）與 ko.wav（67716 bytes，PCM16 stereo 11025Hz，1.443s），路徑 assets/source/sfx/。
- manifest hit／crit 改用 brave_guy_sfx72_import_hit.wav；一般與重擊共用100ms節流。能量光束持續命中仍用原能量聲。
- boss_ko 接一般 Boss 死亡事件與董事長最終走近收尾；取代一般Boss死亡原爆炸聲，型態切換不播，小怪不播。
- KO 等待解碼後播放且無合成替代；打擊未解碼時保持安靜（預載完成即用原音），不回退舊合成聲。
- 修改 assets/manifest.json、assets/ASSETS.md、js/audio.js、js/main.js、play.html；快取版本同步。
- 瀏覽器驗證兩 WAV 成功解碼與時長，Boss 死亡一次KO、對已死Boss重擊不重播；原檔逐位元核對。不宣稱已人工聽感審核。
- 無未完成項目；推送 Pages 後聊天確認線上檔案。
