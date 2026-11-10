# 🎨 02 仙俠戰鬥（工作代號）— 素材製作需求清單（交 GPT／Codex）

> 依全專案標準範本（`/ASSETS_TEMPLATE.md`），一次開齊。
> 產出後依「路徑」放檔，**檔名勿改**（含編號），Claude 才接得到。
> 圖片僅可無損壓縮，保留原生解析度與透明度（見 `/AGENTS.md`）。
>
> ⚠️ **原創要求**：使用者提供的參考影片只用來參考「類型、鏡頭與 UI 佈局」。
> 角色造型、怪物造型、UI 紋飾、圖示、字藝**一律原創**，不得描摹或重現參考影片中的任何角色、
> 介面圖案、Logo 或文字。
>
> 狀態：**需求已開，尚未產出任何素材。** 遊戲已有佔位版原型（見 `../PROGRESS.md`），素材接入方式見 [`README.md`](README.md)。

---

## 📝 Game Brief

- **遊戲名稱**：待使用者定名（以下以「本作」代稱；Logo 字樣等定名後才做）
- **概念**：斜俯視 3D 即時動作砍殺，Q 版劍修清怪、打 Boss
- **世界觀**：東方仙俠；仙門小弟子下山歷練
- **主題風格**：Q 版（2.5 頭身）、手繪卡通質感、明亮柔和
- **類型**：ARPG／動作砍殺（單機、網頁、手機橫式）
- **核心循環**：搖桿移動 → 普攻連段＋技能清怪 → 波次結束出 Boss → 結算
- **主角**：有。Q 版仙門小弟子，手持比自己還大的巨劍（造型見 §3，可由使用者改定）
- **配色**：玉青 `#2fa88f`／淺玉 `#bfeee0`／金邊 `#e9c46a`／蓮粉 `#f4b6c2`／血紅 `#e2413d`／靈力藍 `#3aa0ff`／墨字 `#1d2a2a`
- **比例**：**手機橫式 16:9**（設計基準 1920×1080）
- **參考**：僅參考佈局與類型，見上方原創要求

### 統一風格提示詞（貼在每則 2D 圖片開頭）
```
consistent game art series, original design, chibi eastern fantasy (xianxia) style,
hand-painted cartoon look, soft bright lighting, jade-green and gold palette with
lotus-pink accents, clean shapes, high detail, no text unless specified
```

---

## 📁 資料夾結構

```
02_xianxia_battle/assets/source/
├── pic/
│   ├── concept/     ★ 3D 生成用的角色設定圖（最優先）
│   ├── background/  載入畫面、結算背景
│   ├── branding/    logo、icon、首頁 banner
│   ├── titles/      字藝
│   ├── ui/          HUD、面板、按鈕、搖桿
│   ├── icons/       技能、功能、Buff 圖示
│   ├── numbers/     傷害跳字數字
│   ├── fx/          特效貼圖
│   └── howto/       教學圖
├── model/           3D 模型 GLB（由 Claude 經 Tripo 生成後放入，GPT 不需處理）
├── music/           BGM（使用者負責）
├── voice/           配音（使用者負責）
└── sfx/             音效
```

---

## 1. ★ 3D 生成用設定圖　`pic/concept/`（最優先，其他都可以晚）

這批圖會直接送進圖轉 3D（Tripo），所以**規格比好看更重要**。

### 共同規格（每張都要符合）
- 尺寸 **2048×2048**，PNG。
- **純色背景**（中性灰 `#808080` 或純白），不要場景、不要地面陰影、不要特效光暈。
- **全身入鏡、置中**，四周留邊，不可裁切到頭頂或腳。
- 人形角色採 **A 字站姿**：雙臂向下張開約 45°，手指不貼身體，雙腿微開，**手上不拿任何東西**。
- 正視角平光，不要透視變形、不要戲劇性打光。
- 表情中性（嘴閉、眼睜）。
- 每個角色交 **正面、側面（左）、背面** 三張，三張的比例、服裝、配色必須一致。
- 頭髮、衣襬避免細碎飄帶與鏤空，飾品要貼身（細薄懸空的部件轉 3D 會破）。
- 畫面內**不要任何文字、標註、浮水印**。

