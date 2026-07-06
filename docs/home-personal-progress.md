# Home Personal Progress

## 目標

讓首頁數據區的已購買與完成度支援 Discord 個人進度。

## 更新

- 新增 components/HomePersonalProgress.tsx
- 首頁數據區改用 HomePersonalProgress
- 已登入時讀取 /api/user-owned/list
- 未登入時保留 Google Sheets 表格統計作為 fallback
- 不修改網站版本

## 顯示

已登入：
- 個人已購買
- 個人完成度

未登入：
- 表格已購買
- 表格完成度
