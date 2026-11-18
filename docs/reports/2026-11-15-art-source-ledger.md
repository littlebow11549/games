# 美術來源對照：後續製作前使用本表

本表修正前份庫存僅以檔案存在判定的問題。每項對照圖集／合輯／交接與程式；所有項目目前禁止自動重生。確定已有來源的下一步是復用或整合，來源未定位的下一步是查紀錄。不是要求使用者重新整理。

| 需求 | 已有來源（相對 source/pic） | 狀態 | 下一步 |
|---|---|---|---|
|角色設定合輯|`sheet/unified/`|16張已有來源；歷史審稿限制保留|沿用；逐角色核對指定版本|
|主角與P1三視角|`concept/student_front.png`、`concept/student_side.png`、`concept/student_back.png`、`concept/braveguy_front.png`、`concept/braveguy_side.png`、`concept/braveguy_back.png`、`concept/angel_front.png`、`concept/angel_side.png`、`concept/angel_back.png`、`concept/nightmare_front.png`、`concept/nightmare_side.png`、`concept/nightmare_back.png`、`concept/ganqiao_front.png`、`concept/ganqiao_side.png`、`concept/ganqiao_back.png`|15張已生成暫稿；尺寸/背景待驗收|核對原稿規格，不重新排入生圖|
|學生五種表情|`sheet/unified/sheet_student.png`|EXPRESSIONS列已有對應表情|優先沿用合輯；核對裁切與顯示方式|
|勇氣超人五種表情|`sheet/unified/sheet_braveguy.png`|合輯有6表情，與需求表情逐格對照尚未完成|先對照，不把缺獨立檔當缺圖|
|上班族五種表情及HUD頭像|`sheet/unified/sheet_worker.png`|合輯已有半身頭像及6表情；HUD已接左側頭像窗口|表情沿用合輯，未新增獨立圖|
|小天使八種表情|`sheet/unified/sheet_angel.png`|合輯有6種；生氣/無言獨立來源尚待核對|先核對原生成稿與其他交付；不直接新增|
|HUD框/計量/氣環|`ui/hud_core_sheet.png`|8部件已接入；滿勇氣、罪惡裂紋、氣環隨數值切換|驗收原圖顯示，不重生|
|罪惡感爆炸|`ui/guilt_explode_sheet.png`|8格序列已接guiltBurst，10fps單次播放，結束清理|已驗證播放與清理|
|攻擊/閃避/變身/技能|`icons/btn_attack_sheet.png`、`icons/btn_dodge_transform_sheet.png`、`icons/skill_buttons_sheet.png`|已有且接入|只驗收三態與對齊|
|搖桿與變身發光|`ui/control_extras_sheet.png`|搖桿及變身ready發光態已接入|保留按下與鎖定態|
|任務/彈窗/劇情框|`ui/panel_sheet.png`|任務已接；劇情沿用底部框中央區；彈窗沿用PR35已接版本|舊圖集彈窗為備用，毋須同時疊加|
|四種泡泡|`ui/bubble_sheet.png`|小天使與其餘三種泡泡均已接入|長句換行；保留翻譯文字|
|Boss/敵人血條/連擊/舊文字按鈕|`ui/aux_hud_sheet.png`|Boss框/名稱/血量、敵人血量、連擊已接；舊按鈕備用|連擊去除描邊並避開直向任務欄|
|小地圖框/底/5標記|`ui/minimap_sheet.png`|框、底圖、敵人/菁英/Boss/主角/俊熊五種標記均已接入|俊熊只在出現且未結束時標示|
|功能鍵|`icons/function_icons_sheet.png`|8圖示已有|保留現有接入|
|鎖定/回血|`icons/lock_heal_sheet.png`|三態按鈕、地面鎖定圈、俊熊獎勵回血圖示均已接入|地面圖集載入失敗保留原幾何圈|
|難度|`ui/difficulty_sheet.png`|6態已有且已接|驗收，不生圖|
|賓果卡|`ui/bingo_card.png`|已於既有賓果台詞顯示原卡；其他台詞隱藏|未新增賓果玩法或改寫故事|
|Logo/封面/橫幅|`branding/logo_01_review_v1.png`、`branding/icon_01.png`、`branding/icon_01_logo.png`、`branding/banner_01.png`|已有，Logo寬度限制另列|既有核准設計不重畫；衍生規格與使用位置核對|
|主選單雙版|`branding/menu_keyart_01.png`、`branding/menu_keyart_portrait_01.png`|本聊天已生成且PR35接入|只驗收橫直裁切，不重生|
|暫停/結算新框/標題/按鈕|`ui/panel_popup.png`、`ui/panel_title_plate.png`、`ui/btn_text.png`|本聊天已生成，PR35實作及測試通過|等待合併/視覺驗收，不重生|
|履歷/算了計數器|`ui/resume.png`、`ui/counter_suanle.png`|本聊天已生成未提交，履歷欄數不合規|保留，先核對既有稿再決定修改|
|14個場景|見程式／交付紀錄|world.js已有14主題；使用者指出美術已做；10張本聊天新稿另列|查原交付來源；不再生成場景|
|首次變身13件|`transform/tf_bg_stars.png`、`transform/tf_glove.png`、`transform/tf_hair.png`、`transform/tf_jacket.png`、`transform/tf_knee.png`、`transform/tf_pose.png`、`transform/tf_scarf.png`、`transform/tf_sign.png`、`transform/tf_silhouette.png`、`transform/tf_waiting_1.png`、`transform/tf_waiting_2.png`、`transform/tf_waiting_3.png`、`transform/tf_waiting_4.png`|沿用先前13張原檔，SHA256未變；接入首次變身及重播|已核對內容及來源；保留尺寸/構圖限制，不重生|
|其他三視角/道具/教學/貼圖/GLB|見程式／交付紀錄|獨立正式檔未定位，不等於從未製作|追溯交付紀錄與合輯/程式內容；無確認不進製作佇列|

