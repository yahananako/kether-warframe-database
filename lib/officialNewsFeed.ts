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
  rawItemCount: number;
  rawEntryCount: number;
  parsedCount: number;
  fallbackReason: string | null;
  errorMessage: string | null;
  xmlPreview: string | null;
};

export type OfficialNewsFeedResult = {
  items: OfficialNewsItem[];
  debug: OfficialNewsFeedDebug;
};

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
    .replace(/&#x22;/g, '"')
    .replace(/&#(\d+);/g, (_match, code: string) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_match, code: string) => String.fromCharCode(parseInt(code, 16)));
}

function stripCdata(value: string) {
  const trimmed = value.trim();

  return trimmed
    .replace(/^<!\[CDATA\[/i, "")
    .replace(/\]\]>$/i, "")
    .trim();
}

function stripHtml(value: string) {
  const decoded = decodeHtmlEntities(stripCdata(value));

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

function trimSummary(value: string, maxLength = 150) {
  const cleaned = stripHtml(value);

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return `${cleaned.slice(0, maxLength).trim()}…`;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tagPattern(tagName: string) {
  if (tagName.includes(":")) {
    return escapeRegExp(tagName);
  }

  return `(?:[\\w.-]+:)?${escapeRegExp(tagName)}`;
}

function readTag(block: string, tagName: string) {
  const pattern = tagPattern(tagName);
  const match = block.match(new RegExp(`<${pattern}\\b[^>]*>([\\s\\S]*?)<\\/${pattern}>`, "i"));

  return match ? stripHtml(match[1]) : "";
}

function readRawTag(block: string, tagName: string) {
  const pattern = tagPattern(tagName);
  const match = block.match(new RegExp(`<${pattern}\\b[^>]*>([\\s\\S]*?)<\\/${pattern}>`, "i"));

  return match ? stripCdata(match[1]) : "";
}

function readFirstTag(block: string, tagNames: string[]) {
  for (const tagName of tagNames) {
    const value = readTag(block, tagName);

    if (value) {
      return value;
    }
  }

  return "";
}

function readFirstRawTag(block: string, tagNames: string[]) {
  for (const tagName of tagNames) {
    const value = readRawTag(block, tagName);

    if (value) {
      return value;
    }
  }

  return "";
}

function readAtomLink(block: string) {
  const hrefMatch = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i);
  return hrefMatch ? hrefMatch[1].trim() : "";
}

function readRssLink(block: string) {
  return readFirstTag(block, ["link", "guid"]) || readAtomLink(block);
}

function normalizeDate(value: string) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function extractBlocks(xml: string, tagName: string) {
  const pattern = new RegExp(`<(?:[\\w.-]+:)?${tagName}\\b[\\s\\S]*?<\\/(?:[\\w.-]+:)?${tagName}>`, "gi");

  return Array.from(xml.matchAll(pattern)).map((match) => match[0]);
}

function parseRssItems(xml: string): ParsedFeedItem[] {
  const blocks = extractBlocks(xml, "item");

  return blocks
    .map((block) => {
      const title = readFirstTag(block, ["title"]);
      const rawSummary = readFirstRawTag(block, ["description", "content:encoded", "summary", "content"]);
      const summary = trimSummary(rawSummary || "官方新聞摘要待補。");
      const href = readRssLink(block);
      const publishedAt = normalizeDate(readFirstTag(block, ["pubDate", "published", "updated", "dc:date"]));

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
  const blocks = extractBlocks(xml, "entry");

  return blocks
    .map((block) => {
      const title = readFirstTag(block, ["title"]);
      const summary = "點擊查看官方原文。";
      const href = readAtomLink(block) || readFirstTag(block, ["link", "id"]);
      const publishedAt = normalizeDate(readFirstTag(block, ["published", "updated"]));

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
    summary: item.summary || "點擊查看官方原文。",
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
      rawItemCount: 0,
      rawEntryCount: 0,
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
    const rawItemCount = extractBlocks(xml, "item").length;
    const rawEntryCount = extractBlocks(xml, "entry").length;

    if (!response.ok) {
      return fallbackResult({
        feedUrl,
        feedEnabled: true,
        status: "error",
        httpStatus: response.status,
        parser: "none",
        rawItemCount,
        rawEntryCount,
        parsedCount: 0,
        fallbackReason: `Feed returned HTTP ${response.status}.`,
        errorMessage: null,
        xmlPreview: xml.slice(0, 360),
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
        rawItemCount,
        rawEntryCount,
        parsedCount: 0,
        fallbackReason: "Feed fetched, but parser found 0 valid items.",
        errorMessage: null,
        xmlPreview: xml.slice(0, 360),
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
        rawItemCount,
        rawEntryCount,
        parsedCount: parsedItems.length,
        fallbackReason: null,
        errorMessage: null,
        xmlPreview: xml.slice(0, 360),
      },
    };
  } catch (error) {
    return fallbackResult({
      feedUrl,
      feedEnabled: true,
      status: "error",
      httpStatus: null,
      parser: "none",
      rawItemCount: 0,
      rawEntryCount: 0,
      parsedCount: 0,
      fallbackReason: "Feed fetch failed.",
      errorMessage: error instanceof Error ? error.message : String(error),
      xmlPreview: null,
    });
  }
}
