# KETHER 資料來源策略

更新日期：2026/07/08

## 結論

官方玩家 Profile 自動讀取已完成測試，但目前不可作為正式名片來源。

測試結果：
- /warframe-profile Discord 指令可正常呼叫。
- Discord → Vercel → BOT route 正常。
- Warframe 官方 Profile 多平台端點回傳 403。
- warframe.com/api/user-data 目前只提供 country_code 與 user_id，不足以產生完整玩家名片。

因此後續改走：

Market + Discord + 靜態資料混合方案。

## 方案定位

本方案不抓官方玩家 Profile，不自建完整名片資料庫。

資料來源分工：

| 來源 | 用途 | 是否保存個人資料 |
|---|---|---|
| Discord | 成員、群組、身分組、使用者 ID | 只用於群組功能 |
| Warframe Market | 交易資料、物品價格、公開 Market 使用者資料 | 不保存交易明細 |
| KETHER 靜態資料 | 中文名、英文名、分類、用途、圖示、備註 | 保存遊戲資料 |
| Warframe 官方 Profile | 已測試失敗，暫不使用 | 不使用 |

## 可做功能

### 1. Market 查價

指令：
/market-price item:<物品名稱>

用途：
- 查 Warframe Market 價格。
- 顯示最低賣價、買單、賣單、交易連結。
- 可與 KETHER 中文資料庫整合。

### 2. 成員 Market 對照

指令：
/link-market username:<Warframe Market 名稱> platform:<平台>

只綁定：
- Discord ID
- Warframe Market 名稱
- 平台

不保存：
- MR
- 遊玩時間
- 官方 Profile
- 裝備統計

### 3. Market 成員卡

指令：
/market-card user:@成員

用途：
- 顯示成員綁定的 Warframe Market 名稱。
- 顯示平台。
- 顯示 Market 連結。
- 後續可加常用查價、交易備註。

### 4. 靜態資料補強

KETHER 可用既有資料庫補：
- 中文名
- 英文名
- 分類
- 用途
- 交易備註
- 圖示或外部連結

## 不做項目

目前不做：
- 自動讀官方玩家 MR。
- 自動讀官方氏族。
- 自動讀遊玩時間。
- 自動讀主戰甲。
- 修改 Discord 原生成員列表。
- 保存完整玩家名片資料。

## 後續階段

C-1：建立資料來源策略文件。  
C-2：整理 Warframe Market 指令設計。  
C-3：新增 /market-price 或整合到 /kether。  
C-4：設計 /link-market 最小綁定。  
C-5：建立 /market-card Discord 成員 Market 卡。
