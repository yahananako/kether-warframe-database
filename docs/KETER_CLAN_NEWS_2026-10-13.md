# KETER Warframe 每日氏族新聞

小希指定發布頻道：`1034104146363699281`。每則使用「對氏族成員的幫助」，不帶個人晨報、創作或帳號資訊。

## 交付流程

1. 既有 ChatGPT 每日晨報查證官方新聞，另外整理氏族稿。
2. 確認正式試發成功後，將 `data/clan-news-publishing.json` 的enabled設為true，保存verifiedAt與真實訊息連結。晨報核對該狀態後將當日稿更新到 `data/warframe-clan-news.json`；只需 GitHub 的現有連線，不傳輸 BOT Token。該檔案只有可公開的氏族新聞。
3. Vercel Cron 於 UTC 02:00（台灣上午10點；Hobby執行可能落在該小時內）呼叫 `/api/discord/clan-news`，讀取當日 JSON，透過現有 KETER BOT 發布一則多張 Embed 的圖文新聞。
4. 同一天同頻道只發一份。Neon原子領取＋持久發送狀態，Discord nonce另處理短時間重試。逾期稿、不明傳送結果不會自動重發。

## 啟用前必須核對

- Vercel 專案 `kether-warframe-database`、team `team_0wJwqZaQYb3jx00zegTJDLA0`。
- 必需現有伺服器變數：`DISCORD_BOT_TOKEN`、`DISCORD_GUILD_ID`、`DATABASE_URL`。
- 新增 `CRON_SECRET`（至少16字元隨機密鑰）與 `KETHER_CLAN_NEWS_ENABLED=true`；僅 production允許送出。密鑰只放Vercel，不放repo。
- 以Authorization Bearer呼叫 `?action=status`，確認BOT身分、指定頻道名稱／ID、所屬guild相符。頻道只允許一般文字或公告頻道。
- BOT在指定頻道需查看頻道、傳送訊息、嵌入連結的權限；API最終回覆決定是否送達。
- 以 `?action=preview`核對當日稿，啟用並測試真正送出，取得Discord訊息連結，再讓晨報開啟寫入JSON的步驟。
- Preview／本機部署不會發群。未設CRON_SECRET時所有請求拒絕，未啟用開關時Cron不發送。

## 目前狀態

2026/10/13：頻道ID已由小希提供；Vercel環境變數讀取回覆403，連線無權存取該team。沒有CLI或CLI憑證可用。頻道身分、正式環境變數、Neon狀態與Discord實際發送均尚未驗證；不能宣稱啟用成功。

## 稿件結構

`date` 是Asia/Taipei當天YYYY-MM-DD。`articles`為0～5則；沒有新消息可用空陣列及 `noNewsText`。每則必需title、publishedDate、summary、memberBenefit、sourceUrl；nextStep、imageUrl選填。

資料只接受Warframe官方新聞／論壇文章HTTPS來源、官方圖片，拒絕重複英文／繁中同文。總Embed文字不得超過5900字元。官方沒有精確時刻時，不自行推定台灣截止時間。稿件日期與發送日不同時停止，避免隔日重貼舊報。

## 同步影響

- BOT：新增發布介面與永久發送紀錄。
- 網站：只為新API加入proxy例外，API本身必需Bearer驗證；不改首頁及原本新聞API。
- 表格／iOS／Android：沒有資料結構或遊戲數值變更，無需產生新App；仍讀原共用API。App施工繼續暫停。
- 網站／Bot正式版本號於實際部署時再依既有版本規則更新，不把未部署分支當正式版本。

驗證命令：`node --test scripts/test-clan-news*.mjs`。涵蓋核心與HTTP路由測試，路由測試模擬Discord、Neon與新聞下載，不會真實發群。請執行完整repo既有build／typecheck後部署。

正式送達前不要標示完成。對未知/傳送中紀錄須先查Discord訊息及Neon表，核對後人工復原狀態；不要盲目刪除防重複紀錄。

## 10/13 新聞內容修訂

標題固定為「Keter每日新聞」，日期另列。Keter BOT使用調皮、成人曖昧雙關的文案，輸出所有編輯欄位都移除「喵」，不使用小希的人格署名。新增限時材料、緊急任務、任務獎勵、地點、參加條件及精確台灣截止時間。僅依真實資料填寫。

category可為official-news、limited-material、urgent-mission。materialInfo、rewards、location、requirements、expiresAt為選填欄位。expiresAt必需帶Z或明確時區；到期項目在發送時排除。不要把未公布的活動日期補成精確時刻。

即時情報以liveIntel記錄verified/unavailable、當天checkedAt及說明。官方世界狀態來源https://api.warframe.com/cdn/worldState.php須帶sourceItemId、真實expiresAt和已核對的liveIntel；相同API中的不同任務可按ID分開。無法取得即時資料時，寫unavailable，不能假稱今日沒有任務。

追蹤Fomorian、Razorback及其活動限定材料，並留意Forma／催化劑／反應爐等限時獎勵；具體名稱、出現狀態、材料與獎勵以本次官方資料核對，不以口語「福馬林」臆測正在開放的任務。
