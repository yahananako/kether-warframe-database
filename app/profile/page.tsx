import Link from "next/link";

import {
  MessageCircle,
  UserRound,
} from "lucide-react";

import AuthSessionStatus from "../../components/AuthSessionStatus";
import BillingPlanStatus from "../../components/BillingPlanStatus";
import HomeNewInlineMenu from "../../components/HomeNewInlineMenu";
import HomeNewInlineNotifications from "../../components/HomeNewInlineNotifications";
import HomeNewInlineSearch from "../../components/HomeNewInlineSearch";
import KetherDynamicInfo from "../../components/KetherDynamicInfo";
import ProfileOwnedSummary from "../../components/ProfileOwnedSummary";
import ProfilePrivacyDisclaimer from "../../components/ProfilePrivacyDisclaimer";

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

export default function ProfilePage() {
  return (
    <main className="home-new-page">
      <div className="home-new-shell">
        <section className="home-new-hero-card">
          <div className="home-new-topbar">
            <div className="home-new-brand">
              <HomeNewInlineMenu />
              <span>KETHER</span>
            </div>

            <div className="home-new-hero-actions" aria-label="個人中心快捷入口">
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
              alt="KETHER OF PARADISO 個人進度中心版圖"
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

        <section className="kether-overview-intro-card">
          <p>KETHER PROFILE CENTER</p>
          <h1>個人進度中心</h1>
          <span>
            Discord 個人名片、收藏摘要、方案狀態與資料使用說明集中於此。
            除 Discord 名片外，其餘內容預設收起。
          </span>
        </section>

        <AuthSessionStatus />

        <details className="home-new-fold-card">
          <summary className="home-new-fold-head">
            <span>
              <em>KETHER PERSONAL COLLECTION</em>
              <strong>個人收藏摘要</strong>
            </span>
            <b className="home-new-fold-icon" aria-hidden="true" />
          </summary>

          <section style={{ padding: 18 }}>
            <ProfileOwnedSummary />
          </section>
        </details>

        <details className="home-new-fold-card">
          <summary className="home-new-fold-head">
            <span>
              <em>PERSONAL DATABASE FLOW</em>
              <strong>個人化資料庫流程</strong>
            </span>
            <b className="home-new-fold-icon" aria-hidden="true" />
          </summary>

          <section className="auth-flow" style={{ margin: 18 }}>
            <div>
              <span>1</span>
              <p>使用者透過 Discord 登入</p>
            </div>

            <div>
              <span>2</span>
              <p>網站檢查 Discord Guild ID，並依設定檢查 Role ID</p>
            </div>

            <div>
              <span>3</span>
              <p>通過後建立 Discord session cookie</p>
            </div>

            <div>
              <span>4</span>
              <p>讀寫個人已購買、完成度與方案狀態資料</p>
            </div>
          </section>
        </details>

        <details className="home-new-fold-card">
          <summary className="home-new-fold-head">
            <span>
              <em>KETHER PERSONAL PLAN</em>
              <strong>個人方案狀態</strong>
            </span>
            <b className="home-new-fold-icon" aria-hidden="true" />
          </summary>

          <section className="auth-grid" style={{ padding: 18 }}>
            <BillingPlanStatus />
          </section>
        </details>

        <ProfilePrivacyDisclaimer />

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
