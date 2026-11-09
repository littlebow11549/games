# 第三批 KV1–KV4 主視覺與字藝交付（2026-11-09）

使用者要求接續 Claude 的設計需求，依 `01_memory_crash/assets/ASSETS.md` 第三批製作。初始基於 `0519273`，提交前已同步 Claude 分支至 `aa11b6f`（保留難度曲線與移除 placeholder 的更新），本次新增素材與獨立預覽，沒有改正式遊戲 HTML、JS、CSS 或音樂。正式接入由 Claude 接續。

## 完成內容與分類

以下路徑相對 `01_memory_crash/assets/source/pic/`。10 張圖片皆獨立生成，PNG 原檔完整保留，不裁切、不插值放大、不減色；本次採規格允許的高品質單張特效方案。

| 項目 | 檔案 | 原生尺寸 | 透明 |
|---|---|---|---|
| KV1 整張主視覺 | `kv/kv_main.png` | 941×1672 | 否 |
| KV1 去背衝鋒角色 | `kv/kv_pug.png` | 1090×1443 | 是 |
| KV2 半身大頭像 | `character/pug_head.png` | 1254×1254 | 是 |
| KV3 START | `titles/start_hero.png` | 1774×887 | 是 |
| KV4 六詞 | `titles/titles_fx_{ready,your_turn,perfect,miss,again,combo}_v3.png` | 各1774×887 | 是 |

KV1 合成圖包含十二色環繞寶石與次元背景，原生尺寸未達建議 1080×1920，沒有放大假稱達標。角色層是依主視覺另生成的同造型透明角色，並非逐像素對位的原始合成分層。KV2 頭盔接近上緣，接入請使用 contain 並留外部空間，勿 cover 裁頭。KV4 採俐落金屬字面、深藍立體邊、分層能量環；MISS 為紅色警示，PERFECT 為金色慶祝。

## 無損與使用版本

- 對應網頁版本：`assets/runtime/pic/batch3/<同檔名>.webp`（相對遊戲目錄）。
- WebP 使用 lossless + exact，逐張解碼比對 RGBA 每個像素，10/10 一致。保持原生尺寸與 alpha；來源 PNG 與生成原檔位元組一致。
- 尺寸、容量、alpha 範圍、PNG SHA256、RGBA SHA256：`assets/source/BATCH3_DELIVERY.json`。
- 九張透明圖 alpha 包含 0–255；主視覺為不透明 RGB。未對來源圖做有損壓縮。

## 獨立預覽與接入建議

`assets/preview/batch3.html`（需 HTTP server）展示整張主視覺、獨立角色與寶石漂浮、半身像、START、六詞點選播放。附 `batch3_desktop.png` / `batch3_mobile.png` 截圖。

- 整張 KV 用於靜態構圖，寶石已烘焙其中；勿宣稱這些寶石會獨立動。
- 分層方案用 `kv_pug.webp` + 既有 `ambient_plate.png` + `gems_01.png` 的 12 個 CSS 圖集節點。未新增 `kv_gems/` 的十二張新繪圖，也不是從合成圖切出的寶石。預覽提供讀序、位置與相位範例。
- 新字藝有 `_v3` 後綴，正式遊戲仍引用原第二批特效，避免不經接入調整便覆寫現有效果。接入時將六詞映射改至 `runtime/pic/batch3/titles_fx_<word>_v3.webp`，COMBO 倍率維持原文字層。
- 字藝是單張靜態 PNG/WebP，不是 8–12 格圖集。預覽用 Web Animations 示範 1.6 秒砸下→回彈→停留→淡出；正式遊戲應依原流程的提示時長調整，不能直接改變計分／回合時序。
- START 請放在可聚焦的 button 裡，保留可讀標籤；裝飾寶石不得攔截點擊。角色和 Logo 使用 contain 避免切頭。
- 預覽支援暫停漂浮、分頁隱藏暫停、prefers-reduced-motion 靜態替代。此頁無儲存設定、無音訊、無外部字體依賴。

## 驗證

- Chromium / Playwright：全部圖片解碼；320、390、768、1440px 無水平溢出；六詞按鈕換圖；十二顆寶石節點；漂浮暫停與減少動態通過；無 JS 或 HTTP 錯誤。
- 桌面及手機截圖；目視檢查角色與字詞，以及深色背景上透明邊緣。
- 未改正式遊戲，未為這批素材重跑完整遊戲／音訊回歸；正式接入後仍需手機實機、效能與遊戲流程驗收。

## 尚待與發布狀態

必要素材交付完成；可選的十二顆獨立新寶石及逐格特效動畫未製作。KV1 未達原建議像素，實際尺寸如上。

成果與交接報告提交於 `codex/batch3-hero-art`，供 PR 檢視及 Claude 接手。推送或建立 PR 不等同正式遊戲已接入或網站已部署；未透過外部訊息通知 Claude。
