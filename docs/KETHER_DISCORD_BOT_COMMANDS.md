# KETHER Discord BOT v3 指令清單

更新日期：2026/07/07

## 目前狀態

Discord BOT v3 已通過實測。

目前已確認：
- `/kether` 可正常回應。
- Warframe Market 查價功能已接入。
- 網站連結回覆功能可用。
- Warframe 名片功能已加入程式與註冊腳本。
- BOT 工具腳本已整理進 `scripts/`。

## 指令 / 功能清單

| 功能 | 類型 | 用途 | 狀態 |
|---|---|---|---|
| `/help` | Slash Command | 顯示 BOT 使用說明 | 已建立 |
| `/kether keyword: 首頁` | Slash Command | 回覆 KETHER 網站首頁 / 連結 | 已測正常 |
| `/kether keyword: <物品名稱>` | Slash Command | 查詢 Warframe Market 交易價格 | 已測正常 |
| `/kether keyword: <英文名稱> 滿等` | Slash Command | 查詢滿等 MOD / 物品價格 | 已測正常 |
| `查看 Warframe 名片` | User Command | 查看指定成員的 Warframe 名片 | 已加入程式，需註冊後測試 |

## Warframe 名片功能

目前名片資料來源：
- `app/api/discord/warframeProfiles.ts`
- `app/api/discord/route.ts` 內的 Warframe profile/card handler

目前名片欄位包含：
- Warframe ID
- 平台
- 階位
- 遊玩時長
- 白金
- 主戰甲
- 氏族職位
- 備註
- 更新日期

備註：
- 白金欄位可設定公開或本人可見。
- 目前仍是硬寫資料。
- 後續可改成 Supabase 或網站個人資料綁定。
- 未來可新增 `/bind-warframe` 讓成員自行綁定資料。

## 工具腳本

| 腳本 | 用途 | 狀態 |
|---|---|---|
| `scripts/check-discord-env.mjs` | 檢查 Discord env 是否齊全 | 保留 |
| `scripts/check-discord-guild.mjs` | 檢查 Discord Guild / Bot 狀態 | 保留 |
| `scripts/make-discord-invite-url.mjs` | 產生 Bot 邀請網址 | 保留 |
| `scripts/register-warframe-card-command.mjs` | 註冊 Warframe 名片 User Command | 保留 |

## npm scripts

| 指令 | 用途 |
|---|---|
| `npm run build` | 檢查網站是否可編譯 |
| `npm run discord:register-card` | 註冊 Warframe 名片 User Command |

## 下一階段規劃

1. 測試 `查看 Warframe 名片` User Command。
2. 若測試正常，將 BOT v3 名片功能列為通過。
3. 後續再評估是否新增 `/bind-warframe`。
4. 名片資料未來可改接 Supabase，避免硬寫在程式裡。
