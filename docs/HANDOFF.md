# 專案交接入口

所有製作都必須有交接報告，並與程式／素材一起提交至 repo。Claude 接手請先讀本檔，再閱讀相關報告。

## 最新交付

- [2026-11-15 全 Boss 統一過場、完整音效、日文 Logo](handoffs/2026-11-15-game02-boss-films-sfx-ja-logo.md)：13 Boss／39 鏡，全體 8.2 秒三段式；63 原創音效接入；原 Logo 日文變體。附原圖與母帶索引、三語117組過場及音訊測試。

- [2026-11-15 結算緞帶空白修正](handoffs/2026-11-15-game02-result-title-fix.md)：修正 CSS 優先度導致藝術字 0×0；三語/三結算/三尺寸 27 組可見性與圖片解碼驗證，無重製素材。

- [2026-11-15 三語字藝、Boss／結局過場與介面動態](handoffs/2026-11-15-game02-system-cinematics.md)：中英日字藝、日文詞庫、13 Boss、全員鼓掌結局＋8 秒 LilinS Staff、換目標、連擊彈跳、螢光量表/爆表、原圖呼吸光效；附測試與原圖來源。

- [2026-11-15 主選單天使遮擋修正](handoffs/2026-11-15-game02-menu-angel-clear.md)：泡泡/重播移出角色區，頂部語系列預留空間，短螢幕捲動不再讓文字滑過臉；無新圖。

- [2026-11-15 變身分鏡接入（既有13圖）](handoffs/2026-11-15-game02-transform-storyboard.md)：原圖SHA256全部相符；首次變身與主選單重播、五段著裝特寫、四個等待插鏡、登場與舉牌；未重新生圖。

- [2026-11-15 既有HUD圖集與劇情接入收尾](handoffs/2026-11-15-game02-existing-atlas-integration.md)：復用HUD、上班族頭像、Boss/敵人血條、連擊/泡泡、地面鎖定、回血、罪惡爆炸、俊熊小地圖與劇情/賓果卡；無新圖、原檔未改。

- [2026-11-15 美術來源盤點更正與防重工](handoffs/2026-11-15-game02-art-audit-correction.md)：25組需求映射到既有合輯／圖集；27張本機待比對稿另列；生圖佇列為空。後續先查來源對照，不以獨立檔缺失認定缺件。

- [2026-11-15 選關、暫停、結算美術接入與庫存盤點](handoffs/2026-11-15-game02-overlay-art-integration.md)：三畫面正式圖集接入、標題去描邊、操作等寬、結算成績分欄及語系修正；20組布局與14關結算流程驗證。生成佇列已停止，疑似重複新稿不作正式交付。

- [2026-11-15 主選單雙版主視覺與最新清單確認](handoffs/2026-11-15-game02-menu-keyart.md)：兩張無字 RGB PNG 已產出，原生 1330×1182／1448×1086，低於需求尺寸、未放大；尚待實際裁切與接入。已同步 Claude 最新完整缺件清單。

- [2026-11-15 勇氣超人：修正絕招/衝刺穿牆 + 盤點未收到美術（Claude）](handoffs/2026-11-15-game02-wall-fix-and-art-backlog.md)：修正高速位移低幀率單幀跨過薄牆的穿牆 bug（新增 `moveHeroBy` 分段推進，衝刺/閃避/擊退/移動都改走它；無頭測試舊式 11/11 全穿、修正後 11/11 全擋、0 error）。並產出 [`assets/ART_OUTSTANDING_2026-11-15.md`](../02_brave_guy/assets/ART_OUTSTANDING_2026-11-15.md) 未收到美術完整清單（交 GPT），`ASSETS.md §4.5` 展開暫停/彈窗面板細規格。已 commit 並比照上線（預設分支）。

- [2026-11-15 勇氣超人：套用交響金屬 BGM（v3.0 音檔到位）（Claude）](handoffs/2026-11-15-game02-music-v3-symphonic-metal-applied.md)：套用使用者上傳的 25 首交響金屬 MP3，轉出同名 OGG 一起覆蓋；新增 `bgm_battle`／`bgm_victory`／`bgm_stage_3_0` 三首專屬曲並改接 manifest（原為佔位）。無頭 Chromium 載入 0 error、24 鍵全對應、OGG 皆可解碼。**未做母帶處理，未 commit／push／部署。**

