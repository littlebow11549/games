# 全16張角色合輯頁首精準統一

2026-11-14 APHASEN／Codex。使用者明確核准改用程式合成，要求左上Logo圖樣及位置一致。

## 交付與規格

- 16張PNG：02_brave_guy/assets/source/pic/sheet/unified/sheet_{id}.png。包含原5張及新11張角色；幹譙龍仍三型態同張。
- 同一核准logo_01_review_v1.png，只做一次等比縮小至156×104，重用同一像素資料；每張固定座標(48,12)。頁首128px，標題字型、分隔線、中英文角色名稱位置統一。
- 全部1728×1152 RGBA PNG，3:2。以增加畫布保留角色原生像素，沒有放大角色或宣稱增加細節。舊稿未覆蓋。
- 可重製腳本：02_brave_guy/tools/unify_sheet_headers.py。使用Pillow，這次已有使用者明確核准程式編修。
- 查核紀錄：assets/source/UNIFIED_SHEET_HEADERS.json。審稿頁：assets/preview/unified-character-review.html；16張總覽：assets/preview/unified-sheet-contact.png（僅預覽縮圖）。

## 驗證

16張左上250×120區域SHA-256完全相同，包含Logo及其留白。16張保留內容區與來源逐像素一致。逐張總覽檢查頁首對齊、舊Logo殘留及遮擋；地獄超人的切線已調整，以保留轉面區標籤，並另以全尺寸檢查。沒有修改遊戲runtime。

此輪只解決頁首統一，不宣稱角色內頁全部通過。qian定位文字與7格細節、lan刻度、hell/incubus比例、身高比較角色及其餘內頁版式缺陷，仍依前一批交接待修。3D及其他缺件亦未完成。

前次推送因Logo不一致被自動審核拒絕。此輪已完成該問題修正，將以修正後的提交重新推送；推送狀態以工具實際回應為準。
