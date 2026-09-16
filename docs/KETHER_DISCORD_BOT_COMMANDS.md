# KETHER Discord BOT v3 指令清單

更新日期：2026/09/15

## 目前狀態

Discord BOT v3.5.8 已完成程式測試與 Discord 指令格式驗證。

目前已確認：
- `/kether` 可查網站入口，也會在找不到網站入口時嘗試 Warframe Market 查價。
- `/查價`、戰甲與武器取得結果會顯示可直接點擊的交易網站按鈕。
- `/戰甲名片` Slash Command 已接上名片 handler，不再落入「未知指令」。
- `/氏族驗證` 與 `/抽獎` 已加入處理程式、資料表與註冊腳本。
- 正式群上線後仍需用真實截圖與實際身分組階層做一次驗收。

## 指令 / 功能清單

| 功能 | 類型 | 用途 | 狀態 |
|---|---|---|---|
| `/說明` | Slash Command | 顯示 BOT 使用說明 | 已建立 |
| `/kether keyword: 首頁` | Slash Command | 回覆 KETHER 網站首頁 / 連結 | 已測正常 |
| `/kether 關鍵字:<物品名稱>` | Slash Command | 找不到網站入口時查 Warframe Market | 已完成 |
| `/查價 物品:<名稱>` | Slash Command | 顯示即時白金價格與交易網站按鈕 | 已完成 |
| `查看 Warframe 名片` | User Command | 查看指定成員的 Warframe 名片 | 已建立，手機版可能不好叫出 |
| `/戰甲名片 成員:@成員` | Slash Command | 手機可用的 Warframe 名片查詢 | handler 已修復 |
| `/氏族驗證 玩家代號:<ID> 個人簡介截圖:<圖片>` | Slash Command | 自動核對氏族資料並更換身分組 | 已完成 |
| `/抽獎 開始 獎品:<文字> 中獎名額:<1–10>` | Slash Command | 建立可按按鈕參加的抽獎 | 已完成 |
| `/抽獎 結束 [抽獎編號]` | Slash Command | 關閉參加並安全隨機抽出中獎者 | 已完成 |
| `/抽獎 重抽 [抽獎編號]` | Slash Command | 優先排除前次中獎者重新抽選 | 已完成 |
| `/官方資料 玩家代號:<AccountID> 平台:<平台>` | Slash Command | 測試讀取 Warframe 官方 Profile JSON | 已建立 |

## 氏族自動驗證

驗證流程：

1. 新成員在指定驗證頻道使用 `/氏族驗證`。
2. 上傳至少 640×360、同時看得到玩家 ID、`KETHER OF PARADISO` 與氏族徽章的完整個人簡介截圖。
3. BOT 以 OCR 核對玩家 ID 與氏族名稱，再用本地影像比對核對氏族徽章。
4. 通過後先授予「天使」，再移除「凡人」；若第二步失敗會撤回已授予的角色，避免半完成狀態。
5. 驗證只保存結果、附件 ID 與不可逆雜湊，不保存完整 OCR 文字或圖片。

同一玩家 ID 或同一張截圖不能替不同 Discord 成員重複驗證。

## 抽獎功能

- 只有具有「管理伺服器」權限，或位於 `DISCORD_GIVEAWAY_MANAGER_ROLE_IDS` 的成員可以開始、結束與重抽。
- 每個頻道同時只能有一場進行中的抽獎。
- 每位成員只能參加一次；名單保存於 Neon PostgreSQL。
- 使用 Node.js `crypto.randomInt` 洗牌抽選，不依賴可預測的 `Math.random`。

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
| `scripts/register-warframe-card-command.mjs` | 同步全部 Guild Slash / User Commands | 已更新 |
| `scripts/test-discord-bot.ts` | 驗證徽章、抽獎、交易按鈕與名片 handler | 已新增 |

## npm scripts

| 指令 | 用途 |
|---|---|
| `npm run build` | 檢查網站是否可編譯 |
| `npm run discord:validate` | 離線檢查 Discord 指令格式 |
| `npm run test:discord-bot` | 執行小希 BOT 核心測試 |
| `npm run discord:register-card` | 使用現有 Application / Bot 同步全部 Guild 指令 |

## 下一階段規劃

1. 在正式群以一張真實 KETHER 個人簡介驗證 OCR 與徽章門檻。
2. 確認小希 BOT 的角色階層高於「天使」與「凡人」。
3. 後續評估 `/bind-warframe`，將名片資料改接資料庫，避免硬寫在程式裡。
