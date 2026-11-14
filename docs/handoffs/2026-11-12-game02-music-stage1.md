# 勇氣超人 Brave Guy — 關卡戰鬥電音：地圖一全數 + 2-1（2026-11-12）

製作：音樂工作階段（Claude）。依**更新後的** [`02_xianxia_battle/assets/MUSIC.md`](../../02_xianxia_battle/assets/MUSIC.md)（v1.2）製作。

## 對齊主線（版本管理）

音樂分支 `claude/brave-guy-audio` 原本落後主線，已 `reset` 到最新主線 `fervent-ride`（含 14 關流程、暫停選單，且先前我交的 P0 `bgm_campus`／`bgm_boss`／`jingle_clear` 已被整合進主線）。舊的地圖分類鍵（`bgm_wild`／`bgm_office`／`bgm_office_mute`／`bgm_shadow_*`）在 v1.2 已不存在，改為每關 `bgm_stage_X_Y`。原 `bgm_wild` 音檔完全符合 2-1 黑森林（psytrance），直接歸位為 `bgm_stage_2_1`。

## 本次交付（每關不同電音，ㄎㄧㄤ又刺激）

| manifest 鍵 | 關卡 | 子類型 / BPM | 招牌梗 | 長度 | LUFS/dBTP |
|---|---|---|---|---|---|
| `bgm_stage_1_0` | 序章 宿舍 | Happy hardcore ~170 | 鬧鐘當主旋律；中段「按掉鬧鐘」全停拍後更大聲 | 62.1s | −16.1/−1.1 |
| `bgm_stage_1_2` | 籃球場（錢大姐） | 台式/Hard bounce ~146 | 籃球彈地當節奏、球鞋摩擦、收銀機 cha-ching | 65.8s | −16.2/−1.1 |
| `bgm_stage_1_3` | 教官室（藍教頭） | Hardstyle ~150 | 軍樂小鼓→硬派大鼓、哨子 lead、口令切碎 | 64.0s | −16.4/−1.8 |
| `bgm_stage_1_4` | 校門口（黑影一 惡夢） | Melodic dubstep ~140 | 主角主題鏡像；drop 是哭腔 wobble bass | 65.1s | −16.2/−1.1 |
| `bgm_stage_2_1` | 黑森林 | Psytrance ~146 | 滾動 offbeat bass、手鼓、迷幻（原 bgm_wild 歸位） | 65.8s | −16.1/−1.1 |

- 連同先前的 `bgm_stage_1_1`（=`bgm_campus`），**地圖一一般戰鬥（1-0～1-4）全數到位**。
- 每首：`.ogg`（q4，無縫循環）＋`.mp3`（128k 後備），44.1kHz 立體聲，−16 LUFS／真峰 ≤ −1 dBTP，每首把主角主題（或其鏡像）用該關音色藏入至少一次。
- 路徑 `02_xianxia_battle/assets/source/music/`；WAV 母帶 `_archive/02_xianxia_battle/music/`；規格總表 `assets/source/AUDIO_DELIVERY.json`（現 9 首）。
- 六個鍵已填入 `manifest.json`；**未改 `js/`**。

## 驗證

- loudnorm 兩段式 + 固定增益把真峰壓到 ≤ −1 dBTP（線性，不破壞循環接點）。
- 循環接點取樣跳變：1-0 0.0001、1-2 0.0041、1-3 0.0000、1-4 0.0000、2-1 0.0008（實質無縫）。
- 無頭瀏覽器啟動遊戲：載入 `bgm_stage_1_0.ogg`、**無 JS 錯誤**；loader 的 ogg→mp3 後備已在主線實作（iOS 相容問題解除）。
- 未實機手機／耳機主觀聽測；音色為程式合成的方向確認品質。

## 待辦（依 MUSIC.md 順序）

- 地圖二：`bgm_stage_2_2`（黑影二 地獄，Gabber 180–190）。
- 地圖三：`bgm_stage_3_0`（壞掉電梯）、`3_1` tech house、`3_2` complextro/electro swing、`3_3` techno、`3_4` bass house/riddim、`3_5` big room 尾牙。
- 終章：`bgm_stage_4_1`（黑影三 夢魘，ambient→uplifting trance）。
- 非戰鬥：`bgm_title`、`bgm_transform`（極認真、戛然而止，不用電音）、`bgm_defeat`、`bgm_talk`、`bgm_ending`、`bgm_credits`；選做 `bgm_brave_layer`。
- 音效（MUSIC.md §4）尚未製作。

## 發布狀態

- 分支 `claude/brave-guy-audio`（已對齊主線）。未開 PR。