- [2026-11-15 勇氣超人：資料夾改名 02_xianxia_battle → 02_brave_guy（Claude）](handoffs/2026-11-15-game02-folder-rename-brave-guy.md)：早期代號改為與遊戲名一致的 `02_brave_guy`；`git mv` 搬資料夾並全 repo 更新 52 檔的路徑引用。**GitHub Pages 網址改為 `.../02_brave_guy/`，舊網址失效**。Playwright 驗證 hub 連結、遊戲載入、0 error 全過。

- [2026-11-15 勇氣超人：音樂需求 v3.0 — 改走吉他搖滾／金屬（Claude）](handoffs/2026-11-15-game02-music-v3-rock.md)：依使用者參考（Awaken BB 金屬搖滾 Boss 戰）改寫 [`MUSIC.md`](../02_brave_guy/assets/MUSIC.md)；風格換成吉他搖滾、每關不同節奏、附中文 AI 提示詞。**音檔未重做。**

- [2026-11-15 勇氣超人：近戰圈不再定住、打王時補小怪集氣（Claude）](handoffs/2026-11-15-game02-swarm-churn-boss-fodder.md)：還沒出手的小怪一直往主角擠（不再定格）；守關者戰持續補小怪（普通同時 10 隻）供集氣集大招，王倒即停。

- [2026-11-15 勇氣超人：無雙式群湧（怪自動聚集、源源不斷塞滿畫面）（Claude）](handoffs/2026-11-15-game02-musou-swarm.md)：移除守在原地行為、所有小怪主動聚集；爆發式補怪、同場上限與每波總數大增、擠得更緊，維持滿畫面的無雙割草感。

- [2026-11-15 勇氣超人：音樂 v2.0 重製 P0 四首（音樂階段）](handoffs/2026-11-15-game02-music-v2-p0.md)：依 v2.0「全部重新設計」做 `bgm_brave`／`bgm_campus`／`bgm_boss`／`bgm_title`——加厚合成＋ffmpeg 母帶，達 −13 LUFS、LRA≤5、中頻≥3.5%、高頻≥2%（§C 全過）。舊 v1 母帶移至 `_archive/.../music/v1/`。**先交 P0 待使用者確認方向**再重製其餘。未改 `js/`。

- [2026-11-15 勇氣超人：主選單第三版、任務欄收合、語系鍵、音效插槽（Claude）](handoffs/2026-11-15-game02-menu-v3-quest-collapse.md)：選單改漫畫分鏡風；任務欄可收成一行；語系改雙格開關；合併 Codex 的音效載入（尚無音效檔）；`ASSETS.md` §5.1 新開兩張選單主視覺的需求。

- [2026-11-14 SFX 正式檔案插槽與容錯接入](handoffs/2026-11-14-game02-sfx-batch.md)：新增11種音效插槽、快取疊音／合成回退與Node測試；尚無正式音效檔，未合併／部署。

- [2026-11-15 勇氣超人：音樂全部重新設計的需求 v2.0（Claude）](handoffs/2026-11-15-game02-music-redesign-brief.md)：依使用者給的參考影片量測後改寫 [`MUSIC.md`](../02_brave_guy/assets/MUSIC.md)；新增 `tools/audio_features.py`。**音檔尚未重做，待音樂工作階段依 v2.0 製作，先交 P0 四首。**

- [2026-11-15 勇氣超人：隨機迷宮、小天使救援、守關者負面狀態、怪量加碼、主選單重做（Claude）](handoffs/2026-11-15-game02-maze-rescue-debuff-menu.md)：每次進關隨機生成迷宮；每關 2–3 次救援（抓俊熊 +1）；九種負面狀態；每關多一波狂潮；主選單改用主視覺並拆成標題與選關兩頁。

- [2026-11-14 全16張合輯頁首精準統一（Codex）](handoffs/2026-11-14-game02-unified-sheet-headers.md)：使用者核准程式合成，同一Logo原檔、固定座標及尺寸，16張Logo區域逐像素一致；新版在sheet/unified，1728×1152，角色原圖未放大。此紀錄取代上一批「Logo尚未統一」狀態，角色內頁缺陷仍待修。

