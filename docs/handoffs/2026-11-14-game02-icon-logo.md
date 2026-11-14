# 遊戲Icon加入Logo

2026-11-14，APHASEN。使用者指定在剛完成的方形封面加入Logo，現在先做成遊戲icon。

- 成果：`02_xianxia_battle/assets/source/pic/branding/icon_01_logo.png`，原生1254×1254 RGB PNG。原始無字 `icon_01.png` 及核准 `logo_01_review_v1.png` 均保留。
- 使用內建image_gen，以無字封面為編輯目標、已核准透明Logo為第二參考；Logo置於下方，保留臉部、紅眼與主要拳頭輪廓。英文BRAVE GUY及中文勇氣超人目視可讀。
- 這是生成式合成，不是將原Logo逐像素貼上；字形、角色位置及線條有微幅重繪。實際Logo約佔下半部，未遮住臉。縮至極小icon時中文細節可能不清晰，尚未做實際網站裁切測試。
- 原生PNG bytes直接保存，無插值放大或重編碼。尺寸、bytes、SHA256見 `assets/source/ICON_LOGO_DELIVERY.json`；實際提示詞見 `ICON_LOGO_PROMPT.md`。
- 已同步需求與交接入口。未改網站runtime引用，未推送、部署或外部通知；沒有Library ID。
