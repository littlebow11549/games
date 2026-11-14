# 勇氣超人 Brave Guy — 變身曲 + 其餘關卡戰鬥曲（2026-11-14）

製作：音樂工作階段（Claude）。依 [`02_xianxia_battle/assets/MUSIC.md`](../../02_xianxia_battle/assets/MUSIC.md) v1.3。
分支：`claude/brave-guy-music`（已併入最新主線再製作）。

## 本次交付（7 首，取代暫代曲）

| manifest 鍵 | 關卡 / 用途 | 子類型 / BPM | 長度 | LUFS/dBTP |
|---|---|---|---|---|
| `bgm_brave` ⭐ | 變身勇氣超人期間（取代關卡曲） | 英雄爆發 EDM ~176，開頭即高潮、無前奏、結尾轉調 | 32.7s | −16.0/−1.3 |
| `bgm_stage_2_2` | 2-2 夜晚村落 地獄超人（黑影二） | Gabber/Hardcore ~185，破音大鼓、鏡像主題暴怒版 | 62.3s | −16.0/−4.2 |
| `bgm_stage_3_2` | 3-2 開放辦公室 | Complextro/Electro swing ~128，鍵盤喀/通知叮/鍋鏘 | 63.8s | −16.2/−1.1 |
| `bgm_stage_3_3` | 3-3 會議室 藍經理無限會議 | Techno ~130，一直 build 永不 drop | 62.8s | −16.0/−1.3 |
| `bgm_stage_3_4` | 3-4 客服部 幹譙龍完全體 | Bass house/Riddim ~150，電話鈴和弦、growl 低音 | 64.0s | −16.1/−1.1 |
| `bgm_stage_3_5` | 3-5 頂樓 冠老闆 | Big room/尾牙 EDM ~130，空氣號角、浮誇進場 | 62.8s | −16.3/−1.1 |
| `bgm_stage_4_1` | 4-1 終章 夢魘超人（黑影三） | 前半 ambient→後半 uplifting trance ~138，主題蓋過鏡像 | 97.4s | −16.6/−1.1 |

- 每首：`.ogg`（q4，無縫循環；`bgm_brave` 開頭第一拍即高潮）＋`.mp3`（128k 後備），44.1kHz，−16 LUFS／真峰 ≤ −1 dBTP。
- 母帶 WAV 於 `_archive/02_xianxia_battle/music/`；規格總表 `assets/source/AUDIO_DELIVERY.json`（19 項）。
- manifest 這 7 鍵已從暫代/`null` 換成專屬曲；**未改 `js/`**。

## 目前整體進度

- **所有關卡戰鬥曲皆有專屬曲**：1-0~1-4、2-1、2-2、3-0、3-2、3-3、3-4、3-5、4-1，加 `bgm_boss`、`bgm_victory`、變身曲 `bgm_brave`。
- **尚缺（非戰鬥）**：`bgm_title`、`bgm_transform`（極認真、戛然而止，不用電音）、`bgm_defeat`、`bgm_talk`、`bgm_ending`、`bgm_credits`。
- **仍為暫代**：`bgm_stage_3_1`（1 樓大廳，目前仍借用 `bgm_office`；v1.3 未列入必換，但風格應為 tech house 126，建議之後補專屬）。
- 音效（MUSIC.md §4）尚未製作。

## 驗證

- loudnorm 兩段式 + 固定增益把真峰壓到 ≤ −1 dBTP（線性，不破壞循環接點）。
- 循環接點取樣跳變：全部 ≤ 0.0002（實質無縫）；`bgm_brave` 0.0000。
- 無頭瀏覽器啟動遊戲：載入關卡曲 `bgm_stage_1_0.ogg`、**無 JS 錯誤**；變身曲由 `js/main.js` 於變身時呼叫 `bgm_brave`（程式已在主線接好）。
- 未實機手機／耳機主觀聽測；音色為程式合成的方向確認品質。

## 發布狀態

- 分支 `claude/brave-guy-music`。未開 PR。
