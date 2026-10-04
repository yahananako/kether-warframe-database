import { NextRequest, NextResponse } from "next/server";
import { evaluateDiscordAccess } from "../../../../lib/auth/discordAccess";
import {
  DISCORD_SESSION_COOKIE_NAME,
  verifyDiscordSessionCookieValue
} from "../../../../lib/auth/discordSession";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const sessionSecret = process.env.SESSION_SECRET;
  const guildId = process.env.DISCORD_GUILD_ID || "";

  if (!sessionSecret || !guildId) {
    return NextResponse.json(
      {
        ok: false,
        authenticated: false,
        error: "Discord guild access or session environment variables are not configured."
      },
      { status: 500 }
    );
  }

  const sessionCookie = request.cookies.get(DISCORD_SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return NextResponse.json(
      { ok: false, authenticated: false, error: "Discord session cookie is missing." },
      { status: 401 }
    );
  }

  const session = verifyDiscordSessionCookieValue(sessionCookie, sessionSecret);

  if (!session) {
    return NextResponse.json(
      { ok: false, authenticated: false, error: "Discord session is invalid or expired." },
      { status: 401 }
    );
  }

  const access = await evaluateDiscordAccess(
    guildId,
    session.guildId,
    session.roleIds,
  );

  return NextResponse.json({
    ok: true,
    authenticated: true,
    discordUser: {
      id: session.sub,
      username: session.username,
      globalName: session.globalName,
      guildNickname: session.guildNickname,
      avatar: session.avatar,
      banner: session.banner,
      accentColor: session.accentColor,
      avatarDecorationAsset: session.avatarDecorationAsset,
      nameplatePalette: session.nameplatePalette
    },
    guildAccess: {
      guildId: session.guildId,
      expectedGuildId: guildId,
      guildIdMatches: access.guildIdMatches,
      authorized: access.authorized,
      roleCheckEnabled: access.roleCheckEnabled,
      hasAllowedRole: access.hasAllowedRole,
      matchedRoleCount: access.matchedRoleIds.length,
      roleIds: session.roleIds
    },
    session: {
      issuedAt: new Date(session.iat * 1000).toISOString(),
      expiresAt: new Date(session.exp * 1000).toISOString()
    }
  });
}
