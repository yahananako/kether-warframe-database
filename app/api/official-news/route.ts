import { NextResponse } from "next/server";

export const revalidate = 1800;

const OFFICIAL_NEWS_PAGE = "https://www.warframe.com/zh-hant/news";
const OFFICIAL_NEWS_RSS_CANDIDATES = [
  "https://www.warframe.com/news/rss",
  "https://forums.warframe.com/forum/3-pc-update-build-notes.xml",
];

type NewsItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

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
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeLink(value: string) {
  if (!value) return "";

  if (value.startsWith("http")) {
    return value;
  }

  if (value.startsWith("/")) {
    return `https://www.warframe.com${value}`;
  }

  return value;
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    next: { revalidate: 1800 },
    headers: {
      accept: "application/rss+xml, application/xml, text/xml, text/html",
      "user-agent": "KETHER-Warframe-Database/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`${url} failed: ${response.status}`);
  }

  return response.text();
}

function parseRss(xml: string): NewsItem[] {
  const itemBlocks = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/gi));

  return itemBlocks
    .slice(0, 6)
    .map((match) => {
      const block = match[1] ?? "";
      const title = cleanText(readTag(block, "title"));
      const link = normalizeLink(cleanText(readTag(block, "link")));
      const description = cleanText(readTag(block, "description"));
      const pubDate = cleanText(readTag(block, "pubDate"));

      return {
        title,
        link,
        description,
        pubDate,
      };
    })
    .filter((item) => item.title && item.link);
}

function parseWarframeNewsPage(html: string): NewsItem[] {
  const items: NewsItem[] = [];
  const seen = new Set<string>();

  const linkMatches = Array.from(
    html.matchAll(/href=["'](\/(?:zh-hant|en)\/news\/[^"']+)["'][\s\S]*?>([\s\S]*?)<\/a>/gi),
  );

  for (const match of linkMatches) {
    const link = normalizeLink(match[1] ?? "");
    const rawText = cleanText(match[2] ?? "");

    if (!link || !rawText || seen.has(link)) {
      continue;
    }

    const title = rawText
      .replace(/^Read More\s*/i, "")
      .replace(/^閱讀更多\s*/i, "")
      .trim();

    if (!title || title.length < 4) {
      continue;
    }

    seen.add(link);

    items.push({
      title,
      link,
      description: "Warframe 官方最新消息",
      pubDate: "",
    });

    if (items.length >= 6) {
      break;
    }
  }

  return items;
}

export async function GET() {
  const errors: string[] = [];

  for (const url of OFFICIAL_NEWS_RSS_CANDIDATES) {
    try {
      const xml = await fetchText(url);
      const items = parseRss(xml);

      if (items.length > 0) {
        return NextResponse.json({
          source: url,
          mode: "rss",
          updatedAt: new Date().toISOString(),
          items,
        });
      }

      errors.push(`${url}: no RSS items`);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  try {
    const html = await fetchText(OFFICIAL_NEWS_PAGE);
    const items = parseWarframeNewsPage(html);

    return NextResponse.json({
      source: OFFICIAL_NEWS_PAGE,
      mode: "official-news-page",
      updatedAt: new Date().toISOString(),
      items,
      error: items.length > 0 ? undefined : errors.join(" | "),
    });
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));

    return NextResponse.json(
      {
        source: OFFICIAL_NEWS_PAGE,
        updatedAt: new Date().toISOString(),
        items: [],
        error: errors.join(" | "),
      },
      { status: 502 },
    );
  }
}