- [2026-11-14 十一位角色整批初稿與Logo統一查核（Codex）](handoffs/2026-11-14-game02-character-batch-logo.md)：11張初稿及7張Logo修訂，原生1536×1024；附審稿頁與逐項缺陷。Logo仍有重畫／位置偏差，角色比例及文字待修，未宣稱全批完成或已套用3D。

- [2026-11-14 小地圖整合與剩餘美術盤點（Codex）](handoffs/2026-11-14-game02-minimap-backlog.md)：外框、三種敵人與主角箭頭接入；112／210px及窄版切換驗證。附未製作、已有來源待整合與待返修清單。

- [2026-11-14 任務卡與小天使泡泡整合（Codex）](handoffs/2026-11-14-game02-panels-runtime.md)：任務面板與粉紅提示泡泡已接入；長句排版、實際框尺寸邊界修正。Chrome窄版1-1實際觸發提示並驗證；其他泡泡與主劇情框尚待。

- [2026-11-14 難度與暫停選單美術整合（Codex）](handoffs/2026-11-14-game02-menu-runtime.md)：三難度六態與四個暫停功能圖示已接入，保留中英文字與操作；新增選取狀態ARIA，修正首頁佔位說明。Chrome寬／窄版及重開關卡驗證完成。

- [2026-11-14 戰鬥按鍵正式接入（Codex）](handoffs/2026-11-14-game02-buttons-runtime.md)：七種操作三態、鎖定、功能按鍵與搖桿接入一般入口；修正圖集定位與禁用態過暗。Chrome實際進入1-1並驗證鎖定／靜音／暫停；保留原頭像與計量條。獨立PNG衍生檔、完整戰鬥和觸控回歸待做。

- [2026-11-14 P1 介面大批素材與遊戲套用預覽（Codex）](handoffs/2026-11-14-game02-interface-preview.md)：新增八張介面圖集，連同戰鬥按鍵本輪合計十二張／66 項；可切換新舊美術、窄螢幕及介面檢視。Chrome 已目視驗證；正式切圖及完整戰鬥驗收待做。Claude OAuth 過期未執行成功，預覽由 Codex 製作。

- [2026-11-14 P1戰鬥按鍵與搖桿（Codex）](handoffs/2026-11-14-game02-combat-buttons.md)：四張透明圖集，共24個狀態／部件，包含普攻、閃避、變身、四技能三態、變身發光版及搖桿；附切圖起點與本機預覽。正式256／384衍生圖及狀態對齊待完成，未接runtime。
- [2026-11-14 勇氣超人：非戰鬥曲全數接上、主角頭像接入（Claude）](handoffs/2026-11-14-game02-music-final-portraits.md)：標題、對話、倒下、結局、製作名單曲與 3-1 專屬曲接上，BGM 全數完成（音效仍缺）；HUD 頭像改用正式圖。計量條圖集與罪惡感爆炸序列尚未接入。

- [2026-11-14 勇氣超人：非戰鬥曲 + 3-1，**音樂全數完成**（音樂階段）](handoffs/2026-11-14-game02-music-nonbattle-final.md)：交 `bgm_title`／`bgm_transform`（硬切、非電音）／`bgm_defeat`／`bgm_talk`／`bgm_ending`／`bgm_credits` 與專屬 `bgm_stage_3_1`。`manifest.json` 音訊區**已無 null**，所有 BGM 到位（26 首）。尚缺音效 SFX 與配音。分支 `claude/brave-guy-music`，未改 `js/`。

- [2026-11-14 勇氣超人：接上變身曲與其餘關卡曲（Claude）](handoffs/2026-11-14-game02-music-brave-wiring.md)：合併音樂分支第二批 7 首；變身改播正式的 `bgm_brave`；黑影戰（1-4、2-2、4-1）守關者登場後不再切成通用守關曲。同時收進 Codex 的 HUD 素材（頭像、計量條圖集、罪惡感爆炸序列），**HUD 素材尚未接入**。

