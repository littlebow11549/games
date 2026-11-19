# 全角色對話語系與單層大招框

## 完成
- 補上 EN／JA 各 100 筆對話／介面翻譯：客串角色進場、救援及回嘴、受擊、挑釁、技能喊話、勝利、選角與解鎖；另包含先前漏掉的財務／甩鍋敵人台詞。
- supportSpeech 與 say 在顯示時分別翻譯救援者姓名和台詞；救援 HUD／剩餘次數使用參數化翻譯，勝利角色名稱和評語分別翻譯。
- 技能按鈕提示與無障礙名稱也使用同份翻譯，包含惡夢三個一般技能。
- 選角每次開啟重新套用目前語系；解鎖通知姓名、按鈕與完整台詞都支援英日。保留角色傲嬌／毒舌口吻。
- 小天使／惡夢玩家大招不再同時建立 heroSay；清除先前的角色喊話，只建立一次爆炸藝術字 popup。Boss 藝術字喊話去掉外層氣泡背景、陰影及尾巴。
- 原有 story.js 中全部劇情文字、一般敵人挑釁／求饒、主角回嘴與新角色資料均納入翻譯覆蓋測試。Boss 出場使用既有 boss-banter.js 三語資料；秘技對話使用既有 labels 三語資料，未改其流程。

## 檔案／素材
- 02_brave_guy/js/main.js、playable-roster.js、lang_en.js、lang_ja.js。
- css/system-art.css 單層框樣式。
- 所有 i18n import 統一 20261119dialogue，避免兩個模組實例造成語系不同步；入口與相關依賴一併更新快取版本。
- 重建 assets/fonts 三個 WOFF2 子集，來源為原 jf-openhuninn、Noto Sans TC／JP，補齊新增日文字形。未新增圖片或獨立預覽頁。

## 驗證
- tools/tests/game02-dialogue-localization.cjs：EN／JA 劇情、全一般怪物台詞、救援、ROSTER 翻譯鍵覆蓋；實際進關對話、選角、解鎖；兩角色大招只一張爆炸圖，沒有 taunt.hero。
- tools/tests/game02-royal-arsenal.cjs：更新為檢查單一 popup，保留十門、獨立追擊／召回及三語砲彈測試。
- 手機 390×844 英文解鎖、日文選角已截圖視檢，截圖僅在 /tmp。
- game02-guest-clear-flow.cjs 保護客串通關／Staff 流程。

## 發布
隨本次提交推送既有 Pages 分支，部署結果在任務回覆確認。
