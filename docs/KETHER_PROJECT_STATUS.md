# KETHER Warframe Database 專案狀態

更新日期：2026/07/07

## 版本線規則

| 主線 | 版本 |
|---|---|
| 試算表 | v1.x.x |
| 網站 | v2.x.x |
| Discord BOT | v3.x.x |

## 目前狀態

### 網站 v2

- GitHub main 已同步。
- Vercel 公開網站可正常開啟。
- 首頁公開。
- 總覽、資料庫狀態、分類頁、個人進度等內頁需 Discord 登入與權限驗證。
- 目前首頁顯示網站版本：v2.2.1。
- 目前資料量：
  - 總資料數：390
  - 有價格資料：320

### Discord BOT v3

- Discord BOT 已可正常回應測試。
- `/kether` 查價／連結功能已通過實測。
- Warframe Market 查價功能已接入。
- BOT v3 此階段狀態：可用。

### 試算表 v1

- 試算表主線目前先凍結。
- 固定架構：
  - 首頁
  - 總覽
  - 戰甲
  - 主要武器
  - 次要武器
  - 近戰武器
  - 同伴
  - 曲翼
  - MOD 資料庫

## 下一階段優先順序

1. 整理環境變數總表，不重新設定，只確認用途。
2. 整理 Discord BOT v3 指令清單。
3. 整理網站 v2 功能總覽與權限邏輯。
4. 回頭整理試算表 v1 資料來源與追價規則。

## 流程規則

- 功能未確認完成前，不更新版本號。
- 每次更新後需檢查：
  - npm run build
  - git status --short
  - GitHub main
  - Vercel 公開網站
  - 必要時測 Discord BOT
