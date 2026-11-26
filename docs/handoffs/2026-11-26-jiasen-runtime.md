# 勇氣超人｜校園假森、職場假忙森與主管 3D 整合

- 校園 `jiasen` 保留橘布偶、縫線與面具，播出追擊、揮拳、受擊、暈眩、倒地。第 0.75 秒既有近戰判定不變。
- 職場 `jiamang` 使用獨立西裝版，播出走跑、後退、投鍋等動作。右手蓄力時可看見帶鍋柄的平底鍋，原第 0.8 秒釋放後，飛行物沿原路線旋轉；傷害、碰撞半徑、被牆擋下及對凡人 2.5 秒緩速不變。過期、換關與命中會釋放飛行物資源。
- 3-7 的 `jiamangKing` 共用西裝模型，沿用 3.4 顯示高度。砸地、衝撞及召喚有獨立動作，原本攻擊時機和召喚數不變，不會誤用小怪的甩鍋。
- 原始來源：`BraveGuy_22_Additional_Rigs_v01.zip` 中的 `GLB/jiasen_rig.glb` 及 `GLB/jiamang_rig.glb`。保留原始面數和衣料設定，肩、手肘、手腕依布偶骨架重新定位，關鍵姿勢做稀疏校正。面具仍為既有模型組件，本次不新增掉落／拆卸規則。未追加 Tripo 點數。

| 正式素材 | 大小 | SHA-256 |
| --- | ---: | --- |
| `brave_guy_charactor08_jiasen_motion.glb` | 1,645,992 B | `30e09d13915f6f2beba87d1bc6f2553cf986e997c70d343dd3496f71158c8389` |
| `brave_guy_charactor17_jiamang_motion.glb` | 1,557,556 B | `8220e44e8e20d3149160d497f43f79b66b1e9546c9e4056f48f35f3a9caf35cf` |

- 兩個 GLB 在 `02_brave_guy/assets/runtime/stage-art/`；按波次／召喚／主管用到才載入。重製：`python tools/make_game02_jiasen_motion.py --rig-zip <骨架 ZIP> --output <目的資料夾>`，依照同資料夾前兩批共用 GLB 工具，需 NumPy/SciPy/Numba/Pillow。
- 驗證：桌面 H5 看過 1-3 的校園假森小怪群、3-7 的西裝小怪持鍋和主管實戰，並用 390×844 尺寸核對主管戰 HUD；未宣稱實體 iOS。以 `node tools/tests/game02-jiasen-motion.cjs` 驗證雙造型、主管三招與投射物清理，另跑校園雙 Boss、幹譙龍、佛賴弟的專項回歸。此環境沒有 Playwright 套件，未跑舊全流程。
- 發布入口 `02_brave_guy/play.html?v=20261126jiasen`。緊急回退：將 manifest 的 `jiasen`／`jiamang` 模型槽設回 null 會回到佔位造型；用 Git revert 可一起回退新鍋具外觀。
