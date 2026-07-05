# Discord Auth Session

## 目標

在 Discord OAuth callback route 通過伺服器與身分組檢查後，建立 server-side session cookie。

## 已更新內容

- 新增 lib/auth/discordSession.ts
- 新增 /api/auth/session
- 更新 /api/auth/discord/callback

## session 流程

1. Discord OAuth callback 驗證 state
2. 使用 authorization code 交換 access token
3. 讀取 Discord 使用者資料
4. 檢查指定 Discord 伺服器成員資格
5. 檢查允許的 Discord 身分組
6. 建立簽章 session payload
7. 寫入 httpOnly cookie
8. 前端可呼叫 /api/auth/session 讀取登入狀態

## Cookie

kether_discord_session

## 安全規則

- session cookie 使用 httpOnly
- production 環境使用 secure cookie
- session payload 使用 HMAC SHA256 簽章
- session 有效期為 7 天
- access token 不寫入 cookie
- refresh token 不寫入 cookie
- client secret 只在 server route 使用

## 下一步

下一步可將登入頁與 Discord 登入 route 串接，讓使用者按下登入按鈕後開始 OAuth 流程。
