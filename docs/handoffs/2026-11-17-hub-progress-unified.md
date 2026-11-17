# Banner 統一排版與進度輪播

- 依最新方向採勇氣超人正式Logo構圖，Memory Crash加入現有branding/logo_01.webp；兩張Logo與遊玩按鈕共用垂直中心線。
- 內文與金色CTA統一字體／尺寸／樣式，兩張都使用play六語文字。移除探索遊戲、CTA箭頭、暫停圖示。
- 活動頁點展開成金色進度條，6秒填滿切換；非活動頁小圓點，可點擊切頁。計時與視覺由同一elapsed驅動。
- 停留圖片、鍵盤focus-visible、背景頁、觸控期間暫停並保留進度；降低動態偏好不自動播放。
- 修改 index.html、assets/css/hub.css、assets/js/carousel.js。使用既有Logo，無新素材。
- 檢驗390／1280尺寸單張切換、箭頭／鍵盤／頁點、無溢出；兩張Logo與CTA中心誤差<1px；實測進度增長並自動換張。
- 無未完成項目；推送後Pages發布，聊天核對線上版本。
