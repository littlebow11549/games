# 字型

| 檔案 | 來源字型 | 用途 | 授權 |
| --- | --- | --- | --- |
| `huninn-subset.woff2` | jf open 粉圓 2.1（justfont） | 內文、對話、泡泡 | SIL Open Font License 1.1 |
| `notosanstc-black-subset.woff2` | Noto Sans TC（wght 900） | 標題、橫幅、按鍵、數字 | SIL Open Font License 1.1 |

兩個檔案都只含遊戲用到的字（約 1,450 字），由 [`tools/make_game02_fonts.py`](../../../tools/make_game02_fonts.py) 產生。
**新增或修改遊戲文字後要重跑一次**，否則新字會退回系統字型。原始字型檔不放進 repo，下載網址寫在該腳本開頭。

2026-11-15：三語內容擴充後重新產生子集；新增 `notosansjp-subset.woff2`（variable 100–900，SIL OFL 1.1）。來源：https://raw.githubusercontent.com/google/fonts/main/ofl/notosansjp/NotoSansJP%5Bwght%5D.ttf 。語系 ja 使用日本字形；此檔不替代繁體中文字型。
