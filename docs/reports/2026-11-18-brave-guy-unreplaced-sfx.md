# 勇氣超人：尚未經近期替換的音效（不含BGM）

依目前 manifest、audio-catalog 與逐檔 git 歷史核對。以下26槽位、24個獨立檔案仍使用 ComfyUI v3（f5c09b4）版本，之後尚未替換。不是「從來沒改過」。槽位不代表每項都會於目前流程觸發。

| 編號 | 事件 | 遊戲用途 | 檔案 |
|---|---|---|---|
| S14 | `hurt` | 主角受傷 | `assets/source/sfx/sfx_hurt.mp3` |
| S19 | `quake` | 氣功震地 | `assets/source/sfx/sfx_quake.mp3` |
| S27 | `wave` | 新敵人波次 | `assets/source/sfx/sfx_wave.mp3` |
| S28 | `combo_10` | 10連擊提示 | `assets/source/sfx/sfx_combo_10.mp3` |
| S29 | `combo_50` | 50連擊提示 | `assets/source/sfx/sfx_combo_50.mp3` |
| S33 | `transform_charge` | 變身蓄力 | `assets/source/sfx/sfx_transform_charge.mp3` |
| S34 | `transform_done` | 變身完成 | `assets/source/sfx/sfx_transform_done.mp3` |
| S35 | `revert` | 解除變身 | `assets/source/sfx/sfx_revert.mp3` |
| S39 | `spawn` | 敵人登場 | `assets/source/sfx/sfx_spawn.mp3` |
| S40 | `enemy_fly` | 敵人被打飛 | `assets/source/sfx/sfx_enemy_fly.mp3` |
| S42 | `mask_off` | 面具脫落 | `assets/source/sfx/sfx_mask_off.mp3` |
| S43 | `enemy_shot` | 敵人射擊 | `assets/source/sfx/sfx_enemy_shot.mp3` |
| S57 | `pan_hit` | 甩鍋命中 | `assets/source/sfx/sfx_pan_hit.mp3` |
| S60 | `whistle` | 哨聲 | `assets/source/sfx/sfx_whistle.mp3` |
| S61 | `fan` | 扇動 | `assets/source/sfx/sfx_fan.mp3` |
| S62 | `pie` | 畫大餅 | `assets/source/sfx/sfx_pie.mp3` |
| S64 | `folaidi_flicker` | 佛賴弟出場閃爍 | `assets/source/sfx/sfx_folaidi_flicker.mp3` |
| S65 | `folaidi_rise` | 佛賴弟出場升起 | `assets/source/sfx/sfx_folaidi_rise.mp3` |
| S72 | `skill` | 技能提示（共用變身完成音） | `assets/source/sfx/sfx_transform_done.mp3` |
| S73 | `shoot` | 射擊（共用敵人射擊音） | `assets/source/sfx/sfx_enemy_shot.mp3` |
| S75 | `tf_stars` | 變身分鏡星光 | `assets/source/sfx/sfx_tf_stars.mp3` |
| S77 | `tf_glove` | 變身分鏡手套 | `assets/source/sfx/sfx_tf_glove.mp3` |
| S78 | `tf_knee` | 變身分鏡護膝 | `assets/source/sfx/sfx_tf_knee.mp3` |
| S79 | `tf_jacket` | 變身分鏡外套 | `assets/source/sfx/sfx_tf_jacket.mp3` |
| S81 | `tf_scarf` | 變身分鏡圍巾 | `assets/source/sfx/sfx_tf_scarf.mp3` |
| S82 | `tf_pose` | 變身分鏡定格 | `assets/source/sfx/sfx_tf_pose.mp3` |

## 已調整，不計入待替換

- seal/、brave/：近期替換素材。
- clean/：之前已清理／重新製作的音效，不應列成從未調整。
- beam_hit：631eccf 已改善光束命中音。
- dialog_next：已替換獨立對話音。
- victory_human_cheer、boss_ko：使用者提供真人歡呼／KO。
- applause、crowd_cheer：清單標示舊音停用，不列為目前待替換。

完整試聽：https://littlebow11549.github.io/games/02_brave_guy/audio-review.html
可用S編號對照；本文件只列音效。原始清單及路徑以 assets/manifest.json、assets/audio-catalog.json 為準。
