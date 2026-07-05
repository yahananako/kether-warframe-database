# Discord Guild Role Check

## 目標

在 Discord OAuth callback route 中，確認登入者是否為指定 Discord 伺服器成員，並檢查是否擁有允許的身分組。

## 已更新路由

/api/auth/discord/callback

## callback route 目前流程

1. 接收 Discord callback query
2. 驗證 authorization code
3. 驗證 OAuth state
4. 使用 authorization code 交換 access token
5. 使用 access token 讀取 Discord 使用者資料
6. 使用 access token 檢查指定 Discord 伺服器 member 資料
7. 比對使用者 roles 是否包含允許的 role id
8. 通過後回傳 authorized 狀態
9. 清除 OAuth state cookie

## 需要的環境變數

DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_REDIRECT_URI=
DISCORD_GUILD_ID=
DISCORD_ALLOWED_ROLE_IDS=

## 權限判斷

通過條件：

- Discord OAuth state 正確
- Discord token exchange 成功
- 可讀取 Discord user profile
- 使用者是指定 Discord 伺服器成員
- 使用者擁有 DISCORD_ALLOWED_ROLE_IDS 其中一個身分組

## 安全規則

- access token 不回傳到前端畫面
- refresh token 不回傳到前端畫面
- client secret 只在 server route 使用
- 未通過伺服器或身分組檢查時回傳 403
- 只回傳整理後的使用者與授權狀態

## 下一步

下一步可為已授權的 Discord 使用者建立 server-side session。