### 清單
| 檔案 | 內容 | 造型方向（可調整，須原創） |
|------|------|------|
| `hero_front.png` `hero_side.png` `hero_back.png` | 主角 | Q 版 2.5 頭身仙門小弟子；玉青色短道袍、金色滾邊、腰繫蓮花玉佩；髮型簡潔成塊（如高馬尾或單髻），避免細碎髮絲 |
| `sword_01.png` | 主角巨劍（單獨一張，劍身垂直、劍尖朝上、正面） | 寬刃巨劍，長度約為主角身高 1.5 倍；青玉劍身、金色劍格、蓮花紋 |
| `mob_spear_front/side/back.png` | 持槍小怪（人形） | 矮胖小妖兵，赭紅色皮甲、圓盔；**長槍另畫一張** `mob_spear_weapon.png` |
| `mob_imp_front/side/back.png` | 小雜兵（人形） | 更小隻的草葉小精怪，綠色、圓頭、短手短腳 |
| `mob_plant_front/side/back.png` | 植物怪（非人形，不需 A 字站姿） | 大花苞頭、粗莖、兩片葉手、根部為球狀底座；遠程吐彈 |
| `boss_front/side/back.png` | Boss | 體型為主角 3 倍的山嶽獸形妖王；**請畫成雙足站立的人形比例**（方便自動綁骨），厚重石甲、角、發光胸核 |

---

## 2. 品牌　`pic/branding/`
| 檔案 | 用途 | 尺寸 | 背景 |
|------|------|------|------|
| `logo_01.png` | 遊戲 Logo 字藝（**定名後才做**） | 寬 1600 以上 | 去背 |
| `icon_01.png` | 首頁遊戲列表封面 | 1024×1024 | 不透明 |
| `banner_01.png` | 首頁橫幅 | 沿用 01 的 banner 尺寸 | 不透明 |

## 3. 背景　`pic/background/`
| 檔案 | 用途 | 尺寸 | 背景 |
|------|------|------|------|
| `bg_loading.png` | 載入／點擊開始畫面（仙山雲海，中央留空） | 1920×1080 | 不透明 |
| `bg_result.png` | 結算畫面背景 | 1920×1080 | 不透明 |
| `sky_01.png` | 3D 場景遠景天空（柔和漸層＋遠山剪影，可左右無縫銜接） | 4096×1024 | 不透明 |

## 4. 字藝　`pic/titles/`
去背 PNG，每個字樣獨立一檔，寬 1200 以上。
`START`、`VICTORY`／`勝利`、`DEFEAT`／`落敗`、`BOSS 來襲`、`第 N 波`（「第」「波」與數字分開）、`暫停`、`COMBO`。

## 5. 介面 UI　`pic/ui/`（橫式 HUD；全部去背 PNG）

可用圖集一次生成，排版不需對齊，Claude 會切圖。面板類請做成**可九宮格拉伸**（四角有紋飾、中段素面）。

| 檔案 | 內容 |
|------|------|
| `hud_portrait_frame.png` | 左上頭像框（圓形開口）＋等級圓牌底 |
| `hud_portrait_hero.png` | 主角頭像（須與 §1 主角一致），512×512 |
| `hud_bar_frame.png` | 血條／靈力條外框 |
| `hud_bar_hp.png` `hud_bar_mp.png` | 血條（紅）、靈力條（藍）填充，橫向可裁切 |
| `enemy_bar.png` | 怪物頭上小血條（框＋填充） |
| `boss_bar.png` | 畫面上方 Boss 大血條（框＋填充＋名牌底） |
| `joystick_base.png` `joystick_knob.png` | 虛擬搖桿底盤與搖桿頭 |
| `btn_attack.png` | 右下大型普攻鍵（一般／按下兩態） |
| `btn_skill_frame.png` | 圓形技能鍵外框（一般／按下／不可用三態） |
| `btn_dodge.png` | 閃避鍵 |
| `panel_quest.png` | 右側任務追蹤面板（九宮格） |
| `panel_dialog.png` | 底部對白／字幕框（九宮格） |
| `panel_popup.png` | 通用彈窗（暫停、設定、結算；九宮格） |
| `btn_text.png` | 通用文字按鈕底（一般／按下／不可用） |
| `minimap_frame.png` | 右上小地圖框 |
| `tab_01.png` | 分頁籤（選中／未選中） |

