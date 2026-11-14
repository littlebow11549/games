# 🎨 勇氣超人 Brave Guy — 美術製作需求（交 GPT／Codex，v2.1，2026-11-13）

依全專案標準範本（`/ASSETS_TEMPLATE.md`）。產出後依「路徑」放檔，**檔名勿改**，Claude 才接得到。
圖片僅可無損壓縮，保留原生解析度與透明度（見 `/AGENTS.md`）。

**開工前必讀**
- 企劃書 [`../DESIGN.md`](../DESIGN.md)、角色設定集 [`../CHARACTERS.md`](../CHARACTERS.md)、劇情腳本 [`../SCRIPT.md`](../SCRIPT.md)。
- 造型一律以使用者的概念圖為準，放在 `source/pic/reference/`：
  `braveguy_cover_front.jpg`（封面）、`braveguy_cover_back.jpg`（封底）、`braveguy_ganqiaolong_*.png`、`braveguy_jiasen.png`、`braveguy_folaidi.png`。
- 舊版素材已全部遺失，只有這些圖。所有東西都要重做。
- 使用者會親自把關品質。

**現況（v2.1 更新）**：遊戲底層已完成，14 關都能玩（三張地圖加終章、12 種守關者、劇情對話、三種難度、小地圖、自動鎖定、怪的嘲諷泡泡、暫停選單、中英語系），線上版 <https://littlebow11549.github.io/games/02_xianxia_battle/>。**畫面上所有東西仍是程式拼的佔位美術**，一張正式圖都還沒有。

**v2.1 相對 v2.0 的變動**：新增 §4.4（小地圖、鎖定、難度、語系、泡泡）；§7 補上 3-0 的場景；§8 說明字改由程式疊字型，字藝降為選做；§3 補充小怪會被縮放成大中小；§12 音樂方向改為電音。優先級不變。
`source/pic/` 裡現有的 SVG 與 `concept/` 的 PNG 都是 Claude 做的暫代圖，正式圖到位後替換。

---

## 0. 全域設定

| 項目 | 規定 |
|------|------|
| 畫風 | 逗趣可愛的日系卡通、**粗黑描邊**、高彩度平塗加簡單陰影，與概念圖一致 |
| 比例 | **保留概念圖原本的比例**（人形約 4–5 頭身），不改 Q 版 |
| 畫面 | 手機橫式 16:9，設計基準 1920×1080 |
| 配色 | 勇氣綠 `#3FB53A`／能量亮綠 `#9BE564`／外套黃 `#F6C21C`／圍巾紅 `#E23A1E`／橘 `#F28A1B`／天使粉 `#F48FC6`／罪惡感紫 `#8A4FD6`／描邊黑 `#111111` |
| 字 | 繪圖 AI 的中文字容易出錯。需要中文字的圖請逐字檢查；不確定就先出無字版，字由程式疊 |

**統一風格提示詞（貼在每則開頭，並附上概念圖）**
```
consistent game art series for "Brave Guy", cute and funny Japanese cartoon style,
thick black outlines, flat vivid colors with simple cel shading, same character designs
and body proportions as the attached concept art (not chibi), palette of brave green,
jacket yellow, scarf red and orange, no watermark
```

---

## 1. 製作順序總表

原則：擋住遊戲進度的先做；Claude 能用程式暫代的後做。

