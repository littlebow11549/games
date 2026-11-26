# 勇氣超人｜佛賴弟與佛賴弟王 3D 接入

- 造型沿用 `CHARACTERS.md` 的紅色格紋臉、帽沿、綠葉與黑白條紋衣。來源：`BraveGuy_22_Additional_Rigs_v01.zip` 內 `GLB/folaidi_rig.glb`，未追加 Tripo 點數。
- 小怪共用 GLB，播待機、走跑、後退、投擲、受擊、暈眩、倒地，出生時從地板露出上半身再冒出。仍在原 0.7 秒發出投射物，傷害與移動不改。
- 佛賴弟王使用同一模型，沿用 4.6 顯示高度；躺在印有「截止」圖案的床上再撐起，床只在出場階段顯示、不設碰撞。補齊砸地、衝撞、召喚動畫。沿用原 Boss 攻擊、波次、召喚數、出場時間、存檔與判定。加班鬼與加班鬼王未改。
- 正式素材 `02_brave_guy/assets/runtime/stage-art/brave_guy_charactor05_folaidi_motion.glb`，1,576,056 bytes，SHA-256 `04f8d06522852de13f4545090691a45254b4ff15583a5794df391563b4df5d73`，17 骨、12 段動作、原始 29,188 三角面。重新分配袖口權重並做局部稀疏形變校正；不更動原本衣料花紋。模型只在波次、Boss 或召喚需要的關卡載入。
- 驗證：本機正式 H5 入口進 1-1，目視核對新小怪混戰、Boss 貼圖與實戰傷害回饋；另以 390×844 手機尺寸重看同戰鬥。使用同一遊戲動畫播放器與 Three.js 分別在 0.025、0.18、0.42 秒看床、起身與場景清理，逐格檢查。未宣稱實體手機效能或全套 E2E 通過。
- 回歸：`node tools/tests/game02-folaidi-motion.cjs`、`node tools/tests/game02-campus-boss-motion.cjs`、`node tools/tests/game02-ganqiao-motion.cjs`。
- 重製：`python tools/make_game02_folaidi_motion.py --rig-zip <骨架 ZIP> --output <輸出目錄>`；用 NumPy、SciPy、Numba、Pillow，與同 repo 內的 GLB 工具一起使用。重製後重新核對 SHA。
- 發布入口 `02_brave_guy/play.html?v=20261126folaidi`。緊急回退可將 `assets/manifest.json` 的 `folaidi` 設回 null，兩角色即回退；也可 Git revert 整次 commit。
