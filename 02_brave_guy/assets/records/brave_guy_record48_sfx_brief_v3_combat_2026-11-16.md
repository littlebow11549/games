# 勇氣超人 — 打擊無雙音效需求 v3（ComfyUI，2026-11-16）

這是一款**打擊無雙**遊戲，音效要「爽、脆、有肉」。這份只做**音效**（音樂已全部到位）。重點方向：
- **拳擊/命中**：像《格鬥天王 KOF 97/98》那種**紮實的打擊感**——低頻有肉、中頻有脆、尾巴乾淨、一拳一個「碰！」。
- **按鍵音**：**清脆、明亮**（像清脆的鈴/玻璃點擊），短、乾淨。
- **風聲（揮空）/攻擊特效音**：俐落的破風、能量感明確。

## ⛔ 硬性品質要求（務必做到）
1. **嚴禁破音/爆音**：峰值正規化到 **−1 dBFS**，且 **true peak ≤ −1.0 dBTP**（避免 inter-sample 削波）；輸出前確認**沒有任何削波取樣**。
2. **開頭 0ms 起音**（無前置靜音）；**結尾加 3–10ms 淡出**，避免尾端「喀」爆音。
3. 格式：`.wav`（16-bit/44.1kHz）或 `.mp3` 160kbps 皆可，**單聲道**。長度見下表（多數 0.1–0.5 秒）。
4. 同類音量一致；一波打二十幾下要**乾、短、不糊**。
5. 不要人聲、不要背景音樂、不要版權音色。

## 技術建議（給打擊音參考）
一個紮實的 KOF 命中＝**三層**疊起來，再整體正規化：
- **低頻 body**：下滑的正弦（約 170→45 Hz），40–60ms 指數衰減 → 重量。
- **中頻 crunch**：**棕噪（brown noise）**帶通約 1.5–2.4kHz 的極短爆點（20–30ms）→ 脆的肉感（棕噪比白噪不刺耳）。
- **高頻瞬態**：一點點 click → 清晰度。
> 關鍵：**乾、短、低頻有肉**；crunch 要克制，別變成「沙沙」噪音。暴擊再加一層 sub（55–60Hz）與更長衰減。

---

## 音效清單（檔名 → 引擎鍵 / 用途 / 英文提示詞）
三連號做成 `_1/_2/_3`。放 `assets/source/sfx/`（或沿用現有 `clean/` 子目錄）。

### 🥊 拳擊 / 命中（最重要）
| 檔名 | 用途 | 英文提示詞 |
|---|---|---|
| `sfx_punch_1/2/3` | 揮空(風聲, swing 輪替) | `fast sharp whoosh of a fighter's punch cutting air, crisp arcade swing, short, clean` |
| `sfx_hit_1/2/3` | 命中(hit 輪替) | `KOF 97/98 punch impact, thick punchy body thud with a short crunchy mid snap, meaty arcade fighter hit, dry, no reverb` |
| `sfx_hit_heavy` | 暴擊/重擊(crit) | `heavy arcade fighting game crushing blow, deep sub-bass body with a metallic crunch and short slam, powerful super hit, dry` |
| `sfx_kick_spin` | 迴旋踢 | `spinning kick whoosh into a heavy thud, arcade fighter, crisp` |
| `sfx_student_punch` | 大學生弱拳 | `weak feeble soft "pof" punch, clearly powerless, dull` |

### 💨 招式 / 攻擊特效
| 檔名 | 用途 | 英文提示詞 |
|---|---|---|
| `sfx_dash` | 勇氣衝拳突進 | `quick charged dash whoosh ending in a solid impact, energetic` |
| `sfx_ki_shot` | 氣功彈發射 | `energy gather and release, chi projectile "pew" with a humming whoosh, punchy` |
| `sfx_ki_blast` | 氣功彈爆炸 | `bright compact energy explosion, punchy magical blast, dry` |
| `sfx_quake` | 氣功震地(boom) | `heavy ground slam, deep sub-bass boom with a short low rumble, powerful` |
| `sfx_beam_start` | 超勇氣波起手 | `big energy beam charging and firing up, rising powerful hum` |
| `sfx_beam_loop` | 光束持續(**無縫循環**) | `thick continuous energy beam, steady powerful hum, seamless loop, no transient` |
| `sfx_beam_end` | 光束結束爆炸 | `large energy beam ending explosion, powerful discharge, dry` |

### ✨ 集氣 / 變身
| 檔名 | 用途 | 英文提示詞 |
|---|---|---|
| `sfx_courage_full` | 勇氣滿(可變身) | `bright ascending crystal chime, positive "ready" cue` |
| `sfx_qi_full` | 氣滿(可大招) | `shorter brighter sparkle chime, sharp ready cue` |
| `sfx_transform_charge` | 變身蓄力(最長3秒,可循環) | `rising cascade of glittering crystal/glass bell tones, gorgeous gemstone charge, shimmering, seamless loopable` |
| `sfx_transform_done` | 變身完成 | `brilliant crystalline burst, a jewel shattering into radiant light with a bright chime bloom, gorgeous` |
| `sfx_revert` | 變回大學生 | `deflating descending comedic power-down chime, dull` |

