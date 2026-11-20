# 2026-11-15 — 全 Boss 統一出場過場、完整音效與日文 Logo

## 本輪範圍與防重工
使用者先要求補音效、重設計佛賴弟過場、以現行 Logo 製作日文變體，後明確追加「其他 Boss 也要做過場」與「出場形式統一」。依 `docs/reports/2026-11-15-sfx-folaidi-logo-audit.md` 對照現有來源後製作；未重製選關、暫停、結算、變身、結局或一般場景。舊的 14 張未提交待比對稿及 ART_BATCH_QUEUE 完整保留，未納入此交付。

## 實際完成
- 13 個 Boss、39 個專用情節鏡頭。全部同一套 **8.2 秒**格式：0–2.4 秒環境鋪陳、2.4–4.2 秒特寫、4.2–8.2 秒登場。統一畫面區域、名牌與台詞位置、字型、切鏡、推近／退鏡、跳過操作。雙 Boss 順序播放兩段同規格過場。
- `js/boss-storyboards.js` 管理時間、圖源、粒子及音效節點；`js/cinematics.js` 串接既有遭遇流程。以三鏡漫畫動態演出、鏡頭運動、角色情境與粒子特效呈現，**不是逐格角色骨架動畫或配音影片**。降低動態設定保留分鏡，關閉鏡頭晃動、粒子及文字彈出。
- 每位有各自情境：佛賴弟走廊／帽簷／逼近；錢大姐校門／開扇／金幣旋風；藍教頭球場／哨子／震場；惡夢超人鏡廊／紅眼／破鏡；悶幹譙庭院／握爪／砸地；地獄超人火圈／燃拳／火柱；加班鬼王深夜辦公室／打卡／紙張風暴；新雞假笑／背後手機／訊息羽毛；八卦蛇茶水間／耳語／流言旋渦；藍經理會議室／印章／蓋章震波；幹譙龍屋頂／吸氣／怒吼；冠老闆辦公室／敲桌／王冠壓迫；夢魘超人黑鏡空間／冷眼／現實碎裂。
- 進關預載當關過場；未載好時最多等 5 秒，錯誤時沿用已有設定圖回退，不使戰鬥卡住。跳過、取消恢復音樂音量，不延遲觸發舊音效。
- 日文 `pic/branding/brave_guy_branding10_logo_ja.png` 直接參照 `brave_guy_branding09_logo_01_review_v1.png`，保留綠環、BRAVEGUY 金紅字及紅圍巾，上排變成「ブレイブガイ」。日文選單現在顯示此原圖，不再使用系統字藝代替 Logo。
- 音效需求表 54 個名稱全部補齊，總共 63 個原創分層 DSP 音效（含三組拳／命中／倒地變體、技能、充能、氣功循環、罪惡、連擊、UI、敵人與過場）。程式實際接到對應事件；無第三方音效採樣、錄音或人聲。BGM 沒有重製。
- 音訊有預載、同類事件節流、最多 16 個單發音、動態壓縮、靜音與暫停停止持續音、非同步載入取消保護、切換背景音量。氣功循環另有 OGG 及 MP3 回退；音檔失敗保留既有合成聲回退。

## 檔案與規格
- `assets/source/pic/cinematics/folaidi_{corridor,eyes,reveal}.png`：3 張原生 1536×1024。
- `assets/source/pic/cinematics/boss_*_storyboard.png`：其餘 12 組，各為原生 1024×1536，三個等高橫向鏡頭。以 Canvas 選取圖集區域，不裁切、放大或重壓來源檔。
- `assets/source/pic/branding/brave_guy_branding10_logo_ja.png`：原生 1536×1024 RGBA，保留透明度。
- `assets/records/brave_guy_record10_boss_cinematic_delivery.json`：所有新圖尺寸、分類、SHA256、統一時間規格。
- `assets/source/sfx/`：63 MP3（單聲道 44.1kHz、96kbps）＋1 OGG 循環檔，共 468,300 bytes。
- `_archive/game02/sfx/2026-11-15/`：63 WAV 母帶，16bit／44.1kHz／mono。重製腳本 `tools/make_game02_sfx.py`；交付資訊 `assets/records/brave_guy_record49_sfx_delivery.json`。

## 驗證
- `node --test 02_brave_guy/tools/audio-sfx.test.mjs`：7/7，涵蓋快取疊音、載入失敗、靜音、取消後不得延遲播放、非循環蓄力不重複啟動、三變體及群怪疊音上限。
- `node tools/tests/game02-boss-storyboards.cjs`：13 Boss × 3 鏡 × 中英日 = 117 組；全體相同時長與切點；雙 Boss、取消、跳過、降低動態、320／390／844／1280 寬度。64 個音檔（63 音效＋循環音 MP3 回退）瀏覽器解碼通過、全部 mono，最大解碼振幅 0.629，沒有削波。頁面錯誤與 404 都為 0。圖源預載完成後才推進確定性測試。
- `node tools/tests/game02-cinematics.cjs`：13 Boss、12 個 Boss 關卡實際觸發；結局14人、LilinS六項Staff／8秒、暫停等寬、連擊、爆表、換目標、三語719鍵及四尺寸通過。
- `node tools/tests/game02-result-titles.cjs`：三語／三結算／三尺寸27組標題可見、置中、圖片解碼通過，0 JS錯誤。
- 視覺檢查：逐一檢查12圖集、佛賴弟3圖、日文 Logo；實際手機／橫式畫面快照在 `assets/preview/boss-storyboards/`。橫式鏡頭改以完整畫面容納角色，避免近景頭部被裁掉；圖檔保留原生位元，無插值放大。

## 發布與後續
本報告與成果一起提交、開 PR 合併並驗證 Pages；完成時以 PR 與 Pages 的實際狀態為準。本輪需求已接入，沒有留下「等 Claude 接線」項目；過場型態為三鏡動態漫畫，沒有宣稱完成逐格動畫。未提交待比對舊素材不屬此輪。
