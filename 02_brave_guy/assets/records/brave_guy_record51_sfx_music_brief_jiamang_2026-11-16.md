# 勇氣超人 — 社會版假森（假忙森主管）專屬音樂需求（ComfyUI，2026-11-16）

新增的第 3-7 關「跨部門與甩鍋會議」守關者是 **假忙森主管 jiamangKing**（戴曲棍球面具的西裝熊，愛丟「鍋」甩責任、口頭禪「這不是我的業務範圍」「我有 cc 你」）。目前這關用通用曲暫代，請補兩首專屬曲。

## 技術規格
- `.mp3`，44.1kHz 立體聲，128kbps，**可無縫循環**，60–100 秒，≤1.5MB，−13-ish LUFS（與現有批次一致）。
- 放 `assets/source/music/`，檔名照下表；Claude 會轉 `.ogg` 並接線。

| 檔名 | 用途 | 方向與提示詞 |
|------|------|------------|
| `bgm_stage_3_7` | 3-7 關卡戰鬥曲（開放辦公室/跨部門） | 職場忙亂又推諉的吉他搖滾，約 138–148 BPM，節奏裡藏鍵盤敲擊、訊息通知「叮」、金屬鍋「鏘」當打點；忙碌、油滑、略帶黑色幽默。`frantic office rock battle theme, busy guitar groove with keyboard-clack and metal clang percussion hits, blame-shifting sarcastic energy, seamless loop` |
| `bgm_boss_jiamangKing` | 假忙森主管 守關者曲 | 比關卡曲更兇、更面具恐怖片感：重 riff ＋低沉不安的面具主題，混進「鍋」的金屬撞擊與打卡機節拍；壓迫但帶卡通滑稽。`menacing masked office boss metal theme, heavy downtuned riff with an eerie slasher-mask motif, metal-pot clangs and time-clock beats in the groove, oppressive yet cartoonish, seamless loop` |

> 做好放進 `assets/source/music/`，上傳給 Claude 即可接線（`bgm_stage_3_7` 接 3-7 關卡、`bgm_boss_jiamangKing` 接假忙森主管登場；45 秒加壓仍會切 `bgm_boss_rage`）。

（打擊/變身等音效 v2 已全數到位，這份只補假森的兩首曲。）
