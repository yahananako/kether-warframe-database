# Discord 登入前置與個人化資料庫設計草稿

## 目標

本草稿規劃 Discord 登入、伺服器成員驗證、身分組驗證，以及個人化資料庫的資料結構。

## 登入流程

1. 使用者點擊 Discord 登入
2. 導向 Discord OAuth 授權頁
3. Discord callback 回到網站
4. 後端交換 access token
5. 取得 Discord 使用者基本資料
6. 檢查是否為指定 Discord 伺服器成員
7. 檢查是否擁有允許的身分組
8. 建立網站 session
9. 允許進入個人化資料庫功能

## 權限階層

未登入
↓
已 Discord 登入
↓
已確認為指定伺服器成員
↓
已確認擁有指定身分組
↓
可使用個人化資料庫

## 個人化資料庫欄位

- discordUserId
- itemKey
- category
- ownedStatus
- priority
- favorite
- personalNote
- updatedAt

## 本階段暫不更新版本

確認文件與後續功能沒問題後，才正式更新為 v2.2.0。
