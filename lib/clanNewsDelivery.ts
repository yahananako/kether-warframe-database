import { buildDiscordMessage, resolveNewsChannel, taipeiDate, validateBulletin } from "./clanNews";
import type { NewsStore } from "./clanNews";

export const MARKET_TITLE = "📊 Warframe Market 今日白金行情";
type Embed = { title?: string; description?: string; url?: string; color?: number; fields?: { name: string; value: string; inline?: boolean }[]; footer?: { text: string; icon_url?: string }; image?: { url: string }; thumbnail?: { url: string }; timestamp?: string };
type Message = { id: string; channel_id: string; author: { id: string }; content: string; embeds: Embed[] };
type Dependencies = { guildId: string; now?: Date; bot: <T = unknown>(path: string, init?: RequestInit) => Promise<T>; store: NewsStore };

export async function readNewsDelivery(deps: Dependencies) {
  const target = await resolveNewsChannel(deps.bot, deps.guildId);
  const date = taipeiDate(deps.now);
  const delivery = await deps.store.get(date, target.channelId);
  if (delivery?.status !== "sent" || !/^\d{17,20}$/.test(delivery.messageId ?? "")) throw new Error("No confirmed delivery for today");
  const path = `/channels/${target.channelId}/messages/${delivery.messageId}`;
  const message = await deps.bot<Message>(path, { signal: AbortSignal.timeout(10000) });
  // Earlier deployments emitted literal backslash-n; recognize but preserve them.
  const lines = message.content?.replaceAll("\\n", "\n").split("\n");
  if (message.id !== delivery.messageId || message.channel_id !== target.channelId || message.author?.id !== target.botId || lines?.[0] !== "📰 **Keter每日新聞**" || lines?.[1] !== date.replaceAll("-", "/") || !Array.isArray(message.embeds)) throw new Error("Delivered bulletin identity mismatch");
  return { target, date, path, message };
}

export function summarizeNewsDelivery(d: Awaited<ReturnType<typeof readNewsDelivery>>) {
  return { verified: true, ...d.target, date: d.date, messageId: d.message.id, messageUrl: `https://discord.com/channels/${d.target.guildId}/${d.target.channelId}/${d.message.id}`, marketEmbeds: d.message.embeds.filter(e => e.title === MARKET_TITLE) };
}

// Keep authored fields, excluding Discord's generated proxy/provider metadata.
function writableEmbed(e: Embed): Embed {
  return { ...(e.title ? { title: e.title } : {}), ...(e.description ? { description: e.description } : {}), ...(e.url ? { url: e.url } : {}), ...(e.color === undefined ? {} : { color: e.color }), ...(e.fields ? { fields: e.fields } : {}), ...(e.footer ? { footer: { text: e.footer.text, ...(e.footer.icon_url ? { icon_url: e.footer.icon_url } : {}) } } : {}), ...(e.image ? { image: { url: e.image.url } } : {}), ...(e.thumbnail ? { thumbnail: { url: e.thumbnail.url } } : {}), ...(e.timestamp ? { timestamp: e.timestamp } : {}) };
}

export async function refreshNewsMarket(input: unknown, deps: Dependencies) {
  const bulletin = validateBulletin(input, deps.now);
  if (bulletin.market?.status !== "verified") throw new Error("Today's market snapshot is not verified");
  const before = await readNewsDelivery(deps);
  const market = buildDiscordMessage(bulletin).embeds.at(-1)!;
  const news = before.message.embeds.filter(e => e.title !== MARKET_TITLE).map(writableEmbed);
  const embeds: Embed[] = [...news, market];
  const size = embeds.reduce((n, e) => n + (e.title?.length ?? 0) + (e.description?.length ?? 0) + (e.footer?.text.length ?? 0) + (e.fields?.reduce((m, f) => m + f.name.length + f.value.length, 0) ?? 0), 0);
  if (embeds.length > 10 || size > 6000) throw new Error("Market update exceeds Discord embed budget");
  await deps.bot(before.path, { method: "PATCH", body: JSON.stringify({ embeds, allowed_mentions: { parse: [] } }), signal: AbortSignal.timeout(15000) });
  // A successful PATCH alone is insufficient: verify what Discord now returns.
  const after = await readNewsDelivery(deps);
  const actual = after.message.embeds.filter(e => e.title === MARKET_TITLE);
  const afterNews = after.message.embeds.filter(e => e.title !== MARKET_TITLE).map(writableEmbed);
  if (after.message.id !== before.message.id || after.message.content !== before.message.content || JSON.stringify(afterNews) !== JSON.stringify(news) || actual.length !== 1 || actual[0].description !== market.description || actual[0].footer?.text !== market.footer.text || actual[0].url !== market.url) throw new Error("Market update readback mismatch");
  return { ...summarizeNewsDelivery(after), updated: true };
}
