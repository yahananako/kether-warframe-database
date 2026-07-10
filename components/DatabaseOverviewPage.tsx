import Link from "next/link";
import { ArrowLeft, Bell, Bot, Radio, Search } from "lucide-react";
import type { SheetRow } from "../lib/sheets";

function priceNumber(value: string): number {
  const number = Number(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("zh-TW").format(value);
}

function percent(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function isOwned(value: string) {
  return String(value || "").includes("已購買");
}

export default function DatabaseOverviewPage({
  rows,
  title,
  subtitle,
  error,
}: {
  rows: SheetRow[];
  title: string;
  subtitle: string;
  error?: string | null;
}) {
  const total = rows.length;
  const pricedRows = rows.filter((row) => priceNumber(row.price) > 0);
  const ownedRows = rows.filter((row) => isOwned(row.owned));
  const totalValue = pricedRows.reduce((sum, row) => sum + priceNumber(row.price), 0);
  const averageValue = pricedRows.length ? Math.round(totalValue / pricedRows.length) : 0;

  const sectionStats = Array.from(
    rows.reduce((map, row) => {
      const key = row.section || "未分類";
      const current = map.get(key) ?? {
        section: key,
        total: 0,
        priced: 0,
        owned: 0,
        value: 0,
      };

      current.total += 1;
      if (priceNumber(row.price) > 0) current.priced += 1;
      if (isOwned(row.owned)) current.owned += 1;
      current.value += priceNumber(row.price);

      map.set(key, current);
      return map;
    }, new Map<string, { section: string; total: number; priced: number; owned: number; value: number }>())
  )
    .map(([, value]) => value)
    .sort((a, b) => b.total - a.total);

  const topSections = sectionStats.slice(0, 8);
  const maxSectionCount = topSections[0]?.total ?? 1;

  const topValueRows = [...pricedRows]
    .sort((a, b) => priceNumber(b.price) - priceNumber(a.price))
    .slice(0, 8);

  const maxValue = topValueRows.length
    ? Math.max(...topValueRows.map((row) => priceNumber(row.price)))
    : 1;

  const completionCharts = [
    {
      label: "價格覆蓋率",
      value: percent(pricedRows.length, total),
      note: `${formatNumber(pricedRows.length)} / ${formatNumber(total)}`,
    },
    {
      label: "已購買率",
      value: percent(ownedRows.length, total),
      note: `${formatNumber(ownedRows.length)} / ${formatNumber(total)}`,
    },
    {
      label: "已估值比例",
      value: percent(pricedRows.length, total),
      note: totalValue ? `${formatNumber(totalValue)} 白金` : "待更新",
    },
  ];

  return (
    <section className="kether-overview-v2">
      <section className="kether-overview-hero-shell">
        <p className="kether-overview-kicker">KETHER DATABASE OVERVIEW</p>

        <div className="kether-overview-hero-banner">
          <img
            src="/home-hero-banner.png"
            alt="KETHER OF PARADISO Warframe 資料庫總覽版圖"
          />
        </div>

        <div className="kether-overview-hero-copy">
          <h1>{title}</h1>
          <p>
            {subtitle}
            <br />
            小希把總覽頁整理成圖表式控制台，讓資料進度、區塊分布與價格觀測更直覺。
          </p>

          <div className="kether-overview-hero-actions">
            <Link href="/">
              <ArrowLeft size={16} />
              返回首頁
            </Link>

            <Link href="/bot">
              <Bot size={16} />
              小希 Bot 中樞
            </Link>

            <Link href="/live">
              <Radio size={16} />
              小希星圖電波局
            </Link>

            <Link href="/profile">
              <Bell size={16} />
              個人進度
            </Link>
          </div>
        </div>
      </section>

      {error ? (
        <section className="kether-overview-error">
          <h2>讀取資料時發生問題</h2>
          <p>{error}</p>
        </section>
      ) : (
        <>
          <section className="kether-overview-metric-grid">
            <article>
              <span>資料總數</span>
              <strong>{formatNumber(total)}</strong>
              <small>總覽目前收錄資料</small>
            </article>

            <article>
              <span>區塊數量</span>
              <strong>{formatNumber(sectionStats.length)}</strong>
              <small>依表格區塊分類</small>
            </article>

            <article>
              <span>總估值</span>
              <strong>{totalValue ? `${formatNumber(totalValue)} 白金` : "待更新"}</strong>
              <small>平均 {averageValue ? `${formatNumber(averageValue)} 白金` : "待更新"}</small>
            </article>

            <article>
              <span>已購買進度</span>
              <strong>{percent(ownedRows.length, total)}%</strong>
              <small>{formatNumber(ownedRows.length)} 筆已標記購買</small>
            </article>
          </section>

          <section className="kether-overview-chart-grid">
            <article className="kether-overview-chart-card">
              <div className="kether-overview-chart-head">
                <div>
                  <p>KETHER CHART</p>
                  <h2>區塊分布圖表</h2>
                </div>
                <span>SECTION</span>
              </div>

              <div className="kether-overview-bar-list">
                {topSections.map((section) => {
                  const width = Math.max(12, Math.round((section.total / maxSectionCount) * 100));

                  return (
                    <div key={section.section} className="kether-overview-bar-item">
                      <div className="kether-overview-bar-top">
                        <b>{section.section}</b>
                        <span>{section.total} 筆</span>
                      </div>

                      <div className="kether-overview-bar-track">
                        <i style={{ width: `${width}%` }} />
                      </div>

                      <small>
                        價格 {section.priced}｜已購買 {section.owned}
                      </small>
                    </div>
                  );
                })}
              </div>
            </article>

            <article className="kether-overview-chart-card">
              <div className="kether-overview-chart-head">
                <div>
                  <p>KETHER CHART</p>
                  <h2>完成度圖表</h2>
                </div>
                <span>PROGRESS</span>
              </div>

              <div className="kether-overview-progress-list">
                {completionCharts.map((item) => (
                  <div key={item.label} className="kether-overview-progress-item">
                    <div className="kether-overview-progress-top">
                      <b>{item.label}</b>
                      <span>{item.value}%</span>
                    </div>

                    <div className="kether-overview-progress-track">
                      <i style={{ width: `${item.value}%` }} />
                    </div>

                    <small>{item.note}</small>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <article className="kether-overview-chart-card kether-overview-wide-card">
            <div className="kether-overview-chart-head">
              <div>
                <p>KETHER CHART</p>
                <h2>高價資料圖表</h2>
              </div>
              <span>PRICE</span>
            </div>

            {topValueRows.length > 0 ? (
              <div className="kether-overview-value-chart">
                {topValueRows.map((row) => {
                  const price = priceNumber(row.price);
                  const width = Math.max(12, Math.round((price / maxValue) * 100));
                  const name = row.englishName || row.chineseName || "未命名資料";
                  const sub = row.chineseName || row.section || "未分類";

                  return (
                    <div
                      key={`${row.section}-${row.englishName}-${row.chineseName}`}
                      className="kether-overview-value-item"
                    >
                      <div className="kether-overview-value-meta">
                        <b>{name}</b>
                        <small>{sub}</small>
                      </div>

                      <div className="kether-overview-value-bar">
                        <i style={{ width: `${width}%` }} />
                      </div>

                      <span>{formatNumber(price)} 白金</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="kether-overview-empty">目前還沒有足夠的價格資料可以製作圖表喵。</p>
            )}
          </article>
        </>
      )}
    </section>
  );
}
