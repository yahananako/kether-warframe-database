import { timingSafeEqual } from "node:crypto";
import { buildDiscordMessage, CLAN_NEWS_SOURCE, deliverBulletin, resolveNewsChannel, validateBulletin } from "../../../../lib/clanNews";
import { clanNewsStore } from "../../../../lib/clanNewsStore";
import { discordBotFetch } from "../discordApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function reply(value: unknown, status = 200) {
  return Response.json(value, { status, headers: { "Cache-Control": "no-store" } });
}
function authorized(req: Request) {
  const received = Buffer.from(req.headers.get("authorization") ?? "");
  return [process.env.CRON_SECRET, process.env.KETER_NEWS_DISPATCH_TOKEN].some((value) => {
    const secret = value?.trim();
    if (!secret || secret.length < 16) return false;
    const expected = Buffer.from(`Bearer ${secret}`);
    return received.length === expected.length && timingSafeEqual(received, expected);
  });
}
async function loadBulletin() {
  const response = await fetch(CLAN_NEWS_SOURCE, { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error("Verified editorial bulletin is unavailable");
  const body = await response.text();
  if (body.length > 24000) throw new Error("Editorial bulletin is too large");
  return validateBulletin(JSON.parse(body));
}

async function newsBotFetch<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  try { return await discordBotFetch<T>(path, init); }
  catch (error) {
    if (error && typeof error === "object") {
      const e = error as { details?: string; newsStage?: string; discordCode?: number };
      e.newsStage = path === "/users/@me" ? "bot-identity" : path.endsWith("/messages") ? "message-send" : "channel-access";
      try {
        const code = JSON.parse(e.details ?? "").code;
        if (Number.isInteger(code) && code >= 0) e.discordCode = code;
      } catch { /* Never return raw upstream bodies. */ }
    }
    throw error;
  }
}

export async function GET(req: Request) {
  if (!authorized(req)) return reply({ error: "Unauthorized" }, 401);
  try {
    const action = new URL(req.url).searchParams.get("action") ?? "publish";
    if (!["status", "preview", "publish"].includes(action)) return reply({ error: "Invalid action" }, 400);
    if (action === "status") {
      return reply({ ...await resolveNewsChannel(newsBotFetch, process.env.DISCORD_GUILD_ID ?? ""), enabled: process.env.KETHER_CLAN_NEWS_ENABLED === "true" });
    }
    if (action === "publish" && (process.env.KETHER_CLAN_NEWS_ENABLED !== "true" || process.env.VERCEL_ENV !== "production")) {
      return reply({ published: false, reason: "publication-disabled" });
    }
    const bulletin = await loadBulletin();
    if (action === "preview") return reply({ bulletin, message: buildDiscordMessage(bulletin) });
    return reply(await deliverBulletin(bulletin, { guildId: process.env.DISCORD_GUILD_ID ?? "", bot: newsBotFetch, store: clanNewsStore }));
  } catch (error) {
    // Do not log credentials, Discord response bodies, or third-party error text.
    console.error("KETER clan news failed", { kind: error instanceof Error ? error.name : "unknown" });
    const known = ["DISCORD_GUILD_ID is not configured", "Configured identity is not a Discord BOT", "News destination is not a text/announcement channel in the configured KETER guild", "缺少 DISCORD_BOT_TOKEN，無法操作 Discord 身分組或訊息。"];
    const message = error instanceof Error ? error.message : "";
    const upstreamStatus = typeof error === "object" && error ? Number((error as { status?: unknown }).status) : 0;
    const diagnostic = error && typeof error === "object" ? error as { newsStage?: string; discordCode?: number } : {};
    return reply({
      published: false,
      error: "News validation or delivery failed; check authenticated status and server logs.",
      reason: known.includes(message) ? message : error instanceof Error ? error.name : "unknown",
      ...(Number.isInteger(upstreamStatus) && upstreamStatus >= 400 && upstreamStatus <= 599 ? { upstreamStatus } : {}),
      ...(["bot-identity", "channel-access", "message-send"].includes(diagnostic.newsStage ?? "") ? { stage: diagnostic.newsStage } : {}),
      ...(Number.isInteger(diagnostic.discordCode) ? { discordCode: diagnostic.discordCode } : {}),
      config: { guildIdConfigured: Boolean(process.env.DISCORD_GUILD_ID?.trim()), botTokenConfigured: Boolean(process.env.DISCORD_BOT_TOKEN?.trim()), databaseConfigured: Boolean(process.env.DATABASE_URL?.trim()) },
    }, 502);
  }
}
