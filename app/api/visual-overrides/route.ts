import { NextRequest, NextResponse } from "next/server";

import {
  requireVisualAdmin,
  VisualAdminAccessError,
} from "../../../lib/adminVisualAccess";
import { getNeonSql } from "../../../lib/neonServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type VisualValues = {
  text?: string;
  src?: string;
  styles?: Record<string, string>;
};

const ALLOWED_STYLE_KEYS = new Set([
  "backgroundColor",
  "backgroundImage",
  "color",
  "fontSize",
  "fontWeight",
  "textAlign",
  "padding",
  "margin",
  "borderRadius",
  "opacity",
  "width",
  "height",
  "display",
]);

function errorResponse(error: unknown) {
  if (error instanceof VisualAdminAccessError) {
    return NextResponse.json(
      { ok: false, message: error.message },
      { status: error.status },
    );
  }

  return NextResponse.json(
    {
      ok: false,
      message:
        error instanceof Error ? error.message : "視覺編輯服務發生未知錯誤。",
    },
    { status: 500 },
  );
}

function normalizePath(value: string | null) {
  const path = (value || "/").trim();

  if (!path.startsWith("/") || path.length > 500 || path.startsWith("/admin")) {
    throw new Error("頁面路徑不正確。");
  }

  return path;
}

function normalizeSelector(value: unknown) {
  if (typeof value !== "string") {
    throw new Error("缺少可編輯元素 selector。");
  }

  const selector = value.trim();

  if (!selector || selector.length > 1200) {
    throw new Error("可編輯元素 selector 不正確。");
  }

  return selector;
}

function normalizeValues(value: unknown): VisualValues {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("修改內容格式不正確。");
  }

  const input = value as Record<string, unknown>;
  const result: VisualValues = {};

  if (typeof input.text === "string") {
    result.text = input.text.slice(0, 30000);
  }

  if (typeof input.src === "string") {
    result.src = input.src.slice(0, 4000);
  }

  if (
    input.styles &&
    typeof input.styles === "object" &&
    !Array.isArray(input.styles)
  ) {
    const styles: Record<string, string> = {};

    for (const [key, styleValue] of Object.entries(
      input.styles as Record<string, unknown>,
    )) {
      if (
        ALLOWED_STYLE_KEYS.has(key) &&
        typeof styleValue === "string" &&
        styleValue.length <= 4000
      ) {
        styles[key] = styleValue;
      }
    }

    result.styles = styles;
  }

  return result;
}

function parseStoredValues(value: unknown): VisualValues {
  if (!value) return {};

  if (typeof value === "string") {
    try {
      return JSON.parse(value) as VisualValues;
    } catch {
      return {};
    }
  }

  if (typeof value === "object") {
    return value as VisualValues;
  }

  return {};
}

