# KETHER Warframe Database 專案狀態

更新日期：2026/09/18

## 版本線規則

| 主線 | 版本 |
|---|---|
| 試算表 | v1.x.x |
| 網站 | v2.x.x |
| Discord BOT | v3.x.x |
| 行動 APP（Android／iOS） | v3.0.x |

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

### 行動 APP v3.0

- Android 正式版：v3.0.11，維持 GitHub Release APK 與 App 內更新清單。
- iOS 工程：v3.0.11（build 1），支援 iPhone 與 iPad。
- Android 與 iOS 共用本機介面、故事、搜尋資料與圖片；網站、Google Sheets、小希 BOT 與兩個行動平台沿用同一套資料航線。
- iOS 以 TestFlight／App Store 更新，不使用 APK 式自動安裝。
- GitHub Actions 已提供 iOS Simulator 編譯驗證與 TestFlight 簽署上傳流程；正式上傳仍需 Apple Developer／App Store Connect 憑證。

## 下一階段優先順序

1. 整理環境變數總表，不重新設定，只確認用途。
2. 整理 Discord BOT v3 指令清單。
3. 整理網站 v2 功能總覽與權限邏輯。
4. 回頭整理試算表 v1 資料來源與追價規則。

## 流程規則

- 功能未確認完成前，不更新版本號。
- 每次更新後需檢查：
  - npm run build
  - npm run test:android-search
  - npm run test:ios
  - git status --short
  - GitHub main
  - Vercel 公開網站
  - 必要時測 Discord BOT
