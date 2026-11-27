# 2026-11-27｜可玩角色對話框重設

## 用途與範圍

- 玩家角色的場上普通台詞泡泡改用新漫畫外框：圓角奶油底、深色墨線、角色色下緣、菱形記號與指向角色的小尾巴。勇氣超人為黃綠、小天使為粉色、惡夢超人為淡紫。
- 劇情底欄改用同系列設計，依說話角色切換名牌與飾色，將正文、跳過與繼續指示清楚分區。旁白維持沒有角色名，賓果卡、變身插圖仍依原事件顯示。
- 不換角色頭像、不新增點陣素材，也不更動台詞、翻譯、計時、擺位、按鍵邏輯、頭目／小怪泡泡或招式標題。

## 檔案

- `02_brave_guy/css/character-art.css`：新版劇情底欄與限定 `.taunt.hero.character-speech:not(.has-word-art)` 的場上普通泡泡。
- `tools/tests/game02-player-dialogue.cjs`：真實遊戲入口 Chrome 測試，使用本機隔離測試瀏覽器的瀏覽器開發者介面。
- 由整合者在 `play.html` 更新 `character-art.css` 單獨快取版本，再與同批修正一起確認。

## 實測

- APHASEN，本機 `play.html`，Chrome 桌面 1280×720、模擬手機直式 390×844、橫式 844×390，各跑勇氣超人、小天使、惡夢超人。九組確認劇情底欄正文與角色標籤、Enter 下一句、點「跳過」回到戰鬥，再從遊戲正常台詞流程觸發各自泡泡，確認角色配色、可見尾巴與畫面邊界。
- 確認敵方普通台詞維持原貼圖，標題類別不被加上新版泡泡尾巴。未見 JavaScript 例外。已目視檢查桌面及手機模擬實戰畫面。
- 本項未測實體 iPhone/Safari，未部署，視覺方向待用戶確認。
- 重現：於 repo 根目錄執行 `python -m http.server 8817 --bind 127.0.0.1`，另開終端執行 `node tools/tests/game02-player-dialogue.cjs`；可設 `CHROMIUM`、`BRAVE_URL`，或以 `BRAVE_SHOT_DIR` 將截圖存到 repo 外。
