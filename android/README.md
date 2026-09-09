# KETHER Android 自動發布

GitHub Actions 工作流位於 `.github/workflows/release-android.yml`。

## 一次性設定

在 GitHub 專案的 `Settings → Secrets and variables → Actions` 建立以下 Repository secrets：

- `ANDROID_KEYSTORE_BASE64`：既有 KETHER 簽章檔的 Base64 內容
- `ANDROID_KEYSTORE_PASSWORD`：簽章檔密碼
- `ANDROID_KEY_ALIAS`：金鑰別名
- `ANDROID_KEY_PASSWORD`：金鑰密碼

簽章不可更換，否則已安裝的 APP 無法覆蓋更新。

## 發布新版

1. 開啟 GitHub 專案的 `Actions`。
2. 選擇 `發布 KETHER Android`。
3. 按 `Run workflow`。
4. 輸入新版本名稱、遞增的 versionCode 與更新說明。

工作流會自動編譯、簽章、驗證 APK、建立 Release、上傳 APK、更新 `public/app-update.json`，再由 Vercel 部署更新清單。
