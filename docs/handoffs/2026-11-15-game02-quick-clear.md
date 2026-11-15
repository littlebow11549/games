# 右上角一鍵過關檢視按鈕

- 使用者要求暫時提供一鍵過關以檢查效果。遊戲右上音量／暫停鍵下新增金色「一鍵過關」，英文 Clear stage、日文 即クリア；小地圖下移避免遮擋。
- 僅戰鬥期間顯示；暫停、對話、過場與結算時隱藏，事件處理亦檢查狀態。點擊停止現有超勇氣波並呼叫原 clearStage，正常保存通關、播放勝利音樂和顯示成績。最後一關按繼續後進結局／Staff。
- 變更：02_brave_guy/index.html、js/main.js、css/game.css；無新美術或音訊。HTML 更新 main/CSS 快取版本。
- Playwright Chromium 390×844 實際點擊驗證：三語標籤、按鈕與小地圖無重疊、一般關與最終關勝利、最後一關繼續接結局、0 JS errors。臨時驗證腳本 /workspace/scratch/check-quick-clear.cjs，非正式產品檔。
- 此為使用者要求的臨時效果檢視功能，公開頁面可使用且會保存通關進度；日後要求移除時，刪除 btn-quick-clear HTML、更新/點擊程式及 CSS 末尾對應區塊即可。
- 本次需求完成；隨本次 PR 合併發布，發布狀態見 PR 與 Pages workflow。既有待追溯美術不動。
