import crypto from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_URL = "https://kether-warframe-database.vercel.app";
const MARKET_API = "https://api.warframe.market/v1";
const MARKET_SITE = "https://warframe.market/items";

const INTERACTION_TYPE = {
  PING: 1,
  APPLICATION_COMMAND: 2,
};

const RESPONSE_TYPE = {
  PONG: 1,
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
};

type MarketItem = {
  name: string;
  slug: string;
  language: string;
};

type MarketOrder = {
  order_type?: "sell" | "buy";
  platinum?: number;
  quantity?: number;
  visible?: boolean;
  mod_rank?: number;
  user?: {
    status?: string;
    ingame_name?: string;
  };
};

type RankParseResult = {
  cleanKeyword: string;
  rank: number | null;
  rankLabel: string;
};

let itemCache:
  | {
      expiresAt: number;
      items: MarketItem[];
    }
  | null = null;

const ITEM_CACHE_MS = 6 * 60 * 60 * 1000;

const MANUAL_ALIASES: Record<string, string> = {
  "激昂射擊": "galvanized_shot",
  "激昂 射擊": "galvanized_shot",
  "galvanized shot": "galvanized_shot",
};

const MANUAL_DISPLAY: Record<string, { zh: string; en: string }> = {
  galvanized_shot: {
    zh: "激昂射擊",
    en: "Galvanized Shot",
  },
};

const LINKS = [
  {
    title: "KETHER Warframe 資料庫首頁",
    url: `${SITE_URL}/`,
    description: "氏族資料庫首頁。",
    keywords: ["首頁", "home", "網站", "kether", "資料庫"],
  },
  {
    title: "資料庫總覽",
    url: `${SITE_URL}/database/overview`,
    description: "查看分類統計、追價、完成率與總覽資料。",
    keywords: ["總覽", "overview", "統計", "完成率", "追價"],
  },
  {
    title: "戰甲資料",
    url: `${SITE_URL}/database/warframes`,
    description: "查詢戰甲相關資料。",
    keywords: ["戰甲", "warframe", "warframes", "甲"],
  },
  {
    title: "主要武器資料",
    url: `${SITE_URL}/database/primary`,
    description: "查詢主要武器資料。",
    keywords: ["主要武器", "primary", "主武器", "步槍"],
  },
  {
    title: "次要武器資料",
    url: `${SITE_URL}/database/secondary`,
    description: "查詢次要武器資料。",
    keywords: ["次要武器", "secondary", "副武器", "手槍"],
  },
  {
    title: "近戰武器資料",
    url: `${SITE_URL}/database/melee`,
    description: "查詢近戰武器資料。",
    keywords: ["近戰", "近戰武器", "melee", "刀", "劍"],
  },
  {
    title: "同伴資料",
    url: `${SITE_URL}/database/companions`,
    description: "查詢同伴、寵物相關資料。",
    keywords: ["同伴", "寵物", "companions", "pet", "庫狛", "庫娃"],
  },
  {
    title: "曲翼資料",
    url: `${SITE_URL}/database/archwing`,
    description: "查詢曲翼、曲翼武器與亡靈骸甲相關資料。",
    keywords: ["曲翼", "archwing", "亡靈骸甲", "necramech"],
  },
  {
    title: "MOD 資料庫",
    url: `${SITE_URL}/database/mods`,
    description: "查詢 MOD、卡片、系列 MOD 與追價資料。",
    keywords: ["mod", "MOD", "模組", "卡片", "p版mod", "prime mod", "系列mod"],
  },
  {
    title: "官方公告",
    url: `${SITE_URL}/notifications`,
    description: "查看 Warframe 官方公告與通知資料。",
    keywords: ["官方", "公告", "新聞", "news", "更新", "通知"],
  },
  {
    title: "資料庫狀態",
    url: `${SITE_URL}/db-status`,
    description: "查看資料庫同步與狀態頁。",
    keywords: ["狀態", "status", "資料庫狀態", "同步"],
  },
  {
    title: "個人進度",
    url: `${SITE_URL}/profile`,
    description: "查看 Discord 登入後的個人已購買進度。",
    keywords: ["個人", "進度", "profile", "已購買", "購買"],
  },
];

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function verifyDiscordRequest(rawBody: string, signature: string | null, timestamp: string | null) {
  const publicKey = process.env.DISCORD_PUBLIC_KEY?.trim();

  if (!publicKey || !signature || !timestamp) {
    return false;
  }

  try {
    const publicKeyBytes = Buffer.from(publicKey, "hex");

    if (publicKeyBytes.length !== 32) {
      return false;
    }

    const spkiPrefix = Buffer.from("302a300506032b6570032100", "hex");
    const key = crypto.createPublicKey({
      key: Buffer.concat([spkiPrefix, publicKeyBytes]),
      format: "der",
      type: "spki",
    });

    return crypto.verify(
      null,
      Buffer.from(timestamp + rawBody),
      key,
      Buffer.from(signature, "hex")
    );
  } catch {
    return false;
  }
}

