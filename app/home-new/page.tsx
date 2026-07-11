import Link from "next/link";
import { MessageCircle, UserRound } from "lucide-react";
import KetherDynamicInfo from "../../components/KetherDynamicInfo";
import HomeNewInlineMenu from "../../components/HomeNewInlineMenu";
import HomeNewInlineSearch from "../../components/HomeNewInlineSearch";
import HomeNewInlineNotifications from "../../components/HomeNewInlineNotifications";

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
              <HomeNewInlineMenu />

              <span>KETHER</span>
            </div>

            <div className="home-new-hero-actions" aria-label="首頁快捷入口">
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


        <section className="home-new-database-card">
          <div className="home-new-database-heading">
            <p>KETHER DATABASE CORE</p>
            <h2>資料庫資訊</h2>
          </div>

          <div className="home-new-database-info-grid">
            <article className="home-new-database-info-card">
              <span>目前版本</span>
              <strong>V2.5.2+BOT-3.5.1</strong>
            </article>

            <article className="home-new-database-info-card">
              <span>資料庫狀態</span>

              <ul className="home-new-database-status-list">
                <li>
                  <em>資料來源</em>
                  <b>Google Sheets</b>
                </li>
                <li>
                  <em>每日更新時間</em>
                  <b>04:00</b>
                </li>
                <li>
                  <em>目前資料總數</em>
                  <b>41 區塊</b>
                </li>
                <li>
                  <em>同步狀態</em>
                  <b>同步正常</b>
                </li>
              </ul>
            </article>

            <article className="home-new-database-info-card home-new-database-notes-card">
              <span>備註</span>

              <ul className="home-new-notebook-list">
                <li>首頁目前在 /home-new 測試中，確認穩定後才會替換正式首頁。</li>
                <li>功能會分段接線：選單、搜尋、鈴鐺、導覽、資料庫資訊逐步確認。</li>
                <li>資料以 Google Sheets 為主來源，網站僅顯示整理後的資料內容。</li>
                <li>版本號只在功能確認完成後更新，不在半成品階段提前變更。</li>
                <li>若資料顯示異常，先確認同步狀態與最新部署版本。</li>
              </ul>
            </article>
          </div>
        </section>

      </div>
    </main>
  );
}
