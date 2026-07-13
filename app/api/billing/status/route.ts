import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

import {
  DISCORD_SESSION_COOKIE_NAME,
  verifyDiscordSessionCookieValue
} from "../../../../lib/auth/discordSession";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ClanBillingRow = {
  name: string;
  slug: string;
  subscription_plan: "none" | "monthly" | "quarterly" | "yearly";
  subscription_status: "inactive" | "active" | "paused" | "cancelled";
  subscription_ends_at: string | null;
  updated_at: string;
};

export async function GET(request: NextRequest) {
  const sessionSecret = process.env.SESSION_SECRET || "";
  const databaseUrl = process.env.DATABASE_URL || "";

  const sessionCookie = request.cookies.get(DISCORD_SESSION_COOKIE_NAME)?.value;
  const session = sessionCookie && sessionSecret
    ? verifyDiscordSessionCookieValue(sessionCookie, sessionSecret)
    : null;

  if (!session) {
    return NextResponse.json({
      ok: true,
      authenticated: false,
      billingEnabled: true,
      message: "請先登入 Discord。",
      clan: null,
      plan: {
        tier: "none",
        status: "inactive",
        trialEndsAt: null,
        subscriptionEndsAt: null,
        updatedAt: null
      },
      features: {
        personalProgress: false,
        discordGuildAccess: false,
        roleGate: true,
        paidSubscription: false,
        priceEstimation: false
      },
      discordUser: null
    });
  }

  if (!databaseUrl) {
    return NextResponse.json(
      {
        ok: false,
        authenticated: true,
        billingEnabled: true,
        message: "DATABASE_URL 尚未設定。"
      },
      { status: 500 }
    );
  }

  const sql = neon(databaseUrl);
  const rows = await sql`
    SELECT
      name,
      slug,
      subscription_plan,
      subscription_status,
      subscription_ends_at,
      updated_at
    FROM clan_groups
    WHERE discord_guild_id = ${session.guildId}
      AND is_active = TRUE
    LIMIT 1
  `;

  const clan = rows[0] as ClanBillingRow | undefined;

  if (!clan) {
    return NextResponse.json({
      ok: true,
      authenticated: true,
      billingEnabled: true,
      message: "找不到目前 Discord 群組對應的氏族資料。",
      clan: null,
      plan: {
        tier: "none",
        status: "inactive",
        trialEndsAt: null,
        subscriptionEndsAt: null,
        updatedAt: null
      },
      features: {
        personalProgress: true,
        discordGuildAccess: true,
        roleGate: true,
        paidSubscription: false,
        priceEstimation: false
      },
      discordUser: {
        id: session.sub,
        username: session.username,
        globalName: session.globalName,
        guildNickname: session.guildNickname
      }
    });
  }

  const endsAt = clan.subscription_ends_at;
  const expired = endsAt ? new Date(endsAt).getTime() <= Date.now() : false;
  const effectiveStatus = expired ? "expired" : clan.subscription_status;
  const paidSubscription =
    clan.subscription_plan !== "none" && effectiveStatus === "active";

  return NextResponse.json({
    ok: true,
    authenticated: true,
    billingEnabled: true,
    message: paidSubscription
      ? "KETHER 訂閱目前有效。"
      : effectiveStatus === "expired"
        ? "KETHER 訂閱已到期。"
        : "KETHER 訂閱尚未啟用。",
    clan: {
      name: clan.name,
      slug: clan.slug
    },
    plan: {
      tier: clan.subscription_plan,
      status: effectiveStatus,
      trialEndsAt: null,
      subscriptionEndsAt: endsAt,
      updatedAt: clan.updated_at
    },
    features: {
      personalProgress: true,
      discordGuildAccess: true,
      roleGate: true,
      paidSubscription,
      priceEstimation: false
    },
    discordUser: {
      id: session.sub,
      username: session.username,
      globalName: session.globalName,
      guildNickname: session.guildNickname
    }
  });
}
