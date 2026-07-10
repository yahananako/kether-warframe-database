import Link from "next/link";
import {
  Bot,
  CircleHelp,
  Database,
  ExternalLink,
  Gamepad2,
  KeyRound,
  Radio,
  Search,
  ShieldCheck,
  Swords,
} from "lucide-react";
import BotWeaponSearchPanel from "../../components/BotWeaponSearchPanel";

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
    <main className="kether-bot-page">
      <section className="kether-bot-hero">
        <div className="kether-bot-hero-copy">
          <p className="kether-bot-kicker">
            <Bot size={16} />
            KETHER DISCORD BOT
          </p>

          <h1>小希 Bot 指令中樞</h1>

          <p>
            小希 BOT 是 KETHER Warframe 資料庫的 Discord 查詢助手，負責把常用資料、
            取得方式與網站入口整理成聊天頻道內可以快速呼叫的指令。
          </p>

          <div className="kether-bot-actions">
            <Link href="/" className="kether-bot-primary">
              返回首頁
            </Link>

            <Link href="/live" className="kether-bot-secondary">
              <Radio size={16} />
              小希星圖電波局
            </Link>

            <a href="/api/auth/discord/login" className="kether-bot-secondary">
              <KeyRound size={16} />
              Discord 登入
            </a>

            <a
              href="https://discord.gg/MFhTb8XMZ"
              target="_blank"
              rel="noreferrer"
              className="kether-bot-secondary"
            >
              <ExternalLink size={16} />
              加入 Discord
            </a>
          </div>
        </div>

        <div className="kether-bot-hero-banner">
          <img
            src="/home-hero-banner.png"
            alt="KETHER OF PARADISO Warframe 資料庫首頁版圖"
          />
        </div>
      </section>

      <section className="kether-bot-focus-grid" aria-label="小希 BOT 主要用途">
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

      <BotWeaponSearchPanel />

      <section className="kether-bot-panel">
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

      <section className="kether-bot-panel kether-bot-note-panel">
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

      <style>{`
        .kether-bot-page {
          width: min(1120px, calc(100% - 28px));
          margin: 0 auto;
          padding: clamp(28px, 5vw, 56px) 0 clamp(72px, 8vw, 110px);
          color: #172033;
        }

        .kether-bot-hero,
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

        .kether-bot-hero {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 260px;
          gap: clamp(18px, 4vw, 34px);
          align-items: center;
          padding: clamp(22px, 5vw, 42px);
          border-radius: 32px;
          overflow: hidden;
        }

        .kether-bot-kicker {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 12px;
          padding: 8px 12px;
          border-radius: 999px;
          color: #ffffff;
          background: linear-gradient(135deg, #7c3aed, #ec4899);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.14em;
        }

        .kether-bot-hero h1 {
          margin: 0;
          font-size: clamp(34px, 6vw, 62px);
          line-height: 1.04;
          letter-spacing: -0.05em;
        }

        .kether-bot-hero-copy > p:not(.kether-bot-kicker) {
          max-width: 760px;
          margin: 16px 0 0;
          color: #475569;
          font-size: clamp(15px, 2vw, 18px);
          font-weight: 750;
          line-height: 1.8;
        }

        .kether-bot-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 24px;
        }

        .kether-bot-primary,
        .kether-bot-secondary {
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 15px;
          border-radius: 16px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 900;
        }

        .kether-bot-primary {
          color: #ffffff;
          background: linear-gradient(135deg, #7c3aed, #ec4899);
          box-shadow: 0 14px 28px rgba(124, 58, 237, 0.22);
        }

        .kether-bot-secondary {
          color: #334155;
          background: rgba(255, 255, 255, 0.72);
          box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.22);
        }

        .kether-bot-sigil {
          min-height: 240px;
          border-radius: 28px;
          display: grid;
          place-items: center;
          text-align: center;
          color: #ffffff;
          background:
            radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.28), transparent 32%),
            linear-gradient(145deg, #312e81, #7c3aed 48%, #ec4899);
          box-shadow:
            0 24px 50px rgba(124, 58, 237, 0.24),
            inset 0 1px 0 rgba(255, 255, 255, 0.34);
        }

        .kether-bot-sigil span {
          margin-top: 10px;
          font-size: 26px;
          font-weight: 950;
          letter-spacing: 0.2em;
        }

        .kether-bot-sigil b {
          font-size: 12px;
          letter-spacing: 0.2em;
          opacity: 0.82;
        }

        .kether-bot-hero-banner {
          width: 100%;
          min-height: 240px;
          border-radius: 28px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.62);
          border: 1px solid rgba(255, 255, 255, 0.72);
          box-shadow:
            0 24px 50px rgba(15, 23, 42, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.72);
        }

        .kether-bot-hero-banner img {
          width: 100%;
          height: 100%;
          min-height: 240px;
          display: block;
          object-fit: cover;
          object-position: center;
        }

        .kether-bot-focus-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          margin-top: 16px;
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
          margin-top: 16px;
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

        .kether-bot-note-panel {
          margin-bottom: 22px;
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
          .kether-bot-hero {
            grid-template-columns: 1fr;
          }

          .kether-bot-hero-banner,
          .kether-bot-hero-banner img {
            min-height: 170px;
          }

          .kether-bot-focus-grid,
          .kether-bot-command-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 560px) {
          .kether-bot-page {
            width: min(100% - 20px, 1120px);
            padding-top: 22px;
          }

          .kether-bot-hero {
            padding: 18px;
            border-radius: 24px;
          }

          .kether-bot-actions {
            display: grid;
            grid-template-columns: 1fr;
          }

          .kether-bot-primary,
          .kether-bot-secondary {
            width: 100%;
          }

          .kether-bot-panel {
            border-radius: 24px;
          }
        }
      `}</style>
    </main>
  );
}
