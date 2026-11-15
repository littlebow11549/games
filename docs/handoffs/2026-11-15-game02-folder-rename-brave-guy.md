# 2026-11-15 勇氣超人：資料夾改名 02_xianxia_battle → 02_brave_guy（Claude）

## 背景
`02_xianxia_battle`（仙俠對戰）是專案最早期的代號，後來遊戲定名為《勇氣超人 Brave Guy》，但資料夾名一直沒跟著改，造成資料夾名與遊戲名對不上。使用者要求改名。

## 變更
- `git mv 02_xianxia_battle 02_brave_guy`（整個遊戲資料夾，Git 全部辨識為 rename，歷史保留）。
- 全 repo 取代路徑字串 `02_xianxia_battle` → `02_brave_guy`，共 52 個檔案，涵蓋：
  - **活引用**：`assets/js/hub.js`（hub 遊戲卡連結與 icon 路徑）、`README.md`、`tools/check_hub.cjs`、`tools/make_game02_fonts.py`、遊戲內 `tools/`、`assets/*.md`、`assets/source/*.json` 等。
  - **歷史交接報告**：`docs/handoffs/*.md`、`docs/HANDOFF.md` 內所有路徑引用一併更新，保持全 repo 連結可點、路徑一致。

## 影響
- **GitHub Pages 網址路徑改變**：遊戲由 `.../02_xianxia_battle/` 變為 `.../02_brave_guy/`。舊網址將失效（專案尚未正式發布，無對外連結衝擊）。
- 遊戲內部全為相對路徑，資料夾搬移後照常運作。

## 驗證（Playwright headless，軟體 WebGL）
- HUB 卡片連結 → `02_brave_guy/`（check_hub 斷言的路徑同步更新）。
- 遊戲載入 `http://localhost:8099/02_brave_guy/`：`window.__game` 就緒 = true。
- 載入後 console error 數 = 0（icon／資源無 404）。

## 待辦（不受本次影響）
- 音樂 v3.0 吉他搖滾／金屬尚未產出（見 `2026-11-15-game02-music-v3-rock.md`）。
- 尚未提交 PR／部署前，請先確認改名後線上版正常。
