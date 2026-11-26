# 勇氣超人｜上班族 3D 實裝

- 職場篇與終章（form: worker）以白襯衫、鬆領帶、識別證與西裝褲的 3D 模型取代佔位造型。其他角色選擇及校園主角外觀不變。只在勇氣超人進入需要上班族基礎形態的關卡時讀取，缺模型時沿用原造型。
- 將學生版的 9 段動作轉接到上班族骨架：待機、跑動、左右拳、閃避、受擊、暈眩、倒地、變身蓄力。調整出拳抬臂並修正襯衫變形。未改拳擊命中時間、跑速、變身門檻或解除條件。戰鬥版沒有新增手持公事包。
- 來源：BraveGuy_22_Additional_Rigs_v01.zip 的 GLB/office_worker_rig.glb；動作取自正式學生 GLB，重製命令 python tools/make_game02_worker_motion.py --rig-zip <zip> --output <dir>。未追加 Tripo 點數。
- 部署：02_brave_guy/assets/runtime/stage-art/brave_guy_charactor15_worker_motion.glb，1,774,104 B，SHA-256：8dfdc054eda3db48f11102a5762ffb1e89ab20c92d11556de914ac2d2ef9b2ac。
- 驗證：在正式 H5 入口的本機副本執行 3-2 遊戲控制、移動／回待機、兩拳連段、閃避、充能變身與還原至同一套上班族模型。390×844 瀏覽器低畫質檢查人物與腳底柔影，未以 iOS 實機測試。另通過 worker、陰影、夢魘、俊熊、假森、佛賴弟、三態幹譙龍、校園 Boss 共 8 項測試。臨時驗證頁不進 Git。
- 版本：02_brave_guy/play.html?v=20261126worker。只回退上班族模型時可移除 assets/manifest.json 的 models.worker 項目；完整回退用 Git revert。
