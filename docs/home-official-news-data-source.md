# Home Official News Data Source

## 目標

將首頁官方公告看板改成資料驅動，為後續 RSS／API 自動新聞摘要做前置整理。

## 更新

- 新增 `data/officialNews.ts`。
- 將官方公告看板文案集中到 `OFFICIAL_NEWS_BOARD`。
- 將官方新聞、更新紀錄、官方論壇三個入口集中到 `OFFICIAL_NEWS_LINKS`。
- 首頁改用 `.map()` 渲染官方公告看板卡片。
- 不修改網站版本號。

## 後續

下一階段可新增 RSS／API 抓取層，例如：

- `app/api/official-news/route.ts`
- `lib/officialNewsFeed.ts`
- 首頁顯示最新公告時間與摘要
