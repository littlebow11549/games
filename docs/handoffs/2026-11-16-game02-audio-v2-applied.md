# 2026-11-16 勇氣超人：套用音效/音樂 v2 + 社會版假森音樂需求

## 使用者要求
1. 上傳 `BraveGuy_SFX_Music_v2` zip（72 音效 + 13 音樂），套用。
2. 新假森(3-7)也要新音樂，開需求。

## 完成內容

### A. 套用音效/音樂 v2（commit 72246d4）
- **72 音效**覆蓋 `assets/source/sfx/`（新版 KOF 打擊感、寶石般變身等）；`beam_loop` 改指 `.mp3`（SFX 走 WebAudio 解碼緩衝，mp3 循環無縫）。
- **13 音樂**複製並轉同名 `.ogg`（主）＋ `.mp3`（後備）：
  - 10 首各 Boss 專屬曲 `bgm_boss_{folaidiKing,qian,qianBiz,lan,midKing,kabanKing,duo,lanMgr,ganqiaoFull,guan}`
  - `bgm_boss_rage`（二段/加壓狂暴曲）
  - `bgm_stage_1_1`（原與校園共用，改專屬）、`bgm_stage_3_6`（新關 3-6）
- **manifest**：新增上述 12 鍵、改接 `bgm_stage_1_1`、`beam_loop`→mp3（共 36 音訊鍵）。
- **接線（js/main.js）**：
  - 守關者登場：優先播 `bgm_boss_<stage().boss>`，無專屬則通用 `bgm_boss`。
  - 久戰 45 秒 PRESSURE 加壓：切 `bgm_boss_rage`。
- 規格（來源 json）：音樂 128k、約 −13.4 LUFS、TP ≤ −1、標註 loop 長度。
- 測試：無頭 Chromium 0 error；36 音訊鍵全載入；10 Boss 曲＋rage＋3_6＋1_1 皆在；jiamangKing 無專屬曲正確回退。

### B. 社會版假森音樂需求（文件，commit b39047a）
- `assets/source/SFX_MUSIC_BRIEF_jiamang_2026-11-16.md`：請補 `bgm_stage_3_7`（3-7 關卡曲）與 `bgm_boss_jiamangKing`（假忙森主管守關者曲），附英文提示詞。已交付使用者。
- 現況 3-7 關卡用通用 `bgm_battle`、Boss 用通用 `bgm_boss` 暫代；補曲上傳後 Claude 接線（檔名對即自動生效）。

## 待辦
- 使用者產 `bgm_stage_3_7`、`bgm_boss_jiamangKing` → 上傳 → Claude 接線。
- `jiamangKing` 正式過場圖/勝利圖（目前沿用加班鬼王圖）。

## 發布
- A/B 已 commit 並上線（開發分支＋預設分支）。commit `72246d4`、`b39047a`。