| 優先 | 項目 | 章節 | 數量 | 為什麼排這裡 |
|------|------|------|------|--------------|
| **P0** | 角色設定合輯：主角・大學生、勇氣超人 | §2 | 2 張 | 定案主角造型，後面全部以此為準 |
| **P0** | 3D 生成用圖：上述兩個角色 | §3 | 各 3 張 | 換掉遊戲裡的積木人；Claude 會經 Tripo 轉 3D（需使用者的 API 金鑰） |
| **P1** | 角色設定合輯：小天使、惡夢超人、幹譙龍（三型態） | §2 | 3 張 | 序章與地圖一的核心 |
| **P1** | 3D 生成用圖：小天使、惡夢超人、幹譙龍初始型態 | §3 | 各 3 張 | |
| **P1** | HUD 與按鍵（含 v2.1 新增的小地圖、鎖定、難度、泡泡） | §4 | 約 40 件 | 玩家每一秒都看著它 |
| **P1** | Logo 與封面 | §5 | 3 件 | 首頁入口與開始畫面 |
| **P2** | 角色設定合輯與 3D 生成用圖：錢大姐、藍教頭、假森、佛賴弟、俊熊、地獄超人；另做幹譙龍中階與完全體的 3D 生成用圖（合輯已併入 P1） | §2 §3 | 6 張合輯；8 個角色／型態的 3D 用圖各 3 張 | 地圖一、二其餘角色 |
| **P2** | 第一次變身的演出素材 | §6 | 約 10 件 | 全遊戲只播一次的重頭戲 |
| **P2** | 場景概念圖與貼圖：校園 | §7 | 5 件 | 地圖一 |
| **P3** | 角色設定合輯與 3D 生成用圖：主角・上班族、夢魘超人、冠老闆、新雞、八卦蛇，以及校園角色的職場服裝 | §2 §3 | 5 個新角色＋7 套服裝 | 地圖三，且多數需要新設計 |
| **P3** | 場景概念圖與貼圖：荒野、職場、終章 | §7 | 約 12 件 | 地圖二、三 |
| **P3** | 數字、特效貼圖、教學圖、小天使表情貼圖；字藝（選做） | §8–§11 | | 程式已有暫代版；字已改用內嵌字型 |
| 另計 | BGM、配音 | §12 | | 使用者負責 |

---

## 2. 角色設定合輯　`source/pic/sheet/`

使用者要求：**每一個角色都要做角色設定合輯**。版式、每個角色要填的內容（定位、個性、台詞、外觀、身高、5 色、6 表情、6 細節、變體）、
可直接貼的提示詞，全部在 [`../CHARACTERS.md`](../CHARACTERS.md)。

| 規格 | 內容 |
|------|------|
| 檔名 | `sheet_{id}.png`（id 見角色設定集各小節） |
| 尺寸 | 3072×2048（至少 1536×1024），橫式 |
| 版式 | 參考 `reference/sheet_layout_example.webp`：標題列、角色檔案、5 色配色、5 角度轉面圖、6 表情、6 細節、身高比例 |
| 數量 | 16 個角色各一張 |

那張版式範例是別的角色，只取版式，不沿用它的角色、Logo、配色。

**使用者已確認**：幹譙龍初始、中階、完全體三型態共同製作在同一張 `sheet_ganqiao.png`，不拆成三張；P1 合輯數量不變。主 Logo 已獲使用者「Logo ok」核准，並指示繼續後續處理；兩張 P0 合輯已更新 Logo，角色造型也已獲使用者確認；六張單視角參考暫稿已產出，技術驗收仍待完成。大學生上衣（含袖子與袖口）依使用者更正為全黃。

**P1製作進度（2026-11-14）**：依使用者持續指示製作，已產出 `sheet_angel.png`、`sheet_nightmare.png`、`sheet_ganqiao.png` 三張造型審稿。均為原生1536×1024 RGB PNG，達最低尺寸，未達3072×2048建議尺寸；未插值放大。幹譙龍三型態同張，各列五角度。原圖未顯示的背面／結構為提案，身高圖不是精密比例尺；P1尚待使用者確認，未製作其單視角3D參考。交接見 `docs/handoffs/2026-11-14-game02-p1-character-sheets.md`，實測見 `source/P1_REVIEW_DELIVERY.json`。

## 3. 3D 生成用圖　`source/pic/concept/`

**P1製作進度（2026-11-14）**：使用者於三張合輯交付後指示「繼續」，已製作小天使 `angel`、惡夢超人 `nightmare`、幹譙龍初始 `ganqiao` 各 `front/side/back.png`，共九張暫稿。均原生1254×1254 RGB，未達2048；近白背景採樣249–255，非嚴格純白。圍巾／髮束／翅膀已作厚形適配，但多視角幾何與新增結構仍待審核，不是正式Tripo輸入。詳見 `docs/handoffs/2026-11-14-game02-p1-reference-drafts.md` 與 `source/P1_3D_REFERENCE_DELIVERY.json`。中階與完全體未製作。

