# 2026-11-17 勇氣超人 New Game+ 輪迴系統（Claude）

## 需求
玩家第一次破關後重玩：仍可選難度，但標示重破幾輪；顯示「你已經第 N 次去尋找勇氣」，超過第三次顯示「你已經天下無敵了」；每破一輪難度與怪量再加，最多 +3 階；到頂後永遠是勇氣超人無雙開掛模式（怪量、攻擊頻率、難度全最高）。

### 修正需求（第二輪回饋）
1. **原機制有漏洞**：破關後從序章起點可直接進選關跳打最終話，重複 3 次就刷到天下無敵 → 不合理。
2. **重玩必須所有進度歸零**。
3. **第一次過關時最後跳出的選單要給兩個選擇**：
   - 「從序章開始重玩」→ 進度歸零 → 開始計算玩家第幾刷。
   - 「直接選關」→ 玩家自由挑戰任意關卡 → 顯示「你已經第 1 次去尋找勇氣」。
4. 輪迴標示 badge 要**置中、左右滿寬**。
5. 下方小天使毒舌跑馬燈加提示：多找幾次勇氣說不定你就會天下無敵。

## 實作

### 一刷的計數（防刷）
- `save` 新增 `freshRun` 旗標。只有「**第一次破關**」或「**從序章重玩的那一輪**」破到最終話才 `save.rounds++`：
  ```js
  if (result.last) {
    if (save.rounds === 0 || save.freshRun) save.rounds++;
    save.freshRun = false; writeSave();
    playEnding(...);
  }
  ```
- 因此在「直接選關」自由挑戰模式下重打最終話**不會**增加輪數，無法再刷。

### 破關結算選單（兩個選擇）
- 主按鈕＝「從序章開始重玩（進度歸零）」→ `restartJourney()`：`save.cleared=[]`、`save.freshRun=true`、`runs.reset()`、`startStage(0)`。
- ghost 鈕「選關」在 ending 結算時顯示為「直接選關」，點了直接進選關（`menuView='stages'`），進度保留、自由挑戰、不計刷。

### 重玩進度歸零
- `restartJourney()` 清空 `save.cleared`，`isOpen`/`stageAbilities` 回到逐關解鎖，必須重新打上來才會到最終話，杜絕跳關刷輪。
- 主選單全破後主按鈕也改成「從序章開始重玩」（取代原本「繼續 4-1」），同樣走 `restartJourney()`。

### 輪迴強度（最多 +3，之後封頂）
```js
const roundTier  = () => Math.min(save.rounds||0, 3);   // 0..3 封頂
const roundCrowd = () => 1 + roundTier()*0.5;           // 怪量 ×1→×2.5
const roundRush  = () => 1 + roundTier()*0.3;           // boss 出招冷卻加速
const godMode    = () => (save.rounds||0) > 3;           // 天下無敵
```
- 套用：波次生怪量、場上上限 `cap`、boss 補兵 `feedBossFodder` ×`roundCrowd()`；boss 技能 `cds`/`cool` tick ×`roundRush()`。

### 天下無敵（godMode，第 4 輪起）
- 勇氣槽不再流失（永久勇氣超人開掛）。
- `stageAbilities`/`isOpen` 在 godMode 下全招式解鎖、全關卡可選（即使從序章重玩也維持開掛）。
- `roundTier` 封頂 3 ＝怪量／攻擊頻率／難度最高級。

### 輪迴標示 badge
- `showMenu` 設 `#round-badge`：1~3 輪「你已經第 N 次去尋找勇氣」；>3「你已經天下無敵了」（金色流光）。
- **版面**：主選單是固定 portrait 單屏 grid（`menu-layout.css`）。badge 原本沒有 grid-area 落到底部窄格；改用 `:has(#round-badge:not([hidden]))` 僅在顯示時撐出第 7 列並相應壓低美術高度，badge `grid-area:7/1/8/3`、滿寬置中。**只有已破關玩家受影響**，一般玩家版面不變。
- 修掉 `.round-badge{display:block}` 蓋過 UA `[hidden]` 的問題（補 `.round-badge[hidden]{display:none}`），避免 rounds=0 時誤顯示。

### 小天使跑馬燈提示
- 1~3 輪時在跑馬燈加一句：「多找幾次勇氣，說不定你就會天下無敵唷，你這個小嫩逼。」三語。

### 字型
- 新字含「嫩」等 → 重跑 `tools/make_game02_fonts.py`（1958→1974 字），huninn/TC/JP subset 重生；`@font-face` 的 `?v=` 一併更新為 `20261117rounds` 以抓新 subset。

## 驗證（headless, play.html）
- badge：rounds 0 隱藏、2「第 2 次」、3「第 3 次」、5「天下無敵」+god class；0 error。
- 全破主按鈕＝「從序章開始重玩」；未全破＝「繼續…」。
- godMode：cleared=[] 時全 16 關解鎖；非 god cleared=[] 僅第 1 關。
- 點「從序章開始重玩」後：`cleared=0`、`freshRun=true`、進入 stage 0。
- 1~3 輪跑馬燈含輪迴提示。
- badge 版面：rounds=0 `display:none`；rounds≥1 寬 394/430 置中滿寬。
- zh/en/ja 三語字串與版面皆正常、無溢出。

## 快取
全站 `?v=`：`20261117incubus`→`20261117rounds`（play.html + js/*）；CSS `game.css`/`system-art.css`/`menu-layout.css` 及 `@font-face`、字型 preload 同步 `20261117rounds`。

## 相關檔案
`js/main.js`、`play.html`、`css/game.css`、`css/menu-layout.css`、`js/lang_en.js`、`js/lang_ja.js`、`assets/fonts/*subset.woff2`
