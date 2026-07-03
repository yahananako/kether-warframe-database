import Link from "next/link";
import DataTable from "@/components/DataTable";
import { fetchSheetRows } from "@/lib/sheets";

export default async function CategoryPage({
  params
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const { config, rows, error } = await fetchSheetRows(category);

  const ownedCount = rows.filter((row) => row.owned.includes("已購買")).length;
  const completion = rows.length > 0 ? Math.round((ownedCount / rows.length) * 100) : 0;

  return (
    <main className="page-shell category-page-v04">
      <header className="db-page-header">
        <Link href="/" className="db-back">← 返回首頁</Link>

        <div className="db-title-block">
          <p>KETHER OF PARADISO</p>
          <h1>{config.title}</h1>
          <span>{config.subtitle}</span>
        </div>

        <div className="db-version-chip">網站版本 v2.0.5</div>
      </header>

      <section className="db-kpi-grid">
        <article>
          <span>目前資料數</span>
          <strong>{rows.length}</strong>
        </article>
        <article>
          <span>資料來源</span>
          <strong>{config.sheetName}</strong>
        </article>
        <article>
          <span>已購買</span>
          <strong>{ownedCount}</strong>
        </article>
        <article>
          <span>完成度</span>
          <strong>{completion}%</strong>
        </article>
      </section>

      {error && (
        <section className="db-warning">
          <strong>資料讀取提醒</strong>
          <p>{error}</p>
        </section>
      )}

      <DataTable rows={rows} />
    </main>
  );
}
