import {
  Search,
  Bell,
  Menu,
  CalendarDays,
  Info,
  ClipboardList,
  Pencil,
  MessageCircle
} from "lucide-react";
import { fetchSheetRows } from "../lib/sheets";

type IconType =
  | "overview"
  | "warframe"
  | "primary"
  | "secondary"
  | "melee"
  | "companion"
  | "archwing"
  | "mod";

const navItems: { label: string; type: IconType; href: string }[] = [
  { label: "總覽", type: "overview", href: "/database/overview" },
  { label: "戰甲", type: "warframe", href: "/database/warframes" },
  { label: "主要武器", type: "primary", href: "/database/primary" },
  { label: "次要武器", type: "secondary", href: "/database/secondary" },
  { label: "近戰武器", type: "melee", href: "/database/melee" },
  { label: "同伴", type: "companion", href: "/database/companions" },
  { label: "曲翼", type: "archwing", href: "/database/archwing" },
  { label: "MOD資料庫", type: "mod", href: "/database/mods" }
];


function WfIcon({ type }: { type: IconType }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 3,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const
  };

  if (type === "overview") {
    return (
      <svg className="wf-svg" viewBox="0 0 64 64" aria-hidden="true">
        <path {...common} d="M32 5 L50 23 L32 59 L14 23 Z" />
        <path {...common} d="M32 13 L42 25 L32 48 L22 25 Z" />
        <path {...common} d="M14 23 H50" />
        <path {...common} d="M32 5 V59" />
      </svg>
    );
  }

  if (type === "warframe") {
    return (
      <svg className="wf-svg" viewBox="0 0 64 64" aria-hidden="true">
        <path {...common} d="M32 6 C21 9 13 20 13 34 C13 48 23 58 32 60 C41 58 51 48 51 34 C51 20 43 9 32 6 Z" />
        <path {...common} d="M22 24 C25 17 29 13 32 10 C35 13 39 17 42 24" />
        <path {...common} d="M22 29 L30 37 L24 52" />
        <path {...common} d="M42 29 L34 37 L40 52" />
        <path {...common} d="M29 25 H35" />
      </svg>
    );
  }

  if (type === "primary") {
    return (
      <svg className="wf-svg" viewBox="0 0 64 64" aria-hidden="true">
        <path {...common} d="M8 31 H39" />
        <path {...common} d="M39 26 H55 L58 31 L55 36 H39 Z" />
        <path {...common} d="M17 27 V23 H32 V27" />
        <path {...common} d="M21 35 L17 46 H28 L32 35" />
        <path {...common} d="M47 36 L52 45" />
      </svg>
    );
  }

  if (type === "secondary") {
    return (
      <svg className="wf-svg" viewBox="0 0 64 64" aria-hidden="true">
        <path {...common} d="M13 27 H43 L52 33 H43 V40 H29 L24 50 H16 L21 40 H13 Z" />
        <path {...common} d="M43 27 H57" />
        <path {...common} d="M30 40 L35 51" />
        <path {...common} d="M20 31 H35" />
      </svg>
    );
  }

  if (type === "melee") {
    return (
      <svg className="wf-svg" viewBox="0 0 64 64" aria-hidden="true">
        <path {...common} d="M48 7 C46 23 37 35 23 45" />
        <path {...common} d="M50 8 C38 17 30 28 23 45" />
        <path {...common} d="M20 42 L27 49" />
        <path {...common} d="M16 46 L22 52" />
        <path {...common} d="M11 57 L19 49" />
      </svg>
    );
  }

  if (type === "companion") {
    return (
      <svg className="wf-svg" viewBox="0 0 64 64" aria-hidden="true">
        <path {...common} d="M13 40 C16 30 25 25 35 27 L45 23 L52 30 L49 39 L56 44 L52 51 L41 48 C34 54 22 52 16 46 Z" />
        <path {...common} d="M43 24 L47 14 L51 27" />
        <path {...common} d="M24 48 L21 58" />
        <path {...common} d="M39 48 L42 58" />
        <path {...common} d="M13 40 L7 35" />
      </svg>
    );
  }

  if (type === "archwing") {
    return (
      <svg className="wf-svg" viewBox="0 0 64 64" aria-hidden="true">
        <path {...common} d="M32 14 L38 32 L32 54 L26 32 Z" />
        <path {...common} d="M28 29 C19 18 10 15 4 17 C10 26 17 34 29 38" />
        <path {...common} d="M36 29 C45 18 54 15 60 17 C54 26 47 34 35 38" />
        <path {...common} d="M22 39 L12 50" />
        <path {...common} d="M42 39 L52 50" />
      </svg>
    );
  }

  return (
    <svg className="wf-svg" viewBox="0 0 64 64" aria-hidden="true">
      <rect {...common} x="18" y="7" width="28" height="50" rx="4" />
      <path {...common} d="M25 15 H39" />
      <path {...common} d="M32 22 L41 32 L32 42 L23 32 Z" />
      <path {...common} d="M25 50 H39" />
      <path {...common} d="M32 27 V37" />
    </svg>
  );
}

