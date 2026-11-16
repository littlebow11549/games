# 勇氣超人 — 音效＋音樂製作需求 v2（ComfyUI，2026-11-16）

這份把**全部音效重新發一次**，並標出使用者要的新方向：
- **打擊感**：拳擊/命中要像 **《格鬥天王 KOF 97/98》** 那種街機格鬥的「厚、脆、爆」打擊聲。
- **變身音**：要**更華麗、像寶石般**的清脆結晶感。
- **音樂**：新增 **Boss 二段變身（加壓/狂暴）BGM**、各關 BGM 要**更多不重複**。

---

## 0. 技術規格（全部共用）
- 音效：`.mp3`，44.1kHz **單聲道**，96–128kbps，開頭 0ms 起音、無前置靜音；峰值約 −3dB。放 `assets/source/sfx/`。
- 音樂：`.mp3`（Claude 會轉 `.ogg`），44.1kHz 立體聲，可**無縫循環**，每首 60–100 秒，單首 ≤1.5MB。放 `assets/source/music/`。
- 風格：乾聲為主、漫畫/街機感；**不要人聲、不要版權音色**。
- 英文提示詞可在尾端統一加：`, dry punchy game sfx, mono, short, no music, no reverb tail`。

---

# 第一部分：音效 SFX（全部重做）

## 1. 🥊 打擊感 — KOF 97/98 街機格鬥風（重點！）
核心：**低頻有肉、中頻有脆、尾巴乾淨**，一拳一個「咚！」，連打不糊。參考《格鬥天王 97/98》的命中與重擊音。

| 檔名 | 用途 | 英文提示詞 |
|------|------|-----------|
| `sfx_punch_1/2/3` | 揮空(swing)，三輪替 | `sharp fast whoosh of a fighter's punch cutting air, arcade fighting game swing, crisp` |
| `sfx_hit_1/2/3` | 命中(hit)，三輪替 | `KOF 97/98 style punch impact, thick crunchy arcade fighter hit, deep body thud with a snappy mid crack, no reverb` |
| `sfx_hit_heavy` | 重擊/暴擊(crit) | `heavy arcade fighting game crushing blow, deep bassy impact with a metallic crunch layer and short slam, King of Fighters super hit` |
| `sfx_kick_spin` | 迴旋踢 | `spinning kick whoosh into a heavy arcade fighter impact, deep thud, crisp` |
| `sfx_dodge` | 閃避 | `quick cloth-and-step dash swish, short, snappy` |
| `sfx_dodge_perfect` | 完美閃避 | `crisp bright metallic "ting" with a tiny time-slow shimmer, satisfying parry cue` |
| `sfx_hurt` | 主角受傷 | `muffled cartoon body hit taken by the player, short ouch thud` |
| `sfx_student_punch` | 大學生弱拳 | `weak feeble "pof" punch, clearly powerless, soft` |

> 做法建議：命中音疊三層——① 低頻 body（kick-drum 感）② 中頻 crunch（木魚/拍手 transient）③ 高頻 snap。暴擊再加一層金屬尾。全部**乾、短、不要殘響**，確保一次打二十幾下不糊。

## 2. 💎 變身音 — 寶石般的華麗結晶感（重點！）
核心：**清脆、晶亮、上升、華麗**，像一顆顆寶石在發光、在接合。不要電子 whoosh，要水晶琴/鐘琴/玻璃琴那種。

