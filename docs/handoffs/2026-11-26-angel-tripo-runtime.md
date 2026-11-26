# 勇氣超人｜小天使 3D 動作接入

- 適用：可玩小天使（`angel_playable`），不替換跟隨型小天使（`angel`）或其他角色。
- 檔案：`02_brave_guy/assets/runtime/stage-art/brave_guy_charactor02_angel_motion.glb`，4,948,940 bytes，SHA-256 `a36f41de6852df5c7dc014866ee013a94d4273ee620db47159cfa9830f4a1568`。
- 來源：Little_Angel_Tripo_Rig.glb 的 52 根 Mixamo 骨骼，原貼圖保留。左右手與裙襬、頭髮相接區分離並封合；右直拳獨立校正。其他動作以現役勇氣超人動作為基礎轉接，修正高彎曲處。這不是被 Chrome 擋下的 Tripo Text to Motion 匯出。
- 動作：待機、跑、普攻、閃避、受擊、暈眩、前方施法、範圍施法、大招及爆氣備用；Q/E/R/F、爆氣、命中與數值程式未修改。爆氣沿用原有效果流程。
- 載入：遊戲開場不下載小天使 GLB，首次選角才讀取；失敗保留原來的角色外觀，進關不被卡住。快取標記 `20261126angel3d`。
- 本機驗證：1-0 宿舍與 1-1 教學大樓，Chrome 桌面及 390×844 H5。跑步、普攻、閃避、Q/E/R/F、爆氣控制與招式演出可用；選角後才觀察到模型請求。正式站發布需另查部署與線上檔。
- 回復：移除 manifest 的 `angel_playable` 槽即可回原表示；不需改戰鬥或存檔格式。
