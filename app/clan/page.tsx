import {
  BadgeCheck,
  Database,
  KeyRound,
  MessageCircle,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";

import ClanAccessStatus from "../../components/ClanAccessStatus";
import ClanAnnouncementBoard from "../../components/ClanAnnouncementBoard";
import ClanDiscordAccessCard from "../../components/ClanDiscordAccessCard";
import ClanPrivacyDisclaimer from "../../components/ClanPrivacyDisclaimer";

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
        <section className="kether-overview-intro-card kether-clan-intro-card">
          <div className="kether-clan-intro-topline">
            <p>KETHER CLAN PAGE</p>

            <Link
              href="/"
              className="kether-clan-home-link"
              aria-label="回首頁"
              title="回首頁"
            >
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
              回首頁
            </Link>
          </div>

          <h1>KETHER OF PARADISO</h1>
          <span>
            這裡是 KETHER OF PARADISO 的專屬氏族頁，集中顯示氏族公告、Discord
            權限、資料庫授權與 KETHER 訂閱狀態。
          </span>
        </section>

        <ClanAnnouncementBoard />

        <ClanAccessStatus />

        <ClanPrivacyDisclaimer />

        <section
          className="kether-clan-quick-grid"
          aria-label="KETHER 氏族登入入口"
        >
          <ClanDiscordAccessCard />
        </section>

        <details className="home-new-fold-card kether-clan-fold">
          <summary className="home-new-fold-head">
            <span>
              <em>KETHER CLAN INFO</em>
              <strong>氏族與網站連動資訊</strong>
            </span>
            <b className="home-new-fold-icon" aria-hidden="true" />
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
              <p>
                使用 Discord OAuth 登入，未來可依 Guild ID 與 Role ID
                做權限判斷。
              </p>
            </article>

            <article>
              <Database size={24} />
              <h3>資料庫模式</h3>
              <p>
                KETHER
                目前使用自己的資料庫。其他付費群組未來會讀取自己的資料庫。
              </p>
            </article>
          </section>
        </details>

        <details className="home-new-fold-card kether-clan-fold">
          <summary className="home-new-fold-head">
            <span>
              <em>KETHER GROUP DATABASE</em>
              <strong>未來付費群組獨立庫規劃</strong>
            </span>
            <b className="home-new-fold-icon" aria-hidden="true" />
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
            <b className="home-new-fold-icon" aria-hidden="true" />
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
      </div>
    </main>
  );
}
