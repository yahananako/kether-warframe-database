# Discord Login Page Link

## 目標

將登入頁的 Discord 登入入口接到 OAuth login route。

## 已更新頁面

/app/login

## 登入入口

/api/auth/discord/login

## 使用者流程

1. 使用者進入登入頁
2. 點擊使用 Discord 登入
3. 網站導向 /api/auth/discord/login
4. login route 產生 OAuth state
5. 導向 Discord OAuth 授權頁
6. callback route 完成 token exchange、使用者資料讀取、伺服器與身分組檢查
7. 通過後建立 session cookie

## 本階段不做

- 不修改網站版本
- 不新增個人化資料頁
- 不寫入個人資料庫
- 不修改首頁版面

## 下一步

下一步可新增登出 route，讓使用者清除 Discord session cookie。
