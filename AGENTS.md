# 專案協作要求

- 使用者要求：所有製作均需交接報告，讓 Claude 能接續。
- 開始修改前先讀 docs/HANDOFF.md 與任務相關報告。
- 每次製作（程式、圖片、音樂、動態、版面）必須同步更新 docs/handoffs/ 相關報告與 docs/HANDOFF.md；與成果一併提交。
- 報告包含實際完成內容、檔案路徑、素材規格與分類、驗證結果、未完成項目及發布狀態；不得誇大完成或通知狀態。
- 每款遊戲來源素材遵循其 assets/ASSETS.md 的媒體分類及編號；首頁來源素材存放根目錄 assets/source/。
- 圖片要求大而清晰，僅可無損壓縮；保留原生解析度和透明度，壓縮後逐像素驗證，勿以插值放大宣稱增加細節。

## 2026-11-20 使用者最新清理指示（優先於下方歷史歸檔規則）

確認未使用且已淘汰的佔位圖、錯誤Logo稿、舊半成品與驗收截圖直接刪除，不再搬入備選夾堆積。先查程式動態引用、manifest、母檔及工具依賴，記錄刪除理由與雜湊。現役大招字明確保留。正式設定集以sheet/unified為母檔；舊draft/logo_v2已完成角色像素比對並刪除，舊母檔保留要求已被本次明確指示取代。

## 資料夾結構鐵則（使用者 2026-11-19 明確要求，不得因後續任務忘記而破例）

1. **所有遊戲共用同一套資料夾結構**。新遊戲、改結構一律照下方「統一結構」，不得各遊戲各自一套。
2. **結構要簡潔、標示清楚**；**不得隨意新增非必要的資料夾**。需要新資料夾前先確認既有結構無法容納，並在交接報告說明理由。
3. **未使用的素材與歷史舊圖（第一輪／被淘汰／被取代的版本）一律收進單一備選資料夾 `assets/_alternate/`**（每款遊戲一個，英文名），不散落在 source 各處。備選夾內按來源分類並附 README 說明每批的來歷，方便日後取用或清除。判定「未使用」要以 manifest.json、runtime-images.json、js/css/html 的實際引用為準；source 的正式母檔（會被壓成 runtime 交付版或合成 unified 的來源）算「使用中」，不得當成未使用搬走。
4. **不再製作任何「驗收用」的獨立 HTML 頁或 preview 截圖資料夾**（如 art-preview.html、audio-review.html、hit-effect-preview.html、assets/preview/）。需要給使用者看效果時，**直接在對話中開啟預覽**（截圖／即時畫面），不另外做頁面或存一堆截圖檔進 repo。既有的這類頁面與 preview/ 截圖視為備選待清理，移入 `assets/_alternate/`。

### 統一結構（每款遊戲 `NN_game/`）

```
NN_game/
├── index.html / play.html       遊戲入口頁 / 實際遊玩頁
├── css/ js/ tools/ vendor/       樣式、程式、工具、第三方庫(如 three/)
├── 文件.md                       CHARACTERS/DESIGN/SCRIPT/PROGRESS 等
└── assets/
    ├── manifest.json            素材插槽表（models/audio/sfx 路徑；null=用程式佔位版）
    ├── *.md                     ASSETS.md、MODELS_3D.md 等需求與清單
    ├── fonts/                   內嵌字型
    ├── source/                  原始高品質母檔（masters）
    │   ├── pic/ music/ sfx/ (video/)
    ├── records/                 交付紀錄、提示詞、檢查與新舊檔名對照
    ├── runtime/                 遊戲實際載入的壓縮交付版（webp/ogg…）
    └── _alternate/              備選：未使用素材＋歷史舊圖，統一收這裡
```

### 整理執行狀態（2026-11-19）

**已完成並 push**（詳見各 `assets/_alternate/README.md`）：
- 02_brave_guy：concept 舊佔位檔（hero/boss/mob/sword）、concept/history（gray_v1）、sheet/history、驗收頁（art-preview.html／hit-effect-preview.html＋其 css/js）→ 已移入 `assets/_alternate/`。
- 01_memory_crash：`assets/preview/`（整批驗收截圖＋batchN.html）→ 已移入 `assets/_alternate/preview/`。