## 本聊天未提交稿：另列，不作新需求

原先27張中，13張變身圖本輪依使用者續作要求核對後原樣接入；其SHA256見JSON的 integrated_transform_images。其餘14張（10場景、2學生表情、2職場道具）仍保留待比對，未刪除、未改圖、未提交。

## 可以執行的下一步

1. 核對PR35選關、暫停、結算與等寬按鈕的交付／接入狀態，不再生圖。
2. 既有HUD圖集本輪已接入，座標見 `02_brave_guy/assets/source/HUD_RUNTIME_REGIONS.json`；驗證及例外見最新交接。
3. 上班族HUD頭像已取自合輯；角色其他表情仍沿用合輯，不重畫。
4. 變身已沿用本聊天先前生成的13張，不宣稱找到更早原稿；場景與其他來源有爭議項目仍待追溯，不得因缺檔重生。

**本輪沒有已確認需要新生成的項目，生圖佇列為空。**

## 2026-11-15 使用者明確追加過場重設計
使用者要求所有 Boss 過場重新設計及以原 Logo 製作日文變體；新素材範圍、來源核對見 `2026-11-15-sfx-folaidi-logo-audit.md`。此次許可只涵蓋專用過場及日文 Logo，不恢復場景生圖佇列。

## 結局群像定向修訂（使用者指出未依設定）

- 既有來源：source/pic/cinematics/ending_applause.png；不是新場景缺件。原圖造型錯誤，依本次明確指示修訂此圖。
- 設定依據：CHARACTERS.md、DESIGN.md、sheet/unified 的 braveguy／laichuang／lan／xinji／baguashe／guanlaoban／ganqiao／incubus／nightmare／hell／qian／angel。
- 修訂版 1536×1024，主角＋13 Boss＋小天使。保留原生尺寸，未插值放大；舊版 _archive/game02/cinematics/2026-11-15/ending-correction/ending_applause_rejected.png。
- 三次定向編修均保留生成原檔於 /workspace/generated_images；最後採 exec-ff122630-5341-4dea-bbb5-794c610b7cda.png。修正歷程與差異見 handoffs/2026-11-15-game02-ending-character-correction.md，不視為使用者已審核通過。

## 效能與勝敗／二次變身演出
- 使用現有 visuals.js 角色、原 Boss storyboards、學生頭像、結局與變身原圖，新增程式動畫／氣泡／讀取頁；沒有新生成原圖。
- runtime-images.json 僅為載入分組索引，不作未製作清單。待追溯素材與生圖停止狀態不變。

## 勝利圖片／配送優化追加
- 勝利三鏡復用 `transform/tf_pose.png`、`tf_glove.png` 與 `cinematics/boss_*_storyboard.png`／佛萊迪 reveal；運行時裁窗組合，未生新圖。
- 75張已接入原圖新增 `assets/runtime/lossless/pic/` 無損配送副本；原尺寸、全RGBA逐像素相同，來源SHA與大小見該目錄上層 report.json。原稿沒有覆寫、14張爭議稿未處理。
- 白／橘爆裂對話框、金色數字及按鈕用CSS；火焰拳風用mesh，未複製參考圖。

## 本次確認缺件：專屬擊敗與最終變身
- 使用者明確否決以登場圖＋拳套交錯充作擊敗畫面。核對 cinematics 原圖、tf_pose/tf_glove、來源紀錄：13名Boss已有登場，但沒有主角實際命中／擊倒各Boss的專屬畫面。只新增這13組勝利分鏡，不重做登場。
- 最終二段變身原依舊文字設定製作的惡夢／地獄／回西裝草稿已作廢。使用者後續提供 Final Ascension 原設定圖，權威來源改為黑紫機械鎧甲、橘髮、綠胸核、破綠圍巾。採用 awakening_armor_a/b；不是重做既有初次出場圖。
- 每名Boss的既有角色／登場圖與勇氣超人tf_pose作生成參考。未提交的14張爭議稿不動。


