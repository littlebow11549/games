# 素材接入方式（勇氣超人）

遊戲啟動時讀 `assets/manifest.json`。欄位是 `null` 就用程式繪製的佔位版；填入路徑後自動改用正式素材，**不需要改程式**。
素材需求規格見同資料夾的 [`ASSETS.md`](ASSETS.md)。

## 3D 模型（GLB）

檔案放 `assets/runtime/model/`，在 manifest 的 `models` 填：

```json
"brave": {
  "url": "assets/runtime/model/brave.glb",
  "height": 1.75,
  "rotationY": 0,
  "clips": { "idle": "Idle", "run": "Run", "attack1": "PunchR", "attack2": "PunchL", "attack3": "SpinKick",
             "skill1": "DashPunch", "skill2": "KiShot", "skill3": "GroundPound", "ult": "Beam",
             "transform": "PowerUp", "dodge": "Roll", "hit": "Hit", "die": "Death" }
}
```

- `height`：遊戲內身高（公尺），程式會依模型實際高度自動縮放並把腳底對齊地面。
- `rotationY`：模型原本不是面向 +Z 時用來轉正（弧度）。
- `clips`：左邊是遊戲狀態名，右邊是 GLB 內的動畫片段名稱。
  - 主角狀態：`idle` `run` `attack1` `attack2` `attack3` `skill1` `skill2` `skill3` `ult` `transform` `dodge` `hit` `die`
  - 怪物狀態：`idle` `run` `attack` `stun` `hit` `die`
  - 缺的狀態會自動找替代（`attack2/3` → `attack1`、`skill*` → `attack3`、`dodge` → `run`、其餘 → `idle`）。
  - 攻擊類動作的播放速度會自動對齊判定時間，動畫長度不用剛好。
- 可用的模型鍵：`student`（大學生）、`brave`（勇氣超人）、`angel`（小天使）、`ganqiao`（幹譙龍初始型態）、`jiasen`（假森）、`folaidi`（佛賴弟）、`boss`（目前是佛賴弟王）。
- 檔案載入失敗時會在 console 警告並退回佔位角色，遊戲不會壞。

## 音訊

完整需求與清單見 [`MUSIC.md`](MUSIC.md)。目前程式會播的鍵只有 `bgm_battle`、`bgm_boss`、`bgm_victory`，填入路徑即可；其餘的鍵已預留。音效目前是程式合成（`js/audio.js`），尚未支援讀檔。

## 測試用

網址加 `?manifest=路徑` 可以改讀另一份 manifest，方便試新模型而不動正式設定。
