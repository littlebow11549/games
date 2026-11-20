# 2026-11-16 勇氣超人：中文字型子集補齊 + 超勇氣波命中音

## 使用者要求
1. 檢查中文字型是否跑掉（截圖「財務部」的「務」是 fallback 字型）。
2. 超勇氣波打到怪物的音效太爛，換一個（要像 KOF）。

## 完成內容

### A. 字型跑掉修正
- 根因：`tools/make_game02_fonts.py` 只掃 `js/*.js`、`index.html`、`SCRIPT.md`，**漏掃 `play.html`**（Codex 把遊戲移到 play.html 後未更新）；且上次子集是 11-15，我 11-16 新增的文字（新關名、對白、按鈕）不在子集 → fallback。
- 修法：工具加掃 `play.html`；下載原始字型（粉圓/NotoSansTC/NotoSansJP，SIL OFL）重跑子集。
- 結果：三語字型（`huninn`/`notosanstc-black`/`notosansjp`）重生，涵蓋 1958 字（原約 1450）。驗證「財務部與年終帳／錢經理／假忙森主管／甩鍋／清除所有進度／跨部門會議」與日文「銭マネージャー／経理部／ジアマン主任／全進捗を消去」等**全部在 cmap 內，不再 fallback**。

### B. 超勇氣波命中音
- 根因：ult 光束每 0.1s tick 都呼叫 `lineStrike → tally`，每 tick 播一次拳擊 `hit` 音並頓幀；2.3 秒內約 23 記重拳疊起來＝吵雜、卡頓。
- 修法：`tally(results, heavy, quiet)` 加 `quiet`；ult 的 `lineStrike` 傳 `quiet:true`（不逐 tick 播拳擊音、不每 tick 頓幀）。持續聲由既有 `bgm... beam_loop` 擔當；新增 `sfx_beam_hit`（能量 zap，合成，true peak −2.2 dBTP、0 削波、零破音），命中時**每 0.18 秒節流播一次**。

## 檔案
- `tools/make_game02_fonts.py`（加掃 play.html）、`02_brave_guy/assets/fonts/*.woff2`（三檔重生）
- `02_brave_guy/js/main.js`（tally quiet、ult tick）、`assets/manifest.json`（beam_hit）、`assets/source/sfx/brave_guy_sfx05_beam_hit.wav`（新）

## 測試
- 字型：cmap 覆蓋驗證全過。
- 音效：true peak/削波自檢通過；無頭載入 0 error。
- **未驗證**：未實機逐頁目視每個中文畫面；beam 命中音的實際聽感待使用者確認。

## 發布
- 已 commit 並上線（開發分支＋預設分支）。commit `631eccf`。
- 字型重跑需原始字型（不在 repo），下載網址在 `make_game02_fonts.py` 開頭；**日後新增文字要再重跑一次**。