| 檔名 | 用途 | 英文提示詞 |
|------|------|-----------|
| `sfx_transform_charge` | 變身蓄力(最長3秒，可中斷) | `rising cascade of glittering crystal and glass bell tones, gorgeous magical gemstone charge, shimmering bright, seamless loopable` |
| `sfx_transform_done` | 變身完成衝擊 | `brilliant crystalline burst, a jewel shattering into radiant light with a bright chime bloom and soft shockwave, gorgeous` |
| `sfx_tf_glove`/`tf_knee`/`tf_jacket`/`tf_hair`/`tf_scarf` | 五段著裝特寫(按800ms切鏡) | `single crisp gemstone chime with a glassy sparkle tail, magical-girl dress-up accent, bright and ornate` |
| `sfx_tf_stars`/`tf_silhouette`/`tf_pose` | 星空/剪影/定格 | `ethereal shimmering crystal pad swell with twinkling bell sparkles, dreamy gorgeous magical ambience` |
| `sfx_courage_full` | 勇氣集滿(可變身提示) | `bright ascending crystal glockenspiel arpeggio, positive "ready" sparkle cue` |
| `sfx_qi_full` | 氣集滿(可大招) | `shorter brighter diamond chime, sharp sparkle ready cue` |
| `sfx_revert` | 變回大學生 | `deflating descending sad chime, comedic power-down, dull` |

## 3. 招式
| 檔名 | 英文提示詞 |
|------|-----------|
| `sfx_dash`(勇氣衝拳) | `charge then high-speed dash burst ending in a heavy arcade impact` |
| `sfx_ki_shot`(氣功彈發射) | `energy gather and release of a chi projectile, humming whoosh launch` |
| `sfx_ki_blast`(氣功彈爆炸) | `bright medium energy explosion, punchy` |
| `sfx_quake`(震地,boom) | `fist slamming ground, deep sub-bass impact with cracking earth rumble` |
| `sfx_beam_start` | `big energy beam charging and firing, rising powerful hum` |
| `sfx_beam_loop` | `thick continuous energy beam, seamless loop, powerful hum` (循環) |
| `sfx_beam_end` | `energy beam ending in a large explosion, powerful discharge` |

## 4. 罪惡感 / 救援
| 檔名 | 英文提示詞 |
|------|-----------|
| `sfx_guilt_tick` | `low sticky uneasy short dark blip` |
| `sfx_guilt_crack` | `fine glass/ceramic starting to crack, delicate` |
| `sfx_guilt_burst` | `glass shattering into a big explosion, cathartic powerful smash` |
| `sfx_revive` | `little bell jingle with an impatient feel` |

## 5. 敵人 / 場景
| 檔名 | 英文提示詞 |
|------|-----------|
| `sfx_spawn` | `cartoon pop of an enemy appearing, bubbly` |
| `sfx_enemy_fly` | `cartoon whoosh of a small enemy knocked flying` |
| `sfx_enemy_down_1/2/3` | `short funny squashed squeal of a small enemy defeated, quiet` |
| `sfx_guard` | `knock on hard plastic mask, dull tok block` |
| `sfx_mask_off` | `plastic mask popping loose, light snap` |
| `sfx_enemy_shot` | `light quick throwing toss, airy flick` |
| `sfx_boss_warn` | `tense short rising warning before a boss heavy attack` |
| `sfx_boss_slam` | `very heavy boss slam into the ground, massive impact` (可帶 KOF 重擊感) |
| `sfx_junxiong_pop` | `sudden startling pop-up with a long detuned warble` |
| `sfx_wave` | `short little horn fanfare for a new wave` |
| `sfx_folaidi_tick/flicker/rise/reveal` | `creeping ticking / flickering / rising dread / reveal stinger, horror-lite` |

## 6. 介面 / 職場道具
| 檔名 | 英文提示詞 |
|------|-----------|
| `sfx_ui_tap`/`ui_confirm`/`ui_back` | `light short UI tap / positive confirm / lower back blip` |
| `sfx_lock_switch` | `quick targeting lock-on blip` |
| `sfx_bubble` | `tiny pop with a little bell, speech bubble` |
| `sfx_combo_10/50/100` | `escalating celebratory combo milestone chime, each more over-the-top` |
| `sfx_pan_fly`/`pan_hit` | `metal pan whoosh / bright clang hitting someone` |
| `sfx_notify` | `original phone ding, not like any real app` |
| `sfx_punch_clock` | `time clock beep` |
| `sfx_applause_crowd` | `sparse half-hearted applause, unenthusiastic` |
| `sfx_crowd_cheer` | `warm genuine crowd cheer` |
| `sfx_chips` | `crunching potato chips` |
| `sfx_whistle` | `sharp referee whistle` |
| `sfx_fan` | `paper folding fan snap open then a light bonk` |
| `sfx_pie` | `hopeful rising tone then a deflating let-down` |
| `sfx_win`/`sfx_lose` | `short victory sting / short defeat sting` |

