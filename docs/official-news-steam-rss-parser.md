# Official News Steam RSS Parser

## 目標

修正 Steam RSS 已成功取得 HTTP 200，但 parser 無法解析 item 的問題。

## 更新

- 強化 RSS / Atom block 擷取。
- 支援 namespace tag。
- 強化 CDATA 與 HTML 清理。
- 摘要輸出改為短純文字。
- Debug 新增 rawItemCount / rawEntryCount。
- 不修改網站版本號。

## 判定

成功後 `/api/official-news` 應顯示：

- `mode: rss-news-items-source`
- `feedDebug.status: fetched`
- `feedDebug.httpStatus: 200`
- `feedDebug.parser: rss`
- `itemCount: 5`
