# DataTable User Owned Client

## 目標

將資料表的個人已購買狀態改接 lib/userOwnedClient.ts。

## 已更新檔案

components/DataTable.tsx

## 更新內容

- 使用 fetchUserOwnedItems 讀取目前 Discord session 使用者的已購買清單
- 使用 toggleUserOwnedItem 切換目前 Discord session 使用者的已購買狀態
- 移除測試使用者模式文字
- 將資料表提示改為 Discord 個人進度
- 不修改網站版本
- 不修改首頁

## 對應 API

- GET /api/user-owned/list
- POST /api/user-owned/toggle

## 下一步

下一步可新增登入狀態提示，讓未登入使用者知道需要先登入 Discord 才能保存個人進度。
