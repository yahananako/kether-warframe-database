import Link from "next/link";
import { MessageCircle, UserCircle } from "lucide-react";
import { fetchSheetRows } from "../../../lib/sheets";
import DatabaseOverviewPage, {
  type OverviewCategoryStat,
} from "../../../components/DatabaseOverviewPage";
import HomeMenuFloating from "../../../components/HomeMenuFloating";
import HomeNotificationsFloating from "../../../components/HomeNotificationsFloating";
import HomeSearchFloating from "../../../components/HomeSearchFloating";

const categoryTargets = [
  { key: "overview", label: "總覽", href: "/database/overview" },
  { key: "warframes", label: "戰甲", href: "/database/warframes" },
  { key: "primary", label: "主要武器", href: "/database/primary" },
  { key: "secondary", label: "次要武器", href: "/database/secondary" },
  { key: "melee", label: "近戰武器", href: "/database/melee" },
  { key: "companions", label: "同伴", href: "/database/companions" },
  { key: "archwing", label: "曲翼", href: "/database/archwing" },
  { key: "mods", label: "MOD", href: "/database/mods" },
];

const statTargets = categoryTargets.filter((item) => item.key !== "overview");

function priceNumber(value: string): number {
  const number = Number(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function isOwned(value: string) {
  return String(value || "").includes("已購買");
}

export default async function OverviewPreviewPage() {
  const overviewData = await fetchSheetRows("overview");

  const categoryResults = await Promise.all(
    statTargets.map(async (item) => {
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
    <main className="kether-database-preview-page">
      <HomeMenuFloating />

      <div className="kether-database-preview-top-actions" aria-label="資料庫快捷功能">
        <HomeSearchFloating />
        <HomeNotificationsFloating />

        <Link
          href="/profile"
          className="kether-database-preview-profile-action"
          aria-label="個人中心"
        >
          <UserCircle size={18} />
          <span>個人</span>
        </Link>

        <Link
          href="https://discord.gg"
          target="_blank"
          rel="noreferrer"
          className="kether-database-preview-discord-action"
          aria-label="Discord 入口"
        >
          <MessageCircle size={18} />
          <span>Discord</span>
        </Link>
      </div>

      <div className="kether-database-preview-shell">
        <section className="kether-database-preview-hero">
          <div className="kether-database-preview-brand">KETHER</div>

          <div className="kether-database-preview-banner">
            <img
              src="/home-hero-banner.png"
              alt="KETHER OF PARADISO Warframe 資料庫版圖"
            />
          </div>
        </section>

        <section className="kether-database-preview-nav" aria-label="資料庫導覽">
          <div className="kether-database-preview-nav-head">
            <p>KETHER DATABASE NAVIGATION</p>
            <h2>資料庫導覽</h2>
          </div>

          <div className="kether-database-preview-nav-grid">
            {categoryTargets.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={item.key === "overview" ? "is-active" : ""}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="kether-database-preview-overview">
          <DatabaseOverviewPage
            rows={overviewData.rows}
            title={overviewData.config.title}
            subtitle={overviewData.config.subtitle}
            error={overviewData.error}
            categoryStats={categoryResults}
            hideHero
          />
        </section>

        <footer className="home-new-footer">
          <a
            className="home-new-footer-url"
            href="https://kether-warframe-database.vercel.app"
            target="_blank"
            rel="noreferrer"
          >
            https://kether-warframe-database.vercel.app
          </a>

          <p className="home-new-footer-credit">
            builder by ヤハ奈々子、羊咩、凱洛
          </p>
        </footer>
      </div>
    </main>
  );
}
