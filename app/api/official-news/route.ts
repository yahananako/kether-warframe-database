import { NextResponse } from "next/server";

export const revalidate = 1800;

const WARFRAME_NEWS_RSS_URL = "https://www.warframe.com/news/rss";

function readTag(source: string, tag: string) {
  const match = source.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match?.[1]?.trim() ?? "";
}

function decodeEntities(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function cleanText(value: string) {
  return decodeEntities(value)
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function GET() {
  try {
    const response = await fetch(WARFRAME_NEWS_RSS_URL, {
      next: { revalidate: 1800 },
      headers: {
        accept: "application/rss+xml, application/xml, text/xml",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          items: [],
          error: `Warframe RSS fetch failed: ${response.status}`,
        },
        { status: 502 },
      );
    }

    const xml = await response.text();
    const itemBlocks = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/gi));

    const items = itemBlocks.slice(0, 6).map((match) => {
      const block = match[1] ?? "";
      const title = cleanText(readTag(block, "title"));
      const link = cleanText(readTag(block, "link"));
      const description = cleanText(readTag(block, "description"));
      const pubDate = cleanText(readTag(block, "pubDate"));

      return {
        title,
        link,
        description,
        pubDate,
      };
    }).filter((item) => item.title && item.link);

    return NextResponse.json({
      source: WARFRAME_NEWS_RSS_URL,
      updatedAt: new Date().toISOString(),
      items,
    });
  } catch (error) {
    return NextResponse.json(
      {
        items: [],
        error: error instanceof Error ? error.message : "Unknown RSS error",
      },
      { status: 500 },
    );
  }
}
