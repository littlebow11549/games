# 8格街機擊中動效

- 使用者要求6–8frame、比照格鬥天王擊中效果；製作原創8格白芯／黃橘放射火花，40fps單次0.2秒，最後碎片消散。
- 檢查既有fx_spark.svg與3D粒子後，確認沒有逐格序列，依明確需求新增圖集。第一版光霧過大，imagegen修正透明硬邊後使用第二版。
- 素材：02_brave_guy/assets/source/pic/fx/brave_guy_fx01_fx_hit_arcade_8f.png，1774×887 RGBA，原生生成圖4×2等分UV，保留原檔不重採樣。生成來源 /workspace/generated_images/exec-2b2382cc-1ace-424f-b9da-31fc47c801d7.png。
- Fx.hitSpark 為場景中面向鏡頭Sprite，depthTest開啟不穿牆；普通1.7、重擊／暴擊2.6世界單位。8張UV貼圖共用資源，結束僅釋放每個Sprite材質，不處置Three共用Sprite幾何。
- damageEnemy 在有效正傷害且未格擋時播放，含普通攻擊與技能；同敵人80ms節流，同時最多18個。0.2秒自動清除，換關fx.clear同樣清除。原有音效／命中停頓保持。
- 圖片未載入或失敗時跳過新火花，原有模型閃白等仍保留，不卡遊戲。
- 預覽：02_brave_guy/hit-effect-preview.html，手動播放與8格靜態檢視，未自動循環閃光。
- 驗證：tools/tests/game02-hit-spark.cjs通過8格序列、到期清除、18個上限、clear、真實damageEnemy觸發、節流、死敵不觸發；預覽截圖確認透明背景無白底。非手機實機FPS測試。
- 更新main/fx快取版本與play.html。無未完成項目，推送後Pages部署並在聊天確認。
