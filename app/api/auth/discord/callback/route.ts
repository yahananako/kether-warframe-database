import { safeNextPath } from "../../../../../lib/auth/navigation";
import { NextRequest, NextResponse } from "next/server";
import { getDiscordAccessPolicy } from "../../../../../lib/auth/discordAccess";
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

const OAUTH_STATE_COOKIE = "kether_discord_oauth_state";
const OAUTH_NEXT_COOKIE = "kether_discord_oauth_next";

function clearOauthState(response: NextResponse) {
  response.cookies.delete(OAUTH_STATE_COOKIE);
  response.cookies.delete(OAUTH_NEXT_COOKIE);
  return response;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const savedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;
  const savedNext = safeNextPath(
    request.cookies.get(OAUTH_NEXT_COOKIE)?.value,
  );

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;
  const guildId = process.env.DISCORD_GUILD_ID;
  const sessionSecret = process.env.SESSION_SECRET;

  function fail(reason: string) {
    const target = new URL("/login", request.url);
    target.searchParams.set("error", reason);
    target.searchParams.set("next", savedNext);
    return clearOauthState(NextResponse.redirect(target));
  }

  if (!state || !savedState || state !== savedState) return fail("expired");
  if (url.searchParams.get("error")) return fail("cancelled");
  if (!code) return fail("expired");
  if (!clientId || !clientSecret || !redirectUri || !guildId || !sessionSecret) return fail("configuration");

  try {
    // One deadline bounds the full token/profile/membership exchange.
    const signal = AbortSignal.timeout(15000);
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
      cache: "no-store",
      signal
    });

    const tokenData = (await tokenResponse.json()) as DiscordTokenResponse;

    if (!tokenResponse.ok || !tokenData.access_token) return fail("token");

    const tokenType = tokenData.token_type ?? "Bearer";

    const userResponse = await fetch(DISCORD_USER_URL, {
      method: "GET",
      headers: { Authorization: `${tokenType} ${tokenData.access_token}` },
      cache: "no-store",
      signal
    });

    const userData = (await userResponse.json()) as DiscordUserResponse;

    if (!userResponse.ok || !userData.id) return fail("profile");

    const { allowedRoleIds, roleCheckEnabled } = await getDiscordAccessPolicy(guildId);
    const guildMemberUrl = `https://discord.com/api/v10/users/@me/guilds/${guildId}/member`;

    const memberResponse = await fetch(guildMemberUrl, {
      method: "GET",
      headers: { Authorization: `${tokenType} ${tokenData.access_token}` },
      cache: "no-store",
      signal
    });

    const memberData = (await memberResponse.json()) as DiscordGuildMemberResponse;

    if (!memberResponse.ok || !Array.isArray(memberData.roles)) return fail("membership");

    const matchedRoleIds = roleCheckEnabled
      ? memberData.roles.filter((roleId) => allowedRoleIds.includes(roleId))
      : [];

    const hasAllowedRole = !roleCheckEnabled || matchedRoleIds.length > 0;

    if (!hasAllowedRole) return fail("role");

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
      guildNickname: memberData.nick ?? null,
      roleIds: sessionRoleIds
    });

    const sessionCookieValue = createDiscordSessionCookieValue(sessionPayload, sessionSecret);

    const response = NextResponse.redirect(new URL(savedNext, request.url));

    response.cookies.delete(OAUTH_STATE_COOKIE);
    response.cookies.delete(OAUTH_NEXT_COOKIE);
    response.cookies.set(DISCORD_SESSION_COOKIE_NAME, sessionCookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: DISCORD_SESSION_MAX_AGE_SECONDS
    });

    return response;
  } catch {
    return fail("unavailable");
  }
}
