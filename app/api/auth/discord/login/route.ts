import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const DISCORD_AUTHORIZE_URL = "https://discord.com/oauth2/authorize";
const OAUTH_STATE_COOKIE = "kether_discord_oauth_state";
const OAUTH_NEXT_COOKIE = "kether_discord_oauth_next";

function sanitizeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/profile";
  }

  return value.slice(0, 500);
}

export async function GET(request: NextRequest) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      {
        ok: false,
        error: "Discord OAuth environment variables are not configured.",
        required: ["DISCORD_CLIENT_ID", "DISCORD_REDIRECT_URI"],
      },
      { status: 500 },
    );
  }

  const nextPath = sanitizeNext(request.nextUrl.searchParams.get("next"));
  const configuredCallback = new URL(redirectUri);

  if (request.nextUrl.origin !== configuredCallback.origin) {
    const canonicalLogin = new URL(
      "/api/auth/discord/login",
      configuredCallback.origin,
    );
    canonicalLogin.searchParams.set("next", nextPath);
    return NextResponse.redirect(canonicalLogin);
  }

  const state = randomUUID();

  const authorizeUrl = new URL(DISCORD_AUTHORIZE_URL);
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set(
    "scope",
    "identify guilds guilds.members.read",
  );
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("prompt", "consent");

  const response = NextResponse.redirect(authorizeUrl);
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 10,
  };

  response.cookies.set(OAUTH_STATE_COOKIE, state, cookieOptions);
  response.cookies.set(OAUTH_NEXT_COOKIE, nextPath, cookieOptions);

  return response;
}
