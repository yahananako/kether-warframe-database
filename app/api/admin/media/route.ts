import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

import {
  requireVisualAdmin,
  VisualAdminAccessError,
} from "../../../../lib/adminVisualAccess";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

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
        error instanceof Error ? error.message : "素材上傳發生未知錯誤。",
    },
    { status: 500 },
  );
}

export async function POST(request: NextRequest) {
  try {
    const access = await requireVisualAdmin(request);
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, message: "請選擇要上傳的圖片。" },
        { status: 400 },
      );
    }

    const extension = MIME_TO_EXTENSION[file.type];

    if (!extension) {
      return NextResponse.json(
        { ok: false, message: "僅支援 JPG、PNG、WebP、GIF。" },
        { status: 400 },
      );
    }

    if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { ok: false, message: "圖片必須小於 8 MB。" },
        { status: 400 },
      );
    }

    const pathname = `site-editor/${access.session.sub}/${crypto.randomUUID()}.${extension}`;
    const blob = await put(pathname, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
      cacheControlMaxAge: 60 * 60 * 24 * 30,
    });

    return NextResponse.json(
      {
        ok: true,
        url: blob.url,
        pathname: blob.pathname,
      },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
