# Permission Verification Status

## 目標

讓 /profile 的「權限驗證」卡片顯示真正的 Discord 權限狀態。

## 新增

- app/api/auth/permission/route.ts
- components/PermissionVerificationStatus.tsx

## 行為

- 檢查 DISCORD_GUILD_ID 是否已設定
- 檢查 SESSION_SECRET 是否已設定
- 顯示 DISCORD_ALLOWED_ROLE_IDS 是否啟用
- 已登入時檢查目前 session 的 guildId 是否符合設定
- 有設定 Role ID 時顯示身分組檢查結果
- 沒有設定 Role ID 時顯示「全群成員可用」

## 版本

不修改網站版本。
