# Official News Feed Debug

## 目標

替 `/api/official-news` 增加 RSS／Atom 抓取 debug 回傳，確認目前 RSS 抓取失敗原因。

## 新增回傳

- `feedDebug.feedUrl`
- `feedDebug.feedEnabled`
- `feedDebug.status`
- `feedDebug.httpStatus`
- `feedDebug.parser`
- `feedDebug.parsedCount`
- `feedDebug.fallbackReason`
- `feedDebug.errorMessage`
- `feedDebug.xmlPreview`

## 判定

- `status: fetched`：成功抓到 RSS／Atom。
- `status: empty`：有抓到 XML，但解析不到 item / entry。
- `status: error`：fetch 失敗或 HTTP 非 200。
- `status: disabled`：環境變數未設定。
