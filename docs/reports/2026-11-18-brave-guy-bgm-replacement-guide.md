# 勇氣超人：BGM 替換對照與選曲說明（給 Claude）

核對日期：2026-11-18（台北）。基準提交：283fd46。

## 範圍與狀態

- 本文件是上一輪「還沒被替換的 BGM」清單：38 首背景音樂，不是短打擊音效。
- 「未替換」指最近 Seal／brave_guy_sound 音效替換這一輪沒有換入新的 BGM；不代表這些曲子從未在歷史版本更新過。
- B30 是使用者已確認喜歡的曲子，應保留；只調整過出場引用，沒有換成新音檔。
- 下方「情緒／選曲方向」依遊戲場景與角色功能撰寫，是尋找替代曲的建議，不是逐首人工試聽所得，也不是已確認的樂器／BPM描述。現有音檔的實際聽感請開試聽連結確認。
- 使用者近期說「強烈清脆打擊感」是針對SFX；不要直接套成所有BGM的風格要求。舊音樂方向可參考 `02_brave_guy/assets/MUSIC.md` 的吉他搖滾／金屬需求，仍以使用者的新音檔與指示為準。

## 最重要的播放對應

- B30 `bgm_stage_3_5`：頂樓老闆辦公室＋冠老闆登場對話／動畫。
- B13 `bgm_boss_guan`：冠老闆未變身戰鬥／勝利過場，不是指定出場曲。
- B38 `bgm_brave`：已變身且回到可操作戰場時覆蓋場面曲。
- 一般Boss過場保留自己的配樂；不要讓B38在過場蓋掉原曲。
- 部分BGM是備援槽位，是否播到取決於場景、形態與資產存在；不要把38首理解成每場都會播。

## 試聽與替換入口

