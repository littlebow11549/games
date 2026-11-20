# 漫畫三語圖集通過驗收與正式套用

使用者明確說「過。請套用吧」。三張1536×1024 PNG由備案移入02_brave_guy/assets/source/pic/titles，以brave_guy_dialogueNN_角色_對話招式圖集01.png命名；同名WebP在runtime/lossless/pic/titles，逐像素RGBA一致。舊SVG移入備案，未刪除。

四列Q/E/R/F × 三語（繁中／英文／日文），第五列一般／喊話／救援底框。已接入角色招式與戰場對話／救援。動態文字保持語系切換；未新增每句話獨立檔。惡夢圖格位使用原生矩形對照，避免鄰列邊線混入；原圖沒有裁切重編碼。

來源、尺寸、SHA、驗收狀態、取圖矩形集中character-art.json。生成工具跳過已認可的raster母檔，不可再用舊SVG產生器覆寫。索引、inventory及proposals來源記錄同步。

驗證：全部source/runtime無損像素通過，36個三語標籤、圖片解碼、手機與桌面測試無HTTP/JS錯誤。以實際遊戲CSS渲染新圖對照預覽。既有其他敵人與大型面板未全面重製；不得將局部接入冒稱全站完成。

發布：提交並推送；Pages部署完成時間另查。
