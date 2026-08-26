import Link from "next/link";
import { MessageCircle, UserRound } from "lucide-react";
import KetherDynamicInfo from "../components/KetherDynamicInfo";
import HomeNewInlineMenu from "../components/HomeNewInlineMenu";
import HomeNewInlineSearch from "../components/HomeNewInlineSearch";
import HomeNewInlineNotifications from "../components/HomeNewInlineNotifications";
import HomeNewOfficialNews from "../components/HomeNewOfficialNews";
import { KETHER_VERSION_LABEL } from "../data/siteVersion";

const databaseStats = [
  { label: "資料來源", value: "Google Sheets" },
  { label: "資料分頁", value: "9" },
  { label: "戰甲收錄", value: "60＋Prime" },
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
    label: "一般戰甲",
    href: "/database/warframes",
    image: "/icon-warframe.png",
    activeImage: "/icon-warframe-2.png",
  },
  {
    label: "Prime 戰甲",
    href: "/database/warframes/prime",
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

const officialItems = [
  {
    label: "Warframe 官方網站",
    href: "https://www.warframe.com/zh-hant",
    description: "官方首頁、活動資訊與遊戲入口。",
  },
  {
    label: "官方新聞",
    href: "https://www.warframe.com/zh-hant/news",
    description: "官方公告、活動、更新與開發消息。",
  },
  {
    label: "官方掉落表",
    href: "https://www.warframe.com/droptables",
    description: "官方掉落資料查詢，用於確認物品來源。",
  },
  {
    label: "官方更新資訊",
    href: "https://forums.warframe.com/forum/3-pc-update-notes/",
    description: "版本更新、修正內容與官方補丁紀錄。",
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
            <img
              src="/home-hero-banner.png"
              alt="KETHER OF PARADISO Warframe Database 首頁版圖"
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
        </details>

        <details className="home-new-fold-card home-new-fold-database">
          <summary className="home-new-fold-head">
            <span>
              <em>KETHER DATABASE CORE</em>
              <strong>資料庫資訊</strong>
            </span>
            <b className="home-new-fold-icon" aria-hidden="true" />
          </summary>

          <section className="home-new-database-card">
            <div className="home-new-database-info-grid">
              <article className="home-new-database-info-card">
                <span>目前版本</span>
                <strong>{KETHER_VERSION_LABEL}</strong>
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
                    <b>一般戰甲 60 位＋Prime 專頁</b>
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
                  <li>戰甲檔案館已拆分為「一般戰甲」與「Prime 戰甲」兩座獨立頁面。</li>
                  <li>一般戰甲收錄 60 位，提供定位分類、圖片、故事與遊戲內入手條件。</li>
                  <li>Prime 戰甲獨立顯示白金價格、交易連結與個人持有資料。</li>
                  <li>故事書主線與支線皆採任務專屬封面，不再共用戰甲圖片。</li>
                  <li>資料價格每日 04:00 同步；若顯示異常，請重新整理或確認最新部署。</li>
                </ul>
              </article>
            </div>
          </section>
        </details>

        <details className="home-new-fold-card home-new-fold-official">
          <summary className="home-new-fold-head">
            <span>
              <em>KETHER OFFICIAL DATA</em>
              <strong>官方資料</strong>
            </span>
            <b className="home-new-fold-icon" aria-hidden="true" />
          </summary>

          <section className="home-new-official-card">
            <div className="home-new-official-grid">
              {officialItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="home-new-official-item"
                >
                  <span>{item.label}</span>
                  <p>{item.description}</p>
                </Link>
              ))}
            </div>

            <HomeNewOfficialNews />
          </section>
        </details>
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
