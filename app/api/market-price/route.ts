import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ITEM_MARKET_API = "https://api.warframe.market/v2";
const LICH_MARKET_API = "https://api.warframe.market/v1/auctions/search";
const MARKET_SITE = "https://warframe.market";

type MarketKind = "item" | "lich";

type MarketOrder = {
  platinum?: number;
  price?: number;
  visible?: boolean;
  user?: {
    status?: string;
  };
};

type LichAuction = {
  buyout_price?: number;
  starting_price?: number;
  visible?: boolean;
  closed?: boolean;
  private?: boolean;
  is_direct_sell?: boolean;
  owner?: {
    status?: string;
  };
};

function isOnline(status: string | undefined) {
  return status === "ingame" || status === "online";
}

function itemOrderPrice(order: MarketOrder) {
  if (order.visible === false || !isOnline(order.user?.status)) return null;

  const price = Number(order.platinum ?? order.price ?? 0);
  return Number.isFinite(price) && price > 0 ? price : null;
}

function lichAuctionPrice(auction: LichAuction) {
  if (
    auction.visible === false ||
    auction.closed === true ||
    auction.private === true ||
    auction.is_direct_sell === false ||
    !isOnline(auction.owner?.status)
  ) {
    return null;
  }

  const price = Number(auction.buyout_price ?? auction.starting_price ?? 0);
  return Number.isFinite(price) && price > 0 ? price : null;
}

function getMarketUrl(kind: MarketKind, slug: string) {
  if (kind === "lich") {
    return `${MARKET_SITE}/auctions/search?type=lich&weapon_url_name=${encodeURIComponent(slug)}`;
  }

  return `${MARKET_SITE}/items/${slug}`;
}

function unavailable(kind: MarketKind, slug: string, upstreamError: boolean) {
  return NextResponse.json({
    available: false,
    tradeable: true,
    upstreamError,
    kind,
    platform: "pc",
    lowestSell: null,
    topSells: [],
    marketUrl: getMarketUrl(kind, slug),
  });
}

export async function GET(request: NextRequest) {
  const slug = (request.nextUrl.searchParams.get("slug") ?? "").trim().toLowerCase();
  const kind: MarketKind = request.nextUrl.searchParams.get("kind") === "lich" ? "lich" : "item";

  if (!/^[a-z0-9][a-z0-9_-]{0,79}$/.test(slug)) {
    return NextResponse.json({
      available: false,
      tradeable: false,
      upstreamError: false,
      kind,
      lowestSell: null,
      topSells: [],
      marketUrl: "",
    });
  }

  try {
    const endpoint = kind === "lich"
      ? `${LICH_MARKET_API}?type=lich&weapon_url_name=${encodeURIComponent(slug)}&buyout_policy=direct&sort_by=price_asc`
      : `${ITEM_MARKET_API}/orders/item/${encodeURIComponent(slug)}/top?platform=pc`;
    const response = await fetch(endpoint, {
      headers: {
        Accept: "application/json",
        Platform: "pc",
        "User-Agent": "KETHER-Warframe-Database price lookup",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });

    if (!response.ok) return unavailable(kind, slug, true);

    const payload = await response.json();
    const prices = kind === "lich"
      ? (Array.isArray(payload?.payload?.auctions) ? payload.payload.auctions : [])
        .map((auction: LichAuction) => lichAuctionPrice(auction))
      : (Array.isArray(payload?.data?.sell) ? payload.data.sell : [])
        .map((order: MarketOrder) => itemOrderPrice(order));
    const onlinePrices = prices
      .filter((price: number | null): price is number => price !== null)
      .sort((left: number, right: number) => left - right);

    return NextResponse.json({
      available: true,
      tradeable: true,
      upstreamError: false,
      kind,
      platform: "pc",
      lowestSell: onlinePrices[0] ?? null,
      topSells: onlinePrices.slice(0, 5),
      priceLabel: kind === "lich" ? "最低線上玄骸拍賣" : "最低線上賣單",
      marketUrl: getMarketUrl(kind, slug),
    });
  } catch {
    return unavailable(kind, slug, true);
  }
}
