# 勇氣超人 — 尚未收到的美術清單（2026-11-15，交 GPT）

依現況盤點：下列都還**沒有正式美術檔**（仍是程式佔位／SVG，或 manifest 為 null）。詳細規格見各段 `ASSETS.md` 編號；風格一律照 §0。**所有需要中文字的圖都出無字版，字由程式疊。**

優先序：**P0 最有感 = 3D 模型 + 場景；P1 = 面板/品牌/變身演出；P2 = 表情/教學/道具；選做 = 字藝/特效貼圖。**

---

## 🔴 P0

### 1. 3D 角色模型 — 全部未收到（最大缺口）
manifest `models` 七個鍵全為 null，遊戲所有角色現在都是程式拼的方塊佔位。
- 規格與清單見 [`MODELS_3D.md`](MODELS_3D.md)：**21 個角色 + 8 個道具 + 動作清單**。
- 接遊戲至少要的 7 個：`student`、`brave`、`angel`、`ganqiao`、`jiasen`、`folaidi`、`boss`（GLB，規格見 `assets/README.md`）。
- 角色造型照已定案的 `sheet/unified/` 設定合輯。

### 2. 場景 §7 — 全部未收到
目前只有 `sky_01.svg` 等佔位。每張地圖一張概念圖 1920×1080 + 貼圖 1024×1024（可無縫拼接）：
`scene_dorm` / `scene_corridor` / `scene_court` / `scene_office` / `scene_gate` / `scene_forest` / `scene_village` / `scene_desk` / `scene_lobby` / `scene_openoffice` / `scene_meeting` / `scene_callcenter` / `scene_bossroom` / `scene_core`，以及共用 `bg_loading` / `bg_result` / `bg_title`（現為 SVG 佔位）。

---

## 🟠 P1

### 3. 音效 SFX §12 — 全部未收到
manifest `sfx` 十一個鍵全 null：`swing` `hit` `crit` `boom` `hurt` `skill` `dodge` `shoot` `ui` `win` `lose`。（音樂 BGM 已全到位。）

### 4. UI 面板 — 仍是 SVG 佔位，需正式 PNG
下列 `ui/*.svg` 都是程式佔位，要換成正式去背 PNG（九宮格的請標安全邊）：
- `panel_popup`（暫停／結算／開場框）、`panel_title_plate`（標題牌）、`btn_text`（文字按鈕三態）→ **細規格已展開在 ASSETS.md §4.5**
- `panel_dialog`（劇情對話框，左右放頭像位）、`panel_quest`（任務面板）
- `boss_bar`（守關者血條）、`enemy_bar`（小怪血條）、`combo_plate`（連擊底板）
- `minimap_frame` + `minimap_bg`（小地圖外框/底圖）、`btn_skill_frame`（技能框）
- `hud_bar_frame` / `hud_bar_hp` / `hud_bar_mp`、`hud_portrait_frame`、`joystick_base` / `joystick_knob`、`tab_01`
> 註：部分已交付的 PNG 圖集（`panel_sheet` `hud_core_sheet` `aux_hud_sheet` 等）可能涵蓋其中幾項，GPT 製作前可與 Claude 對一下避免重做。

### 5. 品牌 §5 — 收尾
- `logo_01.png` 正式高解析（寬 ≥2400、去背）——目前只有 `logo_01_review_v1.png`（設計已核准）與 SVG
- `icon_01.png` 1024×1024 衍生、`banner_01` 整合檢查
- `branding/menu_keyart_01.png`（1800×1600）、`branding/menu_keyart_portrait_01.png`（1600×1200）——主選單漫畫格用，§5.1 有詳規

### 6. 第一次變身演出 §6 — 全部未收到（`transform/` 空）
`tf_bg_stars`、`tf_silhouette`、`tf_glove`/`tf_knee`/`tf_jacket`/`tf_hair`/`tf_scarf`、`tf_pose`、`tf_waiting_1`–`4`、`tf_sign`。

---

## 🟡 P2

### 7. 對話頭像表情 + 教學 §11 — 全部未收到（`character/` 空）
- `character/angel_face_*`（小天使 8 表情，各 512×512 去背）
- `character/hero_face_*`（主角三型態 ×5 表情 = 15 張）
- `howto/howto_01.png`（教學四格，1920×1080；現為 SVG）

### 8. 地圖三道具 §4.3 — 未收到
- `ui/resume.png`（履歷表，另出全塗黑版、空白版）
- `ui/counter_suanle.png`（「本月算了次數」計數器，另出冒煙壞掉版）

---

## ⚪ 選做（ASSETS 已標選做，可先不做）
- 字藝 §8 `titles/*`（現 SVG 佔位可用）
- 特效貼圖 §10 `fx/*`、數字 §9 `numbers/*`（現 SVG 可用）

---

### ✅ 已收到（不用再做）
角色設定合輯 16 張（`sheet/unified/`）、三視圖概念圖、已交付的 HUD/UI PNG 圖集（頭像、計量、戰鬥按鍵、功能圖示、泡泡、難度徽章、小地圖圖集、賓果卡、罪惡感爆炸序列）、品牌 icon/banner 初稿、**全部 BGM 音樂**。
