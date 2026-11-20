# 2026-11-16 勇氣超人：新增 3-7 社會版假森（假忙森主管）

## 使用者要求
補上漏掉的「假森社會版」（OFFICE JIASEN／jiamang），做成一關。

## 完成內容
- 新 boss `jiamangKing`「假忙森主管」：`vis:'jiamang'`（面具西裝熊外觀，`LOOKS.jiamang` 已存在）、moves `charge/summon/slam`、minion 假忙森(jiamang) ×4、debuff `tired+confuse`、hp 5600。
- 新關 `3-7`「跨部門與甩鍋會議」（theme `openoffice`、form worker、`grant:null`），插在 3-6 與 4-1 之間，含三語對白。
- 過場 storyboard 暫沿用 `boss_kabanKing_storyboard`（辦公主題）＋甩鍋音效（`pan_fly`/`pan_hit`）；**正式專屬過場圖待補**。
- 名牌三語：Supervisor Jiamang／ジアマン主任／假忙森主管（lang_en、lang_ja 已補名稱與對白）。

## 關卡序（地圖三追加後）
… 3-5 冠老闆 → 3-6 錢經理(社會版錢大姐) → 3-7 假忙森主管(社會版假森) → 4-1 董事長室。總關卡 14→16。

## 測試
- 無頭 Chromium：進 3-7 載入 0 error、boss=jiamangKing、名牌三語切換正常（check_newstage.js）。
- rebase 合併 Codex 最新（Codex 已為 3-6 錢經理補了專屬 `brave_guy_cinematic14_boss_qianBiz_storyboard.webp`＋`brave_guy_cinematic51_victory_qianBiz.webp`，保留其版本）後再驗證 PASS。
- **未驗證**：未真人打完 3-7；對白語氣未人工潤飾。

## 待辦
- `jiamangKing` 的正式過場圖與勝利圖（目前沿用加班鬼王圖）——可併入美術需求交 GPT。
- 若要專屬 BGM，見 `brave_guy_record50_sfx_music_brief_2026-11-16.md`。

## 發布
- 已 commit 並上線（開發分支＋預設分支）。commit `a130ee9`。