- [2026-11-14 勇氣超人：變身曲 `bgm_brave` + 其餘關卡戰鬥曲（音樂階段）](handoffs/2026-11-14-game02-music-brave-batch.md)：交 `bgm_brave`、`bgm_stage_2_2`、`3_2`、`3_3`、`3_4`、`3_5`、`4_1`（各 ogg+mp3、−16 LUFS、無縫循環），已換掉暫代曲。**所有關卡戰鬥曲與變身曲皆有專屬曲**；尚缺非戰鬥曲（title/transform/defeat/talk/ending/credits）。分支 `claude/brave-guy-music`，未改 `js/`。

- [2026-11-14 P1 HUD核心素材（Codex）](handoffs/2026-11-14-game02-hud-core.md)：兩個主角透明頭像、八部件計量圖集、4×2罪惡感爆炸圖已產出，附尺寸／alpha紀錄、切圖建議與本機預覽。正式切圖、512衍生檔、九宮格與遊戲接入尚待驗證。

- [2026-11-14 勇氣超人：新遊戲 icon 接入（Claude）](handoffs/2026-11-14-game02-icon-integration.md)：首頁第二款卡片與遊戲分頁圖示改用 `icon_01_logo.png` 的無損 WebP 衍生檔（512／256）。追加：開始畫面改用核准的 Logo。橫幅尚未接入。

- [2026-11-14 新美術素材Git交付（Codex）](handoffs/2026-11-14-game02-art-git-delivery.md)：使用者授權提交並推送本輪32張PNG（含Logo遊戲icon）、提示詞與交接文件；素材驗收限制仍保留，未接runtime。

- [2026-11-14 遊戲Icon加入Logo（Codex）](handoffs/2026-11-14-game02-icon-logo.md)：依使用者要求新增 `icon_01_logo.png`，主角出拳封面加雙語Logo，原生1254×1254；無字版保留，未接runtime或推送。

- [2026-11-14 P1首頁封面與橫幅（Codex）](handoffs/2026-11-14-game02-branding-cover-banner.md)：新增方形主角出拳封面1254×1254、三角色橫幅2172×724，均原生RGB PNG。橫幅尺寸符合既有3:1來源規格；左側放字區及手機裁切待整合驗證。未替換runtime、未推送。

- [2026-11-14 P1九張單視角參考暫稿（Codex）](handoffs/2026-11-14-game02-p1-reference-drafts.md)：依使用者「繼續」，小天使／惡夢超人／幹譙龍初始各三視角已保存；全為原生1254×1254、近白背景，未達2048與嚴格純色，多視角幾何一致性仍待校準。未送Tripo、未推送。

- [2026-11-14 P1三張角色合輯審稿（Codex）](handoffs/2026-11-14-game02-p1-character-sheets.md)：小天使、惡夢超人、幹譙龍三型態同張已實際生成並保存；均原生1536×1024，達最低尺寸，造型及背面提案待審。此進度取代下方歷史報告「未啟動P1」狀態；P0單視角技術限制仍保留，未送Tripo、未推送。

- [2026-11-14 P0單視角參考v2：白底、手部與鞋圓片校正（Codex）](handoffs/2026-11-14-game02-p0-reference-revision.md)：六張均已精修保存；手掌／手背、外側鞋圓片、側身Logo投影改善。仍原生1254×1254且白底採樣253–255，未通過2048與嚴格純色規格，未送Tripo。

- [2026-11-14 P0角色已確認，六張建模參考暫稿（Codex）](handoffs/2026-11-14-game02-p0-3d-reference-drafts.md)：學生／勇氣超人各正面、左側、背面已實際生成；原生1254×1254未達2048要求，背景、手部及配件一致性未通過技術驗收。未送Tripo、未啟動P1、未推送。

- [2026-11-14 主 Logo 已核准，兩張 P0 合輯更新（Codex）](handoffs/2026-11-14-game02-approved-logo-followup.md)：使用者「Logo ok」並要求繼續；兩張角色合輯更新新版品牌，學生全黃上衣同步至角色文件／生成器。角色造型待審、原生1536×1024；正式高解析Logo待補。此狀態取代以下歷史報告的等待Logo／暫停說明，尚未啟動3D或P1。

- [2026-11-14 幹譙龍三型態合輯已確認（Codex）](handoffs/2026-11-14-game02-ganqiao-sheet-confirmed.md)：初始／中階／完全體共一張合輯；各型態 3D 單視角參考仍獨立、合計9張。已同步需求、角色文件及生成器；沒有啟動 P1，角色仍等待主 Logo 定案。

