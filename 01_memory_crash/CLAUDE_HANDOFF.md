# Claude 素材交接（2026-11-09）

已依最新 assets/ASSETS.md 的媒體分類與編號放檔。專案根目錄為 /workspace/games/01_memory_crash。

## 已完成素材（以下相對 assets/source/）

- pic/background/bg_01.png：主背景
- pic/branding/logo_01.png：新版 Logo
- pic/branding/icon_01.png：App Icon
- pic/ui/ui_01.png：UI 圖集，3 欄 × 3 列
- pic/gems/gems_01.png：12 寶石，4 欄 × 3 列
- pic/numbers/numbers_01.png：數字，6 欄 × 2 列；0–5 / 6–9、LV、冒號
- music/bgm_01.mp3：約 69.85 秒、110 BPM 原創程式合成配樂
- sfx/sfx_01.mp3：點擊；02：正確；03：失誤；04：過關；05：結束
- pic/branding/logo_02.png、pic/gems/gems_02.png：較早版本備份，不是預設使用版本

## 已接入

css/style.css 與 js/game.js 已接入 gems_01 圖集，包含微浮動、淡光暈、序列發光放大與正確點擊彈跳，支援 prefers-reduced-motion。遊戲棋盤仍為 3 欄 × 4 列，請勿與圖集排列混淆。

## 請接續

1. 接背景、Logo、favicon；依實際邊界切 UI 與數字，再替換按鈕、愛心、面板等。
2. 將 MP3 接入遊戲，保留 SFX/MUSIC 獨立開關及記憶設定、互動後播放與返回首頁的生命週期。保留寶石音高差異。新音訊目前尚未接入。
3. 實際聽測音色、混音、MP3 循環接縫及手機播放。音訊為程式合成，非外部音樂模型生成或錄音。重製腳本 tools/make_audio.py 已同步新分類路徑。
4. 圖片為生成原始尺寸，尚未符合要求的精確像素；詳見 assets/DELIVERY_V2.md。UI 與數字不宜假定完全等格。
5. blade、FX、高強度 BGM 與影片尚未製作。

## 驗證

JS 語法與 git diff --check 通過。先前以系統 Chromium 390×844 檢查 12 寶石載入、浮動與發光樣式、減少動態效果，無 pageerror；非完整遊玩驗收。截圖在 assets/preview/08_animated_gems.png。六個 MP3 皆通過 ffmpeg 解碼，尚未主觀聽測。

啟動：python -m http.server 8000 --directory /workspace/games
開啟：http://localhost:8000/01_memory_crash/

## 使用者最新圖片要求
圖片須大而清晰，壓縮不得失真。現有八張 PNG 已無損最佳化，原生尺寸、透明度與逐像素內容保持不變；詳見 assets/LOSSLESS_COMPRESSION.json。後續新製圖片以 ASSETS.md 原訂尺寸為目標，不以插值放大代替高解析度來源。部分現有來源仍低於規格，並未藉本次壓縮補足解析度。

## 遊戲庫首頁更新
根目錄 index.html 已改為響應式深藍／金色首頁，沿用 source/pic 的背景、Logo、寶石與圖示，不新增美術原圖。首頁有精選遊戲主視覺、浮動寶石、遊戲收藏與新增遊戲預留區。GAMES 陣列保留為卡片資料入口；新增精選遊戲時也需更新 hero 與導覽連結。
已驗證 320、390、1440 寬度無橫向溢出，圖片成功載入、PLAY 連至遊戲、無 pageerror 或失敗資源，支援減少動態效果。預覽為 assets/preview/hub_desktop.png、hub_mobile.png。

## 最新全專案交接入口
首頁已再次重做為大 Banner，新增六語系、桌機四欄、分類與最愛；最新報告請讀 repo 根目錄 docs/HANDOFF.md。本檔上方首頁描述為歷史版本。後續每次製作皆須更新交接報告，規則見根目錄 AGENTS.md／CLAUDE.md。
