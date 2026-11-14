# P1 HUD 核心素材

2026-11-14，APHASEN。依使用者「繼續做」製作ASSETS §4.1核心HUD。採內建image_gen實際出圖，沒有以SVG或程式佔位圖替代。

## 已交付來源

本機根目錄：`C:\Users\user\Documents\Codex\2026-11-14\task\games`。

| 相對 `02_xianxia_battle/assets/source/` 路徑 | 原生尺寸 | 內容 |
|---|---|---|
| `pic/ui/portrait_student.png` | 1254×1254 RGBA | 大學生頭肩像，全黃帽與上衣、棕眼 |
| `pic/ui/portrait_brave.png` | 1254×1254 RGBA | 勇氣超人頭肩像，紅眼紅圍巾、棕色尖髮白挑染 |
| `pic/ui/hud_core_sheet.png` | 1536×1024 RGBA | 八個部件：portrait_frame、bar_frame、bar_hp、bar_courage、bar_courage_full、bar_guilt、bar_guilt_crack、bar_qi |
| `pic/ui/guilt_explode_sheet.png` | 1536×1024 RGBA | 4欄×2列爆炸序列，格尺寸384×512 |

原生bytes直接保存，無插值、縮放或重新編碼。既有SVG暫代圖保留。需求允許圖集合併交付由Claude切圖，因此八個計量部件本輪不宣稱已輸出各自PNG。

## 查核與限制

- 四張實測都有alpha通道，角落alpha採樣記錄於manifest；核心圖集外框孔洞中心(384,150)、氣環中心(1152,850)皆alpha=0。工具預覽的深色底不代表影像實際有黑底。
- 目視兩個頭像辨識符合角色，學生袖子仍全黃。頭像實際1254，不是要求的512衍生檔；髮尖與底部接近邊界，接入圓框需縮入留白。邊緣有細小彩色半透明像素，應在深淺底實際檢查，尚未宣稱去背邊緣完美。
- 圖集有八個預期部件，紅血條／綠勇氣／紫罪惡感／黃氣環可區分，滿勇氣有金色光暈，裂痕版有碎片。框中段素面，可供九宮格切片規劃；實際inset、填充長寬一致性與縮放效果尚未驗證。
- `P1_HUD_SLICE_GUIDE.json`提供八個人工目視裁切建議矩形；並非像素精確alpha邊界，需後續切圖時檢查光暈交疊。不要直接當成已驗收runtime atlas。
- 爆炸圖具八個階段：完整、裂紋、發光裂紋、爆開、擴散、衰減、殘片、殘光。均等384×512切片可作預覽，但碎片形狀並非物理追蹤、最後兩格視覺重心下降；節奏、跳動與光暈外溢尚需實際遊戲測試。
- 本機 `assets/preview/p1-hud-review.html` 顯示棋盤底來源與深淺底CSS動畫（10fps循環僅供預覽）。HTML已建立，但尚未實際開瀏覽器驗證，不宣稱真人或瀏覽器測試通過。

## 交接

- `assets/source/P1_HUD_DELIVERY.json`記錄四圖尺寸、格式、bytes、SHA256、角落alpha；`P1_HUD_PROMPTS.md`記錄實際提示詞。
- 需後續：頭像512衍生圖、八部件正式切圖與九宮格參數、實際HUD整合、動畫播放驗證。
- 上班族portrait_worker屬未定案角色，本輪未製作；按鍵、其他介面與小地圖等P1項目仍待做。既有角色單視角及Logo解析度限制未解除。
- 已同步ASSETS.md與HANDOFF.md。依使用者先前要求新素材提交至原GitHub，準備隨本批交付；實際推送以Git結果為準。未改runtime引用、未執行部署或Tripo。