export default async function HomePage() {
  const statCategories = [
    { key: "warframes", label: "戰甲" },
    { key: "primary", label: "主要武器" },
    { key: "secondary", label: "次要武器" },
    { key: "melee", label: "近戰武器" },
    { key: "companions", label: "同伴" },
    { key: "archwing", label: "曲翼" }
  ];

  const statResults = await Promise.all(
    statCategories.map(async (item) => {
      const result = await fetchSheetRows(item.key);
      const owned = result.rows.filter((row) => row.owned.includes("已購買")).length;

      return {
        label: item.label,
        count: result.rows.length,
        owned
      };
    })
  );

  const totalRows = statResults.reduce((sum, item) => sum + item.count, 0);
  const ownedRows = statResults.reduce((sum, item) => sum + item.owned, 0);
  const completion = totalRows > 0 ? Math.round((ownedRows / totalRows) * 100) : 0;

  const summary = statResults.map((item) => [
    item.label,
    item.count.toLocaleString("zh-TW")
  ]);

  return (
    <main className="page-shell">
      <div className="corner corner-lt" />
      <div className="corner corner-rt" />
      <div className="corner corner-lb" />
      <div className="corner corner-rb" />

      <header className="topbar">
        <div className="topbar-left">
          <details className="menu-drawer">
            <summary aria-label="開啟選單">
              <Menu size={22} />
            </summary>
            <nav className="menu-popup">
              <a href="/">首頁</a>
              {navItems.map((item) => (
                <a key={item.label} href={item.href}>{item.label}</a>
              ))}
              <a href="https://discord.gg/MFhTb8XMZ" target="_blank">Discord 群組</a>
            </nav>
          </details>
          <span>KETHER</span>
        </div>

        <div className="topbar-right">
          <Search size={21} />
          <Bell size={20} />
          <a className="discord-mini" href="https://discord.gg/MFhTb8XMZ" target="_blank">
            <MessageCircle size={18} />
            Discord
          </a>
        </div>
      </header>

      <section className="hero">
        <div className="clan-logo">
          <div className="logo-mark">K</div>
        </div>
        <h2>KETHER OF PARADISO</h2>
        <h1>Warframe 資料庫首頁</h1>
        <div className="divider">
          <span />
          <b>◆</b>
          <span />
        </div>
      </section>

      <section className="nav-panel" id="navigation">
        <div className="panel-tag">1　導航區</div>
        <div className="nav-grid">
          {navItems.map((item) => (
            <a className="nav-card" key={item.label} href={item.href}>
              <WfIcon type={item.type} />
              <strong>{item.label}</strong>
            </a>
          ))}
        </div>
      </section>

      <section className="dashboard-grid">
        <article className="info-card">
          <div className="card-title">
            <Info size={18} />
            <span>2　資訊區</span>
          </div>

          <div className="info-row">
            <CalendarDays size={34} />
            <span>更新日期</span>
            <b>2026/7/3</b>
          </div>

          <div className="line" />

          <div className="guide">
            <Info size={28} />
            <div>
              <h3>使用說明</h3>
              <p>・點選上方按鈕可前往各資料頁。</p>
              <p>・網站只讀取資料，不直接顯示原始表格。</p>
              <p>・已購買與完成度會做成個人化功能。</p>
              <p>・未來支援多 Discord 群組付費開通。</p>
            </div>
          </div>
        </article>

        <article className="info-card summary-card">
          <div className="card-title">
            <ClipboardList size={18} />
            <span>3　資料庫狀態</span>
          </div>

          <div className="summary-table">
            {summary.map(([name, count]) => (
              <div className="summary-row" key={name}>
                <span>{name}</span>
                <b>{count}</b>
              </div>
            ))}
          </div>

          <div className="total-row">
            <span>總計資料數</span>
            <b>{totalRows.toLocaleString("zh-TW")}</b>
          </div>
        </article>

        <article className="info-card notes-card">
          <div className="card-title">
            <Pencil size={18} />
            <span>4　備註</span>
          </div>

          <p>・目前為 v2.0.6，首頁統計會自動讀取 Google Sheets。</p>
          <p>・分類頁已串接 Google Sheets 真資料。</p>
          <p>・目前表格完成度為 {completion}%，未來會改成 Discord 個人化紀錄。</p>
          <div className="note-lines" />
          <div className="note-lines" />
          <div className="watermark">K</div>
        </article>
      </section>

      <footer>
        <span />
        <b>KETHER OF PARADISO</b>
        <span />
      </footer>
    </main>
  );
}
