# 記憶水晶 Banner 巴哥與遊戲 Icon 放大

- Banner 右側加入現有太空巴哥全身待機圖集第一格，桌面320px、手機235px、小手機210px，保持 Logo／CTA 共用位置與輪播。
- 直接 CSS 顯示 `01_memory_crash/assets/runtime/pic/batch3/pug_idle_full.webp`（1774×887 RGBA，4×2），無生成、裁切或改寫圖片檔案；分類為既有角色素材復用。舊 PUG_FULLBODY_DELIVERY.json 指向的單張檔已不存在，因此採現行遊戲 hero-idle.js 使用的圖集。
- 兩款遊戲 Icon 統一桌面140px、手機112px、360px以下96px，封面保留垂直留白。
- 修改：index.html（人物層／CSS版本）、assets/css/hub.css。
- 驗證：Playwright 320/390/430/760/1280，Icon保持正方形且未超出封面，無水平溢出、無pageerror；320/390/1280截圖檢視，巴哥臉部與主體可見、未遮擋遊玩按鈕。
- 無未完成項目。提交推送後Pages發布，聊天確認線上版本。
