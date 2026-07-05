# User Owned Toggle Discord Session

## 目標

讓資料頁「已購買 / 未購買」寫入時綁定目前登入的 Discord 使用者。

## 原本狀態

- /api/user-owned/list 已經會讀 Discord session。
- /api/user-owned/toggle 仍可能寫到測試使用者或非目前登入者。

## 新狀態

- toggle API 會讀取 kether_discord_session cookie。
- 使用 SESSION_SECRET 驗證 session。
- 使用 session.sub 寫入目前 Discord 使用者的個人已購買資料。
- 未登入時回傳 authenticated: false。
- session 失效時要求重新登入。

## 測試方式

1. 登入 Discord。
2. 進入 /database/warframes。
3. 切換一筆已購買狀態。
4. 重新整理頁面。
5. 狀態應保留在目前 Discord 使用者資料中。
