# 勇氣超人：鎖定畫面大小，防止操作時網頁被拉近（2026-11-12，Claude）

## 使用者要求
- 鎖定固定尺寸大小，不要因為操作導致網頁被拉近；整體放大就無法玩。

## 完成內容（`02_xianxia_battle/`）
- `js/input.js` 新增 `lockViewport()`，`js/main.js` 啟動時呼叫：
  - 攔截 iOS 的 `gesturestart／gesturechange／gestureend`（iPhone 的 Safari 會無視 viewport 的 `user-scalable=no`）。
  - 攔截兩指以上的 `touchmove`。
  - 350 毫秒內的連續 `touchend` 取消預設行為，避免快速連點被當成「點兩下放大」。開始／結算畫面的按鈕靠 `click` 觸發，所以排除 `.overlay`。
  - 攔截 `dblclick`、Ctrl／⌘＋滾輪、Ctrl／⌘＋加減號與 0。
  - 萬一仍被縮放（`visualViewport.scale` 不是 1），重寫 viewport meta 讓瀏覽器回到 1 倍。
- `css/game.css`：所有元素 `touch-action:none`、`-webkit-touch-callout:none`；`html, body` 改為 `position:fixed`、`overscroll-behavior:none`、`text-size-adjust:100%`，不捲動、不回彈。
- `index.html`：viewport meta 加上 `minimum-scale=1` 與 `id`。

## 驗證
無頭 Chromium 模擬 iPhone 13 橫向（觸控）：
- 以觸控點「開始」可進入遊戲；連點攻擊鍵 12 下、連點空白處 6 下後，`visualViewport.scale` 仍為 1、頁面沒有捲動。
- 合成事件確認被攔截：`gesturestart`、`dblclick`、Ctrl＋滾輪、兩指 `touchmove`；一般滾輪與單指移動不受影響。
- 搖桿仍可操作（主角有移動）；console 無錯誤。
- **未驗證**：實體 iPhone／Android。模擬器無法真的做出兩指縮放，只能確認攔截邏輯有被觸發。瀏覽器選單裡的「放大頁面」與系統層級的輔助放大無法由網頁攔截。

## 範圍
只改第二款。第一款 Memory Crash 未動。

## 發布狀態
隨本次 PR 合併至預設分支並部署，見 PR 紀錄。
