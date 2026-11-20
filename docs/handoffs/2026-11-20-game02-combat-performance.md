# 戰鬥效能：共用對話貼圖、減少碰撞配置與HUD重寫

## 量測與範圍
針對目前勇氣超人戰鬥，尤其新增的惡夢十門砲陣、小天使結界與每幀HUD。保留攻擊倍率、子機數量／時長、貼圖1536×384清晰度、傷害與控制效果。

可重跑：`node tools/tests/game02-combat-perf.cjs /tmp/game02-combat-perf.json`。使用Chromium、390×844視窗、200個固定目標、500步×0.02秒的獨立砲陣模擬。特效採空函式以隔離CPU與Canvas生成成本，**不是整場GPU FPS、也不是iPhone實測**。每輪清理全部場景節點，第一輪視為冷啟動。

| 指標 | 修改前 | 修改後 |
|---|---:|---:|
| 每次大招新建對話Canvas | 164 | 6 |
| 暖機後三輪模擬耗時中位數 | 462.4 ms | 58.4 ms |
| 靜止HUD連續60次更新的DOM修改 | 900 | 0 |
| 模擬結束後場景殘留節點 | 0 | 0 |

對話貼圖重繪少96.3%；這個隔離測試CPU耗時少約87.4%。時間會受測試機負載／JIT影響，不當作整體幀率提升承諾。原始四輪ms：修改前1202.4/462.4/292/580.4；修改後151.3/76.8/58.4/48.4。/tmp保留本次量測JSON，不新增預覽頁。

## 程式變更
- pua-projectile.js：相同語系與台詞只繪製一張不可變CanvasTexture，Sprite仍各有獨立material／位置／縮放／追蹤目標。
- 以material dispose事件引用計數，最後一位使用者消失時才dispose texture並移出Map；沒有永久累積的語系貼圖快取。同時存在的不同語言互不污染。
- 新增disposeProjectileMaterial：非共享貼圖仍依原規則釋放；主程式敵彈、客串砲彈、王之嘴炮門陣全部使用相同安全釋放方法。Sprite共用geometry仍不可dispose。
- royal-arsenal.js：有效目標使用Set查詢，目標失效改線性最近距離搜尋，避免複製／完整排序；逐敵人線段碰撞改數值距離平方，消除每組判定的Vector3 clone與開根號。原3D掃掠命中邊界保持。
- guest-combat.js：每次更新重用彈體候選敵人列表，每發仍重新檢查存活避免打死後重複命中；五子機改線性尋找最近目標。結界維持直接活動引用，無須對每個敵人掃描技能陣列，結束／clear立即移除引用。
- main.js：資源名稱、救援文字、技能aria-label／title、按鈕顯示與disabled屬性，只在值不同時寫入。動態倒數／冷卻仍照常更新。
- 入口及依賴版本20261120perf，所有貼圖共用者使用同一模組實例。沒有新增或降低美術解析度。

## 驗證
- game02-projectile-resources.cjs：60獨立material共用6貼圖；部分銷毀不提前釋放；最後全釋放且重複dispose不誤減；三語隔離；清理後可重新建立；1536×384維持；靜止HUD零多餘寫入。
- game02-royal-arsenal.cjs：十門、追敵重選、命中、召回、暫停、清理、語系。
- game02-angel-barrier.cjs：前方Q、五點R、Boss／小怪排斥、跟隨與到期、新圖示。
- game02-playable-roster.cjs：八技能／角色／救援／清理。
- game02-language-faces-drones.cjs：三語、受傷頭像、五子機飛行／改鎖／返回。
- game02-performance.cjs：選單、戰鬥、暫停、Boss過場冒煙量測，沒有開場下載結局掌聲，選單HUD零更新。軟體WebGL結果不作裝置FPS保證。
- 上述皆通過，git diff --check通過。

## 發布
提交後推送既有Pages分支，待部署完成核對正式站關鍵檔案，結果於任務回覆確認。
