# Home Official News Board Mounted

## 目標

修正首頁尚未掛上 `OfficialNewsBoard` 元件的問題。

## 更新

- `app/page.tsx` 加入 `OfficialNewsBoard` import。
- 官方資訊用途區下方掛上 `<OfficialNewsBoard />`。
- 首頁不再直接使用 `OFFICIAL_NEWS_BOARD` / `OFFICIAL_NEWS_LINKS`。
- 官方公告看板資料改由 `components/OfficialNewsBoard.tsx` 讀取 `/api/official-news`。
- 不修改網站版本號。
