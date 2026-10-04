import { NextRequest, NextResponse } from "next/server";
import {
  evaluateDiscordAccess,
  getDiscordAccessPolicy
} from "../../../../lib/auth/discordAccess";
import {
  DISCORD_SESSION_COOKIE_NAME,
  verifyDiscordSessionCookieValue
} from "../../../../lib/auth/discordSession";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const guildId = process.env.DISCORD_GUILD_ID || "";
  const sessionSecret = process.env.SESSION_SECRET || "";
  const policy = await getDiscordAccessPolicy(guildId);
  const allianceAccess = {
    allianceRoleName: policy.allianceRoleName,
    allianceRoleResolved: policy.allianceRoleResolved,
    allianceRoleSource: policy.allianceRoleSource,
    allianceRoleCheckRequested: policy.allianceRoleCheckRequested,
  };

  if (!guildId || !sessionSecret) {
    return NextResponse.json({
      ok: false,
      authenticated: false,
      authorized: false,
      message: "Discord 權限驗證環境變數尚未完整設定。",
      configured: {
        ...allianceAccess,
        guildIdConfigured: Boolean(guildId),
        sessionSecretConfigured: Boolean(sessionSecret),
        roleCheckEnabled: policy.roleCheckEnabled,
        allowedRoleCount: policy.allowedRoleIds.length
      },
      required: ["DISCORD_GUILD_ID", "SESSION_SECRET"],
      optional: ["DISCORD_ALLOWED_ROLE_IDS", "DISCORD_ALLIANCE_ROLE_IDS"]
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
        ...allianceAccess,
        guildIdConfigured: true,
        sessionSecretConfigured: true,
        roleCheckEnabled: policy.roleCheckEnabled,
        allowedRoleCount: policy.allowedRoleIds.length
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
        ...allianceAccess,
        guildIdConfigured: true,
        sessionSecretConfigured: true,
        roleCheckEnabled: policy.roleCheckEnabled,
        allowedRoleCount: policy.allowedRoleIds.length
      },
      guildAccess: null
    });
  }

  const access = await evaluateDiscordAccess(
    guildId,
    session.guildId,
    session.roleIds,
  );

  return NextResponse.json({
    ok: true,
    authenticated: true,
    authorized: access.authorized,
    message: access.authorized
      ? "Discord 權限驗證已通過。"
      : "Discord 權限驗證未通過，請重新登入或檢查聯盟成員身分組。",
    configured: {
      allianceRoleName: access.allianceRoleName,
      allianceRoleResolved: access.allianceRoleResolved,
      allianceRoleSource: access.allianceRoleSource,
      allianceRoleCheckRequested: access.allianceRoleCheckRequested,
      guildIdConfigured: true,
      sessionSecretConfigured: true,
      roleCheckEnabled: access.roleCheckEnabled,
      allowedRoleCount: access.allowedRoleIds.length
    },
    discordUser: {
      id: session.sub,
      username: session.username,
      globalName: session.globalName
    },
    guildAccess: {
      expectedGuildId: guildId,
      sessionGuildId: session.guildId,
      guildIdMatches: access.guildIdMatches,
      roleCheckEnabled: access.roleCheckEnabled,
      hasAllowedRole: access.hasAllowedRole,
      authorized: access.authorized,
      roleCount: session.roleIds.length,
      matchedRoleCount: access.matchedRoleIds.length
    }
  });
}
