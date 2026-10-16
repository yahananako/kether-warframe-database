import { createHash } from "node:crypto";

export const CLAN_NEWS_CHANNEL_ID = "1034104146363699281";
export const CLAN_NEWS_SOURCE = "https://raw.githubusercontent.com/yahananako/kether-warframe-database/main/data/warframe-clan-news.json";

export type ClanArticle = {
  title: string;
  publishedDate: string;
  summary: string;
  memberBenefit: string;
  nextStep?: string;
  sourceUrl: string;
  imageUrl?: string;
  imageSourceUrl?: string;
  category?: "official-news" | "limited-material" | "urgent-mission";
  sourceItemId?: string;
  materialInfo?: string;
  rewards?: string;
  location?: string;
  requirements?: string;
  expiresAt?: string;
};
export type MarketSummary = { status: "verified" | "unavailable"; date: string; updatedCount?: number; totalPlatinum?: number; previousTotalPlatinum?: number; unpriced?: string[] };
export type ClanBulletin = { date: string; articles: ClanArticle[]; noNewsText?: string; liveIntel?: { status: "verified" | "unavailable"; checkedAt: string; note?: string }; market?: MarketSummary };
export type Delivery = { status: "sent" | "sending" | "failed" | "unknown"; messageId?: string };
export type NewsStore = {
  claim: (date: string, channelId: string, hash: string) => Promise<boolean>;
  get: (date: string, channelId: string) => Promise<Delivery | null>;
  finish: (date: string, channelId: string, status: Delivery["status"], messageId?: string) => Promise<void>;
};
type BotRequest = <T = unknown>(path: string, init?: RequestInit) => Promise<T>;

