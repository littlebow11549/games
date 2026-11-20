# 角色技能圖集／藝術字／圓形控制：兩套待驗收

2026-11-20。依使用者最新要求：保留第一套多色圖、再出同色調版，兩套均套入實際遊戲截圖；方形按鈕已遭否決，已改圓形。方向搖桿也須統一。由使用者決定採用哪套，不能自行宣稱定案。

## 完成與入口

- 三角色 × 兩套技能圖集，各一張原生1254×1254 PNG，3×3、每格418px。原圖保留，交付WebP逐像素無損。
- 多色版 `02_brave_guy/play.html?skillStyle=color`；同色調版 `?skillStyle=tonal`。正常入口仍為legacy，未改玩家存檔或強制新風格。透過實際遊戲網址預覽，沒有新增展示頁。
- 每張圖格位：普攻／閃避／Q；E／R／F；變身或爆氣／鎖定／換目標。最後兩格只保留於原圖，實際遊戲鎖定／換目標照原樣。七個技能取圖及冷卻均為圓形。
- 方向控制使用CSS光澤圓形材質與角色配色，多色版金屬外圈、同色版同色外圈；搖桿位置／尺寸／8px觸控容差未改。
- 每角色一張三語SVG藝術字：三欄繁中／英／日、四列Q/E/R/F，共36格。Noto開放字型轉輪廓保證文字清楚；角色限定取圖，避免一般「夠了」誤用另一角色藝術字。現有字檔仍保留以供legacy與回復。
- 唯一規格來源：`02_brave_guy/assets/records/brave_guy_character-art.json`；完整流程與風格依據：同處 `brave_guy_character-art-guide.md`。
- `tools/build_character_art.py` 產出SVG與runtime資料；`js/character-art.js` 集中解析取圖；`css/character-art.css` 管理視覺狀態。圖片替換與戰鬥邏輯分開。
- 素材索引新增15個檔案，明確標記驗收預覽。惡夢獨立表情特輯仍未找到，未偽造或重生冒充。

## 驗證

- `python 02_brave_guy/tools/validate_character_art.py`：6對母檔／交付檔、原生尺寸、格位、SHA及逐像素一致；3張定案參考、36格SVG通過。
- `node tools/tests/game02-character-art.cjs`：三角色兩套，手機圓形七格唯一／邊界、保留換目標圖、冷卻圖層、桌面截圖、36格三語標籤與SVG解碼；無HTTP或JS錯誤。
- `node tools/tests/game02-stick-bounds.cjs`：四尺寸×兩形態，中心／外圍忽略、8px容差、拖曳／放開／blur歸零通過。
- 截圖僅保存/tmp：`skills-{brave,angel,nightmare}-{color,tonal}-{mobile,controls}.png`；另有惡夢桌面截圖。直接在聊天展示，不提交QA垃圾。

## 待使用者決定

選A多色或B同色，也可分角色選擇；本次未擅自決定。選定後更新JSON defaultStyle並重新build／驗證，保留另一套可替換原圖。原有控制素材在驗收前不刪。

發布狀態以聊天回報為準；GitHub分支同步不等於宣稱Pages已完成部署。
