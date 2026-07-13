import { del } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

import {
  ClanAccessError,
  getClanAccess,
} from "../../../../../lib/clanAnnouncementServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CATEGORIES = new Set(["important", "event", "general"]);
const STATUSES = new Set(["draft", "published", "archived"]);

type AnnouncementRow = {
  id: string;
  title: string;
  content: string;
  category: string;
  status: string;
  is_pinned: boolean;
  image_pathname: string | null;
  published_at: string | null;
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
          : "氏族公告服務發生未知錯誤。",
    },
    { status: 500 },
  );
}

function isValidImagePathname(pathname: string | null, slug: string) {
  return (
    pathname === null ||
    (pathname.startsWith(`clan-announcements/${slug}/`) &&
      pathname.length <= 500 &&
      !pathname.includes(".."))
  );
}

async function removeBlobQuietly(pathname: string | null) {
  if (!pathname) return;

  try {
    await del(pathname);
  } catch (error) {
    console.error("Failed to remove clan announcement image:", error);
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    if (!UUID_PATTERN.test(id)) {
      return NextResponse.json(
        { ok: false, message: "公告 ID 格式不正確。" },
        { status: 400 },
      );
    }

    const access = await getClanAccess(request, { requireAdmin: true });
    const existingRows = await access.sql`
      SELECT
        id, title, content, category, status,
        is_pinned, image_pathname, published_at
      FROM clan_announcements
      WHERE id = ${id}
        AND group_id = ${access.group.id}
        AND deleted_at IS NULL
      LIMIT 1
    `;

    const existing = existingRows[0] as AnnouncementRow | undefined;

    if (!existing) {
      return NextResponse.json(
        { ok: false, message: "找不到這則氏族公告。" },
        { status: 404 },
      );
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { ok: false, message: "公告資料格式不正確。" },
        { status: 400 },
      );
    }

    const has = (key: string) =>
      Object.prototype.hasOwnProperty.call(body, key);

    const title = has("title")
      ? String(body.title ?? "").trim()
      : existing.title;
    const content = has("content")
      ? String(body.content ?? "").trim()
      : existing.content;
    const category = has("category")
      ? String(body.category)
      : existing.category;
    const status = has("status") ? String(body.status) : existing.status;
    const isPinned = has("isPinned")
      ? body.isPinned === true
      : existing.is_pinned;
    const imagePathname = has("imagePathname")
      ? typeof body.imagePathname === "string" && body.imagePathname.trim()
        ? body.imagePathname.trim()
        : null
      : existing.image_pathname;

    if (!title || title.length > 120) {
      return NextResponse.json(
        { ok: false, message: "公告標題必須為 1 至 120 個字元。" },
        { status: 400 },
      );
    }

    if (!content || content.length > 10000) {
      return NextResponse.json(
        { ok: false, message: "公告內容必須為 1 至 10000 個字元。" },
        { status: 400 },
      );
    }

    if (!CATEGORIES.has(category)) {
      return NextResponse.json(
        { ok: false, message: "公告分類不正確。" },
        { status: 400 },
      );
    }

    if (!STATUSES.has(status)) {
      return NextResponse.json(
        { ok: false, message: "公告發布狀態不正確。" },
        { status: 400 },
      );
    }

    if (!isValidImagePathname(imagePathname, access.group.slug)) {
      return NextResponse.json(
        { ok: false, message: "公告圖片路徑不正確。" },
        { status: 400 },
      );
    }

    let publishedAt = existing.published_at;

    if (status === "published" && !publishedAt) {
      publishedAt = new Date().toISOString();
    }

    if (status === "draft") {
      publishedAt = null;
    }

    const rows = await access.sql`
      UPDATE clan_announcements
      SET
        title = ${title},
        content = ${content},
        category = ${category},
        status = ${status},
        visibility = 'members',
        is_pinned = ${isPinned},
        image_pathname = ${imagePathname},
        published_at = ${publishedAt}
      WHERE id = ${id}
        AND group_id = ${access.group.id}
        AND deleted_at IS NULL
      RETURNING
        id, title, content, category, status,
        is_pinned, author_name, image_pathname,
        published_at, created_at, updated_at
    `;

    if (existing.image_pathname !== imagePathname) {
      await removeBlobQuietly(existing.image_pathname);
    }

    return NextResponse.json({
      ok: true,
      message: "氏族公告已更新。",
      announcement: rows[0],
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    if (!UUID_PATTERN.test(id)) {
      return NextResponse.json(
        { ok: false, message: "公告 ID 格式不正確。" },
        { status: 400 },
      );
    }

    const access = await getClanAccess(request, { requireAdmin: true });
    const rows = await access.sql`
      UPDATE clan_announcements
      SET
        deleted_at = NOW(),
        status = 'archived',
        is_pinned = FALSE
      WHERE id = ${id}
        AND group_id = ${access.group.id}
        AND deleted_at IS NULL
      RETURNING id, image_pathname
    `;

    const deleted = rows[0] as
      | { id: string; image_pathname: string | null }
      | undefined;

    if (!deleted) {
      return NextResponse.json(
        { ok: false, message: "找不到這則氏族公告。" },
        { status: 404 },
      );
    }

    await removeBlobQuietly(deleted.image_pathname);

    return NextResponse.json({
      ok: true,
      message: "氏族公告已刪除。",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
