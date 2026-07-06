# Official News Feed Helper

## 目標

建立官方新聞 RSS／Atom 抓取工具函式前置，讓 `/api/official-news` 後續可以改讀真實官方新聞來源。

## 新增

- `lib/officialNewsFeed.ts`
- `getOfficialNewsItems()`

## 行為

- 如果有設定 `WARFRAME_OFFICIAL_NEWS_FEED_URL`：
  - 嘗試抓取 RSS／Atom。
  - 解析 title、summary、href、publishedAt。
  - 最多回傳 5 筆。
- 如果沒有設定來源，或抓取失敗：
  - 回傳 `OFFICIAL_NEWS_ITEMS` 靜態備援資料。

## API 更新

`/api/official-news` 現在會回傳：

- `items`
- `itemCount`
- `feedEnabled`
- `mode`

其中：

- `static-news-items-source`：使用本地備援資料。
- `rss-news-items-source`：使用 RSS／Atom 抓取資料。

## 注意

- 不修改網站版本號。
- 不修改首頁版面。
- 目前尚未指定正式 RSS URL，避免硬寫不穩定來源。
