# Home Personal Progress Mounted

## 目標

修正首頁只有 import HomePersonalProgress，但沒有真正掛到數據區的問題。

## 更新

- 首頁數據區保留「總資料數」與「有價格資料」。
- 在「有價格資料」後插入 HomePersonalProgress。
- HomePersonalProgress 使用 totalRows / totalOwned / totalCompletion 作為 fallback。
- 不修改網站版本。
