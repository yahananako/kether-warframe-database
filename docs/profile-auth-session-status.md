# Profile Auth Session Status

## 目標

在個人頁顯示 Discord session 狀態，讓使用者知道目前是否已登入 Discord。

## 新增檔案

components/AuthSessionStatus.tsx

## 已更新頁面

app/profile/page.tsx

## 功能

- 呼叫 /api/auth/session
- 顯示未登入提示
- 顯示 Discord 使用者名稱
- 顯示 Guild 授權狀態
- 顯示 Session 到期時間
- 提供登入入口
- 提供登出入口

## 安全規則

- 不修改網站版本
- 不修改首頁
- 不接觸 Discord access token
- 只讀取 /api/auth/session 回傳的整理後資料

## 下一步

下一步可把頂部登入按鈕依 session 狀態改成登入 / 個人頁 / 登出。
