# 廢棄視覺嚴格清理

刪除213檔，156,445,927 bytes（約149.2 MiB），不是搬到備選資料夾。

- 63張舊SVG：六張skill_01–06、八張title_*、三張background、舊UI／數字／特效／功能圖。功能圖CSS殘留的是本來就不存在的runtime SVG，移除殘留背景，正式圖集依舊覆蓋。
- 42個已歸檔淘汰圖、設定集／品牌舊稿、舊九招圖、交付檔與驗收頁。
- 84個記憶水晶驗收截圖／GIF／頁面／QA檔。
- 23張設定集舊Logo／中間稿。16張正式unified的角色保留區域刪前逐像素比對一致；正式原圖完全未改動。unify_sheet_headers.py改為驗證正式母檔，解除舊稿依賴。
- 刪除make_simple_art.py舊佔位產生器；測試截圖輸出改/tmp避免重新污染repo。

## 保留依據
六張現役ult_*.svg為動態語系引用，使用者明確保留。正式PNG及runtime、圖集、concept三視圖／reference、Memory Crash favicon保留。音訊備選包含使用者要求日後挑選的匯入聲音，非本次視覺半成品。manifest、runtime-images.json及對應PNG母檔完整檢查通過，現役JS/CSS/HTML沒有已刪路徑引用。

## 驗證／發布
主畫面雙角色解鎖到實際進關回歸通過；16張設定集SHA與Logo區域一致驗證通過。git diff --check。逐檔原因、bytes、SHA256詳見../reports/2026-11-20-retired-assets-removed.json。與清理一併提交，Pages完成後在對話確認。

## 接續
使用者追加補六款職場設定集：加班鬼／王、假忙森／主管、錢經理、藍經理；另立交付紀錄。無刪除現役角色或大招字。
