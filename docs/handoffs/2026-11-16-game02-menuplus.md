# 大 Logo、清脆按鍵聲與清除進度

## 完成內容
- menu-layout.css / play.html：既有 Logo 放大 1.7 倍，跨中間斜線；綠金光暈與透明輪廓掃光，日文沿用日文 Logo。減少動態偏好停用動畫；不新增圖片。
- tools/make_ui_crisp.py 原創合成三款 UI 聲：清脆點按、上揚確認、短促返回。source/sfx/sfx_ui_*_crisp_v3.wav 為 44.1kHz、16-bit mono PCM，115/205/145ms，峰值 -4dBFS，三檔合計 41,144 bytes。records/brave_guy_record52_ui_crisp_v3.json 記錄規格。manifest 僅換 ui/ui_tap/ui_confirm/ui_back，保留 Claude 假森專屬音樂及其餘音效。audio.js 同步調整缺檔後備按鍵聲。
- js/progress-reset.js：主選單難度下方新增「清除所有進度」。原生 dialog 提供中英日文說明、取消與確定；預設焦點在取消，支援 Escape。只刪除 braveguy.save.* 與 braveguy.records.*，包含通關／解鎖／看過劇情／單關及總排行。保留語言、聲音、畫質及其他遊戲資料。刪除失敗嘗試還原快照並顯示錯誤；成功重新載入開場、移除 unlock 參數。
- index/play/main/audio/manifest 的版本鍵更新為 20261116menuplus，保持手機單畫面配置。

## 驗證
- 18 項單元測試通過，含清除範圍、保留設定、刪除失敗還原。
- 320×568、390×694、430×740、589×985 × 中英日文共 12 組：所有按鈕及語言列可見、無溢出、選關可點；已目視 320 英文與 390 中文。
- tools/tests/game02-menuplus.cjs：取消不刪資料；確定後重新開場、清空進度與排行榜，其他資料和語言保留；三音檔瀏覽器解碼、時長、峰值、減少動畫檢查通過，0 pageerror。

## 發布與未完成項目
本次需求實作與本機驗證完成，隨本提交建立 PR 並合併部署；最終部署狀態以 GitHub Actions 為準。不包含未追溯的舊美術草稿，未覆寫 Claude 音樂。
