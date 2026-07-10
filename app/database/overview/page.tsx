import { fetchSheetRows } from "../../../lib/sheets";
import DatabaseOverviewPage, {
  type OverviewCategoryStat,
} from "../../../components/DatabaseOverviewPage";
import HomeMenuFloating from "../../../components/HomeMenuFloating";

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
      const totalValue = pricedRows.reduce((sum, row) => sum + priceNumber(row.price), 0);

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
    <main className="min-h-screen bg-[#f6f3ff] text-slate-950">
      <HomeMenuFloating />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <DatabaseOverviewPage
          rows={overviewData.rows}
          title={overviewData.config.title}
          subtitle={overviewData.config.subtitle}
          error={overviewData.error}
          categoryStats={categoryResults}
        />
      </div>
    </main>
  );
}
