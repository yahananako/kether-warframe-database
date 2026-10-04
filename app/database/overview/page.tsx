import Link from "next/link";
import { MessageCircle, UserRound } from "lucide-react";
import { fetchSheetRows } from "../../../lib/sheets";
import KetherDynamicInfo from "../../../components/KetherDynamicInfo";
import HomeNewInlineMenu from "../../../components/HomeNewInlineMenu";
import HomeNewInlineSearch from "../../../components/HomeNewInlineSearch";
import HomeNewInlineNotifications from "../../../components/HomeNewInlineNotifications";
import DatabaseOverviewPage, {
  type OverviewCategoryStat,
} from "../../../components/DatabaseOverviewPage";





const categoryTargets = [
  { key: "warframes", label: "戰甲" },
  { key: "primary", label: "主要武器" },
  { key: "secondary", label: "次要武器" },
  { key: "melee", label: "近戰武器" },
  { key: "companions", label: "同伴" },
  { key: "archwing", label: "曲翼" },
  { key: "mods", label: "MOD資料庫" },
];

function priceNumber(value: string): number {
  const number = Number(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function isOwned(value: string) {
  return String(value || "").includes("已購買");
}

export default async function OverviewPage() {
  const overviewData = await fetchSheetRows("overview");

  const categoryResults = await Promise.all(
    categoryTargets.map(async (item) => {
      const data = await fetchSheetRows(item.key);
      const rows = data.rows ?? [];
      const pricedRows = rows.filter((row) => priceNumber(row.price) > 0);
      const ownedRows = rows.filter((row) => isOwned(row.owned));
      const totalValue = pricedRows.reduce(
        (sum, row) => sum + priceNumber(row.price),
        0
      );

      return {
        key: item.key,
        label: item.label,
        total: rows.length,
        priced: pricedRows.length,
        owned: ownedRows.length,
        value: totalValue,
        error: data.error ?? null,
      } satisfies OverviewCategoryStat;
    })
  );

  return (
    <main className="home-new-page">
      <div className="home-new-shell">
        

        

        <div className="kether-database-overview-wrap">
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

          <DatabaseOverviewPage
            rows={overviewData.rows}
            title={overviewData.config.title}
            subtitle={overviewData.config.subtitle}
            error={overviewData.error}
            categoryStats={categoryResults}
          />
        </div>

        
      </div>
    </main>
  );
}