[逐項試聽頁](https://littlebow11549.github.io/games/02_brave_guy/audio-review.html)。B編號與 `assets/audio-catalog.json` 一致。下方各項附直接音檔連結。

所有相對路徑以專案根目錄為基準。本地根目錄為 `/workspace/games`。

## B01｜一般戰鬥備用配樂

- 情緒／選曲方向：持續推進、有節奏感但不搶戲；用於沒有專屬曲時的普通戰鬥。
- 播放事件：`bgm_battle`。
- 目前檔案：`02_brave_guy/assets/source/music/bgm_battle.ogg`。
- 目前長度：23.0 秒（ffprobe實測）。
- [試聽現有音檔](https://littlebow11549.github.io/games/02_brave_guy/assets/source/music/bgm_battle.ogg)。
- 替換狀態：本輪尚未換入新音樂；收到使用者指定後替換。

## B02｜一般Boss戰與出場備用配樂

- 情緒／選曲方向：比普通戰鬥更緊張、有威脅感；不同Boss共用時避免太強烈的個人特色。
- 播放事件：`bgm_boss`。
- 目前檔案：`02_brave_guy/assets/source/music/bgm_boss.ogg`。
- 目前長度：25.3 秒（ffprobe實測）。
- [試聽現有音檔](https://littlebow11549.github.io/games/02_brave_guy/assets/source/music/bgm_boss.ogg)。
- 替換狀態：本輪尚未換入新音樂；收到使用者指定後替換。

## B03｜Boss久戰加壓配樂

- 情緒／選曲方向：久戰後壓力升高，節奏更急、重拍更強；和一般Boss曲形成升級感。
- 播放事件：`bgm_boss_rage`。
- 目前檔案：`02_brave_guy/assets/source/music/bgm_boss_rage.ogg`。
- 目前長度：69.1 秒（ffprobe實測）。
- [試聽現有音檔](https://littlebow11549.github.io/games/02_brave_guy/assets/source/music/bgm_boss_rage.ogg)。
- 替換狀態：本輪尚未換入新音樂；收到使用者指定後替換。

## B04｜佛賴弟王：Boss戰／過場配樂

- 情緒／選曲方向：拖延、期限逼近的怪誕壓力；可用滴答般節奏與突然加重的段落。
- 播放事件：`bgm_boss_folaidiKing`。
- 目前檔案：`02_brave_guy/assets/source/music/bgm_boss_folaidiKing.ogg`。
- 目前長度：74.3 秒（ffprobe實測）。
- [試聽現有音檔](https://littlebow11549.github.io/games/02_brave_guy/assets/source/music/bgm_boss_folaidiKing.ogg)。
- 替換狀態：本輪尚未換入新音樂；收到使用者指定後替換。

## B05｜錢大姐：Boss戰／過場配樂

- 情緒／選曲方向：強勢、逼迫與金錢壓力；節奏乾脆，帶咄咄逼人的感覺。
- 播放事件：`bgm_boss_qian`。
- 目前檔案：`02_brave_guy/assets/source/music/bgm_boss_qian.ogg`。
- 目前長度：75.8 秒（ffprobe實測）。
- [試聽現有音檔](https://littlebow11549.github.io/games/02_brave_guy/assets/source/music/bgm_boss_qian.ogg)。
- 替換狀態：本輪尚未換入新音樂；收到使用者指定後替換。

## B06｜錢經理：Boss戰／過場配樂

- 情緒／選曲方向：職場算計與帳目追討；精準、緊繃，比校園角色更冷硬。
- 播放事件：`bgm_boss_qianBiz`。
- 目前檔案：`02_brave_guy/assets/source/music/bgm_boss_qianBiz.ogg`。
- 目前長度：80.2 秒（ffprobe實測）。
- [試聽現有音檔](https://littlebow11549.github.io/games/02_brave_guy/assets/source/music/bgm_boss_qianBiz.ogg)。
- 替換狀態：本輪尚未換入新音樂；收到使用者指定後替換。

## B07｜藍教頭：Boss戰／過場配樂

- 情緒／選曲方向：軍令式威壓與正面對抗；鼓點整齊、有命令感。
- 播放事件：`bgm_boss_lan`。
- 目前檔案：`02_brave_guy/assets/source/music/bgm_boss_lan.ogg`。
- 目前長度：75.8 秒（ffprobe實測）。
- [試聽現有音檔](https://littlebow11549.github.io/games/02_brave_guy/assets/source/music/bgm_boss_lan.ogg)。
- 替換狀態：本輪尚未換入新音樂；收到使用者指定後替換。

## B08｜特大隻的悶幹譙：Boss戰／過場配樂

- 情緒／選曲方向：長期壓抑後爆發；厚重低頻與逐步增強的力量。
- 播放事件：`bgm_boss_midKing`。
- 目前檔案：`02_brave_guy/assets/source/music/bgm_boss_midKing.ogg`。
- 目前長度：71.3 秒（ffprobe實測）。
- [試聽現有音檔](https://littlebow11549.github.io/games/02_brave_guy/assets/source/music/bgm_boss_midKing.ogg)。
- 替換狀態：本輪尚未換入新音樂；收到使用者指定後替換。

## B09｜加班鬼王：Boss戰／過場配樂

- 情緒／選曲方向：加班困局、疲憊與逃不出去；重複動機可帶壓力，但避免整曲單調循環。
- 播放事件：`bgm_boss_kabanKing`。
- 目前檔案：`02_brave_guy/assets/source/music/bgm_boss_kabanKing.ogg`。
- 目前長度：82.5 秒（ffprobe實測）。
- [試聽現有音檔](https://littlebow11549.github.io/games/02_brave_guy/assets/source/music/bgm_boss_kabanKing.ogg)。
- 替換狀態：本輪尚未換入新音樂；收到使用者指定後替換。

## B10｜新雞與八卦蛇：雙Boss戰／過場配樂

- 情緒／選曲方向：新雞與八卦蛇輪番施壓；雙主題對答、狡猾與混亂感。
- 播放事件：`bgm_boss_duo`。
- 目前檔案：`02_brave_guy/assets/source/music/bgm_boss_duo.ogg`。
- 目前長度：71.3 秒（ffprobe實測）。
- [試聽現有音檔](https://littlebow11549.github.io/games/02_brave_guy/assets/source/music/bgm_boss_duo.ogg)。
- 替換狀態：本輪尚未換入新音樂；收到使用者指定後替換。

## B11｜藍經理：Boss戰／過場配樂

- 情緒／選曲方向：無止境的會議與審視；規律但逼迫，逐步累積壓力。
- 播放事件：`bgm_boss_lanMgr`。
- 目前檔案：`02_brave_guy/assets/source/music/bgm_boss_lanMgr.ogg`。
- 目前長度：82.5 秒（ffprobe實測）。
- [試聽現有音檔](https://littlebow11549.github.io/games/02_brave_guy/assets/source/music/bgm_boss_lanMgr.ogg)。
- 替換狀態：本輪尚未換入新音樂；收到使用者指定後替換。

## B12｜幹譙龍：Boss戰／過場配樂

- 情緒／選曲方向：惡言攻擊、憤怒爆發；粗獷有力、節奏猛烈，但不要刺耳或削波。
- 播放事件：`bgm_boss_ganqiaoFull`。
- 目前檔案：`02_brave_guy/assets/source/music/bgm_boss_ganqiaoFull.ogg`。
- 目前長度：92.0 秒（ffprobe實測）。
- [試聽現有音檔](https://littlebow11549.github.io/games/02_brave_guy/assets/source/music/bgm_boss_ganqiaoFull.ogg)。
- 替換狀態：本輪尚未換入新音樂；收到使用者指定後替換。

## B13｜冠老闆：未變身Boss戰／勝利過場配樂

- 情緒／選曲方向：權威與壓迫的Boss戰；這不是使用者指定的出場曲B30，勿混淆。
- 播放事件：`bgm_boss_guan`。
- 目前檔案：`02_brave_guy/assets/source/music/bgm_boss_guan.ogg`。
- 目前長度：82.5 秒（ffprobe實測）。
- [試聽現有音檔](https://littlebow11549.github.io/games/02_brave_guy/assets/source/music/bgm_boss_guan.ogg)。
- 替換狀態：本輪尚未換入新音樂；收到使用者指定後替換。

## B14｜關卡 3-6 財務部與年終帳

- 情緒／選曲方向：財務、年終與被剝奪感；冷硬規律、算計感與緊迫感。
- 播放事件：`bgm_stage_3_6`。
- 目前檔案：`02_brave_guy/assets/source/music/bgm_stage_3_6_finance.ogg`。
- 目前長度：82.5 秒（ffprobe實測）。
- [試聽現有音檔](https://littlebow11549.github.io/games/02_brave_guy/assets/source/music/bgm_stage_3_6_finance.ogg)。
- 替換狀態：本輪尚未換入新音樂；收到使用者指定後替換。

## B15｜關卡 3-7 跨部門與甩鍋會議

- 情緒／選曲方向：跨部門甩鍋與混亂攻防；切分節奏、來回推擠的段落。
- 播放事件：`bgm_stage_3_7`。
- 目前檔案：`02_brave_guy/assets/source/music/bgm_stage_3_7_blame_meeting.ogg`。
- 目前長度：68.7 秒（ffprobe實測）。
- [試聽現有音檔](https://littlebow11549.github.io/games/02_brave_guy/assets/source/music/bgm_stage_3_7_blame_meeting.ogg)。
- 替換狀態：本輪尚未換入新音樂；收到使用者指定後替換。

## B16｜假忙森主管：Boss戰／過場配樂

- 情緒／選曲方向：假忙、推責與職場追逐；忙亂感與諷刺感並存。
- 播放事件：`bgm_boss_jiamangKing`。
- 目前檔案：`02_brave_guy/assets/source/music/bgm_boss_jiamangKing.ogg`。
- 目前長度：82.5 秒（ffprobe實測）。
- [試聽現有音檔](https://littlebow11549.github.io/games/02_brave_guy/assets/source/music/bgm_boss_jiamangKing.ogg)。
- 替換狀態：本輪尚未換入新音樂；收到使用者指定後替換。

## B17｜勝利配樂

- 情緒／選曲方向：戰鬥後釋放與勝利感；結算用短收束，避免冒充掌聲或KO音效。
- 播放事件：`bgm_victory`。
- 目前檔案：`02_brave_guy/assets/source/music/bgm_victory.ogg`。
- 目前長度：6.0 秒（ffprobe實測）。
- [試聽現有音檔](https://littlebow11549.github.io/games/02_brave_guy/assets/source/music/bgm_victory.ogg)。
- 替換狀態：本輪尚未換入新音樂；收到使用者指定後替換。

## B18｜關卡 1-0 宿舍房間

- 情緒／選曲方向：宿舍中的遲疑與不想面對今天；低強度、內省，保留出發前的空間。
- 播放事件：`bgm_stage_1_0`。
- 目前檔案：`02_brave_guy/assets/source/music/bgm_stage_1_0_dorm.ogg`。
- 目前長度：26.7 秒（ffprobe實測）。
- [試聽現有音檔](https://littlebow11549.github.io/games/02_brave_guy/assets/source/music/bgm_stage_1_0_dorm.ogg)。
- 替換狀態：本輪尚未換入新音樂；收到使用者指定後替換。

## B19｜關卡 1-1 教學大樓長廊

- 情緒／選曲方向：長廊前進與期限追趕；有行進動力，適合普通戰鬥長時間播放。
- 播放事件：`bgm_stage_1_1`。
- 目前檔案：`02_brave_guy/assets/source/music/bgm_stage_1_1_school_corridor.ogg`。
- 目前長度：75.8 秒（ffprobe實測）。
- [試聽現有音檔](https://littlebow11549.github.io/games/02_brave_guy/assets/source/music/bgm_stage_1_1_school_corridor.ogg)。
- 替換狀態：本輪尚未換入新音樂；收到使用者指定後替換。

## B20｜關卡 1-2 籃球場

- 情緒／選曲方向：籃球場與學會拒絕；節奏明確、青春感與正面衝突。
- 播放事件：`bgm_stage_1_2`。
- 目前檔案：`02_brave_guy/assets/source/music/bgm_stage_1_2_basketball_court.ogg`。
- 目前長度：34.4 秒（ffprobe實測）。
- [試聽現有音檔](https://littlebow11549.github.io/games/02_brave_guy/assets/source/music/bgm_stage_1_2_basketball_court.ogg)。
- 替換狀態：本輪尚未換入新音樂；收到使用者指定後替換。

## B21｜關卡 1-3 教官室與司令台

- 情緒／選曲方向：教官室的紀律壓力；較嚴肅、帶壓迫感，仍需保留動作節奏。
- 播放事件：`bgm_stage_1_3`。
- 目前檔案：`02_brave_guy/assets/source/music/bgm_stage_1_3_instructor_office.ogg`。
- 目前長度：14.1 秒（ffprobe實測）。
- [試聽現有音檔](https://littlebow11549.github.io/games/02_brave_guy/assets/source/music/bgm_stage_1_3_instructor_office.ogg)。
- 替換狀態：本輪尚未換入新音樂；收到使用者指定後替換。

## B22｜關卡 1-4 校門口

- 情緒／選曲方向：校門口惡夢超人；黑暗、鏡像自我、危機感，適合整關黑影戰。
- 播放事件：`bgm_stage_1_4`。
- 目前檔案：`02_brave_guy/assets/source/music/bgm_stage_1_4_nightmare_gate.ogg`。
- 目前長度：23.0 秒（ffprobe實測）。
- [試聽現有音檔](https://littlebow11549.github.io/games/02_brave_guy/assets/source/music/bgm_stage_1_4_nightmare_gate.ogg)。
- 替換狀態：本輪尚未換入新音樂；收到使用者指定後替換。

## B23｜關卡 2-1 黑森林

- 情緒／選曲方向：未知方向的黑森林；神祕探索與不安，避免過度熱鬧。
- 播放事件：`bgm_stage_2_1`。
- 目前檔案：`02_brave_guy/assets/source/music/bgm_stage_2_1_dark_forest.ogg`。
- 目前長度：26.7 秒（ffprobe實測）。
- [試聽現有音檔](https://littlebow11549.github.io/games/02_brave_guy/assets/source/music/bgm_stage_2_1_dark_forest.ogg)。
- 替換狀態：本輪尚未換入新音樂；收到使用者指定後替換。

## B24｜關卡 2-2 夜晚的村落

- 情緒／選曲方向：夜晚村落與地獄超人；陰暗、危險，帶罪惡感與決戰壓力。
- 播放事件：`bgm_stage_2_2`。
- 目前檔案：`02_brave_guy/assets/source/music/bgm_stage_2_2_hell_village.ogg`。
- 目前長度：17.8 秒（ffprobe實測）。
- [試聽現有音檔](https://littlebow11549.github.io/games/02_brave_guy/assets/source/music/bgm_stage_2_2_hell_village.ogg)。
- 替換狀態：本輪尚未換入新音樂；收到使用者指定後替換。

## B25｜關卡 3-0 加班的辦公桌

- 情緒／選曲方向：疲憊的加班辦公桌；壓抑、孤獨，為職場章節鋪陳。
- 播放事件：`bgm_stage_3_0`。
- 目前檔案：`02_brave_guy/assets/source/music/bgm_stage_3_0_overtime_desk.ogg`。
- 目前長度：20.1 秒（ffprobe實測）。
- [試聽現有音檔](https://littlebow11549.github.io/games/02_brave_guy/assets/source/music/bgm_stage_3_0_overtime_desk.ogg)。
- 替換狀態：本輪尚未換入新音樂；收到使用者指定後替換。

## B26｜關卡 3-1 一樓大廳與打卡機

- 情緒／選曲方向：大廳與打卡機的工作循環；機械般規律、漸增的焦躁。
- 播放事件：`bgm_stage_3_1`。
- 目前檔案：`02_brave_guy/assets/source/music/bgm_stage_3_1_clockin_lobby.ogg`。
- 目前長度：35.3 秒（ffprobe實測）。
- [試聽現有音檔](https://littlebow11549.github.io/games/02_brave_guy/assets/source/music/bgm_stage_3_1_clockin_lobby.ogg)。
- 替換狀態：本輪尚未換入新音樂；收到使用者指定後替換。

## B27｜關卡 3-2 開放式辦公室與茶水間

- 情緒／選曲方向：辦公室小圈圈與甩鍋；表面日常、底下暗藏緊張和狡猾。
- 播放事件：`bgm_stage_3_2`。
- 目前檔案：`02_brave_guy/assets/source/music/bgm_stage_3_2_office_pantry.ogg`。
- 目前長度：37.9 秒（ffprobe實測）。
- [試聽現有音檔](https://littlebow11549.github.io/games/02_brave_guy/assets/source/music/bgm_stage_3_2_office_pantry.ogg)。
- 替換狀態：本輪尚未換入新音樂；收到使用者指定後替換。

## B28｜關卡 3-3 會議室

- 情緒／選曲方向：會議室的無限會議；壓力持續累積，節奏不能只有單一重複。
- 播放事件：`bgm_stage_3_3`。
- 目前檔案：`02_brave_guy/assets/source/music/bgm_stage_3_3_meeting_room.ogg`。
- 目前長度：17.3 秒（ffprobe實測）。
- [試聽現有音檔](https://littlebow11549.github.io/games/02_brave_guy/assets/source/music/bgm_stage_3_3_meeting_room.ogg)。
- 替換狀態：本輪尚未換入新音樂；收到使用者指定後替換。

## B29｜關卡 3-4 客服部與匿名留言板

- 情緒／選曲方向：客服部與匿名惡評；躁動、衝突、被惡言包圍的感覺。
- 播放事件：`bgm_stage_3_4`。
- 目前檔案：`02_brave_guy/assets/source/music/bgm_stage_3_4_customer_service.ogg`。
- 目前長度：34.6 秒（ffprobe實測）。
- [試聽現有音檔](https://littlebow11549.github.io/games/02_brave_guy/assets/source/music/bgm_stage_3_4_customer_service.ogg)。
- 替換狀態：本輪尚未換入新音樂；收到使用者指定後替換。

## B30｜關卡 3-5 頂樓老闆辦公室／慣老闆出場曲（已指定）

- 情緒／選曲方向：使用者已試聽並明確喜歡這首。保留現有音檔，作為頂樓關卡與冠老闆登場參考；不要因重配Boss曲而覆蓋。
- 播放事件：`bgm_stage_3_5`。
- 目前檔案：`02_brave_guy/assets/source/music/bgm_stage_3_5_rooftop_office_guan_entrance.ogg`。
- 目前長度：34.4 秒（ffprobe實測）。
- [試聽現有音檔](https://littlebow11549.github.io/games/02_brave_guy/assets/source/music/bgm_stage_3_5_rooftop_office_guan_entrance.ogg)。
- 替換狀態：**保留：使用者已指定喜歡。**

## B31｜關卡 4-1 董事長室

- 情緒／選曲方向：董事長室與夢魘超人終戰；宏大、黑暗而決絕，可有交響金屬層次。
- 播放事件：`bgm_stage_4_1`。
- 目前檔案：`02_brave_guy/assets/source/music/bgm_stage_4_1_chairman_incubus.ogg`。
- 目前長度：47.0 秒（ffprobe實測）。
- [試聽現有音檔](https://littlebow11549.github.io/games/02_brave_guy/assets/source/music/bgm_stage_4_1_chairman_incubus.ogg)。
- 替換狀態：本輪尚未換入新音樂；收到使用者指定後替換。

## B32｜標題選單配樂

- 情緒／選曲方向：主選單的品牌主題；旋律好記、有英雄感，久聽不疲勞。
- 播放事件：`bgm_title`。
- 目前檔案：`02_brave_guy/assets/source/music/bgm_title.ogg`。
- 目前長度：24.5 秒（ffprobe實測）。
- [試聽現有音檔](https://littlebow11549.github.io/games/02_brave_guy/assets/source/music/bgm_title.ogg)。
- 替換狀態：本輪尚未換入新音樂；收到使用者指定後替換。

## B33｜首次變身劇情配樂

- 情緒／選曲方向：首次變身的完整戲劇弧線；由蓄勢走向揭曉，最後落在英雄登場。
- 播放事件：`bgm_transform`。
- 目前檔案：`02_brave_guy/assets/source/music/bgm_transform.ogg`。
- 目前長度：15.0 秒（ffprobe實測）。
- [試聽現有音檔](https://littlebow11549.github.io/games/02_brave_guy/assets/source/music/bgm_transform.ogg)。
- 替換狀態：本輪尚未換入新音樂；收到使用者指定後替換。

## B34｜戰敗過場配樂

- 情緒／選曲方向：戰敗後的失落與沉澱；不宜嘲諷或過度吵鬧，留重試空間。
- 播放事件：`bgm_defeat`。
- 目前檔案：`02_brave_guy/assets/source/music/bgm_defeat.ogg`。
- 目前長度：3.2 秒（ffprobe實測）。
- [試聽現有音檔](https://littlebow11549.github.io/games/02_brave_guy/assets/source/music/bgm_defeat.ogg)。
- 替換狀態：本輪尚未換入新音樂；收到使用者指定後替換。

## B35｜劇情對話配樂

- 情緒／選曲方向：承托台詞的低強度配樂；旋律與打擊樂不要壓過劇情閱讀。
- 播放事件：`bgm_talk`。
- 目前檔案：`02_brave_guy/assets/source/music/bgm_talk.ogg`。
- 目前長度：26.7 秒（ffprobe實測）。
- [試聽現有音檔](https://littlebow11549.github.io/games/02_brave_guy/assets/source/music/bgm_talk.ogg)。
- 替換狀態：本輪尚未換入新音樂；收到使用者指定後替換。

## B36｜結局過場配樂

- 情緒／選曲方向：故事收束與找回自己；溫暖、釋放、帶完成旅程的情緒。
- 播放事件：`bgm_ending`。
- 目前檔案：`02_brave_guy/assets/source/music/bgm_ending.ogg`。
- 目前長度：40.0 秒（ffprobe實測）。
- [試聽現有音檔](https://littlebow11549.github.io/games/02_brave_guy/assets/source/music/bgm_ending.ogg)。
- 替換狀態：本輪尚未換入新音樂；收到使用者指定後替換。

## B37｜製作名單配樂

- 情緒／選曲方向：製作名單長段播放；延續結局、平穩有旋律，適合欣賞與告別。
- 播放事件：`bgm_credits`。
- 目前檔案：`02_brave_guy/assets/source/music/bgm_credits.ogg`。
- 目前長度：47.0 秒（ffprobe實測）。
- [試聽現有音檔](https://littlebow11549.github.io/games/02_brave_guy/assets/source/music/bgm_credits.ogg)。
- 替換狀態：本輪尚未換入新音樂；收到使用者指定後替換。

## B38｜勇氣超人變身後戰鬥配樂

- 情緒／選曲方向：變身後可操作戰鬥的英雄主題；昂揚、強烈、有推進感，與Boss過場原曲區別。
- 播放事件：`bgm_brave`。
- 目前檔案：`02_brave_guy/assets/source/music/bgm_brave.ogg`。
- 目前長度：32.3 秒（ffprobe實測）。
- [試聽現有音檔](https://littlebow11549.github.io/games/02_brave_guy/assets/source/music/bgm_brave.ogg)。
- 替換狀態：本輪尚未換入新音樂；收到使用者指定後替換。

## Claude 接手操作

1. 先確認使用者指定的B編號，再對照事件ID與實際用途；不要只依檔名猜測。
2. 上傳原檔先歸檔並推送GitHub；保留原始來源與授權資訊，記錄「原檔→用途→輸出檔」映射，避免只留在暫存工作區。
3. 沿用用途命名。若改名，更新 `02_brave_guy/assets/manifest.json`、`audio-catalog.json`、`AUDIO_CATALOG.md` 及試聽資訊；B編號不要重排。
4. BGM同時檢查OGG與同名MP3備援，避免手機播到舊曲或找不到檔案。保持程式事件ID穩定，除非完整更新引用。
5. 不以改名或更改播放場景宣稱已替換音樂內容；若改音檔，記錄來源、長度、音量處理及驗證。
6. 驗證一般／變身形態、Boss過場→戰場，以及B30/B13/B38切換；長曲檢查循環接點，結局／勝利等單次曲依現有程式播放規則處理。
7. 更新快取版本、交接報告並提交推送；實際部署成功後才回報上線。

相關文件：`docs/handoffs/2026-11-18-game02-audio-usage-catalog.md`、`docs/handoffs/2026-11-18-game02-seal-sfx.md`。
