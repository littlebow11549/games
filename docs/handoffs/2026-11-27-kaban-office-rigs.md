# 2026-11-27 加班鬼、加班鬼王及職場龍動作

- 正式入口：`02_brave_guy/play.html?v=20261127kaban`。3-0 起在既有出怪關卡使用輕量加班鬼；3-1 才載入完整加班鬼王。只有王拿打卡機，掛在左手骨架上，場景清理時釋放。不改既有關卡與波次、HP、攻速、範圍、傷害和判定。
- 來源：`BraveGuy_22_Additional_Rigs_v01.zip`（Library ID `libfile_fde3_f-ce8d1b7206ec819186de72e62958b7c9_6454ceefff44819188aebf485c028f29`）內 `GLB/kaban_rig.glb`。保留原檔，無 Tripo 新消耗。
- `02_brave_guy/assets/runtime/stage-art/brave_guy_charactor16_kaban_crowd_motion.glb`：415,532 B，5,068 三角面、512 貼圖、17 骨，無修形層。原 28,432 面減少 82.2%。SHA256 `98608d0c8cd2971ae5c54b4f016a81c1583d200c7f09692852de5c22e211e7a0`。保留帽沿、領帶、面部的材質接縫。攻擊仍在 0.55 秒判定。
- 同目錄 `brave_guy_charactor16_kaban_king_motion.glb`：1,656,364 B，28,432 三角面、1024 貼圖、17 骨。SHA256 `35efc7d31f8847fc2d52555fd8187184a62a9a11f2c3058cbf1e06fdb41af792`。砸地 0.95 秒、0.70 秒後衝撞、即時召喚五名加班鬼。
- H5 自檢：Chrome 低畫質實測 3-1 Boss 過場、三招與五名小怪；390×844 的 3-2 地獄難度第三輪，180 隻小怪（本輪 87 隻加班鬼），連英雄與同伴應有的 182 個腳下陰影皆存在。核對實際使用 5,068 面模型。另通過 12 組 Node 針對測試。未測實體手機幀率。
- 職場龍：ZIP 的 `GLB/ganqiao_office_rig.glb`、`GLB/mid_ganqiao_office_rig.glb` 完成 6 / 9 個動畫並檢視。服裝分別保留綠色耳麥領帶、灰色西裝。現有職場波次沒有這兩種小龍，3-4 是橘色完全體，故不新增小怪、不替換三型態；這兩份留作待配置，不進正式 manifest。
  - `BraveGuy_ganqiao_office_GameMotion_v1.glb`：1,407,084 B，28,650 面，SHA256 `62a7c620c52a8c749de7d9283419f0944b96ef8ae85fe2d8ca3f041c37341a5d`。
  - `BraveGuy_mid_ganqiao_office_GameMotion_v1.glb`：1,420,344 B，29,298 面，SHA256 `aaf15eea806fd0461a7fc657a2cc0ad58457b06c1bbae5d16e3d23b6db2fe245`。
- 重製：`python tools/make_game02_kaban_motion.py --rig-zip <ZIP> --output <目的資料夾>`，再 `python tools/make_game02_kaban_lod.py <王的 GLB> <小怪 GLB>`。職場龍重建使用 `python tools/make_game02_ganqiao_motion.py --office --rig-zip <ZIP> --output <目的資料夾>`。本機 QA 測試頁不入庫。回退用 Git revert 本批提交。
