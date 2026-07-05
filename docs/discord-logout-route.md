# Discord Logout Route

## 目標

新增登出 route，讓使用者可以清除 Discord 登入 session cookie。

## 已新增路由

/api/auth/logout

## 支援方法

- GET
- POST

## 清除 Cookie

- kether_discord_session
- kether_discord_oauth_state

## 安全規則

- 不修改網站版本
- 不修改首頁
- 不修改 OAuth callback 流程
- 只清除登入狀態相關 cookie

## 下一步

下一步可將登入頁或個人頁接上登出按鈕。
