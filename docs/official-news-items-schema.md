# Official News Items Schema

## 目標

替官方新聞 API 建立最新新聞列表資料格式，為後續接入 RSS／API 做前置準備。

## 更新

- `data/officialNews.ts` 新增 `OfficialNewsItem` 型別。
- 新增 `OFFICIAL_NEWS_ITEMS` 靜態佔位資料。
- `/api/official-news` 回傳 `items` 與 `itemCount`。
- `OfficialNewsBoard` 顯示「最新公告預覽」。
- 首頁仍保留本地備援資料。
- 不修改網站版本號。

## 後續

下一階段可將 `OFFICIAL_NEWS_ITEMS` 改為由 RSS／API 產生：

- title
- summary
- publishedAt
- category
- href
- source
