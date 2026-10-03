# 聯盟成員使用權限

網站 OAuth callback、受保護頁面與 `/api/auth/permission` 共用 `lib/auth/discordAccess.ts`。既有 `DISCORD_ALLOWED_ROLE_IDS` 之外，允許指定 Discord 伺服器中名稱完全等於「聯盟成員」的身分組。

以伺服器端 `DISCORD_BOT_TOKEN` 讀取身分組 ID，快取五分鐘。可設定 `DISCORD_ALLIANCE_ROLE_IDS`（逗號分隔）直接指定穩定 ID。查詢失敗時保留原允許清單；不將錯誤視為授權。未設定既有角色限制時仍維持原來的群組成員使用政策。

Android APP 使用網站的 `/profile` Discord 登入與同一個簽章 session，伺服器部署後即可使用，無須發布新 APK。新增身分組後，既有登入者需重新登入以取得最新身分組。

BOT 的一般查詢指令原本沒有氏族身分組限制，聯盟成員可使用。抽獎管理、氏族驗證及管理後台仍遵循各自權限；Discord 頻道與整合設定的覆寫權限不由此登入政策更動。

驗證：`npm run test:discord-access`、`npm run test:discord-bot`、`npm run build`。線上 `/api/auth/permission` 的 `configured.allianceRoleResolved` 用來確認角色辨識成功，不公開 BOT token。
