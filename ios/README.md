# KETHER iOS

KETHER iOS 是 Android App 的原生 iPhone／iPad 版本。兩個平台共用 `android/assets` 與 `public` 的介面、故事、資料索引及圖片；iOS 不另外複製一套資料庫，避免網站、Google Sheets、小希 BOT 與行動 App 內容漂移。

## 已接通功能

- 本機首頁、搜尋、故事書、戰甲／武器／MOD／同伴／曲翼資料。
- `WKWebView` 原生橋接：KETHER 網站頁面、Google Sheets、Warframe 世界狀態與 Warframe Market。
- Discord OAuth 登入、登入 Cookie 共用、頭像同步與登出。
- iPhone 安全區、iPad 旋轉、下拉重新整理、外部交易連結。
- 無網路時仍可開啟已打包的本機介面與資料。
- Apple Privacy Manifest；Xcode 建置時會由氏族 Logo 生成無透明色的 1024 × 1024 App Icon 與啟動畫面圖像。

## 本機建置

需要 macOS 與 Xcode 26 或更新版本。開啟 `ios/KETHER.xcodeproj`，選擇 `KETHER` Scheme 與模擬器後執行即可。Xcode 建置階段會呼叫 `ios/scripts/copy-web-assets.sh`，把共用行動版資產放進 App Bundle。

沒有 Mac 也可以由 GitHub Actions 的「驗證 KETHER iOS」產生 iOS Simulator `.app` 測試成品。

## TestFlight／App Store 發布

Apple 不允許 App 像 APK 一樣自行下載覆蓋；正式更新由 TestFlight 或 App Store 管理。發布前需要：

1. 有效的 Apple Developer Program 帳號。
2. 在 Apple Developer 與 App Store Connect 建立 iOS App，Bundle ID 預設為 `tw.kether.app.ios`。
3. 建立 Apple Distribution `.p12`、App Store provisioning profile、App Store Connect API Key。
4. 在 GitHub Repository Secrets 設定：

| Secret | 內容 |
|---|---|
| `APPLE_TEAM_ID` | Apple Developer Team ID |
| `IOS_DISTRIBUTION_CERTIFICATE_BASE64` | `.p12` 的 Base64 |
| `IOS_CERTIFICATE_PASSWORD` | `.p12` 密碼 |
| `IOS_PROVISIONING_PROFILE_BASE64` | `.mobileprovision` 的 Base64 |
| `APP_STORE_CONNECT_API_KEY_ID` | App Store Connect API Key ID |
| `APP_STORE_CONNECT_ISSUER_ID` | Issuer ID |
| `APP_STORE_CONNECT_API_KEY_P8_BASE64` | `AuthKey_*.p8` 的 Base64 |

如果實際 Bundle ID 不同，新增 Repository Variable `IOS_BUNDLE_ID`。完成後在 Actions 執行「發布 KETHER iOS 至 TestFlight」；工作流會封存、簽署、驗證 IPA 並上傳 App Store Connect。

## 版本

- 顯示版本：`3.0.11`
- iOS 首次建置號：`1`
- 發布值記錄於 `ios/release-request.json`。

功能完成且兩端共用資產驗證通過後，再同步調整 Android 與 iOS 的顯示版本。
