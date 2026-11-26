# 勇氣超人｜學生版與惡夢超人 3D 接入

- student: `02_brave_guy/assets/runtime/stage-art/brave_guy_charactor01_student_motion.glb`，3,039,452 bytes，SHA-256 `e951f0787d2327af344ffc4529b0c1f7cdea06d7a903c3d6e06428862d176b3d`。
- nightmare: `02_brave_guy/assets/runtime/stage-art/brave_guy_charactor03_nightmare_motion.glb`，3,516,956 bytes，SHA-256 `f15a01772e7d93d101966eec45df600848b5cd6746356549520c7191927ac9fb`。

- 來源：Tripo 原始模型，沿用已交付的 17 / 18 骨骼和右拳修正，新增對側拳、迴避、倒地等動作。裙/衣/圍巾維持原貼圖，形變資料稀疏編碼；惡夢圍巾有獨立骨骼。學生版 9 段、惡夢超人 14 段（包含未綁定的動作儲備）。
- 綁定：`student` 只替換學生型態，不取代職場凡人或勇氣變身。惡夢可玩及 1-4 惡夢 Boss 共用同一載入結果，各自建立獨立骨架、動畫播放器及材質；地獄／夢魘超人不替換。
- 效能：學生、小天使和惡夢均在實際需要的關卡或角色選擇才下載；未成功讀取維持既有佔位角色。角色數值、碰撞、Boss 招式、命中幀、介面和玩家存檔未改。
- 驗證：重新讀取兩個 GLB 確認骨骼、動作及形變通道，對照分格圖檢查。Chrome 本機 H5 實測學生版在 1-1 跑步、普攻、閃避；惡夢版進 1-4、操作普攻、閃避和技能，確認同一場出現可玩與 Boss 的 3D 模型，並檢查 390×844 手機尺寸。未做全十四關回歸，未實測實體手機效能。
- 快取版號：`20261126duorig`。要回退可將 manifest 的 `student`、`nightmare` 設為 `null`；小天使槽保留。
