# 巴哥連續圖檔、動態套用與全素材核對

日期：2026-11-09（台北）。依使用者最新要求：巴哥做呼吸、高興、難過、慶祝的連續圖檔並套用，再逐項核對所有素材。

## 本次完成

### 太空巴哥

來源目錄 `01_memory_crash/assets/source/pic/character/`：

- `char_01.png`：六姿態透明圖集，3 欄×2 列；待機、歡呼、難過、思考、招手、指引。
- `char_anim_idle.png`：呼吸與眨眼，8 格，3fps，約 2.67 秒循環。
- `char_anim_happy.png`：微笑、抬手比讚，8 格，8fps，1 秒循環。
- `char_anim_sad.png`：低頭、垂眉、嘆氣與回復，8 格，5fps，1.6 秒循環。
- `char_anim_celebrate.png`：舉手與小跳躍，8 格，8fps，1 秒循環。
- 四張動畫圖集皆 1774×887 RGBA，每張 4 欄×2 列，總共 32 格。單格 443.5×443.5；播放器直接用小數來源座標，不硬切整數導致誤差。
- `character_animations.json`：格數、來源尺寸、播放速率與時長。
- `COMPRESSION.json`：角色與選單新 PNG 的無損像素驗證；來源尺寸、容量與 SHA-256。

使用者後續已明確要求角色動態並套用，**取代先前「交其他 AI 做角色動態」的分工**。動態已完成本次四種狀態，沒有將它們列為等待其他 AI。

### 實際套用

- 新增 `01_memory_crash/js/mascot.js`，用 Canvas 按原始影格連續播放，保持來源比例，不以單張 CSS 縮放冒充動態。
- 主選單：替換角色 SVG，播放呼吸／眨眼。
- 遊戲：棋盤下方加入小角色與狀態文字並排，避免蓋住可點的寶石。
- 點對（尚未過關）：高興 1 秒；最後一步完成時由慶祝取代高興。
- PERFECT：慶祝 1.25 秒，下一關回待機。
- MISS：難過約 1.1 秒，重播序列回待機。
- GAME OVER：結果畫面播放難過循環。
- 分頁不可見時暫停動畫；離開遊戲停止；prefers-reduced-motion 僅顯示各狀態第 0 格，不持續播放。
- 來源未載入時保留原 SVG fallback。idle 載入後暖載其餘狀態，避免第一次反應看不到圖。
- 短螢幕縮小角色及棋盤，保留選單 EXIT 與結算 HOME 可操作。

### 主選單字藝

`01_memory_crash/assets/source/pic/titles/titles_02.png`：ARCADE、CONTINUE、EXIT、MENU、PAUSE、RESUME，3×2 透明圖集。`titles_02.json` 提供各詞 alpha 邊界。ARCADE／CONTINUE／EXIT 已用 CSS 裁圖方式接到主選單按鈕，保持來源比例及可存取名稱；禁用的 CONTINUE 會灰化。其餘詞已交付備用，沒有為了字圖額外新增暫停遊戲功能。

### 穿梭影片

`01_memory_crash/assets/source/video/vid_warp.webm`：原創程序生成，1080×1920、24fps、4 秒、96 格、無音訊、不透明、VP9 lossless RGB，約 21.1 MB。`vid_warp.json` 為驗證紀錄；重製程式 `tools/make_warp.py`（相對遊戲資料夾）。

驗證來源 t=0 與 t=4 秒的 RGB bytes 完全相同；編碼後第一格解碼 RGB 與來源完全一致，瀏覽器能實際播放。影片是來源素材交付，**尚未取代目前標題頁 CSS 穿梭效果**；檔案較大，不預載到遊戲，後續要套用請依裝置效能評估。不宣稱為外部影片模型生成。

### 單張字型

`pic/font/font_01.png`、字元座標與驗證已交付，詳見同日 font-atlas 報告。它是拉丁字型美術圖集，不是 TTF/WOFF；基線、字距與一般文字 renderer 仍待接手處理，不可把它當成已完成多語文字替換。

