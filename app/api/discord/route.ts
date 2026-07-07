import crypto from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_URL = "https://kether-warframe-database.vercel.app";
const MARKET_API = "https://api.warframe.market/v2";
const MARKET_SITE = "https://warframe.market/items";
const MARKET_ASSETS_URL = "https://warframe.market/static/assets/";

const INTERACTION_TYPE = {
  PING: 1,
  APPLICATION_COMMAND: 2,
  APPLICATION_COMMAND_AUTOCOMPLETE: 4,
};

const RESPONSE_TYPE = {
  PONG: 1,
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
  APPLICATION_COMMAND_AUTOCOMPLETE_RESULT: 8,
};

type MarketItem = {
  name: string;
  slug: string;
  language: string;
  imageUrl?: string;
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

function getNestedValue(source: any, path: string[]) {
  let current = source;

  for (const key of path) {
    if (!current || typeof current !== "object") {
      return undefined;
    }

    current = current[key];
  }

  return current;
}

function pickLocalizedName(item: any, language: string) {
  const languageKeys = [
    language,
    language.replace("-", "_"),
    language === "zh-hant" ? "zh" : language,
    "en",
  ];

  const possiblePaths: string[][] = [];

  for (const key of languageKeys) {
    possiblePaths.push([key, "name"]);
    possiblePaths.push([key, "item_name"]);
    possiblePaths.push(["i18n", key, "name"]);
    possiblePaths.push(["i18n", key, "item_name"]);
  }

  possiblePaths.push(["name"]);
  possiblePaths.push(["item_name"]);
  possiblePaths.push(["title"]);

  for (const path of possiblePaths) {
    const value = getNestedValue(item, path);

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function pickSlug(item: any) {
  const possibleValues = [
    item?.slug,
    item?.url_name,
    item?.urlName,
    item?.id,
    item?.uniqueName,
  ];

  for (const value of possibleValues) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function collectRawItems(source: any): any[] {
  if (!source) {
    return [];
  }

  if (Array.isArray(source)) {
    return source;
  }

  const candidates = [
    source?.data?.items,
    source?.data,
    source?.payload?.items,
    source?.items,
    source?.results,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }

    if (candidate && typeof candidate === "object") {
      const values = Object.values(candidate);

      if (values.length > 0) {
        return values;
      }
    }
  }

  return [];
}


function buildMarketAssetUrl(value: string) {
  if (!value || typeof value !== "string") {
    return undefined;
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  const cleanPath = value.startsWith("/") ? value.slice(1) : value;

  return `${MARKET_ASSETS_URL}${cleanPath}`;
}

function pickItemImageUrl(item: any, language: string) {
  const languageKeys = [
    language,
    language.replace("-", "_"),
    language === "zh-hant" ? "zh" : language,
    "en",
  ];

  const possiblePaths: string[][] = [];

  for (const key of languageKeys) {
    possiblePaths.push([key, "thumb"]);
    possiblePaths.push([key, "icon"]);
    possiblePaths.push(["i18n", key, "thumb"]);
    possiblePaths.push(["i18n", key, "icon"]);
  }

  possiblePaths.push(["thumb"]);
  possiblePaths.push(["icon"]);
  possiblePaths.push(["image"]);
  possiblePaths.push(["imageUrl"]);

  for (const path of possiblePaths) {
    const value = getNestedValue(item, path);

    if (typeof value === "string" && value.trim()) {
      return buildMarketAssetUrl(value.trim());
    }
  }

  return undefined;
}

async function findMarketItemImageUrl(slug: string) {
  if (!slug) {
    return undefined;
  }

  const items = await getMarketItems();
  const matchedItem = items.find((item) => item.slug === slug && item.imageUrl);

  return matchedItem?.imageUrl;
}

function getSlugFromMarketUrl(source: string) {
  if (!source.startsWith("http")) {
    return "";
  }

  return source.split("/").filter(Boolean).pop() ?? "";
}


async function fetchMarketItemsByLanguage(language: string): Promise<MarketItem[]> {
  const response = await fetch(`${MARKET_API}/items`, {
    headers: {
      Accept: "application/json",
      Language: language,
      Platform: "pc",
      "User-Agent": "KETHER-Warframe-Database Discord price bot",
    },
    next: {
      revalidate: 21600,
    },
  });

  if (!response.ok) {
    console.error(`Warframe.Market items error: ${response.status}`);
    return [];
  }

  const data = await response.json();
  const rawItems = collectRawItems(data);

  return rawItems
    .map((item: any) => {
      const slug = pickSlug(item);
      const name = pickLocalizedName(item, language);

      if (!slug || !name) {
        return null;
      }

      return {
        name,
        slug,
        language,
        imageUrl: pickItemImageUrl(item, language),
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

async function fetchOrders(slug: string, rank: number | null = null): Promise<MarketOrder[]> {
  const params = new URLSearchParams({
    platform: "pc",
  });

  if (typeof rank === "number") {
    params.set("rank", String(rank));
  }

  const response = await fetch(`${MARKET_API}/orders/item/${slug}/top?${params.toString()}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "KETHER-Warframe-Database Discord price bot",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(`Warframe.Market orders error: ${response.status} ${message.slice(0, 120)}`);
  }

  const data = await response.json();
  const sellOrders = Array.isArray(data?.data?.sell) ? data.data.sell : [];
  const buyOrders = Array.isArray(data?.data?.buy) ? data.data.buy : [];

  const normalizeOrder = (order: any, orderType: "sell" | "buy"): MarketOrder => {
    const platinum = Number(order.platinum ?? order.price ?? 0);
    const modRank =
      typeof order.mod_rank === "number"
        ? order.mod_rank
        : typeof order.rank === "number"
          ? order.rank
          : undefined;

    return {
      order_type: orderType,
      platinum,
      quantity: Number(order.quantity ?? 1),
      visible: order.visible ?? true,
      mod_rank: modRank,
      user: {
        status: order.user?.status,
        ingame_name: order.user?.ingame_name ?? order.user?.ingameName,
      },
    };
  };

  return [
    ...sellOrders.map((order: any) => normalizeOrder(order, "sell")),
    ...buyOrders.map((order: any) => normalizeOrder(order, "buy")),
  ].filter((order) => typeof order.platinum === "number" && order.platinum > 0);
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

function parseRankOption(value: string) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return null;
  }

  const match = normalized.match(/rank\s*(\d+)|r\s*(\d+)|(\d+)/i);
  const rank = Number(match?.[1] ?? match?.[2] ?? match?.[3]);

  if (Number.isInteger(rank) && rank >= 0 && rank <= 10) {
    return rank;
  }

  return null;
}

function getRankLabel(rank: number) {
  if (rank === 0) {
    return "Rank 0 / 未升級";
  }

  if (rank === 10) {
    return "Rank 10 / 常見滿等";
  }

  return `Rank ${rank}`;
}

async function buildMarketPriceMessage(rawKeyword: string, forcedRank: number | null = null) {
  const rankInfo = parseRank(rawKeyword);

  if (typeof forcedRank === "number") {
    rankInfo.rank = forcedRank;
    rankInfo.rankLabel = getRankLabel(forcedRank);
  }

  const keyword = rankInfo.cleanKeyword;

  if (!keyword) {
    return null;
  }

  const item = await resolveMarketItem(keyword);

  if (!item) {
    return null;
  }

  const orders = await fetchOrders(item.slug, rankInfo.rank);
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
    `想查指定等級可以用：/price item: ${keyword} rank: Rank 10`,
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

function buildHelpMessage() {
  return [
    "**KETHER Warframe Bot 使用說明**",
    "",
    "**查白金價格**",
    "`/price item: 激昂射擊 rank: Rank 0`",
    "查 Warframe.Market 未升級價格。",
    "",
    "`/price item: 激昂射擊 rank: Rank 10`",
    "查常見滿等價格。",
    "",
    "**查資料庫連結**",
    "`/kether keyword: MOD`",
    "查 KETHER MOD 資料庫連結。",
    "",
    "`/kether keyword: 官方`",
    "查官方公告。",
    "",
    "`/kether keyword: 個人進度`",
    "查 Discord 登入後的個人進度頁。",
    "",
    "**小提示**",
    "在 `/price item:` 輸入一個字，就會跳出物品選項喵。",
  ].join("\n");
}

function cleanDiscordText(value: string) {
  return value.replace(/\*\*/g, "").trim();
}

function readLineValue(lines: string[], prefix: string) {
  const line = lines.find((item) => item.startsWith(prefix));

  if (!line) {
    return "無資料";
  }

  return line.replace(prefix, "").trim();
}

async function buildMarketPriceEmbedData(rawKeyword: string, forcedRank: number | null = null) {
  const priceMessage = await buildMarketPriceMessage(rawKeyword, forcedRank);

  if (!priceMessage) {
    return null;
  }

  const lines = priceMessage.split("\n").map((line) => line.trim()).filter(Boolean);
  const title = cleanDiscordText(lines[0] ?? "Warframe.Market 查價結果");
  const platform = readLineValue(lines, "平台：");
  const rank = readLineValue(lines, "等級：");
  const lowestSell = readLineValue(lines, "最低賣單：");
  const highestBuy = readLineValue(lines, "最高收購：");
  const topSell = readLineValue(lines, "前 5 賣單：");
  const topBuy = readLineValue(lines, "前 5 收購：");
  const source = readLineValue(lines, "來源：");

  const fields: Array<{ name: string; value: string; inline?: boolean }> = [
    {
      name: "平台",
      value: platform,
      inline: true,
    },
    {
      name: "等級",
      value: rank,
      inline: true,
    },
    {
      name: "最低賣單",
      value: lowestSell,
      inline: true,
    },
    {
      name: "最高收購",
      value: highestBuy,
      inline: true,
    },
    {
      name: "前 5 賣單",
      value: topSell,
      inline: false,
    },
    {
      name: "前 5 收購",
      value: topBuy,
      inline: false,
    },
  ];

  const imageUrl = await findMarketItemImageUrl(getSlugFromMarketUrl(source));

  return {
    embeds: [
      {
        title,
        url: source.startsWith("http") ? source : undefined,
        description: "Warframe.Market 即時白金查價",
        color: 16754671,
        thumbnail: imageUrl ? { url: imageUrl } : undefined,
        fields,
        footer: {
          text: "KETHER Warframe Database｜資料來源：Warframe.Market",
        },
        timestamp: new Date().toISOString(),
      },
    ],
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


function truncateChoiceName(value: string) {
  return value.length > 100 ? `${value.slice(0, 97)}...` : value;
}

function getFocusedOptionValue(interaction: any, names: string[]) {
  const options = interaction.data?.options;

  if (!Array.isArray(options)) {
    return "";
  }

  for (const option of options) {
    if (names.includes(option.name) && option.focused === true) {
      return typeof option.value === "string" ? option.value : "";
    }
  }

  return "";
}

function getItemDisplayName(slug: string, names: Set<string>) {
  const manual = MANUAL_DISPLAY[slug];

  if (manual) {
    return `${manual.zh} / ${manual.en}`;
  }

  const nameList = [...names].filter(Boolean);
  const zhName = nameList.find((name) => /[\u4e00-\u9fff]/.test(name));
  const enName = nameList.find((name) => /^[a-z0-9][a-z0-9\s:'’()&.-]+$/i.test(name));

  if (zhName && enName && normalizeText(zhName) !== normalizeText(enName)) {
    return `${zhName} / ${enName}`;
  }

  return zhName ?? enName ?? slug.replace(/_/g, " ");
}

async function buildPriceAutocompleteChoices(rawKeyword: string) {
  const keyword = normalizeText(rawKeyword);

  if (!keyword) {
    return Object.entries(MANUAL_DISPLAY).slice(0, 25).map(([slug, display]) => ({
      name: truncateChoiceName(`${display.zh} / ${display.en}`),
      value: slug,
    }));
  }

  const items = await getMarketItems();
  const grouped = new Map<string, { slug: string; names: Set<string> }>();

  for (const item of items) {
    const current = grouped.get(item.slug) ?? {
      slug: item.slug,
      names: new Set<string>(),
    };

    current.names.add(item.name);
    grouped.set(item.slug, current);
  }

  for (const [alias, slug] of Object.entries(MANUAL_ALIASES)) {
    const current = grouped.get(slug) ?? {
      slug,
      names: new Set<string>(),
    };

    current.names.add(alias);

    const manual = MANUAL_DISPLAY[slug];

    if (manual) {
      current.names.add(manual.zh);
      current.names.add(manual.en);
    }

    grouped.set(slug, current);
  }

  const scored = [...grouped.values()]
    .map((item) => {
      const displayName = getItemDisplayName(item.slug, item.names);
      const haystack = normalizeText([
        item.slug,
        item.slug.replace(/_/g, " "),
        displayName,
        ...item.names,
      ].join(" "));

      if (!haystack.includes(keyword)) {
        return null;
      }

      let score = 10;

      if (haystack.startsWith(keyword)) {
        score = 0;
      } else if ([...item.names].some((name) => normalizeText(name).startsWith(keyword))) {
        score = 1;
      } else if (normalizeText(item.slug.replace(/_/g, " ")).startsWith(keyword)) {
        score = 2;
      }

      return {
        score,
        name: truncateChoiceName(displayName),
        value: item.slug,
      };
    })
    .filter((item): item is { score: number; name: string; value: string } => Boolean(item))
    .sort((a, b) => {
      if (a.score !== b.score) {
        return a.score - b.score;
      }

      return a.name.localeCompare(b.name);
    })
    .slice(0, 25)
    .map(({ name, value }) => ({
      name,
      value,
    }));

  return scored;
}


function getOptionValue(interaction: any, names: string[]) {
  const options = interaction.data?.options;

  if (!Array.isArray(options)) {
    return "";
  }

  for (const name of names) {
    const value = options.find((option: { name: string; value?: string }) => {
      return option.name === name;
    })?.value;

    if (typeof value === "string") {
      return value;
    }
  }

  return "";
}


/* KETHER_WARFRAME_PROFILE_CARD_HELPERS_START */
type KetherWarframeProfile = {
  discordId: string;
  displayName: string;
  warframeId: string;
  platform: string;
  masteryRank: string;
  playtimeHours?: number;
  platinum?: number;
  platinumPrivacy: "private" | "public";
  mainFrame?: string;
  clanRole?: string;
  note?: string;
  updatedAt: string;
};

const KETHER_WARFRAME_PROFILES: Record<string, KetherWarframeProfile> = {
  "你的Discord使用者ID": {
    discordId: "你的Discord使用者ID",
    displayName: "小希",
    warframeId: "Yahananako",
    platform: "PC",
    masteryRank: "MR18",
    playtimeHours: 1280,
    platinum: 300,
    platinumPrivacy: "private",
    mainFrame: "Yareli / 雅蕾莉",
    clanRole: "座天使",
    note: "撒滿櫻花的花海",
    updatedAt: "2026/07/07",
  },
};

function getKetherDiscordAvatarUrl(user: any) {
  if (!user?.id || !user?.avatar) return undefined;

  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`;
}

function buildKetherWarframeProfileEmbed(interaction: any) {
  const targetId = interaction.data?.target_id;
  const targetUser = targetId
    ? interaction.data?.resolved?.users?.[targetId]
    : null;

  const viewerId =
    interaction.member?.user?.id ||
    interaction.user?.id ||
    "";

  const profile = targetId
    ? KETHER_WARFRAME_PROFILES[targetId] ?? null
    : null;

  const displayName =
    profile?.displayName ||
    targetUser?.global_name ||
    targetUser?.username ||
    "未知 Tenno";

  const avatarUrl = getKetherDiscordAvatarUrl(targetUser);

  if (!profile) {
    return {
      title: "🌸 KETHER Tenno 名片",
      description:
        `**${displayName}** 尚未建立 Warframe 名片。\n\n之後可以加入 /bind-warframe，讓成員自己綁定資料。`,
      color: 0xf6a6c8,
      thumbnail: avatarUrl ? { url: avatarUrl } : undefined,
      fields: [
        {
          name: "狀態",
          value: "未綁定",
          inline: true,
        },
      ],
      footer: {
        text: "KETHER Warframe Database",
      },
    };
  }

  const canSeePrivate = viewerId === targetId;

  const platinumText =
    profile.platinumPrivacy === "public" || canSeePrivate
      ? typeof profile.platinum === "number"
        ? `${profile.platinum} 白金`
        : "未填寫"
      : "本人可見";

  return {
    title: "🌸 KETHER Tenno 名片",
    description: `**${displayName}**\n${profile.note ?? "星圖漂流中"}`,
    color: 0xf6a6c8,
    thumbnail: avatarUrl ? { url: avatarUrl } : undefined,
    fields: [
      {
        name: "Warframe ID",
        value: profile.warframeId,
        inline: true,
      },
      {
        name: "平台",
        value: profile.platform,
        inline: true,
      },
      {
        name: "階位",
        value: profile.masteryRank,
        inline: true,
      },
      {
        name: "遊玩時長",
        value:
          typeof profile.playtimeHours === "number"
            ? `${profile.playtimeHours} 小時`
            : "未填寫",
        inline: true,
      },
      {
        name: "白金",
        value: platinumText,
        inline: true,
      },
      {
        name: "主戰甲",
        value: profile.mainFrame ?? "未填寫",
        inline: true,
      },
      {
        name: "氏族階級",
        value: profile.clanRole ?? "未填寫",
        inline: true,
      },
      {
        name: "最後更新",
        value: profile.updatedAt,
        inline: true,
      },
    ],
    footer: {
      text: "KETHER Warframe Database",
    },
  };
}
/* KETHER_WARFRAME_PROFILE_CARD_HELPERS_END */


/* KETHER_OFFICIAL_WARFRAME_PROFILE_HELPERS_START */
const WARFRAME_PROFILE_ENDPOINTS: Record<string, string> = {
  pc: "https://api.warframe.com/cdn/getProfileViewingData.php",
  ps: "https://api-ps4.warframe.com/cdn/getProfileViewingData.php",
  xbox: "https://api-xb1.warframe.com/cdn/getProfileViewingData.php",
  switch: "https://api-swi.warframe.com/cdn/getProfileViewingData.php",
  ios: "https://api-mob.warframe.com/cdn/getProfileViewingData.php",
  android: "https://api-and.warframe.com/cdn/getProfileViewingData.php",
};

function getProfileNestedValue(source: any, paths: string[][]) {
  for (const path of paths) {
    let current = source;

    for (const key of path) {
      if (!current || typeof current !== "object") {
        current = undefined;
        break;
      }

      current = current[key];
    }

    if (current !== undefined && current !== null && String(current).trim() !== "") {
      return current;
    }
  }

  return null;
}

function formatProfileValue(value: any) {
  if (value === null || value === undefined || String(value).trim() === "") {
    return "未在回傳中辨識";
  }

  return String(value).slice(0, 120);
}

function formatProfilePlaytime(value: any) {
  const numeric = Number(value);

  if (!Number.isFinite(numeric) || numeric <= 0) {
    return "未在回傳中辨識";
  }

  if (numeric > 100000) {
    return `${Math.round(numeric / 3600)} 小時`;
  }

  return `${Math.round(numeric)} 小時`;
}

function getWarframeProfileEndpoint(platform: string, playerId: string) {
  const normalizedPlatform = platform.toLowerCase().trim();
  const baseUrl = WARFRAME_PROFILE_ENDPOINTS[normalizedPlatform];

  if (!baseUrl) {
    throw new Error(`不支援的平台：${platform}`);
  }

  const url = new URL(baseUrl);
  url.searchParams.set("playerId", playerId.trim());
  return url.toString();
}

async function fetchOfficialWarframeProfile(playerId: string, platform: string) {
  const url = getWarframeProfileEndpoint(platform, playerId);

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "KETHER-Warframe-Database Discord official profile test",
    },
    cache: "no-store",
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Warframe official profile HTTP ${response.status}: ${text.slice(0, 160)}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Warframe official profile 回傳不是 JSON：${text.slice(0, 160)}`);
  }
}

async function buildOfficialWarframeProfileEmbed(interaction: any) {
  const playerId = getOptionValue(interaction, ["player_id", "playerid"]);
  const platform = (getOptionValue(interaction, ["platform"]) || "pc").toLowerCase();

  if (!playerId) {
    return {
      title: "Warframe 官方 Profile 測試",
      description: "缺少 player_id。請使用 `/warframe-profile player_id:<AccountID> platform:pc`。",
      color: 0xf6a6c8,
    };
  }

  const data = await fetchOfficialWarframeProfile(playerId, platform);
  const topKeys = Object.keys(data ?? {}).slice(0, 16);

  const displayName = getProfileNestedValue(data, [
    ["DisplayName"],
    ["displayName"],
    ["playerName"],
    ["username"],
    ["account", "displayName"],
    ["profile", "displayName"],
  ]);

  const masteryRank = getProfileNestedValue(data, [
    ["PlayerLevel"],
    ["playerLevel"],
    ["MasteryRank"],
    ["masteryRank"],
    ["profile", "playerLevel"],
    ["profile", "masteryRank"],
    ["AccountInfo", "PlayerLevel"],
  ]);

  const clanName = getProfileNestedValue(data, [
    ["GuildName"],
    ["guildName"],
    ["ClanName"],
    ["clanName"],
    ["guild", "name"],
    ["clan", "name"],
    ["profile", "guildName"],
  ]);

  const playtime = getProfileNestedValue(data, [
    ["TimePlayedSec"],
    ["timePlayedSec"],
    ["timePlayedSeconds"],
    ["PlaytimeSeconds"],
    ["playtimeSeconds"],
    ["Stats", "TimePlayedSec"],
    ["stats", "timePlayedSec"],
    ["profile", "timePlayedSec"],
  ]);

  const equipmentCount = Array.isArray(data?.Equipment)
    ? data.Equipment.length
    : Array.isArray(data?.equipment)
      ? data.equipment.length
      : Array.isArray(data?.LoadOutPresets)
        ? data.LoadOutPresets.length
        : null;

  return {
    title: "Warframe 官方 Profile 測試",
    description:
      "A-1 測試：已成功讀取官方 Profile JSON。\n" +
      "欄位名稱可能因平台或版本不同，這次先回報可辨識資料與 JSON 結構。",
    color: 0xf6a6c8,
    fields: [
      {
        name: "平台",
        value: platform,
        inline: true,
      },
      {
        name: "playerId",
        value: playerId,
        inline: true,
      },
      {
        name: "玩家名稱",
        value: formatProfileValue(displayName),
        inline: true,
      },
      {
        name: "階位 / Mastery",
        value: formatProfileValue(masteryRank),
        inline: true,
      },
      {
        name: "氏族 / Clan",
        value: formatProfileValue(clanName),
        inline: true,
      },
      {
        name: "遊玩時間",
        value: formatProfilePlaytime(playtime),
        inline: true,
      },
      {
        name: "裝備資料數",
        value: equipmentCount === null ? "未在回傳中辨識" : String(equipmentCount),
        inline: true,
      },
      {
        name: "JSON top-level keys",
        value: topKeys.length > 0 ? topKeys.join(", ").slice(0, 1000) : "無",
        inline: false,
      },
    ],
    footer: {
      text: "KETHER BOT v3 A-1 官方資料讀取測試",
    },
    timestamp: new Date().toISOString(),
  };
}
/* KETHER_OFFICIAL_WARFRAME_PROFILE_HELPERS_END */

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

  if (interaction.type === INTERACTION_TYPE.APPLICATION_COMMAND_AUTOCOMPLETE) {
    const commandName = interaction.data?.name;

    if (commandName === "price") {
      const focusedValue = getFocusedOptionValue(interaction, ["item", "keyword"]);
      const choices = await buildPriceAutocompleteChoices(focusedValue);

      return jsonResponse({
        type: RESPONSE_TYPE.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
        data: {
          choices,
        },
      });
    }

    return jsonResponse({
      type: RESPONSE_TYPE.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
      data: {
        choices: [],
      },
    });
  }

  if (interaction.type === INTERACTION_TYPE.APPLICATION_COMMAND) {
    // KETHER_WARFRAME_PROFILE_CARD_HANDLER_START
    if (
      interaction.data?.type === 2 &&
      interaction.data?.name === "查看 Warframe 名片"
    ) {
      const embed = buildKetherWarframeProfileEmbed(interaction);

      return jsonResponse({
        type: RESPONSE_TYPE.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: 64,
          embeds: [embed],
          allowed_mentions: {
            parse: [],
          },
        },
      });
    }
    // KETHER_WARFRAME_PROFILE_CARD_HANDLER_END

    const commandName = interaction.data?.name;
    const keyword = getOptionValue(interaction, ["keyword"]);
    const item = getOptionValue(interaction, ["item", "keyword"]);
    const rankOption = getOptionValue(interaction, ["rank"]);
    const selectedRank = parseRankOption(rankOption);


    if (commandName === "warframe-profile") {
      try {
        const embed = await buildOfficialWarframeProfileEmbed(interaction);

        return jsonResponse({
          type: RESPONSE_TYPE.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            flags: 64,
            embeds: [embed],
            allowed_mentions: { parse: [] },
          },
        });
      } catch (error) {
        console.error(error);

        return jsonResponse({
          type: RESPONSE_TYPE.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            flags: 64,
            content:
              "Warframe 官方 Profile 讀取失敗喵。\n" +
              "請確認 player_id 是否正確、platform 是否選對，或稍後再試。",
          },
        });
      }
    }

    if (commandName === "help") {
      return jsonResponse({
        type: RESPONSE_TYPE.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: buildHelpMessage(),
        },
      });
    }

    if (commandName === "kether") {
      const data = await buildKetherMessage(keyword);

      return jsonResponse({
        type: RESPONSE_TYPE.CHANNEL_MESSAGE_WITH_SOURCE,
        data,
      });
    }

    if (commandName === "price") {
      try {
        const priceData = await buildMarketPriceEmbedData(item, selectedRank);

        return jsonResponse({
          type: RESPONSE_TYPE.CHANNEL_MESSAGE_WITH_SOURCE,
          data: priceData
            ? priceData
            : {
                content:
                  `找不到「${item}」的 Warframe.Market 交易資料喵。\n` +
                  "可以試試英文名稱，或確認這個物品是否可交易。",
                flags: 64,
              },
        });
      } catch (error) {
        console.error(error);

        return jsonResponse({
          type: RESPONSE_TYPE.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content:
              "Warframe.Market 暫時沒有回應喵。\n" +
              "可以等一下再查，或改用 /kether keyword: 首頁。",
            flags: 64,
          },
        });
      }
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
    name: "KETHER Discord Bot Price Image Embed Rank Link and Help Endpoint",
  });
}
