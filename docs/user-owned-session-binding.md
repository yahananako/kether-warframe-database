# User Owned Session Binding

## 目標

將個人已購買切換 API 綁定 Discord session，避免所有人共用測試使用者資料。

## 已更新內容

- lib/supabaseServer.ts
- /api/user-owned/toggle

## toggle route 流程

1. 檢查 Supabase service role key
2. 檢查 SESSION_SECRET
3. 讀取 kether_discord_session cookie
4. 驗證 Discord session 簽章與有效期
5. 從 session 取得 Discord user id
6. 從 session 取得 Discord guild id
7. 將已購買狀態寫入該 Discord 使用者自己的資料列

## 保留測試功能

原本的測試寫入函式仍保留，方便 /api/user-owned/test 使用。

## 安全規則

- 不修改網站版本
- 不修改首頁
- 未登入不能寫入 user_owned_items
- session 無效不能寫入 user_owned_items
- access token 不會寫入資料庫
- 只使用 session 內整理後的 Discord user id 與 guild id

## 下一步

下一步可新增個人已購買清單讀取 API，讓前端讀取登入者自己的收藏狀態。
