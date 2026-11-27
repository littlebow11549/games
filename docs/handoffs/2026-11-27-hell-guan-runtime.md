# 2026-11-27 地獄超人、冠老闆 3D 接入

- 正式入口：`02_brave_guy/play.html?v=20261127hellGuan`。2-2 預載地獄超人，3-5 預載冠老闆，其餘關卡不下載此批模型。GLB 失敗保留原本程式模型。
- 沿用 Tripo 封存 `BraveGuy_22_Additional_Rigs_v01.zip`（Library：`libfile_fde3_f-ce8d1b7206ec819186de72e62958b7c9_6454ceefff44819188aebf485c028f29`）的 `GLB/hell_rig.glb`、`GLB/boss_guan_rig.glb`；無新扣點、保留原檔。兩個 runtime 模型位於 `02_brave_guy/assets/runtime/stage-art/`，材質貼圖最大 1024。
  - `brave_guy_charactor14_hell_motion.glb`：18 骨、身高 2.3、2,219,868 B；SHA256 `708c93bcaa3eb315ade66ae10e5724991a57d5976450f79db324b8c15419b914`。
  - `brave_guy_charactor25_boss_guan_motion.glb`：12 骨、身高 3.4、1,903,592 B；SHA256 `21120abf7438af4fdec15c17aa08288e60e22f60e02899535a215b9577ac4786`。
- 地獄超人：衝拳（0.50 秒後才突進）、震地（0.80 秒判定）、黑火（即時布置五處預警）、氣功彈（0.50 秒）、情勒（即時 +8 罪惡感）。冠老闆：扇射（0.50 秒）、畫大餅（即時布置三個）、俯衝（1.60 秒鎖定、2.20 秒落地、2.20 秒硬直）。兩個 Boss 都有待機、移動、出場、倒地；招式碰撞、血量、冷卻、判定不變。冠老闆飛行高度由原遊戲邏輯控制，不重複寫入骨架高度。
- 驗證：Windows Chrome 低畫質載入 H5 實際 2-2、3-5，通過兩場守關過場、8 招執行及原判定時機、主角／同伴／王的接觸影子。Node 讀取 GLB 驗證骨架、動畫軌道、播放秒數與檔案預算。附兩份從 GLB 擷取的動作分格（非實機截圖）；未做 iPhone 真機幀率測試。
- 重建：`python tools/make_game02_hell_guan_motion.py --rig-zip <ZIP> --output <資料夾>`，檢查 `node tools/tests/game02-hell-guan.cjs`。回退用 Git revert 本批提交。
