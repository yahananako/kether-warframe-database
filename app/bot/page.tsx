import Link from "next/link";
import {
  BarChart3,
  Bot,
  CircleHelp,
  Database,
  MessageCircle,
  Search,
  ShieldCheck,
  Swords,
  UserRound,
} from "lucide-react";

import BotKetherSearchPanel from "../../components/BotKetherSearchPanel";
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
    label: "MOD",
    href: "/database/mods",
    image: "/icon-mod.png",
    activeImage: "/icon-mod-2.png",
  },
];

const botCommands = [
  {
    name: "/說明",
    alias: "/help",
    status: "指令導航",
    description: "查看小希 BOT 目前支援的指令與使用方向。",
  },
  {
    name: "/kether",
    alias: "KETHER 入口",
    status: "網站導覽",
    description: "快速取得 KETHER Warframe 資料庫與網站相關入口。",
  },
  {
    name: "/武器取得",
    alias: "Weapon Acquisition",
    status: "查詢功能",
    description: "依類型、系列與名稱查詢 Warframe 武器取得方式。",
  },
  {
    name: "/戰甲取得",
    alias: "Warframe Acquisition",
    status: "查詢功能",
    description: "查詢戰甲與 Prime / 一般版本的取得方向。",
  },
  {
    name: "/同伴取得",
    alias: "Companion Acquisition",
    status: "查詢功能",
    description: "整理同伴、寵物與相關取得資訊。",
  },
  {
    name: "/材料取得",
    alias: "Material Acquisition",
    status: "查詢功能",
    description: "查詢常用材料來源與取得提示。",
  },
  {
    name: "/遺物取得",
    alias: "Relic Acquisition",
    status: "查詢功能",
    description: "查詢遺物與相關獎勵資料。",
  },
  {
    name: "/warframe-profile",
    alias: "戰甲資料",
    status: "資料查詢",
    description: "查看指定戰甲的資料摘要與定位。",
  },
];

const focusCards = [
  {
    icon: Search,
    title: "Discord 內快速查詢",
    text: "不用離開聊天頻道，就能查 Warframe 取得方式、資料與指令說明。",
  },
  {
    icon: Database,
    title: "網站資料庫分工",
    text: "網站負責完整表格、個人進度與分類資料；BOT 負責 Discord 內快速回覆。",
  },
  {
    icon: ShieldCheck,
    title: "登入與權限分離",
    text: "Discord 登入、氏族權限與 BOT 指令各自分工，避免功能混在一起。",
  },
];

