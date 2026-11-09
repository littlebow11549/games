# 縮小 Banner、遊戲新分頁與關閉遊戲交接

日期：2026-11-09（台北）。使用者要求第一屏看到第一排遊戲、點擊遊戲另開新分頁，以及遊戲內可關閉。

## 完成內容

- `assets/css/hub.css`：頁首縮為 72px、Banner 縮成桌機約 200–300px／手機約 200px，縮小上下間距與標題；手機與較矮桌機隱藏 Banner 說明，移除重複的 Banner 小字列。高度依語言自然撐開，沒有硬裁切文字。
- 調整卡片封面比例，使第一屏可辨認遊戲封面及名稱。桌機維持四欄、手機兩欄與空格規則。
- `index.html` 的 Banner 遊玩按鈕及 noscript 入口、`assets/js/hub.js` 動態遊戲卡片封面與標題連結改為 target=_blank、rel=noopener noreferrer。分類、最愛、語言、探索遊戲及首頁品牌仍在原分頁操作。
- `01_memory_crash/index.html`、`css/style.css`、`js/game.js`：所有遊戲畫面右下角提供「關閉遊戲」按鈕，預留 safe-area 與 44px 觸控高度。
- 關閉時鎖定輸入、停止 BGM／現有音檔並暫停 WebAudio，呼叫 window.close。若瀏覽器不允許關閉手動開啟的分頁，150ms 後 replace 返回上層遊戲中心。原首頁分頁不受影響。
- 關閉文字支援六語，讀取 gamehub_language，沒有儲存偏好時依瀏覽器語系決定。這僅為新按鈕語系，不代表遊戲全部已翻譯。
- 鍵盤焦點在關閉按鈕時按 Enter，不再觸發標題畫面的全域 Enter 開始捷徑。

## 驗證與預覽

- `tools/check_hub.cjs` 已配合精簡 Banner 與新分頁行為更新，既有分類、收藏與語系測試通過。
- `tools/check_navigation.cjs` 新增首屏及分頁行為檢查：1440×900、1366×768、1280×720、390×844、375×667、320×667，各六語共 36 組，第一款遊戲名稱完整位於首屏，無橫向溢出。
- 三種實際遊戲入口皆開啟新分頁，opener 為 null，原首頁保留；關閉按鈕能關閉新分頁。
- 模擬瀏覽器拒絕 window.close 時，回到遊戲中心正常；新按鈕日文翻譯正確。
- 預覽：`assets/preview/hub_compact_desktop.png` 與 `assets/preview/hub_compact_mobile.png`。
- JS 語法與 git diff --check 通過。

## 後續與限制

沒有新增／改動圖片來源，Banner 沿用原生無損素材，無新的美術壓縮工作。手機因空間仍保留兩欄。極矮視窗、使用者放大文字可能需要捲動，不應為固定首屏而裁字。瀏覽器是否允許 window.close 由其政策決定，已保留返回中心的退路。關閉為直接離開，不會儲存進行中的關卡；既有最佳紀錄依遊戲原有邏輯保存。

成果與此報告一併提交並推送到既有 Pages 來源分支；部署以 Pages build 及實際網站為準。接手入口為 docs/HANDOFF.md。

## 同步 Claude 進度
發布前已同步遠端 b91434e，保留 Claude 新接入的字藝、數字與四步驟圖。CSS 尾端雙方新增區塊已合併保留，並重新驗證開啟與關閉流程。
