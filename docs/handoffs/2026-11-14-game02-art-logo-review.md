# 勇氣超人：P0 角色暫稿與新版主 Logo 審稿

## 使用者指示與範圍變更

- 在 APHASEN 使用 Codex 製作第二款遊戲美術；已確認本機 COMPUTERNAME=APHASEN。
- 先製作兩張 P0 角色設定合輯。過程中使用者更正「主角衣服是全黃的」：本次將大學生上衣、袖子及袖口全部改黃，取代 CHARACTERS.md 的綠袖口舊說明；鞋與背包仍有綠色。此更正須同步至未來角色文件產生器，勿以舊規格覆蓋。
- 使用者隨後要求「先確定主要logo請幫我設計一個新版」。目前主交付改為新版 Logo 第一稿；角色停在審稿階段，未批准造型。

## Git 與工作副本

- Git 2.54.0.windows.1；origin=https://github.com/littlebow11549/games.git。
- 分支 claude/fervent-ride-4h0vjm；基底 b4674412647af54e774561dcece22b760da7fe0b。
- 本機工作副本：C:\Users\user\Documents\Codex\2026-11-14\task\games。
- 在常用專案位置未找到既有此遊戲副本後，於允許的任務工作區 shallow clone；初始工作目錄乾淨。未改動其他專案。
- 未提交、推送、部署或通知外部代理；沒有購買服務。

## 實際完成檔案

路徑均相對 repo：

| 檔案 | 原生尺寸 | 背景 | 狀態 |
|---|---|---|---|
| 02_xianxia_battle/assets/source/pic/branding/logo_01_review_v1.png | 1536×1024 | RGBA，左上 alpha=0，真透明背景 | 新版主 Logo 第一稿，未定案 |
| 02_xianxia_battle/assets/source/pic/sheet/sheet_student.png | 1536×1024 | RGB 深綠黑底 | 全黃上衣修正版，審稿用 |
| 02_xianxia_battle/assets/source/pic/sheet/sheet_braveguy.png | 1536×1024 | RGB 深綠黑底 | 審稿用 |

- 詳細大小、SHA256、格式：02_xianxia_battle/assets/source/P0_REVIEW_DELIVERY.json。
- 提示詞：02_xianxia_battle/assets/source/P0_REVIEW_PROMPTS.md。
- 使用內建 image_gen，先親自查看封面、封底及版式範例；不沿用範例兔角色。
- Windows 路徑參考參數不被生圖工具接受，改以已顯示的參考圖上下文完成生成。工具回傳 PNG bytes 以原樣存回 APHASEN；未重新編碼、未插值放大、未壓縮、未繪製程式佔位圖。

## 查核與限制

- 兩張角色表皆有 5 角度、6 表情、6 細節、5 色、角色檔案與比例區塊；中文角色名及主要英文標籤目視可讀。
- 學生各角度、表情、細節與比例圖上衣均改黃，YELLOW CUFF 標籤正確。綠色色票僅保留作鞋／背包配色，不再代表袖口。
- 勇氣超人保留棕色刺蝟頭白色高光、紅圍巾、黃橘外套、白腰帶綠扣、綠護膝及紅白鞋。背面、鞋和背包等不充分可見細節為提案。
- 比例約 4–5 頭身，未採 Q 版。跨角度仍需使用者審核，尤其帽舌方向、圍巾尾方向、胸口小 Logo、手套細節。
- 初稿身高尺數字混亂，已生圖修正成 0/50/100/150/200 cm。人物頭頂與線條仍非精密校準，不可拿來量測建模；權威設定為學生170 cm、勇氣超人172 cm、成人參照180 cm。
- 新 Logo 的「勇氣超人」與「BRAVE GUY」逐字目視正確。綠能量球、金黃字面、紅色厚邊與圍巾形成新版構圖。透明 PNG 含半透明發光邊，需依使用者偏好決定是否簡化。
- 兩張合輯達最低1536×1024，未達建議3072×2048。Logo 未達 ASSETS.md 寬2400以上，故採 review 檔名，未替換正式 logo_01.png；不能宣稱正式解析度驗收通過。
- 角色表上的小 Logo 是較早版本；主 Logo 定案後才統一更新。

## Library 與待辦

- 已依 Library 技能使用當前上傳 helper 嘗試保存3張審稿圖。初次 DNS 失敗；取得網路權限後回報「Library prepare_uploads is not available」。沒有成功 Library ID；沒有改用別的寫入流程或聲稱已上傳。
- 檔案已在 APHASEN 本機，對話可顯示生成預覽。後續需可用 Library 傳輸環境才可提供跨裝置檔案ID。
- 請使用者先確認新版主 Logo 方向，再確認學生全黃上衣、造型、背面與配件。正式高解析 Logo、身高圖精準排版、角色小 Logo 統一皆未完成。
- 本次沒有批量三視圖、Tripo 3D、後續角色、遊戲接入或部署。
