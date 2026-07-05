import { NextRequest, NextResponse } from "next/server";

const DISCORD_TOKEN_URL = "https://discord.com/api/v10/oauth2/token";

type DiscordTokenResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  error?: string;
  error_description?: string;
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

  const response = NextResponse.json({
    ok: true,
    message: "Discord access token exchange succeeded.",
    tokenType: tokenData.token_type ?? "Bearer",
    expiresIn: tokenData.expires_in ?? null,
    scope: tokenData.scope ?? null,
    nextStep: "Fetch Discord user profile with /users/@me."
  });

  response.cookies.delete("kether_discord_oauth_state");

  return response;
}
