# 2026-11-16 全小怪血條與連擊最上層

- main.js：所有非魔王敵人建立頭頂血條，包含原本沒有def.bar的普通小怪。滿血也顯示，依HP/maxHp縮放；出場尚未現身、不可見、死亡或畫面外隱藏。位置使用角色高度與擊飛高度。沿用死亡／清場移除DOM。魔王保留原有大型血條。
- play.html：combo移出hud固定定位堆疊上下文，成為body直接子元素。
- system-art.css：combo固定定位z-index1100，高於世界物件、HUD、浮動特效；pointer-events:none，不擋點擊。暫停、對話、HUD隱藏時不顯示；updateHud同步限制戰鬥狀態。保留小地圖放大時的避讓與原橫式高度斷點。
- 快取版本main.js/system-art.css為20261116health。無新美術／音效／存檔變更。

驗證：tools/tests/game02-enemy-health-ui.cjs Chromium390×844，六類小怪滿血血條、受傷縮放、擊飛追蹤、死亡移除、換關清除；combo根層級／不攔截點擊、暫停隱藏及繼續恢復；無頁面錯誤。截圖人工檢視六條血條與88連擊顯示正常。git diff --check通過。

路徑：/workspace/games/02_brave_guy/js/main.js、css/system-art.css、play.html；測試tools/tests/game02-enemy-health-ui.cjs。與交接一起推送並檢查Pages部署。
