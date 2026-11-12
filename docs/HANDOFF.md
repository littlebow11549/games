# 專案交接入口

所有製作都必須有交接報告，並與程式／素材一起提交至 repo。Claude 接手請先讀本檔，再閱讀相關報告。

## 最新交付

- [2026-11-12 勇氣超人：遊戲底層完成，14 關可玩（Claude）](handoffs/2026-11-12-game02-all-stages.md)：選關與存檔、劇情對話、14 個場景、12 種守關者；落差見企劃書 10.5 節；音樂需求 v1.2。**尚無真人試玩。**

- [2026-11-12 勇氣超人：鎖定畫面大小，防止操作時網頁被拉近（Claude）](handoffs/2026-11-12-game02-viewport-lock.md)：攔截兩指縮放、連點放大、Ctrl＋滾輪；頁面固定不捲動。

- [2026-11-12 勇氣超人：P0 音樂交付（電音方向）（Claude）](handoffs/2026-11-12-game02-music-p0.md)：依使用者指定改為**硬派電音**；交 `bgm_campus`／`bgm_boss`／`jingle_clear`＋主題 demo（各 `.ogg`＋`.mp3`，−16 LUFS、無縫循環），母帶於 [`_archive/02_xianxia_battle/music/`](../_archive/02_xianxia_battle/music/)，規格表 [`02_xianxia_battle/assets/source/AUDIO_DELIVERY.json`](../02_xianxia_battle/assets/source/AUDIO_DELIVERY.json)；三個 P0 鍵已填入 manifest（未改 `js/`）。分支 `claude/brave-guy-audio`。

- [2026-11-11 勇氣超人：音樂與音效製作需求（Claude）](handoffs/2026-11-11-game02-music-requirements.md)：[`02_xianxia_battle/assets/MUSIC.md`](../02_xianxia_battle/assets/MUSIC.md)，交另一個工作階段製作。第二款遊戲已合併並上線。

- [2026-11-11 勇氣超人：設計底 D1 實作與美術製作需求 v2.0（Claude）](handoffs/2026-11-11-game02-braveguy-d1.md)：原型已改成勇氣超人的核心玩法（兩種型態、四條計量、三小招一大招、變身）；進度見 [`02_xianxia_battle/PROGRESS.md`](../02_xianxia_battle/PROGRESS.md)；美術需求見 [`02_xianxia_battle/assets/ASSETS.md`](../02_xianxia_battle/assets/ASSETS.md)。

- [2026-11-11 第二款遊戲改為《勇氣超人 Brave Guy》：概念圖歸檔與企劃書（Claude）](handoffs/2026-11-11-game02-braveguy-design.md)：企劃書 [`02_xianxia_battle/DESIGN.md`](../02_xianxia_battle/DESIGN.md)、劇情腳本初稿 [`02_xianxia_battle/SCRIPT.md`](../02_xianxia_battle/SCRIPT.md)、角色設定集 [`02_xianxia_battle/CHARACTERS.md`](../02_xianxia_battle/CHARACTERS.md)；名稱已改（當時原型仍是仙俠佔位版；已於 D1 改掉）。

- [2026-11-11 第二款遊戲：首頁入口、簡單版美術、美術優先級清單（Claude）](handoffs/2026-11-11-game02-hub-entry-simple-art.md)：首頁新增第二款卡片（當時暫名青玉劍試煉，已改為勇氣超人）；65 張 SVG＋17 張三視圖暫代圖；優先級見 [`02_xianxia_battle/assets/ASSETS.md`](../02_xianxia_battle/assets/ASSETS.md)。

- [2026-11-10 第二款遊戲（3D 仙俠戰鬥）：影片分析、交 GPT 的素材需求、佔位版原型（Claude）](handoffs/2026-11-10-game02-battle-analysis-and-reqs.md)：需求 [`02_xianxia_battle/assets/ASSETS.md`](../02_xianxia_battle/assets/ASSETS.md)、進度 [`02_xianxia_battle/PROGRESS.md`](../02_xianxia_battle/PROGRESS.md)；可玩但全為佔位素材（首頁入口於 11-11 加入）。

