# 秘技中文字型與未替換音效核對

- 截圖中的「秘」字未被納入兩個繁中字型子集，造成單字退回系統字型。
- 依既有 tools/make_game02_fonts.py 和原授權來源重新生成 BG Round、BG Black，完整掃描現行遊戲文字（1975字元集合），維持原字型風格與排版，未新增圖片。
- 檔案：assets/fonts/huninn-subset.woff2、notosanstc-black-subset.woff2；game.css字型快取、play.html樣式快取更新。
- 驗證：fontTools檢查「小天使要開啟秘技嗎？取消」全部字符存在；Chromium 390×844對話框截圖確認完整、不溢出。未做實機Safari測試。
- 新文件 docs/reports/2026-11-18-brave-guy-unreplaced-sfx.md：逐檔git歷史對照catalog/manifest，26槽位24獨立檔仍是f5c09b4 ComfyUI v3；排除所有BGM、後續已替換/清理、停用歡呼及使用者提供音效。不代表從未修改，也不聲稱全部槽位目前都觸發。
- 這輪未替換音效，僅列清單。字型與文件一併提交推送，Pages發布於聊天確認。
