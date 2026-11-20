# 2026-11-15 勇氣超人：修正絕招/衝刺穿牆 + 盤點未收到美術

## 使用者要求
1. 回報「主角使用絕招會穿牆」，要求修正。
2. 問暫停頁是否沒做美術；要求把沒做的美術開成需求、交 GPT 接手。
3. 要求用最快速度盤點「還有多少沒收到美術」成製作清單。

## 完成內容

### A. 穿牆修正（`js/main.js`）
- 根因：主迴圈 `dt` 上限 0.05s（20fps 底），衝刺招 `skill1` dash=15/0.24≈62.5 u/s，低幀率單幀位移達 ~3.1 單位，超過穿透門檻（牆厚 0.8＋2×半徑 1.0 ≈ 1.8）；`maze.collide` 是靜態推出（非掃描式），整幀跳過薄牆＝穿牆。閃避、大擊退同理。
- 修法：新增 `moveHeroBy(dx,dz)`，把位移切成每段 ≤0.35（<牆半厚 0.4）逐段推進並 `clampArena` 碰撞。衝刺 `skill1`、閃避 `dodge`、擊退 `hero.kb`、一般移動 `run` 都改走它。
- 絕招 `ult` 施放中主角不位移，本身不會穿牆（光束貫穿牆為攻擊判定，非角色穿牆）。

### B. 暫停頁美術
- 現況：暫停鍵三個功能圖示（繼續/重打/回標題）已是正式美術（`brave_guy_ui18_功能按鈕圖集.png`）；但**面板框本身、標題牌、按鈕底仍是 CSS**（`linear-gradient(#22402A,#12241A)`＋黑框黃外框），所以看起來「沒美術」。
- `ASSETS.md §4.5` 新增展開需求：`ui/brave_guy_ui26_彈出面板.png`（九宮格框）、`ui/brave_guy_ui38_面板標題底板.png`（標題牌）、`ui/brave_guy_ui27_文字按鈕圖集.png`（文字按鈕三態），含尺寸、安全邊、配色、提示詞。

### C. 未收到美術完整清單
- 新增 `02_brave_guy/assets/records/brave_guy_record01_art_outstanding_2026-11-15.md`，分 P0/P1/P2/選做：
  - **P0**：3D 模型全缺（manifest 7 鍵 null；brave_guy_record03_models_3d.md 21 角色+8 道具）、場景 §7 全缺（14+ 概念圖/貼圖/共用底）。
  - **P1**：SFX 11 個全缺、UI 面板多數仍 SVG 佔位、品牌收尾（logo 高解析/menu_keyart ×2）、第一次變身演出 §6 全缺。
  - **P2**：對話頭像表情 §11（小天使 8＋主角 15）、教學圖、地圖三道具（履歷/算了計數器）。
  - 選做：字藝/特效貼圖/數字（SVG 佔位可用）。

## 檔案
- `02_brave_guy/js/main.js`（`moveHeroBy` + 4 處位移改寫）
- `02_brave_guy/assets/ASSETS.md`（§4.5）
- `02_brave_guy/assets/records/brave_guy_record01_art_outstanding_2026-11-15.md`（新增）

## 測試結果
- 無頭 Chromium（swiftshader）：對照組「舊式整幀衝刺」11/11 牆全穿；修正後 11/11 全擋、0 console error。
- **未驗證**：真人實機低幀率手感；美術清單是對照 ASSETS.md 與已交付檔的靜態盤點，GPT 製作前面板類可與 Claude 再對一次避免與既有圖集重工。

## 發布狀態
- 已 commit（`29e3a90`）、推送開發分支 `claude/brave-einstein-tqlm5u`，並快轉到預設分支 `claude/fervent-ride-4h0vjm`（GitHub Pages 來源）上線。
