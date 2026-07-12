import Link from "next/link";
import { ArrowLeft, Bell, Bot, Radio } from "lucide-react";
import type { SheetRow } from "../lib/sheets";

export type OverviewCategoryStat = {
  key: string;
  label: string;
  total: number;
  priced: number;
  owned: number;
  value: number;
  error?: string | null;
};

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
  categoryStats = [],
  hideHero = false,
  collapsibleCharts = false,
}: {
  rows: SheetRow[];
  title: string;
  subtitle: string;
  error?: string | null;
  categoryStats?: OverviewCategoryStat[];
  hideHero?: boolean;
  collapsibleCharts?: boolean;
}) {
  const total = rows.length;
  const pricedRows = rows.filter((row) => priceNumber(row.price) > 0);
  const ownedRows = rows.filter((row) => isOwned(row.owned));
  const totalValue = pricedRows.reduce((sum, row) => sum + priceNumber(row.price), 0);

  const categoryTotal = categoryStats.reduce((sum, item) => sum + item.total, 0);
  const categoryPriced = categoryStats.reduce((sum, item) => sum + item.priced, 0);
  const categoryOwned = categoryStats.reduce((sum, item) => sum + item.owned, 0);
  const categoryValue = categoryStats.reduce((sum, item) => sum + item.value, 0);
  const maxCategoryTotal = Math.max(...categoryStats.map((item) => item.total), 1);
  const maxCategoryValue = Math.max(...categoryStats.map((item) => item.value), 1);


  const renderDataAmountChart = () => (
    <article className="kether-overview-chart-card">
      <div className="kether-overview-chart-head">
        <div>
          <p>KETHER CHART</p>
          <h2>各頁資料量統計</h2>
        </div>
        <span>COUNT</span>
      </div>

      <div className="kether-overview-bar-list">
        {categoryStats.map((item) => {
          const width = Math.max(10, Math.round((item.total / maxCategoryTotal) * 100));

          return (
            <div key={item.key} className="kether-overview-bar-item">
              <div className="kether-overview-bar-top">
                <b>{item.label}</b>
                <span>{formatNumber(item.total)} 筆</span>
              </div>

              <div className="kether-overview-bar-track">
                <i style={{ width: `${width}%` }} />
              </div>

              <small>
                價格 {formatNumber(item.priced)}｜已購買 {formatNumber(item.owned)}
                {item.error ? "｜讀取異常" : ""}
              </small>
            </div>
          );
        })}
      </div>
    </article>
  );

  const renderProgressChart = () => (
    <article className="kether-overview-chart-card">
      <div className="kether-overview-chart-head">
        <div>
          <p>KETHER CHART</p>
          <h2>完成度統計</h2>
        </div>
        <span>PROGRESS</span>
      </div>

      <div className="kether-overview-progress-list">
        {categoryStats.map((item) => {
          const pricedRate = percent(item.priced, item.total);
          const ownedRate = percent(item.owned, item.total);

          return (
            <div key={item.key} className="kether-overview-progress-item">
              <div className="kether-overview-progress-top">
                <b>{item.label}</b>
                <span>價格 {pricedRate}%</span>
              </div>

              <div className="kether-overview-progress-track">
                <i style={{ width: `${pricedRate}%` }} />
              </div>

              <small>已購買 {ownedRate}%</small>
            </div>
          );
        })}
      </div>
    </article>
  );

  const renderValueChart = () => (
    <article className="kether-overview-chart-card kether-overview-wide-card">
      <div className="kether-overview-chart-head">
        <div>
          <p>KETHER CHART</p>
          <h2>各頁估值統計</h2>
        </div>
        <span>PLATINUM</span>
      </div>

      <div className="kether-overview-value-chart">
        {categoryStats.map((item) => {
          const width = item.value > 0
            ? Math.max(10, Math.round((item.value / maxCategoryValue) * 100))
            : 0;

          return (
            <div key={item.key} className="kether-overview-value-item">
              <div className="kether-overview-value-meta">
                <b>{item.label}</b>
                <small>{formatNumber(item.total)} 筆資料</small>
              </div>

              <div className="kether-overview-value-bar">
                <i style={{ width: `${width}%` }} />
              </div>

              <span>{item.value ? `${formatNumber(item.value)} 白金` : "待更新"}</span>
            </div>
          );
        })}
      </div>
    </article>
  );

  const renderChartFold = (title: string, label: string, content: JSX.Element) => (
    collapsibleCharts ? (
      <details className="kether-database-fold kether-database-chart-fold" open>
        <summary>
          <span>
            <small>{label}</small>
            <strong>{title}</strong>
          </span>
          <i>⌄</i>
        </summary>
        {content}
      </details>
    ) : content
  );

  return (
    <section className="kether-overview-v2">
      {!hideHero ? (
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
              小希把總覽頁整理成全資料庫圖表控制台，讓各分類資料量、價格完成度與收藏進度更好看懂。
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
      ) : null}

      {error ? (
        <section className="kether-overview-error">
          <h2>讀取資料時發生問題</h2>
          <p>{error}</p>
        </section>
      ) : (
        <>
          <section className="kether-overview-metric-grid">
            <article>
              <span>總覽資料</span>
              <strong>{formatNumber(total)}</strong>
              <small>總覽分頁目前資料筆數</small>
            </article>

            <article>
              <span>全分類資料</span>
              <strong>{formatNumber(categoryTotal)}</strong>
              <small>戰甲、武器、同伴、曲翼、MOD 合計</small>
            </article>

            <article>
              <span>全分類估值</span>
              <strong>{categoryValue ? `${formatNumber(categoryValue)} 白金` : "待更新"}</strong>
              <small>{formatNumber(categoryPriced)} 筆已有價格</small>
            </article>

            <article>
              <span>全分類已購買</span>
              <strong>{percent(categoryOwned, categoryTotal)}%</strong>
              <small>{formatNumber(categoryOwned)} / {formatNumber(categoryTotal)} 筆</small>
            </article>
          </section>

          <section className="kether-overview-chart-grid">
            <article className="kether-overview-chart-card">
              <div className="kether-overview-chart-head">
                <div>
                  <p>KETHER CHART</p>
                  <h2>各頁資料量統計</h2>
                </div>
                <span>COUNT</span>
              </div>

              <div className="kether-overview-bar-list">
                {categoryStats.map((item) => {
                  const width = Math.max(10, Math.round((item.total / maxCategoryTotal) * 100));

                
  const renderDataAmountChart = () => (
    <article className="kether-overview-chart-card">
      <div className="kether-overview-chart-head">
        <div>
          <p>KETHER CHART</p>
          <h2>各頁資料量統計</h2>
        </div>
        <span>COUNT</span>
      </div>

      <div className="kether-overview-bar-list">
        {categoryStats.map((item) => {
          const width = Math.max(10, Math.round((item.total / maxCategoryTotal) * 100));

          return (
            <div key={item.key} className="kether-overview-bar-item">
              <div className="kether-overview-bar-top">
                <b>{item.label}</b>
                <span>{formatNumber(item.total)} 筆</span>
              </div>

              <div className="kether-overview-bar-track">
                <i style={{ width: `${width}%` }} />
              </div>

              <small>
                價格 {formatNumber(item.priced)}｜已購買 {formatNumber(item.owned)}
                {item.error ? "｜讀取異常" : ""}
              </small>
            </div>
          );
        })}
      </div>
    </article>
  );

  const renderProgressChart = () => (
    <article className="kether-overview-chart-card">
      <div className="kether-overview-chart-head">
        <div>
          <p>KETHER CHART</p>
          <h2>完成度統計</h2>
        </div>
        <span>PROGRESS</span>
      </div>

      <div className="kether-overview-progress-list">
        {categoryStats.map((item) => {
          const pricedRate = percent(item.priced, item.total);
          const ownedRate = percent(item.owned, item.total);

          return (
            <div key={item.key} className="kether-overview-progress-item">
              <div className="kether-overview-progress-top">
                <b>{item.label}</b>
                <span>價格 {pricedRate}%</span>
              </div>

              <div className="kether-overview-progress-track">
                <i style={{ width: `${pricedRate}%` }} />
              </div>

              <small>已購買 {ownedRate}%</small>
            </div>
          );
        })}
      </div>
    </article>
  );

  const renderValueChart = () => (
    <article className="kether-overview-chart-card kether-overview-wide-card">
      <div className="kether-overview-chart-head">
        <div>
          <p>KETHER CHART</p>
          <h2>各頁估值統計</h2>
        </div>
        <span>PLATINUM</span>
      </div>

      <div className="kether-overview-value-chart">
        {categoryStats.map((item) => {
          const width = item.value > 0
            ? Math.max(10, Math.round((item.value / maxCategoryValue) * 100))
            : 0;

          return (
            <div key={item.key} className="kether-overview-value-item">
              <div className="kether-overview-value-meta">
                <b>{item.label}</b>
                <small>{formatNumber(item.total)} 筆資料</small>
              </div>

              <div className="kether-overview-value-bar">
                <i style={{ width: `${width}%` }} />
              </div>

              <span>{item.value ? `${formatNumber(item.value)} 白金` : "待更新"}</span>
            </div>
          );
        })}
      </div>
    </article>
  );

  const renderChartFold = (title: string, label: string, content: JSX.Element) => (
    collapsibleCharts ? (
      <details className="kether-database-fold kether-database-chart-fold" open>
        <summary>
          <span>
            <small>{label}</small>
            <strong>{title}</strong>
          </span>
          <i>⌄</i>
        </summary>
        {content}
      </details>
    ) : content
  );

  return (
                    <div key={item.key} className="kether-overview-bar-item">
                      <div className="kether-overview-bar-top">
                        <b>{item.label}</b>
                        <span>{formatNumber(item.total)} 筆</span>
                      </div>

                      <div className="kether-overview-bar-track">
                        <i style={{ width: `${width}%` }} />
                      </div>

                      <small>
                        價格 {formatNumber(item.priced)}｜已購買 {formatNumber(item.owned)}
                        {item.error ? "｜讀取異常" : ""}
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
                  <h2>完成度統計</h2>
                </div>
                <span>PROGRESS</span>
              </div>

              <div className="kether-overview-progress-list">
                {categoryStats.map((item) => {
                  const pricedRate = percent(item.priced, item.total);
                  const ownedRate = percent(item.owned, item.total);

                
  const renderDataAmountChart = () => (
    <article className="kether-overview-chart-card">
      <div className="kether-overview-chart-head">
        <div>
          <p>KETHER CHART</p>
          <h2>各頁資料量統計</h2>
        </div>
        <span>COUNT</span>
      </div>

      <div className="kether-overview-bar-list">
        {categoryStats.map((item) => {
          const width = Math.max(10, Math.round((item.total / maxCategoryTotal) * 100));

          return (
            <div key={item.key} className="kether-overview-bar-item">
              <div className="kether-overview-bar-top">
                <b>{item.label}</b>
                <span>{formatNumber(item.total)} 筆</span>
              </div>

              <div className="kether-overview-bar-track">
                <i style={{ width: `${width}%` }} />
              </div>

              <small>
                價格 {formatNumber(item.priced)}｜已購買 {formatNumber(item.owned)}
                {item.error ? "｜讀取異常" : ""}
              </small>
            </div>
          );
        })}
      </div>
    </article>
  );

  const renderProgressChart = () => (
    <article className="kether-overview-chart-card">
      <div className="kether-overview-chart-head">
        <div>
          <p>KETHER CHART</p>
          <h2>完成度統計</h2>
        </div>
        <span>PROGRESS</span>
      </div>

      <div className="kether-overview-progress-list">
        {categoryStats.map((item) => {
          const pricedRate = percent(item.priced, item.total);
          const ownedRate = percent(item.owned, item.total);

          return (
            <div key={item.key} className="kether-overview-progress-item">
              <div className="kether-overview-progress-top">
                <b>{item.label}</b>
                <span>價格 {pricedRate}%</span>
              </div>

              <div className="kether-overview-progress-track">
                <i style={{ width: `${pricedRate}%` }} />
              </div>

              <small>已購買 {ownedRate}%</small>
            </div>
          );
        })}
      </div>
    </article>
  );

  const renderValueChart = () => (
    <article className="kether-overview-chart-card kether-overview-wide-card">
      <div className="kether-overview-chart-head">
        <div>
          <p>KETHER CHART</p>
          <h2>各頁估值統計</h2>
        </div>
        <span>PLATINUM</span>
      </div>

      <div className="kether-overview-value-chart">
        {categoryStats.map((item) => {
          const width = item.value > 0
            ? Math.max(10, Math.round((item.value / maxCategoryValue) * 100))
            : 0;

          return (
            <div key={item.key} className="kether-overview-value-item">
              <div className="kether-overview-value-meta">
                <b>{item.label}</b>
                <small>{formatNumber(item.total)} 筆資料</small>
              </div>

              <div className="kether-overview-value-bar">
                <i style={{ width: `${width}%` }} />
              </div>

              <span>{item.value ? `${formatNumber(item.value)} 白金` : "待更新"}</span>
            </div>
          );
        })}
      </div>
    </article>
  );

  const renderChartFold = (title: string, label: string, content: JSX.Element) => (
    collapsibleCharts ? (
      <details className="kether-database-fold kether-database-chart-fold" open>
        <summary>
          <span>
            <small>{label}</small>
            <strong>{title}</strong>
          </span>
          <i>⌄</i>
        </summary>
        {content}
      </details>
    ) : content
  );

  return (
                    <div key={item.key} className="kether-overview-progress-item">
                      <div className="kether-overview-progress-top">
                        <b>{item.label}</b>
                        <span>價格 {pricedRate}%</span>
                      </div>

                      <div className="kether-overview-progress-track">
                        <i style={{ width: `${pricedRate}%` }} />
                      </div>

                      <small>已購買 {ownedRate}%</small>
                    </div>
                  );
                })}
              </div>
            </article>
          </section>

          <article className="kether-overview-chart-card kether-overview-wide-card">
            <div className="kether-overview-chart-head">
              <div>
                <p>KETHER CHART</p>
                <h2>各頁估值統計</h2>
              </div>
              <span>PLATINUM</span>
            </div>

            <div className="kether-overview-value-chart">
              {categoryStats.map((item) => {
                const width = item.value > 0
                  ? Math.max(10, Math.round((item.value / maxCategoryValue) * 100))
                  : 0;

              
  const renderDataAmountChart = () => (
    <article className="kether-overview-chart-card">
      <div className="kether-overview-chart-head">
        <div>
          <p>KETHER CHART</p>
          <h2>各頁資料量統計</h2>
        </div>
        <span>COUNT</span>
      </div>

      <div className="kether-overview-bar-list">
        {categoryStats.map((item) => {
          const width = Math.max(10, Math.round((item.total / maxCategoryTotal) * 100));

          return (
            <div key={item.key} className="kether-overview-bar-item">
              <div className="kether-overview-bar-top">
                <b>{item.label}</b>
                <span>{formatNumber(item.total)} 筆</span>
              </div>

              <div className="kether-overview-bar-track">
                <i style={{ width: `${width}%` }} />
              </div>

              <small>
                價格 {formatNumber(item.priced)}｜已購買 {formatNumber(item.owned)}
                {item.error ? "｜讀取異常" : ""}
              </small>
            </div>
          );
        })}
      </div>
    </article>
  );

  const renderProgressChart = () => (
    <article className="kether-overview-chart-card">
      <div className="kether-overview-chart-head">
        <div>
          <p>KETHER CHART</p>
          <h2>完成度統計</h2>
        </div>
        <span>PROGRESS</span>
      </div>

      <div className="kether-overview-progress-list">
        {categoryStats.map((item) => {
          const pricedRate = percent(item.priced, item.total);
          const ownedRate = percent(item.owned, item.total);

          return (
            <div key={item.key} className="kether-overview-progress-item">
              <div className="kether-overview-progress-top">
                <b>{item.label}</b>
                <span>價格 {pricedRate}%</span>
              </div>

              <div className="kether-overview-progress-track">
                <i style={{ width: `${pricedRate}%` }} />
              </div>

              <small>已購買 {ownedRate}%</small>
            </div>
          );
        })}
      </div>
    </article>
  );

  const renderValueChart = () => (
    <article className="kether-overview-chart-card kether-overview-wide-card">
      <div className="kether-overview-chart-head">
        <div>
          <p>KETHER CHART</p>
          <h2>各頁估值統計</h2>
        </div>
        <span>PLATINUM</span>
      </div>

      <div className="kether-overview-value-chart">
        {categoryStats.map((item) => {
          const width = item.value > 0
            ? Math.max(10, Math.round((item.value / maxCategoryValue) * 100))
            : 0;

          return (
            <div key={item.key} className="kether-overview-value-item">
              <div className="kether-overview-value-meta">
                <b>{item.label}</b>
                <small>{formatNumber(item.total)} 筆資料</small>
              </div>

              <div className="kether-overview-value-bar">
                <i style={{ width: `${width}%` }} />
              </div>

              <span>{item.value ? `${formatNumber(item.value)} 白金` : "待更新"}</span>
            </div>
          );
        })}
      </div>
    </article>
  );

  const renderChartFold = (title: string, label: string, content: JSX.Element) => (
    collapsibleCharts ? (
      <details className="kether-database-fold kether-database-chart-fold" open>
        <summary>
          <span>
            <small>{label}</small>
            <strong>{title}</strong>
          </span>
          <i>⌄</i>
        </summary>
        {content}
      </details>
    ) : content
  );

  return (
                  <div key={item.key} className="kether-overview-value-item">
                    <div className="kether-overview-value-meta">
                      <b>{item.label}</b>
                      <small>{formatNumber(item.total)} 筆資料</small>
                    </div>

                    <div className="kether-overview-value-bar">
                      <i style={{ width: `${width}%` }} />
                    </div>

                    <span>{item.value ? `${formatNumber(item.value)} 白金` : "待更新"}</span>
                  </div>
                );
              })}
            </div>
          </article>

          <section className="kether-overview-mini-summary">
            <article>
              <span>總覽價格完成</span>
              <b>{percent(pricedRows.length, total)}%</b>
              <small>{formatNumber(pricedRows.length)} / {formatNumber(total)}</small>
            </article>

            <article>
              <span>總覽已購買</span>
              <b>{percent(ownedRows.length, total)}%</b>
              <small>{formatNumber(ownedRows.length)} / {formatNumber(total)}</small>
            </article>

            <article>
              <span>總覽估值</span>
              <b>{totalValue ? `${formatNumber(totalValue)} 白金` : "待更新"}</b>
              <small>只計算總覽分頁</small>
            </article>
          </section>
        </>
      )}
    </section>
  );
}
