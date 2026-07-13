import { del, get, put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

import {
  ClanAccessError,
  getClanAccess,
} from "../../../../lib/clanAnnouncementServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function errorResponse(error: unknown) {
  if (error instanceof ClanAccessError) {
    return NextResponse.json(
      { ok: false, message: error.message },
      { status: error.status },
    );
  }

  return NextResponse.json(
    {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "氏族公告圖片服務發生未知錯誤。",
    },
    { status: 500 },
  );
}

function isAllowedPathname(pathname: string, slug: string) {
  return (
    pathname.startsWith(`clan-announcements/${slug}/`) &&
    pathname.length <= 500 &&
    !pathname.includes("..")
  );
}

export async function GET(request: NextRequest) {
  try {
    const access = await getClanAccess(request);
    const pathname = request.nextUrl.searchParams.get("pathname")?.trim() || "";

    if (!pathname || !isAllowedPathname(pathname, access.group.slug)) {
      return NextResponse.json(
        { ok: false, message: "公告圖片路徑不正確。" },
        { status: 400 },
      );
    }

    const rows = await access.sql`
      SELECT status
      FROM clan_announcements
      WHERE group_id = ${access.group.id}
        AND image_pathname = ${pathname}
        AND deleted_at IS NULL
      LIMIT 1
    `;

    const announcement = rows[0] as { status: string } | undefined;

    if (!announcement) {
      return new NextResponse("Not found", { status: 404 });
    }

    if (announcement.status !== "published" && !access.canManage) {
      return new NextResponse("Not found", { status: 404 });
    }

    const result = await get(pathname, {
      access: "private",
      ifNoneMatch: request.headers.get("if-none-match") ?? undefined,
    });

    if (!result) {
      return new NextResponse("Not found", { status: 404 });
    }

    if (result.statusCode === 304) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: result.blob.etag,
          "Cache-Control": "private, no-cache",
        },
      });
    }

    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType || "application/octet-stream",
        "Content-Disposition": "inline",
        "X-Content-Type-Options": "nosniff",
        ETag: result.blob.etag,
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const access = await getClanAccess(request, { requireAdmin: true });
    const formData = await request.formData();
    const value = formData.get("file");

    if (!(value instanceof File)) {
      return NextResponse.json(
        { ok: false, message: "請選擇要上傳的圖片。" },
        { status: 400 },
      );
    }

    const extension = MIME_TO_EXTENSION[value.type];

    if (!extension) {
      return NextResponse.json(
        { ok: false, message: "圖片僅支援 JPG、PNG、WebP 或 GIF。" },
        { status: 400 },
      );
    }

    if (value.size <= 0 || value.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { ok: false, message: "圖片大小必須小於 4 MB。" },
        { status: 400 },
      );
    }

    const pathname = `clan-announcements/${access.group.slug}/${crypto.randomUUID()}.${extension}`;
    const blob = await put(pathname, value, {
      access: "private",
      contentType: value.type,
      addRandomSuffix: false,
      cacheControlMaxAge: 60 * 60 * 24 * 30,
    });

    return NextResponse.json(
      {
        ok: true,
        pathname: blob.pathname,
        contentType: blob.contentType,
      },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const access = await getClanAccess(request, { requireAdmin: true });
    const pathname = request.nextUrl.searchParams.get("pathname")?.trim() || "";

    if (!pathname || !isAllowedPathname(pathname, access.group.slug)) {
      return NextResponse.json(
        { ok: false, message: "公告圖片路徑不正確。" },
        { status: 400 },
      );
    }

    const rows = await access.sql`
      SELECT id
      FROM clan_announcements
      WHERE group_id = ${access.group.id}
        AND image_pathname = ${pathname}
        AND deleted_at IS NULL
      LIMIT 1
    `;

    if (rows.length > 0) {
      return NextResponse.json(
        { ok: false, message: "這張圖片仍被公告使用，不能直接刪除。" },
        { status: 409 },
      );
    }

    await del(pathname);

    return NextResponse.json({ ok: true, message: "未使用的圖片已清除。" });
  } catch (error) {
    return errorResponse(error);
  }
}
