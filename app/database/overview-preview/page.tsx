import Link from "next/link";
import {
  Bell,
  Menu,
  MessageCircle,
  Search,
  UserCircle,
} from "lucide-react";
import { fetchSheetRows } from "../../../lib/sheets";
import DatabaseOverviewPage, {
  type OverviewCategoryStat,
} from "../../../components/DatabaseOverviewPage";

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
    <main className="kether-database-preview-page">
      <div className="kether-database-preview-shell">
        <section className="kether-database-preview-hero">
          <div className="kether-database-inline-toolbar">
            <div className="kether-database-inline-left">
              <details className="kether-database-inline-popover">
                <summary
                  className="kether-database-inline-icon"
                  aria-label="開啟選單"
                >
                  <Menu size={22} />
                </summary>

                <div className="kether-database-inline-panel kether-database-inline-menu-panel">
                  <p>KETHER MENU</p>
                  <strong>資料庫選單</strong>

                  <div className="kether-database-inline-link-grid">
                    <Link href="/">首頁</Link>
                    <Link href="/database/overview">資料庫總覽</Link>
                    <Link href="/bot">小希 Bot</Link>
                    <Link href="/live">小希星圖電波局</Link>
                    <Link href="/profile">個人中心</Link>
                  </div>
                </div>
              </details>

              <div className="kether-database-preview-brand">KETHER</div>
            </div>

            <div
              className="kether-database-inline-actions"
              aria-label="資料庫快捷功能"
            >
              <details className="kether-database-inline-popover">
                <summary
                  className="kether-database-inline-icon"
                  aria-label="搜尋"
                >
                  <Search size={21} />
                </summary>

                <div className="kether-database-inline-panel kether-database-inline-search-panel">
                  <p>KETHER SEARCH</p>
                  <strong>資料庫搜尋</strong>
                  <span>搜尋功能之後會接回正式資料庫搜尋。這裡先固定在版圖工具列內。</span>

                  <div className="kether-database-inline-link-grid">
                    <Link href="/database/overview">總覽</Link>
                    <Link href="/database/warframes">戰甲</Link>
                    <Link href="/database/primary">主要武器</Link>
                    <Link href="/database/secondary">次要武器</Link>
                    <Link href="/database/melee">近戰武器</Link>
                    <Link href="/database/mods">MOD</Link>
                  </div>
                </div>
              </details>

              <details className="kether-database-inline-popover">
                <summary
                  className="kether-database-inline-icon"
                  aria-label="通知"
                >
                  <Bell size={20} />
                </summary>

                <div className="kether-database-inline-panel kether-database-inline-notice-panel">
                  <p>KETHER NOTICE</p>
                  <strong>資料庫頁測試中</strong>
                  <span>
                    目前正在測試新版資料庫頁外框。確認後才會替換正式總覽頁。
                  </span>
                </div>
              </details>

              <Link
                href="/profile"
                className="kether-database-inline-icon"
                aria-label="個人中心"
              >
                <UserCircle size={21} />
              </Link>

              <Link
                href="https://discord.gg"
                target="_blank"
                rel="noreferrer"
                className="kether-database-inline-discord"
                aria-label="Discord 入口"
              >
                <MessageCircle size={21} />
              </Link>
            </div>
          </div>

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
