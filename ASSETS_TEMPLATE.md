# 🎨 遊戲美術/音訊任務需求清單 — 標準範本（全專案共用）

> 開新遊戲：複製本檔到 `NN_game/assets/ASSETS.md`，填好 **Game Brief** 後逐項開規格與提示詞。
>
> ⚡ **一次性到位原則（最高原則）**：拿到「概念／世界觀／主題／遊戲類型」後，**一次把完整需求清單開齊**
> （含進階/動態項：人物呼吸、待機動態、眨眼、轉場、粒子特效、穿梭動畫…），不遺漏、不分批擠牙膏。
> 🎯 **主體性**：整套（字型、配色、光影、音色、角色）統一成一個協調作品。
> ⭐ **完整性**：凡遊戲內以 CSS/placeholder 暫代、需更高質感者，一律列入交外部 AI 美化。

---

## 📝 Game Brief（先填這段）
- **遊戲名稱**：`{GAME}`
- **概念 Concept**：`{一句話核心玩法}`
- **世界觀 Worldview**：`{背景故事/宇宙觀}`
- **主題風格 Theme**：`{THEME}`（例：深藍科技 / 卡通 / 像素 / 手繪）
- **遊戲類型 Genre**：`{PUZZLE / ARCADE / RPG…}`
- **核心循環 Core Loop**：`{玩家每回合做什麼 → 回饋 → 進程}`
- **主角 Character**：`{有/無；形象描述}`
- **配色 Palette**：`{主/輔/強調/描邊}`　**比例 Ratio**：`{9:16 / 16:9}`
- **參考 References**：`{風格參考}`

---

## 📁 資料夾結構（媒體分類 + 編號）
```
assets/source/
├── pic/
│   ├── background/  bg_01.png
│   ├── branding/    logo_01.png · icon_01.png
│   ├── character/   char_01.png          # 主角多姿態（有主角才需要）
│   ├── titles/      titles_01.png        # 主視覺文字 word-art（含選單字）
│   ├── ui/          ui_01.png            # 按鈕/面板/生命/圖示/容器框
│   ├── pieces/      pieces_01.png        # 核心玩法物件
│   ├── numbers/     numbers_01.png
│   ├── font/        font_01.png          # 字型 A–Z/a–z/符號
│   ├── fx/          fx_01.png
│   └── howto/       howto_01.png
├── music/           bgm_01.mp3 …
├── sfx/             sfx_01.mp3 …
└── video/           vid_01.webm · vid_warp.webm   # 開場/轉場/穿梭動畫
```
**命名**：`類別_編號.副檔名`（小寫英文），同類遞增（`bg_01`、`bg_02`…）。檔名勿改。

---

## 需求分類（逐項開規格 + 提示詞）
1. **背景** `pic/background/` — 主背景、結算背景…
2. **品牌** `pic/branding/` — Logo、App Icon、裝飾
3. **主角** `pic/character/` — 多姿態（idle/cheer/hurt/think/wave/point）
4. **主視覺文字** `pic/titles/` — START/選單字/狀態橫幅/GAMEOVER…
5. **介面 UI** `pic/ui/` — 按鈕三態、面板框、**生命/愛心**、圖示(齒輪…)、容器框
6. **遊戲元件** `pic/pieces/` — 核心物件系列
7. **數字 / 字型** `pic/numbers/` · `pic/font/` — 分數、A–Z、符號（主體一致）
8. **特效** `pic/fx/` — 過關/消除/失敗…
9. **教學圖示** `pic/howto/` — 玩法步驟
10. **音樂** `music/` · **音效** `sfx/`
11. **影片 / 動態** `video/` — 開場、**轉場**、**穿梭次元**、循環背景

### 🎞️ 動態 / 動畫（進階；常交他 AI 做）
> 一次列齊，別等被要求才補：
- **角色**：呼吸/待機(idle breathing)、眨眼(blink)、歡呼、受傷、專注
- **UI**：按鈕按壓彈性、面板彈入、橫幅 pop
- **背景**：穿梭次元/星流循環、粒子、光暈呼吸
- **轉場**：畫面切換(次元躍遷)、過關爆閃、GAME OVER 裂碎
- 交付：序列幀 sprite sheet / 透明 WebM / Lottie JSON

---

## 🕹️ 遊戲手感檢核（Game Feel / Juice / 留存；參考大神心法）
> 來源為業界部落格與書籍，屬方向性建議，非硬標準。
- **Juice（手感汁液）**：每個操作都要有即時回饋 —— 點擊彈跳、命中頓挫(hit-stop)、輕微畫面震動、
  得分 pop、粒子、分層音效。Steve Swink《Game Feel》的檢驗：**把分數/關卡/音樂/美術都拿掉後，
  光是「操作」本身仍好玩** → 代表手感到位。
- **選單也要有手感**：hover/選取狀態、點擊音（本專案 `sfx_01` 已做）。
- **簡單優先**：盡量少操作、規則一眼懂；複雜留給 meta 層。
- **留存靠「好玩＋meta」**：核心玩法保持單純，外圈用**關卡/事件/收集/進程**堆疊重玩動機。
- **早做手感原型**：先把「爽感」調好再堆內容，之後返工成本低。

> 參考：
> [Game Feel 與 Juice（Homa Academy）](https://hubspot.academy.homagames.com/game-design-game-feel-and-juice) ·
> [Making a game feel juicy（itch.io）](https://itch.io/blog/1059831/making-a-game-feel-juicy-with-simple-effects) ·
> [The Juice Factor（pulse.bot）](https://www.pulse.bot/gaming/news/the-juice-factor-designing-game-feel-910cc98a-a568-4687-82d0-1d741ff22207/) ·
> [Top retention tactics（PocketGamer.biz）](https://pocketgamer.biz/asia/special-report/77797/app-annie-reveals-the-top-10-retention-tactics-which-turn-first-time-users-into-repeat-players/)

---

## ✅ 交付清單（依遊戲勾選）
- [ ] 背景 · Logo · Icon
- [ ] 主角 `char_01`（多姿態）+ 角色動態（呼吸/眨眼…）
- [ ] 主視覺文字 / 選單字
- [ ] UI 圖集（按鈕/面板/生命/圖示/容器框）
- [ ] 核心元件 · 數字 · 字型
- [ ] 音樂 · 音效
- [ ] 特效 · 教學圖 · 轉場/穿梭動畫（選做/進階）
