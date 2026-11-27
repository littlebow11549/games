# 2026-11-27｜錢經理、藍經理 3D 與大量敵人接觸影子

- 正式入口：`02_brave_guy/play.html?v=20261127managers`。3-6 才預載錢經理，3-3 才預載藍經理；保留兩場的對話、血量、攻擊判定及載入失敗時的舊模型。校園版不受影響。
- 來源：既有 Tripo ZIP `BraveGuy_22_Additional_Rigs_v01.zip` 的 `GLB/qian_manager_rig.glb` 和 `GLB/lan_manager_rig.glb`（Library ID `libfile_fde3_f-ce8d1b7206ec819186de72e62958b7c9_6454ceefff44819188aebf485c028f29`）。保留原檔，本次未另扣點。
- 輸出在 `02_brave_guy/assets/runtime/stage-art/`，沿用原拓撲與職場服裝，貼圖上限 1024：
  - `brave_guy_charactor09_qian_manager_motion.glb`，18 骨，遊戲身高 2.1，1,948,856 B。SHA256：`fe165ac369929c13536b85acebe7c360015d048c87b32b27d6deaafda59379c2`。
  - `brave_guy_charactor10_lan_manager_motion.glb`，17 骨，遊戲身高 2.7，1,803,236 B。SHA256：`ccdb6a31412fd6e07fa499862bc246e3d398ca518fcadda687ff0d8fd8230e47`。
- 錢經理：扇擊 0.60 秒、0.7 秒後衝出、召喚 3 隻假忙森。藍經理：召開會議、0.50 秒扇射、1.00 秒吹哨、2.20 秒回血，原本可被打斷。各有登場、移動與倒下動作。
- 影子：仍是同一批繪製，容量 128 → 512。每幀只上傳實際顯示的矩陣，不預繪空位。主角、同伴、王、特殊角色維持優先；未調整出怪量或即時光影畫質。
- 驗證：Chrome 低畫質 H5 實際載入 3-3、3-6 並從原技能入口驗證 7 招。以 390×844 瀏覽器尺寸跑 3-2 地獄三周目加成，180 小怪與主角、同伴合計 182 個接觸影子，仍為單批；未測實體 iPhone 幀率。Node 十組針對性測試通過，影子壓測含 36、144、180、400 以及超過容量時的優先順序。
- 重製：`python tools/make_game02_office_managers_motion.py --rig-zip <ZIP> --output <資料夾>`。需要回退時 revert 此提交；臨時驗證頁未入庫。