- [2026-11-10 執行報告：第三批接入與優化（含反覆修正檢討、下一專案速度/品質改進建議）](reports/2026-11-10-execution-report.md)

- [2026-11-10 補齊標題字藝與巴哥待機 sprite（Codex）](handoffs/2026-11-10-extra-titles-idle.md)：gameover_hero／howto_hero 高解析字藝（已接入）；pug_idle 待機動畫（備用，暫不接以保留全身）。

- [2026-11-10 主視覺 Icon／Banner／OPTION 字藝刷新（Codex）](handoffs/2026-11-10-hero-brand-refresh.md)：icon_02 封面、banner_02 首頁橫幅、OPTION 精修；Claude 已接入。

- [2026-11-09 全身 chibi 主角交付（Codex）](handoffs/2026-11-09-fullbody-chibi-pug.md)：pug_fullbody 全身站姿；Claude 已接入首頁/選單。

- [2026-11-09 第三批 KV 正式接入（Claude）](handoffs/2026-11-09-batch3-integration.md)：首頁/選單改用 pug_head 半身像、START 字藝、遊戲橫幅換 v3 六詞；遊戲/結算保留可變表情 canvas。已接入。

- [2026-11-09 第三批 KV1–KV4 主視覺、角色、START 與六詞特效](handoffs/2026-11-09-batch3-hero-art.md)：10 張來源圖、無損 WebP、獨立動態預覽；正式遊戲待接入。

- [2026-11-09 第二批 D1–D4 美術素材、動態獨立預覽與接入說明](handoffs/2026-11-09-batch2-art.md)

- [2026-11-09 過關／失誤／結束特效 GIF 實錄預覽](handoffs/2026-11-09-fx-gif-preview.md)

- [2026-11-09 剩餘素材補齊、全數接入與驗證收尾](handoffs/2026-11-09-finish-assets-integration.md)

- [2026-11-09 巴哥四種 GIF 預覽與合併比較](handoffs/2026-11-09-pug-gif-preview.md)

- [2026-11-09 巴哥四種連續動態、選單字藝、影片與全素材核對](handoffs/2026-11-09-character-animation-audit.md)

- [2026-11-09 單張金色立體字型圖集與字元對照](handoffs/2026-11-09-font-atlas.md)

- [2026-11-09 縮小 Banner、遊戲新分頁與關閉按鈕](handoffs/2026-11-09-compact-banner-game-tabs.md)

- [2026-11-09 移除頁首導覽、圖示與品牌句點，簡化 copyright](handoffs/2026-11-09-header-footer.md)

- [2026-11-09 網站更名為遊戲中心](handoffs/2026-11-09-site-name.md)

- [2026-11-09 新增美術：十一組立體字、四步驟教學圖集](handoffs/2026-11-09-titles-howto.md)

- [2026-11-09 首頁大 Banner、六語系、四欄遊戲列表、類型篩選與最愛](handoffs/2026-11-09-homepage.md)

## 既有遊戲素材與程式

- [Memory Crash 遊戲進度](../01_memory_crash/PROGRESS.md)：遊戲目前接入狀態，以最新進度為準。
- [原素材交接](../01_memory_crash/CLAUDE_HANDOFF.md)：含先前版本的歷史說明，請與最新進度交叉閱讀。
- [素材規格與分類](../01_memory_crash/assets/ASSETS.md)
- [素材交付尺寸與來源](../01_memory_crash/assets/DELIVERY_V2.md)
- [遊戲 PNG 無損壓縮紀錄](../01_memory_crash/assets/LOSSLESS_COMPRESSION.json)

## 後續每次製作的交接格式

每次新增／修改程式、圖片、音樂、動態或版面，都在 docs/handoffs/ 建立或更新報告，並更新本入口。至少列出：使用者要求、完成內容、檔案及分類路徑、素材規格／壓縮、狀態或儲存設定、測試結果、尚待完成與發布狀態。勿把「已推送」等同於「已部署」，勿宣稱已通知 Claude，除非確實有送達。

- [UI 大改版 + 第二批設計需求](handoffs/2026-11-09-ui-overhaul-and-reqs.md)（2026-11-09）
