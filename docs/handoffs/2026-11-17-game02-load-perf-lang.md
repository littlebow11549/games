# 2026-11-17 勇氣超人：啟動載入優化（只載當前語言）

## 使用者要求
再做一次效能優化，要更快進入遊戲；資源多是圖片，不該讀這麼久。

## 根因
啟動預載（`js/loading.js`）未依語言過濾：system 字藝（combat/labels/outcomes）與 logo 各有 _en/_zh/_ja 三份（共 15MB），但同時只顯示一種語言 → 多載約 10MB。另有零引用的 `sheet_angel/ganqiao`（2.8MB）被預載；日文 logo 以靜態 `<img src>` 急載（非日文也載 1.1MB）。

## 完成內容
- `preloadImages` 以當前語言過濾 `_en/_zh/_ja` 變體（`lang` 即時綁定，boot 讀 localStorage 正確）；新增 `preloadLanguage(code)`，`refreshLang` 切語言時背景補載新語言字藝。
- `common` 過濾移除未用的 `sheet_angel/ganqiao`（只留 HUD 用的 `sheet_worker`）；boot regex 同步移除。
- 日文 logo（`#ov-local-logo`）改 `data-src`，`showMenu` 僅在 `lang==='ja'` 時設 `src`。

## 成效（實測位元組）
- boot（選單出現前）：**11.66MB → 7.83MB（−33%）**
- 進關前 game-scope：**43.10MB → ~28.5MB（−34%）**
- 零畫質損失（其他語言切換時才載）。

## 測試
- 無頭 Chromium zh 與 ja 各一：只載當前語言字藝/logo、不誤載他語、不載 sheet_angel/ganqiao、0 error。

## 仍可再優化（需使用者決定）
- 字藝/合輯/UI 多為**無損 webp**（system 字藝每張 1.3–1.8MB）。若比照過場圖開放**有損 q90**，進關可再省約 10MB，但字藝含文字、q90 邊緣可能輕微光暈——需使用者同意放寬無損規定。

## 發布
已 commit 並上線（開發分支＋預設分支）。commit `da13f10`。
