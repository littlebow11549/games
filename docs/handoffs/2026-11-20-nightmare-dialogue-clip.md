# 惡夢超人一般對話框：清除矩形殘底

- 受傷台詞「你看，果然沒人在乎我。」取原圖集第五列，前版招式裁切只處理前四列，未涵蓋此對話框。
- 第五列的普通、喊話、支援三格沿現有黑邊清除外部網點與格線，只裁 `.character-speech::before` 的背景，不裁台詞。保留黑邊、尾巴、框內紋理及原始圖檔，其他角色不變。
- 調整 `assets/records/brave_guy_character-art.json` 的 `speechClipPointsByKind`，以 `tools/build_character_art.py` 產生 JS。12 個招式原遮罩、對白及文字彈不變。
- 自檢：`python tools/tests/game02-nightmare-speech-pixels.py`。已交付深／淺底對照預覽，非實機截圖。
