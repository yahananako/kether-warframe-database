# Discord User Profile

## 目標

在 Discord OAuth callback route 中，使用 access token 讀取 Discord 使用者基本資料。

## 已更新路由

/api/auth/discord/callback

## callback route 目前流程

1. 接收 Discord callback query
2. 驗證 authorization code
3. 驗證 OAuth state
4. 使用 authorization code 交換 access token
5. 使用 access token 讀取 Discord 使用者資料
6. 回傳安全整理後的使用者資料
7. 清除 OAuth state cookie

## 回傳資料

目前只回傳必要的 Discord 使用者資訊：

- id
- username
- globalName
- discriminator
- avatar

## 安全規則

- access token 不回傳到前端畫面
- refresh token 不回傳到前端畫面
- client secret 只在 server route 使用
- OAuth state 驗證失敗時中止流程
- 只回傳整理後的 Discord user profile

## 下一步

下一步可檢查 Discord 伺服器成員資格與允許的身分組。
