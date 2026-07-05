import { NextRequest, NextResponse } from "next/server";
import {
  DISCORD_SESSION_COOKIE_NAME,
  verifyDiscordSessionCookieValue
} from "../../../../lib/auth/discordSession";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const guildId = process.env.DISCORD_GUILD_ID || "";
  const sessionSecret = process.env.SESSION_SECRET || "";
  const allowedRoleIds = (process.env.DISCORD_ALLOWED_ROLE_IDS || "")
    .split(",")
    .map((roleId) => roleId.trim())
    .filter(Boolean);

  const roleCheckEnabled = allowedRoleIds.length > 0;

  if (!guildId || !sessionSecret) {
    return NextResponse.json({
      ok: false,
      authenticated: false,
      authorized: false,
      message: "Discord 權限驗證環境變數尚未完整設定。",
      configured: {
        guildIdConfigured: Boolean(guildId),
        sessionSecretConfigured: Boolean(sessionSecret),
        roleCheckEnabled,
        allowedRoleCount: allowedRoleIds.length
      },
      required: ["DISCORD_GUILD_ID", "SESSION_SECRET"],
      optional: ["DISCORD_ALLOWED_ROLE_IDS"]
    });
  }

  const sessionCookie = request.cookies.get(DISCORD_SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return NextResponse.json({
      ok: true,
      authenticated: false,
      authorized: false,
      message: "尚未登入 Discord。",
      configured: {
        guildIdConfigured: true,
        sessionSecretConfigured: true,
        roleCheckEnabled,
        allowedRoleCount: allowedRoleIds.length
      },
      guildAccess: null
    });
  }

  const session = verifyDiscordSessionCookieValue(sessionCookie, sessionSecret);

  if (!session) {
    return NextResponse.json({
      ok: true,
      authenticated: false,
      authorized: false,
      message: "Discord session 已失效，請重新登入。",
      configured: {
        guildIdConfigured: true,
        sessionSecretConfigured: true,
        roleCheckEnabled,
        allowedRoleCount: allowedRoleIds.length
      },
      guildAccess: null
    });
  }

  const guildIdMatches = session.guildId === guildId;
  const matchedRoleIds = roleCheckEnabled
    ? session.roleIds.filter((roleId) => allowedRoleIds.includes(roleId))
    : [];

  const hasAllowedRole = !roleCheckEnabled || matchedRoleIds.length > 0;
  const authorized = guildIdMatches && hasAllowedRole;

  return NextResponse.json({
    ok: true,
    authenticated: true,
    authorized,
    message: authorized ? "Discord 權限驗證已通過。" : "Discord 權限驗證未通過。",
    configured: {
      guildIdConfigured: true,
      sessionSecretConfigured: true,
      roleCheckEnabled,
      allowedRoleCount: allowedRoleIds.length
    },
    discordUser: {
      id: session.sub,
      username: session.username,
      globalName: session.globalName
    },
    guildAccess: {
      expectedGuildId: guildId,
      sessionGuildId: session.guildId,
      guildIdMatches,
      roleCheckEnabled,
      hasAllowedRole,
      authorized,
      roleCount: session.roleIds.length,
      matchedRoleCount: matchedRoleIds.length
    }
  });
}
