# 美術來源對照：後續製作前使用本表

本表修正前份庫存僅以檔案存在判定的問題。每項對照圖集／合輯／交接與程式；所有項目目前禁止自動重生。確定已有來源的下一步是復用或整合，來源未定位的下一步是查紀錄。不是要求使用者重新整理。

| 需求 | 已有來源（相對 source/pic） | 狀態 | 下一步 |
|---|---|---|---|
|角色設定合輯|`sheet/unified/`|16張已有來源；歷史審稿限制保留|沿用；逐角色核對指定版本|
|主角與P1三視角|`concept/student_front.png`、`concept/student_side.png`、`concept/student_back.png`、`concept/braveguy_front.png`、`concept/braveguy_side.png`、`concept/braveguy_back.png`、`concept/angel_front.png`、`concept/angel_side.png`、`concept/angel_back.png`、`concept/nightmare_front.png`、`concept/nightmare_side.png`、`concept/nightmare_back.png`、`concept/ganqiao_front.png`、`concept/ganqiao_side.png`、`concept/ganqiao_back.png`|15張已生成暫稿；尺寸/背景待驗收|核對原稿規格，不重新排入生圖|
|學生五種表情|`sheet/unified/sheet_student.png`|EXPRESSIONS列已有對應表情|優先沿用合輯；核對裁切與顯示方式|
|勇氣超人五種表情|`sheet/unified/sheet_braveguy.png`|合輯有6表情，與需求表情逐格對照尚未完成|先對照，不把缺獨立檔當缺圖|
|上班族五種表情及HUD頭像|`sheet/unified/sheet_worker.png`|合輯已有半身頭像及6表情|優先沿用，不重生portrait_worker|
|小天使八種表情|`sheet/unified/sheet_angel.png`|合輯有6種；生氣/無言獨立來源尚待核對|先核對原生成稿與其他交付；不直接新增|
|HUD框/計量/氣環|`ui/hud_core_sheet.png`|8部件已有|按P1_HUD_SLICE_GUIDE逐個接入|
|罪惡感爆炸|`ui/guilt_explode_sheet.png`|8格序列已有|驗證序列接入|
|攻擊/閃避/變身/技能|`icons/btn_attack_sheet.png`、`icons/btn_dodge_transform_sheet.png`、`icons/skill_buttons_sheet.png`|已有且接入|只驗收三態與對齊|
|搖桿與變身發光|`ui/control_extras_sheet.png`|已有；搖桿接入|核對發光態接法|
|任務/彈窗/劇情框|`ui/panel_sheet.png`|三框已有|任務已接；核對其餘接入|
|四種泡泡|`ui/bubble_sheet.png`|四種已有|只處理未接樣式與長句排版|
|Boss/敵人血條/連擊/舊文字按鈕|`ui/aux_hud_sheet.png`|8部件已有|接入及狀態驗收，不重畫|
|小地圖框/底/5標記|`ui/minimap_sheet.png`|已有，部分已接|核對底圖與俊熊標記|
|功能鍵|`icons/function_icons_sheet.png`|8圖示已有|保留現有接入|
|鎖定/回血|`icons/lock_heal_sheet.png`|已有|核對地面圈/回血接入|
|難度|`ui/difficulty_sheet.png`|6態已有且已接|驗收，不生圖|
|賓果卡|`ui/bingo_card.png`|已有|核對遊戲使用位置|
|Logo/封面/橫幅|`branding/logo_01_review_v1.png`、`branding/icon_01.png`、`branding/icon_01_logo.png`、`branding/banner_01.png`|已有，Logo寬度限制另列|既有核准設計不重畫；衍生規格與使用位置核對|
|主選單雙版|`branding/menu_keyart_01.png`、`branding/menu_keyart_portrait_01.png`|本聊天已生成且PR35接入|只驗收橫直裁切，不重生|
|暫停/結算新框/標題/按鈕|`ui/panel_popup.png`、`ui/panel_title_plate.png`、`ui/btn_text.png`|本聊天已生成，PR35實作及測試通過|等待合併/視覺驗收，不重生|
|履歷/算了計數器|`ui/resume.png`、`ui/counter_suanle.png`|本聊天已生成未提交，履歷欄數不合規|保留，先核對既有稿再決定修改|
|14個場景|見程式／交付紀錄|world.js已有14主題；使用者指出美術已做；10張本聊天新稿另列|查原交付來源；不再生成場景|
|首次變身13件|`transform/tf_bg_stars.png`、`transform/tf_glove.png`、`transform/tf_hair.png`、`transform/tf_jacket.png`、`transform/tf_knee.png`、`transform/tf_pose.png`、`transform/tf_scarf.png`、`transform/tf_sign.png`、`transform/tf_silhouette.png`、`transform/tf_waiting_1.png`、`transform/tf_waiting_2.png`、`transform/tf_waiting_3.png`、`transform/tf_waiting_4.png`|本聊天已生成13張但使用者指出重複；未提交、未接入|停用生成佇列；核對原稿及程式演出|
|其他三視角/道具/教學/貼圖/GLB|見程式／交付紀錄|獨立正式檔未定位，不等於從未製作|追溯交付紀錄與合輯/程式內容；無確認不進製作佇列|

## 本聊天未提交稿：另列，不作新需求

共27張，包含10場景、13變身、2學生表情、2職場道具。全部保留，沒有刪除或改圖；未混入PR35正式交付。逐檔尺寸、SHA256見同名JSON。

## 可以執行的下一步

1. 核對PR35選關、暫停、結算與等寬按鈕的交付／接入狀態，不再生圖。
2. 按既有圖集完成尚未接入項目的來源座標及畫面對照。
3. 角色表情與上班族頭像優先取自合輯，不重畫。
4. 場景、變身與其餘來源有爭議的項目維持「待追溯」，不得因ASSETS/manifest缺檔而生圖。

**本輪沒有已確認需要新生成的項目，生圖佇列為空。**
