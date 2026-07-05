import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

const DISCORD_AUTHORIZE_URL = "https://discord.com/oauth2/authorize";

export async function GET() {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      {
        ok: false,
        error: "Discord OAuth environment variables are not configured.",
        required: ["DISCORD_CLIENT_ID", "DISCORD_REDIRECT_URI"]
      },
      { status: 500 }
    );
  }

  const state = randomUUID();

  const authorizeUrl = new URL(DISCORD_AUTHORIZE_URL);
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", "identify guilds guilds.members.read");
  authorizeUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authorizeUrl);

  response.cookies.set("kether_discord_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10
  });

  return response;
}
