# Home Official News API Integration

## 目標

讓首頁官方公告看板開始讀取 `/api/official-news`，作為後續自動新聞摘要的前置整合。

## 更新

- 新增 `components/OfficialNewsBoard.tsx`。
- 首頁 `app/page.tsx` 改用 `<OfficialNewsBoard />`。
- 官方公告看板會優先讀取 `/api/official-news`。
- API 讀取失敗時使用 `data/officialNews.ts` 本地備援資料。
- 新增 API 狀態文字，顯示目前資料來源與更新時間。
- 不修改網站版本號。

## 後續

下一階段可讓 `/api/official-news` 接入官方 RSS／API，首頁不需要再改大段版面。
