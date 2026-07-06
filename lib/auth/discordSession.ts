import { createHmac, timingSafeEqual } from "crypto";

export const DISCORD_SESSION_COOKIE_NAME = "kether_discord_session";
export const DISCORD_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type DiscordSessionPayload = {
  sub: string;
  username: string | null;
  globalName: string | null;
  avatar: string | null;
  banner: string | null;
  accentColor: number | null;
  avatarDecorationAsset: string | null;
  nameplatePalette: string | null;
  guildId: string;
  roleIds: string[];
  iat: number;
  exp: number;
};

type BuildSessionPayloadArgs = {
  discordUser: {
    id: string;
    username: string | null;
    globalName: string | null;
    avatar: string | null;
    banner?: string | null;
    accentColor?: number | null;
    avatarDecorationAsset?: string | null;
    nameplatePalette?: string | null;
  };
  guildId: string;
  roleIds: string[];
};

function encodeBase64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

function signSessionPayload(unsignedPayload: string, secret: string) {
  return createHmac("sha256", secret).update(unsignedPayload).digest("base64url");
}

export function buildDiscordSessionPayload(args: BuildSessionPayloadArgs): DiscordSessionPayload {
  const now = Math.floor(Date.now() / 1000);

  return {
    sub: args.discordUser.id,
    username: args.discordUser.username,
    globalName: args.discordUser.globalName,
    avatar: args.discordUser.avatar,
    banner: args.discordUser.banner ?? null,
    accentColor: args.discordUser.accentColor ?? null,
    avatarDecorationAsset: args.discordUser.avatarDecorationAsset ?? null,
    nameplatePalette: args.discordUser.nameplatePalette ?? null,
    guildId: args.guildId,
    roleIds: args.roleIds,
    iat: now,
    exp: now + DISCORD_SESSION_MAX_AGE_SECONDS
  };
}

export function createDiscordSessionCookieValue(payload: DiscordSessionPayload, secret: string) {
  const unsignedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = signSessionPayload(unsignedPayload, secret);

  return `${unsignedPayload}.${signature}`;
}

export function verifyDiscordSessionCookieValue(value: string, secret: string) {
  const [unsignedPayload, signature] = value.split(".");

  if (!unsignedPayload || !signature) {
    return null;
  }

  const expectedSignature = signSessionPayload(unsignedPayload, secret);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(unsignedPayload, "base64url").toString("utf-8")) as DiscordSessionPayload;
    const now = Math.floor(Date.now() / 1000);

    if (!payload.sub || !payload.guildId || !Array.isArray(payload.roleIds) || payload.exp <= now) {
      return null;
    }

    return {
      ...payload,
      banner: payload.banner ?? null,
      accentColor: payload.accentColor ?? null,
      avatarDecorationAsset: payload.avatarDecorationAsset ?? null,
      nameplatePalette: payload.nameplatePalette ?? null
    };
  } catch {
    return null;
  }
}
