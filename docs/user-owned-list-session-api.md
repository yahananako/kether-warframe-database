# User Owned List Session API

## 目標

新增個人已購買清單讀取 API，讓前端可以讀取目前 Discord 登入者自己的收藏狀態。

## 已新增路由

/api/user-owned/list

## list route 流程

1. 檢查 Supabase service role key
2. 檢查 SESSION_SECRET
3. 讀取 kether_discord_session cookie
4. 驗證 Discord session 簽章與有效期
5. 從 session 取得 Discord user id
6. 從 session 取得 Discord guild id
7. 讀取該 Discord 使用者自己的 user_owned_items

## 回傳資料

- authenticated
- discordUser
- guild
- count
- items

## 安全規則

- 不修改網站版本
- 不修改首頁
- 未登入不能讀取 user_owned_items
- session 無效不能讀取 user_owned_items
- 只讀取目前 Discord 使用者自己的資料

## 下一步

下一步可將前端資料頁的已購買狀態讀取改接 /api/user-owned/list。
