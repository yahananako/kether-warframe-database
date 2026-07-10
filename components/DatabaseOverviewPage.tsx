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

export default function DatabaseOverviewPage({ rows }: { rows: SheetRow[] }) {
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
  ).map(([, value]) => value);

  const topSections = [...sectionStats].sort((a, b) => b.total - a.total).slice(0, 10);
  const valuableRows = [...pricedRows]
    .sort((a, b) => priceNumber(b.price) - priceNumber(a.price))
    .slice(0, 8);

  const pricedRate = percent(pricedRows.length, total);
  const ownedRate = percent(ownedRows.length, total);

  return (
    <section className="kether-overview-page">
      <div className="kether-overview-hero">
        <p>KETHER DATABASE CORE</p>
        <h2>KETHER 總覽控制台</h2>
        <span>
          小希把整份 Warframe 資料庫重新整理成總覽儀表板。這裡只重做總覽頁，不影響其他資料分類。
        </span>
      </div>

      <div className="kether-overview-metrics">
        <article>
          <span>資料總數</span>
          <strong>{formatNumber(total)}</strong>
          <small>總覽分頁目前可讀資料</small>
        </article>

        <article>
          <span>資料區塊</span>
          <strong>{formatNumber(sectionStats.length)}</strong>
          <small>依試算表區塊分類</small>
        </article>

        <article>
          <span>有價格資料</span>
          <strong>{formatNumber(pricedRows.length)}</strong>
          <small>{pricedRate}% 已填入白金價格</small>
        </article>

        <article>
          <span>已購買標記</span>
          <strong>{formatNumber(ownedRows.length)}</strong>
          <small>{ownedRate}% 表格已標記完成</small>
        </article>

        <article>
          <span>總估值</span>
          <strong>{totalValue ? `${formatNumber(totalValue)} 白金` : "待更新"}</strong>
          <small>平均 {averageValue ? `${formatNumber(averageValue)} 白金` : "待更新"}</small>
        </article>
      </div>

      <div className="kether-overview-grid">
        <article className="kether-overview-panel">
          <div className="kether-overview-panel-head">
            <h3>資料完成度</h3>
            <span>PRICE / OWNED</span>
          </div>

          <div className="kether-overview-progress">
            <div>
              <span>交易價格完成度</span>
              <b>{pricedRate}%</b>
            </div>
            <em>
              <i style={{ width: `${pricedRate}%` }} />
            </em>
          </div>

          <div className="kether-overview-progress">
            <div>
              <span>已購買完成度</span>
              <b>{ownedRate}%</b>
            </div>
            <em>
              <i style={{ width: `${ownedRate}%` }} />
            </em>
          </div>
        </article>

        <article className="kether-overview-panel">
          <div className="kether-overview-panel-head">
            <h3>區塊分布</h3>
            <span>SECTION MAP</span>
          </div>

          <div className="kether-overview-section-list">
            {topSections.map((section) => (
              <div key={section.section}>
                <span>{section.section}</span>
                <b>{section.total} 筆</b>
                <small>
                  有價格 {section.priced}｜已購買 {section.owned}
                </small>
              </div>
            ))}
          </div>
        </article>
      </div>

      <article className="kether-overview-panel kether-overview-wide">
        <div className="kether-overview-panel-head">
          <h3>高價資料觀測</h3>
          <span>MARKET SIGNAL</span>
        </div>

        <div className="kether-overview-item-list">
          {valuableRows.map((row) => (
            <div key={`${row.section}-${row.chineseName}-${row.englishName}`}>
              <span>{row.section || "未分類"}</span>
              <b>{row.englishName || row.chineseName}</b>
              <small>{row.chineseName || "—"}</small>
              <em>{formatNumber(priceNumber(row.price))} 白金</em>
            </div>
          ))}

          {valuableRows.length === 0 && (
            <p className="kether-overview-empty">目前還沒有可計算的價格資料喵。</p>
          )}
        </div>
      </article>
    </section>
  );
}