- [2026-11-14 勇氣超人：新版主 Logo 與 P0 角色審稿（Codex／APHASEN）](handoffs/2026-11-14-game02-art-logo-review.md)：使用者改為先確定新版主 Logo；已做透明 Logo 第一稿與兩張角色暫稿，學生上衣依更正改全黃。均原生1536×1024；Logo尚未達寬2400規格，造型未批准，未接入／提交／推送／部署。Library傳輸不可用，成果留本機。

- [2026-11-14 勇氣超人：接上地圖一各關與 2-1 的戰鬥曲（Claude）](handoffs/2026-11-14-game02-music-stage1-wiring.md)：合併音樂分支 `claude/brave-guy-music` 的五首；地圖一每關都有自己的曲子。**這次收到的只有音樂，沒有美術或模型。**

- [2026-11-12 勇氣超人：關卡戰鬥電音（地圖一全數 + 2-1）（音樂階段）](handoffs/2026-11-12-game02-music-stage1.md)：依 MUSIC.md v1.2 做每關不同電音；交 `bgm_stage_1_0/1_2/1_3/1_4` 與 `bgm_stage_2_1`（各 ogg+mp3、−16 LUFS、無縫循環），地圖一一般戰鬥（1-0～1-4）全到位；六鍵已填 manifest，母帶於 `_archive/`，規格 `assets/source/AUDIO_DELIVERY.json`。分支已對齊主線，未改 `js/`。

- [2026-11-13 勇氣超人：美術製作需求 v2.1（Claude）](handoffs/2026-11-13-game02-art-requirements-v21.md)：對照現況重新核對 [`ASSETS.md`](../02_brave_guy/assets/ASSETS.md)，新增小地圖、鎖定、難度、泡泡等介面素材；優先級不變。**需由使用者轉交 GPT，尚無正式美術交付。** 另新增 3D 外包需求 [`MODELS_3D.md`](../02_brave_guy/assets/MODELS_3D.md)（21 個角色、8 個道具、動作清單與技術規格）。

- [2026-11-12 勇氣超人：小地圖、三種難度、體型大小、俊熊補血、嗆聲與頂嘴（Claude）](handoffs/2026-11-12-game02-minimap-difficulty.md)：可點擊縮放的小地圖；輕鬆／普通／地獄（地獄同場最多 120 隻、鋪滿地圖）；小怪分大中小；小天使變身結束 10 句嗆聲、主角會回嘴。

- [2026-11-12 勇氣超人：新字型與中英語系切換（Claude）](handoffs/2026-11-12-game02-fonts-i18n.md)：粉圓體＋思源黑體 Black（子集內嵌）；標題與暫停選單可切換中文／English，598 條翻譯；改文字後要重跑 `tools/make_game02_fonts.py`。

- [2026-11-12 勇氣超人：招式全開、變身專用音樂、接上地圖二三的戰鬥曲（Claude）](handoffs/2026-11-12-game02-brave-bgm-wiring.md)：開發期間每關都能用全部招式；變身期間切到 `bgm_brave`（目前暫用主題 demo，正式曲需求已開在 MUSIC.md）；`bgm_wild`／`bgm_office`／`bgm_office_mute` 已填進各關的鍵。

- [2026-11-12 勇氣超人：自動鎖定、怪量加倍、怪會嘲諷、招式加強（Claude）](handoffs/2026-11-12-game02-lock-crowd-taunts.md)：「鎖」按鈕（T 鍵）；每波怪量約三倍並排隊補進場；小怪輪流講賤話、變身後改求饒；三小招範圍加大，大招收尾全場清空。追加：開發期間關卡預設全開（`DEV_UNLOCK`，正式完成時要關）。

- [2026-11-12 勇氣超人：電腦操作改為滑鼠攻擊與鍵盤快捷鍵（Claude）](handoffs/2026-11-12-game02-pc-controls.md)：左鍵普攻、右鍵閃避、Q／E／R 小招、F 大招、空白鍵變身；攻擊朝游標方向。

