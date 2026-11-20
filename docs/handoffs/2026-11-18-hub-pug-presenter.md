# Banner 專用巴哥重繪與右側放大

- 使用者明確要求重繪；先核對既有全身待機圖集與美術來源紀錄，再新增一張專用介紹姿勢。未覆蓋遊戲內待機動畫。
- 新圖 assets/source/pic/banner/game_center_branding07_memory_pug_presenter_01.png：1199×1312 RGBA透明PNG，保留原生生成解析度與原檔位元組，無放大／重採樣。生成來源 /workspace/generated_images/exec-4d3a4203-92b3-466a-8617-f6a4e8ce5824.png。
- 巴哥朝右伸手介紹鑽石；桌面主視覺背景放大至110%，角色高度310px；中尺寸另配210px，手機150／165px並上下分離主鑽石，保留左側Logo與CTA。
- 中尺寸Banner說明行高與Logo高度調整，避免CTA超出底部。原始鑽石圖、遊戲Icon與勇氣超人素材不變。
- 檔案：assets/css/hub.css、index.html快取版本、上述PNG；預覽 assets/preview/banner/game_center_branding08_memory_pug_presenter_desktop.png 與 game_center_branding09_memory_pug_presenter_mobile.png；美術來源表追加使用者授權紀錄。
- 驗證：320/390/430/760/820/1280 Playwright檢查無水平溢出、CTA在Banner內；桌面、手機、中尺寸截圖目視檢查主鑽石未被巴哥遮住。
- 無未完成項目；推送後Pages部署，聊天確認結果。上一輪音訊清單已獨立上線，不受本輪影響。
