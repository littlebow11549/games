# Memory Crash 字型圖集交接（單張整套）

日期：2026-11-09（台北）。需求來源：01_memory_crash/assets/ASSETS.md 的 font_01 設計需求；使用者確認整套做成一整張。

## 交付位置

以下位於 `01_memory_crash/assets/source/pic/font/`：

- `font_01.png`：一張完整透明 PNG，不拆成多張。金色立體字面、深藍描邊與青色細光，包含 A–Z、a–z、15 個符號與空白字元。
- `font_01.json`：68 個字元的 Unicode、列欄、實際切圖 frame 座標與 alpha 邊界。
- `COMPRESSION.json`：原始／壓縮容量、原生尺寸、RGBA 像素 SHA-256 與無損一致性驗證。

## 排列與對照

邏輯上為 8 欄 × 9 列；右下 5 格皆透明，其中第一格代表空白，其後 4 格未使用。

1. A B C D E F G H
2. I J K L M N O P
3. Q R S T U V W X
4. Y Z a b c d e f
5. g h i j k l m n
6. o p q r s t u v
7. w x y z . , : ;
8. ! ? ' " - + / %
9. & ( ) [空白] [留空] [留空] [留空] [留空]

注意：AI 產圖不是嚴格等格輸出，實際列高、左右留白有差異。不要直接將原圖寬除以 8、高除以 9 來切，應使用 JSON 的逐字 frame，保留完整描邊／光暈。JSON 的行列索引從 0 開始，座標為左上原點、像素單位。frame 的 width/height 包含透明留白，alpha_bounds_in_frame 是各 frame 內的可見邊界，非整圖座標。

## 解析度、壓縮與驗證

原生 1254×1254 RGBA，尚未達清單原訂 2048×2048。保留真實原生解析度，未插值放大假裝增加細節。單字可見圖形約 100px，切圖時不要超過原生像素硬放大；如需大型字面應重製更高原生解析度。

已目視核對 A–Z、a–z 與符號，並以 alpha 驗證 67 個可見字元 frame 非空、空白 frame 無實體字形。PNG 保留透明底，移除第一版多餘底板。僅無損最佳化壓縮，壓縮前後尺寸、模式及所有 RGBA 像素完全一致；細節見 COMPRESSION.json。

第一版底板稿未放進 repo 的正式素材位置，原始生成檔留在本次雲端工作區 /workspace/generated_images/，正式交付僅此一張 font_01.png。

## Claude 接續

這是美術圖集，不是 TTF／WOFF，也不是已完成字距的 BMFont。尚未接入遊戲的一般文字。

- 接入前先目視校正各字元的 baseline、x-height、descender 與 advance／kerning；JSON 只提供可靠分區 frame，沒有宣稱已完成字體排版。
- I/l、O/o 需依原始形狀保留，勿因裁切外框統一高度造成大小寫失真。
- 此圖只有拉丁字母及指定符號，不含數字（使用既有 numbers_01）、中日韓泰字形。不要取代其他語系文字，保留一般字體 fallback。
- 即使以 bitmap 拼字，仍保留文字語意、aria-label 或可存取文字，不以無 alt 圖片取代重要操作名稱。
- 若需重新切圖，來源圖仍維持單張不改名；衍生檔與 metrics 可另存於同一分類資料夾。

## 協作與發布

製作前已同步 Claude 的 1f5595c（角色 placeholder 與選單進度），未修改其遊戲實作。此次只交付字型素材、字元資料與交接報告；沒有改首頁或遊戲流程。

報告與素材一起提交推送至 claude/fervent-ride-4h0vjm；是否已發布以 GitHub Pages build 為準。最新交接入口 docs/HANDOFF.md。尚待 Claude 進行 bitmap renderer／字距校正與實際遊戲驗收。
