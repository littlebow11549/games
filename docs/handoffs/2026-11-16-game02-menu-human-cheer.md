# 2026-11-16 主選單間距與使用者歡呼錄音

## 完成
- 使用者後續要求清除進度只留選關：主選單／結算隱藏ov-reset，直式主選單移除該列，釋出48px給主視覺；選關保留原確認流程。
- css/menu-layout.css：直式主選單grid間距由6px/12px增至16px/20px，保留立體陰影與hover空間；縮減主視覺可用高度並保留最小24px首列，低高度可捲動。
- 使用者先要求移除舊歡呼，隨後提供y2004.wav指定真人錄音。最終以使用者檔案取代勝利結算舊歡呼，沒有接回win分數音或額外applause/crowd_cheer疊音；勝利背景音樂保留。
- assets/source/sfx/y2004.wav為原封不動上傳檔：PCM16、44100Hz、雙聲道、20.408秒、3600044 bytes。manifest新鍵victory_human_cheer；未生成／合成人聲、未改音色或裁切。
- audio.js：此鍵等待解碼後才播放，失敗保持安靜，禁止合成fallback；離開結算停止播放／取消未完成載入的播放請求。其他情境音效不變。
- 未使用暫擬公共領域原錄音剪輯，沒有交付該衍生檔。使用者提供檔案為本次唯一新增音檔。
- play.html、main.js音訊與manifest快取版本更新。

## 驗證
- audio-sfx.test.mjs 11項通過，新增錄音等待解碼、禁止合成fallback、離開取消測試。
- game02-combat-rewards.cjs：使用者WAV解碼為>20秒並啟動buffer voice，結算只呼叫勝利音樂與指定錄音，連擊／鎖定回歸通過。
- 直式390×844、320×568、473×838檢查按鈕配置；無增加對應純CSS單元測試。
- 原檔逐位元cmp核對。未宣稱已做主觀聽感審核，聲音採使用者提供版本。

## 發布與路徑
/workspace/games/02_brave_guy/，程式、原WAV、測試及交接一併推送既有預設分支，檢查GitHub Pages發布。
