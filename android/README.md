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

## 版本系列

APP 使用 V4.x.x；V3.x.x 專屬 BOT。V4.0.16 接續舊 Android V3.0.16，versionCode 由 46 增為 47，沿用 tw.kether.app 與既有發布簽章，讓舊安裝可辨識並覆蓋更新。V5.x.x 僅預留，目前尚未規劃。發布成功前保留舊 public/app-update.json，待簽署 APK 可下載後由工作流產生新清單與 SHA256。

版本三碼意義為「產品系列．重大更新．修復與小幅新增」：APP 第一碼固定 V4，第二碼僅在重大更新時變動，第三碼在修復或小幅新增時變動。修復範例為 V4.0.16 → V4.0.17；重大更新為 V4.0.x → V4.1.x，第三碼起算值依站主指定。完整規則見 [專案版本規則](../docs/KETER_BOT_PROJECT_BOUNDARY.md)。
