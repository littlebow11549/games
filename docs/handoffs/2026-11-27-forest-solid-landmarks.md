# 2026-11-27｜2-1 黑森林實體 3D 地標

- 正式入口：`02_brave_guy/play.html?v=20261127forest`。把兩張重複的面向鏡頭地標改成不同的立體造型：左側木樁燈屋與胖蘑菇、右側有苔石和月光晶石的小庭園。沿用原黑森林的既有設計與冷綠分級，另保留手繪地面、背景樹林及動畫霧／螢火蟲，不替換其他關卡。
- 來源與再製：`02_brave_guy/js/stage-art/forest-landmarks.js` 的程序建模，使用既有 `story-quality-kit.js` 的真實網格與共用卡通材質。兩組合計最多 16 個實例繪製批次，不新增貼圖、模型下載或 Tripo 開支。2-1 不再預載專供舊地標的圖集；其餘關卡按原需求預載。
- 兩座裝飾包括冠幅都落在不可通行格；不改碰撞、迷宮資料、出生、Boss、出口、雷達路徑或戰鬥。若地標碰到鏡頭與角色的視線，暫時隱藏該組；移出視線後恢復。舊場景資料與素材保留。
- 驗證：`node tools/tests/game02-forest-landmarks.cjs` 驗真實深度、實例批次、完整邊界、視線遮擋／恢復、路線不變與物件釋放。Chrome 實際 2-1 H5 以桌面及 390×844 檢查兩組地標與原生導航；測到霧位置會更新，螢火蟲仍存在。直式進關時地標位於畫面兩側，靠近左右路緣才完整看到。2-2 實測仍有兩張原插畫，沒套用森林地標。未做 iOS 實機幀率。
- 截圖：`BraveGuy_Forest_Desktop.jpg`（Library `libfile_fde3_f-a0f3dcef605c8191952dcfa22c79e566_6454ceefff44819188aebf485c028f29`）與 `BraveGuy_Forest_Portrait.jpg`（Library `libfile_fde3_f-5b12dde46f04819186552e19dc77dc59_6454ceefff44819188aebf485c028f29`）。兩張均為遊戲畫面，本機 QA 驗證頁不入庫。
- 回退：Git revert 本批提交。原圖 atlas 與製作路徑未刪。
