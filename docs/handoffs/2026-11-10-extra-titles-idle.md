# 新標題與巴哥待機圖集（2026-11-10）

使用者要求新需求一併完成，並以附圖短腿站姿設計連續待機圖。已同步 Claude 至4a50573，保留其全身角色、漂浮寶石、返回遊戲與遊戲邏輯。

## 標題與 COMBO
- 來源：遊戲 `assets/source/pic/titles/gameover_hero.png`、`howto_hero.png`，皆原生1774×887透明字藝。GAME OVER 保持金色並有細裂紋；HOW TO PLAY 與 OPTION 同風格。
- 同名 runtime/pic/batch3 WebP 為 lossless + exact，RGBA逐像素一致；見 `assets/source/TITLES_T1_T2_DELIVERY.json`。
- index.html 已接結算／教學標題，保留 alt；CSS contain。game.js 的 showCombo 用既有 COMBO 圖＋倍率 span，每次替換節點，不改計分／連擊規則。
- T3 普通按鈕字藝屬選做，未製作。

## 待機交付
- `assets/source/pic/character/pug_idle_01.png`：原生1774×887 RGBA、4欄2列8個繪製關鍵幀，單格約443/444px，並非每格1024px。保留原PNG，不插值放大。
- 依使用者本次附的較短腿圖製作，不是稍長腿版本逐像素變形。完整全身；幀間仍有生成細節差異，不是同一3D骨架渲染。
- `assets/runtime/pic/batch3/pug_idle_01.webp` 無損，與PNG RGBA逐像素一致。幀矩形／時長／雜湊見 `assets/source/PUG_IDLE_DELIVERY.json`。
- 順序：中性→吸氣→半閉眼→閉眼→睜眼→吐氣→放鬆→回中性。各幀850/400/90/110/90/400/450/610ms，共3秒。
- `js/hero-idle.js` 以固定網格顯示並短時間混合相鄰幀，避免每幀按不同外框縮放；屬8關鍵幀與程式過渡，不是60張繪製幀或骨架補間。
- `assets/preview/pug_idle.html` 獨立播放頁，含暫停／恢復、減少動態第一格、分頁隱藏停止刷新。附 `pug_idle_preview.png` 和 `pug_idle_preview.webm`；影片為瀏覽器錄影，非透明角色影片或無損母檔。
- **正式首頁／選單尚未改接圖集**，本次要求是設計連續圖，先交圖集與預覽。正式遊戲保留已接全身圖與CSS呼吸。接入時加 canvas[data-hero-idle] 與 hero-idle.js，移除重複CSS呼吸並保留靜態 fallback。

## 驗證／交接
- 三張新圖PNG/WebP逐像素一致。
- Chromium 三種視窗：教學導覽、圖片解碼、結算標題、COMBO ×2/×12更新，無JS錯誤。測試回應臨時暴露內部函數，正式程式未加測試入口；非完整遊戲流程回歸。
- 待機幀進度、暫停／恢復、減少動態、無JS錯誤通過，已錄影。首頁六語系×四種寬度與最愛／分類／入口回歸通過。
- 素材與報告併入PR #3；未宣稱部署，未發外部訊息通知Claude。
