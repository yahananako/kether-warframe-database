import { NextRequest, NextResponse } from "next/server";

import {
  ClanAccessError,
  getClanAccess
} from "../../../../lib/clanAnnouncementServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_CATEGORIES = new Set([
  "important",
  "event",
  "general"
]);

const ALLOWED_VISIBILITIES = new Set([
  "public",
  "members"
]);

const ALLOWED_CREATE_STATUSES = new Set([
  "draft",
  "published"
]);

function errorResponse(error: unknown) {
  if (error instanceof ClanAccessError) {
    return NextResponse.json(
      {
        ok: false,
        message: error.message
      },
      { status: error.status }
    );
  }

  return NextResponse.json(
    {
      ok: false,
      message: error instanceof Error
        ? error.message
        : "氏族公告服務發生未知錯誤。"
    },
    { status: 500 }
  );
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const managementMode =
      url.searchParams.get("manage") === "1";

    const access = await getClanAccess(request, {
      requireAdmin: managementMode
    });

    let announcements;

    if (managementMode) {
      announcements = await access.sql`
        SELECT
          id,
          title,
          content,
          category,
          status,
          visibility,
          is_pinned,
          author_name,
          published_at,
          created_at,
          updated_at
        FROM clan_announcements
        WHERE group_id = ${access.group.id}
          AND deleted_at IS NULL
        ORDER BY
          is_pinned DESC,
          COALESCE(published_at, created_at) DESC
      `;
    } else if (access.session) {
      announcements = await access.sql`
        SELECT
          id,
          title,
          content,
          category,
          status,
          visibility,
          is_pinned,
          author_name,
          published_at,
          created_at,
          updated_at
        FROM clan_announcements
        WHERE group_id = ${access.group.id}
          AND status = 'published'
          AND deleted_at IS NULL
        ORDER BY
          is_pinned DESC,
          COALESCE(published_at, created_at) DESC
      `;
    } else {
      announcements = await access.sql`
        SELECT
          id,
          title,
          content,
          category,
          status,
          visibility,
          is_pinned,
          author_name,
          published_at,
          created_at,
          updated_at
        FROM clan_announcements
        WHERE group_id = ${access.group.id}
          AND status = 'published'
          AND visibility = 'public'
          AND deleted_at IS NULL
        ORDER BY
          is_pinned DESC,
          COALESCE(published_at, created_at) DESC
      `;
    }

    return NextResponse.json({
      ok: true,
      authenticated: Boolean(access.session),
      canManage: access.canManage,
      group: {
        slug: access.group.slug,
        name: access.group.name,
        announcementVisibility:
          access.group.announcement_visibility
      },
      matchedAdminRoles:
        access.matchedAdminRoles.map((role) => ({
          name: role.role_name,
          id: role.discord_role_id
        })),
      count: announcements.length,
      announcements
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const access = await getClanAccess(request, {
      requireAdmin: true
    });

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          ok: false,
          message: "公告資料格式不正確。"
        },
        { status: 400 }
      );
    }

    const title = String(body.title || "").trim();
    const content = String(body.content || "").trim();
    const category = String(body.category || "general");
    const visibility = String(body.visibility || "members");
    const status = String(body.status || "published");
    const isPinned = body.isPinned === true;

    if (!title || title.length > 120) {
      return NextResponse.json(
        {
          ok: false,
          message: "公告標題必須為 1 至 120 個字元。"
        },
        { status: 400 }
      );
    }

    if (!content || content.length > 10000) {
      return NextResponse.json(
        {
          ok: false,
          message: "公告內容必須為 1 至 10000 個字元。"
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_CATEGORIES.has(category)) {
      return NextResponse.json(
        {
          ok: false,
          message: "公告分類不正確。"
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_VISIBILITIES.has(visibility)) {
      return NextResponse.json(
        {
          ok: false,
          message: "公告閱讀權限不正確。"
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_CREATE_STATUSES.has(status)) {
      return NextResponse.json(
        {
          ok: false,
          message: "公告發布狀態不正確。"
        },
        { status: 400 }
      );
    }

    const authorName =
      access.session?.globalName ||
      access.session?.username ||
      access.session?.sub ||
      "Discord 管理員";

    const publishedAt =
      status === "published"
        ? new Date().toISOString()
        : null;

    const rows = await access.sql`
      INSERT INTO clan_announcements (
        group_id,
        title,
        content,
        category,
        status,
        visibility,
        is_pinned,
        author_discord_id,
        author_name,
        published_at
      )
      VALUES (
        ${access.group.id},
        ${title},
        ${content},
        ${category},
        ${status},
        ${visibility},
        ${isPinned},
        ${access.session!.sub},
        ${authorName},
        ${publishedAt}
      )
      RETURNING
        id,
        title,
        content,
        category,
        status,
        visibility,
        is_pinned,
        author_name,
        published_at,
        created_at,
        updated_at
    `;

    return NextResponse.json(
      {
        ok: true,
        message:
          status === "published"
            ? "氏族公告已發布。"
            : "氏族公告草稿已儲存。",
        announcement: rows[0]
      },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}
