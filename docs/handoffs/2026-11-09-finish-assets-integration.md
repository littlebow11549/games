# 製作清單收尾：四項素材補齊與全部接入

日期：2026-11-09（台北）。使用者要求直接繼續完成前次列出的四項缺件、三項接入與驗收。本報告取代較早報告中「尚缺四項／待接入」的狀態。

## 完成的四項來源素材

| 遊戲內相對路徑 | 成果 |
|---|---|
| assets/source/pic/branding/blade_01.png | 845×1862 透明能量劍刃，已用於標題 |
| assets/source/pic/fx/fx_01.png | 2172×724，三格：金色過關爆閃／寶石碎裂／玻璃裂痕，已接入事件 |
| assets/source/music/bgm_02.mp3 | 約 73.85 秒、130 BPM、原創合成大師模式配樂；保留主旋律識別並增加節奏層次 |
| assets/source/video/vid_01.webm | 1080×1920、24fps、4 秒的 Logo 揭幕開場，無音訊、VP9 lossless RGB 母檔 |

新 PNG 僅無損壓縮，原生尺寸、RGBA 與所有像素不變，紀錄在 assets/source/pic/fx/COMPRESSION.json。未對小圖插值放大。原來的圖片尺寸表已改列真實原生尺寸，並保留最初建議尺寸註記，不再把兩者混為一談。

## 完成的接入

### 字型

- `tools/prepare_bitmap_font.py` 輸出 `assets/source/pic/font/font_01.metrics.json`：68 字元的可見邊界、列基線、字距、descender offset 與常見 kerning。
- `js/presentation.js` 依原始圖集畫 Canvas，保持字形比例；SOUND／MUSIC／ON／OFF 已使用 bitmap 字型，狀態開關的 DOM 沒有被破壞。
- `MemoryCrashPresentation.renderLabel(element,text)` 可供後續短標籤重用。不支援的字元保留文字 fallback。
- 以大寫、小寫、所有符號 proof 目視檢查，圖在 assets/preview/final_font_proof.png。一般長句仍使用可閱讀的系統字體；此來源只有拉丁字母及符號，不冒稱已替換中日韓泰字型，也不是 TTF/WOFF。

### 背景與開場

- 標題與主選單使用 vid_warp 的實際影片循環；進入遊戲／選項暫停，避免干擾記憶與浪費解碼。
- 首次 START 播放 vid_01 開場，有 Skip intro 與 Escape 跳過，自然播放結束後也會進主選單。
- 減少動態效果或省流量模式會跳過影片；播放／載入失敗與超過 6.5 秒等待會回到選單，不把操作鎖死。
- 分頁隱藏時暫停影片；離開遊戲停止影片與特效。保留原 CSS 星流作為載入失敗的 fallback。
- 為行動網路另建立 `assets/runtime/video/` 的 1080×1920 VP9 CRF18 輕量播放版本；這是**有損視訊播放編碼**，不是無損母檔。無損 RGB 原稿完整留在 assets/source/video，沒有覆寫或冒稱播放檔逐像素無損。實際容量見 assets/runtime/MEDIA.json。

### 格子框與特效

- `.gem` 使用既有 slot.png，`.gem.lit` 使用 slot_lit.png，替換原 CSS 格子外觀。
- PERFECT 觸發金色 burst；點錯／超時觸發 shatter；GAME OVER 觸發 crack。圖層 pointer-events:none，不攔截棋盤與按鈕。
- 網頁使用 `assets/runtime/pic/fx_01.webp`，WebP lossless／exact 經 RGBA 逐像素核對，PNG 原稿保留。初始化即預載，降低第一次特效來不及載入的機會。
- 減少動態效果時只短暫顯示靜態特效，不縮放跳動。

### 音樂與音量

