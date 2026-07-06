import { OFFICIAL_NEWS_ITEMS, type OfficialNewsItem } from "../data/officialNews";

type ParsedFeedItem = {
  title: string;
  summary: string;
  href: string;
  publishedAt: string | null;
};

function stripCdata(value: string) {
  return value
    .replace(/^<!\[CDATA\[/, "")
    .replace(/\]\]>$/, "")
    .trim();
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
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
      const href = readTag(block, "link");
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
    summary: item.summary || "官方新聞摘要待補。",
    publishedAt: item.publishedAt,
    href: item.href,
    source: "rss-feed",
  };
}

export async function getOfficialNewsItems(): Promise<OfficialNewsItem[]> {
  const feedUrl = process.env.WARFRAME_OFFICIAL_NEWS_FEED_URL;

  if (!feedUrl) {
    return OFFICIAL_NEWS_ITEMS;
  }

  try {
    const response = await fetch(feedUrl, {
      headers: {
        Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
      },
      next: {
        revalidate: 300,
      },
    });

    if (!response.ok) {
      throw new Error(`Official news feed failed: ${response.status}`);
    }

    const xml = await response.text();
    const parsedItems = parseRssItems(xml).length > 0 ? parseRssItems(xml) : parseAtomItems(xml);

    if (parsedItems.length === 0) {
      return OFFICIAL_NEWS_ITEMS;
    }

    return parsedItems.slice(0, 5).map(toOfficialNewsItem);
  } catch {
    return OFFICIAL_NEWS_ITEMS;
  }
}
