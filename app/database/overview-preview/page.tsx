import Link from "next/link";
import HomeMenuFloating from "../../../components/HomeMenuFloating";
import HomeSearchFloating from "../../../components/HomeSearchFloating";
import HomeNotificationsFloating from "../../../components/HomeNotificationsFloating";

const previewStats = [
  { label: "資料來源", value: "Google Sheets" },
  { label: "資料分頁", value: "7" },
  { label: "資料區塊", value: "41" },
  { label: "同步節奏", value: "每日 04:00" },
];

const previewCategories = [
  "戰甲",
  "主要武器",
  "次要武器",
  "近戰武器",
  "同伴",
  "曲翼",
  "MOD",
];

export default function DatabaseOverviewPreviewPage() {
  return (
    <main className="database-preview-page">
      <HomeMenuFloating />
      <HomeSearchFloating />
      <HomeNotificationsFloating />

      <div className="database-preview-shell">
        <section className="database-preview-hero-card">
          <div className="database-preview-topbar">
            <div className="database-preview-brand">
              <span>KETHER</span>
            </div>

            <div className="database-preview-actions">
              <Link href="/profile">個人</Link>
              <Link href="https://discord.gg" target="_blank" rel="noreferrer">
                Discord
              </Link>
            </div>
          </div>

          <div className="database-preview-banner">
            <img
              src="/home-hero-banner.png"
              alt="KETHER OF PARADISO Warframe Database"
            />
          </div>
        </section>

        <section className="database-preview-content-card">
          <div className="database-preview-heading">
            <p>KETHER DATABASE OVERVIEW</p>
            <h1>資料庫總覽</h1>
            <span>
              這是資料庫總覽新版測試頁。確認版圖、框架、統計區與手機版排版穩定後，再替換正式總覽頁。
            </span>
          </div>

          <div className="database-preview-stat-grid">
            {previewStats.map((item) => (
              <article key={item.label} className="database-preview-stat-card">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </article>
            ))}
          </div>

          <div className="database-preview-divider" />

          <div className="database-preview-category-grid">
            {previewCategories.map((name) => (
              <article key={name} className="database-preview-category-card">
                <span>{name}</span>
                <strong>資料整理中</strong>
              </article>
            ))}
          </div>
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