**重要更正（原先一度誤判）**：`assets/source/pic/sheet/*_draft_v1.png` 是**現役母檔**，被 `tools/unify_sheet_headers.py`（idx≥5）讀來合成 unified 圖，**絕不可搬**。`*_logo_v2.png` 是疑似被取代的中間 Logo 審稿版、unify 未使用，但未百分百確認，**暫留 source 待確認**。

**尚待接手者處理**：
- 確認 `*_logo_v2.png` 是否確為棄用版，是則移入 `_alternate/sheet-logo-v2/`。
- `audio-review.html` 在 docs 報告有對外 github.io 連結，移動會斷連結；要清理需先改掉那些連結。
- 更新 `02_brave_guy/assets/ASSETS.md` 內指向 `../hit-effect-preview.html` 等已移動路徑的敘述，及 `docs/HANDOFF.md`，並補一份交接報告。
- 其餘 source（music/sfx）的未引用檔尚未稽核；要做時以 manifest.json 的實際引用為準，未引用者移入 `_alternate/`，不要動到母檔。

## 美術製作防重工（使用者再次明確要求）

- 新增美術前必須先查自己的生成／交付／歸檔紀錄，並對照 `docs/reports/2026-11-15-art-source-ledger.md`；不能把ASSETS待收到清單直接當成生圖清單。
- 每項需求先確認：原檔、圖集／合輯內對應內容、歷史版本、接入狀態。缺少獨立PNG或manifest為null不等於尚未製作。
- 已有素材優先復用、切圖或程式整合；來源未定位、可能重複或使用者指出已做的項目，標記待追溯，不得重新生成。
- 本聊天產出的未提交場景、變身與頭像保留待比對；已取消的ART_BATCH_QUEUE不得恢復執行。先更新來源對照及交接，再執行確認缺少的製作。

## 2026-11-20 最終設定優先與停止生圖
使用者在聊天新傳的四張米白底VISUAL REVISION 02（brave／angel／nightmare／student）才是最終定案。repo舊深綠底四張不是最新定案；原始附件尚待定位，不得冒認已歸檔。使用者已要求停止生圖；職場補圖暫停，勿自動重啟。詳見docs/handoffs/2026-11-20-approved-visual-revision-02.md。

## 已找回定案原附件（最新狀態）
四張VISUAL REVISION 02已從聊天附件暫存區原樣歸檔到02_brave_guy/assets/source/pic/sheet/sheet_{braveguy,angel,nightmare,student}_approved_v02.jpg；清單APPROVED_VISUAL_REVISION_02.json。此前「未定位」已解除。四張JPEG逐byte一致，不可改用舊深綠底圖。停止生圖仍有效；其他職場版附件已有線索，先盤點不可重生。

## 2026-11-20 三專案素材統一歸檔（最新，優先於歷史命名要求）
- 三者前綴：`brave_guy_`、`memory_crash_`、`game_center_`。
- 素材檔名：`前綴_類別NN_用途.副檔名`；角色沿用使用者指定拼法 `charactor`，依劇情首次出場順序編號，同角色的正面／表情／設定集共用角色編號。
- 不要改遊戲內邏輯角色ID、音效事件ID或存檔鍵；實體檔案改名以各專案 `assets/records/*_asset-renames.json` 為準。
- 交付JSON、提示詞、檢查報告集中 `assets/records/`。`manifest.json`、`runtime-images.json`、執行期字型metrics與授權文件保留技術用途名稱。
- 正式定案設定集：`source/pic/sheet/`；獨立表情特輯：`source/pic/expressions/`；現役裁切用舊圖集留 `sheet/unified/`，不能冒稱最新定案。
- 查素材先看 `assets/records/*_asset-index.md` 和 `*_asset-inventory.json`。已收錄並不代表遊戲有使用，索引分開列載入、母檔參考與未使用備選。
- 暫存找回原圖原樣保存，不重新編碼、不插值放大。無法找到的惡夢超人獨立表情特輯保持待追查，不以設定集或新圖冒充。
- 使用者新授權重繪三角色技能圖集，但明確要求先完成歸檔驗證；完成前禁止開始生圖。角色設定集仍禁止擅自重繪。
