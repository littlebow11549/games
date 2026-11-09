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

## 第三輪（全身主角 + OPTION 續玩 + 漂浮寶石放大）
- **全身主角接入**：GPT 於 `codex/full-body-chibi-pug` 交付 `pug_fullbody.png`（1122×1402 透明全身站姿，完整頭到腳）。只取素材自接（未合併其基於舊版的 css/html）：首頁與選單 `.hero-img` 由 `pug_head` 改 `pug_fullbody`，移除底部柔化 mask，框架改 `aspect-ratio:1122/1402` 完整置中顯示。runtime webp 壓縮為 lossy 134KB（來源無損保留）。來源交付 `PUG_FULLBODY_DELIVERY.json` 與 GPT 交接 `docs/handoffs/2026-11-09-fullbody-chibi-pug.md` 一併帶入。
- **OPTION 回到遊戲**：新增 `#btnResume`「▶ BACK TO GAME」（置頂、綠光強調）。僅在遊戲中按齒輪進 OPTION 時顯示（`btnOptionTop` 設 hidden=false；title/menu 入口設 hidden=true）。點擊回到遊戲並重播本關序列續玩（`show("game")` + `nextLevel(false)`）。
- **漂浮寶石放大**：`floatgems.js` 加 `SCALE=3.2`，整體放大約 3.2x，首頁/選單呈現有份量的漂浮寶石場。
- 驗證（Playwright 430×820）：全身主角完整置中、START 在下方；選單主角＋大寶石環繞；OPTION 顯示 BACK TO GAME 且續玩成功（resumedToGame=true）；無 console/pageerror。

## 第四輪（OPTION 字藝 + KV 封面 + 漂浮寶石加大到 5.5x）
使用者提供兩張新素材並要求寶石再放大。
- **OPTION 字藝**：使用者圖 → `source/pic/titles/option_hero.png` + runtime `option_hero.webp`(64KB)。OPTION 畫面標題由純文字改為字藝圖。
- **遊戲封面 KV**：使用者圖（1254×1254 方形）→ `source/pic/kv/kv_cover.png` + runtime `kv_cover.webp`(99KB)。遊戲中心（根 `index.html` / `assets/js/hub.js`）的遊戲卡片 icon 由 `icon_01.png` 改為此 KV 封面。
- **漂浮寶石加大**：`floatgems.js` SCALE 3.2 → **5.5**（使用者要求至少 5x），首頁/選單寶石明顯放大成寶石場。
- 驗證（Playwright）：OPTION 字藝置中；hub 卡片顯示 KV 封面；首頁/選單大寶石就位；無 console/pageerror。

## 設計需求：GAME OVER 字藝（交 GPT）
使用者要求 GAME OVER 文字比照 OPTION 做成字藝圖。已於 `assets/ASSETS.md` 第五批開出 **T1 `pic/titles/gameover_hero.png`**（1774×887 透明、金色立體卡通字、與 OPTION/START 同風格、水平置中）。GPT 交付後，`#screen-over` 的 `GAME OVER` h2 改為 `<img class="title-word">`（比照 `option_hero` 接法）＋ runtime 壓縮 webp。選做 T2：HOW TO PLAY 標題字藝一致化。

## 品牌刷新接入（icon_02 / banner_02 / OPTION 精修）
GPT 於 `codex/hero-game-icon` 交付 icon_02（全身衝鋒封面）、banner_02（hub 首頁橫幅）、精修 option_hero。只取素材自接（未合併其基於舊版的程式）：
- hub 遊戲卡片 icon：`kv_cover.webp` → `icon_02.webp`（76KB）。
- hub 首頁主視覺 `.banner-art`：`banner_01.png` → `banner_02.webp`（96KB）。
- OPTION 字藝 `option_hero.webp` 更新為精修版（66KB，與既有近乎一致）。
- 來源 PNG 保留；GPT 交接 `docs/handoffs/2026-11-10-hero-brand-refresh.md` 一併帶入。
- 注意：此批**不含 GAME OVER / HOW TO PLAY 字藝**，T1/T2 仍待 GPT 製作。

## GAME OVER / HOW TO PLAY 字藝接入
使用者要求這兩個標題字藝化。repo 內既有單詞字藝 `pic/titles/gameover.png`、`how_to_play.png`（較早 titles_01 批次切出，橘紅/金色 3D＋藍邊，風格與 OPTION 一致）直接接入：
- `#screen-over` 的 `GAME OVER` h2 → `<img>`（`gameover.webp`，lossless 66KB）。
- `#modal` 的 `HOW TO PLAY` h3 → `<img>`（`how_to_play.webp`，lossless 59KB）。
- 驗證：Playwright 兩畫面字藝置中、風格一致、無 console/pageerror。
- 註：此兩張原生 393px，顯示尺寸下清晰度可接受；若要更銳利可日後請 GPT 出 1774px hero 版（原 T1/T2），非必要。

## 升級為 hero 高解析字藝（GAME OVER / HOW TO PLAY）
GPT 於 `codex/hero-game-icon` 補交 `gameover_hero.png`、`howto_hero.png`（各1774×887，金色立體＋藍邊＋水晶，與 OPTION 同款，GAME OVER 另帶細裂紋）。以此取代先前的低解析 `gameover.png`/`how_to_play.png`：
- `#screen-over` → `gameover_hero.webp`（67KB）；`#modal` → `howto_hero.webp`（63KB）；舊低解析 runtime 已移除。
- 另交付 `pug_idle_01`（8格待機 sprite，444×444 頭/半身）＋ `hero-idle.js`：**暫不接入**，因會使首頁/選單從全身退回半身，與使用者「要全身」衝突。若日後想要待機呼吸/眨眼動畫，可改以全身版重做再接。
- 驗證：Playwright 兩畫面 hero 字藝置中清晰、風格一致、無 console/pageerror。

## 全身待機動畫接入（pug_idle_full）
使用者提供全身版待機 sprite（1774×887，4×2＝8 格，各 443×443，透明全身）。存為 `source/pic/character/pug_idle_full.png` + `runtime/pic/batch3/pug_idle_full.webp`(423KB)。
- 首頁/選單主角由靜態 `<img>` 改為 `<canvas data-hero-idle>`，新增 `js/hero-idle.js`（8 格時間軸 durations=[1500,520,90,110,90,520,700,470]=4s，含眨眼、相鄰格淡入過渡；非作用畫面/隱藏/reduced-motion 暫停）。
- CSS：`.idle-char canvas` 重置舊 `.mascot canvas` 的 scale(1.62/1.78) transform（否則放大 1.62x）；square aspect，title 470px、menu 280px。
- 保留 GPT 半身 `pug_idle_01` 不用；全身版解決「要全身」需求。
- 驗證：Playwright canvas 有繪製、循環取樣 6 種不同值（確認換格/眨眼）、全身置中、無 console/pageerror。
