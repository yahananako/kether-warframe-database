import type { ReactNode } from "react";
import Link from "next/link";
import { MessageCircle, UserRound } from "lucide-react";

import HomeNewInlineMenu from "./HomeNewInlineMenu";
import HomeNewInlineNotifications from "./HomeNewInlineNotifications";
import HomeNewInlineSearch from "./HomeNewInlineSearch";
import KetherDynamicInfo from "./KetherDynamicInfo";

const databaseStats = [
  { label: "資料來源", value: "Google Sheets" },
  { label: "資料分頁", value: "7" },
  { label: "資料區塊", value: "即時同步" },
  { label: "電波節點", value: "12" },
];

const navItems = [
  { label: "總覽", href: "/database/overview", image: "/icon-overview.png", activeImage: "/icon-overview-2.png" },
  { label: "戰甲", href: "/database/warframes", image: "/icon-warframe.png", activeImage: "/icon-warframe-2.png" },
  { label: "主要武器", href: "/database/primary", image: "/icon-primary.png", activeImage: "/icon-primary-2.png" },
  { label: "次要武器", href: "/database/secondary", image: "/icon-secondary.png", activeImage: "/icon-secondary-2.png" },
  { label: "近戰武器", href: "/database/melee", image: "/icon-melee.png", activeImage: "/icon-melee-2.png" },
  { label: "同伴", href: "/database/companions", image: "/icon-companion.png", activeImage: "/icon-companion-2.png" },
  { label: "曲翼", href: "/database/archwing", image: "/icon-archwing.png", activeImage: "/icon-archwing-2.png" },
  { label: "MOD", href: "/database/mods", image: "/icon-mod.png", activeImage: "/icon-mod-2.png" },
];

export default function LiveChrome({ children }: { children: ReactNode }) {
  return (
    <main className="home-new-page">
      <div className="home-new-shell">
        <section className="home-new-hero-card">
          <div className="home-new-topbar">
            <div className="home-new-brand">
              <HomeNewInlineMenu />
              <span>KETHER</span>
            </div>

            <div className="home-new-hero-actions" aria-label="電波局快捷入口">
              <HomeNewInlineSearch />
              <HomeNewInlineNotifications />
              <Link href="/profile" className="home-new-round-action" aria-label="個人頁面">
                <UserRound size={18} />
                <span>個人</span>
              </Link>
              <Link
                href="https://discord.gg/TNGYQb5mBN"
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
            <img src="/home-hero-banner.png" alt="KETHER OF PARADISO 小希星圖電波局版圖" />
          </div>

          <div className="home-new-dynamic-inside">
            <KetherDynamicInfo />
          </div>
        </section>

        <details className="home-new-fold-card home-new-fold-nav">
          <summary className="home-new-fold-head" aria-label="展開或收合資料庫導覽">
            <span>
              <em>KETHER DATABASE NAVIGATION</em>
              <strong>資料庫導覽</strong>
            </span>
            <b className="home-new-fold-icon" aria-hidden="true" />
          </summary>

          <section className="home-new-nav-card">
            <div className="home-new-nav-grid">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="home-new-nav-item">
                  <span className="home-new-nav-icon">
                    <img className="home-new-nav-icon-normal" src={item.image} alt={item.label} />
                    <img className="home-new-nav-icon-active" src={item.activeImage} alt="" aria-hidden="true" />
                  </span>
                  <span className="home-new-nav-label">{item.label}</span>
                </Link>
              ))}
            </div>

            <div className="home-new-section-divider" aria-hidden="true"><span /></div>
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

        {children}

        <footer className="home-new-footer">
          <a
            className="home-new-footer-url"
            href="https://kether-warframe-database.vercel.app"
            target="_blank"
            rel="noreferrer"
          >
            https://kether-warframe-database.vercel.app
          </a>
          <p className="home-new-footer-credit">builder by ヤハ奈々子、羊咩、凱洛</p>
        </footer>
      </div>
    </main>
  );
}
