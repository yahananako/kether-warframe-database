# KETHER 環境變數總表

更新日期：2026/09/15

## 使用規則

- 本文件只記錄變數名稱與用途。
- 不寫入任何真正密鑰、Token、Private Key。
- 之後除非新增功能，否則不重新設定環境變數。
- Codespaces / Vercel / GitHub Secrets 需要分開檢查，不代表一邊有，其他地方就自動存在。

## 網站登入 / Session

| 變數名稱 | 用途 | 備註 |
|---|---|---|
| SESSION_SECRET | 自製 session / middleware 權限驗證 | 目前網站權限鎖門會用到 |
| NEXTAUTH_SECRET | NextAuth session 加密 | 專案中仍有引用，先保留 |
| NEXTAUTH_URL | NextAuth 網站網址 | Vercel 正式站需對應正式網址 |

## Discord OAuth / 群組權限

| 變數名稱 | 用途 | 備註 |
|---|---|---|
| DISCORD_CLIENT_ID | Discord App Client ID | OAuth 登入使用 |
| DISCORD_CLIENT_SECRET | Discord App Client Secret | OAuth 登入使用，不可公開 |
| DISCORD_REDIRECT_URI | Discord OAuth 回調網址 | 需與 Discord Developer Portal 對齊 |
| DISCORD_GUILD_ID | 氏族 Discord 群組 ID | 權限驗證使用 |
| DISCORD_ALLOWED_ROLE_IDS | 允許登入網站的身分組 ID | 多個可用逗號分隔 |

## Discord BOT

| 變數名稱 | 用途 | 備註 |
|---|---|---|
| DISCORD_BOT_TOKEN | Discord Bot Token | BOT 呼叫 Discord API 使用，不可公開 |
| DISCORD_PUBLIC_KEY | Discord Interactions Public Key | 驗證 Discord Slash Command 請求 |
| DISCORD_APP_ID | Discord Application ID | 註冊 Guild 指令使用；可與 Client ID 相同 |
| DISCORD_VERIFICATION_CHANNEL_ID | 氏族驗證頻道 ID | 選填；設定後 `/氏族驗證` 只能在該頻道使用 |
| DISCORD_MORTAL_ROLE_ID | 「凡人」身分組 ID | 建議設定；比依名稱尋找更穩定 |
| DISCORD_ANGEL_ROLE_ID | 「天使」身分組 ID | 建議設定；比依名稱尋找更穩定 |
| DISCORD_MORTAL_ROLE_NAME | 新人身分組名稱 | 選填；未設定時使用 `凡人` |
| DISCORD_ANGEL_ROLE_NAME | 驗證後身分組名稱 | 選填；未設定時使用 `天使` |
| DISCORD_GIVEAWAY_MANAGER_ROLE_IDS | 可操作抽獎的身分組 ID | 選填，多個用逗號分隔；管理員不需設定 |
| KETHER_CLAN_NAME | 截圖中要核對的氏族名稱 | 未設定時使用 `KETHER OF PARADISO` |
| KETHER_CLAN_EMBLEM_URL | 氏族徽章比對範本 | 選填；未設定時使用正式站徽章 |

氏族自動驗證另外需要：

- 在 Google Cloud 專案啟用 Cloud Vision API。
- 讓既有 Service Account 具備呼叫 Vision API 的權限。
- 小希 BOT 具備「管理身分組」，且 BOT 身分組排列在「天使」與「凡人」上方。
- 建議只允許新人頻道使用 `/氏族驗證`，並設定 `DISCORD_VERIFICATION_CHANNEL_ID`。

抽獎功能需要小希 BOT 在抽獎頻道具備「查看頻道、傳送訊息、嵌入連結」權限。

## Neon / BOT 狀態資料

| 變數名稱 | 用途 | 備註 |
|---|---|---|
| DATABASE_URL | Neon PostgreSQL 連線字串 | 氏族驗證紀錄、截圖防重複與抽獎名單使用，不可公開 |

## Supabase / 個人進度

| 變數名稱 | 用途 | 備註 |
|---|---|---|
| SUPABASE_URL | Supabase 專案網址 | 個人資料 / 進度資料使用 |
| SUPABASE_ANON_KEY | Supabase 匿名 Key | 前後端讀取資料使用 |
| SUPABASE_SERVICE_ROLE_KEY | Supabase Service Role Key | 後端管理用，不可公開 |

## Google Sheets / 試算表資料

| 變數名稱 | 用途 | 備註 |
|---|---|---|
| GOOGLE_SHEETS_ID | Warframe 資料試算表 ID | 網站資料來源 |
| GOOGLE_SERVICE_ACCOUNT_EMAIL | Google Service Account Email | 讀取試算表與氏族截圖 OCR 使用 |
| GOOGLE_PRIVATE_KEY | Google Service Account Private Key | 試算表與 Vision API 共用；不可公開，換行需正確處理 |

## 方案 / 訂閱狀態

| 變數名稱 | 用途 | 備註 |
|---|---|---|
| KETHER_PLAN_STATUS | 方案狀態 | 目前屬於預留 / 管理用途 |
| KETHER_PLAN_TIER | 方案等級 | 目前屬於預留 / 管理用途 |
| KETHER_SUBSCRIPTION_ENDS_AT | 訂閱結束時間 | 目前屬於預留 / 管理用途 |
| KETHER_TRIAL_ENDS_AT | 試用結束時間 | 目前屬於預留 / 管理用途 |

## 官方新聞 / 外部資訊

| 變數名稱 | 用途 | 備註 |
|---|---|---|
| WARFRAME_OFFICIAL_NEWS_FEED_URL | Warframe 官方新聞 RSS / Feed 來源 | 官方新聞同步使用 |

## 公開顯示

| 變數名稱 | 用途 | 備註 |
|---|---|---|
| NEXT_PUBLIC_APP_NAME | 網站公開名稱 | 可顯示在前端 |
| NEXT_PUBLIC_APP_VERSION | 網站公開版本 | 可顯示在前端 |

## 檢查節奏

只有在以下情況才檢查或新增 env：

1. 新增 Discord OAuth / BOT 功能。
2. 新增 Supabase 資料功能。
3. 新增 Google Sheets 讀取欄位或資料來源。
4. Vercel 出現 401 / 403 / 500。
5. 本機成功但正式站失敗。
6. Discord BOT 顯示「該申請未受回應」。
