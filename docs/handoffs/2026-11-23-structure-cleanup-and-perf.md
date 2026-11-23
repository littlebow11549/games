# 2026-11-23 資料夾結構審視／清理＋戰鬥效能再優化

## 需求（使用者）
1. 重新審視資料夾結構，若還有整理與優化空間則優化。
2. 再優化一次遊戲效能。
3. 補充：保留有價值的「未使用備案」圖片與音樂音效（即 `_alternate/` 收的備選），其餘多餘、沒用到的能刪就刪。

## 重要前提澄清（避免誤刪母檔）
- 一開始誤判 `_archive/` 為退役垃圾。查證後更正：**`_archive/` 是現役三款遊戲的母帶／原始素材庫**，由 records 當作追溯來源：
  - `_archive/02_xianxia_battle/music/`（279M）實為**現役勇氣超人 BGM 的無損母帶 WAV**（`bgm_campus/office/boss/brave`…），`brave_guy_record09_audio_delivery.json` 標為「母帶 WAV」。資料夾只是沿用早期「仙俠」舊名。
  - `_archive/game02/sfx/2026-11-15/`＝音效母帶 WAV，被 `record11`、`record49` 追溯。
  - `_archive/01_memory_crash/`、`_archive/assets/`＝記憶水晶與遊戲中心的來源素材。
- 依此與 CLAUDE.md「不得把母檔當垃圾」「原檔與版本可追溯」，經使用者確認後**不整個刪除 `_archive`，只保留母帶、修結構、刪 rejected 稿**。

## 已實作
### A. 資料夾結構
- **修復斷連**：`git mv _archive/02_xianxia_battle _archive/02_brave_guy`。`record09` 原本就寫母帶在 `_archive/02_brave_guy/music/`，但檔案實際在舊名資料夾下 → 改名後 records 的母帶路徑恢復可追溯，零資料遺失。
- 全 repo 僅歷史交接／稽核報告（`docs/` 下 11-15 的改名紀錄與稽核）仍提到舊名 `02_xianxia_battle`，屬歷史快照，刻意保留不改。
- 結構本身已依 AGENTS 鐵則統一（每遊戲 `source/ runtime/ _alternate/ records/`，單一 `_alternate`，無預覽頁），無需重整。

### B. 清理（保守：只刪明確垃圾）
- 刪除 `_archive/game02/cinematics/2026-11-15/ending-correction/ending_applause_rejected.png`（檔名即標示 rejected 的廢棄 QA 稿）。
- 掃描結果：無 placeholder/tmp/bak/系統垃圾/空目錄/零位元組異常檔（`.gitkeep` 為刻意保留空母檔目錄用）。
- 完全重複內容（md5 相同）的檔案**全部落在使用者指定保留的類別**內（`_alternate/` 備案、`_archive/` 母帶、`.gitkeep`），**現役 `runtime/` 無任何重複或垃圾** → 依指示不刪，僅列記於下方待決。

### C. 戰鬥效能再優化
- `02_brave_guy/js/main.js` `separate()`（每幀敵我分離，空間雜湊）：格鍵由**字串拼接 `"x,z"` 改為數值位元編碼** `((cx+64)<<7)+(cz+64)`。
  - 動機：原本每幀對每隻怪（上限 80）建格鍵、再做 9 格鄰域查詢各拼一次字串，產生大量短命字串 → 手機端 GC 壓力。
  - 行為完全不變（同樣的格子分組），只去除字串配置。

## 已驗證
- `node --check 02_brave_guy/js/main.js`：語法通過。
- Playwright headless（預裝 Chromium）實載 `02_brave_guy/?q=2`：**0 個 JS error / pageerror**，WebGL 實際渲染（GL driver 訊息為證）。
- 數值格鍵等價性單元測試：在 ±40 格座標（遠超實際 ±10）**零碰撞**，鄰域查詢鍵一致 → 與原字串鍵分組等價。
- `separate()` 僅在戰鬥階段執行；headless 未驅動進戰鬥，故以上以語法＋等價性＋啟動無錯共同佐證，未做實機戰鬥幀率對比。

## 未完成／待使用者決定
- **效能現況**：戰鬥迴圈已被先前 Codex／Claude 優化得相當徹底（三段畫質自動降級、敵人上限、空間雜湊、節流 HUD/minimap、InstancedMesh 道具、共用暫存向量、優先載入）。本次僅剩小幅 GC 削減可安全進行；無其他低風險高收益點。
- **`.git` 已達約 1GB**：來自歷史大型二進位素材。刪工作目錄檔案**不會**縮小 clone 體積；要真正縮小需改寫 git 歷史（破壞性、會影響其他分支），未執行，待使用者明確指示。
- **`runtime/lossless/` 78M 無損 WebP 為遊戲實際載入**：轉成有損可大幅降低載入與記憶體，但屬「美術變更」，依預覽驗收門檻需先產預覽並經使用者認可，本次未改。
- **現役 `runtime/` 外的完全重複檔（保留中，待你決定是否清）**：
  - `_alternate/audio-unused/music/brave_guy_bgm17_clear.mp3` ＝ `source/music/brave_guy_bgm40_victory.mp3`（備案與現役同位元組）
  - `_alternate/audio-unused/music/brave_guy_bgm16_campus.mp3` ＝ `source/music/brave_guy_bgm01_battle.mp3`
  - `_alternate/audio-unused/sfx/brave_guy_sfx22_combat_hit_user.wav` ＝ `_alternate/.../sfx74_import_s04.wav`
  - `_archive/02_brave_guy/music/bgm_stage_2_1.wav` ＝ `bgm_wild.wav`；`_archive/game02/sfx/.../sfx_tf_pose.wav` ＝ `sfx_transform_done.wav`（母帶內重複）
  - 以上皆在「備案／母帶」保留類別，依「保留有價值備案」指示未刪；若要再省，可逐一確認後刪冗餘複本。
