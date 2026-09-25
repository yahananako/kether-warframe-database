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

    return NextResponse.json(
      {
        ok: true,
        authorized: true,
        level: access.level,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    if (error instanceof VisualAdminAccessError) {
      return NextResponse.json(
        {
          ok: false,
          authorized: false,
          message: error.message,
        },
        {
          status: error.status,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    return NextResponse.json(
      {
        ok: false,
        authorized: false,
        message: "管理權限檢查失敗。",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
