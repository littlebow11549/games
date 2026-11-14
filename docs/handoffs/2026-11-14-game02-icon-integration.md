# 2026-11-14 勇氣超人：新遊戲 icon 接入（Claude）

## 使用者要求

「新的遊戲 icon 可以先換上去了。」

## 來源

Codex 當日推到預設分支的 `02_xianxia_battle/assets/source/pic/branding/icon_01_logo.png`（1254×1254 RGB，含 Logo 的方形封面，見 [icon 交付報告](2026-11-14-game02-icon-logo.md)）。來源檔未改動。

## 完成內容

- 新增網頁用衍生檔（無損 WebP，由來源縮小，非放大）：
  - `02_xianxia_battle/assets/runtime/pic/branding/icon_01.webp`：512×512，316 KB，首頁遊戲卡片用（與第一款遊戲的 512 封面同規格）。
  - `02_xianxia_battle/assets/runtime/pic/branding/favicon.webp`：256×256，99 KB，遊戲分頁圖示用。
- `assets/js/hub.js`：第二款遊戲的封面由暫代 SVG 改為新 icon。
- `02_xianxia_battle/index.html`：分頁圖示改為新 icon；加上 `apple-touch-icon`（加到 iPhone 主畫面時用原圖）。

## 沒有動的

- `banner_01.png`、角色合輯、3D 參考圖：僅收進 repo，未接入。首頁橫幅目前仍是第一款遊戲的圖。
- 舊的暫代 `icon_01.svg` 保留未刪。

## 測試

`tools/check_hub.cjs` 通過（24 種語系與版面組合）；首頁兩張卡片的圖都載入（512×512）、無 404；目視確認卡片上的 icon 清楚、中英文 Logo 可辨。

## 追加：開始畫面 Logo

使用者同意後，開始畫面改用核准的 `logo_01_review_v1.png`。網頁用衍生檔 `02_xianxia_battle/assets/runtime/pic/branding/logo_01.webp`（768×512 無損 WebP、保留透明，295 KB，由來源縮小）。矮螢幕上限制高度為畫面的 30%，避免把開始鍵擠出畫面。快取版本號 `20261114a`。電腦與手機橫向截圖確認無 404、無錯誤。
