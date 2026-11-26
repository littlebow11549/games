# 勇氣超人｜俊熊兩套 3D 突襲動作

- 校園俊熊保留棕色熊兜帽、白衣與純黑眼睛；職場「已讀俊熊」保留不同的領口、袖子與員工證。荒野沿用校園版。
- 探頭仍以原有 1.2 秒為預警。嚇人後跳起再縮回；抓到時縮身退場。只在需要俊熊的關卡載入對應的一套，載入失敗時沿用原造型。救援、10% 補血、恐懼距離、硬直、勇氣與罪惡感規則不變。修正達到抓取上限時最後一隻沒有從場景移除的問題。
- 來源：Tripo 已綁定檔 BraveGuy_22_Additional_Rigs_v01.zip 的 GLB/junxiong_rig.glb、GLB/junxiong_office_rig.glb。保留原網格與材質，平滑衣袖等骨架權重，不追加 Tripo 點數。重製：python tools/make_game02_junxiong_motion.py --rig-zip <zip> --output <dir>。

| 部署 GLB（02_brave_guy/assets/runtime/stage-art/） | 大小 | SHA-256 |
| --- | ---: | --- |
| brave_guy_charactor06_junxiong_motion.glb | 1,324,480 B | cbe3c7b83d33cdcdfc411a05f39b928a120f7720a380eeed28fc791eecc59f6b |
| brave_guy_charactor06_junxiong_office_motion.glb | 1,342,584 B | 6b8bd0737624c5a1a5ce1b4ecb4c117fd1af85b11a403cee7016e7f0e5ddbe0c |

- 驗證：桌面 H5 進過 1-1 與 3-2。以臨時本機頁重現遊戲的 updateAmbush 與 WebGL 渲染，兩套探頭、嚇人、縮回、被抓到都擷取畫面檢查；臨時頁不進 Git。node tools/tests/game02-junxiong-motion.cjs 檢查抓取、嚇到、免疫、距離外、達上限退場與模型配置；未以 iOS 實機驗證。
- 正式入口：02_brave_guy/play.html?v=20261126junxiong。回退可用 Git revert；只回退模型則移除 manifest 的兩個新模型條目，保留退場修正。
