# 2026-11-16 關卡順序、音效整理與未變身操作

## 完成內容
- `02_brave_guy/js/story.js`：遊玩順序改為客服部(3-4) → 財務部(3-6) → 甩鍋會議(3-7) → 頂樓冠老闆(3-5) → 董事長室(4-1)。保留 ID，沿用存檔、音樂與成績關聯；畫面關卡編號因此不連號。
- `js/main.js`、`play.html`：未變身僅顯示出拳、閃避；勇氣滿且已解鎖變身、非終章限制時才顯示變身鍵。變身後恢復技能及鎖定操作，變身鍵隱藏；退回原形再次收起技能。隱藏按鈕清除 held 狀態。鍵盤原操作不變。
- 選關新增 `stage_select` 雙音 0.275 秒；對話新增 `dialog_next` 單音 0.105 秒；結算 `win` 改為四音 0.640 秒。未找到獨立計分循環音，此處替換的是結算觸發的勝利音。
- 對 manifest 目前使用的 74 個獨立音檔逐一解碼及分析。以能量加權頻譜平坦度 ≥0.06、高於 5kHz 能量比 ≥25%，加上常用 UI 類別篩選。這是客觀篩查，不代表人工逐檔聽感驗收。
- 篩選 40 檔：39 檔依打擊、掃掠、能量、和弦、UI 類別重新合成；1 檔群眾歡呼保留錄音、低通與降音量。另有上述 3 個專用短音。原始音檔保留，所有 manifest 別名同步切換。
- `js/audio.js`：備用音效改為正弦音包絡，避免首次載入或失敗時回到寬頻噪音；保留靜音與播放節流。
- 入口、主程式、音效模組、關卡模組與 manifest 更新版本參數。

## 素材規格與來源
- 原創 DSP 無外部樣本：`tools/make_game02_ui_clean.py`、`tools/redesign_game02_sfx.py`。
- 新檔：`02_brave_guy/assets/source/sfx/sfx_{stage_select,dialog_next,result}_clean.wav` 及 `assets/source/sfx/clean/`。
- PCM16、單聲道、44.1kHz，淡入淡出；beam_loop 為整數頻率週期波形，不做端點淡出以保持循環。目標峰值按用途 -10 至 -21 dBFS。
- 歡呼沿用專案原有來源及授權，僅濾波降音量。
- `docs/reports/2026-11-16-sfx-before.json` / `sfx-after.json`：74 檔前後量測。
- `docs/reports/2026-11-16-sfx-replacements.json`：完整原檔、新檔與設計分類對照。
- `tools/audit_game02_sfx.py`：可重跑分析，依賴 ffmpeg、numpy；重製另需 scipy。

## 驗證及限制
- 17 項 Node 測試通過（含新增備用音效淡入淡出、節點清理與靜音驗證）（進度、計時、音效、效能）。
- Chromium 解碼全部 74 個音效成功，頁面無 JavaScript error；末五關順序符合要求。
- Chromium 390×844：未變身兩鍵 → 勇氣滿三鍵 → 變身技能／鎖定顯示 → 退回兩鍵，皆符合預期。
- 音效分析與技術驗證不等於主觀聽感確認；尚待使用者實機試聽，未宣稱逐檔人工聽過。
- 未完整真人通關；BGM、群眾掌聲保留。

## 發布狀態
已整合遠端 #58 的 Logo 與重設進度功能；音效以本次全面清理版本為準。整合後 19 項測試通過，Chromium 再驗 74 檔解碼與操作鍵切換成功。

程式提交 `6655f48` 已推送預設分支；GitHub Pages 部署 [43800821430](https://github.com/littlebow11549/games/actions/runs/43800821430) 成功。已讀取線上 main.js，確認新操作鍵條件、dialog_next 與 stage_select 接線存在。網站：https://littlebow11549.github.io/games/02_brave_guy/ 。
