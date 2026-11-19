# _alternate — 備選／歸檔素材

遊戲**未使用**或**已被取代**的素材與開發頁集中於此，讓 source/ 只留現役母檔。
全部保留可回溯（git mv，不刪除），日後要取用或清除都在這裡。判定「未使用」以
manifest.json、runtime-images.json、js/css/html 的實際引用為準。

| 子資料夾 | 內容 | 來歷／為何歸檔 |
|---|---|---|
| `concept-placeholders/` | 舊的 3D 單視角佔位圖：`hero_*`、`boss_*`、`mob_imp_*`、`mob_plant_*`、`mob_spear_*`、`sword_01` | 專案初期程式積木人時代的佔位概念圖，已被正式角色參考圖（student／braveguy／angel／ganqiao／nightmare）取代，程式與清單均未引用 |
| `concept-history/` | `*_gray_v1.png` | P0 單視角參考圖的第一輪「灰底版」，已被白底 v2 取代 |
| `sheet-history/` | 舊角色設定合輯稿 | 合輯早期版本，已被現役 sheet／unified 取代 |
| `review-pages/` | `art-preview.html`、`hit-effect-preview.html` 及其 `art-preview.css`、`art-preview-host.js` | 開發期的「驗收用」預覽頁。依 2026-11-19 鐵則不再做驗收頁、改在對話預覽，故歸檔 |
| `audio-unused/` | 105 個未被 manifest 引用的音檔（鏡射原 source 相對路徑） | 舊的 root `sfx_*.mp3`（已被 brave/seal 版取代）、`sfx/clean/*_clean.wav`（舊清版）、`sfx/seal/` 內未採用者、`sfx/imports/`（原始匯入素材）、`music/bgm_campus`、`music/jingle_clear`。判定依據：js 只靠 manifest.audio／manifest.sfx 載入、無硬寫路徑；ogg↔mp3 同名備援兩者都算使用 |
| `branding-placeholders/` | `banner_01.svg`、`icon_01.svg`、`logo_01.svg` | 早期向量佔位圖，資產帳本標「舊佔位 SVG」，全 repo 0 引用，遊戲載入的是 runtime 的 webp |

## 仍留在 source/、未搬到這裡的（避免誤判）
- `source/pic/concept/` 的 `student/braveguy/angel/ganqiao/nightmare` 三視圖＝現役 3D 參考母檔。
- `source/pic/sheet/*_draft_v1.png`＝**現役母檔**，被 `tools/unify_sheet_headers.py`（idx≥5）讀取合成 unified 圖，**不可搬**。
- `source/pic/sheet/*_logo_v2.png`＝疑似被取代的中間 Logo 審稿版，unify 工具未使用；暫時保留待確認，未搬。
- `audio-review.html`（根目錄）＝docs 報告有對外 github.io 連結，移動會斷連結，暫留。
- `source/pic/branding/` 的 `icon_01.svg` 在 **01_memory_crash** 版本是首頁 favicon（現役，留）；本遊戲(02) 的同名 SVG 才是未使用、已歸檔。
- `source/sfx`、`source/music` 剩下的都是 manifest 現役引用檔（含 ogg/mp3 備援對）。
