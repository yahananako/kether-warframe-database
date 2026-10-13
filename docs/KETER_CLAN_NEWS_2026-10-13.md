# Keter每日新聞

目的頻道：1034104146363699281。主標題精確為「Keter每日新聞」，日期另列。BOT語氣調皮、輕度曖昧雙關，不加「喵」；幫助欄位為「對氏族成員的幫助」。內容涵蓋官方消息、限定材料、警報、緊急任務與值得參加的獎勵，圖片附官方來源。

## 現況（2026-10-13）

PR #35已合併並正式部署。Production已有CRON_SECRET、DISCORD_BOT_TOKEN、DISCORD_GUILD_ID及DATABASE_URL設定，新聞預覽通過。BOT身分核對成功，但讀取指定頻道回傳HTTP 403、Discord code 50001（Missing Access）；尚未發訊息，也沒有送達紀錄。準備稿件閘門保持disabled，直到正式試發取得真實Discord訊息連結。

今日稿件已核對官方即時World State：Fomorian正在開放，包含Omega Isotope、Archwing及Fomorian Disruptor條件、目標獎勵與期限；並附10月8日Taubound官方公告。Fomorian圖片是官方歷史示意圖，不冒稱本次截圖。

## 排程與限制

Vercel cron「0 20 * * *」對應台灣04:00。專案目前Hobby方案，排程可能在04:00～04:59執行，尚不能保證04:00準時送出；不可把設定時刻當成送達證據。獨立03:30準備任務先核對enabled／verifiedAt／lastVerifiedMessageUrl；未驗證時只交付草稿，不更新正式來源。精確04:00發送仍待完成。

## 頻道權限解除後

讓現有Keter BOT可以檢視頻道、傳送訊息及嵌入連結，並檢查分類繼承的拒絕權限。以CRON_SECRET授權呼叫/api/discord/clan-news?action=status，確認channelId、guildId與BOT身分，再核對當日preview。使用?action=publish試發，只有published=true及真實messageUrl才表示成功；durable delivery表避免同日重複發送。成功後更新閘門enabled=true、verifiedAt與lastVerifiedMessageUrl，再完成精確04:00排程。

憑證不得提交Git、放入新聞稿或輸出到對話。遇到不明送出結果時先查delivery狀態，不盲目重發。舊日期稿及已到期任務會被拒絕或移除。