export function taipeiDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}
function dateString(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
}
function text(value: unknown, label: string, max: number, optional = false): string {
  if (optional && value === undefined) return "";
  if (typeof value !== "string" || !value.trim() || value.length > max) throw new Error(`Invalid ${label}`);
  // No pings, deceptive links, or multiline Discord markdown in editorial fields.
  const clean = value.trim().replace(/喵/g, "").replace(/[@<>\[\]`*_~]/g, "").replace(/\s+/g, " ").trim();
  if (!clean) throw new Error(`Empty ${label}`);
  return clean;
}
function timestamp(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) && Number.isFinite(Date.parse(value));
}
function isWorldState(value: string) {
  return value === "https://api.warframe.com/cdn/worldState.php";
}
function officialUrl(value: unknown, image = false): string {
  if (typeof value !== "string" || value.length > 1000) throw new Error("Invalid source URL");
  const url = new URL(value);
  if (!image && isWorldState(url.toString())) return url.toString();
  const hosts = image ? ["www-static.warframe.com", "www.warframe.com"] : ["www.warframe.com", "forums.warframe.com"];
  if (url.protocol !== "https:" || url.username || url.password || url.port || !hosts.includes(url.hostname)) throw new Error("Only official Warframe URLs are allowed");
  if (!image && !(url.hostname === "forums.warframe.com" ? /^\/topic\//.test(url.pathname) : /^\/(?:en|zh-hant)\/news\//.test(url.pathname))) throw new Error("Invalid official article path");
  url.hash = "";
  return url.toString();
}

export function validateBulletin(input: unknown, now = new Date()): ClanBulletin {
  if (!input || typeof input !== "object") throw new Error("Invalid bulletin");
  const b = input as Record<string, unknown>;
  if (!dateString(b.date) || b.date !== taipeiDate(now)) throw new Error("Bulletin must be for today in Asia/Taipei");
  const bulletinDate = b.date;
  if (!Array.isArray(b.articles) || b.articles.length > 5) throw new Error("Expected zero to five articles");
  const seen = new Set<string>();
  let liveIntel: ClanBulletin["liveIntel"];
  if (b.liveIntel !== undefined) {
    const s = b.liveIntel as Record<string, unknown>;
    if (!s || !["verified", "unavailable"].includes(String(s.status)) || !timestamp(s.checkedAt) || Date.parse(s.checkedAt) > now.getTime() || taipeiDate(new Date(s.checkedAt)) !== bulletinDate) throw new Error("Invalid live intelligence snapshot");
    liveIntel = { status: s.status as "verified" | "unavailable", checkedAt: s.checkedAt, note: text(s.note, "liveIntel.note", 250, true) || undefined };
  }
  let market: MarketSummary | undefined;
  if (b.market !== undefined) {
    const m = b.market as Record<string, unknown>;
    if (!m || !["verified", "unavailable"].includes(String(m.status)) || m.date !== bulletinDate) throw new Error("Invalid market summary");
    if (m.status === "verified" && (!Number.isInteger(m.updatedCount) || Number(m.updatedCount) < 0 || !Number.isFinite(m.totalPlatinum) || Number(m.totalPlatinum) < 0)) throw new Error("Invalid verified market figures");
    if (m.previousTotalPlatinum !== undefined && (!Number.isFinite(m.previousTotalPlatinum) || Number(m.previousTotalPlatinum) < 0)) throw new Error("Invalid previous market total");
    if (m.unpriced !== undefined && (!Array.isArray(m.unpriced) || m.unpriced.length > 50 || !m.unpriced.every(x => typeof x === "string" && x.length <= 90 && !/[@<>]/.test(x)))) throw new Error("Invalid unpriced list");
    market = { status: m.status as MarketSummary["status"], date: bulletinDate, updatedCount: m.updatedCount as number | undefined, totalPlatinum: m.totalPlatinum as number | undefined, previousTotalPlatinum: m.previousTotalPlatinum as number | undefined, unpriced: m.unpriced as string[] | undefined };
  }
  const articles = b.articles.map((raw): ClanArticle => {
    if (!raw || typeof raw !== "object") throw new Error("Invalid article");
    const a = raw as Record<string, unknown>;
    if (!dateString(a.publishedDate) || a.publishedDate > bulletinDate) throw new Error("Invalid publication date");
    const sourceUrl = officialUrl(a.sourceUrl);
    const category = a.category ?? "official-news";
    if (!["official-news", "limited-material", "urgent-mission"].includes(String(category))) throw new Error("Invalid news category");
    const sourceItemId = a.sourceItemId === undefined ? undefined : text(a.sourceItemId, "sourceItemId", 100);
    if (isWorldState(sourceUrl) && (!sourceItemId || liveIntel?.status !== "verified")) throw new Error("Live missions require verified snapshot and source item ID");
    if (a.expiresAt !== undefined && !timestamp(a.expiresAt)) throw new Error("Deadline must include its timezone");
    if (isWorldState(sourceUrl) && !a.expiresAt) throw new Error("World-state missions require their actual expiry");
    const key = new URL(sourceUrl).pathname.replace(/^\/(?:en|zh-hant)\//, "/").replace(/\/$/, "") + (isWorldState(sourceUrl) ? `:${sourceItemId}` : "");
    if (seen.has(key)) throw new Error("Duplicate source article");
    seen.add(key);
    return {
      title: text(a.title, "title", 150), publishedDate: a.publishedDate,
      summary: text(a.summary, "summary", 700), memberBenefit: text(a.memberBenefit, "memberBenefit", 300),
      nextStep: text(a.nextStep, "nextStep", 200, true) || undefined,
      sourceUrl, imageUrl: a.imageUrl === undefined ? undefined : officialUrl(a.imageUrl, true),
      imageSourceUrl: a.imageSourceUrl === undefined ? undefined : officialUrl(a.imageSourceUrl),
      category: category as ClanArticle["category"], sourceItemId,
      materialInfo: text(a.materialInfo, "materialInfo", 350, true) || undefined,
      rewards: text(a.rewards, "rewards", 250, true) || undefined,
      location: text(a.location, "location", 120, true) || undefined,
      requirements: text(a.requirements, "requirements", 200, true) || undefined,
      expiresAt: a.expiresAt as string | undefined,
    };
  }).filter((a) => !a.expiresAt || Date.parse(a.expiresAt) > now.getTime());
  const defaultEmpty = b.articles.length ? "本次整理的限時項目已到期，不再列為可參加任務。" : "今日無新增官方消息。";
  return { date: b.date as string, articles, liveIntel, market, noNewsText: articles.length ? undefined : text(b.noNewsText ?? defaultEmpty, "noNewsText", 300) };
}

export function buildDiscordMessage(b: ClanBulletin) {
  const embeds = b.articles.map((a) => ({
    title: a.title, url: a.sourceUrl, description: a.summary, color: 0xd694df,
    fields: [
      { name: isWorldState(a.sourceUrl) ? "查詢日期" : "官方公告日期", value: a.publishedDate, inline: true },
      ...(a.materialInfo ? [{ name: "限時材料／取得方式", value: a.materialInfo }] : []),
      ...(a.rewards ? [{ name: "任務獎勵", value: a.rewards }] : []),
      ...(a.location ? [{ name: "任務地點", value: a.location }] : []),
      ...(a.requirements ? [{ name: "參加條件", value: a.requirements }] : []),
      ...(a.expiresAt ? [{ name: "截止時間（台灣）", value: new Intl.DateTimeFormat("zh-TW", { timeZone: "Asia/Taipei", dateStyle: "short", timeStyle: "short", hour12: false }).format(new Date(a.expiresAt)) }] : []),
      { name: "對氏族成員的幫助", value: a.memberBenefit },
      ...(a.nextStep ? [{ name: "建議行動", value: a.nextStep }] : []),
      ...(a.imageUrl ? [{ name: "圖片來源", value: `[Digital Extremes 官方圖片](${a.imageSourceUrl ?? a.sourceUrl})` }] : [{ name: "配圖", value: "本則未取得可核對的官方圖片。" }]),
    ],
    ...(a.imageUrl ? { image: { url: a.imageUrl } } : {}),
    footer: { text: "Keter BOT · Warframe 氏族情報 · 來源：Digital Extremes" },
  }));
  const total = embeds.reduce((n, e) => n + e.title.length + e.description.length + e.footer.text.length + e.fields.reduce((m, f) => m + f.name.length + f.value.length, 0), 0);
  if (total > 5900) throw new Error("Bulletin exceeds Discord embed size; shorten the articles");
  const intel = b.liveIntel ? `\n限時材料／緊急任務：${b.liveIntel.status === "verified" ? "已核對本次快照；實際狀態以遊戲內導航為準。" : "即時資料暫時無法核對，別把未確認的獎勵當成已開放。"}${b.liveIntel.note ? ` ${b.liveIntel.note}` : ""}` : "";
  const marketLines = b.market?.status === "verified"
    ? [`更新：${b.market.updatedCount} 筆｜總額：${b.market.totalPlatinum?.toLocaleString("en-US")} 白金`,
       ...(b.market.previousTotalPlatinum === undefined ? [] : [`較前次：${((b.market.totalPlatinum ?? 0) - b.market.previousTotalPlatinum).toLocaleString("en-US")} 白金`]),
       ...(b.market.unpriced?.length ? [`無報價：${b.market.unpriced.join("、")}`] : [])]
    : ["今日價格尚未完成驗證，不使用舊價冒充即時行情。"];
  const marketEmbed = {
    title: "📊 Warframe Market 今日白金行情",
    description: marketLines.join("\\n").slice(0, 4000),
    color: 0x48b8cf,
    url: "https://docs.google.com/spreadsheets/d/1ll27z4P_9a9ly2HsxNJdOHW2mzTL8_BHUqLZUtxy9Lc/edit",
    footer: { text: `KETER · ${b.date} · 價格以當日驗證結果為準` },
  };
  const content = `📰 **Keter每日新聞**\\n${b.date.replaceAll("-", "/")}${b.articles.length ? "" : `\\n${b.noNewsText}`}${intel}`;
  if (content.length > 2000) throw new Error("Daily news content exceeds Discord limit");
  if (total + JSON.stringify(marketEmbed).length > 5900) throw new Error("Bulletin with market summary exceeds embed budget");
  return { content, embeds: [...embeds, marketEmbed], allowed_mentions: { parse: [] as string[] }, nonce: `keternews:${b.date}`, enforce_nonce: true };
}

export async function resolveNewsChannel(bot: BotRequest, expectedGuildId: string) {
  expectedGuildId = expectedGuildId.trim();
  if (!/^\d{17,20}$/.test(expectedGuildId)) throw new Error("DISCORD_GUILD_ID is not configured");
  const user = await bot<{ id: string; bot?: boolean }>("/users/@me", { signal: AbortSignal.timeout(10000) });
  if (user.bot !== true) throw new Error("Configured identity is not a Discord BOT");
  const channel = await bot<{ id: string; guild_id?: string; type: number; name?: string }>(`/channels/${CLAN_NEWS_CHANNEL_ID}`, { signal: AbortSignal.timeout(10000) });
  if (channel.id !== CLAN_NEWS_CHANNEL_ID || channel.guild_id !== expectedGuildId || ![0, 5].includes(channel.type)) throw new Error("News destination is not a text/announcement channel in the configured KETER guild");
  return { channelId: channel.id, channelName: channel.name ?? "", guildId: channel.guild_id, botId: user.id };
}

export async function deliverBulletin(input: unknown, deps: { now?: Date; guildId: string; bot: BotRequest; store: NewsStore }) {
  const bulletin = validateBulletin(input, deps.now);
  const message = buildDiscordMessage(bulletin);
  const target = await resolveNewsChannel(deps.bot, deps.guildId);
  const hash = createHash("sha256").update(JSON.stringify(message)).digest("hex");
  if (!await deps.store.claim(bulletin.date, target.channelId, hash)) {
    const previous = await deps.store.get(bulletin.date, target.channelId);
    return { published: false, reason: previous?.status === "sent" ? "already-published" : "delivery-needs-reconciliation", ...target, messageId: previous?.messageId };
  }
  let result: { id: string; channel_id: string };
  try {
    result = await deps.bot(`/channels/${target.channelId}/messages`, { method: "POST", body: JSON.stringify(message), signal: AbortSignal.timeout(15000) });
    if (!result?.id || result.channel_id !== target.channelId) throw new Error("Discord returned an unverified delivery result");
  } catch (error) {
    // Network errors and 5xx may occur AFTER Discord accepted the message.
    // Never blindly retry an ambiguous send; durable unknown state requires review.
    const status = typeof error === "object" && error ? Number((error as { status?: unknown }).status) : 0;
    await deps.store.finish(bulletin.date, target.channelId, [400, 401, 403, 404, 429].includes(status) ? "failed" : "unknown");
    throw error;
  }
  // If this database update fails, the durable sending state blocks further posts.
  await deps.store.finish(bulletin.date, target.channelId, "sent", result.id);
  return { published: true, ...target, messageId: result.id, messageUrl: `https://discord.com/channels/${target.guildId}/${target.channelId}/${result.id}` };
}
