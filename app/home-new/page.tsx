import Link from "next/link";
import { Bell, Menu, MessageCircle, Search, UserRound } from "lucide-react";
import KetherDynamicInfo from "../../components/KetherDynamicInfo";

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
    label: "MOD資料庫",
    href: "/database/mods",
    image: "/icon-mod.png",
    activeImage: "/icon-mod-2.png",
  },
];

export default function HomeNewPage() {
  return (
    <main className="home-new-page">
      <div className="home-new-shell">
        <section className="home-new-hero-card">
          <div className="home-new-topbar">
            <div className="home-new-brand">
              <button className="home-new-menu-button" type="button" aria-label="開啟選單">
                <Menu size={26} />
              </button>

              <span>KETHER</span>
            </div>

            <div className="home-new-hero-actions" aria-label="首頁快捷入口">
              <button className="home-new-icon-action" type="button" aria-label="搜尋">
                <Search size={22} />
              </button>

              <button className="home-new-icon-action" type="button" aria-label="通知">
                <Bell size={22} />
              </button>

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
              alt="KETHER OF PARADISO Warframe Database 首頁版圖"
            />
          </div>

          <div className="home-new-dynamic-inside">
            <KetherDynamicInfo />
          </div>
        </section>

        <section className="home-new-nav-card">
          <div className="home-new-nav-heading">
            <p>KETHER DATABASE NAVIGATION</p>
            <h2>資料庫導覽</h2>
          </div>

          <div className="home-new-database-line" aria-label="資料庫狀態">
            {databaseStats.map((item) => (
              <div key={item.label} className="home-new-database-chip">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>

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
      </div>
    </main>
  );
}
