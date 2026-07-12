import Link from "next/link";
import {
  BadgeCheck,
  Database,
  MessageCircle,
  Shield,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";

import KetherDynamicInfo from "../../components/KetherDynamicInfo";
import HomeNewInlineMenu from "../../components/HomeNewInlineMenu";
import HomeNewInlineSearch from "../../components/HomeNewInlineSearch";
import HomeNewInlineNotifications from "../../components/HomeNewInlineNotifications";
import ClanDiscordAccessCard from "../../components/ClanDiscordAccessCard";

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


const roadmapItems = [
  {
    icon: Database,
    title: "KETHER 專屬資料庫",
    text: "目前 /clan 先作為 KETHER OF PARADISO 專屬氏族頁，使用 KETHER 目前資料庫與網站設定。",
  },
  {
    icon: Users,
    title: "成員與名片",
    text: "未來可接入 Discord 成員資訊、身分組、遊戲資料、個人名片與收藏進度。",
  },
  {
    icon: Shield,
    title: "身分組與權限",
    text: "可依 Discord 群組與身分組區分一般成員、管理員、付費群組與專屬資料權限。",
  },
  {
    icon: Sparkles,
    title: "付費群組獨立庫",
    text: "未來其他付費群組會像個人頁一樣，連結後讀取自己的資料庫、公告、成員與 BOT 設定。",
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

            <div className="home-new-hero-actions" aria-label="氏族中心快捷入口">
              <HomeNewInlineSearch />

              <HomeNewInlineNotifications />

              <Link href="/profile" className="home-new-round-action" aria-label="個人頁面">
                <UserRound size={18} />
                <span>個人</span>
              </Link>

              <Link
                href="https://discord.gg/MFhTb8XMZ"
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
          <p>KETHER CLAN PAGE</p>
          <h1>KETHER OF PARADISO</h1>
          <span>
            這裡是 KETHER OF PARADISO 的專屬氏族頁。此頁會作為 KETHER 群組的
            Discord 入口、網站登入說明、BOT 連動說明與未來群組資料庫的展示中心。
          </span>
        </section>

        <section className="kether-clan-quick-grid" aria-label="KETHER 氏族登入入口">
          <ClanDiscordAccessCard />
        </section>

        <details className="home-new-fold-card kether-clan-fold">
          <summary className="home-new-fold-head">
            <span>
              <em>KETHER CLAN INFO</em>
              <strong>氏族與網站連動資訊</strong>
            </span>
            <b aria-hidden="true">⌄</b>
          </summary>

          <section className="kether-clan-info-grid kether-clan-fold-body">
            <article>
              <BadgeCheck size={24} />
              <h3>目前群組</h3>
              <p>KETHER OF PARADISO</p>
            </article>

            <article>
              <MessageCircle size={24} />
              <h3>Discord 用途</h3>
              <p>登入網站、使用 BOT、接收公告、確認身分組與未來群組權限。</p>
            </article>

            <article>
              <KeyRound size={24} />
              <h3>登入方式</h3>
              <p>使用 Discord OAuth 登入，未來可依 Guild ID 與 Role ID 做權限判斷。</p>
            </article>

            <article>
              <Database size={24} />
              <h3>資料庫模式</h3>
              <p>KETHER 目前使用自己的資料庫。其他付費群組未來會讀取自己的資料庫。</p>
            </article>
          </section>
        </details>

        <details className="home-new-fold-card kether-clan-fold">
          <summary className="home-new-fold-head">
            <span>
              <em>KETHER GROUP DATABASE</em>
              <strong>未來付費群組獨立庫規劃</strong>
            </span>
            <b aria-hidden="true">⌄</b>
          </summary>

          <section className="kether-clan-roadmap-grid kether-clan-fold-body">
            {roadmapItems.map((item) => {
              const Icon = item.icon;

              return (
                <article key={item.title} className="kether-clan-roadmap-card">
                  <div>
                    <Icon size={22} />
                  </div>

                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              );
            })}
          </section>
        </details>

        <details className="home-new-fold-card kether-clan-fold">
          <summary className="home-new-fold-head">
            <span>
              <em>KETHER CLAN NOTE</em>
              <strong>目前建置狀態</strong>
            </span>
            <b aria-hidden="true">⌄</b>
          </summary>

          <section className="kether-clan-note kether-clan-fold-body">
            <p>
              目前此頁先作為 KETHER OF PARADISO 的專屬氏族頁。後續會逐步接入
              氏族公告、Discord 成員資料、身分組狀態、個人名片與群組資料庫。
            </p>

            <p>
              未來其他付費群組會像個人頁一樣，連結後進入自己的頁面、讀取自己的庫、
              使用自己的 BOT / 網站連動設定，不會和 KETHER 的資料混在一起。
            </p>
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
