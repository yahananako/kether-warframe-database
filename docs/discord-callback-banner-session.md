# Discord Callback Banner Session

## 目標

讓 Discord OAuth callback 把使用者版圖與主題資料寫進 session。

## 修正

- DiscordUserResponse 加入 banner
- DiscordUserResponse 加入 accent_color
- DiscordUserResponse 加入 avatar_decoration_data
- DiscordUserResponse 加入 collectibles.nameplate
- buildDiscordSessionPayload 寫入 banner / accentColor / avatarDecorationAsset / nameplatePalette

## 注意

使用者需要登出 Discord session 後重新登入，新的 cookie 才會帶入 banner 與主題資料。
