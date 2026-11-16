# 2026-11-16 鎖定出手追蹤與最近替代目標

## 問題與修正
- 普攻及氣功彈只在起手時瞄準，前搖期間目標位移／死亡會沿用舊方向。main.js新增trackAttackLock，在普攻命中前與氣功彈發射前重新瞄準有效鎖定。
- 普攻／衝拳移動前刷新方向，限制移動距離不穿過目標身體，沿用moveHeroBy牆體判定；無鎖定時保留原輸入方向。
- 鎖定走位保持朝向敵人；閃避仍依移動方向。鎖定超勇氣波直接追蹤目標方向，不再因轉速上限持續落後；無鎖定保留轉速。
- targeting.js換目標改每次最近替代者，停止沿排序往遠處循環：首次手動選最近，後續排除目前手動目標後取最近。方向輸入亦排除目前手動目標，只選方向錐內最近者；無候選保留有效目標並提示。Shift+Y同樣最近優先。
- play.html/main.js模組版本20261116aim。無素材修改。

## 驗證
- tools/tests/game02-aim-tracking.cjs：受控Chromium實戰傷害測試（非只比對yaw）：前搖位移仍命中、死亡換鎖後命中、近距離不穿越、氣功彈發射方向；第一次最近、最近替代者、第三次回最近而非最遠、敵人移位即重新排序。
- targeting.test.mjs六項通過；target-switch與combat-rewards瀏覽器回歸涵蓋觸控、鍵盤、搖桿、死亡轉鎖及連擊。
- 未做真人全關通關，不宣稱涵蓋所有遮擋／動畫狀態。

## 路徑與發布
/workspace/games/02_brave_guy/js/main.js、js/targeting.js、play.html；測試於tools/tests及02_brave_guy/tools。與交接一併推送預設分支，檢查Pages部署。
