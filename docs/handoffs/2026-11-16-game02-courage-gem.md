# 2026-11-16 勇氣寶石變身按鈕

使用者指定重繪原紅圍巾變身按鈕為勇氣寶石。先核對來源台帳與舊圖集；屬明確指定的新設計。

## 完成
- 原創生成綠色六角切面寶石、金色護框、深綠徽章，透明底、無字，粗線條卡通風格。
- 原生 `1254×1254 RGBA` PNG：`02_brave_guy/assets/source/pic/icons/btn_transform_courage_gem.png`。
- 同尺寸無損 WebP：`02_brave_guy/assets/runtime/lossless/pic/icons/btn_transform_courage_gem.webp`，986416 bytes；RGBA 逐像素一致，未放大或裁切。
- `css/ui-art.css`：變身鍵改為 76×76 圓形寶石。就緒柔和光暈、按下縮小提亮、鎖定灰階，減少動態偏好停用呼吸效果。舊圖集保留供閃避使用。
- `css/hud-art.css`：移除舊滿氣狀態從 `control_extras_sheet.webp` 顯示紅圍巾的高優先度覆蓋，避免就緒時回到舊圖。
- `assets/runtime-images.json` 與 `js/loading.js`：納入進場預載，更新入口及 CSS／JS／清單快取版本。
- 保留未變身只有出拳與閃避，勇氣滿且能變身時才顯示寶石鍵的規則。

## 驗證
- PNG／WebP 尺寸及所有 RGBA 像素一致；alpha 包含0與255。
- `git diff --check` 通過。
- Chromium 390×844：76px 點擊區、滿氣顯示、減少動態停用光暈；實際點擊進入 transforming／首次變身對話，無 pageerror。已檢查最終截圖及背景圖來源。

## 發布
驗證後推送預設分支部署；最終結果以 Pages run 及線上素材核對為準。