export default function BotPage() {
  return (
    <main className="home-new-page">
      <div className="home-new-shell">
        <section className="home-new-hero-card">
          <div className="home-new-topbar">
            <div className="home-new-brand">
              <HomeNewInlineMenu />

              <span>KETHER</span>
            </div>

            <div className="home-new-hero-actions" aria-label="BOT 頁快捷入口">
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
              alt="KETHER OF PARADISO 小希 BOT 指令中樞版圖"
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
          <p>KETHER DISCORD BOT</p>
          <h1>小希 Bot 指令中樞</h1>
          <span>
            小希 BOT 是 KETHER Warframe 資料庫的 Discord 查詢助手，負責把常用資料、
            取得方式與網站入口整理成聊天頻道內可以快速呼叫的指令。
          </span>
        </section>

        <section className="kether-bot-content-shell">
          <BotKetherSearchPanel />

          <details className="home-new-fold-card kether-bot-fold">
            <summary className="home-new-fold-head">
              <span>
                <em>KETHER BOT GUIDE</em>
                <strong>BOT 功能說明</strong>
              </span>
              <b className="home-new-fold-icon" aria-hidden="true" />
            </summary>

            <section className="kether-bot-focus-grid kether-bot-fold-body" aria-label="小希 BOT 主要用途">
              {focusCards.map((card) => {
                const Icon = card.icon;

                return (
                  <article key={card.title} className="kether-bot-focus-card">
                    <div className="kether-bot-focus-icon">
                      <Icon size={20} />
                    </div>

                    <h2>{card.title}</h2>
                    <p>{card.text}</p>
                  </article>
                );
              })}
            </section>
          </details>

          <details className="home-new-fold-card kether-bot-fold">
            <summary className="home-new-fold-head">
              <span>
                <em>KETHER DISCORD COMMANDS</em>
                <strong>Discord 指令清單</strong>
              </span>
              <b className="home-new-fold-icon" aria-hidden="true" />
            </summary>

            <section className="kether-bot-panel kether-bot-fold-body">
              <div className="kether-bot-section-title">
                <Swords size={19} />
                <div>
                  <h2>Discord 指令清單</h2>
                  <p>實際可用指令以 Discord 伺服器內顯示為準。</p>
                </div>
              </div>

              <div className="kether-bot-command-grid">
                {botCommands.map((command) => (
                  <article key={command.name} className="kether-bot-command-card">
                    <div className="kether-bot-command-top">
                      <strong>{command.name}</strong>
                      <span>{command.status}</span>
                    </div>

                    <p className="kether-bot-alias">{command.alias}</p>
                    <p>{command.description}</p>
                  </article>
                ))}
              </div>
            </section>
          </details>

          <details className="home-new-fold-card kether-bot-fold">
            <summary className="home-new-fold-head">
              <span>
                <em>KETHER BOT NOTE</em>
                <strong>使用提醒</strong>
              </span>
              <b className="home-new-fold-icon" aria-hidden="true" />
            </summary>

            <section className="kether-bot-panel kether-bot-note-panel kether-bot-fold-body">
              <div className="kether-bot-section-title">
                <CircleHelp size={19} />
                <div>
                  <h2>使用提醒</h2>
                  <p>BOT 與網站功能分工如下。</p>
                </div>
              </div>

              <div className="kether-bot-note-list">
                <p>
                  <b>Discord BOT：</b>
                  適合在群組內快速查詢資料、取得方式與指令說明。
                </p>

                <p>
                  <b>KETHER 網站：</b>
                  適合查看完整分類、價格欄位、已購買狀態與個人進度。
                </p>

                <p>
                  <b>Discord 登入：</b>
                  用於網站權限與個人化進度，和 BOT 指令本體分開管理。
                </p>
              </div>
            </section>
          </details>
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

        <style>{`
          .kether-bot-content-shell {
            display: grid;
            gap: 16px;
          }

          .kether-bot-panel,
          .kether-bot-focus-card {
            border: 1px solid rgba(255, 255, 255, 0.72);
            background:
              linear-gradient(135deg, rgba(255, 255, 255, 0.88), rgba(239, 246, 255, 0.74)),
              radial-gradient(circle at 12% 12%, rgba(236, 72, 153, 0.14), transparent 34%),
              radial-gradient(circle at 90% 0%, rgba(124, 58, 237, 0.16), transparent 32%);
            box-shadow:
              0 22px 48px rgba(15, 23, 42, 0.12),
              inset 0 1px 0 rgba(255, 255, 255, 0.82);
            backdrop-filter: blur(18px) saturate(1.25);
            -webkit-backdrop-filter: blur(18px) saturate(1.25);
          }

          .kether-bot-focus-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 14px;
          }

          .kether-bot-focus-card {
            padding: 18px;
            border-radius: 24px;
          }

          .kether-bot-focus-icon {
            width: 42px;
            height: 42px;
            border-radius: 16px;
            display: grid;
            place-items: center;
            color: #ffffff;
            background: linear-gradient(135deg, #7c3aed, #ec4899);
            box-shadow: 0 12px 24px rgba(124, 58, 237, 0.2);
          }

          .kether-bot-focus-card h2 {
            margin: 14px 0 7px;
            font-size: 17px;
          }

          .kether-bot-focus-card p,
          .kether-bot-command-card p,
          .kether-bot-note-list p {
            margin: 0;
            color: #475569;
            font-size: 14px;
            font-weight: 750;
            line-height: 1.7;
          }

          .kether-bot-panel {
            padding: clamp(18px, 4vw, 28px);
            border-radius: 30px;
          }

          .kether-bot-section-title {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 16px;
          }

          .kether-bot-section-title > svg {
            flex: 0 0 auto;
            margin-top: 4px;
            color: #7c3aed;
          }

          .kether-bot-section-title h2 {
            margin: 0;
            font-size: clamp(22px, 3vw, 30px);
            letter-spacing: -0.03em;
          }

          .kether-bot-section-title p {
            margin: 5px 0 0;
            color: #64748b;
            font-size: 14px;
            font-weight: 800;
          }

          .kether-bot-command-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }

          .kether-bot-command-card {
            padding: 15px;
            border-radius: 22px;
            background: rgba(255, 255, 255, 0.72);
            border: 1px solid rgba(148, 163, 184, 0.16);
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
          }

          .kether-bot-command-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            margin-bottom: 8px;
          }

          .kether-bot-command-top strong {
            font-size: 16px;
            letter-spacing: -0.02em;
          }

          .kether-bot-command-top span {
            flex: 0 0 auto;
            padding: 5px 8px;
            border-radius: 999px;
            color: #6d28d9;
            background: rgba(124, 58, 237, 0.1);
            font-size: 11px;
            font-weight: 900;
          }

          .kether-bot-alias {
            margin-bottom: 7px !important;
            color: #7c3aed !important;
            font-size: 12px !important;
            font-weight: 900 !important;
            letter-spacing: 0.06em;
          }

          .kether-bot-note-list {
            display: grid;
            gap: 10px;
          }

          .kether-bot-note-list p {
            padding: 13px 14px;
            border-radius: 18px;
            background: rgba(255, 255, 255, 0.7);
            border: 1px solid rgba(148, 163, 184, 0.14);
          }

          .kether-bot-note-list b {
            color: #172033;
          }

          @media (max-width: 860px) {
            .kether-bot-focus-grid,
            .kether-bot-command-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </main>
  );
}
