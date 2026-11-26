# 2026-11-26｜3-2 新雞、八卦蛇 3D 雙守關者

- 正式入口：`02_brave_guy/play.html?v=20261126officeDuo`。只在職場 3-2 預載兩個模型，載入失敗仍保留原程式模型。
- 來源：既有 Tripo 檔 `BraveGuy_22_Additional_Rigs_v01.zip` 的 `GLB/newbie_chick_rig.glb` 與 `GLB/gossip_snake_rig.glb`。原始 ZIP 保留、不覆寫，Library ID `libfile_fde3_f-ce8d1b7206ec819186de72e72958b7c9_6454ceefff44819188aebf485c028f29`。沒有再扣 Tripo 點數。
- 輸出（均保留原拓撲與色彩，貼圖上限 1024，分別以翼／腿及分段蛇骨架製作動作）：
  - `assets/runtime/stage-art/brave_guy_charactor19_xinji_motion.glb`：12 骨，1.4 高，1,836,344 B；SHA256 `9621ea66ff0e9c8d7adbcaf4393cc8e7cd46afc1ebc3dafa06ae40c6f6d776b2`。
  - `assets/runtime/stage-art/brave_guy_charactor20_baguashe_motion.glb`：6 骨，1.5 高，1,393,948 B；SHA256 `ad2d65c52557015043b6a0f8674e25bbe5bcbf3f4262768fa03e73b0e945c897`。
- 新雞：碎步、模仿氣功彈與蓄力衝刺。八卦蛇：蛇行、咬耳朵與扇射。各自登場和落敗。此版沿用來源模型的道具，不另刻手機。模仿彈和扇射保留 0.50 秒出手，咬耳朵立即給其他存活敵人 5 秒加速；衝刺從 0.7 秒後才移動。未改傷害、技能時機或存檔資料格式。
- 兩位並排進場，由既有迷宮 walkable 碰撞修正位置。雙王血條記錄登場總生命 5,200，不因第一隻尸體清除而跳回；單王繼續用原分母。
- 驗證：Chrome 正式 H5 入口的本機測試（品質 0）中，兩個實際 GLB 載入、登場分開、足下影子可見；四招從實際技能程式觸發，兩種擊敗順序都走一遍敵人清除與勝利分支。剩 1,300 HP 時血條在清除前後都維持 25%，第二位落敗歸零；通關紀錄只記一次。九組針對性 Node 驗證通過。沒有實體 iPhone 驗證；尚未把其他職場王的原版模型換成這兩隻。
- 重製：`python tools/make_game02_office_duo_motion.py --rig-zip <原 ZIP> --output <輸出資料夾>`。正式檔與本次測試入口一起 revert 此批 commit 即可回退。臨時 QA 頁沒有進 Git。
