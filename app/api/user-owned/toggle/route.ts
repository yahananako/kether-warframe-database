import { NextRequest, NextResponse } from "next/server";
import {
  DISCORD_SESSION_COOKIE_NAME,
  verifyDiscordSessionCookieValue
} from "../../../../lib/auth/discordSession";
import { hasServiceRoleKey, upsertOwnedItemForUser } from "../../../../lib/supabaseServer";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!hasServiceRoleKey()) {
    return NextResponse.json(
      {
        ok: false,
        message: "缺少 SUPABASE_SERVICE_ROLE_KEY。請到 Vercel Environment Variables 新增後重新部署。"
      },
      { status: 500 }
    );
  }

  const sessionSecret = process.env.SESSION_SECRET;

  if (!sessionSecret) {
    return NextResponse.json(
      {
        ok: false,
        message: "缺少 SESSION_SECRET。"
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

  try {
    const body = await request.json();

    const itemKey = String(body.itemKey || "").trim();
    const category = String(body.category || "unknown").trim();
    const section = String(body.section || "未分類").trim();
    const owned = Boolean(body.owned);

    if (!itemKey) {
      return NextResponse.json(
        {
          ok: false,
          message: "缺少 itemKey。"
        },
        { status: 400 }
      );
    }

    const result = await upsertOwnedItemForUser({
      discordUserId: session.sub,
      discordUsername: session.globalName || session.username || session.sub,
      avatarUrl: session.avatar,
      guildDiscordId: session.guildId,
      itemKey,
      category,
      section,
      owned
    });

    return NextResponse.json({
      ok: true,
      authenticated: true,
      message: owned ? "已標記為已購買。" : "已標記為未購買。",
      discordUser: {
        id: session.sub,
        username: session.username,
        globalName: session.globalName
      },
      guild: {
        id: result.guild.id,
        discordGuildId: result.guild.discord_guild_id
      },
      item: result.item
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
