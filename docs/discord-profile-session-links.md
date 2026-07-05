# Discord Profile Session Links

## 目標

將個人頁接上 Discord session 狀態與登出入口。

## 已更新頁面

/profile

## 新增入口

- /login
- /api/auth/session
- /api/auth/logout

## 功能用途

- 前往登入頁：讓使用者開始 Discord OAuth 登入
- 查看登入狀態：檢查目前 Discord session cookie 是否有效
- 登出 Discord：清除 Discord session cookie 與 OAuth state cookie

## 安全規則

- 不修改網站版本
- 不修改首頁
- 不修改 OAuth callback 流程
- 不寫入個人資料庫
- 只新增個人頁入口

## 下一步

下一步可建立個人化資料庫的資料結構文件與 API route 骨架。
