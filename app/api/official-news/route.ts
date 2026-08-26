import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 1800;

const OFFICIAL_NEWS_PAGE = "https://www.warframe.com/zh-hant/news";
const OFFICIAL_NEWS_RSS_CANDIDATES = [
  "https://forums.warframe.com/forum/3-pc-update-build-notes.xml/",
];

type NewsItem = {
  title: string;
  originalTitle?: string;
  link: string;
  description: string;
  originalDescription?: string;
  pubDate: string;
  translated?: boolean;
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

function containsChinese(value: string) {
  return /[\u3400-\u9fff]/.test(value);
}

async function translateToTraditionalChinese(value: string) {
  const text = cleanText(value).slice(0, 520);
  if (!text || containsChinese(text)) return text;

  try {
    const endpoint = new URL("https://translate.googleapis.com/translate_a/single");
    endpoint.searchParams.set("client", "gtx");
    endpoint.searchParams.set("sl", "auto");
    endpoint.searchParams.set("tl", "zh-TW");
    endpoint.searchParams.set("dt", "t");
    endpoint.searchParams.set("q", text);

    const response = await fetch(endpoint, {
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(10000),
      headers: { "user-agent": "KETHER-Warframe-Database/1.0" },
    });
    if (!response.ok) throw new Error("google translation unavailable");

    const payload = (await response.json()) as unknown;
    if (Array.isArray(payload) && Array.isArray(payload[0])) {
      const translated = payload[0]
        .map((part: unknown) => Array.isArray(part) && typeof part[0] === "string" ? part[0] : "")
        .join("")
        .trim();
      if (translated) return translated;
    }
  } catch {
    // Continue to the second translation source.
  }

  const fallback = new URL("https://api.mymemory.translated.net/get");
  fallback.searchParams.set("q", text.slice(0, 450));
  fallback.searchParams.set("langpair", "en|zh-TW");
  const response = await fetch(fallback, {
    next: { revalidate: 1800 },
    signal: AbortSignal.timeout(15000),
    headers: { "user-agent": "KETHER-Warframe-Database/1.0" },
  });
  if (!response.ok) throw new Error("translation unavailable");

  const payload = (await response.json()) as { responseData?: { translatedText?: string } };
  return cleanText(payload.responseData?.translatedText || text);
}

async function translateNewsItems(items: NewsItem[]) {
  return Promise.all(items.slice(0, 4).map(async (item) => {
    if (containsChinese(item.title) && containsChinese(item.description)) return item;
    try {
      const separator = "[[KETHER_NEWS]]";
      const sourceDescription = cleanText(item.description).slice(0, 190);
      const combined = `${item.title}\n${separator}\n${sourceDescription}`;
      const translatedCombined = await translateToTraditionalChinese(combined);
      const parts = translatedCombined.split(separator);
      const title = (parts[0] || item.title).trim();
      const description = (parts.slice(1).join(separator) || sourceDescription).trim();

      return {
        ...item,
        title,
        description,
        originalTitle: title !== item.title ? item.title : undefined,
        originalDescription: description !== item.description ? item.description : undefined,
        translated: title !== item.title || description !== item.description,
      };
    } catch {
      return item;
    }
  }));
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
    .slice(0, 4)
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
      const rawItems = parseRss(xml);
      const items = await translateNewsItems(rawItems);

      if (items.length > 0) {
        return NextResponse.json({
          source: url,
          mode: "rss-translated",
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
    const rawItems = parseWarframeNewsPage(html);
    const items = await translateNewsItems(rawItems);

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
