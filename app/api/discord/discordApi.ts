const DISCORD_API_BASE = "https://discord.com/api/v10";

export class DiscordApiError extends Error {
  status: number;
  details: string;

  constructor(message: string, status: number, details = "") {
    super(message);
    this.name = "DiscordApiError";
    this.status = status;
    this.details = details;
  }
}

function getBotToken() {
  const token = process.env.DISCORD_BOT_TOKEN?.trim();

  if (!token) {
    throw new Error("缺少 DISCORD_BOT_TOKEN，無法操作 Discord 身分組或訊息。");
  }

  return token;
}

export async function discordBotFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${DISCORD_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bot ${getBotToken()}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new DiscordApiError(
      `Discord API 回傳 ${response.status}。`,
      response.status,
      responseText.slice(0, 500),
    );
  }

  if (!responseText) {
    return undefined as T;
  }

  return JSON.parse(responseText) as T;
}

export async function editOriginalInteractionResponse(
  applicationId: string,
  interactionToken: string,
  data: Record<string, unknown>,
) {
  const { flags: _initialResponseFlags, ...messageData } = data;
  const response = await fetch(
    `${DISCORD_API_BASE}/webhooks/${encodeURIComponent(applicationId)}/${encodeURIComponent(interactionToken)}/messages/@original`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messageData),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const responseText = await response.text();
    throw new DiscordApiError(
      `無法更新 Discord 延遲回覆（${response.status}）。`,
      response.status,
      responseText.slice(0, 500),
    );
  }
}

export function getInteractionUser(interaction: any) {
  return interaction.member?.user ?? interaction.user ?? null;
}

export function getInteractionUserId(interaction: any) {
  return String(getInteractionUser(interaction)?.id ?? "");
}

export function getInteractionDisplayName(interaction: any) {
  const user = getInteractionUser(interaction);

  return String(
    interaction.member?.nick ||
      user?.global_name ||
      user?.username ||
      user?.id ||
      "未知成員",
  );
}

export function ephemeralMessage(content: string) {
  return {
    content,
    flags: 64,
    allowed_mentions: { parse: [] },
  };
}