function normalizeText(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[()（）［］[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugFromText(value: string) {
  return normalizeText(value).replace(/\s+/g, "_");
}

function parseRank(rawKeyword: string): RankParseResult {
  let cleanKeyword = rawKeyword;
  let rank: number | null = 0;
  let rankLabel = "Rank 0 / 未升級";

  if (/滿等|滿級|max|rank\s*10|r10|等級\s*10/i.test(rawKeyword)) {
    rank = 10;
    rankLabel = "Rank 10 / 滿等";
  }

  const rankMatch = rawKeyword.match(/(?:rank|r|等級)\s*(\d+)/i);

  if (rankMatch?.[1]) {
    rank = Number(rankMatch[1]);
    rankLabel = `Rank ${rank}`;
  }

  cleanKeyword = cleanKeyword
    .replace(/價格|查價|查詢|白金|幾p|多少p|多少白金/gi, "")
    .replace(/滿等|滿級|max/gi, "")
    .replace(/(?:rank|r|等級)\s*\d+/gi, "")
    .trim();

  return {
    cleanKeyword,
    rank,
    rankLabel,
  };
}

async function fetchMarketItemsByLanguage(language: string): Promise<MarketItem[]> {
  const response = await fetch(`${MARKET_API}/items`, {
    headers: {
      Accept: "application/json",
      Language: language,
    },
    next: {
      revalidate: 21600,
    },
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  const rawItems = data?.payload?.items;

  if (!Array.isArray(rawItems)) {
    return [];
  }

  return rawItems
    .map((item: { item_name?: string; url_name?: string }) => {
      if (!item.item_name || !item.url_name) {
        return null;
      }

      return {
        name: item.item_name,
        slug: item.url_name,
        language,
      };
    })
    .filter((item: MarketItem | null): item is MarketItem => Boolean(item));
}

async function getMarketItems() {
  const now = Date.now();

  if (itemCache && itemCache.expiresAt > now) {
    return itemCache.items;
  }

  const [zhItems, enItems] = await Promise.all([
    fetchMarketItemsByLanguage("zh-hant"),
    fetchMarketItemsByLanguage("en"),
  ]);

  const unique = new Map<string, MarketItem>();

  for (const item of [...zhItems, ...enItems]) {
    unique.set(`${item.language}:${item.slug}:${normalizeText(item.name)}`, item);
  }

  const items = [...unique.values()];

  itemCache = {
    expiresAt: now + ITEM_CACHE_MS,
    items,
  };

  return items;
}

async function resolveMarketItem(keyword: string) {
  const normalizedKeyword = normalizeText(keyword);
  const aliasSlug = MANUAL_ALIASES[normalizedKeyword];

  if (aliasSlug) {
    return {
      slug: aliasSlug,
      name: MANUAL_DISPLAY[aliasSlug]?.zh ?? keyword,
    };
  }

  const items = await getMarketItems();

const directSlug = slugFromText(keyword);

  const exactMatch = items.find((item) => {
    return (
      normalizeText(item.name) === normalizedKeyword ||
      normalizeText(item.slug) === normalizedKeyword ||
      item.slug === directSlug
    );
  });

  if (exactMatch) {
    return {
      slug: exactMatch.slug,
      name: exactMatch.name,
    };
  }

  const fuzzyMatch = items.find((item) => {
    const itemName = normalizeText(item.name);
    const itemSlug = normalizeText(item.slug.replace(/_/g, " "));

    return itemName.includes(normalizedKeyword) || itemSlug.includes(normalizedKeyword);
  });

  if (fuzzyMatch) {
    return {
      slug: fuzzyMatch.slug,
      name: fuzzyMatch.name,
    };
  }

  return null;
}

async function fetchOrders(slug: string): Promise<MarketOrder[]> {
  const response = await fetch(`${MARKET_API}/items/${slug}/orders`, {
    headers: {
      Accept: "application/json",
      Language: "en",
      Platform: "pc",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Warframe.Market orders error: ${response.status}`);
  }

  const data = await response.json();
  const orders = data?.payload?.orders;

  if (!Array.isArray(orders)) {
    return [];
  }

  return orders as MarketOrder[];
}

function getDisplayName(slug: string, resolvedName: string) {
  const manual = MANUAL_DISPLAY[slug];

  if (manual) {
    return `${manual.zh} / ${manual.en}`;
  }

  return resolvedName;
}

function filterOrdersByRank(orders: MarketOrder[], rank: number | null) {
  const hasModRank = orders.some((order) => typeof order.mod_rank === "number");

  if (!hasModRank || rank === null) {
    return orders;
  }

  const ranked = orders.filter((order) => order.mod_rank === rank);

  if (ranked.length > 0) {
    return ranked;
  }

  return orders;
}

function isUsefulOrder(order: MarketOrder) {
  const status = order.user?.status;
  const isOnline = status === "ingame" || status === "online";

  return order.visible !== false && isOnline && typeof order.platinum === "number";
}

function formatPriceList(orders: MarketOrder[], mode: "sell" | "buy") {
  const prices = orders
    .slice(0, 5)
    .map((order) => `${order.platinum}p`)
    .join(" / ");

  if (!prices) {
    return mode === "sell" ? "目前沒有線上賣單" : "目前沒有線上收購單";
  }

  return prices;
}

async function buildMarketPriceMessage(rawKeyword: string) {
  const rankInfo = parseRank(rawKeyword);
  const keyword = rankInfo.cleanKeyword;

  if (!keyword) {
    return null;
  }

  const item = await resolveMarketItem(keyword);

  if (!item) {
    return null;
  }

  const orders = await fetchOrders(item.slug);
  const rankedOrders = filterOrdersByRank(orders, rankInfo.rank);

  const sellOrders = rankedOrders
    .filter((order) => order.order_type === "sell")
    .filter(isUsefulOrder)
    .sort((a, b) => Number(a.platinum) - Number(b.platinum));

  const buyOrders = rankedOrders
    .filter((order) => order.order_type === "buy")
    .filter(isUsefulOrder)
    .sort((a, b) => Number(b.platinum) - Number(a.platinum));

  const lowestSell = sellOrders[0]?.platinum;
  const highestBuy = buyOrders[0]?.platinum;

  const displayName = getDisplayName(item.slug, item.name);
  const marketUrl = `${MARKET_SITE}/${item.slug}`;

  return [
    `**${displayName}**`,
    `平台：PC / 線上與遊戲中玩家`,
    `等級：${rankInfo.rankLabel}`,
    "",
    `最低賣單：${lowestSell ? `${lowestSell} 白金` : "目前沒有線上賣單"}`,
    `最高收購：${highestBuy ? `${highestBuy} 白金` : "目前沒有線上收購單"}`,
    "",
    `前 5 賣單：${formatPriceList(sellOrders, "sell")}`,
    `前 5 收購：${formatPriceList(buyOrders, "buy")}`,
    "",
    `來源：${marketUrl}`,
    "",
    `想查滿等可以輸入：/kether keyword: ${keyword} 滿等`,
  ].join("\n");
}

function searchLinks(keyword: string) {
  const text = keyword.toLowerCase().trim();

  if (!text) {
    return LINKS.slice(0, 6);
  }

  return LINKS.filter((item) => {
    const haystack = [item.title, item.description, item.url, ...item.keywords]
      .join(" ")
      .toLowerCase();

    return haystack.includes(text);
  });
}

function buildLinkMessage(keyword: string) {
  const results = searchLinks(keyword);

  if (results.length === 0) {
    return {
      content:
        `找不到「${keyword}」相關資料喵。\n` +
        "可以試試：首頁、總覽、戰甲、主要武器、次要武器、近戰、同伴、曲翼、MOD、官方、個人進度。\n" +
        "查價格可以試試：激昂射擊、Galvanized Shot。",
      flags: 64,
    };
  }

  const content = results
    .slice(0, 5)
    .map((item) => {
      return `**${item.title}**\n${item.description}\n${item.url}`;
    })
    .join("\n\n");

  return {
    content,
  };
}

async function buildKetherMessage(keyword: string) {
  try {
    const priceMessage = await buildMarketPriceMessage(keyword);

    if (priceMessage) {
      return {
        content: priceMessage,
      };
    }
  } catch (error) {
    console.error(error);

    return {
      content:
        "Warframe.Market 暫時沒有回應喵。\n" +
        "可以等一下再查，或先試：/kether keyword: 首頁",
      flags: 64,
    };
  }

  return buildLinkMessage(keyword);
}

export async function POST(request: Request) {
  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");
  const rawBody = await request.text();

  const isValid = verifyDiscordRequest(rawBody, signature, timestamp);

  if (!isValid) {
    return jsonResponse({ error: "Bad request signature" }, 401);
  }

  const interaction = JSON.parse(rawBody);

  if (interaction.type === INTERACTION_TYPE.PING) {
    return jsonResponse({
      type: RESPONSE_TYPE.PONG,
    });
  }

  if (interaction.type === INTERACTION_TYPE.APPLICATION_COMMAND) {
    const commandName = interaction.data?.name;
    const keyword =
      interaction.data?.options?.find((option: { name: string; value?: string }) => {
        return option.name === "keyword";
      })?.value ?? "";

    if (commandName === "kether") {
      const data = await buildKetherMessage(keyword);

      return jsonResponse({
        type: RESPONSE_TYPE.CHANNEL_MESSAGE_WITH_SOURCE,
        data,
      });
    }
  }

  return jsonResponse({
    type: RESPONSE_TYPE.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: "小希還沒學會這個指令喵。",
      flags: 64,
    },
  });
}

export async function GET() {
  return jsonResponse({
    ok: true,
    name: "KETHER Discord Bot Price Endpoint",
  });
}
