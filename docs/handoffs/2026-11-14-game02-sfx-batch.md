# 2026-11-14 勇氣超人 — 正式 SFX 插槽及容錯接入批次

## 範圍
使用者要求一次執行更多項目後集中驗收。本批優先修復音效的正式接入能力，不變更角色外觀、14關流程、遊戲平衡或已核准Logo。

## 完成
1. `02_xianxia_battle/js/audio.js`：支援從 `manifest.sfx` 讀取音效；第一次使用時非同步下載並解碼；緩存同一音效，多次播放支援疊音；失敗後停止重試並保留原本WebAudio合成音；靜音時不觸發合成／檔案音效。
2. `02_xianxia_battle/assets/manifest.json`：新增 11 個可選SFX插槽（swing/hit/crit/boom/hurt/skill/dodge/shoot/ui/win/lose），目前全部為 null。**沒有虛構正式音效檔**。
3. `02_xianxia_battle/tools/audio-sfx.test.mjs`：新增Node內建測試，涵蓋無檔回退、快取疊音、失敗回退、靜音。指令：`node --test 02_xianxia_battle/tools/audio-sfx.test.mjs`。
4. `docs/HANDOFF.md`：增加本批入口。

## 驗收與限制
- GitHub中的程式與測試源碼已提交到獨立分支；尚未合併或部署。
- 本批沒有製作聲音本體，因此SFX依舊會播原合成音。
- Node靜態單元測試需在具Node環境執行；瀏覽器實際音訊解碼、手機WebAudio、自動播放限制與完整14關回歸，不能以程式提交代替實測。
- 最新本批次重點是音訊管線，先前16張合輯仍需內頁品質校正；3D模型、音效母帶、聲優錄音仍缺。

## 待辦
取得正式可商用SFX（11類）、將檔案放在 `assets/source/sfx/` 並填入manifest；驗證解碼／響度／手機延遲及混音；進行14關實機驗收。

## 發布
工作分支 `codex/braveguy-sfx-batch-20261114`；未合併預設分支，未發布GitHub Pages。
