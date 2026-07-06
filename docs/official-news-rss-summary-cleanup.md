# Official News RSS Summary Cleanup

## 目標

修正 Steam RSS 成功抓取後，摘要中混入大量 HTML、圖片、iframe 與網址文字的問題。

## 更新

- 新增 HTML entity 解碼。
- 移除 script、style、iframe、img、br 與一般 HTML 標籤。
- 移除多餘網址與空白。
- 將 RSS 摘要限制為短摘要。
- 不修改網站版本號。

## 結果

首頁「最新公告預覽」會顯示較乾淨的新聞摘要文字。
