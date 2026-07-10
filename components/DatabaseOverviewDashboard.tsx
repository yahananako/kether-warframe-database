import type { SheetRow } from "../lib/sheets";

function priceNumber(value: string): number | null {
  const number = Number(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(number) && number > 0 ? number : null;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("zh-TW").format(value);
}

function percent(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

export default function DatabaseOverviewDashboard({ rows }: { rows: SheetRow[] }) {
  const total = rows.length;
  const pricedRows = rows.filter((row) => priceNumber(row.price) !== null);
  const ownedRows = rows.filter((row) => String(row.owned || "").includes("已購買"));

  const prices = pricedRows
    .map((row) => priceNumber(row.price))
    .filter((value): value is number => value !== null);

  const totalPrice = prices.reduce((sum, value) => sum + value, 0);
  const averagePrice = prices.length ? Math.round(totalPrice / prices.length) : 0;

  const sectionMap = new Map<string, number>();

  for (const row of rows) {
    const section = row.section || "未分類";
    sectionMap.set(section, (sectionMap.get(section) ?? 0) + 1);
  }

  const topSections = Array.from(sectionMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return (
    <section className="database-overview-dashboard" aria-label="KETHER 總覽儀表板">
      <div className="database-overview-head">
        <p>KETHER DATABASE OVERVIEW</p>
        <h2>KETHER 總覽儀表板</h2>
        <span>只整理總覽頁資料，不影響其他分類頁。</span>
      </div>

      <div className="database-overview-metrics">
        <article>
          <span>資料總數</span>
          <b>{formatNumber(total)}</b>
          <small>目前總覽分頁可讀取資料</small>
        </article>

        <article>
          <span>區塊數</span>
          <b>{formatNumber(sectionMap.size)}</b>
          <small>依 Google Sheets 區塊整理</small>
        </article>

        <article>
          <span>有價格</span>
          <b>{formatNumber(pricedRows.length)}</b>
          <small>{percent(pricedRows.length, total)}% 已有白金價格</small>
        </article>

        <article>
          <span>已購買</span>
          <b>{formatNumber(ownedRows.length)}</b>
          <small>{percent(ownedRows.length, total)}% 表格標記完成</small>
        </article>

        <article>
          <span>平均價格</span>
          <b>{averagePrice ? `${formatNumber(averagePrice)} 白金` : "待更新"}</b>
          <small>以已有價格項目計算</small>
        </article>
      </div>

      <div className="database-overview-sections">
        <h3>區塊分布</h3>

        <div>
          {topSections.map((section) => (
            <span key={section.name}>
              <b>{section.name}</b>
              <em>{section.count} 筆</em>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
