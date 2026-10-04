import Link from "next/link";
import { notFound } from "next/navigation";

import DataTable from "../../../components/DataTable";
import { fetchSheetRows, SHEET_GIDS } from "../../../lib/sheets";

const categoryNames: Record<string, string> = {
  warframes: "戰甲",
  primary: "主要武器",
  secondary: "次要武器",
  melee: "近戰武器",
  companions: "同伴",
  archwing: "曲翼",
  mods: "MOD",
};

export default async function DatabaseCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  if (!SHEET_GIDS[category]) {
    notFound();
  }

  const { config, rows, error } = await fetchSheetRows(category);

  return (
    <main className="home-new-page">
      <div className="home-new-shell">
        <section className="kether-overview-intro-card">
          <div className="kether-database-intro-topline">
            <p>KETHER DATABASE CATEGORY</p>
            <Link
              href="/"
              className="kether-database-home-link"
              aria-label="回首頁"
              title="回首頁"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m3 10 9-7 9 7" />
                <path d="M5 9v11h14V9" />
                <path d="M9 20v-6h6v6" />
              </svg>
              <span>回首頁</span>
            </Link>
          </div>

          <h1>{config.title}</h1>
          <span>
            {config.subtitle}
            <br />
            搜尋與篩選裝備，查看取得方式、交易價格及個人收藏進度。
          </span>
        </section>

        {error ? (
          <section className="kether-overview-error">
            <h2>讀取資料時發生問題</h2>
            <p>{error}</p>
          </section>
        ) : (
          <section className="kether-category-content-shell">
            <DataTable rows={rows} category={category} />
          </section>
        )}
      </div>
    </main>
  );
}
