# 全關勝利畫面與清脆打擊／華麗變身音效

## 完成內容
- 14 關皆在通關當下顯示既有勝利美術、成績、獎勵與等寬操作按鈕。成績凍結，重複觸發不重複授獎；下一關按鈕先播放該關收尾對話，再開下一關。
- 最終關同樣先顯示勝利，按繼續才播放結局與原有 8 秒 LilinS Staff；保留重打、選關和重播結局。
- 復用原有三語結果藝術字與面板，只加勝利入場光效；無新圖、無重製既有素材。
- 三種普通命中改成 0.18 秒乾脆高頻撞擊，重擊改成 0.32 秒，縮短低頻拖尾。
- 變身蓄力加入漸強亮音連奏，登場加入和弦、閃光與掠過聲。新增 tf_stars / silhouette / glove / knee / jacket / hair / scarf / pose 共 8 個專屬音效，依實際分鏡切換播放；著裝五鏡各有不同音色。

## 檔案、規格與分類
- 流程：02_brave_guy/js/main.js；動畫：css/overlay-art.css；同步：js/transform-art.js；快取版本：js/audio.js、index.html。
- 音效來源：02_brave_guy/assets/source/sfx/，manifest.json 對應；SFX_DELIVERY.json 含規格、SHA256、母帶路徑。
- 新版 14 個 WAV 母帶：_archive/game02/sfx/2026-11-15/combat-v3/，44.1kHz／mono／16-bit；原有母帶保留。遊戲 MP3 96kbps，整包 71 種／72 檔（含原 beam OGG 與 MP3），579002 bytes。
- 原創 DSP 合成工具：tools/make_game02_sfx.py。6 個既有音效更新、8 個新增，其餘 57 種保留。
- 試聽：assets/preview/audio/crisp-glam-v3.mp3（依序普通三擊、重擊、八段變身）；勝利截圖及檢查：assets/preview/stage-victories/。

## 驗證
- game02-stage-victories.cjs：14 關 × 中英日 = 42 組；即時勝利、凍結成績、單次授獎、對話後下一關、最終勝利後結局／Staff、重打與選關全部通過。320／390／844 寬度留圖。
- game02-result-titles.cjs：27 組藝術字檢查通過。
- game02-cinematics.cjs：Boss、結局、Staff、鎖定、連擊、罪惡表回歸通過，0 JS／素材錯誤。
- game02-transform-sfx.cjs：首次變身、重播、五個 800ms 著裝切鏡、登場、語言切換不重播、跳過取消均通過。
- game02-sfx-delivery.cjs：72 音檔解碼成功、85 快取鍵；16 聲疊音峰值 0.542，無數位削波。audio-sfx.test.mjs：7/7 通過。
- 已檢視手機日文最終勝利畫面。音效為檔案／瀏覽器解碼、同步與混音驗證，未宣稱實體手機喇叭聽感測試。

## 發布與未完成
- 本次程式、音檔、測試和報告一起提交；合併與 Pages 發布結果見對應 PR／工作流程。
- 本次需求已完成；現存待追溯美術草稿保持未提交，未執行生圖佇列。
