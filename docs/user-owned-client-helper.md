# User Owned Client Helper

## 目標

新增前端可用的已購買資料 helper，讓資料頁之後可以讀取與切換目前 Discord 登入者自己的已購買狀態。

## 新增檔案

lib/userOwnedClient.ts

## 提供功能

- fetchUserOwnedItems
- toggleUserOwnedItem
- createOwnedItemMap
- isOwnedItem
- isUserOwnedAuthenticated

## 對應 API

- GET /api/user-owned/list
- POST /api/user-owned/toggle

## 使用規則

- 使用 credentials include 帶入 Discord session cookie
- 不直接讀取 Supabase
- 不接觸 access token
- 未登入時由 API 回傳 401
- 前端只處理整理後的 response

## 本階段不做

- 不修改網站版本
- 不修改首頁
- 不修改資料頁 UI
- 不寫死測試使用者
- 不新增個人化資料庫表格

## 下一步

下一步可將 /database/[category] 的已購買狀態讀取改接 lib/userOwnedClient.ts。
