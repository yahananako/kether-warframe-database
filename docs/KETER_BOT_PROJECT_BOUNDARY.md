# KETHER / KETER BOT 專案邊界（固定規則）

- KETHER 網站與 **KETER BOT** 同一程式庫：`yahananako/kether-warframe-database`。
- KETER BOT 是網站附掛的 Discord 功能；其 API、排程、日報、Warframe Market 資料、氏族驗證都在本專案維護及部署。
- 網站版本使用 `v2.x.x`；附掛 KETER BOT 功能版本使用 `v3.x.x`；試算表使用 `v1.x.x`。
- **貓町希希 BOT** 是另一個 Discord 群的獨立程式庫：`yahananako/nekomachi-shishi-bot`。不得將 KETER 的日報、價格更新、氏族身分組或頻道設定寫入貓町希希。
- KETER 每日新聞頻道：`1034104146363699281`；標題：`Keter每日新聞`；公告不加「喵」。
- 每日新聞和白金行情合併為同一則 Discord 訊息；行情以同日已驗證資料為準，失敗時顯示未驗證，不以舊價冒充新價。
- Vercel Cron 使用 UTC 20:00，對應台灣隔日 04:00。
- 發布採用現有 `/api/discord/clan-news` 與去重資料庫；不得為補發而盲目重送造成重複公告。
- 發布前須確認測試通過、正式環境已更新，並核對 Discord 訊息 ID。GitHub commit 成功不等於已部署或已發文。
