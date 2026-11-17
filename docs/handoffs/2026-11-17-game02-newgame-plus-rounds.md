# 2026-11-17 勇氣超人 New Game+ 輪迴系統（Claude）

## 需求
玩家第一次破關後重玩時：
- 仍可選難度，但要標示玩家已重破幾輪。
- 顯示「你已經第 N 次去尋找勇氣」。
- 超過第三次後顯示「你已經天下無敵了」。
- 每破一輪，難度與怪物數量再往上加，最多再加三個階段。
- 到頂之後就一直是勇氣超人過關的無雙開掛模式；怪物數量、攻擊頻率、難度全部最高級。

## 實作

### 進度存檔
- `save` 新增 `rounds: 0`。通關最終關（`continueVictory` 的 `result.last`）時 `save.rounds++` 後 `writeSave()`，再播結局。
- 讀檔沿用既有相容處理（舊檔無 `rounds` 時以 0 起算）。

### 輪迴階級（最多 +3，之後鎖頂）
於 `main.js` 定義輔助：
```js
const roundTier  = () => Math.min(save.rounds || 0, 3); // 0..3，封頂
const roundCrowd = () => 1 + roundTier() * 0.5;         // 怪量 ×1 → ×2.5
const roundRush  = () => 1 + roundTier() * 0.3;         // boss 出招冷卻加速 ×1 → ×1.9
const godMode    = () => (save.rounds || 0) > 3;        // 第 4 輪起進入天下無敵
```

### 數值加成（疊在既有品質 Q() / 難度 D() 之上）
- 波次生怪量：`× roundCrowd()`。
- 場上同屏上限 `cap`：`× roundCrowd()`。
- Boss 補兵 `feedBossFodder` 基底：`× roundCrowd()`。
- Boss 技能冷卻 `cds` / `cool` tick：`× roundRush()`（與加壓、覺醒加速相乘），出招更頻繁。

### 天下無敵（godMode，第 4 輪起）
- 勇氣槽不再自然流失（`if (hero.mode==='burst') ... else if (!godMode()) hero.courage -= drain`），永遠維持勇氣超人開掛狀態。
- 此時 `roundTier` 已封頂 = 3，怪量、攻擊頻率、難度皆為最高級。

### 主選單標示
`showMenu()` 設定 `#round-badge`：
- `rounds < 1`：隱藏。
- `1 ≤ rounds ≤ 3`：`你已經第 {N} 次去尋找勇氣`。
- `rounds > 3`：`你已經天下無敵了`，並加 `.god` class（金色流光動畫）。

### 版面 / 樣式 / 語言
- `play.html`：`menu-logo-fx` 後加 `<div id="round-badge" class="round-badge" hidden></div>`。
- `css/game.css`：`.round-badge`、`.round-badge.god`、`@keyframes godShift`。
- `lang_en.js` / `lang_ja.js`：
  - 「你已經天下無敵了」→ `You are UNSTOPPABLE now.` / `もう無敵だ。`
  - 「你已經第 {0} 次去尋找勇氣」→ `You've sought courage {0} time(s).` / `勇気を探しに行くのは {0} 回目。`

## 驗證
- Headless（play.html + iframe `__game`）設 `save.rounds` = 0/2/3/5：
  - `rounds=0` → badge 隱藏。
  - `rounds=2` → 「你已經第 2 次去尋找勇氣」。
  - `rounds=3` → 「你已經第 3 次去尋找勇氣」。
  - `rounds=5` → 「你已經天下無敵了」+ `.god`。
  - 全程 0 console error。
- `node --check` 全數通過。

## 快取
全站 `?v=` 由 `20261117incubus` → `20261117rounds`（play.html + js/*）。

## 相關檔案
`js/main.js`、`play.html`、`css/game.css`、`js/lang_en.js`、`js/lang_ja.js`
