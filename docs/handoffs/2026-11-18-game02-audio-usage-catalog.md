# 音訊用途命名、完整試聽檢核及冠老闆出場曲

- 使用者確認冠老闆出場使用「頂樓老闆辦公室原曲」bgm_stage_3_5。bossBgm(entrance=true) 僅套用登場對話／動畫；返回戰場仍依形態切勇氣超人／原Boss戰曲，其他Boss不變。
- 新增 assets/audio-catalog.json、assets/AUDIO_CATALOG.md：38首BGM、85個SFX槽位，逐項中文用途與穩定B/S編號。共用音檔在試聽頁列出，舊掌聲與舊合成歡呼標記停用。
- 新增 audio-review.html：123項可逐項播放、搜尋、單一播放、全部停止、保留／替換標記；標記只存在瀏覽器專用localStorage，不碰遊戲存檔。
- 音訊用途檔名：16首關卡音樂補上場景名稱，含OGG／MP3；hit、ko、y2004、result、dialog版本編號改成明確事件名稱。其餘原有檔名已依用途命名，保留。程式事件ID保持穩定，manifest與現行工具引用同步更新。
- 未重製或重新編碼任何聲音。僅整理勇氣超人目前manifest全部槽位，未整理其他遊戲或未接入的歷史音檔。
- 驗證：28組Boss音樂切換測試通過，冠老闆出場為指定曲、變身回戰場為勇氣超人；ffprobe檢查manifest所有音檔及MP3備援；手機試聽頁123項、搜尋及標記保存通過。非人工完整聽完每首。
- 檔案：main.js、play.html、manifest.json、source/music與source/sfx改名、tools/make_game02_dialog_soft.py、tools/tests/game02-boss-music.cjs，及上述清單與試聽頁。
- 待使用者逐項檢核並提供替換音檔；尚未收到的新版本不預先替換。推送後Pages發布，聊天回報線上核對。

- 清單補正雙Boss中文名稱（新雞與八卦蛇），並區分冠老闆B13戰鬥／勝利過場與B30出場曲。