- 一般模式使用 bgm_01；Master 或 LV10 以上自動使用 bgm_02，切換時先停止舊音軌，不疊播。
- 同時提供 MP3 與 Ogg；支援 Vorbis 時選 Ogg，便於循環播放，其餘回退 MP3。
- MUSIC 獨立開關與原偏好記憶保留。兩軌平常音量 .38，寶石提示音時短暫 duck 至 .18，260ms 恢復；SFX 音量 .55。
- 第一次 START 在使用者手勢內啟用 WebAudio，避免新增開場後導致寶石音色被瀏覽器鎖住。
- `assets/AUDIO_QA.json` 記錄九個音訊檔的完整解碼、峰值、RMS、迴圈邊界；所有音訊無 clipped samples。實際瀏覽器循環跨尾端、模式切換與靜音亦已測試。

## 順手修正的具體問題

- 離開遊戲畫面時使舊的延遲序列／過關／重試 callback 失效，避免進選項後仍繼續亮寶石、發提示音或重新啟動倒數。
- 鍵盤焦點在按鈕時交給原生 Enter 操作，避免全域 Enter 捷徑與按鈕 click 重複啟動。
- 小螢幕的設定按鈕與 bitmap 標籤縮排；教學彈窗可內部捲動，OK 按鈕可點。

## 驗證

- `node tools/check_final_assets.cjs`：字型控制項、開場播放／跳過／自然結束／減少動態、標題／選單影片生命週期、Master／Arcade 音樂切換、靜音與 loop wrap、格子框、三類特效、320×568 觸控與教學捲動、離開後序列取消。
- `node tools/check_character.cjs`：既有巴哥呼吸／高興／慶祝／難過回歸；390×844、375×667、320×568 的選單、棋盤與結算操作。
- `python 01_memory_crash/tools/audit_assets.py --full`：完整來源檔案存在性、PNG 驗證與媒體完整解碼；必要與選做來源皆無缺檔。
- 原生來源圖與最初建議尺寸不完全相同；ASSETS.md 與 ASSET_AUDIT.json 均保留實際尺寸，不冒稱補足新細節。已依目前遊戲顯示尺寸進行目視與排版驗收。
- JS 語法與 git diff --check。
- 預覽：assets/preview/final_title.png、final_intro.png、final_bitmap_options.png、final_options_small.png、final_perfect_fx.png、final_over_fx.png、final_font_proof.png。

測試為雲端 Chromium 與觸控視窗模擬，**未聲稱做過實體手機／耳機的主觀聽感驗收**。這是驗收環境限制，不是尚缺的製作素材。

## 檔案與重製入口

- `js/presentation.js`：bitmap 字型、影片與特效；遊戲規則仍在 game.js。
- `tools/make_audio.py`：主配樂、大師配樂、MP3／Ogg 與既有五音效，可重製。
- `tools/make_warp.py`：原穿梭場景，已整理為 main guard，匯入不會意外重製影片。
- `tools/make_intro.py`：開場無損母檔。
- `tools/make_runtime_media.py`：輕量視訊與逐像素相同的 FX WebP。
- `tools/prepare_bitmap_font.py`：字型 metrics。
- `tools/check_audio.py`：音訊量測。
- `.gitignore` 排除 Python renderer 的本機 cache。

## 最終清單狀態

本次列出的四個缺件與三個接入項已完成；不再列為「選做待製作」或「等待 Claude 接入」。字型不支援的語系仍採原有字體 fallback，MENU／PAUSE／RESUME 字藝保留作後續功能素材，不為用掉圖片額外新增功能。

素材、程式、驗證與本報告一起提交推送至既有 Pages 來源分支。發布以 Pages workflow 與實際線上檢查為準；歷史報告的待辦狀態以本報告為準。

補充：可操作的 MASTER MODE 按鈕改回正常金色素材，避免誤看成禁用；真正 disabled 的 CONTINUE 仍維持禁用樣式。兩個 HD 網頁影片合計由無損母檔約 46.2 MB 降至約 2.55 MB，母檔完整保留；FX WebP 約 1.25 MB，與 PNG 解碼像素完全一致。
