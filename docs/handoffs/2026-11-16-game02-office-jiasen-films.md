# 3-7 假忙森主管專屬圖片過場

## 同步與範圍
基於Claude e1116eb/a130ee9的16關版本；保留新關、5600HP、甩鍋／召喚、tired+confuse、既有3-6過場及其他玩法。已讀新關交接及素材來源台帳，只補已確認缺少的3-7登場與勝利。

## 素材與接入
- 角色依CHARACTERS §11、原reference/braveguy_jiasen及unified/sheet_zhuangxiong：橘棕縫線布偶熊、圓耳、紅雞冠、灰白孔洞紅斜紋面具；職場版灰黑西裝、紅領帶、黑屏電腦。
- boss_jiamangKing_storyboard：黑屏假忙／舉鍋推責／甩鍋紙張風暴三鏡，12秒登場。
- victory_jiamangKing：接招／勇氣超人拳打回鍋命中面具／面具脫落、布偶現形三鏡，6秒勝利。自審發現初稿擊中鏡三隻熊掌，修訂為兩掌後才採用；退回稿保留、不接入。
- 原生1024×1536 PNG歸檔source/pic/cinematics；同名WebP配送至runtime/lossless/pic/cinematics。無損最高壓縮、原尺寸與RGBA逐像素一致，細節與SHA見source/brave_guy_record16_jiamang_films_review.json。沒有插值放大，沒有把整個圖集當單鏡播放；每鏡原生1024×512供手機顯示，登場contain保留人物道具。
- 圖片按需解碼後播放，不加入首屏讀取。補jiamangKing的profile、三語對嗆、勝利鍵及獨立檔案，取代加班鬼王借圖。
- 入口/main及變動模組版本20261116jiamang；前關、最終魔王及16關順序保留。

## 檢查與發布
完成後補記實際3-7跳王→三鏡登場→擊倒→三鏡勝利→結算的中英日測試、手機實際畫面與壓縮數據。原圖自審不代表使用者已批准。透過本報告與HANDOFF同步Claude。

## 完成驗證
- 3-7實際流程中英日全通過：9登場鏡／9勝利鏡、可跳過、結算與下一關可見，0 JS／HTTP錯誤；英文使用320×568，其餘390×694，已檢視手機實際畫面。
- 16單元測試通過。兩張PNG合計4,622,728 bytes→WebP 3,340,464 bytes，縮小27.74%；原尺寸RGBA一致。
- 發布前再同步Claude剛新增的音效／音樂v2提交a9d207b，保留其素材及專屬BGM／狂暴曲接線，不覆寫回舊版本。隨後再次同步Claude c9faa41/57f4b02，3-7專屬關卡曲及Boss曲已接線，音樂清單與音檔原樣保留。
