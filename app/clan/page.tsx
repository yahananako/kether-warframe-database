import Link from "next/link";
import { MessageCircle, UserRound } from "lucide-react";
import HomeNewInlineMenu from "../../components/HomeNewInlineMenu";
import HomeNewInlineSearch from "../../components/HomeNewInlineSearch";
import HomeNewInlineNotifications from "../../components/HomeNewInlineNotifications";

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

export default function ClanPage() {
  return (
    <main className="home-new-page">
      <div className="home-new-shell">
        <section className="home-new-hero-card">
          <div className="home-new-topbar">
            <div className="home-new-brand">
              <HomeNewInlineMenu />
              <span>KETHER</span>
            </div>

            <div className="home-new-hero-actions" aria-label="氏族頁快捷入口">
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
              alt="KETHER OF PARADISO 氏族資料中心版圖"
            />
          </div>
        </section>

        <details className="home-new-fold-card home-new-fold-nav">
          <summary className="home-new-fold-head">
            <span>
              <em>KETHER DATABASE NAVIGATION</em>
              <strong>資料庫導覽</strong>
            </span>
            <b aria-hidden="true">⌄</b>
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
          </section>
        </details>

        <section className="kether-overview-intro-card">
          <p>KETHER CLAN CENTER</p>
          <h1>氏族資料中心</h1>
          <span>
            這裡是 KETHER 氏族頁入口。後續可放氏族介紹、成員資訊、Discord 規則、活動公告與氏族進度。
          </span>
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