**P0製作進度**：使用者已確認兩張角色合輯。已產出 `student_front/side/back.png`、`braveguy_front/side/back.png` 六張建模參考暫稿；v2已修正手部、外側鞋圓片及側面Logo投影，並改白底；實測仍1254×1254，未達下表2048規格，背景採樣253–255亦非嚴格純白，尚不可視為正式Tripo輸入。詳見 `docs/handoffs/2026-11-14-game02-p0-reference-revision.md`。

合輯定案後再出。這批圖會直接送進圖轉 3D，**規格比好看重要**。

幹譙龍三型態的合輯雖合併，每個型態仍各自獨立製作正面、左側、背面各一張，共 9 張單視角參考；初始型態為 P1，中階與完全體為 P2，數量與優先級不因合輯合併而減少。

| 規格 | 內容 |
|------|------|
| 一張圖 | **只有一個角度、一個角色** |
| 每個角色 | 正面、側面（左）、背面各一張，比例與服裝細節三張一致 |
| 尺寸 | 2048×2048，PNG |
| 背景 | 純色（中性灰 `#808080` 或純白），不要場景、陰影、特效光 |
| 姿勢 | 人形用 **A 字站姿**：雙臂向下張開約 45°，手上不拿東西，雙腿微開。非人形（幹譙龍完全體、冠老闆、八卦蛇）用自然站姿 |
| 表情 | 中性，嘴閉 |
| 細薄的部件 | 圍巾、長髮、翅膀、馬尾、帽子尖角要**畫厚、貼身、不鏤空**，否則轉 3D 會破 |
| 道具 | 另出一張：紙扇、哨子、面具、皇冠、手機 |
| 檔名 | `{id}_front.png`、`{id}_side.png`、`{id}_back.png` |

**小怪會被程式縮放成大中小三種（0.78／1／1.4 倍）**，守關者版（佛賴弟王、加班鬼王、特大隻的悶幹譙）是同一個模型放大約 2.5 倍，不需要另外畫；所以小怪的設計放大後要耐看，細節不要太碎。

`concept/` 裡現有的 17 張是舊佔位角色的輸出，已作廢，僅留作「一張一個角度、純色背景」的規格示範。

---

## 4. HUD 與按鍵　`source/pic/ui/`、`source/pic/icons/`

全部去背 PNG。可用圖集一次生成，排版不需對齊，Claude 會切圖。
樣式方向：粗黑描邊的漫畫風，不要仙俠或金屬質感。框類請做成**可九宮格拉伸**（四角有裝飾、中段素面）。

### 4.1 左上角：頭像與計量條

**製作進度（2026-11-14）**：`portrait_student.png`、`portrait_brave.png` 已產出原生1254×1254透明來源；八個外框／計量部件合併於 `hud_core_sheet.png`（1536×1024透明圖集）；`guilt_explode_sheet.png` 為1536×1024、4×2格透明序列。依本節允許圖集交付，正式切圖與512頭像衍生檔尚待完成；切片建議與alpha驗證見 `source/P1_HUD_SLICE_GUIDE.json`、`source/P1_HUD_DELIVERY.json`。尚未接runtime或驗證九宮格，`portrait_worker`未製作。

| 檔案 | 內容 |
|------|------|
| `ui/portrait_student.png`、`portrait_brave.png`、`portrait_worker.png` | 主角三種型態的頭像，512×512，圓形構圖 |
| `ui/portrait_frame.png` | 頭像外框 |
| `ui/bar_frame.png` | 計量條外框（共用，可橫向拉伸） |
| `ui/bar_hp.png` | 血量（紅） |
| `ui/bar_courage.png`、`bar_courage_full.png` | 勇氣（綠）；集滿時的發光版。造型呼應 Logo 的綠色能量球 |
| `ui/bar_guilt.png`、`bar_guilt_crack.png` | 罪惡感（紫）；九成以上的裂痕版。要有「往下墜的重物」的感覺 |
| `ui/bar_qi.png` | 氣（黃），環形，套在大招鍵外圈 |
| `ui/guilt_explode_sheet.png` | 罪惡感條爆炸的序列圖，4×2 格 |