## 6. 圖示　`pic/icons/`（去背 PNG，各 256×256）
- **技能** `skill_01`–`skill_06`：劍氣斬、旋風斬、落劍衝擊、蓮華護體、靈力爆發、終結技（巨劍天降）。
- **功能** `fn_bag`、`fn_character`、`fn_settings`、`fn_pause`、`fn_sound_on`、`fn_sound_off`、`fn_quest`。
- **Buff** `buff_atk`、`buff_def`、`buff_speed`。
- **掉落** `drop_coin`、`drop_hp`、`drop_mp`。

## 7. 數字　`pic/numbers/`
| 檔案 | 內容 |
|------|------|
| `numbers_dmg.png` | 一般傷害數字 `0–9` 與 `-`（紅、粗描邊） |
| `numbers_crit.png` | 暴擊數字 `0–9`、`-`、`!`（金橙、更大、爆炸邊） |
| `numbers_heal.png` | 回復數字 `0–9`、`+`（綠） |
| `numbers_ui.png` | 介面數字 `0–9`、`/`、`:`、`LV`（墨色或金色） |

## 8. 特效　`pic/fx/`（使用者要求：特效做成 3D）

特效一律是 **3D 場景內的特效**（網格、粒子、shader），由 Claude 在 Three.js 內製作，不用 2D 動畫疊圖。
原型已有佔位版：刀光、衝擊環、粒子爆散、光柱、巨劍落下。

GPT 這邊只需提供 3D 特效要用的**貼圖**（選做；沒有就維持純色幾何）。**黑底或去背**，各 512×512，序列圖另註：
`fx_slash.png`（刀光漸層，橫向條狀，供弧形網格 UV 使用）、`fx_spark.png`（火花粒子）、`fx_smoke.png`（煙塵粒子）、
`fx_petal.png`（蓮花瓣粒子）、`fx_leaf.png`（落葉粒子）、`fx_ring.png`（衝擊環）、`fx_fire_sheet.png`（爆炸序列 4×4）、
`fx_magic_circle.png`（地面法陣）、`fx_noise.png`（可無縫拼接的雜訊圖，供 shader 溶解與流動用）。

若要交付 3D 特效模型（例如巨劍、法陣立體件），請給 GLB 並放 `model/`。

## 9. 教學圖　`pic/howto/`
`howto_01.png`：四步驟（移動、普攻連段、施放技能、閃避），1920×1080 或四格圖集。

---

## 10. 音訊（BGM、配音由使用者負責）

| 類別 | 路徑 | 規格 |
|------|------|------|
| BGM | `music/bgm_battle.mp3`、`bgm_boss.mp3`、`bgm_victory.mp3` | MP3 128–160kbps 立體聲；battle／boss 需可無縫循環 |
| 配音 | `voice/vo_01.mp3` … | MP3 96–128kbps 單聲道；一句一檔；另附 `voice/lines.txt` 列出編號對應台詞 |
| 音效 | `sfx/` | 尚無正式素材；Claude 先以程式合成佔位（揮劍、命中、爆炸、受擊、UI 點擊） |

---

## 11. 不需要 GPT 處理的部分
- **3D 模型、骨架、動作**：Claude 以 §1 設定圖經 Tripo API 生成（需使用者提供 API 金鑰）。
- **3D 場景**（地形、樹、石、草）：Claude 以程式生成並搭配 CC0 免費素材。
- **特效邏輯、鏡頭、UI 版面與動態**：Claude 以程式製作。

## ✅ 交付清單（建議順序）
- [ ] **第一批（擋進度）**：§1 主角三視圖 `hero_*`、巨劍 `sword_01`
- [ ] 第二批：§1 三種小怪與 Boss 設定圖
- [ ] 第三批：§5 UI、§6 圖示、§7 數字
- [ ] 第四批：§2 品牌（待定名）、§3 背景、§4 字藝、§9 教學圖
- [ ] 選做：§8 特效貼圖

交付時請附一份 `source/DELIVERY.json` 或報告，列出每張圖的實際尺寸、是否去背、壓縮方式，並在 `docs/handoffs/` 留交接報告。
