# Discord Login Button Fix

## 目標

修正登入頁 Discord OAuth 入口，讓登入按鈕成為真正可點擊的連結。

## 修正內容

- 移除 disabled button
- 改為直接可點擊的 /api/auth/discord/login 連結
- 保留登入頁原本版面
- 不修改網站版本
- 不修改首頁
- 不修改 OAuth callback 流程

## 下一步

下一步可新增 logout route，讓使用者清除 Discord session cookie。
