import { NextRequest, NextResponse } from "next/server";

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
  locale?: string;
  verified?: boolean;
  mfa_enabled?: boolean;
  error?: string;
  message?: string;
};

export async function GET(request: NextRequest) {
  const url = new URL(request.url);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const savedState = request.cookies.get("kether_discord_oauth_state")?.value;

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;

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

  if (!code) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing Discord authorization code."
      },
      { status: 400 }
    );
  }

  if (!state || !savedState || state !== savedState) {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid Discord OAuth state."
      },
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
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
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
    headers: {
      Authorization: `${tokenType} ${tokenData.access_token}`
    },
    cache: "no-store"
  });

  const userData = (await userResponse.json()) as DiscordUserResponse;

  if (!userResponse.ok || !userData.id) {
    return NextResponse.json(
      {
        ok: false,
        error: "Discord user profile fetch failed.",
        discordError: userData.error ?? null,
        discordMessage: userData.message ?? null
      },
      { status: userResponse.status || 500 }
    );
  }

  const response = NextResponse.json({
    ok: true,
    message: "Discord user profile fetch succeeded.",
    discordUser: {
      id: userData.id,
      username: userData.username ?? null,
      globalName: userData.global_name ?? null,
      discriminator: userData.discriminator ?? null,
      avatar: userData.avatar ?? null
    },
    token: {
      tokenType,
      expiresIn: tokenData.expires_in ?? null,
      scope: tokenData.scope ?? null
    },
    nextStep: "Check Discord guild membership and allowed roles."
  });

  response.cookies.delete("kether_discord_oauth_state");

  return response;
}
