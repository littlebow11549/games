# 🎮 Games

純前端小遊戲合集，每款一個獨立資料夾。根目錄 `index.html` 是遊戲選單首頁。

## 命名規則
`編號_遊戲名稱`（兩位數編號遞增，英文小寫）：`01_memory_crash`、`02_...`

| 編號 | 遊戲 | 資料夾 | 狀態 |
|------|------|--------|------|
| 01 | Memory Crash | `01_memory_crash/` | 🟢 可玩 |

## 部署（GitHub Pages）
Settings → Pages → Deploy from a branch → `claude/fervent-ride-4h0vjm` / root → Save

- 首頁：`https://littlebow11549.github.io/games/`
- 遊戲：`https://littlebow11549.github.io/games/01_memory_crash/`

## 新增遊戲
建資料夾 `NN_name/`（內含 `index.html`），再到根目錄 `index.html` 的 `GAMES` 陣列加一筆。

> 各遊戲資料夾內有 `README.md`（說明）、`PROGRESS.md`（進度）、`assets/ASSET_SPEC.md`（素材規格與提示詞）。
