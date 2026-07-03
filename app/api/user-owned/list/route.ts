import { NextResponse } from "next/server";
import { hasServiceRoleKey, listOwnedItems } from "../../../../lib/supabaseServer";

export async function GET() {
  if (!hasServiceRoleKey()) {
    return NextResponse.json(
      {
        ok: false,
        message: "缺少 SUPABASE_SERVICE_ROLE_KEY。請到 Vercel Environment Variables 新增後重新部署。"
      },
      { status: 500 }
    );
  }

  try {
    const result = await listOwnedItems();

    return NextResponse.json({
      ok: true,
      user: {
        id: result.user.id,
        discord_user_id: result.user.discord_user_id,
        discord_username: result.user.discord_username
      },
      guild: {
        id: result.guild.id,
        discord_guild_id: result.guild.discord_guild_id,
        guild_name: result.guild.guild_name,
        subscription_status: result.guild.subscription_status
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
