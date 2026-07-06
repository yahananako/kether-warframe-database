# Logout Redirect Home

## 目標

修正 /api/auth/logout 登出後停在 JSON 畫面的問題。

## 更新

- 登出時清除 Discord session cookie。
- 同時清除 Discord OAuth state cookie。
- 登出完成後直接 redirect 到首頁 /。
- 不修改網站版本。

## 測試

點 /profile 的「登出 Discord」後，應自動回到首頁。
