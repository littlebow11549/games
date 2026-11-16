# 2026-11-16 換目標按距離、對話輕點音

## 完成
- `js/targeting.js`：每次切換重新依主角與敵人中心距離升序排列。首次選最近，後續由近至遠循環；最遠回最近。Shift+Y保留反向；同距離維持原順序。排除死亡／已移除／尚在出場／超距離目標，不修改原敵人陣列。
- `assets/source/sfx/sfx_dialog_soft_v4.wav`：獨立新對話音效，85ms、44.1kHz、PCM16單聲道，峰值約-19.94dBFS。420Hz主音與微弱1159Hz泛音，柔和包絡，無噪音層；原檔保留。
- `tools/make_game02_dialog_soft.py`：可重建原創DSP音效。
- manifest將dialog_next改接新檔；audio.js的首次未載入備用聲音同步，80ms節流避免連點堆疊。
- 更新入口、main／targeting／audio／manifest快取版本；其他ComfyUI v3音效不變。

## 驗證
11項針對音效與換目標測試通過，含亂序出生、遠近循環、反向、敵人移動、同距離與不可選目標。瀏覽器實際點擊換目標及對話檢查另確認。

## 發布
依既有要求驗證後推送預設分支並確認Pages部署。主觀聽感待使用者試玩。
