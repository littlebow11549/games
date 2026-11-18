# 虛擬方向鍵觸控範圍修正

## 完成內容
- 原因：`#stick-zone` 透明區佔畫面寬44%、高62%，pointerdown無距離檢查，畫面中左部也能啟動方向輸入。
- `02_brave_guy/css/game.css`：保留定位容器，容器不接收點擊；只有搖桿本體與向外8 CSS px的圓形透明容錯區接收。圖示與配置不變。
- `02_brave_guy/js/input.js`：依當前本體尺寸檢查圓形距離；拒絕範圍外、新的第二隻手指及滑鼠非左鍵啟動。已啟動拖曳可繼續滑出範圍，pointer capture保留操作連續性。
- pointerup/cancel/lostpointercapture、blur及頁面隱藏均清除搖桿向量，避免殘留方向。
- `main.js`與`play.html`更新input/main/game.css快取版本。
- 無新增媒體素材，無音效／鎖定規則變更。

## 驗證
- `node tools/tests/game02-stick-bounds.cjs`通過：360×780、390×844、844×390、1280×800，變身前後；中央／圓外點擊不啟動、外圈4px可啟動、拖出範圍繼續、放開／blur歸零。
- CDP觸控測試：中央touch不啟動、本體touch啟動、touchCancel歸零。
- `node tools/tests/game02-auto-nearest-lock.cjs`通過：最近目標、方向切換、單拳朝向及死亡替換回歸。
- 尚未在實體iPhone上驗證。程式、測試及報告一併提交推送，部署結果於聊天確認。
