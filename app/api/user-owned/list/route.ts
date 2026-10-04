import { NextRequest, NextResponse } from "next/server";
import { evaluateDiscordAccess } from "../../../../lib/auth/discordAccess";
import {
  DISCORD_SESSION_COOKIE_NAME,
  verifyDiscordSessionCookieValue
} from "../../../../lib/auth/discordSession";
import { hasServiceRoleKey, listOwnedItemsForUser } from "../../../../lib/supabaseServer";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!hasServiceRoleKey()) {
    return NextResponse.json(
      {
        ok: false,
        message: "個人進度服務暫時無法使用，請稍後再試。"
      },
      { status: 500 }
    );
  }

  const sessionSecret = process.env.SESSION_SECRET;
  const guildId = process.env.DISCORD_GUILD_ID || "";

  if (!sessionSecret || !guildId) {
    return NextResponse.json(
      {
        ok: false,
        message: "Discord 權限驗證環境變數尚未完整設定。"
      },
      { status: 500 }
    );
  }

  const sessionCookie = request.cookies.get(DISCORD_SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return NextResponse.json(
      {
        ok: false,
        authenticated: false,
        message: "請先使用 Discord 登入。"
      },
      { status: 401 }
    );
  }

  const session = verifyDiscordSessionCookieValue(sessionCookie, sessionSecret);

  if (!session) {
    return NextResponse.json(
      {
        ok: false,
        authenticated: false,
        message: "Discord session 已失效，請重新登入。"
      },
      { status: 401 }
    );
  }

  const access = await evaluateDiscordAccess(
    guildId,
    session.guildId,
    session.roleIds,
  );

  if (!access.authorized) {
    return NextResponse.json(
      {
        ok: false,
        authenticated: true,
        authorized: false,
        message: "目前 Discord 身分組沒有個人進度存取權限。"
      },
      { status: 403 }
    );
  }

  try {
    const result = await listOwnedItemsForUser({
      discordUserId: session.sub,
      discordUsername: session.globalName || session.username || session.sub,
      avatarUrl: session.avatar,
      guildDiscordId: guildId
    });

    return NextResponse.json({
      ok: true,
      authenticated: true,
      discordUser: {
        id: session.sub,
        username: session.username,
        globalName: session.globalName
      },
      guild: {
        id: result.guild.id,
        discordGuildId: result.guild.discord_guild_id
      },
      count: result.items.length,
      items: result.items
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "未知錯誤"
      },
      { status: 500 }
    );
  }
}
