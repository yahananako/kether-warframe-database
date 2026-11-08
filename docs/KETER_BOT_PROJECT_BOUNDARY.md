# KETHER / KETER BOT 專案邊界（固定規則）

- KETHER 網站與 **KETER BOT** 同一程式庫：`yahananako/kether-warframe-database`。
- KETER BOT 是網站附掛的 Discord 功能；其 API、排程、日報、Warframe Market 資料、氏族驗證都在本專案維護及部署。
- 網站版本使用 `v2.x.x`；附掛 KETER BOT 功能版本使用 `v3.x.x`；試算表使用 `v1.x.x`；APP 使用 `v4.x.x`；`v5.x.x` 預留，尚未規劃（2026-11-08 站主確認）。
- **貓町希希 BOT** 是另一個 Discord 群的獨立程式庫：`yahananako/nekomachi-shishi-bot`。不得將 KETER 的日報、價格更新、氏族身分組或頻道設定寫入貓町希希。
- KETER 每日新聞頻道：`1034104146363699281`；標題：`Keter每日新聞`；公告不加「喵」。
- 每日新聞和白金行情合併為同一則 Discord 訊息；行情以同日已驗證資料為準，失敗時顯示未驗證，不以舊價冒充新價。
- Vercel Cron 使用 UTC 20:00，對應台灣隔日 04:00。
- 發布採用現有 `/api/discord/clan-news` 與去重資料庫；不得為補發而盲目重送造成重複公告。
- 發布前須確認測試通過、正式環境已更新，並核對 Discord 訊息 ID。GitHub commit 成功不等於已部署或已發文。

## 版本編碼規則（2026-11-08 站主確認）

VER01｜版本格式統一為 V產品系列.重大更新.修復與小幅新增。第一碼固定表示產品系列：V1＝表格資料庫、V2＝網站、V3＝BOT、V4＝APP；V5 為預留系列，目前尚未規劃。不得將不同產品的系列號混用。

VER02｜第二碼在重大更新時變動；第三碼在修復或小幅新增時變動。例：APP V4.0.16 的修復／小幅新增接續 V4.0.17；重大更新使用 V4.1.x。不得因一般修復或小幅新增而變更第二碼，也不得以第一碼表示更新大小。重大更新時第三碼的起算值尚未指定，不自行假定歸零。

雲端規則入口：[KETHER 網站開發與維護規則 v1.1](https://docs.google.com/document/d/1qt5BUmuRY5CaPuxN6v96711kIcMcnYN2lQkdHFl6l34/edit)。上述規則適用各產品系列，規則文件的修訂標記不代表產品版號。本次僅修訂規則，不提升既有產品版號。
