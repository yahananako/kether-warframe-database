import { NextRequest, NextResponse } from "next/server";
import {
  DISCORD_SESSION_COOKIE_NAME,
  verifyDiscordSessionCookieValue
} from "../../../../lib/auth/discordSession";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const sessionSecret = process.env.SESSION_SECRET || "";
  const allowedRoleIds = (process.env.DISCORD_ALLOWED_ROLE_IDS || "")
    .split(",")
    .map((roleId) => roleId.trim())
    .filter(Boolean);

  const planTier = process.env.KETHER_PLAN_TIER || "free";
  const planStatus = process.env.KETHER_PLAN_STATUS || "reserved";
  const trialEndsAt = process.env.KETHER_TRIAL_ENDS_AT || null;
  const subscriptionEndsAt = process.env.KETHER_SUBSCRIPTION_ENDS_AT || null;

  const sessionCookie = request.cookies.get(DISCORD_SESSION_COOKIE_NAME)?.value;
  const session = sessionCookie && sessionSecret
    ? verifyDiscordSessionCookieValue(sessionCookie, sessionSecret)
    : null;

  return NextResponse.json({
    ok: true,
    authenticated: Boolean(session),
    billingEnabled: false,
    message: "付費方案功能目前為預留狀態。",
    plan: {
      tier: planTier,
      status: planStatus,
      trialEndsAt,
      subscriptionEndsAt
    },
    features: {
      personalProgress: true,
      discordGuildAccess: Boolean(session),
      roleGate: allowedRoleIds.length > 0,
      paidSubscription: false,
      priceEstimation: false
    },
    discordUser: session
      ? {
          id: session.sub,
          username: session.username,
          globalName: session.globalName
        }
      : null
  });
}