---

# 第二部分：音樂 BGM

## 7. 🔥 Boss 二段變身／加壓曲（新增，重點！）
遊戲在守關者戰久戰 45 秒會觸發「PRESSURE 加壓：魔王加速」，另有最終變身等高潮——這些都要一首**更狂暴兇猛**的曲子接上去。

| 檔名 | 用途 | 方向 |
|------|------|------|
| `bgm_boss_rage` | Boss 二段/加壓/狂暴階段 | **比一般 Boss 曲更快更重**：吉他搖滾／金屬，BPM 150–175，雙大鼓(blast/四連踩)、下潛 riff、失真加厚、短促 build 隨即 drop；兇、壓迫、不留喘息。無縫循環。英文提示詞：`ferocious aggressive metal boss phase-2 battle theme, fast double-kick drums, heavy distorted downtuned guitar riffs, relentless brutal intensity, seamless loop` |

> 接法由 Claude 處理：加壓/最終變身時切到 `bgm_boss_rage`。

## 8. 各關 BGM 更多不重複（重點！）
**現況問題**：大多數守關者戰都切到**同一首** `bgm_boss`，所以聽起來重複。要讓**每個 Boss 戰有自己的曲**。另外 `bgm_stage_1_1` 目前跟校園曲共用、新關 `3-6` 還沒曲。

請補這些**各自不同**的曲（吉他搖滾/金屬為底，每首節奏與主題不同）：

| 檔名 | 關卡/用途 | 方向 |
|------|-----------|------|
| `bgm_stage_1_1` | 1-1 長廊(目前與校園共用) | 自己的曲，拖延/期限的焦躁感 |
| `bgm_stage_3_6` | **新關 3-6 財務部．社會版錢大姐** | 職場/金錢主題，收銀機/算盤節奏感的搖滾，帶一點油滑 |
| `bgm_boss_folaidiKing` | 1-1 Boss 佛賴弟王 | 慵懶卻壓迫的重riff |
| `bgm_boss_qian` | 1-2 Boss 錢大姐 | 江湖味、嗆辣 |
| `bgm_boss_qianBiz` | 3-6 Boss 錢經理 | 錢大姐主題的「西裝/油條」變奏 |
| `bgm_boss_lan` | 1-3 Boss 藍教頭 | 軍樂鼓點＋金屬 |
| `bgm_boss_midKing` | 2-1 特大悶幹譙 | 越打越快的加速感 |
| `bgm_boss_kabanKing` | 3-1 加班鬼王 | 打卡機/日光燈的壓抑工業金屬 |
| `bgm_boss_duo` | 3-2 新雞＋八卦蛇 | 八卦/訊息通知節奏的 electro-metal |
| `bgm_boss_lanMgr` | 3-3 藍經理 | 無限會議，一直 build 不 drop |
| `bgm_boss_ganqiaoFull` | 3-4 幹譙龍完全體 | 噴字封招的狂躁 |
| `bgm_boss_guan` | 3-5 冠老闆 | 浮誇、畫大餅的華麗 |

> 做不完可先交高優先：`bgm_boss_rage`、`bgm_stage_3_6`、`bgm_boss_qianBiz`，其餘 Boss 專屬曲再陸續補。檔名對了放進 `assets/source/music/`，Claude 會接線（哪關用哪首）。黑影戰(夢魘/地獄/惡夢)已有整關專屬曲，不在此列。

---

## 交付回來
放進對應資料夾、檔名照表；三連號做成 `_1/_2/_3`；需循環的(`sfx_beam_loop`、`sfx_transform_charge`、所有 BGM)要無縫循環。回報每檔長度與是否循環。接入由 Claude 改程式，你不用動 `js/`。
