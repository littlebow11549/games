# 2026-11-17 勇氣超人：魔王二型態強化 + 超惡夢波 + 危機補兵 + 王倒過關

## 使用者要求（7 點）
魔王二型態防禦更硬/難度提升、絕招頻率更高、新增超惡夢波攻擊主角且施放有無敵時間；主角血快見底又無救援時小兵增多以利回血；血條不被對話框擋；王倒後直接過關。

## 完成內容（js/main.js, css/game.css）
1. **二型態更硬**：加壓(`game.pressure`)時魔王受傷 ×0.5（`damageEnemy`）。
2. **出招更頻繁**：加壓時 cd 掃描 1.25→1.7、收招時間 ×0.55、下次冷卻 ×0.5。
3. **超惡夢波 `nightmareWave`**：蓄力約 0.9s 後放三道擴張衝擊波（r=7/11.5/16）各打主角 210；加壓時加入所有魔王招式池（`bossThink`）。
4. **施放無敵**：施放全程 `e.castInvuln=true`，`damageEnemy` 對 castInvuln 回傳無傷（打不到、播 guard）；結束歸零。可靠走位閃到場邊躲。
5. **危機補兵＋回血**：`game.desperate`＝主角血<25% 且 `rescues<=0`。守關戰 `feedBossFodder` 目標+8、補兵更快；一般波次新增 `feedDesperation`；危機時擊倒小兵回血 4.5% maxHp。
6. **血條層級**：`.boss-bar{z-index:9}`，高於對話框(z-8)。
7. **王倒直接過關**：主迴圈偵測 `bossSpawned && 無存活魔王` → 清掉剩餘小兵並 `clearStage()`（含群體王 duo 需全滅、終章 incubus 死亡後進結局）。

## 測試（無頭 Chromium）
- 超惡夢波單元測試：castInvuln true→false、造成 201 傷害、正常結束、0 error。
- 王倒過關：殺王後 `victoryShown=true`、phase→`over`。
- 血條顯示、Boss 登場、0 console error。
- **未驗證**：未真人實戰調整二型態數值手感（防禦×0.5、傷害 210、補兵量為第一版）。

## 發布
已 commit 並上線（開發分支＋預設分支）。commit `c393a09`。
