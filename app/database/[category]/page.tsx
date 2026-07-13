import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, UserRound } from "lucide-react";

import { fetchSheetRows, SHEET_GIDS } from "../../../lib/sheets";
import DataTable from "../../../components/DataTable";
import KetherDynamicInfo from "../../../components/KetherDynamicInfo";
import HomeNewInlineMenu from "../../../components/HomeNewInlineMenu";
import HomeNewInlineSearch from "../../../components/HomeNewInlineSearch";
import HomeNewInlineNotifications from "../../../components/HomeNewInlineNotifications";

const databaseStats = [
  { label: "資料來源", value: "Google Sheets" },
  { label: "資料分頁", value: "7" },
  { label: "資料區塊", value: "41" },
  { label: "同步節奏", value: "每日 04:00" },
];

const navItems = [
  {
    label: "總覽",
    href: "/database/overview",
    image: "/icon-overview.png",
    activeImage: "/icon-overview-2.png",
  },
  {
    label: "戰甲",
    href: "/database/warframes",
    image: "/icon-warframe.png",
    activeImage: "/icon-warframe-2.png",
  },
  {
    label: "主要武器",
    href: "/database/primary",
    image: "/icon-primary.png",
    activeImage: "/icon-primary-2.png",
  },
  {
    label: "次要武器",
    href: "/database/secondary",
    image: "/icon-secondary.png",
    activeImage: "/icon-secondary-2.png",
  },
  {
    label: "近戰武器",
    href: "/database/melee",
    image: "/icon-melee.png",
    activeImage: "/icon-melee-2.png",
  },
  {
    label: "同伴",
    href: "/database/companions",
    image: "/icon-companion.png",
    activeImage: "/icon-companion-2.png",
  },
  {
    label: "曲翼",
    href: "/database/archwing",
    image: "/icon-archwing.png",
    activeImage: "/icon-archwing-2.png",
  },
  {
    label: "MOD",
    href: "/database/mods",
    image: "/icon-mod.png",
    activeImage: "/icon-mod-2.png",
  },
];

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
  const categoryLabel = categoryNames[category] ?? config.title ?? "資料庫";

  return (
    <main className="home-new-page">
      <div className="home-new-shell">
        <section className="home-new-hero-card">
          <div className="home-new-topbar">
            <div className="home-new-brand">
              <HomeNewInlineMenu />

              <span>KETHER</span>
            </div>

            <div className="home-new-hero-actions" aria-label={`${categoryLabel}頁快捷入口`}>
              <HomeNewInlineSearch />

              <HomeNewInlineNotifications />

              <Link href="/profile" className="home-new-round-action" aria-label="個人頁面">
                <UserRound size={18} />
                <span>個人</span>
              </Link>

              <Link
                href="https://discord.gg"
                target="_blank"
                rel="noreferrer"
                className="home-new-discord-action"
                aria-label="Discord 入口"
              >
                <MessageCircle size={18} />
                <span>Discord</span>
              </Link>
            </div>
          </div>

          <div className="home-new-banner">
            <img
              src="/home-hero-banner.png"
              alt={`KETHER OF PARADISO ${categoryLabel}資料庫版圖`}
            />
          </div>

          <div className="home-new-dynamic-inside">
            <KetherDynamicInfo />
          </div>
        </section>

        <details className="home-new-fold-card home-new-fold-nav">
          <summary className="home-new-fold-head">
            <span>
              <em>KETHER DATABASE NAVIGATION</em>
              <strong>資料庫導覽</strong>
            </span>
            <b className="home-new-fold-icon" aria-hidden="true" />
          </summary>

          <section className="home-new-nav-card">
            <div className="home-new-nav-grid">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    item.href === `/database/${category}`
                      ? "home-new-nav-item is-current"
                      : "home-new-nav-item"
                  }
                >
                  <span className="home-new-nav-icon">
                    <img className="home-new-nav-icon-normal" src={item.image} alt={item.label} />
                    <img className="home-new-nav-icon-active" src={item.activeImage} alt="" aria-hidden="true" />
                  </span>

                  <span className="home-new-nav-label">{item.label}</span>
                </Link>
              ))}
            </div>

            <div className="home-new-section-divider" aria-hidden="true">
              <span />
            </div>

            <div className="home-new-database-line" aria-label="資料庫狀態">
              {databaseStats.map((item) => (
                <div key={item.label} className="home-new-database-chip">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </section>
        </details>

        <section className="kether-overview-intro-card">
          <p>KETHER DATABASE CATEGORY</p>
          <h1>{config.title}</h1>
          <span>
            {config.subtitle}
            <br />
            這裡保留原本資料表、搜尋、篩選、價格與 Discord 個人進度邏輯，只統一外層版型。
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
