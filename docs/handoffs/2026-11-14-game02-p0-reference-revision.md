# P0 六張單視角參考：白底與局部校正 v2

使用者要求「繼續」，本次完成六張既有單視角圖的內建 image_gen 精修，未新增角色、未呼叫Tripo。

## 已保存成果

本機根目錄：`C:\Users\user\Documents\Codex\2026-11-14\task\games`。

目前版本均在 `02_xianxia_battle/assets/source/pic/concept/`：

- `student_front.png`、`student_side.png`、`student_back.png`
- `braveguy_front.png`、`braveguy_side.png`、`braveguy_back.png`

原灰底版本備份在同目錄 `history/{id}_{view}_gray_v1.png`。既有舊版 hero_* 佔位檔未動。

## 修正與目視結果

- 六張均由灰底改成接近純白底，無明顯場景、地面陰影或光效；仍各一角色、一角度、完整全身。
- 兩角色正面手掌、背面手背與指甲改為明確可辨識，露出的手指較完整。此為目視改善，不宣稱已通過骨架／拓撲或工程三視圖驗證。
- 勇氣超人正背面鞋圓片改為每鞋外側各一片，移除內側重複圓片。
- 勇氣超人左側胸口Logo改為沿正面邊緣縮窄的投影，不再平貼側身完整展示。
- 全黃學生上衣、角色主要輪廓與配色、建模用短圍巾貼背保留。

## 實測限制與最小阻礙

- 六張仍為**原生1254×1254 RGB PNG**，未達需求2048×2048。工具沒有可用的顯式尺寸參數；多次提示原生2048後仍輸出1254，因此不再以同一流程重試或插值放大冒充。
- 每張四角及左右外側背景共六點採樣，每色通道在253–255，不是完全一致的#FFFFFF。視覺白底改善，但嚴格純色驗收仍未通過。
- 解析度與像素精確背景仍需能指定原生尺寸／精確遮罩編修的可用流程；本次沒有擅自啟用付費API或購買服務。
- 側視與正背視仍非同一3D模型渲染，不能保證所有關節、帽舌、髮尖與身高線精密對齊。尚不標記為正式已驗收Tripo輸入。

## 證據與交接

- `assets/source/P0_3D_REFERENCE_DELIVERY.json`：v2尺寸、格式、背景採樣、bytes、SHA256；原檔bytes原樣存回，未重新編碼、未縮放。
- `assets/source/P0_3D_REVISION_PROMPTS.md`：六次完整精修提示詞。
- 舊 `P0_3D_BACKGROUND_CHECK.json` 是v1灰底歷史採樣；最新以DELIVERY內background_samples為準。
- 更新ASSETS.md與HANDOFF入口；git diff --check通過。
- 未提交、推送、部署、外部通知或Tripo轉換。Library既有傳輸限制未解除，無Library ID。
