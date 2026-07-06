import { NextResponse } from "next/server";

const SITE_VERSION = "v2.2.1";

function hasValue(value: string | undefined) {
  return Boolean(value && value.trim().length > 0);
}

export async function GET() {
  const checks = {
    discordClientId: hasValue(process.env.DISCORD_CLIENT_ID),
    discordClientSecret: hasValue(process.env.DISCORD_CLIENT_SECRET),
    discordBotToken: hasValue(process.env.DISCORD_BOT_TOKEN),
    discordGuildId: hasValue(process.env.DISCORD_GUILD_ID),
    discordAllowedRoleIds: hasValue(process.env.DISCORD_ALLOWED_ROLE_IDS),
    nextAuthSecret: hasValue(process.env.NEXTAUTH_SECRET),
    nextAuthUrl: hasValue(process.env.NEXTAUTH_URL),
  };

  const missing = Object.entries(checks)
    .filter(([, ok]) => !ok)
    .map(([key]) => key);

  return NextResponse.json({
    ok: missing.length === 0,
    version: SITE_VERSION,
    lockedPages: true,
    homepagePublic: true,
    databaseRequiresDiscordLogin: true,
    checks,
    missing,
    note:
      missing.length === 0
        ? "Discord 權限環境變數已設定完成。"
        : "仍有 Discord 權限環境變數缺少，請到 Vercel Environment Variables 補齊。",
    generatedAt: new Date().toISOString(),
  });
}
