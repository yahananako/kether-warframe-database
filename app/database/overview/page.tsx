import DatabaseOverviewPage, { type OverviewCategoryStat } from "../../../components/DatabaseOverviewPage";
import { fetchSheetRows } from "../../../lib/sheets";
import styles from "../../../components/DatabaseCommandCenter.module.css";

const categoryTargets = [
  { key: "warframes", label: "戰甲" },
  { key: "primary", label: "主要武器" },
  { key: "secondary", label: "次要武器" },
  { key: "melee", label: "近戰武器" },
  { key: "companions", label: "同伴" },
  { key: "archwing", label: "曲翼" },
  { key: "mods", label: "MOD 資料庫" },
];

function priceNumber(value: string): number {
  const number = Number(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function isOwned(value: string) {
  return String(value || "").includes("已購買");
}

export default async function OverviewPage() {
  const [overviewData, categoryResults] = await Promise.all([
    fetchSheetRows("overview"),
    Promise.all(
      categoryTargets.map(async (item) => {
        const data = await fetchSheetRows(item.key);
        const rows = data.rows ?? [];
        const pricedRows = rows.filter((row) => priceNumber(row.price) > 0);
        const ownedRows = rows.filter((row) => isOwned(row.owned));
        const totalValue = pricedRows.reduce(
          (sum, row) => sum + priceNumber(row.price),
          0,
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
      }),
    ),
  ]);

  return (
    <main className={styles.page}>
      <DatabaseOverviewPage
        rows={overviewData.rows}
        title={overviewData.config.title}
        subtitle={overviewData.config.subtitle}
        error={overviewData.error}
        categoryStats={categoryResults}
      />
    </main>
  );
}
