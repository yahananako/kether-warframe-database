import { NextResponse } from "next/server";

import {
  OFFICIAL_NEWS_BOARD,
  OFFICIAL_NEWS_ITEMS,
  OFFICIAL_NEWS_LINKS,
} from "../../../data/officialNews";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      route: "/api/official-news",
      mode: "static-news-items-source",
      message:
        "官方新聞 API 前置路由已建立；目前回傳官方公告看板與新聞列表靜態資料，後續可接 RSS／API 自動更新。",
      generatedAt: new Date().toISOString(),
      board: OFFICIAL_NEWS_BOARD,
      links: OFFICIAL_NEWS_LINKS,
      items: OFFICIAL_NEWS_ITEMS,
      itemCount: OFFICIAL_NEWS_ITEMS.length,
      nextSteps: [
        "接入 Warframe 官方新聞 RSS／API",
        "將 items 改成最新官方新聞資料",
        "整理新聞標題、日期、分類、摘要與官方連結",
        "首頁顯示最新公告預覽",
      ],
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    }
  );
}
