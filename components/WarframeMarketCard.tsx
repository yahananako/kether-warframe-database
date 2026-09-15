"use client";

import { useEffect, useState } from "react";

type MarketState = {
  loading: boolean;
  lowestSell: number | null;
  upstreamError: boolean;
};

export default function WarframeMarketCard({
  name,
  marketSlug,
  hasPrime,
}: {
  name: string;
  marketSlug: string;
  hasPrime: boolean;
}) {
  const [market, setMarket] = useState<MarketState>({
    loading: Boolean(marketSlug),
    lowestSell: null,
    upstreamError: false,
  });

  useEffect(() => {
    if (!marketSlug) return;
    const controller = new AbortController();

    fetch(
      `/api/market-price?kind=item&slug=${encodeURIComponent(marketSlug)}`,
      {
        signal: controller.signal,
      },
    )
      .then((response) => response.json())
      .then((data) =>
        setMarket({
          loading: false,
          lowestSell:
            typeof data.lowestSell === "number" ? data.lowestSell : null,
          upstreamError: Boolean(data.upstreamError),
        }),
      )
      .catch((error) => {
        if (error?.name !== "AbortError") {
          setMarket({ loading: false, lowestSell: null, upstreamError: true });
        }
      });

    return () => controller.abort();
  }, [marketSlug]);

  if (!marketSlug) {
    return (
      <section className="warframe-market-card is-untradeable">
        <span>WARFRAME MARKET</span>
        <h2>{hasPrime ? "Prime 版本不可公開交易" : "目前沒有 Prime 套裝"}</h2>
        <p>
          {hasPrime
            ? "一般版與此限定 Prime 版本皆沒有公開市場套裝價格。"
            : "一般版戰甲本體不可交易；此戰甲尚無可查價的 Prime 套裝。"}
        </p>
      </section>
    );
  }

  const marketUrl = `https://warframe.market/items/${marketSlug}`;
  const value = market.loading
    ? "正在同步即時價格…"
    : market.lowestSell
      ? `${market.lowestSell} 白金`
      : market.upstreamError
        ? "市場暫時無法連線"
        : "目前沒有線上賣單";

  return (
    <section className="warframe-market-card">
      <span>PRIME SET・PC MARKET</span>
      <h2>{name} Prime 套裝</h2>
      <strong>{value}</strong>
      <p>一般版不可交易；此處顯示 Prime 套裝最低線上賣單。</p>
      <a href={marketUrl} target="_blank" rel="noreferrer">
        開啟 Warframe Market 交易頁
      </a>
    </section>
  );
}
