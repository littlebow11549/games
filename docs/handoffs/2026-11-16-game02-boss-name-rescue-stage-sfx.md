# 2026-11-16 勇氣超人：名牌語系修正 + 救援調降 + 新關社會版錢大姐 + 音效/音樂需求 v2

## 使用者要求
1. Bug：戰鬥中切語系時 Boss 名牌沒跟著換語系。
2. 減少小天使救援次數。
3. 新增一關「錢大姐社會版」。
4. 重發全部音效 ComfyUI 需求：打擊感要 KOF 97/98、變身音要寶石般華麗；Boss 二段變身 BGM 要更狂暴、各關 BGM 更多不重複。

## 完成內容

### A. Boss 名牌切語系修正（commit 60d5325）
- `spawnBossActual` 記下 `game.bossKinds`；`startStage` 重置為 null。
- `refreshLang` 在守關者戰中用 `bossKinds` 重算 `#boss-name` 與 `#quest-wave`「打倒…」。
- 原本只在 Boss 登場設一次，切語系不更新（如 JP 下顯示 Qian）。測試：zh/en/ja 切換名牌皆更新（錢大姐/Qian/銭姉さん），0 error。

### B. 小天使救援次數調降（commit 3f2ec0b）
- `DIFFS`：easy 3→2、normal 3→2、hell 2→1。

### C. 新關 3-6 社會版錢大姐（commit 3f2ec0b）
- 新 boss `qianBiz`「錢經理」：沿用 qian 外觀(`vis:'qian'`)與過場圖(`boss-storyboards` 以 `files:['boss_qian_storyboard']` 複用)；職場小怪(假忙森)、`extort+tired` debuff、hp 5200。
- 新關 `3-6`「財務部與年終帳」插在 3-5 與 4-1 之間（地圖三），`grant:null`，含三語對白。
- 名牌三語：Manager Qian／銭マネージャー／錢經理（lang_en、lang_ja 已補對白與名稱）。
- 解鎖為陣列順序制，插入安全；關卡 14→15。
- 測試：進關 0 error、boss=qianBiz、名牌三語切換正常。

### D. ComfyUI 音效＋音樂需求 v2（文件，commit 4ad4489）
- `02_brave_guy/assets/records/brave_guy_record50_sfx_music_brief_2026-11-16.md`：
  - 全部 SFX 重做；**打擊感**依 KOF 97/98（厚脆爆、三層疊、乾短不糊）；**變身音**改寶石/水晶結晶感。
  - 音樂：新增 `bgm_boss_rage`（Boss 二段/45 秒 PRESSURE 加壓時的狂暴金屬）；各 Boss 戰給**專屬曲**（現況多數共用 `bgm_boss`）；補 `bgm_stage_1_1`（現與校園共用）與新關 `bgm_stage_3_6`。
  - 每條附英文生成提示詞；已交付使用者下載。

## 檔案
- `js/main.js`（bossKinds、refreshLang、DIFFS、qianBiz 定義與 debuff）、`js/boss-storyboards.js`、`js/story.js`（3-6）、`js/lang_en.js`、`js/lang_ja.js`
- 新增文件 `assets/records/brave_guy_record50_sfx_music_brief_2026-11-16.md`

## 測試結果
- 無頭 Chromium：名牌語系、新關載入、名牌三語皆 0 error（`check_bossname.js`、`check_newstage.js`）。
- **未驗證**：未真人實際打完 3-6；新關對白的語氣/節奏未人工潤飾確認；音效/音樂為需求文件，尚未製作接入。

## 待辦／接入
- 使用者用 ComfyUI 依 v2 需求產音效與新曲 → 上傳 → Claude 接線（`bgm_boss_rage` 接到 PRESSURE/最終變身；各 Boss 專屬曲接到對應關；`bgm_stage_3_6` 接新關；打擊/變身音覆蓋現有鍵）。

## 發布狀態
- A/B/C 已 commit 並比照上線（開發分支＋預設分支 `claude/fervent-ride-4h0vjm`）。D 為文件已交付。
