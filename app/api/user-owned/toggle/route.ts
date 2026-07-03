import { NextResponse } from "next/server";
import { hasServiceRoleKey, upsertOwnedItem } from "../../../../lib/supabaseServer";

export async function POST(request: Request) {
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

    const result = await upsertOwnedItem({
      itemKey,
      category,
      section,
      owned
    });

    return NextResponse.json({
      ok: true,
      message: owned ? "已標記為已購買。" : "已標記為未購買。",
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