async function ensureTables(sql: ReturnType<typeof getNeonSql>) {
  await sql`
    CREATE TABLE IF NOT EXISTS site_visual_overrides (
      page_path TEXT NOT NULL,
      selector TEXT NOT NULL,
      draft JSONB NOT NULL DEFAULT '{}'::jsonb,
      published JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_by TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (page_path, selector)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS site_visual_history (
      id BIGSERIAL PRIMARY KEY,
      page_path TEXT NOT NULL,
      snapshot JSONB NOT NULL,
      published_by TEXT,
      published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function GET(request: NextRequest) {
  try {
    const pagePath = normalizePath(request.nextUrl.searchParams.get("path"));
    const stage =
      request.nextUrl.searchParams.get("stage") === "draft"
        ? "draft"
        : "published";
    const wantsHistory = request.nextUrl.searchParams.get("history") === "1";

    if (stage === "draft" || wantsHistory) {
      const access = await requireVisualAdmin(request);
      await ensureTables(access.sql);

      if (wantsHistory) {
        const rows = await access.sql`
          SELECT id, page_path, published_by, published_at
          FROM site_visual_history
          WHERE page_path = ${pagePath}
          ORDER BY published_at DESC
          LIMIT 20
        `;

        return NextResponse.json({ ok: true, history: rows });
      }

      const rows = await access.sql`
        SELECT selector, draft
        FROM site_visual_overrides
        WHERE page_path = ${pagePath}
        ORDER BY selector ASC
      `;

      return NextResponse.json({
        ok: true,
        stage,
        overrides: rows.map((row) => ({
          selector: String(row.selector),
          values: parseStoredValues(row.draft),
        })),
      });
    }

    const sql = getNeonSql();
    await ensureTables(sql);

    const rows = await sql`
      SELECT selector, published
      FROM site_visual_overrides
      WHERE page_path = ${pagePath}
        AND published <> '{}'::jsonb
      ORDER BY selector ASC
    `;

    return NextResponse.json({
      ok: true,
      stage,
      overrides: rows.map((row) => ({
        selector: String(row.selector),
        values: parseStoredValues(row.published),
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const access = await requireVisualAdmin(request);
    await ensureTables(access.sql);

    const body = (await request.json()) as Record<string, unknown>;
    const pagePath = normalizePath(
      typeof body.path === "string" ? body.path : null,
    );
    const selector = normalizeSelector(body.selector);
    const values = normalizeValues(body.values);

    await access.sql`
      INSERT INTO site_visual_overrides (
        page_path,
        selector,
        draft,
        published,
        updated_by,
        updated_at
      )
      VALUES (
        ${pagePath},
        ${selector},
        ${JSON.stringify(values)}::jsonb,
        '{}'::jsonb,
        ${access.session.sub},
        NOW()
      )
      ON CONFLICT (page_path, selector)
      DO UPDATE SET
        draft = EXCLUDED.draft,
        updated_by = EXCLUDED.updated_by,
        updated_at = NOW()
    `;

    return NextResponse.json({
      ok: true,
      message: "草稿已儲存。",
      selector,
      values,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const access = await requireVisualAdmin(request);
    await ensureTables(access.sql);

    const body = (await request.json()) as Record<string, unknown>;
    const pagePath = normalizePath(
      typeof body.path === "string" ? body.path : null,
    );
    const action = typeof body.action === "string" ? body.action : "publish";

    if (action !== "publish") {
      return NextResponse.json(
        { ok: false, message: "不支援的管理動作。" },
        { status: 400 },
      );
    }

    const draftRows = await access.sql`
      SELECT selector, draft
      FROM site_visual_overrides
      WHERE page_path = ${pagePath}
      ORDER BY selector ASC
    `;

    const snapshot = draftRows.map((row) => ({
      selector: String(row.selector),
      values: parseStoredValues(row.draft),
    }));

    await access.sql`
      INSERT INTO site_visual_history (
        page_path,
        snapshot,
        published_by,
        published_at
      )
      VALUES (
        ${pagePath},
        ${JSON.stringify(snapshot)}::jsonb,
        ${access.session.sub},
        NOW()
      )
    `;

    await access.sql`
      UPDATE site_visual_overrides
      SET
        published = draft,
        updated_by = ${access.session.sub},
        updated_at = NOW()
      WHERE page_path = ${pagePath}
    `;

    return NextResponse.json({
      ok: true,
      message: "此頁草稿已發布。",
      publishedCount: snapshot.length,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const access = await requireVisualAdmin(request);
    await ensureTables(access.sql);

    const pagePath = normalizePath(request.nextUrl.searchParams.get("path"));
    const selector = normalizeSelector(
      request.nextUrl.searchParams.get("selector"),
    );

    await access.sql`
      UPDATE site_visual_overrides
      SET
        draft = published,
        updated_by = ${access.session.sub},
        updated_at = NOW()
      WHERE page_path = ${pagePath}
        AND selector = ${selector}
    `;

    return NextResponse.json({
      ok: true,
      message: "已將此元素草稿還原為目前發布版本。",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
