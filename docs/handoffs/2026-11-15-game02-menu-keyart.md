# 主選單雙版主視覺與最新清單確認

使用者要求立即製作 Claude 的需求，並再次確認清單。已同步遠端 3228adf，依 ART_OUTSTANDING_2026-11-15.md 作為最新優先序；不是只有兩張選單圖。

## 本輪產出

- `02_brave_guy/assets/source/pic/branding/menu_keyart_01.png`：橫向選單用近方形構圖，原生 1330×1182 RGB PNG。
- `02_brave_guy/assets/source/pic/branding/menu_keyart_portrait_01.png`：直向選單頂部用橫長構圖，原生 1448×1086 RGB PNG。
- `02_brave_guy/assets/source/MENU_KEYART_DELIVERY.json`：實際尺寸、目標尺寸、色彩模式與 SHA256。

使用 imagegen，參照 unified 的 braveguy / angel / nightmare 合輯。兩張包含勇氣超人出拳、小天使叉腰與後方惡夢超人紫影、綠色能量背景；沒有文字或 Logo。第二張參照第一張並重新構圖。原檔直接複製，PNG 無損，沒有縮放、插值或程式改圖。

## 驗證及限制

已目視檢查兩張生成結果；小天使帽子、雙翼與上半身完整可見。Pillow verify 通過，均為 RGB PNG。
尺寸未達需求的 1800×1600 / 1600×1200，不能視為技術規格全數驗收通過。
橫版惡夢超人髮梢碰頂，主角圍巾少量進入左側裁切區；臉與拳頭位於主要安全區。直版拳頭底緣接近下方安全邊，實際斜切需檢查。
來源已保存，但尚未進行遊戲實際裁切驗證或使用者審稿。

## Claude 接續

目前 game.css 的 #menu-art .art 仍直接引用 runtime/pic/branding/banner_01.webp，沒有自動偵測新檔。需要產生網頁衍生檔、設定橫直版媒體查詢引用及 background-size/position，再驗證斜切、語系按鈕與泡泡遮擋。不能把「放入來源檔」視為已接入。

最新缺件優先序：P0 模型與場景；P1 UI/品牌/變身演出及 SFX；P2 表情/教學/職場道具；數字、字藝與特效貼圖選做。既有 UI 圖集先核對再補件。模型依 MODELS_3D.md，由 3D 工作流程處理，兩張插圖不是模型交付。

## 發布狀態

本輪圖檔及報告保存於工作區並作本機 Git 提交；未推送、未部署、未傳訊通知 Claude。其餘缺件未在本輪製作。
