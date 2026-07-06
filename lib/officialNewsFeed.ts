import { OFFICIAL_NEWS_ITEMS, type OfficialNewsItem } from "../data/officialNews";

type ParsedFeedItem = {
  title: string;
  summary: string;
  href: string;
  publishedAt: string | null;
};

export type OfficialNewsFeedDebug = {
  feedUrl: string | null;
  feedEnabled: boolean;
  status: "disabled" | "fetched" | "empty" | "error";
  httpStatus: number | null;
  parser: "rss" | "atom" | "none";
  parsedCount: number;
  fallbackReason: string | null;
  errorMessage: string | null;
  xmlPreview: string | null;
};

export type OfficialNewsFeedResult = {
  items: OfficialNewsItem[];
  debug: OfficialNewsFeedDebug;
};

function stripCdata(value: string) {
  return value
    .replace(/^<!\[CDATA\[/, "")
    .replace(/\]\]>$/, "")
    .trim();
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&#x27;/g, "'")
    .replace(/&#x22;/g, '"');
}

function stripHtml(value: string) {
  const decoded = decodeHtmlEntities(value);

  return decoded
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, " ")
    .replace(/<img[^>]*>/gi, " ")
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function trimSummary(value: string, maxLength = 130) {
  const cleaned = stripHtml(value);

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return `${cleaned.slice(0, maxLength).trim()}…`;
}

function readTag(block: string, tagName: string) {
  const match = block.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return match ? stripHtml(stripCdata(match[1])) : "";
}

function readAtomLink(block: string) {
  const hrefMatch = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i);
  return hrefMatch ? hrefMatch[1].trim() : "";
}

function normalizeDate(value: string) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function parseRssItems(xml: string): ParsedFeedItem[] {
  const blocks = Array.from(xml.matchAll(/<item[\s\S]*?<\/item>/gi)).map((match) => match[0]);

  return blocks
    .map((block) => {
      const title = readTag(block, "title");
      const summary = readTag(block, "description") || readTag(block, "summary");
      const href = readTag(block, "link") || readTag(block, "guid");
      const publishedAt = normalizeDate(readTag(block, "pubDate") || readTag(block, "published"));

      return {
        title,
        summary,
        href,
        publishedAt,
      };
    })
    .filter((item) => item.title && item.href);
}

function parseAtomItems(xml: string): ParsedFeedItem[] {
  const blocks = Array.from(xml.matchAll(/<entry[\s\S]*?<\/entry>/gi)).map((match) => match[0]);

  return blocks
    .map((block) => {
      const title = readTag(block, "title");
      const summary = readTag(block, "summary") || readTag(block, "content");
      const href = readAtomLink(block);
      const publishedAt = normalizeDate(readTag(block, "published") || readTag(block, "updated"));

      return {
        title,
        summary,
        href,
        publishedAt,
      };
    })
    .filter((item) => item.title && item.href);
}

function toOfficialNewsItem(item: ParsedFeedItem, index: number): OfficialNewsItem {
  return {
    id: `official-feed-${index + 1}`,
    category: "NEWS",
    title: item.title,
    summary: trimSummary(item.summary || "官方新聞摘要待補。"),
    publishedAt: item.publishedAt,
    href: item.href,
    source: "rss-feed",
  };
}

function fallbackResult(debug: OfficialNewsFeedDebug): OfficialNewsFeedResult {
  return {
    items: OFFICIAL_NEWS_ITEMS,
    debug,
  };
}

export async function getOfficialNewsItems(): Promise<OfficialNewsFeedResult> {
  const feedUrl = process.env.WARFRAME_OFFICIAL_NEWS_FEED_URL;

  if (!feedUrl) {
    return fallbackResult({
      feedUrl: null,
      feedEnabled: false,
      status: "disabled",
      httpStatus: null,
      parser: "none",
      parsedCount: 0,
      fallbackReason: "WARFRAME_OFFICIAL_NEWS_FEED_URL is not set.",
      errorMessage: null,
      xmlPreview: null,
    });
  }

  try {
    const response = await fetch(feedUrl, {
      headers: {
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
        "User-Agent": "KETHER-Warframe-Database/1.0",
      },
      next: {
        revalidate: 300,
      },
    });

    const xml = await response.text();

    if (!response.ok) {
      return fallbackResult({
        feedUrl,
        feedEnabled: true,
        status: "error",
        httpStatus: response.status,
        parser: "none",
        parsedCount: 0,
        fallbackReason: `Feed returned HTTP ${response.status}.`,
        errorMessage: null,
        xmlPreview: xml.slice(0, 260),
      });
    }

    const rssItems = parseRssItems(xml);
    const atomItems = rssItems.length > 0 ? [] : parseAtomItems(xml);
    const parsedItems = rssItems.length > 0 ? rssItems : atomItems;
    const parser = rssItems.length > 0 ? "rss" : atomItems.length > 0 ? "atom" : "none";

    if (parsedItems.length === 0) {
      return fallbackResult({
        feedUrl,
        feedEnabled: true,
        status: "empty",
        httpStatus: response.status,
        parser,
        parsedCount: 0,
        fallbackReason: "Feed fetched, but parser found 0 valid items.",
        errorMessage: null,
        xmlPreview: xml.slice(0, 260),
      });
    }

    return {
      items: parsedItems.slice(0, 5).map(toOfficialNewsItem),
      debug: {
        feedUrl,
        feedEnabled: true,
        status: "fetched",
        httpStatus: response.status,
        parser,
        parsedCount: parsedItems.length,
        fallbackReason: null,
        errorMessage: null,
        xmlPreview: xml.slice(0, 260),
      },
    };
  } catch (error) {
    return fallbackResult({
      feedUrl,
      feedEnabled: true,
      status: "error",
      httpStatus: null,
      parser: "none",
      parsedCount: 0,
      fallbackReason: "Feed fetch failed.",
      errorMessage: error instanceof Error ? error.message : String(error),
      xmlPreview: null,
    });
  }
}
