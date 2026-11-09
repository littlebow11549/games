# 全身 Q 版巴哥修正（2026-11-09）

使用者指出主角不能裁切，要求更 Q、2.5 頭身、短腿，並在初稿後要求腿稍長；最終新圖已獲使用者「可以！」確認。以 2.5 頭身為設計方向，生成圖比例為藝術化近似，非工程量測值。

## 完成

- 新增 `01_memory_crash/assets/source/pic/character/pug_fullbody.png`，原生 1122×1402 RGBA。完整頭盔、雙手、短腿、金靴與捲尾，四周留透明空間；原生成 PNG 完整保留，不裁圖、不插值放大。
- `assets/runtime/pic/batch3/pug_fullbody.webp` 使用 lossless + exact；RGBA 每像素與 PNG 完全一致。尺寸與像素雜湊見 `assets/source/PUG_FULLBODY_DELIVERY.json`（以上相對遊戲目錄）。
- 首頁及選單 `index.html` 的 `.hero-img` 改用全身新圖；舊 `pug_head` 保留為歷史素材，正式兩處不再引用。
- `css/style.css` 依既有 430×820 等比縮放設計座標，為 Logo、完整角色、START 分開保留空間。選單取消角色負 margin，雙腳不藏入面板。圖片維持 contain，沒有放大裁切。
- 遊戲與結算 canvas 表情動畫保持既有行為；新圖為靜態角色＋原 CSS 呼吸，並非新增逐格角色動畫。

## 驗證與發布

- PNG／WebP RGBA 逐像素比對通過。
- Chromium 檢查 320×568、390×844、1440×1000 的首頁／選單：角色框位於視窗內，與 START／選單面板分離；START 鍵盤啟動及選單切換通過，無 JS 錯誤。
- 截圖：`assets/preview/pug_fullbody_title.png`、`assets/preview/pug_fullbody_menu.png`。完整遊戲及音訊流程未重跑，手機實機未測。
- 以 `codex/full-body-chibi-pug` 提交供接手；推送與 PR 不代表已合併或部署，未發外部訊息通知 Claude。
