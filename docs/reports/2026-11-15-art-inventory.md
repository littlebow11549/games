# 美術庫存 × Claude 需求 × 玩家畫面完成度

> 後續製作請優先使用[美術來源對照](2026-11-15-art-source-ledger.md)。本頁是初次盤點快照，不能直接作生圖清單。

盤點基準：遠端 `3228adf`；本輪新圖另列。掃描全 repo 555 個媒體檔（含首頁、第一款遊戲、來源、衍生與歷史版本），逐檔路徑、尺寸、模式、SHA256 見 [CSV](2026-11-15-assets-files.csv)，分支證據見 [JSON](2026-11-15-assets-audit.json)。第二款遊戲原有 103 張來源 PNG，本輪新增 17 張；檔案數不等於需求完成件數。

需求依據：`02_brave_guy/assets/ASSETS.md`、`ART_OUTSTANDING_2026-11-15.md`、`MODELS_3D.md`、最新交接；接入依據：index.html、CSS、main.js、manifest。這份庫存不能把「沒有獨立檔名」等同「沒有做」，也不能把「有圖」等同「玩家畫面已完成」。

## 優先修正的玩家畫面

| 畫面 | 原先已有 | 實際缺項 | 處理 |
|---|---|---|---|
| 選關 | 14 關資料、開放/鎖定/過關狀態、CSS 卡片 | 缺少完整美術整合，卡片與標題待統一 | 用既有素材接入，保留狀態與觸控捲動；等寬卡片 |
| 暫停 | 八功能圖示圖集、繼續/重開/返回、語系 | 框及標題仍 CSS；標題描邊破壞可讀性；按鈕寬度不一 | 接入框與標題牌，去掉粗文字描邊，按鈕及語系等寬 |
| 每關結算／失敗／終章 | 突破/倒下/醒來與成績文字、下一關/重打/選關邏輯 | 共用普通 CSS 卡；沒有完整美術版面 | 共用正式框、標題牌、按鈕，保留最後一關無下一關 |
| 主標題頁 | Logo、icon、banner、漫畫布局 | banner 裁切不適合橫直版 | 本輪兩張 keyart 已出，尺寸與裁切待驗證 |

## 已製作的素材：先使用，不重新生成

路徑以下均相對 `02_brave_guy/assets/source/pic/`。

| 需求 | 已有來源 | 狀態／下一步 |
|---|---|---|
| 16 位角色設定 | `sheet/unified/` 16 PNG | 已有統一頁首；不是16個正式3D模型。內頁比例等歷史缺陷保留，不整批重畫 |
| 主角、勇氣超人、小天使、惡夢超人、初始幹譙龍三視角 | `concept/{student,braveguy,angel,nightmare,ganqiao}_{front,side,back}.png` 15張 | 已有暫稿，1254²、背景／一致性待驗收；不是未製作 |
| 其他 concept | 17張舊仙俠佔位＋6張history | 不算 Brave Guy 正式缺件已補齊 |
| 主角頭像 | `ui/portrait_student.png`、`portrait_brave.png` | 已有 runtime WebP 並接入 |
| 計量條、頭像框、氣環 | `ui/hud_core_sheet.png` 8部件 | 已有圖集；切圖、九宮格和接入待做，不重畫 |
| 罪惡感爆炸 | `ui/guilt_explode_sheet.png` 8格 | 已有來源，序列接入待做 |
| 攻擊／閃避／變身／四技能 | `icons/btn_attack_sheet.png`、`btn_dodge_transform_sheet.png`、`skill_buttons_sheet.png` | 七操作三態已接；獨立衍生檔仍待，不重畫 |
| 搖桿與變身可用 | `ui/control_extras_sheet.png` | 搖桿已接，發光版待接 |
| 功能鍵 | `icons/function_icons_sheet.png` | 暫停、聲音、繼續、重開、返回等已有且部分接入 |
| 鎖定與回血 | `icons/lock_heal_sheet.png` | 鎖定三態已接；地面圈／回血素材待對照接入 |
| 難度徽章 | `ui/difficulty_sheet.png` | 三難度雙態已接 |
| 小地圖 | `ui/minimap_sheet.png` | 外框、三敵點、主角箭頭已接；底圖、熊頭待接 |
| 任務、彈窗、劇情對話框 | `ui/panel_sheet.png` | 三種框確實已畫；任務框已接，其他未完整接。§4.5 是新款風格需求，不是原來一張都沒有 |
| 四種泡泡 | `ui/bubble_sheet.png` | 小天使已接；其他有 feedback-art.css 但 index 未載入 |
| Boss／敵人血條、連擊底、文字按鈕 | `ui/aux_hud_sheet.png` 8部件 | 都有圖；未接入不能當未製作 |
| 情勒賓果 | `ui/bingo_card.png` | 已有25格來源 |
| 品牌 | `branding/logo_01_review_v1.png`、`icon_01.png`、`icon_01_logo.png`、`banner_01.png` | 已有，runtime 4張 WebP；Logo寬1536低於2400。banner 已在選單引用，舊報告「未接」過時 |
| BGM | 29個檔名各 mp3+ogg，共58檔 | manifest 24個音樂鍵均有路徑；含舊曲/demo/別名，不能說29首全在播 |

