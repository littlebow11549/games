# 2026-11-17 勇氣超人：董事長第一階段過場 + 走上前門檻 + 超惡夢波機率

## 使用者要求
- 原本過場都不變；董事長(incubus)第一階段打完時，新增用使用者提供圖的過場，做法同 Codex 的 storyboard 系統。
- 保留原本「走上前」收尾，但血條要剩 1/10 以下才觸發(原本剩 3 成就觸發、還有一大格)。
- 超惡夢波維持(二段本來就會用)，boss 快死時提高觸發機率。
- （另修：Boss 登場瞬間自己過關的 bug，已於 9b940d7 修。）

## 完成內容
- **新過場 `incubus_firststrike`**：使用者圖(1024×1536 三格)存入 `source/pic/cinematics/`，轉 runtime webp(q90, 499KB)，加入 `runtime-images.json`。`cinematics.js` 新增 `FIRSTSTRIKE_SHOTS`＋`firstStrike()`＋render 分支(mode 'firststrike')＋匯出；`startAwakening` 改成先播 `firstStrike` 再接原本 `awakening`(原過場不動)。
- **走上前門檻**：`damageEnemy` 夾制與 `startFinalPhase` 觸發由 `maxHp*0.3` 改 `maxHp*0.1`(剩一成血才進入收尾)。
- **超惡夢波機率**：`bossThink` 在加壓且 `hp<=maxHp*0.25` 時，招式池多加兩份 `nightmareWave` 提高抽中率。

## 測試(無頭)
- 進 4-1、生董事長、觸發 `startAwakening`：首過場 mode=`firststrike`、`brave_guy_cinematic24_incubus_firststrike.webp` 載入、跳過後接 mode=`awakening`、0 error。
- **未驗證**：未真人實戰確認門檻手感與過場演出整體觀感。

## 發布
已 commit 並上線。commit `f4ec6cc`(本次)、`9b940d7`(登場bug)。
