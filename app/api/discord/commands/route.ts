import { discordBotFetch } from "../discordApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GuildCommand = {
  name?: string;
  type?: number;
};

function jsonResponse(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function GET() {
  const applicationId = (
    process.env.DISCORD_APP_ID ||
    process.env.DISCORD_APPLICATION_ID ||
    process.env.DISCORD_CLIENT_ID ||
    ""
  ).trim();
  const guildId = process.env.DISCORD_GUILD_ID?.trim() ?? "";
  const botToken = process.env.DISCORD_BOT_TOKEN?.trim() ?? "";

  if (!applicationId || !guildId || !botToken) {
    return jsonResponse(
      {
        ok: false,
        configured: false,
        message: "Discord 指令健康檢查尚未完成設定。",
      },
      503,
    );
  }

  try {
    const commands = await discordBotFetch<GuildCommand[]>(
      `/applications/${encodeURIComponent(applicationId)}/guilds/${encodeURIComponent(guildId)}/commands`,
    );
    const names = commands
      .map((command) => command.name)
      .filter((name): name is string => typeof name === "string")
      .sort((left, right) => left.localeCompare(right));
    const required = {
      "clan-verify": commands.some(
        (command) => command.type === 1 && command.name === "clan-verify",
      ),
      giveaway: commands.some(
        (command) => command.type === 1 && command.name === "giveaway",
      ),
      price: commands.some(
        (command) => command.type === 1 && command.name === "price",
      ),
      "warframe-card": commands.some(
        (command) => command.type === 1 && command.name === "warframe-card",
      ),
    };

    return jsonResponse({
      ok: Object.values(required).every(Boolean),
      configured: true,
      count: commands.length,
      names,
      required,
    });
  } catch (error) {
    console.error("Discord command health check failed", error);

    return jsonResponse(
      {
        ok: false,
        configured: true,
        message: "Discord 指令健康檢查失敗。",
      },
      503,
    );
  }
}