既有 UI/按鍵 PNG 共16檔：11個 ui + 5個 icons（包含頭像與賓果，不能全稱圖集）。

## 本輪已生成：與原庫存分開

- 主選單2張：`branding/menu_keyart_01.png` 1330×1182、`menu_keyart_portrait_01.png` 1448×1086，低於指定尺寸；已本機提交，未發布。
- 新UI／道具5張：`ui/panel_popup.png` 1254²、`panel_title_plate.png` 2172×724、`btn_text.png` 2172×724（2列×3態）、`resume.png` 1536×1024（2版）、`counter_suanle.png` 1536×1024（2版）。全部RGBA；彈窗中央有半透明像素，需搭配純色CSS底，不可當完全不透明。履歷實際線數與5欄需求不符，待修，不列正式完成。
- 場景10張：dorm/corridor/court/office/gate/forest/village/desk/lobby/openoffice，均在 `background/scene_*.png`。是本輪過早生成的待核對新稿，不冒充既有成品，不視為已套用遊戲。使用者指出已有場景，已停止繼續生成，不再自動重畫。

## 場景特別核對

`js/world.js` 已有14個可玩場景主題：dorm、corridor、court、office、gate、forest、village、desk、lobby、openoffice、meeting、callcenter、bossroom、core，包含地面、光線、擺設與迷宮。**場景不是完全沒做。**
已檢查 GitHub 10 個分支目前樹（含舊資料夾 `02_xianxia_battle`）：在 scene/background 名稱與目錄中，未找到這14張既有正式場景PNG或GLB來源；這只代表目前 repo 可取到的檔案沒有，不能證明其他聊天／未推送工作區沒有。外部既有場景來源列「待定位」，而非「確定未製作」。也不能用2D概念圖取代已有3D場景。

## Repo 中尚未找到獨立交付檔（不能直接判定未製作）

| 項目 | Claude需求 | 可核實的缺口 |
|---|---|---|
| 角色GLB | 21角色＋8道具，骨架與具名動畫 | source/models無檔；manifest 7鍵null。3D由Claude/Tripo或外包流程負責；目前未設定Tripo金鑰 |
| 其餘角色單視角 | P2 8角色/型態×3、P3 5×3 | 39張未找到；另7套職場衣裝，不能把已存在合輯算成三視角 |
| 道具參考 | 紙扇、哨子、面具、皇冠、手機 | 5張單獨參考未找到 |
| 變身演出 | §6 13件 | transform來源未找到；已有程式演出不等同13張圖 |
| 對話表情 | 小天使8＋主角3型態×5 | 合輯內已有多種表情；獨立檔未找到不代表要重畫。必須先逐格核對合輯並以既有圖整合 |
| 上班族HUD頭像 | portrait_worker | 未找到 |
| 教學 | howto_01 | 只有SVG，正式PNG未找到 |
| 場景概念／貼圖／共用背景 | 14概念＋貼圖＋3背景 | 程式場景已有；既有外部圖片待定位，本輪新10張另列；不直接重生其餘 |
| SFX | manifest 11插槽；MUSIC另列細項 | 11鍵全null，沒有正式來源音效；現有WebAudio合成可用。配音另案，不自動加入本次美術範圍 |
| 字藝／特效／數字 | 11字樣、9貼圖、4數字圖集 | 選做；現有SVG/程式功能，不列必須優先重畫 |

## 盤點後執行原則

先完成使用者點名的選關、暫停、每關結算，並讓按鈕等寬。已有圖集先接入，不重畫。未知外部來源保持待定位，不以檔名缺失判未製作。每個項目分開紀錄來源、規格、接入、驗證、發布五種狀態；本報告的盤點基準不會隨後續完成而被誤讀成最新驗收。

## 盤點更正：禁止以獨立檔缺失啟動生成

使用者再次指出重複製作。本輪錯將未找到獨立PNG的變身／頭像直接排入生成，屬盤點方法錯誤。所有生成佇列已終止；已生成的新圖保留本機但不作正式交付、不接入、不計入既有完成數。合輯、圖集、程式場景、其他工作階段的素材都須納入來源對照。本文「未找到」僅指目前可見repo證據，不代表使用者沒有做過。後續先處理使用者明確指出的三個UI畫面。
