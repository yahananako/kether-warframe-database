import { NextResponse } from "next/server";

import {
  OFFICIAL_NEWS_BOARD,
  OFFICIAL_NEWS_LINKS,
} from "../../../data/officialNews";
import { getOfficialNewsItems } from "../../../lib/officialNewsFeed";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await getOfficialNewsItems();
  const items = result.items;
  const isFallback = items.every((item) => item.source === "static-placeholder");

  return NextResponse.json(
    {
      ok: true,
      route: "/api/official-news",
      mode: isFallback ? "static-news-items-source" : "rss-news-items-source",
      message:
        "官方新聞 API 已接上 RSS／Atom 抓取工具函式；未設定來源或抓取失敗時會回傳靜態備援資料。",
      generatedAt: new Date().toISOString(),
      board: OFFICIAL_NEWS_BOARD,
      links: OFFICIAL_NEWS_LINKS,
      items,
      itemCount: items.length,
      feedEnabled: result.debug.feedEnabled,
      feedDebug: result.debug,
      nextSteps: [
        "查看 feedDebug.status",
        "查看 feedDebug.httpStatus",
        "查看 feedDebug.parser",
        "查看 feedDebug.parsedCount",
        "查看 feedDebug.fallbackReason",
      ],
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    }
  );
}
