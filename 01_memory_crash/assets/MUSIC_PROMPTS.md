# 🎵 Memory Crash — 背景音樂提示詞 / 規格

目前遊戲內的 `bgm_loop.ogg` / `bgm_loop.mp3` 為程式合成的 60 秒無縫循環
（深藍科幻 + 青藍琶音 + 水晶鈴，112 BPM，A 小調）。
之後若要用 **ComfyUI（ACE-Step）** 重做替換，用下面這組設定。

## ACE-Step 設定

**Tags（風格）：**
```
electronic, chiptune, synthwave, video game bgm, puzzle game, sci-fi, bright cyan arpeggio synth, crystalline glassy bells, light pulse bassline, soft kick and hi-hat, 112 bpm, A minor, focused and positive, calm driving groove, clean modern, instrumental, no vocals, seamless loop
```

**Lyrics：**
```
[instrumental]
```

**參數：** seconds `70`、steps `50`、cfg `5`、sampler `euler`、scheduler `simple`、denoise `1.0`

## 替換方式
1. 用 ACE-Step 產出音檔（約 60–70s）。
2. ACE-Step 不保證完全無縫；頭尾做微交叉淡接（或請 AI 幫忙修成無縫）。
3. 轉成 `bgm_loop.ogg`（首選）與 `bgm_loop.mp3`（後備），覆蓋 `assets/` 內同名檔即可，
   程式會自動載入（`js/game.js` 的「背景音樂」區塊）。

## 風格微調
- 更濃科幻感：tags 加 `arpeggiated, glittering, spacey pads`
- 太吵：把 `soft kick and hi-hat` 換成 `minimal percussion`