### 4.2 右下角：按鍵

**製作進度（2026-11-14）**：已產出 `icons/btn_attack_sheet.png`（2172×724）、`icons/btn_dodge_transform_sheet.png`、`icons/skill_buttons_sheet.png`、`ui/control_extras_sheet.png`（後三張1536×1024），均原生透明PNG，共24個狀態／部件。排列與切片起點見 `source/P1_BUTTONS_SLICE_GUIDE.json`；每顆正式256／384檔、狀態對齊與遊戲驗證尚待完成。詳見 `docs/handoffs/2026-11-14-game02-combat-buttons.md`。

每顆出「一般、按下、不可用（灰）」三態，256×256（普攻 384×384）。

| 檔案 | 內容 |
|------|------|
| `icons/btn_attack.png` | 普攻：拳頭 |
| `icons/btn_dodge.png` | 閃避：翻滾的殘影 |
| `icons/btn_transform.png` | 變身：紅圍巾。橫長膠囊形，另出「可變身」的發光版 |
| `icons/skill_dash.png` | 小招 1 勇氣衝拳：帶速度線的拳頭 |
| `icons/skill_ki.png` | 小招 2 氣功彈：綠色氣功球 |
| `icons/skill_quake.png` | 小招 3 氣功震地：拳頭捶地與衝擊環 |
| `icons/skill_ult.png` | 大招 超勇氣波：粗大的光束 |
| `ui/joystick_base.png`、`joystick_knob.png` | 虛擬搖桿 |

### 4.3 其他介面

| 檔案 | 內容 |
|------|------|
| `ui/bubble_angel.png` | 小天使的對話框（九宮格），白底黑框粉紅陰影 |
| `ui/bubble_enemy.png`、`bubble_enemy_scared.png`、`bubble_hero.png` | 頭上的對話泡泡（九宮格，下方有小尖角）。怪嘲諷用白底紅陰影；主角變身後怪求饒用淡藍底、抖抖的邊；主角頂嘴用淡黃底 |
| `ui/panel_quest.png` | 任務面板（九宮格）。位置已改到**左上血條下方** |
| `ui/panel_popup.png` | 通用彈窗：開始、暫停、結算（九宮格） |
| `ui/panel_dialog.png` | 劇情對話框（九宮格），含左右兩側放頭像的位置 |
| `ui/boss_bar.png` | 守關者血條（框、填充、名牌底） |
| `ui/enemy_bar.png` | 一般敵人小血條 |
| `ui/btn_text.png` | 通用文字按鈕（三態） |
| `ui/combo_plate.png` | 連擊數字的底板 |
| `icons/fn_pause.png`、`fn_sound_on.png`、`fn_sound_off.png`、`fn_settings.png` | 功能鍵 |
| `ui/bingo_card.png` | 小天使的情勒賓果卡（5×5，格子裡的字由程式疊） |
| `ui/resume.png` | 地圖三的履歷表：五個欄位，另出「全塗黑」與「空白」兩版 |
| `ui/counter_suanle.png` | 地圖三角落的「本月算了次數」計數器，另出冒煙壞掉版 |

### 4.4 v2.1 新增的介面

| 檔案 | 內容 |
|------|------|
| `ui/minimap_frame.png` | 小地圖外框，圓形，512×512 去背，中間鏤空。位置在右上角暫停鍵下方 |
| `ui/minimap_bg.png` | 小地圖底圖，圓形半透明深色，可有淡淡的同心圓 |
| `icons/map_dot_small.png`、`map_dot_mid.png`、`map_dot_boss.png`、`map_hero.png`、`map_bear.png` | 小地圖上的記號：小怪（紅小點）、強怪（橘中點）、守關者（紫大點，可做成骷髏或角）、主角（黃色箭頭）、俊熊（小熊頭，選做）。各 128×128 |
| `icons/btn_lock.png` | 自動鎖定鍵：準星。圓形，出「關、開（紅色發光）、按下」三態。位置在變身鍵左邊 |
| `fx/fx_lockon.png` | 被鎖定的怪腳下的紅色準星圈，512×512，黑底或去背，會在地面上旋轉 |
| `ui/badge_easy.png`、`badge_normal.png`、`badge_hell.png` | 難度徽章：輕鬆（綠，小天使打哈欠）、普通（黃）、地獄（紅，冒火）。各出「選中、未選中」兩態，無字版，字由程式疊 |
| `icons/fn_language.png` | 語系切換鍵：地球或對話框 |
| `icons/fn_resume.png`、`fn_restart.png`、`fn_home.png` | 暫停選單的三個選項圖示：繼續、重打、回標題 |
| `icons/heal.png` | 抓到俊熊回血時跳出的愛心或加號 |

