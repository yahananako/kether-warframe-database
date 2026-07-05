# DataTable Login Required Hint

## 目標

在資料表加入 Discord 未登入提示，讓使用者知道需要先登入 Discord 才能保存個人進度。

## 已更新檔案

components/DataTable.tsx

## 更新內容

- 新增 ownedAuthenticated 狀態
- 未登入時顯示登入提示
- 未登入時顯示登入 Discord 入口
- 未登入時停用已購買切換按鈕
- API 回傳 authenticated false 時更新登入狀態
- 不修改網站版本
- 不修改首頁

## 下一步

下一步可將登入狀態顯示整合到個人頁或頂部導覽。
