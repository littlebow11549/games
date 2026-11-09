# Memory Crash 第二版素材交付

依 2026-11-09 更新的 ASSETS.md 製作。

## 圖片

以下為生成工具原始解析度，尚未轉成清單要求的精確尺寸。透明 PNG 保留 alpha。

| 檔案 | 實際尺寸 | 格式 |
|---|---|---|
| source/pic/background/bg_01.png | 941×1672 | RGB |
| source/pic/branding/logo_01.png | 1422×1106 | RGBA |
| source/pic/ui/ui_01.png | 1254×1254 | RGBA |
| source/pic/gems/gems_01.png | 1448×1086 | RGBA |
| source/pic/numbers/numbers_01.png | 2172×724 | RGBA |
| source/pic/branding/icon_01.png | 1254×1254 | RGB |

寶石：4 欄 × 3 列。UI：3 欄 × 3 列，依 ASSETS.md 順序。數字：6 欄 × 2 列，第一列 0–5；第二列 6–9、LV、冒號。UI 與數字仍須依實際邊界切圖。

## 音訊

原創程式合成水晶音色，44.1kHz 雙聲道 192kbps MP3，非錄音或外部音樂模型作品。
BGM 約 69.85 秒，110 BPM；原始音樂按完整 32 小節循環設計，實際 MP3 循環接縫仍需在播放器中聽測。
五種音效：tap / good / wrong / win / over，已通過完整解碼檢查。可用 tools/make_audio.py 重新產生。

## 接入狀態

寶石已接上網頁的浮動及發光動畫。其餘圖片與新 MP3 已交付，尚未接入遊戲。
先前 Logo 與寶石保留為 *_v1.png。
選做項 blade、fx、titles、intense BGM 本次未製作。尚未推送 GitHub。


## 分類更新
已遵循最新 ASSETS.md，所有素材已搬到 assets/source/ 的媒體分類及編號檔名。logo_01 / gems_01 為本次新版；logo_02 / gems_02 為較早版本備份。寶石 CSS 引用已同步。
