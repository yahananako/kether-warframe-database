# Profile Owned Summary

## 目標

讓 /profile 的個人已購買區塊讀取真正的 Discord 個人資料。

## 新增

components/ProfileOwnedSummary.tsx

## 更新

app/profile/page.tsx

## 功能

- 讀取 /api/user-owned/list
- 顯示個人已購買筆數
- 顯示 Discord 權限狀態
- 未登入時提示重新登入
- 不修改網站版本