## 全素材再次核對

- 自動核對：`01_memory_crash/assets/ASSET_AUDIT.json`，重跑 `python 01_memory_crash/tools/audit_assets.py`；加 `--full` 會驗證全部來源 PNG（含首頁）與完整解碼媒體。
- 本次核對清單中的**必要來源檔案均存在**。這指來源交付，不代表所有圖片達指定像素，也不代表全部已套用。
- **尚未製作的選做項**：`pic/branding/blade_01.png`、`pic/fx/fx_01.png`、`music/bgm_02.mp3`、`video/vid_01.webm`。
- HOW TO 圖已交付並由 Claude 切圖接入，不再誤列為缺檔。
- 原表許多項目未勾選但其實檔案已存在，這次修正勾選及進度文字。
- 多張圖片原生尺寸與規格表不同，包含部分較小、部分較大或比例不同；audit 記錄 exact_target_dimensions，**未補造像素或以插值宣稱增加細節**。角色六姿態與 font 為 1254×1254；新選單為 1774×887。
- 所有新 PNG 僅無損壓縮，尺寸、透明通道及 RGBA 逐像素一致。

因此目前不能說「全部素材都已完全達規格並套用」：仍有上述四項選做素材，以及字型排版、影片接入與部分原生解析度差異。

## 驗證與工具

- `tools/check_character.cjs`（repo 根目錄）：實際 START→MENU→ARCADE→遊戲，點對顯示 happy、過關 celebrate、失誤與結束 sad；確認呼吸影格會變，四張圖正常載入，減少動態時固定第 0 格，390×844／375×667／320×568 的選單、棋盤與結算不裁掉操作。
- 動態 START 本來就持續變換，測試以實際座標滑鼠點擊；測試亂數為循序 0–11，避免遊戲的禁止連續重複機制陷入固定亂數死循環。
- WebM 已通過瀏覽器真實播放與 RGB 校驗。
- `tools/prepare_character_assets.py`（遊戲內）：六張新 PNG 無損驗證與 32 格非空檢查。
- `node --check` 與 `git diff --check`。
- 預覽在 `01_memory_crash/assets/preview/character_idle.png`、`character_happy.png`、`character_celebrate.png`、`character_sad.png`、`warp_video.png`。

## 維護

角色控制器只負責視覺，API 為 window.MemoryCrashMascot.show(screen)、play(state,duration)、stop()；不要讓它改關卡、分數或生命值。更換圖集時需保持 4×2 八格或同步控制器與 JSON。

後續需保持其他協作者最新變更，報告與素材及程式一起提交，更新 docs/HANDOFF.md。部署以 Pages build 與實際網站為準。

## 同步協作者的並行修改
提交前已同步 bd59ab1 的分數、連擊、粒子與震動效果，合併保留新角色樣式與原效果，重新執行遊玩／短螢幕測試；未覆蓋協作者的新增分數 UI。

## 第二次並行同步與最終檢查
已同步 fb46c5a 的英文遊戲介面及放大操作說明。角色列維持至少 18px 說明，不以角色加入縮回 12–13px；新角色無障礙名稱使用英文配合遊戲介面。全部來源 PNG 經 verify、音訊／影片經 ffmpeg 完整解碼，數量見 ASSET_AUDIT.json 的 full_source_validation。短螢幕的結算字藝、角色、分數與操作面板亦已縮排，保留協作者分數 UI。

最終全來源檢查：遊戲 53 張 PNG、首頁 1 張 PNG，合計 54 張均可完整驗證；6 個 MP3 與 1 個 WebM 完整解碼通過，沒有毀損檔案。

已進一步合併 7fa7254 的回合倒數與 HUD 底襯，保留 stopTimer 行為；超時亦觸發難過。短螢幕棋盤同步預留倒數條空間。