## 5. 品牌　`source/pic/branding/`

**含Logo遊戲Icon（2026-11-14）**：依使用者要求，新增 `icon_01_logo.png`，以方形出拳封面加入已核准雙語Logo，原生1254×1254 RGB PNG；原無字版保留。此為生成式合成，並非Logo原檔逐像素貼入。詳見 `docs/handoffs/2026-11-14-game02-icon-logo.md`，尚未接入網站runtime。

**封面／橫幅進度（2026-11-14）**：已生成 `icon_01.png`（原生1254×1254，保留來源尺寸，尚無精確1024衍生檔）及 `banner_01.png`（原生2172×724，與首頁既有banner來源尺寸一致）。兩張均RGB PNG、未放大；構圖待審，未接runtime。橫幅左側完全留白約28%，放字與手機裁切仍需實際版面檢查。詳見 `docs/handoffs/2026-11-14-game02-branding-cover-banner.md` 及 `source/P1_BRANDING_DELIVERY.json`。

**目前核准設計**：使用者已確認 `logo_01_review_v1.png` 的新版造型（綠能量球、金紅雙語字、紅圍巾）。原生 1536×1024、透明 PNG；檔名保留來源追溯。設計已定案但尚未達下表寬2400以上，不以插值放大補足，也尚未以正式 `logo_01.png` 接入遊戲。詳見交接 `docs/handoffs/2026-11-14-game02-approved-logo-followup.md`。

| 檔案 | 內容 | 尺寸 |
|------|------|------|
| `logo_01.png` | 遊戲 Logo：**照概念圖封面中央的造型重繪**（綠色能量球＋橘紅金立體字「BRAVE GUY」＋上方中文「勇氣超人」），去背 | 寬 2400 以上 |
| `icon_01.png` | 首頁遊戲列表封面：勇氣超人出拳的臉部特寫＋綠色能量球 | 1024×1024 |
| `banner_01.png` | 首頁橫幅：勇氣超人與小天使在前，惡夢超人的影子在後，左側留空放字 | 沿用 01 的 banner 尺寸 |

## 6. 第一次變身的演出素材　`source/pic/transform/`

全遊戲只播一次（序章），約 12–15 秒，參考魔法少女動畫的套路：畫面極度認真，好笑的是被變身的人和旁邊等的人（企劃書 4.6、腳本 1040–1052）。
只參考類型套路，配樂、姿勢、分鏡自製，不沿用特定作品的畫面。

| 檔案 | 內容 |
|------|------|
| `tf_bg_stars.png` | 星空與彩帶背景，1920×1080，可循環捲動 |
| `tf_silhouette.png` | 主角**全身發光的剪影**：純色發光體，**不畫任何身體細節**，莊嚴的旋轉姿勢，去背 |
| `tf_glove.png`、`tf_knee.png`、`tf_jacket.png`、`tf_hair.png`、`tf_scarf.png` | 五個著裝特寫（手套、護膝、外套、頭髮豎起、圍巾繞上），各 1920×1080 |
| `tf_pose.png` | 落地定格姿勢，背後爆出大字（字由程式疊） |
| `tf_waiting_1.png`–`tf_waiting_4.png` | 插入鏡頭：四隻小幹譙在旁邊等（問能不能打、吃洋芋片嫌棄、躺下睡著、做伏地挺身） |
| `tf_sign.png` | 小天使舉的「請稍候」牌子 |

## 7. 場景　`source/pic/background/`、`source/pic/scene/`

場景會做成 3D。這裡要的是**概念圖**（定氣氛與配色）和**貼圖**。每張地圖一張概念圖 1920×1080，另依需要出貼圖 1024×1024 可無縫拼接。

