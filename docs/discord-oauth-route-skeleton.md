# Discord OAuth 路由骨架

## 目標

建立 Discord 登入與 callback 的 API route 骨架。

## 已建立路由

/api/auth/discord/login
/api/auth/discord/callback

## login route

用途：

1. 檢查 Discord OAuth 環境變數
2. 產生 OAuth state
3. 將 state 寫入 httpOnly cookie
4. 導向 Discord 授權頁

## callback route

用途：

1. 接收 Discord 回傳的 code
2. 驗證 state 是否與 cookie 相同
3. 回傳 callback route 狀態
4. 下一步才交換 access token

## 本階段不做

- 不交換 Discord access token
- 不讀取 Discord 使用者資料
- 不檢查伺服器成員
- 不建立 session
- 不修改登入頁 UI
- 不更新網站版本

## 下一步

確認 build 成功後，再實作 token exchange。
