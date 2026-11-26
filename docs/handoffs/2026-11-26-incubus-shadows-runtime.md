# 勇氣超人｜4-1 夢魘超人雙型態與人物腳下陰影

- 4-1 董事長室開始為深色西裝、綠領帶；三招破盾且打到 60% 門檻後，沿用原有首擊與最終昇華過場，回戰鬥切成黑紫戰甲與長綠圍巾。沿用原本同一敵人、血量、破防紀錄、位置、方向與外觀倍率。保留原施放時機與傷害，兩套模型只在終章載入。缺少戰甲資產時保留初始外觀與原本放大效果。
- 兩套各 17 段動作，包含台詞手勢、三連段、浮游砲、衝拳、衝擊波、覺醒與倒地；衣袖、肩膀使用動態修正，戰甲圍巾另有骨架動畫。來源均為 BraveGuy_22_Additional_Rigs_v01.zip 內的 GLB/incubus_rig.glb、GLB/incubus_final_rig.glb，保留原模型網格與材質，未追加 Tripo 點數。重製：python tools/make_game02_incubus_motion.py --rig-zip <zip> --output <dir>。
- 找出舊版連擊與反擊倍率在 10% 血量鎖後執行，可能直接擊倒魔王並跳過收尾。改在計算完倍率後再保護 60% 與 10% 門檻。
- 人物腳下陰影：原版低畫質停用即時投影；主角、跟班和 Boss 無備用腳底影。新版本把腳底柔影集中為一個實例批次，支援角色、跟班、一般敵人與 Boss，隨人物移動、換裝並留在地面。低畫質不重開即時投影。
- 驗證：Chrome H5 4-1 低畫質載入西裝、三招破盾、60% 兩段過場、戰甲沿用敵人、反擊無法跳過 10%、勇氣滿後靠近擊倒。另以 390 × 844 的瀏覽器檢查低畫質 1-1 的主角及跟班柔影；未用 iOS 實機。測試：game02-actor-shadows.cjs、game02-incubus-motion.cjs 與 5 項角色動作回歸。臨時驗證頁不進 Git。

| 部署 GLB（02_brave_guy/assets/runtime/stage-art/） | 大小 | SHA-256 |
| --- | ---: | --- |
| brave_guy_charactor26_incubus_motion.glb | 1,938,596 B | 8dca2021333aeb8d0be9c311997495a76198a2e8dd700f0855354de85a011c38 |
| brave_guy_charactor26_incubus_final_motion.glb | 1,920,584 B | c8921c1967499ec7384e71c974fe2006346ed01617491e8191ae9ae1727d7106 |

- 正式入口：02_brave_guy/play.html?v=20261126incubus。回退整批可用 Git revert；若只移除夢魘模型，可回退 manifest 的兩個新模型條目而保留血量與陰影修正。
