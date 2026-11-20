# 三專案素材命名、暫存救回與歸檔

日期：2026-11-20。範圍：勇氣超人、記憶水晶、遊戲中心。使用者明確要求先完成整理與驗證，之後才重繪技能與角色藝術字。

## 已完成

- 685 個媒體檔按各自前綴改名；其中 7 張舊遊戲中心 QA 截圖依清理指示移出 repo，最終保留 678 個媒體檔。678 檔 SHA256 與改名前完全相同，沒有重編碼、放大、裁切或覆蓋原圖。
- 73 份原本分散的交付／提示詞／檢查文件集中各專案 `assets/records/`。執行用 manifest、字型 metrics 和授權文件保留技術檔名。
- 角色採 `brave_guy_charactorNN_角色名稱_用途`。編號依 story.js 現行關卡陣列首次出場順序；同關按主角／對話介紹／小怪／Boss排序，變體另列，三型態共圖以最早出現的形態編號。原始學生、小天使、小幹譙、勇氣超人依序 01–04。完整順序在 brave_guy_character-order.json。
- 四張使用者最終定案 JPEG 留在 `source/pic/sheet/`；舊深綠圖集仍用於現役裁切，留 `sheet/unified/` 並以「現役裁切圖集」後綴區分，沒有冒稱定案或直接換圖破壞座標。
- 從附件／生成暫存救回 26 張原圖：25 張設計參考（設定集、職場變體、表情特輯、主視覺）加 1 張未使用打擊素材備選；逐 byte 保存。五張使用者本輪補傳圖均已歸檔或與已有附件去重。
- 獨立表情特輯集中 `02_brave_guy/assets/source/pic/expressions/`，已有學生、小天使、勇氣超人、小幹譙。
- 深查 /tmp 另有 43 張候選，27 張與已歸檔素材逐像素相同，16 張是舊 QA／已淘汰圖，不再把它們當新素材塞進庫。
- 更新靜態引用、音訊 manifest、素材清單、母檔索引、相關工具與文件；動態過場／變身／三語字藝／記憶水晶數字、反應字與BGM使用精簡路徑註冊表解析。角色ID、音效事件ID與玩家存檔鍵保持穩定。
- JS/CSS 載入版本統一刷新為 20261120assets，避免改名後快取舊引用。

## 查找入口

每個專案 `assets/README.md` → `assets/records/*_asset-index.md`。

- `02_brave_guy/assets/records/brave_guy_asset-index.md`
- `01_memory_crash/assets/records/memory_crash_asset-index.md`
- `assets/records/game_center_asset-index.md`

每份索引均附 `*_asset-renames.json`（原名→新名、SHA256）及 `*_asset-inventory.json`（載入引用與分類）。三類明確分開：現役載入／母檔與設計參考／未使用備選。來源母檔不等於遊戲已直接使用。不要僅因文件收錄就宣稱有載入。

## 驗證

- `node tools/tests/asset-organization.cjs`：通過。678 媒體檔雜湊；390/1280px 三入口；所有Boss出場、變身圖、三語藝術字、數字與反應圖；無HTTP或JS錯誤。
- `node tools/tests/game02-secret-character-unlocks.cjs`：通過，含角色選擇與實際進場。
- `python 02_brave_guy/tools/unify_sheet_headers.py`：16份現役裁切母檔 SHA／尺寸／Logo 區域通過。
- 106 個 CSS 圖片路徑全部存在；runtime/lossless 全部都有對應 source PNG；全部資產 JSON 可解析；git diff --check 通過。
- 舊 `tools/check_final_assets.cjs` 未通過「必須有6個 data-bitmap」的歷史假設。HEAD 修改前的記憶水晶 index.html 同樣沒有 data-bitmap；不是此次改名造成。未將它列為通過，也未為此修改產品介面。

## 尚未找到／後續

- **惡夢超人的獨立表情特輯仍未找到原檔**。已定案角色設定集內有六個表情，但不冒充獨立特輯。搜尋結果保存在 `brave_guy_temporary-art-search.json`。不要為補洞擅自重新生成設定集。
- 使用者授權下一階段重繪：勇氣超人／小天使／惡夢超人，各角色一張技能圖集，以RPG技能圖參考提升材質、立體光影與能量效果；角色藝術字也盡量每角色一張，中英日分區。現役圖在新圖成功接入前保留。本次整理不含重繪。
- 暫存原路徑是來源證據，不是長期保存位置；已歸檔檔案位於本 repo。

發布：本報告隨整理提交；push 結果以聊天回報為準，未宣稱 GitHub Pages 已更新。
