# Claude 接手入口

開始任何整理、製作或程式修改前，依序閱讀：

1. [AGENTS.md：素材設計與替換鐵則](AGENTS.md#asset-design-rules)——全專案唯一的設計準則主文，Claude、Codex及人工接手均適用。
2. [docs/HANDOFF.md](docs/HANDOFF.md)——最新實作、驗證、待辦及發布狀態。
3. 目標專案的 `assets/records/*_asset-index.md`、`*_asset-inventory.json`、`*_asset-renames.json`，以及相關製作報告。

核心要求：按角色／用途整合圖集、固定用途ID與取圖規格、能直接換圖並沿用角色參考製作新風格、區分定案／現役／備選、原檔與版本可追溯。整理規則不依賴聊天記憶；若與舊規格衝突，以AGENTS最新鐵則及使用者後續明確指示為準。

不得把未直接載入的正式母檔當垃圾。已確認淘汰的半成品、錯Logo稿與QA依最新清理指示刪除並記錄；有價值的未使用備選才收 `_alternate/`。不要重建預覽頁或散放交付文件。

每次製作必須更新 `docs/handoffs/` 報告及 `docs/HANDOFF.md`，與成果共同提交。明確區分需求、規格、已實作、已驗證及未完成；不得把仍待重繪的圖集說成已接入。
