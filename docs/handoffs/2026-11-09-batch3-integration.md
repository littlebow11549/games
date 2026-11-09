# 第三批 KV 正式接入（Claude，2026-11-09）

使用者訊息「已有新素材請更新」。GPT（Lilins）於分支 `codex/batch3-hero-art`（commit 645aa51）交付第三批 KV1–KV4 素材與獨立預覽。本次將其合併進開發分支 `claude/fervent-ride-4h0vjm` 並正式接入遊戲 HTML/CSS/JS。

## 接入內容

所有 runtime 圖路徑相對 `01_memory_crash/`。

- **首頁巴哥（KV2 半身像）**：`#screen-title` 原本的 canvas 巴哥改為 `assets/runtime/pic/batch3/pug_head.webp`（去背半身像，`object-fit:contain` 不裁頭），置中、佔畫面主體，加 `heroBreath` 待機呼吸動態。徹底解決先前「主角沒置中」與「狗頭再大」的問題。
- **START 字藝（KV3）**：`#btnStart` 由 Inter 金字改為 `assets/runtime/pic/batch3/start_hero.webp` 金屬立體字藝，置底置中，保留 `pulseStart` 脈動與可聚焦 button（`aria-label="START"`）。
- **選單巴哥（KV2）**：`#screen-menu` canvas 巴哥改為 `pug_head.webp`，半身像自面板上緣探出，沿用選單彈入動畫。
- **遊戲中彈出橫幅（KV4 六詞 v3）**：`js/game.js` 的 `banner()` 改引用 `assets/runtime/pic/batch3/titles_fx_<word>_v3.webp`（ready / your_turn / perfect / miss / again）。保留原 slam 砸下→回彈→淡出流程與計分/回合時序，未更動遊戲邏輯。
- **保留項**：`#screen-game`、`#screen-over` 的巴哥仍為 canvas 動畫版（依遊戲進程變表情：celebrate / sad / idle），符合使用者「主遊戲畫面巴哥根據遊戲進程做表情」的要求，故不改為靜態圖。
- **KV1 `kv_main.webp` / `kv_pug.webp`**：本次保留為可選全幅主視覺／分層角色素材，尚未鋪進版面，避免與現有 logo＋半身像構圖衝突；後續若要做「衝鋒＋飄動寶石」分層版可直接取用。

## 檔案異動

- `01_memory_crash/index.html`：首頁、選單巴哥節點改 `<img class="hero-img">`；START 改 `<img class="start-word">`；移除這兩處的 `data-mascot`（canvas），遊戲／結算仍保留 `data-mascot` canvas。
- `01_memory_crash/css/style.css`：新增「第三批 KV 接入」區塊（`.hero-char`/`.hero-img`/`heroBreath`、`.title-char.hero-char`、`.menu-char.hero-char`、`.title-start.start-hero`）。
- `01_memory_crash/js/game.js`：`banner()` 圖片路徑改指向 batch3 的 `_v3.webp`。

## 驗證

- 本機 HTTP server + Chromium/Playwright（430×820，deviceScaleFactor 2）：首頁、選單、遊戲三畫面截圖；`pug_head.webp`、`start_hero.webp` 正常解碼顯示，巴哥置中、START 置底；`titles_fx_perfect_v3.webp` 載入成功（原生 1774×887）。
- Console 無 JS 或資源錯誤；遊戲流程（START→選單→ARCADE→教學→開局寶石點亮）正常。
- 尚未做手機實機與完整遊戲／音訊回歸；GitHub Pages 需推送後由使用者端生效，push 不等同已部署。

## 尚待

- 可選：KV1 全幅主視覺的分層「飄動寶石」動態版（kv_pug + CSS 寶石節點）。
- 可選：遊戲／結算巴哥是否也換成更高解析來源（目前維持可變表情 canvas）。

## 後續微調
- HOW TO PLAY 的「OK, Let's Play」按鈕原本靠左（modal-box 非 flex，`align-self:center` 無效）。改為 `display:block; width:100%` 左右撐滿、與步驟卡片對齊置中。（commit db2a481）

## 第二輪調整（效能＋置中＋漂浮寶石＋全身主角需求）
使用者回饋：YOUR TURN 偏右、讀取慢、主角被切、選單要漂浮寶石。

- **字藝置中**：以實心字（alpha>120）bbox 將每張 `titles_fx_*_v3` 與 `start_hero` 水平平移到正中（YOUR TURN 原 cx≈0.516 → 置中）。
- **效能壓縮**：遊戲實際載入的 8 張 runtime webp 由無損重編為 lossy（Pillow，q84–86）＋降尺寸（字藝寬≤1000、start≤760、pug_head≤900）。總量 ~9.6MB → ~0.8MB（約 −92%），首屏與橫幅載入大幅加快。來源 PNG 無損保留於 `source/`，`BATCH3_DELIVERY.json` 記錄不變。
- **漂浮動態寶石**：新增 `js/floatgems.js` + CSS `.float-gems/.fg/fgFloat`，用現成 `gems_01.png`（4×3 共12顆）sprite 在首頁/選單側邊與角落飄動（translate/opacity 動畫，reduced-motion 停用）。首頁/選單內容提升 z-index 疊於其上。
- **主角切邊過渡**：首頁半身像底部加 mask 柔化淡出，避免硬切；正式解法見下方 KV5。
- **全身主角設計需求（KV5）**：已於 `assets/ASSETS.md` 第四批開出 `pic/character/pug_full.png`（1024×1536 透明全身站姿）規格，待 GPT 製作後接入取代半身像。

### 驗證（本輪）
- Playwright 430×820：首頁、選單漂浮寶石就位、START 定位正常、壓縮後畫質清晰；YOUR TURN 置中（中線落於 YOUR/TURN 間）；無 console / pageerror。
