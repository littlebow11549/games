# P1 戰鬥按鍵與搖桿來源圖集

2026-11-14，APHASEN。依使用者連續指示「繼續」，製作ASSETS §4.2；採內建image_gen，沿用HUD的粗黑線、綠邊黃飾漫畫風。

## 成果

根目錄：`C:\Users\user\Documents\Codex\2026-11-14\task\games`。下列路徑相對 `02_xianxia_battle/assets/source/`。

| 檔案 | 原生尺寸 | 內容 |
|---|---|---|
| `pic/icons/btn_attack_sheet.png` | 2172×724 RGBA | 普攻拳頭，一般／按下／不可用共3態 |
| `pic/icons/btn_dodge_transform_sheet.png` | 1536×1024 RGBA | 閃避翻滾、變身紅圍巾，各3態，共6個 |
| `pic/icons/skill_buttons_sheet.png` | 1536×1024 RGBA | 衝拳／氣功球／捶地衝擊環／粗光束，各3態，共12個 |
| `pic/ui/control_extras_sheet.png` | 1536×1024 RGBA | 搖桿底座、旋鈕、可變身發光版，共3個 |

共24個狀態／部件，四張原生PNG。需求允許圖集交付由Claude切圖，未宣稱已輸出每個需求檔名的單獨PNG。原始bytes直接保存，沒有插值、縮放、程式重繪或覆蓋既有SVG。

## 驗證與限制

- 全部實測32位RGBA，四角alpha=0，尺寸／bytes／SHA256／採樣在 `P1_BUTTONS_DELIVERY.json`。
- 目視三態均有，禁用態為灰階外觀；未逐像素驗證所有禁用像素R=G=B。普攻是拳頭；閃避為翻滾殘影；變身為紅圍巾膠囊；四技能輪廓有區分。
- 按下態有深色內凹與位移，但不同狀態的圖案尺寸略有漂移，不能直接固定格切片後當作無跳動的runtime成品。需統一中心、外框直徑、hitbox與alpha邊界。
- 圖集雖透明，部分素材外圍帶生成的半透明光暈，比提示詞要求更寬；切圖需避免相鄰色暈、意外裁斷。搖桿底座中心透明程度未量化，接入時應設定適當opacity並驗證可見性。
- 普攻每格724×724足以衍生384圖；其他按鍵尚未輸出精確256圖。技能表高度1024不能整除3，建議列邊界0／341／683／1024後再對齊內容。並非已驗收切片座標。
- `P1_BUTTONS_SLICE_GUIDE.json`為排列與切片起點，未提供已校準runtime參數。`P1_BUTTONS_PROMPTS.md`為實際生成提示詞。
- `assets/preview/p1-buttons-review.html`可查看棋盤透明背景；已建立HTML但尚未開瀏覽器驗證或在遊戲內操作測試。

## 交接狀態

- ASSETS.md與HANDOFF.md已更新。依使用者先前指定，隨新素材提交到 `littlebow11549/games` 的 `claude/fervent-ride-4h0vjm`；實際推送以Git結果為準。
- 本輪未更動runtime引用或遊戲邏輯，未部署或Tripo。遠端先前已接入的icon與Logo維持。
- P1其餘泡泡、面板、小地圖、鎖定與難度介面仍待做；本批只完成§4.2來源圖集，不宣稱整份P1完成。
