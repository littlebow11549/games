# 勇氣超人：音樂與音效製作需求（2026-11-11，Claude）

## 使用者要求
- 把音樂需求上傳，使用者會請另一個工作階段製作。
- （前一則）先做好什麼就合併上去；在遊戲總入口設定第二款遊戲入口。

## 完成內容
- 新增 [`02_xianxia_battle/assets/MUSIC.md`](../../02_xianxia_battle/assets/MUSIC.md) v1.0，可單獨閱讀：
  交付規格（MP3＋OGG、響度、循環、檔案大小、母帶放 `_archive/`）、接進遊戲的方式、15 首 BGM（分 P0–P2，含用途、長度、是否循環、感覺）、主題動機的要求（主角主題與黑影的鏡像主題）、音效清單（檔名約 54 個，分主角／招式與變身／敵人與場景／介面與職場篇）、配音規格、交付時要做的事。
- `assets/manifest.json`：模型鍵改成現行角色（student、brave、angel、ganqiao、jiasen、folaidi、boss）；音訊鍵預留 15 個。
- `assets/README.md`：模型接入說明改成現行的角色鍵與動作狀態名。
- `assets/ASSETS.md` §12 指向 `MUSIC.md`。

## 給製作音樂的工作階段
- **現在程式會播的只有 `bgm_battle`、`bgm_boss`、`bgm_victory` 三個鍵**，把路徑填進 `assets/manifest.json` 就會響。其餘的鍵已預留但程式還沒呼叫。
- 音效目前是程式合成（`js/audio.js`），還不支援讀檔；音效檔交付後由 Claude 改程式接入。
- 風格方向（2000 年代日系動作遊戲感、校園放克加鼓號樂隊等）是 Claude 的提案，使用者尚未確認。

## 合併與上線狀態
- 前一批（設計底 D1、企劃、腳本、角色設定集、美術需求、首頁入口）已於 2026-11-11 經 [littlebow11549/games#4](https://github.com/littlebow11549/games/pull/4) 併入預設分支 `claude/fervent-ride-4h0vjm`，並已上線：
  https://littlebow11549.github.io/games/ （首頁有第二款的卡片）、https://littlebow11549.github.io/games/02_xianxia_battle/ 。
  Claude 以無頭瀏覽器從正式網站首頁點卡片進入、開始遊戲、第一波怪出現，無載入錯誤。
- 先前幾份交接報告末尾寫的「未開 PR、未合併、未部署」是當時的狀態，以本節為準。
- 本批（音樂需求）另開 PR 合併，見 PR 紀錄。

## 尚待完成
- 音樂與音效本身（另一個工作階段）。
- 使用者決定：主題曲要不要有歌詞、配音範圍、曲風參考。
- Claude：音效讀檔功能；其餘 BGM 鍵隨關卡接上。

## 更新 v1.1（同日）
- 使用者指定：**每一關都要有不同的戰鬥電音 BGM，要很ㄎㄧㄤ又很刺激。**
- `MUSIC.md` 第 0、3 節改寫：戰鬥曲全部改為電子舞曲，14 關各一首、各用不同子類型（Happy hardcore、Drum & bass、台式電音、Hardstyle、Melodic dubstep、Psytrance、Gabber、Tech house、Techno、Bass house、Big room、Trance 等），並寫明每關的惡搞取樣點子；另有守關曲 1 首與非戰鬥曲 7 首，共 22 首。原 v1.0 的「放克加鼓號樂隊／原聲樂器」方向作廢。
- 各關的子類型與取樣是 Claude 的提案。第一次變身的演出曲維持管弦，理由寫在文件內。
- `assets/manifest.json` 的音訊鍵改為每關一個（`bgm_stage_1_0` … `bgm_stage_4_1`）。程式目前仍只播 `bgm_battle`、`bgm_boss`、`bgm_victory`。
