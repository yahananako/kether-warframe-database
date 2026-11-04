# KETER BOT 戰甲資料補齊

需求：補齊 `/戰甲取得` 漏列的戰甲與新版戰甲。

規則來源：2026-11-04 讀取《小希規則總表》的總目錄、全域、KETHER 開發、修訂紀錄；核對 `KETHER_REDESIGN_SPEC_2026-10-09.md` 與專案邊界。分支 `fix/warframe-catalog-completeness-20261104`，基準 main `51eaefe4e84d9674855300b2f8a02cbfb4300e1e`。

## 問題與修復

- 原 BOT 另外硬寫 32 筆取得資料，網站普通戰甲清單有 65 筆、詳情有 66 筆（含 Umbra）；三份清單未檢查一致性。
- BOT 改以共享普通戰甲清單產生資料，保留原中英文綽號與建議；取得方式共用網站資料，部件地點與機率取自生成的詳情。
- 新增 Narin 的共享取得方式、技能、基礎數值、圖片與掉落資料。現在 66 款普通版，加 Excalibur Umbra 共 67 筆。Prime 套裝仍透過既有市場連結提供，沒有把普通版取得方式冒充 Prime 遺物攻略。
- 更新 Warframe Stat API 中英文資料快照至 2026-11-04，包含 Citrine Prime 可交易狀態與 Banshee 重製描述。API 不再將部分任務／商店取得當作 100% 掉落，對應取得方式仍由共享清單保留。
- 修正 Ash 的舊「防禦輪次」限定說明，以及 Baruuk 主設計圖來源。保留網站、Discord、權限、API 回應契約與既有正常功能。
- Discord 部件超過 1024 字元時拆為續欄，保留完整文字；附圖片、官方來源與掉落資料日期。
- 新增一致性與回歸測試，逐筆檢查 67 款、全部別名、自動補全、Discord 長度、部件文字不遺失、Narin 無不存在的 Prime 連結、Citrine/Rhino 市場連結及實際搜尋 route；接入既有 CI。

官方依據：

- https://www.warframe.com/en/patch-notes/pc/44-0-0 — Narin 於 2026-09-23 的 Update 44 登場，主圖與部件來自扎日曼掉落或 Cephalon Melica 的 Entropic Kuva 兌換；同時推出 Citrine Prime。
- https://www.warframe.com/en/patch-notes/pc/44-1-0 — 2026-10-07 更新新增 The Icebind。
- https://www.warframe.com/en/game/warframes/narin
- https://api.warframestat.us/warframes?language=en 與 `language=zh-hant`。

## 五端影響

| 端 | 本次影響／驗證範圍 |
| --- | --- |
| 試算表 v1 | 未寫入，持有／價格資料不變；不是本次 BOT 取得攻略的來源。 |
| 網站 v2 | 共用取得清單、詳情與 `/api/bot-search/warframe` 一併包含 Narin；現有 UI 不變。 |
| Discord BOT v3 | 取得查詢、自動補全擴至 67 款；正式 Discord 操作待部署後驗收。 |
| iOS | 本次未重建或發布，待同步；不宣稱已更新安裝中的 App。 |
| Android | 本次未重建離線包或發布，現有生成腳本下次可讀到共享資料；待同步。 |

## 驗證與發布

本機已通過：`test:warframes`、`test:warframe-acquisition`、`test:discord-bot`、`discord:validate`（13 指令）、TypeScript、Next.js production build（257 頁）、設計不變條件 11/11、`git diff --check`。

本機 Chromium 未能取得可用執行檔，下載回傳無效 ZIP，因此手機／桌面真實瀏覽器操作尚未完成；GitHub CI 仍有既有瀏覽器驗收步驟。Vercel 團隊 API 目前回覆 403，部署狀態另以 GitHub 的 Vercel check 核對，不能據此宣稱線上互動已驗收。

本次只交付分支／PR 與預覽，不直接合併正式站；版本號未提前提升。站主確認、正式部署與真實 Discord 查詢分開記錄。回復方式為關閉未合併 PR；合併後可 revert 本 PR 還原，不涉及資料庫遷移或個人資料變動。
