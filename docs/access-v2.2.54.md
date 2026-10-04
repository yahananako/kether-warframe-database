# KETHER Discord 權限強化 · 2.2.54

本版修正「聯盟成員」在真實 Discord 登入後仍可能被擋，以及不同 API 對同一個 session 給出不同授權結果的問題。

## 修正

- 聯盟角色可由 `DISCORD_ALLIANCE_ROLE_IDS` 固定設定，或由 `DISCORD_BOT_TOKEN` 從 Guild roles 解析名稱「聯盟成員」。
- Discord roles 查詢成功後保留最近有效 ID；短暫 API 失敗時可使用快取。
- 已要求角色驗證但角色無法解析時採拒絕存取，避免意外全群放行。
- `/api/auth/session` 重新套用目前 Guild / Role 政策。
- 個人收藏讀取與寫入 API 重新驗證 Guild / Role，避免只憑舊 session 存取。
- 個人頁恢復權限診斷，顯示聯盟角色是否已辨識，以及來源為固定 Role ID、Discord 即時解析或最近快取。
- 未授權的已登入使用者可從個人頁直接重新驗證 Discord，取得最新身分組 session。

## 驗證

- `npm run test:discord-access`
- `npm run build`
- Vercel Preview / Production deployment status
