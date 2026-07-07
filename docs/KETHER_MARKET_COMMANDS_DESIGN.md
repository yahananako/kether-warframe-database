# KETHER Warframe Market 指令設計

更新日期：2026/07/08

## 目標

C-2 階段目標是設計 Discord BOT v3 的 Warframe Market 指令。

本階段只做設計，不實作功能。

## 資料來源定位

Warframe Market 適合用於：
- 查交易物品
- 查買單與賣單
- 查價格區間
- 產生交易連結

Warframe Market 不適合用於：
- 查玩家 Mastery Rank
- 查玩家官方氏族
- 查遊玩時間
- 查官方裝備統計

## 指令一：/market-price

格式：

/market-price item:<物品名稱> platform:<平台>

用途：
- 查指定物品的 Warframe Market 價格。
- 支援英文名稱優先。
- 後續可整合 KETHER 中文資料庫，把中文名稱轉成英文 url_name。

輸出內容：
- 物品名稱
- 平台
- 最低賣價
- 最高買價
- 線上賣家數
- 線上買家數
- Warframe Market 連結
- 更新時間

初版平台：
- pc
- ps4
- xbox
- switch

## 指令二：/market-card

格式：

/market-card user:@成員

用途：
- 查 Discord 成員綁定的 Warframe Market 名稱。
- 顯示 Market 連結。
- 不顯示官方 Profile 資料。
- 不顯示 MR、氏族、遊玩時間。

輸出內容：
- Discord 成員
- Warframe Market 名稱
- 平台
- Market 個人頁連結

## 指令三：/link-market

格式：

/link-market username:<Warframe Market 名稱> platform:<平台>

用途：
- 建立 Discord 成員與 Warframe Market 名稱的最小綁定。

只保存：
- Discord Guild ID
- Discord User ID
- Warframe Market username
- platform
- linkedAt

不保存：
- MR
- 遊玩時間
- 官方 Profile
- 裝備統計
- 交易明細

## C-3 實作順序

第一步：
- 先做 /market-price。
- 不做資料庫。
- 使用使用者輸入的英文物品名稱查價。

第二步：
- 加入 KETHER 中文名稱對照。
- 例如 Prime 持久力 對應 Primed Continuity。

第三步：
- 做 /link-market 最小綁定。
- 初期可先放在程式假資料或暫時檔案。
- 正式版再接 Supabase。

第四步：
- 做 /market-card。
- 只顯示 Market 名稱與平台，不做官方玩家名片。

## 初版不做項目

初版不做：
- 自動讀官方玩家 Profile。
- 自動讀玩家 MR。
- 自動讀官方氏族。
- 自動同步 Discord 暱稱。
- 自動同步 Discord 身分組。
- 寫入或修改 Warframe Market 訂單。

## 安全原則

- 不要求 Warframe Market 密碼。
- 不要求 Warframe 官網登入資料。
- 不保存完整玩家 Profile。
- 不保存交易明細。
- 只讀公開價格與公開市場頁面資料。
