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
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || secret.length < 16) return false;
  const received = Buffer.from(req.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return received.length === expected.length && timingSafeEqual(received, expected);
}
async function loadBulletin() {
  const response = await fetch(CLAN_NEWS_SOURCE, { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error("Verified editorial bulletin is unavailable");
  const body = await response.text();
  if (body.length > 24000) throw new Error("Editorial bulletin is too large");
  return validateBulletin(JSON.parse(body));
}

export async function GET(req: Request) {
  if (!authorized(req)) return reply({ error: "Unauthorized" }, 401);
  try {
    const action = new URL(req.url).searchParams.get("action") ?? "publish";
    if (!["status", "preview", "publish"].includes(action)) return reply({ error: "Invalid action" }, 400);
    if (action === "status") {
      return reply({ ...await resolveNewsChannel(discordBotFetch, process.env.DISCORD_GUILD_ID ?? ""), enabled: process.env.KETHER_CLAN_NEWS_ENABLED === "true" });
    }
    if (action === "publish" && (process.env.KETHER_CLAN_NEWS_ENABLED !== "true" || process.env.VERCEL_ENV !== "production")) {
      return reply({ published: false, reason: "publication-disabled" });
    }
    const bulletin = await loadBulletin();
    if (action === "preview") return reply({ bulletin, message: buildDiscordMessage(bulletin) });
    return reply(await deliverBulletin(bulletin, { guildId: process.env.DISCORD_GUILD_ID ?? "", bot: discordBotFetch, store: clanNewsStore }));
  } catch (error) {
    // Do not log credentials, Discord response bodies, or third-party error text.
    console.error("KETER clan news failed", { kind: error instanceof Error ? error.name : "unknown" });
    return reply({ published: false, error: "News validation or delivery failed; check authenticated status and server logs." }, 502);
  }
}
