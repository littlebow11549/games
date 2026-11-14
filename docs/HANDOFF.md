# 專案交接入口

所有製作都必須有交接報告，並與程式／素材一起提交至 repo。Claude 接手請先讀本檔，再閱讀相關報告。

## 最新交付

- [2026-11-14 勇氣超人：變身曲 `bgm_brave` + 其餘關卡戰鬥曲（音樂階段）](handoffs/2026-11-14-game02-music-brave-batch.md)：交 `bgm_brave`、`bgm_stage_2_2`、`3_2`、`3_3`、`3_4`、`3_5`、`4_1`（各 ogg+mp3、−16 LUFS、無縫循環），已換掉暫代曲。**所有關卡戰鬥曲與變身曲皆有專屬曲**；尚缺非戰鬥曲（title/transform/defeat/talk/ending/credits）。分支 `claude/brave-guy-music`，未改 `js/`。

- [2026-11-14 勇氣超人：接上地圖一各關與 2-1 的戰鬥曲（Claude）](handoffs/2026-11-14-game02-music-stage1-wiring.md)：合併音樂分支 `claude/brave-guy-music` 的五首；地圖一每關都有自己的曲子。**這次收到的只有音樂，沒有美術或模型。**

- [2026-11-12 勇氣超人：關卡戰鬥電音（地圖一全數 + 2-1）（音樂階段）](handoffs/2026-11-12-game02-music-stage1.md)：依 MUSIC.md v1.2 做每關不同電音；交 `bgm_stage_1_0/1_2/1_3/1_4` 與 `bgm_stage_2_1`（各 ogg+mp3、−16 LUFS、無縫循環），地圖一一般戰鬥（1-0～1-4）全到位；六鍵已填 manifest，母帶於 `_archive/`，規格 `assets/source/AUDIO_DELIVERY.json`。分支已對齊主線，未改 `js/`。

- [2026-11-13 勇氣超人：美術製作需求 v2.1（Claude）](handoffs/2026-11-13-game02-art-requirements-v21.md)：對照現況重新核對 [`ASSETS.md`](../02_xianxia_battle/assets/ASSETS.md)，新增小地圖、鎖定、難度、泡泡等介面素材；優先級不變。**需由使用者轉交 GPT，尚無正式美術交付。** 另新增 3D 外包需求 [`MODELS_3D.md`](../02_xianxia_battle/assets/MODELS_3D.md)（21 個角色、8 個道具、動作清單與技術規格）。

- [2026-11-12 勇氣超人：小地圖、三種難度、體型大小、俊熊補血、嗆聲與頂嘴（Claude）](handoffs/2026-11-12-game02-minimap-difficulty.md)：可點擊縮放的小地圖；輕鬆／普通／地獄（地獄同場最多 120 隻、鋪滿地圖）；小怪分大中小；小天使變身結束 10 句嗆聲、主角會回嘴。

- [2026-11-12 勇氣超人：新字型與中英語系切換（Claude）](handoffs/2026-11-12-game02-fonts-i18n.md)：粉圓體＋思源黑體 Black（子集內嵌）；標題與暫停選單可切換中文／English，598 條翻譯；改文字後要重跑 `tools/make_game02_fonts.py`。

- [2026-11-12 勇氣超人：招式全開、變身專用音樂、接上地圖二三的戰鬥曲（Claude）](handoffs/2026-11-12-game02-brave-bgm-wiring.md)：開發期間每關都能用全部招式；變身期間切到 `bgm_brave`（目前暫用主題 demo，正式曲需求已開在 MUSIC.md）；`bgm_wild`／`bgm_office`／`bgm_office_mute` 已填進各關的鍵。

- [2026-11-12 勇氣超人：自動鎖定、怪量加倍、怪會嘲諷、招式加強（Claude）](handoffs/2026-11-12-game02-lock-crowd-taunts.md)：「鎖」按鈕（T 鍵）；每波怪量約三倍並排隊補進場；小怪輪流講賤話、變身後改求饒；三小招範圍加大，大招收尾全場清空。追加：開發期間關卡預設全開（`DEV_UNLOCK`，正式完成時要關）。

- [2026-11-12 勇氣超人：電腦操作改為滑鼠攻擊與鍵盤快捷鍵（Claude）](handoffs/2026-11-12-game02-pc-controls.md)：左鍵普攻、右鍵閃避、Q／E／R 小招、F 大招、空白鍵變身；攻擊朝游標方向。

- [2026-11-12 勇氣超人：載入與效能改善（Claude）](handoffs/2026-11-12-game02-performance.md)：修正舊頁面配新程式卡住、載入失敗無提示、移除 import map、畫質分級與自動降級、小怪改假陰影。後續確認原因是使用者的瀏覽器無法建立 WebGL；已加上失敗說明與讀取進度條。

- [2026-11-12 勇氣超人：遊戲底層完成，14 關可玩（Claude）](handoffs/2026-11-12-game02-all-stages.md)：選關與存檔、劇情對話、14 個場景、12 種守關者；落差見企劃書 10.5 節；音樂需求 v1.2。**尚無真人試玩。**

- [2026-11-12 勇氣超人：鎖定畫面大小，防止操作時網頁被拉近（Claude）](handoffs/2026-11-12-game02-viewport-lock.md)：攔截兩指縮放、連點放大、Ctrl＋滾輪；頁面固定不捲動。

- [2026-11-12 勇氣超人：電音音樂交付（P0＋各地圖戰鬥曲）（Claude）](handoffs/2026-11-12-game02-music-p0.md)：依使用者指定改為**硬派電音、每關不同**；交 7 首（`bgm_campus`／`bgm_boss`／`jingle_clear`／`bgm_wild`／`bgm_office`／`bgm_office_mute`＋主題 demo，各 `.ogg`＋`.mp3`，−16 LUFS、無縫循環），母帶於 [`_archive/02_xianxia_battle/music/`](../_archive/02_xianxia_battle/music/)，規格表 [`02_xianxia_battle/assets/source/AUDIO_DELIVERY.json`](../02_xianxia_battle/assets/source/AUDIO_DELIVERY.json)；六個鍵已填入 manifest（地圖二三的三首已於同日由 Claude 接到各關）。分支 `claude/brave-guy-audio`。

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
