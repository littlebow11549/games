# 2026-11-14 勇氣超人：非戰鬥曲全數接上、主角頭像接入（Claude）

## 使用者要求

「音樂素材進來了」「美術好像也有新的請查閱」。

## 收到什麼

- 音樂：`claude/brave-guy-music` 第三批 7 首（`bgm_title`、`bgm_transform`、`bgm_defeat`、`bgm_talk`、`bgm_ending`、`bgm_credits`、`bgm_stage_3_1`），manifest 的 BGM 鍵已全部填滿。見 [音樂階段的報告](2026-11-14-game02-music-nonbattle-final.md)。
- 美術：查過所有分支，**沒有比上次更新的美術提交**。repo 裡尚未接入的是 Codex 當天稍早交的 HUD 素材（見 [HUD 報告](2026-11-14-game02-hud-core.md)）。

## 做了什麼

### 音樂（`js/main.js`、`js/audio.js`）

| 時機 | 播放 |
| --- | --- |
| 標題／選關畫面 | `bgm_title`。瀏覽器要等第一次點擊才准出聲，所以進站後第一次點任何地方才會開始 |
| 每關開場對話 | `bgm_talk`，講完（或跳過）才進該關戰鬥曲 |
| 第一次變身演出 | `bgm_transform`（原本就接好，現在有檔案了） |
| 倒下 | `bgm_defeat`（取代合成音效） |
| 4-1 過關後的和解對話 | `bgm_ending`（不播過關號角） |
| 結局畫面「醒來」 | `bgm_credits`（遊戲還沒有製作名單畫面，暫時放這裡） |
| 3-1 | 改用專屬的 `bgm_stage_3_1` |

`bgm_ending`、`bgm_credits` 設為不循環。

### 頭像（`css/game.css`）

- 左上角頭像改用 `portrait_student.png`、`portrait_brave.png`。網頁用衍生檔 `assets/runtime/pic/ui/portrait_{student,brave}.webp`（256×256 無損 WebP、保留透明，由來源縮小；來源未動）。
- 上班族型態沒有頭像圖（角色未定案），暫時沿用大學生的。
- 順手修正計量條上「勇氣」「罪惡感」的字被條的高度裁掉。

### 還沒接的美術

- `hud_core_sheet.png`（頭像框、計量條外框與四色填充、氣環）：八個部件畫在同一張圖上，彼此的光暈互相重疊，交付報告也註明裁切框只是目視估計。直接切會帶到隔壁的光，需要逐件去光暈或請 Codex 改交單件透明圖，這次沒接。
- `guilt_explode_sheet.png`（罪惡感爆炸 8 格）：尚未接。
- `banner_01.png`、5 張角色合輯、15 張 3D 參考圖：未接。

## 測試

無頭瀏覽器：標題→首次點擊後開始播放、開場對話→戰鬥曲、倒下、回選關、4-1 過關對話→結局畫面，各時機的曲目正確；所有音檔與頭像皆載入、無錯誤；14 關腳本通關與觸控流程回歸通過；頭像與計量條截圖目視確認。**實際聽感未驗證。** 快取版本號 `20261114d`。
