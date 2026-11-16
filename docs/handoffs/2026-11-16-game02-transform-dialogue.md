# 2026-11-16 首次變身口號與小天使吐槽

## 對白

- 主角在發光剪影中喊「勇氣寶石力量～美少⋯不對，勇氣美少年⋯不對⋯是勇氣超人～～～」。
- 小天使在下一幕舉牌時回「喊錯兩次還敢拖長音。你全身上下就那張嘴最有勇氣。」

## 檔案

- `02_brave_guy/js/story.js` 的 `FIRST_TRANSFORM` 供首次戰鬥變身和主選單「重播變身」共用。`02_brave_guy/SCRIPT.md` 同步台詞 1042、1043。
- 繁體中文、英文與日文共用同一組對白鍵。`02_brave_guy/js/lang_en.js`、`02_brave_guy/js/lang_ja.js` 更新翻譯，入口、語系模組與其呼叫處採用同一版載入路徑。
- 用 `tools/make_game02_fonts.py` 更新 `02_brave_guy/assets/fonts/` 中的三個 WOFF2 字型子集。檢查粉圓體涵蓋新中文及英文對白，日文字型涵蓋新日文對白。

## 驗證與發布

- JavaScript 語法及 `git diff --check` 通過。檢查了兩句的標點、說話者、分鏡順序、三語對白、共用重播入口和字型字元覆蓋。
- GitHub Pages 由預設分支自動發布。發布狀態請查本提交的 Pages 工作流程。
