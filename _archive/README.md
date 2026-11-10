# 廢案封存（Archived / discarded assets）

此資料夾彙整**遊戲與遊戲中心目前未使用**的美術廢案，保留原始路徑結構以利追溯。
這些檔案不被任何程式碼引用，移出正式素材樹以保持整潔；需要時可從這裡取回。

## 內容
- `01_memory_crash/.../character/`：char_01、pug_head（半身）、pug_fullbody（靜態全身，已改用 pug_idle_full 待機動畫）
- `01_memory_crash/.../kv/`：kv_cover、kv_main、kv_pug（未接入的主視覺）
- `01_memory_crash/.../titles/`：早期單詞字藝與舊版 titles_fx（已改用 *_hero 與 *_v3）、titles_01/atlas、combo 系列
- `01_memory_crash/.../runtime/pic/batch3/`：上述對應的未使用 webp
- `assets/.../banner/`：banner_02、banner_03（遊戲中心已改回最初的 banner_01）

## 目前實際使用中的素材（未封存，仍在原位）
- 角色：`character/char_anim_*`（遊戲/結算表情）、`pug_idle_full`（首頁/選單待機動畫）
- 字藝：`*_hero`（START/OPTION/GAME OVER/HOW TO PLAY）、`titles_fx_*_v3`（遊戲橫幅五詞）、`titles_02`
- 遊戲中心橫幅：`banner_01`
- 其餘 ui/gems/numbers/music/sfx/howto/font/background/branding/video 等皆照原分類保留