### 🔊 按鍵 / 介面（要清脆明亮，純音不要噪音）
| 檔名 | 用途 | 英文提示詞 |
|---|---|---|
| `sfx_ui_tap` | 一般按鍵(ui) | `crisp bright UI click, short clean glassy/bell tap, no noise` |
| `sfx_ui_confirm` | 確認/開始 | `bright positive two-note confirm chime, crisp` |
| `sfx_ui_back` | 返回 | `soft lower crisp back blip, clean` |
| `sfx_dialog_next` | **點對話下一句** | `very short crisp bright blip for advancing dialogue, light and clean (plays rapidly, must not fatigue)` |
| `sfx_stage_select` | 選關 | `bright cheerful select chime, crisp` |
| `sfx_lock_switch` | 鎖定切換 | `quick targeting lock-on blip, sci-fi, crisp` |
| `sfx_bubble` | 泡泡彈出 | `tiny cute pop with a little bell` |
| `sfx_notify` | 八卦蛇通知 | `original phone "ding" notification, not like any real app` |

### 👊 敵人 / 場景 / 連擊 / 職場
| 檔名 | 用途 | 英文提示詞 |
|---|---|---|
| `sfx_enemy_down_1/2/3` | 小怪倒下(輪替) | `short funny squashed squeal of a small enemy defeated, quiet, non-annoying` |
| `sfx_enemy_fly` | 被打飛 | `cartoon whoosh of a small enemy knocked flying` |
| `sfx_spawn` | 怪出現 | `cartoon pop of an enemy appearing, bubbly` |
| `sfx_guard` | 擋下面具 | `knock on hard plastic mask, dull tok block` |
| `sfx_mask_off` | 面具鬆脫 | `plastic mask popping loose, light snap` |
| `sfx_enemy_shot` | 丟東西(shoot) | `light quick throwing toss, airy flick` |
| `sfx_boss_warn` | 守關者預警 | `tense short rising warning before a boss heavy attack` |
| `sfx_boss_slam` | 守關者重砸 | `very heavy boss slam into the ground, massive impact (KOF-weight)` |
| `sfx_junxiong_pop` | 俊熊探頭 | `sudden startling pop-up with a detuned warble, jump-scare-lite` |
| `sfx_wave` | 新一波 | `short little horn fanfare` |
| `sfx_hurt` | 主角受傷 | `muffled cartoon body hit taken, short ouch thud` |
| `sfx_dodge` / `sfx_dodge_perfect` | 閃避/完美閃避 | `quick cloth dash swish / crisp bright "ting" parry with a short shimmer` |
| `sfx_guilt_tick/crack/burst` | 罪惡感 升/裂/爆 | `low sticky uneasy blip / fine glass cracking / glass shattering into a big cathartic explosion` |
| `sfx_combo_10/50/100` | 連擊里程碑 | `escalating celebratory combo chime, each more over-the-top` |
| `sfx_win` / `sfx_lose` | 勝/敗 | `short triumphant victory sting / short dejected defeat sting` |
| `sfx_applause_crowd` / `sfx_crowd_cheer` | 敷衍鼓掌 / 真心歡呼 | `sparse half-hearted applause / warm genuine crowd cheer` |
| `sfx_punch_clock` | 打卡機 | `time clock beep` |
| `sfx_pan_fly` / `sfx_pan_hit` | 甩鍋 飛/中 | `metal pan whoosh / bright clang hitting someone` |
| `sfx_chips` | 吃洋芋片 | `crunching potato chips` |
| `sfx_whistle` / `sfx_fan` / `sfx_pie` | 哨音 / 紙扇 / 大餅 | `sharp referee whistle / paper fan snap then bonk / hopeful rise then deflating let-down` |
| `sfx_revive` | 小天使救起 | `little bell jingle with an impatient feel` |

### 🎬 變身演出分鏡（寶石感）
`sfx_tf_glove/knee/jacket/hair/scarf` 五段著裝：`single crisp gemstone chime with a glassy sparkle tail`；`sfx_tf_stars/silhouette/pose`：`ethereal shimmering crystal pad with twinkling bell sparkles`。

### 👹 佛賴弟王過場
`sfx_folaidi_tick/flicker/rise/reveal`：`creeping ticking / flickering / rising dread / reveal stinger, horror-lite`。

---

## 交付
放進 `assets/source/sfx/`，檔名照表（三連號 `_1/_2/_3`）。回報每檔**長度、峰值 dBFS、true peak dBTP、是否循環**。接入由 Claude 處理（覆蓋現有鍵），你不用動 `js/`。**每一顆都要先自檢沒有破音再交。**