## 人體與設定複核（2026-11-16，發布狀態見最新交接）
- 使用者指出的鎧甲手掌、藍經理前兩鏡、悶幹譙／惡夢／八卦蛇擊中鏡頭已定向修正；另檢查出藍教頭、地獄與幹譙龍的類似問題，一併修正。採用稿的生成來源、SHA256、原生尺寸與檢查狀態見 `02_brave_guy/assets/source/PICTURE_FILMS_REVIEW.json`。
- 每張已目視檢查角色辨識、肢體連接、手腕與握拳方向、前後鏡頭。此為製作者自審，不代表使用者批准或保證不存在任何繪圖瑕疵。
- 所有被退回稿仍留在 `/workspace/generated_images/`，未接入。舊西裝版 victory_incubus、舊 awakening_a/b、舊缺手指 armor_a、錯誤服裝 armor_b、舊失敗／重試混合圖不加入配送清單。
- 失敗改為三鏡（戰敗／畏縮／粉紅荷葉邊服裝）＋獨立 `defeat_retry.png`；結局定向修訂為 `ending_applause_final.png`，保留舊圖，修正藍經理、加班鬼王、怪物與鎧甲夢魘，主角保留終章紅綠雙圍巾。
- 新增共18張原生PNG，含13組專屬勝利、2組變身、1組失敗、1張重試、1張結局；18份WebP只做無損配送，並非新美術。原有14張爭議稿沒有改動。

- 壓縮追加不屬於新生圖：全部93份配送圖比較最高強度無損編碼，原尺寸RGBA一致後擇小；原PNG及14張爭議稿不變。

## 2026-11-16 錢經理新關過場
- 同步Claude dd616e8：3-6 qianBiz暫借boss_qian_storyboard，沒有victory_qianBiz；原qian為校園水手服，非職場套裝。
- 核對既有sheet/unified/sheet_qian、校園登場及勝利原圖；CHARACTERS §8指定職場版套裝、資料夾、收款信封，保留馬尾耳環。確定本輪只新增boss_qianBiz_storyboard與victory_qianBiz兩組三鏡，不重製校園圖。
- 新圖原PNG保留，配送副本採原尺寸無損壓縮；既有Claude壓縮結果不回退。

- 勝利稿經使用者再次退回後，採用exec-56374f59（側面出拳、刪除多餘手）；之前各稿僅留生成資料夾，正式採用及退回清單見QIAN_BIZ_FILMS_REVIEW.json。

## 2026-11-16 假忙森主管新關過場
- 核對Claude e1116eb/a130ee9：3-7 jiamangKing暫借加班鬼王圖，缺專屬勝利。已有假森原設定及sheet_zhuangxiong；職場版為灰黑西裝紅領帶、橘棕布偶熊、紅雞冠、白灰曲棍球面具與黑屏電腦。只新增boss_jiamangKing_storyboard、victory_jiamangKing兩組，不重做其他Boss或背景素材。

## 2026-11-16 使用者指定重繪：勇氣寶石變身按鈕
已定位目前圖源 `icons/btn_dodge_transform_sheet.png`（下列紅圍巾三態）及 CSS 接線。使用者明確要求將紅圍巾改為勇氣寶石並重新繪製，故新增獨立寶石按鈕；非依缺件清單重工。舊圖集保留供閃避按鈕使用。

補充：滿氣紅圍巾另由 `ui/control_extras_sheet.webp` 提供（hud-art.css 高優先度覆蓋），亦已解除該變身鍵引用；搖桿仍沿用原圖集。新寶石已接入普通／就緒／按下／鎖定狀態。

## 2026-11-18 記憶水晶 Banner 專用巴哥（使用者明確要求重繪）

- 已核對現有 `01_memory_crash/assets/source/pic/character/pug_idle_full.png`：8格待機圖集，先前Banner只取第一格。
- 使用者本輪明確要求重新繪製Banner主角並放大右側主視覺，授權新增一張「朝右介紹鑽石」的獨立姿勢，不覆蓋既有遊戲待機圖集。
- 新素材歸檔於根目錄 `assets/source/pic/banner/`，生成結果、尺寸與驗證見本輪交接報告。

## 2026-11-18 8格街機擊中火花

- 已核對既有 fx_spark.svg 與 fx.js：既有靜態火花／粒子，沒有本次指定的6–8格命中序列。
- 依使用者明確要求新增 fx_hit_arcade_8f.png（4×2），不是重製既有角色或取消佇列。
- 第一版暈光過多，使用imagegen修正成透明硬邊火花；交付第二版，原生成稿留在generated_images。
