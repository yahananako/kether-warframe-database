# Data Table Owned Total Message

## 目標

讓資料頁切換「已購買 / 未購買」後，直接顯示目前 Discord 個人進度總筆數。

## 行為

- 切換成功後重新讀取 /api/user-owned/list。
- 更新本頁 ownedMap。
- 顯示「個人進度 X 筆」。
- 不修改網站版本。
