# Discord Role Check Optional

## 目標

讓 Discord 身分組檢查變成可選。

## 新規則

- 必須設定 DISCORD_GUILD_ID
- 必須設定 SESSION_SECRET
- DISCORD_ALLOWED_ROLE_IDS 可選

## 行為

- 沒有 DISCORD_ALLOWED_ROLE_IDS：只檢查是不是指定 Discord 伺服器成員。
- 有 DISCORD_ALLOWED_ROLE_IDS：才檢查指定身分組。

## 安全提醒

這代表指定 Discord 伺服器內所有成員都可以登入使用個人化資料庫。
