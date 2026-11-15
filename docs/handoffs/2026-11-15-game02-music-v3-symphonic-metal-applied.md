# 2026-11-15 勇氣超人：套用交響金屬 BGM（v3.0 音檔到位）

## 使用者要求

使用者上傳 `BraveGuy_BGM_symphonic_metal_2026-11-15_mp3.zip`（25 首 320 kbps MP3，交響金屬／吉他搖滾風，對應 MUSIC.md v3.0 方向），要求「幫我套用看看」。

## 完成內容

- 解壓 25 首 MP3，全部覆蓋到 `02_brave_guy/assets/source/music/` 的同名檔。
- 每首以 `ffmpeg libvorbis -qscale:a 6` 轉出同名 `.ogg`（遊戲以 `.ogg` 為主音軌，不支援 OGG 的裝置才自動改讀 `.mp3`；見 `js/audio.js` 第 46–50 行）。兩種格式一起更新。
- 本批新增三首**專屬曲**，取代原本的佔位來源，並更新 `assets/manifest.json`：
  - `bgm_battle`：`bgm_campus.ogg` → `bgm_battle.ogg`
  - `bgm_victory`：`jingle_clear.ogg` → `bgm_victory.ogg`
  - `bgm_stage_3_0`：`bgm_office_mute.ogg` → `bgm_stage_3_0.ogg`
- 其餘 22 首為既有鍵的同名覆蓋，manifest 路徑不變。

## 檔案與路徑

- 音檔：`02_brave_guy/assets/source/music/*.{ogg,mp3}`（本批 25 組，含 3 個新檔名 `bgm_battle`、`bgm_victory`、`bgm_stage_3_0`）。
- 插槽表：`02_brave_guy/assets/manifest.json`（`audio` 區 3 個鍵改指向專屬曲）。

## 規格

- 來源：320 kbps CBR MP3，時長 3.2–47.0 秒。
- OGG：Vorbis VBR qscale 6（約 ~192 kbps），由 MP3 轉碼（來源僅 MP3，無無損母帶）。
- 重複檔（使用者工具輸出相同音訊）：`bgm_victory` = `jingle_clear`、`bgm_battle` = `bgm_campus`，各為同一檔內容。
- **未做母帶處理**：未重新量測 LUFS／LRA，未做無縫循環接點校正；直接套用使用者交付的音檔。

## 測試結果

- Node + 無頭 Chromium（swiftshader WebGL）載入 `02_brave_guy/index.html`：**console 0 error**；開場即請求新的 `bgm_title.ogg`。
- manifest 驗證：24 個 audio 鍵全部對應到存在的 `.ogg`＋`.mp3` 配對，無缺檔；JSON 合法。
- 轉出的 OGG 全部可被 ffprobe 正常解碼（抽驗 battle／victory／stage_3_0／title／boss／defeat／jingle_clear 皆 OK）。
- **未驗證**：未逐關實際進入戰鬥聽每首曲子；未做人耳 A／B 聽感與循環接點聽測；無真人試玩。

## 尚待完成

- 其餘音軌若要無縫循環與統一響度，仍需母帶處理（本批未做）。
- 舊佔位來源 `bgm_office`、`bgm_office_mute`、`bgm_wild`、`theme_braveguy_demo` 已無鍵引用，留作歷史檔，未刪。
- 音效 SFX 仍全缺（`manifest.sfx` 全為 null）。

## 發布狀態

- 已套用到工作目錄並本機驗證；**尚未 commit／push／部署**。分支 `claude/brave-einstein-tqlm5u`。