| 地圖 | 概念圖 | 氣氛 | 貼圖與物件 |
|------|--------|------|------------|
| 序章 宿舍（1-0） | `scene_dorm.png` | 熟悉的房間但顏色偏暗、牆是歪的、門比平常大三倍；粉紅地毯（取自封底舊畫面） | 粉紅地毯、床、過大的門 |
| 地圖一 校園 | `scene_corridor.png`、`scene_court.png`、`scene_office.png`、`scene_gate.png` | 色調偏冷、有秩序但歪斜。紫色格紋地板的長廊、夜裡的籃球場、教官室、紫色夕陽的校門口 | 紫格紋地板、置物櫃、「截止」貼紙、躺椅、哨子、記過單、飄在空中的紙條 |
| 地圖二 荒野 | `scene_forest.png`、`scene_village.png` | 沒有路，光源只有主角自己的勇氣光。黑森林（一堆指向不同方向的路牌）、夜晚的木造村落（每扇窗都亮著） | 路牌、枯樹、木屋、井、黑紫色的火 |
| 地圖三 職場 | `scene_desk.png`（3-0 加班的辦公桌：深夜只剩一盞燈的座位，獎狀牆、灰掉的圍巾）、`scene_lobby.png`、`scene_openoffice.png`、`scene_meeting.png`、`scene_callcenter.png`、`scene_bossroom.png` | 灰白日光燈，唯一的顏色是主角找回的紅。**場景看得出是校園改建的**：打卡機是校門的形狀、開放辦公室地上還有籃球場的線、會議室門牌底下透出「教官室」 | 打卡機、隔板、螢幕全黑的電腦、飛來飛去的鍋子、影印機、金色棲木、畫出來的大餅、標語「不期不待，不受傷害」「公司就是你的家」 |
| 終章 核心 | `scene_core.png` | 校園、荒野、城市的碎片漂浮在黑霧中，中央一張辦公桌 | 黑霧、漂浮的碎片 |
| 共用 | `bg_loading.png`、`bg_result.png`、`bg_title.png` | 載入、結算、主選單（仿舊版：木牌上的選單，取自封底） | |

## 8. 字藝　`source/pic/titles/`（v2.1 改為選做）

遊戲裡的字已改由程式疊上（內嵌粉圓體與思源黑體 Black，並支援中英切換），**所以下面這些字藝不急**。要做的話請出中文版，英文版由程式處理。

去背 PNG，每個字樣一檔，寬 1200 以上。樣式同 Logo：粗黑描邊、黃字、紅色立體陰影。
`勇氣超人！`、`夠了！！`、`超勇氣波！`、`完美閃避`、`突破`、`倒下`、`心魔來襲`、`第`、`波`、`連擊`、`還行。`（結局便利貼的手寫字）。

## 9. 數字　`source/pic/numbers/`

| 檔案 | 內容 |
|------|------|
| `numbers_dmg.png` | 傷害數字 `0–9` `-`：白字黑邊紅陰影 |
| `numbers_crit.png` | 暴擊 `0–9` `-` `!`：黃字、更大、爆炸邊 |
| `numbers_combo.png` | 連擊數 `0–9`：黃字斜體，要很有氣勢 |
| `numbers_hurt.png` | 主角受傷 `0–9` `-`：淡紅 |

## 10. 特效貼圖　`source/pic/fx/`（選做）

使用者要求特效是 3D。特效由 Claude 在 3D 場景內用網格、粒子、shader 製作；這裡只需要貼圖。黑底或去背，512×512。
`fx_punch.png`（拳風弧線）、`fx_ki.png`（綠色氣功的流動紋理，可無縫）、`fx_beam.png`（光束的橫向條紋，可無縫）、`fx_shock.png`（衝擊環）、
`fx_spark.png`（命中火花）、`fx_guilt.png`（紫色碎片）、`fx_blackfire.png`（地獄超人的黑紫火，序列 4×4）、`fx_words.png`（幹譙龍噴出的字的底紋）、`fx_noise.png`（可無縫的雜訊圖）。

## 11. 小天使表情與教學圖

