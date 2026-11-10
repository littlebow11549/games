# 素材接入方式（02 仙俠戰鬥原型）

遊戲啟動時讀 `assets/manifest.json`。欄位是 `null` 就用程式繪製的佔位版；填入路徑後自動改用正式素材，**不需要改程式**。
素材需求規格見同資料夾的 [`ASSETS.md`](ASSETS.md)。

## 3D 模型（GLB）

檔案放 `assets/runtime/model/`，在 manifest 的 `models` 填：

```json
"hero": {
  "url": "assets/runtime/model/hero.glb",
  "height": 1.5,
  "rotationY": 0,
  "clips": { "idle": "Idle", "run": "Run", "attack1": "Slash1", "attack2": "Slash2", "attack3": "Slash3",
             "skill1": "Spin", "skill2": "Cast", "skill3": "Jump", "dodge": "Roll", "hit": "Hit", "die": "Death" },
  "weapon": { "kind": "sword", "bone": "mixamorigRightHand", "scale": 1, "position": [0, 0, 0], "rotation": [0, 0, 0] }
}
```

- `height`：遊戲內身高（公尺），程式會依模型實際高度自動縮放並把腳底對齊地面。
- `rotationY`：模型原本不是面向 +Z 時用來轉正（弧度）。
- `clips`：左邊是遊戲狀態名，右邊是 GLB 內的動畫片段名稱。
  - 主角狀態：`idle` `run` `attack1` `attack2` `attack3` `skill1` `skill2` `skill3` `dodge` `hit` `die`
  - 怪物狀態：`idle` `run` `attack` `hit` `die`
  - 缺的狀態會自動找替代（`attack2/3` → `attack1`、`skill*` → `attack3`、`dodge` → `run`、其餘 → `idle`）。
  - 攻擊類動作的播放速度會自動對齊判定時間，動畫長度不用剛好。
- `weapon`（選填）：另有武器模型時，掛到指定名稱的手部骨骼。
- 可用的模型鍵：`hero` `sword` `mob_spear` `mob_imp` `mob_plant` `boss`。
- 檔案載入失敗時會在 console 警告並退回佔位角色，遊戲不會壞。

## 音訊

`audio` 欄位填 `bgm_battle`、`bgm_boss`、`bgm_victory` 的檔案路徑（MP3／OGG）。音效目前是程式合成（`js/audio.js`）。

## 測試用

網址加 `?manifest=路徑` 可以改讀另一份 manifest，方便試新模型而不動正式設定。
