# 小天使攻擊語系、受擊頭像、技能圖示重繪、子機飛出

## 完成內容
- 小天使三段普攻及Q文字彈依當前中文／英文／日文顯示。技能喊話、按鈕輔助名稱、選角技能列表同步翻譯；非本次範圍的角色故事台詞未宣稱完整翻譯。
- 三段對照：笨蛋！／走開啦！／給我閉嘴！；Dummy!／Back off!／Shut it!；バカ！／あっち行って！／黙りなさい！。保留原三段尺寸與傷害。文字貼圖按實際量測字寬縮字級，512×128畫布內留白避免長句裁斷；日文使用Noto Sans JP，開場預載字型。
- 小天使大招增加英文／日文原生向量藝術字，沿用粉紅冰藍爆發底形與字形轉路徑流程；原中文及惡夢藝術字保留。
- 小天使受擊切換設定集既有DISDAIN不悅表情；惡夢切換EXPOSED驚慌表情。使用既有原圖CSS窗口，無重畫／壓縮。沿用700ms恢復、連續受擊延長及紅光回饋；客串不再疊上原主角受傷臉。
- 九個技能圖示以image_gen重新繪製漫畫風透明圖集：粗黑描邊、亮面立體、粉紅冰藍／紫綠配色。保留現有圓框、鍵位與冷卻遮罩。CSS裁圖，不縮小或修改來源像素；取消既有隱藏label的clip-path對新圖示的影響。
- 惡夢子機本體由施法位置起飛，速度18單位/秒、飛向最近有效敵人，於目標附近環繞並發射追蹤彈。敵人死／消失／不可傷立即換最近有效目標；無敵人回角色身邊。原3台5秒／10台10秒、暫停與換關清理保留。Boss版本速度12、離玩家約6單位繞行、發射可閃避直線彈，亦非固定在Boss身邊。

## 檔案與素材規格
- js/angel-language.js：當前語系翻譯與日文字型選擇，沿用i18n同一模組實例。
- js/guest-combat.js、nightmare-boss-skills.js：飛行子機／語言文字彈；main.js、playable-roster.js、system-art.js整合。
- css/playable-roster.css：圖示視窗、受擊表情；game.css：JP字型；play.html：版本及圖集預載。
- assets/source/pic/icons/guest_skill_atlas.png：1254×1254 RGBA原生透明圖集，3×3等格；順序為嘴砲、吹飛、雪花／麻痺、龍捲、三拳／三子機、震懾、王冠。來源、SHA256見assets/source/GUEST_SKILL_ICONS_DELIVERY.json。
- 被替換的九張skill_angel／skill_nightmare SVG及舊交付JSON收至assets/_alternate/，不刪歷史。
- assets/source/pic/titles/ult_angel_en.svg、ult_angel_ja.svg：760×370原生向量，既有底形與Noto黑體字形轉路徑。
- assets/fonts：依新文字重建TC/Huninn/JP子集，來源遵循原OFL字型工具；無語音新增。

## 驗證
- game02-language-faces-drones.cjs：三語文字彈及大招檔案、真受擊前後CSS表情與700ms恢復、子機本體飛出／死亡換鎖／無敵返航、無pageerror。
- game02-playable-roster.cjs、game02-nightmare-boss.cjs：八技能、救援、破盾、終章，以及Boss子機數量／時間／死亡清理、衝拳、震懾與普攻回歸通過。
- 手機390px新圖示、英文／日文藝術字及兩位受擊頭像目視，額外4x裝置像素比確認惡夢驚慌表情。截圖僅/tmp；未新增驗收頁。
- git diff --check；隨程式提交並推送Pages，成功後對話確認。
