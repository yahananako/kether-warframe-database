import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const savedState = request.cookies.get("kether_discord_oauth_state")?.value;

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

  return NextResponse.json({
    ok: true,
    message: "Discord OAuth callback route is ready.",
    nextStep: "Exchange authorization code for access token.",
    stateVerified: true
  });
}
