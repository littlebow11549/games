# 勇氣超人｜幹譙龍三型態 3D 動作與正式關卡

用同一張既有三型態設定集核對設計。來源是 Tripo 匯出的模型以及 `BraveGuy_22_Additional_Rigs_v01.zip` 內 `GLB/ganqiao_{initial,mid,final}_rig.glb`；未重畫角色、未新增 Tripo 點數。初階／中階保留雙足與巨爪，完全體保持四足。職場支線參考造型未替換。

| 階段 | 套用與動作 | GLB 大小 | SHA-256 |
| --- | --- | ---: | --- |
| 小幹譙 | `ganqiao`，1-0 起；待機、步跑、揮爪、受擊、暈眩與倒地 | 1,446,096 B | `41b2f9580df1d31482ec9a01e2d223bd1a16825ff0feca38c15ba1bdd9b757ff` |
| 悶幹譙 | `ganqiao_mid`，2-1／2-2；2-1 的 `midKing` 共享同一模型，沿用 4.4 視覺高度，新增吼叫召喚、衝撞與砸地動畫 | 1,397,848 B | `2d4e5c6e2a9db1fff5613dd88db77bd42caa0fc297cff98ff20a2e541914920a` |
| 幹譙龍 | `ganqiaoFull`，3-4；四足行走、擺頭張嘴吐息、伏低衝撞、抬爪砸地。外觀高度 2.65，避免四足模型過長擋住走道；戰鬥半徑、血條、名稱與判定不改 | 1,427,832 B | `b409b74d0ff7cca987793ec0ce1f8cec7c9fb58b711ddf6617ada0659500d3a4` |

- 工程位置：`02_brave_guy/assets/runtime/stage-art/brave_guy_charactor03_ganqiao_{initial,mid,final}_motion.glb`，設定見 `02_brave_guy/assets/manifest.json`；招式與關卡載入映射集中於 `js/ganqiao-motion.js`。
- 按關卡波次、補兵與守關者需求載入，不增加主選單讀取。三型態保留原始網格（依序 29,506、29,422、28,538 個三角面），避免原本減面候選版的毛邊、角與巨爪破點。紋理壓縮、16-bit 索引，一組共 4,271,776 bytes（原骨架 6,005,040 bytes）。畫面外剔除使用加寬的動畫邊界；逐隻釋放自己的材質與骨架，不釋放共用模型內容。
- 進遊戲驗證：桌面 H5 1-1 小怪群、2-1 與 3-4 Boss 實戰；另用 390×844 視窗進 2-1／3-4。實玩看到追擊、戰鬥血條和砸地預警；檢視逐幀角色外觀和嘴／爪／尾巴動作。候選版中階放大有破點，已保留原面數並重跑 2-1 實機確認。未宣稱實體 iOS 裝置效能或全關通關。
- 執行 `node tools/tests/game02-ganqiao-motion.cjs`，驗證素材、三型態映射、戰鬥時間和效果未改；`node tools/tests/game02-campus-boss-motion.cjs` 驗證校園兩 Boss 不受影響。需 Playwright 的既有套件在這個工作區未跑。
- 可重製：`python tools/make_game02_ganqiao_motion.py --rig-zip <骨架 ZIP> --output <目的資料夾>`；需 NumPy、SciPy、Numba、Pillow。產生 GLB 和取樣 QA 分格，交付前按 manifest 的名稱放入原目錄，並重算 SHA-256。
- 發布入口：`02_brave_guy/play.html?v=20261126dragon`。回退可移除 manifest 中這三個槽，載入時沿用舊模型；若要回退整組同一變更，使用 Git revert。
