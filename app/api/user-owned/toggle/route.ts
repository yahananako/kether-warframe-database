import { NextResponse } from "next/server";
import { evaluateDiscordAccess } from "../../../../lib/auth/discordAccess";
import {
  DISCORD_SESSION_COOKIE_NAME,
  verifyDiscordSessionCookieValue
} from "../../../../lib/auth/discordSession";
import { hasServiceRoleKey, upsertOwnedItemForUser } from "../../../../lib/supabaseServer";

export async function POST(request: Request) {
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
      { ok: false, message: "Discord 權限驗證環境變數尚未完整設定。" },
      { status: 500 }
    );
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const sessionCookie = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${DISCORD_SESSION_COOKIE_NAME}=`))
    ?.slice(DISCORD_SESSION_COOKIE_NAME.length + 1);

  if (!sessionCookie) {
    return NextResponse.json(
      {
        ok: false,
        authenticated: false,
        message: "請先登入 Discord 才能保存個人進度。"
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
        message: "目前 Discord 身分組沒有個人進度寫入權限。"
      },
      { status: 403 }
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
        { ok: false, message: "缺少 itemKey。" },
        { status: 400 }
      );
    }

    const result = await upsertOwnedItemForUser({
      discordUserId: session.sub,
      discordUsername: session.globalName || session.username || session.sub,
      avatarUrl: session.avatar,
      guildDiscordId: guildId,
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
