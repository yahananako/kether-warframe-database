import { createHash } from "node:crypto";

export const CLAN_NEWS_CHANNEL_ID = "1034099279708561438";
export const CLAN_NEWS_SOURCE = "https://raw.githubusercontent.com/yahananako/kether-warframe-database/main/data/warframe-clan-news.json";

export type ClanArticle = {
  title: string;
  publishedDate: string;
  summary: string;
  memberBenefit: string;
  nextStep?: string;
  sourceUrl: string;
  imageUrl?: string;
};
export type ClanBulletin = { date: string; articles: ClanArticle[]; noNewsText?: string };
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
  return value.trim().replace(/[@<>\[\]`*_~]/g, "").replace(/\s+/g, " ");
}
function officialUrl(value: unknown, image = false): string {
  if (typeof value !== "string" || value.length > 1000) throw new Error("Invalid source URL");
  const url = new URL(value);
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
  const articles = b.articles.map((raw): ClanArticle => {
    if (!raw || typeof raw !== "object") throw new Error("Invalid article");
    const a = raw as Record<string, unknown>;
    if (!dateString(a.publishedDate) || a.publishedDate > bulletinDate) throw new Error("Invalid publication date");
    const sourceUrl = officialUrl(a.sourceUrl);
    const key = new URL(sourceUrl).pathname.replace(/^\/(?:en|zh-hant)\//, "/").replace(/\/$/, "");
    if (seen.has(key)) throw new Error("Duplicate source article");
    seen.add(key);
    return {
      title: text(a.title, "title", 150), publishedDate: a.publishedDate,
      summary: text(a.summary, "summary", 700), memberBenefit: text(a.memberBenefit, "memberBenefit", 300),
      nextStep: text(a.nextStep, "nextStep", 200, true) || undefined,
      sourceUrl, imageUrl: a.imageUrl === undefined ? undefined : officialUrl(a.imageUrl, true),
    };
  });
  return { date: b.date as string, articles, noNewsText: articles.length ? undefined : text(b.noNewsText ?? "今日無新增官方消息喵。", "noNewsText", 300) };
}

export function buildDiscordMessage(b: ClanBulletin) {
  const embeds = b.articles.map((a) => ({
    title: a.title, url: a.sourceUrl, description: a.summary, color: 0xd694df,
    fields: [
      { name: "官方公告日期", value: a.publishedDate, inline: true },
      { name: "對氏族成員的幫助", value: a.memberBenefit },
      ...(a.nextStep ? [{ name: "建議行動", value: a.nextStep }] : []),
    ],
    ...(a.imageUrl ? { image: { url: a.imageUrl } } : {}),
    footer: { text: "KETER｜Warframe 氏族新聞 · 來源：Digital Extremes" },
  }));
  const total = embeds.reduce((n, e) => n + e.title.length + e.description.length + e.footer.text.length + e.fields.reduce((m, f) => m + f.name.length + f.value.length, 0), 0);
  if (total > 5900) throw new Error("Bulletin exceeds Discord embed size; shorten the articles");
  const content = `📰 **KETER｜Warframe 每日新聞｜${b.date.replaceAll("-", "/")}**${b.articles.length ? "" : `\n${b.noNewsText}`}`;
  return { content, embeds, allowed_mentions: { parse: [] as string[] }, nonce: `keternews:${b.date}`, enforce_nonce: true };
}

export async function resolveNewsChannel(bot: BotRequest, expectedGuildId: string) {
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
