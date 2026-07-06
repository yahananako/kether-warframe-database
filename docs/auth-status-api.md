# Auth Status API

## 目標

新增 `/api/auth/status`，用來檢查 Discord 登入與權限鎖門需要的環境變數是否存在。

## 檢查項目

- DISCORD_CLIENT_ID
- DISCORD_CLIENT_SECRET
- DISCORD_BOT_TOKEN
- DISCORD_GUILD_ID
- DISCORD_ALLOWED_ROLE_IDS
- NEXTAUTH_SECRET
- NEXTAUTH_URL

## 備註

- 不輸出任何 secret 內容。
- 只回傳 true / false。
- 不修改網站版本號。
