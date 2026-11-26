# 勇氣超人｜校園雙 Boss 的 3D 動作

- `qian_school`: `02_brave_guy/assets/runtime/stage-art/brave_guy_charactor09_qian_school_motion.glb`，2,469,912 bytes，SHA-256 `35731ba7ba7cd6bbeb40436e621f0888da5246eb715001657795defd8953091f`。
- `lan_school`: `02_brave_guy/assets/runtime/stage-art/brave_guy_charactor10_lan_school_motion.glb`，2,407,364 bytes，SHA-256 `332492a1dccd4684e04a3dd95db6531596afac21cfd4e8c7ed62d9914b0dc44e`。

- 錢大姐：扇子固定在右手骨，扇擊、衝撞、召喚各有動作。原 0.6 秒扇擊命中與特效未改。
- 藍教頭：右手抬哨；吹哨、散射、砸地各有動作。哨音觸發、1 秒預警及罰站判定未改。
- 原始來源：Tripo 資產和骨架交付包；保留原始網格、貼圖與獨立校園角色。兩套各 9 段動作，含稀疏形變校正。未追加 Tripo 點數。
- 場景載入：1-2 與 1-3 才分別讀相應模型；下載失敗保留原模型。錢經理與藍經理不改。
- 實測：本機 H5 進入 1-2、1-3 Boss 戰，核對校園造型、扇子、警示圈與 Boss 血條；動作分格核對揮扇、手到嘴邊的吹哨姿勢。單測核對技能指派與命中時間、傷害及手機資產大小；未在實體手機重新跑全關。
- 使用 `node tools/tests/game02-campus-boss-motion.cjs`；即刻回退可移除 manifest 的兩個校園槽，原戰鬥規則、舊模型仍在。
