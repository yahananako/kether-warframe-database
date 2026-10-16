# Keter每日新聞

目的頻道：1034104146363699281（📣氏族公告），guild 1033399126936789023，BOT 1523377443107508294。主標題精確為「Keter每日新聞」，日期另列；調皮、輕度曖昧雙關、不加「喵」。每則含「對氏族成員的幫助」，官方圖片與來源。

## 正式試發

2026-10-13權限解除後，BOT身分、目的頻道及實際發送均已驗證。今日兩則包含官方即時Fomorian材料與任務情報、10月8日Taubound公告。送達：https://discord.com/channels/1033399126936789023/1034104146363699281/1559409245340835852 。Fomorian配圖為官方歷史示意圖，非本次截圖。發布閘門記錄真實verifiedAt及messageUrl。

## 每日流程

單一ChatGPT automation「Keter每日新聞」使用Asia/Taipei，每日03:00與04:00觸發，兩次至少間隔一小時：03:00查證並更新當日GitHub來源；04:00核對預覽、目的頻道及未到期任務後呼叫正式發布API。排程時刻是啟動時刻，實際Discord送達仍受連線及查證耗時影響。Vercel Hobby cron「0 20 * * *」保留作04:00～04:59備援；同日durable delivery表及Discord nonce防止重複訊息。

API接受CRON_SECRET或只用於新聞route的KETER_NEWS_DISPATCH_TOKEN，使用timingSafeEqual比對。後者存production encrypted env，授權自動化透過Vercel connector取用；不讀DISCORD_BOT_TOKEN、不輸出任何憑證、不放入Git或排程文字。請用專案ID，不傳已知會造成403的teamId。

## 驗證與錯誤处理

### 行情補入與實際訊息核對（2026-10-16）

`already-published` 只證明資料庫有送達記錄，不能證明後來新增的行情已出現在 Discord。使用相同授權呼叫 GET `?action=delivery`，會從 Discord 讀回今天 delivery 表指向的原訊息，核對 BOT、頻道、日期與標題，回傳 `marketEmbeds` 與原 `messageId`。

若今日已驗證的行情尚未出現，可 POST `?action=refresh-market`。此操作只更新原訊息的行情 Embed，保留原新聞與文字，禁止新增第二則日報；必須是已啟用的 production。只接受當日 verified 行情。PATCH 後另行 GET 同一則 Discord 訊息，確認行情數值及連結、原新聞與訊息 ID，通過才回傳 `updated=true, verified=true`。GET 不允許觸發行情修改。重複操作會替換行情區塊，不累積重複 Embed。

API status須核對channel/guild/BOT；preview不送訊息。published=true及messageUrl才是送達證據；already-published只代表既有送達紀錄，不能另發一則。對未知結果、逾時或5xx先核對durable狀態，不盲目重發。過期稿、舊日期或不可信來源被拒絕。即時World State網頁工具若403，可嘗試直接HTTPS讀官方URL；無法核對時明確標示，不編造任務或材料。