| 檔案 | 內容 |
|------|------|
| `pic/character/angel_face_*.png` | 小天使對話框用的頭像表情 8 個：嫌棄、翻白眼、壞笑、「還行」、嗑瓜子、生氣、無言、真心微笑（終章專用）。各 512×512 去背 |
| `pic/character/hero_face_*.png` | 主角對話頭像，三種型態各 5 個表情：呆滯、嘴硬、心虛、嚇到、認真 |
| `pic/howto/howto_01.png` | 教學圖四格：移動與閃避、累積勇氣、變身（可按住拖延）、三小招一大招。1920×1080 |

## 12. 音訊

完整的音樂與音效製作需求另立一份：[`MUSIC.md`](MUSIC.md)（交由另一個工作階段製作）。下表只是摘要。

| 類別 | 路徑 | 規格 |
|------|------|------|
| BGM | `source/music/` | 方向已改為**硬派電音、每關一首**。已交付並接上：校園、荒野、職場（兩首）、守關戰、過關。缺：變身專用曲 `bgm_brave`（最優先）與其餘各關的曲子，清單見 MUSIC.md |
| 配音 | `source/voice/vo_XXXX.mp3` | MP3 96–128kbps 單聲道，一句一檔。**檔名用腳本的四位數台詞 ID**（例 `vo_1042.mp3`）。主線 670 句、泡泡 52 句，可只配主線 |
| 音效 | `source/sfx/` | 目前是程式合成的暫代版（出拳、命中、爆炸、變身、受傷、UI） |

---

## 13. 不需要 GPT 處理的部分

- **3D 模型、骨架、動作**：Claude 以 §3 的圖經 Tripo API 生成（需使用者提供 API 金鑰）。
- **3D 場景搭建、特效、鏡頭、UI 版面與動態、對話系統**：Claude 以程式製作。

## 14. 交付方式

- 每批交付附一份 `source/DELIVERY.json` 或報告，列出每張圖的實際尺寸、是否去背、壓縮方式。
- 在 `docs/handoffs/` 留交接報告並更新 `docs/HANDOFF.md`。
- 建議第一批只交 P0（兩張合輯），使用者確認造型後再往下做，避免整批重畫。


## 2026-11-14 介面大批交付補記

新增八張介面來源 PNG：bubble_sheet、panel_sheet、minimap_sheet、difficulty_sheet、aux_hud_sheet、bingo_card、function_icons_sheet、lock_heal_sheet。七張1536×1024，一張1254×1254，原生RGBA未放大；詳細紀錄見 source/P1_INTERFACE_DELIVERY.json 與 ../../../docs/handoffs/2026-11-14-game02-interface-preview.md。圖集仍待正式切圖及狀態對齊。art-preview.html 可切換新舊頭像、計量條及戰鬥按鍵，Chrome寬／窄介面已目視驗證；其餘素材先供總覽，未宣稱整批正式接入。Claude登入過期，本輪預覽由Codex製作。

## 2026-11-14 按鍵正式接入補記

一般index已載入css/ui-art.css，使用來源PNG的校準顯示範圍，接入七種操作三態、鎖定、功能圖示及搖桿。UI_RUNTIME_REGIONS.json記錄座標；沒有修改來源或輸出獨立PNG。21態比較頁為assets/preview/p1-runtime-states.html。完整驗證與限制見../../../docs/handoffs/2026-11-14-game02-buttons-runtime.md。

## 2026-11-14 選單整合補記

difficulty_sheet六態及function_icons_sheet四個暫停選單圖示已透過css/menu-art.css接入一般入口；MENU_RUNTIME_REGIONS.json記錄十個範圍。來源PNG未修改，未另輸出切圖。完整驗證與限制見../../../docs/handoffs/2026-11-14-game02-menu-runtime.md。

## 2026-11-14 任務卡與泡泡整合補記

panel_sheet左上任務卡、bubble_sheet左上小天使泡泡已透過css/panel-art.css接入，保留動態文字與原圖。PANEL_RUNTIME_REGIONS.json記錄範圍；p1-panels-review.html提供長句檢查。其他泡泡與主劇情框未接入。詳見../../../docs/handoffs/2026-11-14-game02-panels-runtime.md。
