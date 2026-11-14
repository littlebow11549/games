# 勇氣超人 Brave Guy — 非戰鬥曲 + 3-1，音樂全數完成（2026-11-14）

製作：音樂工作階段（Claude）。依 [`02_xianxia_battle/assets/MUSIC.md`](../../02_xianxia_battle/assets/MUSIC.md) v1.3。
分支：`claude/brave-guy-music`（已併最新主線）。

## 本次交付（7 首）

| manifest 鍵 | 用途 | 風格 / 長度 | 循環 | LUFS/dBTP |
|---|---|---|---|---|
| `bgm_title` | 開始畫面 | 主角主題輕鬆版 ~120 BPM / 60s | ✅ | −16.6/−1.1 |
| `bgm_transform` | 第一次變身完整演出（全遊戲一次） | 極認真管弦+合唱 ~132，推到頂後**戛然而止**（硬切、無電音）/ 15s | ❌ | −17.9/−1.1 |
| `bgm_defeat` | 倒下 | 洩氣下行 brass + 唱盤煞停 / ~3s | ❌ | −16.0/−4.4 |
| `bgm_talk` | 劇情對話/鬥嘴 | 輕空 marimba+鈴鐺動機，留白給台詞 ~112 / 60s | ✅ | −16.6/−1.1 |
| `bgm_ending` | 終章和解與醒來 | 鋼琴+弦樂 ~80，主題與鏡像首次合一，停在早晨 / 72s | ❌ | −16.0/−2.6 |
| `bgm_credits` | 製作名單 | 主題完整電音版 ~150，串接各關招牌取樣 / 77s | ❌ | −16.0/−1.2 |
| `bgm_stage_3_1` | 3-1 一樓大廳打卡機 | Tech house ~126，打卡機嗶當節拍器，找回變身才第一次 drop / 65s | ✅ | −16.1/−1.1 |

- 每首：`.ogg`（q4）＋`.mp3`（128k），44.1kHz，−16 LUFS／真峰 ≤ −1 dBTP。
- `bgm_transform` 依需求**刻意不用電音**、結尾硬切無尾音。
- `bgm_stage_3_1` 補上專屬曲，取代原本借用的 `bgm_office`。
- 母帶 `_archive/02_xianxia_battle/music/`；規格總表 `assets/source/AUDIO_DELIVERY.json`（26 項）。

## 🎉 音樂全數完成

`manifest.json` 的 `audio` 區塊**已無任何 `null`**——所有 BGM 鍵都指向專屬曲：
14 關卡曲（1-0～4-1）、守關 `bgm_boss`、過關 `bgm_victory`、變身 `bgm_brave`、
以及 `bgm_title`／`bgm_transform`／`bgm_defeat`／`bgm_talk`／`bgm_ending`／`bgm_credits`。

## 驗證

- loudnorm 兩段式 + 固定增益（真峰 ≤ −1 dBTP，線性不破壞循環接點）。
- 循環曲接點取樣跳變 ≤ 0.0005（無縫）；非循環曲按需求結尾（變身曲硬切）。
- 無頭瀏覽器啟動遊戲：載入關卡曲、**無 JS 錯誤**。
- 未實機手機／耳機主觀聽測；音色為程式合成的方向確認品質。

## 尚未處理（非本階段音樂範圍）

- **音效 SFX**（`MUSIC.md` §4 一大串）尚未製作；交付後由 Claude 接入 `js/audio.js`。
- **配音 VO**（§5）未做。
- 所有 BGM 目前為程式合成 demo 品質；若要更高音質可用外部音樂模型重製後覆蓋同名檔。

## 發布狀態

- 分支 `claude/brave-guy-music`。未開 PR。
