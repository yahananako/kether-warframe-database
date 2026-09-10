import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MARKET_API = "https://api.warframe.market/v2";
const MARKET_SITE = "https://warframe.market/items";

type MarketOrder = {
  platinum?: number;
  price?: number;
  visible?: boolean;
  user?: {
    status?: string;
  };
};

function isOnline(order: MarketOrder) {
  const status = order.user?.status;
  return order.visible !== false && (status === "ingame" || status === "online");
}

export async function GET(request: NextRequest) {
  const slug = (request.nextUrl.searchParams.get("slug") ?? "").trim().toLowerCase();

  if (!/^[a-z0-9][a-z0-9_-]{0,79}$/.test(slug)) {
    return NextResponse.json({ available: false, lowestSell: null, marketUrl: "" });
  }

  const marketUrl = `${MARKET_SITE}/${slug}`;

  try {
    const response = await fetch(`${MARKET_API}/orders/item/${slug}/top?platform=pc`, {
      headers: {
        Accept: "application/json",
        Platform: "pc",
        "User-Agent": "KETHER-Warframe-Database Android price lookup",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });

    if (!response.ok) {
      return NextResponse.json({ available: false, lowestSell: null, marketUrl: "" });
    }

    const payload = await response.json();
    const sellOrders: MarketOrder[] = Array.isArray(payload?.data?.sell)
      ? payload.data.sell
      : [];
    const prices = sellOrders
      .filter(isOnline)
      .map((order) => Number(order.platinum ?? order.price ?? 0))
      .filter((price) => Number.isFinite(price) && price > 0)
      .sort((left, right) => left - right);

    return NextResponse.json({
      available: true,
      platform: "pc",
      lowestSell: prices[0] ?? null,
      topSells: prices.slice(0, 5),
      marketUrl,
    });
  } catch {
    return NextResponse.json({ available: false, lowestSell: null, marketUrl: "" });
  }
}
