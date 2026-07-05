import { NextResponse } from "next/server";
import { DISCORD_SESSION_COOKIE_NAME } from "../../../../lib/auth/discordSession";

function clearAuthCookies(response: NextResponse) {
  response.cookies.set(DISCORD_SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });

  response.cookies.set("kether_discord_oauth_state", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });

  return response;
}

export async function GET() {
  return clearAuthCookies(
    NextResponse.json({
      ok: true,
      loggedOut: true,
      message: "Discord session cookie was cleared."
    })
  );
}

export async function POST() {
  return clearAuthCookies(
    NextResponse.json({
      ok: true,
      loggedOut: true,
      message: "Discord session cookie was cleared."
    })
  );
}
