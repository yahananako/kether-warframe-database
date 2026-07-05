# DataTable User Owned Client Fix

## 目標

修正 DataTable 只 import helper，但實際仍直接 fetch API 的問題。

## 修正內容

- 將 /api/user-owned/list 直接 fetch 改為 fetchUserOwnedItems()
- 將 /api/user-owned/toggle 直接 fetch 改為 toggleUserOwnedItem()
- 移除 response.ok 舊判斷
- 移除測試使用者提示
- 保留 Discord 個人進度提示
- 不修改網站版本
- 不修改首頁

## 下一步

下一步可新增未登入提示，讓未登入使用者知道需先登入 Discord 才能保存個人進度。
