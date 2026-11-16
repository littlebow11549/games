# 開場小天使與心魔清晰原圖

## 問題及來源盤點
使用者回報開場小天使與心魔像素不清楚。舊 opening.css 從 1728×1152 設定集取約 250×340／190×114 像素區域，再以不同橫縱背景倍率放大，造成模糊與比例失真。核對美術來源對照表、開場交接、概念獨立圖與設定集後，找到既有 concept/angel_front.png、ganqiao_front.png（各 1254×1254）。無須重畫或插值放大。

## 完成
- opening.js / opening.css 改為原生 img、object-fit:contain，角色全身完整顯示；使用原圖白底搭配細邊框，保留背景及三語台詞，移除設定表裁切與邊緣遮罩。
- assets/runtime/lossless/pic/concept/{angel,ganqiao}_front.webp 為兩張既有 PNG 的無損配送，尺寸不變，RGBA 逐像素比對一致。分別 794268／829628 bytes；原稿不動。來源、SHA 與規格見 assets/source/OPENING_SHARP_REVIEW.json。
- runtime-images.json / loading.js 加入兩圖 boot 預載與解碼檢查，完成才進開場。main/cinematics 共用同一新版 loading 模組；入口及相關版本鍵更新。
- 未修改 Boss 音樂、按鍵音、清除進度與其他角色設計。

## 驗證與發布
- tools/tests/game02-opening-sharp.cjs：390×844、320×568、1280×900 三尺寸、兩幕實際控制切換，原生尺寸與完整解碼檢查、contain 顯示、無橫向溢出、跳過與重播；0 pageerror。
- 目視手機雙幕，確認五官、輪廓、全身比例清楚。
- 本提交準備合併發布，發布結果以 GitHub Pages workflow 為準。
