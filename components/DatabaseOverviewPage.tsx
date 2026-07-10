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

  const sectionStats = Array.from(
    rows.reduce((map, row) => {
      const key = row.section || "未分類";
      const current = map.get(key) ?? {
        section: key,
        total: 0,
        priced: 0,
        owned: 0,
      };

      current.total += 1;
      if (priceNumber(row.price) > 0) current.priced += 1;
      if (isOwned(row.owned)) current.owned += 1;

      map.set(key, current);
      return map;
    }, new Map<string, { section: string; total: number; priced: number; owned: number }>())
  )
    .map(([, value]) => value)
    .sort((a, b) => b.total - a.total);

  return (
    <section className="kether-overview-page-clean">
      <div className="kether-overview-clean-metrics">
        <article>
          <span>資料總數</span>
          <strong>{formatNumber(total)}</strong>
          <small>目前總覽分頁資料</small>
        </article>

        <article>
          <span>資料區塊</span>
          <strong>{formatNumber(sectionStats.length)}</strong>
          <small>依表格區塊整理</small>
        </article>

        <article>
          <span>價格完成</span>
          <strong>{percent(pricedRows.length, total)}%</strong>
          <small>{formatNumber(pricedRows.length)} 筆有白金價格</small>
        </article>

        <article>
          <span>總估值</span>
          <strong>{totalValue ? `${formatNumber(totalValue)} 白金` : "待更新"}</strong>
          <small>以已填價格計算</small>
        </article>
      </div>

      <article className="kether-overview-clean-panel">
        <div className="kether-overview-clean-head">
          <div>
            <p>KETHER OVERVIEW</p>
            <h2>資料區塊總覽</h2>
          </div>
          <span>已購買 {percent(ownedRows.length, total)}%</span>
        </div>

        <div className="kether-overview-clean-sections">
          {sectionStats.map((section) => (
            <div key={section.section}>
              <b>{section.section}</b>
              <span>{section.total} 筆</span>
              <small>
                價格 {section.priced}｜已購買 {section.owned}
              </small>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
