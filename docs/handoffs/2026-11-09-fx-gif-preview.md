# 三種遊戲特效 GIF 預覽交接

日期：2026-11-09（台北）。使用者詢問動態特效，並要求直接看預覽。

## 檔案

位於 `01_memory_crash/assets/preview/`：

- `fx_all.gif`：依序播放 PERFECT、MISS、GAME OVER 的實際畫面。
- `fx_burst.gif`：過關金色爆閃、原本的粒子與角色慶祝。
- `fx_shatter.gif`：點錯碎晶放大淡出、畫面震動與角色難過。
- `fx_crack.gif`：遊戲結束的玻璃裂痕浮現及淡出。
- `fx_gif_preview.json`：錄影來源、剪輯時間、GIF 容量及預覽尺寸。

## 製作方式

`tools/capture_fx_gifs.cjs` 用真實 Chromium 遊玩：START→跳過開場→ARCADE→正確重現序列過關→連續三次點錯。錄下遊戲本身的 CSS、粒子、角色與狀態動畫，沒有額外添加遊戲內不存在的碎片物理或逐格 VFX。

以暫時放在左上角的 8×8 色彩標記定位每個事件的錄影時間，輸出時裁掉上方 8px。原錄影 390×844，GIF 為 390×836、15fps；每段後方增加半秒末格停留，方便辨識後循環。

原錄影保存在本次工作區 scratch，repo 收錄 GIF、重製程式與報告。GIF 為 256 色無音訊預覽，正式 PNG/WebP/影片素材與遊戲程式沒有被修改。

## 驗證與重製

以 Pillow 逐格重新載入 GIF，確認多影格、非靜態、可循環並記錄時長。來源事件透過遊戲 DOM 的 burst／shatter／crack 圖層確認。

重製需啟動本機 server，再執行 `node tools/capture_fx_gifs.cjs`；可用 GAME_URL 指定頁面，CHROMIUM_PATH 指定瀏覽器。需要 Playwright、Chromium、ffmpeg。

成果與本交接一起提交 repo；聊天可直接顯示 GIF，也提供個別下載。
