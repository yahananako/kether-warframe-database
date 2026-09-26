import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, UserRound } from "lucide-react";

import HomeNewInlineMenu from "../../../components/HomeNewInlineMenu";
import HomeNewInlineNotifications from "../../../components/HomeNewInlineNotifications";
import HomeNewInlineSearch from "../../../components/HomeNewInlineSearch";
import IncarnonWeaponArchive from "../../../components/IncarnonWeaponArchive";
import KetherDynamicInfo from "../../../components/KetherDynamicInfo";
import { incarnonCatalog } from "../../../data/incarnonWeapons";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "靈化武器列表",
  description:
    "KETHER Warframe 靈化武器列表，依主要、次要、近戰分類，整理武器圖片、靈化特效、進化解鎖條件與進化能力。",
  alternates: {
    canonical: "/database/incarnon",
  },
};

const databaseStats = [
  { label: "靈化武器", value: `${incarnonCatalog.totals.all} 把` },
  { label: "應感創件", value: `${incarnonCatalog.totals.genesis} 把` },
  { label: "原生應感", value: `${incarnonCatalog.totals.natural} 把` },
  { label: "輪替組數", value: "9 組" },
];

const navItems = [
  { label: "總覽", href: "/database/overview", image: "/icon-overview.png", activeImage: "/icon-overview-2.png" },
  { label: "戰甲", href: "/database/warframes", image: "/icon-warframe.png", activeImage: "/icon-warframe-2.png" },
  { label: "主要武器", href: "/database/primary", image: "/icon-primary.png", activeImage: "/icon-primary-2.png" },
  { label: "次要武器", href: "/database/secondary", image: "/icon-secondary.png", activeImage: "/icon-secondary-2.png" },
  { label: "近戰武器", href: "/database/melee", image: "/icon-melee.png", activeImage: "/icon-melee-2.png" },
  { label: "靈化武器", href: "/database/incarnon", image: "/incarnon-weapons/braton.png", activeImage: "/incarnon-weapons/braton.png" },
  { label: "同伴", href: "/database/companions", image: "/icon-companion.png", activeImage: "/icon-companion-2.png" },
  { label: "曲翼", href: "/database/archwing", image: "/icon-archwing.png", activeImage: "/icon-archwing-2.png" },
  { label: "MOD", href: "/database/mods", image: "/icon-mod.png", activeImage: "/icon-mod-2.png" },
];

export default function IncarnonDatabasePage() {
  return (
    <main className="home-new-page">
      <div className="home-new-shell">
        <section className="home-new-hero-card">
          <div className="home-new-topbar">
            <div className="home-new-brand">
              <HomeNewInlineMenu />
              <span>KETHER</span>
            </div>

            <div className="home-new-hero-actions" aria-label="靈化武器頁快捷入口">
              <HomeNewInlineSearch />
              <HomeNewInlineNotifications />
              <Link href="/profile" className="home-new-round-action" aria-label="個人頁面">
                <UserRound size={18} />
                <span>個人</span>
              </Link>
              <a
                href="https://discord.gg/TNGYQb5mBN"
                target="_blank"
                rel="noreferrer"
                className="home-new-discord-action"
                aria-label="Discord 入口"
              >
                <MessageCircle size={18} />
                <span>Discord</span>
              </a>
            </div>
          </div>

          <div className="home-new-banner">
            <Image
              src="/home-hero-banner.png"
              alt="KETHER OF PARADISO 靈化武器資料庫版圖"
              width={1536}
              height={864}
              priority
              sizes="(max-width: 1180px) 100vw, 1180px"
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
                    item.href === "/database/incarnon"
                      ? "home-new-nav-item is-current"
                      : "home-new-nav-item"
                  }
                >
                  <span className="home-new-nav-icon">
                    <Image
                      className="home-new-nav-icon-normal"
                      src={item.image}
                      alt={item.label}
                      width={58}
                      height={58}
                    />
                    <Image
                      className="home-new-nav-icon-active"
                      src={item.activeImage}
                      alt=""
                      aria-hidden="true"
                      width={58}
                      height={58}
                    />
                  </span>
                  <span className="home-new-nav-label">{item.label}</span>
                </Link>
              ))}
            </div>

            <div className="home-new-section-divider" aria-hidden="true">
              <span />
            </div>

            <div className="home-new-database-line" aria-label="靈化資料庫狀態">
              {databaseStats.map((item) => (
                <div key={item.label} className="home-new-database-chip">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </section>
        </details>

        <section className={`kether-overview-intro-card ${styles.intro}`}>
          <div className="kether-database-intro-topline">
            <p>KETHER INCARNON ARMORY</p>
            <Link href="/" className="kether-database-home-link" aria-label="回首頁">
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m3 10 9-7 9 7" />
                <path d="M5 9v11h14V9" />
                <path d="M9 20v-6h6v6" />
              </svg>
              <span>回首頁</span>
            </Link>
          </div>

          <h1>靈化武器列表</h1>
          <span>
            依主要、次要、近戰三類整理完整應感武器。點開武器卡即可查看圖片、靈化特效、每階進化解鎖條件與全部能力選項。
          </span>

          <div className={styles.introStats} aria-label="靈化武器分類數量">
            <div><strong>{incarnonCatalog.totals.primary}</strong><span>主要</span></div>
            <div><strong>{incarnonCatalog.totals.secondary}</strong><span>次要</span></div>
            <div><strong>{incarnonCatalog.totals.melee}</strong><span>近戰</span></div>
            <div><strong>{incarnonCatalog.totals.all}</strong><span>全部</span></div>
          </div>
        </section>

        <section className="kether-category-content-shell">
          <IncarnonWeaponArchive />
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
          <p className="home-new-footer-credit">builder by ヤハ奈々子、羊咩、凱洛</p>
        </footer>
      </div>
    </main>
  );
}
