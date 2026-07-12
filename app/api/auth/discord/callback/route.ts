import { NextRequest, NextResponse } from "next/server";
import {
  DISCORD_SESSION_COOKIE_NAME,
  DISCORD_SESSION_MAX_AGE_SECONDS,
  buildDiscordSessionPayload,
  createDiscordSessionCookieValue
} from "../../../../../lib/auth/discordSession";

export const runtime = "nodejs";

const DISCORD_TOKEN_URL = "https://discord.com/api/v10/oauth2/token";
const DISCORD_USER_URL = "https://discord.com/api/v10/users/@me";

type DiscordTokenResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  error?: string;
  error_description?: string;
};

type DiscordUserResponse = {
  id?: string;
  username?: string;
  discriminator?: string;
  global_name?: string | null;
  avatar?: string | null;
  banner?: string | null;
  accent_color?: number | null;
  avatar_decoration_data?: {
    asset?: string;
    sku_id?: string;
  } | null;
  collectibles?: {
    nameplate?: {
      palette?: string;
      asset?: string;
      sku_id?: string;
    } | null;
  } | null;
  locale?: string;
  verified?: boolean;
  mfa_enabled?: boolean;
  error?: string;
  message?: string;
};

type DiscordGuildMemberResponse = {
  nick?: string | null;
  avatar?: string | null;
  roles?: string[];
  joined_at?: string;
  premium_since?: string | null;
  pending?: boolean;
  permissions?: string;
  mute?: boolean;
  deaf?: boolean;
  error?: string;
  message?: string;
};

function clearOauthState(response: NextResponse) {
  response.cookies.delete("kether_discord_oauth_state");
  return response;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const savedState = request.cookies.get("kether_discord_oauth_state")?.value;

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;
  const guildId = process.env.DISCORD_GUILD_ID;
  const sessionSecret = process.env.SESSION_SECRET;
  const allowedRoleIds = (process.env.DISCORD_ALLOWED_ROLE_IDS ?? "")
    .split(",")
    .map((roleId) => roleId.trim())
    .filter(Boolean);

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      {
        ok: false,
        error: "Discord OAuth environment variables are not configured.",
        required: ["DISCORD_CLIENT_ID", "DISCORD_CLIENT_SECRET", "DISCORD_REDIRECT_URI"]
      },
      { status: 500 }
    );
  }

  if (!guildId || !sessionSecret) {
    return NextResponse.json(
      {
        ok: false,
        error: "Discord guild access or session environment variables are not configured.",
        required: ["DISCORD_GUILD_ID", "SESSION_SECRET"],
        optional: ["DISCORD_ALLOWED_ROLE_IDS"]
      },
      { status: 500 }
    );
  }

  if (!code) {
    return NextResponse.json(
      { ok: false, error: "Missing Discord authorization code." },
      { status: 400 }
    );
  }

  if (!state || !savedState || state !== savedState) {
    return NextResponse.json(
      { ok: false, error: "Invalid Discord OAuth state." },
      { status: 400 }
    );
  }

  const tokenBody = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri
  });

  const tokenResponse = await fetch(DISCORD_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: tokenBody,
    cache: "no-store"
  });

  const tokenData = (await tokenResponse.json()) as DiscordTokenResponse;

  if (!tokenResponse.ok || !tokenData.access_token) {
    return NextResponse.json(
      {
        ok: false,
        error: "Discord access token exchange failed.",
        discordError: tokenData.error ?? null,
        discordErrorDescription: tokenData.error_description ?? null
      },
      { status: tokenResponse.status || 500 }
    );
  }

  const tokenType = tokenData.token_type ?? "Bearer";

  const userResponse = await fetch(DISCORD_USER_URL, {
    method: "GET",
    headers: { Authorization: `${tokenType} ${tokenData.access_token}` },
    cache: "no-store"
  });

  const userData = (await userResponse.json()) as DiscordUserResponse;

  if (!userResponse.ok || !userData.id) {
    return clearOauthState(
      NextResponse.json(
        {
          ok: false,
          error: "Discord user profile fetch failed.",
          discordError: userData.error ?? null,
          discordMessage: userData.message ?? null
        },
        { status: userResponse.status || 500 }
      )
    );
  }

  const roleCheckEnabled = allowedRoleIds.length > 0;
  const guildMemberUrl = `https://discord.com/api/v10/users/@me/guilds/${guildId}/member`;

  const memberResponse = await fetch(guildMemberUrl, {
    method: "GET",
    headers: { Authorization: `${tokenType} ${tokenData.access_token}` },
    cache: "no-store"
  });

  const memberData = (await memberResponse.json()) as DiscordGuildMemberResponse;

  if (!memberResponse.ok || !Array.isArray(memberData.roles)) {
    return clearOauthState(
      NextResponse.json(
        {
          ok: false,
          error: "Discord guild membership check failed.",
          discordError: memberData.error ?? null,
          discordMessage: memberData.message ?? null,
          discordUser: {
            id: userData.id,
            username: userData.username ?? null,
            globalName: userData.global_name ?? null,
            avatar: userData.avatar ?? null,
            banner: userData.banner ?? null,
            accentColor: userData.accent_color ?? null
          },
          guildAccess: {
            guildId,
            isMember: false,
            roleCheckEnabled,
            hasAllowedRole: false,
            authorized: false
          }
        },
        { status: memberResponse.status || 403 }
      )
    );
  }

  const matchedRoleIds = roleCheckEnabled
    ? memberData.roles.filter((roleId) => allowedRoleIds.includes(roleId))
    : [];

  const hasAllowedRole = !roleCheckEnabled || matchedRoleIds.length > 0;

  if (!hasAllowedRole) {
    return clearOauthState(
      NextResponse.json(
        {
          ok: false,
          error: "Discord guild role is not allowed.",
          discordUser: {
            id: userData.id,
            username: userData.username ?? null,
            globalName: userData.global_name ?? null,
            avatar: userData.avatar ?? null,
            banner: userData.banner ?? null,
            accentColor: userData.accent_color ?? null
          },
          guildAccess: {
            guildId,
            isMember: true,
            roleCheckEnabled,
            hasAllowedRole: false,
            authorized: false,
            matchedRoleIds: []
          }
        },
        { status: 403 }
      )
    );
  }

  const sessionRoleIds = memberData.roles;

  const sessionPayload = buildDiscordSessionPayload({
    discordUser: {
      id: userData.id,
      username: userData.username ?? null,
      globalName: userData.global_name ?? null,
      avatar: userData.avatar ?? null,
      banner: userData.banner ?? null,
      accentColor: userData.accent_color ?? null,
      avatarDecorationAsset: userData.avatar_decoration_data?.asset ?? null,
      nameplatePalette: userData.collectibles?.nameplate?.palette ?? null
    },
    guildId,
    roleIds: sessionRoleIds
  });

  const sessionCookieValue = createDiscordSessionCookieValue(sessionPayload, sessionSecret);

  const response = NextResponse.redirect(new URL("/profile", request.url));

  response.cookies.delete("kether_discord_oauth_state");
  response.cookies.set(DISCORD_SESSION_COOKIE_NAME, sessionCookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DISCORD_SESSION_MAX_AGE_SECONDS
  });

  return response;
}
