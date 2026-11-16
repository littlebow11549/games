# 2026-11-16 勇氣超人：容量/圖片優化 + 資料夾清理

## 使用者要求
對遊戲做容量、程式、圖片優化並評估優化空間；整理資料夾分類。過程中決定：過場大圖可用有損；開發殘留直接刪除；舊設定集與不採用的美術要保留並分類。

## 優化評估結論
- **玩家下載面**（index.html／js 只讀 `assets/runtime`）：webp 已是無損最佳（PIL 最高參數重壓位元組數不變，Codex 已壓到極限）；程式 gzip 後 js ~155KB／css ~24KB，GitHub Pages 自動 gzip。→ 在「只能無損」規定下幾乎沒空間。
- 真正可省：① 過場大圖放寬為有損；② 清非玩家面殘留。

## 完成內容

### A. 圖片有損優化（視覺無損）
- `tools/compress_runtime.py` 改：`cinematics/` 全部與 `transform/` 不透明圖走 **有損 WebP q90 / method6**（由來源 PNG 重壓、native 尺寸、確定性編碼、只在更小時覆寫可重跑）；有真透明的（字藝、剪影）與其餘仍維持無損逐像素驗證。
- 結果：`assets/runtime` **142M → 75M**（cinematics 70→15M、transform 17→4.1M；玩家下載面省約 67M）。q90 目視無壓縮痕跡。

### B. 資料夾清理
- **刪除**：`assets/preview/`（44M，開發審稿截圖/HTML/測試腳本，玩家不下載）；孤兒音檔 `bgm_office`/`bgm_office_mute`/`bgm_wild`/`theme_braveguy_demo`（已無引用）。
- **保留並分類**（美術，含不採用）：`source/pic/concept/history/`（6 張舊角色稿）、`source/pic/sheet/history/`（2 張 Logo 核准前設定集）、`source/pic/sheet/*_draft_v1.png`（11 張設定集草稿，且為 `tools/unify_sheet_headers.py` 的輸入）皆留在 `source/pic` 原分類下。
- `art-preview.html` 移除指向已刪 preview 的 3 個死連結。
- 遊戲資料夾 **511M → 395M**。

## 檔案
- `02_brave_guy/tools/compress_runtime.py`、`02_brave_guy/assets/runtime/lossless/pic/{cinematics,transform}/*.webp`、`02_brave_guy/art-preview.html`
- 刪除：`02_brave_guy/assets/preview/`、上述孤兒音檔

## 測試結果
- 無頭 Chromium：載入 0 error；過場 q90 圖目視抽查（victory_qian 三格）銳利無痕。
- 刪除後殘留引用檢查：index/js/manifest/play/art-preview 皆無指向被刪檔。
- `js/loading.js`（玩家面）只讀 `assets/runtime-images.json`，不受影響。
- **未驗證**：未逐張人眼比對全部 45 張有損圖；未實機跑完整 14 關看每個過場。

## 發布狀態
- 已 commit 並比照上線（開發分支 `claude/brave-einstein-tqlm5u` 與預設分支 `claude/fervent-ride-4h0vjm`）。commit `e1982f8`（清理）、`1369943`（有損壓縮）。
- git 歷史保留被刪檔，必要時可還原。
