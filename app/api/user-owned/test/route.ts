import { NextResponse } from "next/server";
import { hasServiceRoleKey, upsertOwnedItem } from "../../../../lib/supabaseServer";

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
    const result = await upsertOwnedItem({
      itemKey: "ash_prime_set",
      category: "warframes",
      section: "測試資料",
      owned: true
    });

    return NextResponse.json({
      ok: true,
      message: "測試已購買資料寫入成功。",
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
