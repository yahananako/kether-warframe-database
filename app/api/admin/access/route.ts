import { NextRequest, NextResponse } from "next/server";

import {
  requireVisualAdmin,
  VisualAdminAccessError,
} from "../../../../lib/adminVisualAccess";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const access = await requireVisualAdmin(request);

    return NextResponse.json({
      ok: true,
      authorized: true,
      level: access.level,
      isSuperAdmin: access.isSuperAdmin,
    });
  } catch (error) {
    if (error instanceof VisualAdminAccessError) {
      return NextResponse.json(
        {
          ok: false,
          authorized: false,
          message: error.message,
        },
        { status: error.status },
      );
    }

    return NextResponse.json(
      {
        ok: false,
        authorized: false,
        message: error instanceof Error ? error.message : "管理權限檢查失敗。",
      },
      { status: 500 },
    );
  }
}
