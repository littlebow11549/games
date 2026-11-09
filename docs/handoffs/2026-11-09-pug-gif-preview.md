# 巴哥 GIF 動態預覽交接

日期：2026-11-09（台北）。使用者希望直接取得 GIF 看效果，未新增獨立預覽頁。

## 檔案位置

全部位於 `01_memory_crash/assets/preview/`：

- `character_all.gif`：2×2 四種動態同時播放；左上呼吸眨眼、右上高興、左下難過、右下慶祝。640×720，8 秒循環。
- `character_idle.gif`：呼吸／眨眼。
- `character_happy.gif`：高興。
- `character_sad.gif`：難過。
- `character_celebrate.gif`：慶祝。
- 各單獨預覽 320×360，按既有角色播放器的速度循環。
- `character_gif_preview.json`：各 GIF 的影格數、總時長、實際容量、來源未修改驗證。

## 製作與驗證

`01_memory_crash/tools/make_character_gifs.py` 讀取既有四張 8 格來源圖集，依遊戲速度重現影格，合成深藍底以清楚看見輪廓。使用共同色盤避免色盤切換閃爍，GIF 的 256 色限制只影響預覽，不替代正式 PNG。

逐一重新開啟並解碼所有 GIF 影格，確認多影格與循環；來源 PNG 製作前後 SHA-256 一致。預覽與遊戲使用相同動作圖，沒有額外虛構影片動作。合併預覽以 12fps 同時取樣四種速率，單獨 GIF 依原 3／8／5／8fps，以 GIF 支援的 10ms 單位取整。

沒有修改遊戲流程、角色控制器或原始美術。重製需要 Pillow 與系統 DejaVu Sans 字型。

## 交付

GIF、重製程式與此交接報告一起提交到既有 repo 分支。GIF 可在聊天內直接顯示，也可下載個別檔案；不需要進入遊戲觸發狀態。
