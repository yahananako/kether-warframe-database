import { NextResponse } from "next/server";

import {
  OFFICIAL_NEWS_BOARD,
  OFFICIAL_NEWS_LINKS,
} from "../../../data/officialNews";
import { getOfficialNewsItems } from "../../../lib/officialNewsFeed";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await getOfficialNewsItems();
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
      feedEnabled: Boolean(process.env.WARFRAME_OFFICIAL_NEWS_FEED_URL),
      nextSteps: [
        "在 Vercel 設定 WARFRAME_OFFICIAL_NEWS_FEED_URL",
        "確認 /api/official-news 可回傳 rss-news-items-source",
        "依官方來源格式微調分類與摘要",
        "首頁顯示最新官方新聞",
      ],
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    }
  );
}
