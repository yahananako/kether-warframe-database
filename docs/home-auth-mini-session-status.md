# Home Auth Mini Session Status

## 目標

將首頁頂部登入按鈕改成會讀取 Discord session 狀態的動態按鈕。

## 新增檔案

components/HomeAuthMini.tsx

## 已更新頁面

app/page.tsx

## 功能

- 呼叫 /api/auth/session
- 未登入時顯示登入
- 已登入時顯示個人
- 已登入時點擊前往 /profile
- 不修改網站版本
- 不修改首頁資料區
- 不修改全域 CSS

## 下一步

下一步可新增登入狀態快取或將登出入口整合到頂部導覽。
