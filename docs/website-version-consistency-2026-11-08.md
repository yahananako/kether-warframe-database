# 網站版本一致性修正（2026-11-08）

正式網站部署 dpl_AUVSjDEgT1YPuEUsCdEku2iMzB8R 對應 main 1d353dd24bd30e69b94849d641f58f0962f77da9。網站版號以 2026-10-21 PR #39 合併並驗證的 v2.2.61 為準；BOT 在 PR #40 更新為 v3.5.12。package.json 的 2.6.4 與 Android 3.0.11 公告來自 2026-09-15 提交 3277bec，不能作為當前網站版號。

修正 package.json 與 lockfile 為 2.2.61；data/siteVersion.ts 直接讀取 package.json 的 version，首頁、共用框架、更新中心、資料庫狀態頁沿用共用匯出。舊 Android 公告明示 APP V3.0.11，保留原內容。此為版本資料校正，未增加網站功能版號。

五端影響：網站修正版本來源與公告；BOT 保留 3.5.12；Google 試算表、Android、iOS 無資料契約或程式變更。未安裝或重新發布手機 APP。

回復方式：revert 本次修正提交即可，無資料庫遷移。