- [2026-11-12 勇氣超人：載入與效能改善（Claude）](handoffs/2026-11-12-game02-performance.md)：修正舊頁面配新程式卡住、載入失敗無提示、移除 import map、畫質分級與自動降級、小怪改假陰影。後續確認原因是使用者的瀏覽器無法建立 WebGL；已加上失敗說明與讀取進度條。

- [2026-11-12 勇氣超人：遊戲底層完成，14 關可玩（Claude）](handoffs/2026-11-12-game02-all-stages.md)：選關與存檔、劇情對話、14 個場景、12 種守關者；落差見企劃書 10.5 節；音樂需求 v1.2。**尚無真人試玩。**

- [2026-11-12 勇氣超人：鎖定畫面大小，防止操作時網頁被拉近（Claude）](handoffs/2026-11-12-game02-viewport-lock.md)：攔截兩指縮放、連點放大、Ctrl＋滾輪；頁面固定不捲動。

- [2026-11-12 勇氣超人：電音音樂交付（P0＋各地圖戰鬥曲）（Claude）](handoffs/2026-11-12-game02-music-p0.md)：依使用者指定改為**硬派電音、每關不同**；交 7 首（`bgm_campus`／`bgm_boss`／`jingle_clear`／`bgm_wild`／`bgm_office`／`bgm_office_mute`＋主題 demo，各 `.ogg`＋`.mp3`，−16 LUFS、無縫循環），母帶於 [`_archive/02_brave_guy/music/`](../_archive/02_brave_guy/music/)，規格表 [`02_brave_guy/assets/source/AUDIO_DELIVERY.json`](../02_brave_guy/assets/source/AUDIO_DELIVERY.json)；六個鍵已填入 manifest（地圖二三的三首已於同日由 Claude 接到各關）。分支 `claude/brave-guy-audio`。

- [2026-11-11 勇氣超人：音樂與音效製作需求（Claude）](handoffs/2026-11-11-game02-music-requirements.md)：[`02_brave_guy/assets/MUSIC.md`](../02_brave_guy/assets/MUSIC.md)，交另一個工作階段製作。第二款遊戲已合併並上線。

- [2026-11-11 勇氣超人：設計底 D1 實作與美術製作需求 v2.0（Claude）](handoffs/2026-11-11-game02-braveguy-d1.md)：原型已改成勇氣超人的核心玩法（兩種型態、四條計量、三小招一大招、變身）；進度見 [`02_brave_guy/PROGRESS.md`](../02_brave_guy/PROGRESS.md)；美術需求見 [`02_brave_guy/assets/ASSETS.md`](../02_brave_guy/assets/ASSETS.md)。

- [2026-11-11 第二款遊戲改為《勇氣超人 Brave Guy》：概念圖歸檔與企劃書（Claude）](handoffs/2026-11-11-game02-braveguy-design.md)：企劃書 [`02_brave_guy/DESIGN.md`](../02_brave_guy/DESIGN.md)、劇情腳本初稿 [`02_brave_guy/SCRIPT.md`](../02_brave_guy/SCRIPT.md)、角色設定集 [`02_brave_guy/CHARACTERS.md`](../02_brave_guy/CHARACTERS.md)；名稱已改（當時原型仍是仙俠佔位版；已於 D1 改掉）。

- [2026-11-11 第二款遊戲：首頁入口、簡單版美術、美術優先級清單（Claude）](handoffs/2026-11-11-game02-hub-entry-simple-art.md)：首頁新增第二款卡片（當時暫名青玉劍試煉，已改為勇氣超人）；65 張 SVG＋17 張三視圖暫代圖；優先級見 [`02_brave_guy/assets/ASSETS.md`](../02_brave_guy/assets/ASSETS.md)。

- [2026-11-10 第二款遊戲（3D 仙俠戰鬥）：影片分析、交 GPT 的素材需求、佔位版原型（Claude）](handoffs/2026-11-10-game02-battle-analysis-and-reqs.md)：需求 [`02_brave_guy/assets/ASSETS.md`](../02_brave_guy/assets/ASSETS.md)、進度 [`02_brave_guy/PROGRESS.md`](../02_brave_guy/PROGRESS.md)；可玩但全為佔位素材（首頁入口於 11-11 加入）。

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
