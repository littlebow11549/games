# P1 介面大批素材與可切換遊戲預覽

2026-11-14，APHASEN。使用者要求一次完成更多內容，並讓 Claude 先套用看效果。

## 本輪完成

- 延續戰鬥按鍵批次的 4 張圖集／24 個狀態或元件，再完成 8 張介面 PNG／42 個設計項目，合計 12 張／66 項。這是圖集內項目數，不是 66 個獨立成品檔。
- 新增 `assets/source/pic/ui/` 的 bubble_sheet、panel_sheet、minimap_sheet、difficulty_sheet、aux_hud_sheet、bingo_card，以及 `pic/icons/` 的 function_icons_sheet、lock_heal_sheet。
- 除 bingo_card 為 1254×1254，其餘新增八張中的七張皆 1536×1024；均原生 RGBA PNG、未插值放大。實際尺寸、bytes、SHA256 與角落 alpha 記錄在 `assets/source/P1_INTERFACE_DELIVERY.json`。
- 生成提示詞與版式起點分別在 `P1_INTERFACE_PROMPTS.md`、`P1_INTERFACE_SLICE_GUIDE.json`。精準裁切座標、元件透明度和正式衍生檔尚未全部驗收。
- `assets/preview/p1-interface-review.html` 展示全部八張，可連至戰鬥按鍵和 HUD 總覽。

## 已套用的試看入口

`02_xianxia_battle/art-preview.html` 載入現有 index.html，以 `js/art-preview-host.js` 注入獨立 `css/art-preview.css`。正常 index 不受預覽樣式影響，未更動戰鬥邏輯。

預覽套用學生／勇氣超人頭像、計量條、攻擊／閃避／變身／四技能、鎖定、靜音／暫停圖示及搖桿。其餘新增面板、難度、小地圖和賓果圖集目前僅總覽，不能稱已全面整合。技能可用性、冷卻、變身由原遊戲狀態類別驅動。

工具列可切換新舊美術、430px 窄螢幕及「介面檢視」。介面檢視隱藏選單、顯示 HUD，只供觀察，不代表進入戰鬥。3D 人物及場景仍是原遊戲佔位模型。

## 驗證與限制

- Node 語法檢查通過；Chrome 實際載入 WebGL 遊戲與新素材，目視寬螢幕及 430px 介面；新舊切換的 body 類別變化已驗證。
- 修正介面檢視時選單原有 CSS 覆蓋 hidden 的問題。
- 圖集直接用 CSS 定位只作審稿預覽；按鍵圓形比例、各狀態中心、光暈範圍及小尺寸辨識仍需正式切圖校準。沒有宣稱完整戰鬥回歸、觸控實機、所有冷卻狀態或所有關卡通過。
- 本機 Python HTTP 服務無回應，改用只監聽 127.0.0.1 的 Node 預覽服務後成功。當次入口為 http://127.0.0.1:8766/02_xianxia_battle/art-preview.html；服務重啟後網址依啟動埠而定。

## Claude 與 Git 交接

已依使用者授權呼叫本機 Claude Code，要求讀取需求、套用素材並保留原控制／音樂。然而 CLI 回報 OAuth session expired and could not be refreshed，零 token、未修改檔案。已請使用者執行 `claude auth login` 安全登入；不得描述成 Claude 已完成套用。本次可見預覽由 Codex 製作。

Claude 登入恢復後：先從此預覽檢查視覺，精準切圖對齊，再正式接入主頁；保留既有 logo、icon、音樂與控制行為。優先完成正常／按下／禁用狀態、變身與冷卻，再接面板及難度。勿將來源圖覆寫成縮小版。

按使用者既有授權提交並推送至 littlebow11549/games 的 claude/fervent-ride-4h0vjm。實際 push 結果另以 Git 回報為準。沒有部署、送 Tripo 或購買服務。

## 遠端同步補記

本輪提交後同步遠端 ddcaec9，保留另一個 Claude 工作階段已完成的主角頭像正式接入與音樂更新（詳見 music-final-portraits 報告）。此處 OAuth 失敗只指本機 CLI 委派，不代表其他 Claude 工作階段未工作。合併僅 HANDOFF 索引衝突，已保留雙方條目。
