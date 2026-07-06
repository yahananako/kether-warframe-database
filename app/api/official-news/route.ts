import { NextResponse } from "next/server";

import { OFFICIAL_NEWS_BOARD, OFFICIAL_NEWS_LINKS } from "../../../data/officialNews";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      route: "/api/official-news",
      mode: "static-board-source",
      message: "官方新聞 API 前置路由已建立；目前回傳官方公告看板靜態資料，後續可接 RSS／API 自動更新。",
      generatedAt: new Date().toISOString(),
      board: OFFICIAL_NEWS_BOARD,
      links: OFFICIAL_NEWS_LINKS,
      nextSteps: [
        "接入 Warframe 官方新聞來源",
        "整理最新公告標題、日期與摘要",
        "首頁改讀 /api/official-news 顯示最新新聞",
      ],
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    }
  );
}
