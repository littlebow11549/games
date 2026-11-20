# 2026-11-18 套用 Seal Online 音效組（Claude）

## 需求
使用者上傳兩包音效：
1. `SealOnline_..._2026-11-18.zip`（41 檔，檔名清楚標示用途）→「請套用」。
2. `brave_guy_archive01_import_brave_guy_sound.zip`（s03~s13 等，檔名無語意；temp/ 內為 10~18s 長檔）→「這些也是備選。請你斟酌套用」。

## 做法
以**命名清楚的 Seal Online 組**為主，對應到遊戲既有的 SFX 鍵；`brave_guy_sound` 組因檔名無法辨識用途，暫作備選未套用（詳見文末）。

### 音訊處理（嚴禁破音）
每個檔案流程：
1. 來源若硬破音（histogram_0db 高：氣功爆B 1206、震地重砸 361、迴旋踢B 161、暴擊 158、命中C 82、怪物死亡A 79、防禦格擋 77）→ 先過 `adeclip` 修復削平的波峰。
2. 去頭部靜音（`silenceremove`，-50dB）讓觸發即出聲；反轉再去尾部靜音、再反轉。
3. 降頻統一 44100Hz、單聲道。
4. 量測峰值後**峰值正規化到 -1.5 dBFS**（保證輸出不破音、音量一致）。
5. 頭 5ms 淡入、尾 12ms 淡出，去除切割/正規化造成的爆點。

**QC 結果**：37 檔輸出全部峰值 = -1.5 dB、0 個 0dB 取樣（零破音）；總計 4.8MB。
Headless 載入解碼測試：41 個 seal 鍵（陣列展開 49 檔）全部解碼成功、0 fail、0 console error。

輸出位置：`assets/source/sfx/seal/sfx_<key>.wav`

### 對應表（Seal 檔 → 遊戲鍵）
| 遊戲鍵 | 來源 | 用途 |
|---|---|---|
| punch_1 / punch_2 / punch_3 | 揮空A / 揮空B / 迴旋踢B | 近戰揮擊三連（swing 陣列） |
| kick_spin | 迴旋踢A | 三連段的迴旋踢 |
| student_punch | 命中D拳擊 | 學生型態普攻 |
| hit_1 / hit_2 / hit_3 | 命中A / 命中B / 命中C斬擊 | 命中（hit 陣列） |
| hit_heavy / crit | 暴擊 | 暴擊／重擊 |
| enemy_down_1~5 | 怪物死亡A~E | 小怪死亡（enemy_down 陣列，擴充成 5 種） |
| beam_start / beam_end | 光束A / 光束C | 超勇氣波起手／收尾 |
| ki_shot / ki_blast | 氣功彈發射 / 氣功爆A | 氣功彈／氣功爆 |
| boom | 氣功爆B | 爆炸／震地 |
| boss_slam | 震地重砸 | 魔王砸地 |
| courage_full / qi_full | 集氣滿A取得 / 集氣滿B升級 | 勇氣槽滿／氣槽滿 |
| revive | 得到救援 | 小天使救援（接住＋回血） |
| combo_100 | 連擊華麗 | 100 連擊里程碑 |
| notify | 連擊獎勵 | 連擊獎勵提示 |
| ui_tap / ui / ui_confirm / ui_back | 按鍵A / 按鍵C / 開始 / 按鍵D | 介面點按 |
| lock_switch | 按鍵E | 切換鎖定 |
| stage_select | 選關 | 選關 |
| win / lose | 勝利過關 / 失敗 | 過關／失敗 |
| guard | 防禦格擋 | 格擋 |
| dash | 衝刺突進 | 閃避衝刺 |
| boss_warn | Boss預警 | 魔王出招預警 |
| **boss_appear**（新增鍵） | 守關者登場 | 魔王登場（`spawnBossActual` 新增播放） |

### 程式/設定變更
- `assets/manifest.json`：上述 37 鍵改指向 seal 檔；新增 `enemy_down_4/5`、`boss_appear` 鍵；`swing`/`hit`/`enemy_down` 陣列與 `crit` 改用 seal 路徑。
- `js/main.js`：`spawnBossActual` 加 `audio.sfx('boss_appear')`（魔王登場音）。
- 快取：`manifest.json?v` → `20261118seal`；全站 JS/CSS `?v` 由 `20261117rounds` → `20261118seal`。

### 保留未用（備選）
- Seal 組內：`治療_button3018`、`治療回血_Heal`（revive 已用「得到救援」）、`按鍵B_button3002`（4.4s 偏長）、`光束B_Stream1`（beam_loop 是無縫循環，不動以免爆點）。
- `brave_guy_archive01_import_brave_guy_sound.zip`：`s03~s13`、`temp/*`（長檔）—— 檔名無語意、無法以聽感辨識用途，暫未套用；若使用者標註各檔用途可再對應。

## 相關檔案
`assets/source/sfx/seal/*.wav`、`assets/manifest.json`、`js/main.js`、`play.html`、`js/*.js`、`css/*.css`（?v）
