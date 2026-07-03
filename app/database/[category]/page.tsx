import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Search,
  Bell,
  Menu,
  MessageCircle,
  Gem,
  Shield,
  Crosshair,
  Swords,
  Dog,
  Feather,
  Layers,
  ArrowLeft
} from "lucide-react";
import { fetchSheetRows, SHEET_GIDS } from "../../../lib/sheets";
import DataTable from "../../../components/DataTable";

const navItems = [
  { label: "總覽", key: "overview", href: "/database/overview", icon: Gem },
  { label: "戰甲", key: "warframes", href: "/database/warframes", icon: Shield },
  { label: "主要武器", key: "primary", href: "/database/primary", icon: Crosshair },
  { label: "次要武器", key: "secondary", href: "/database/secondary", icon: Crosshair },
  { label: "近戰武器", key: "melee", href: "/database/melee", icon: Swords },
  { label: "同伴", key: "companions", href: "/database/companions", icon: Dog },
  { label: "曲翼", key: "archwing", href: "/database/archwing", icon: Feather },
  { label: "MOD資料庫", key: "mods", href: "/database/mods", icon: Layers }
];

export default async function DatabaseCategoryPage({
  params
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  if (!SHEET_GIDS[category]) {
    notFound();
  }

  const { config, rows, error } = await fetchSheetRows(category);

  return (
    <main className="page-shell database-page">
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
              <Link href="/">首頁</Link>
              <Link href="/login">Discord 登入</Link>
              <Link href="/profile">個人進度</Link>
              <Link href="/db-status">資料庫狀態</Link>
              {navItems.map((item) => (
                <Link key={item.label} href={item.href}>
                  {item.label}
                </Link>
              ))}
              <a href="https://discord.gg/MFhTb8XMZ" target="_blank" rel="noreferrer">
                Discord 群組
              </a>
            </nav>
          </details>
          <span>KETHER</span>
        </div>

        <div className="topbar-right">
          <Search size={21} />
          <Bell size={20} />
          <a className="discord-mini" href="https://discord.gg/MFhTb8XMZ" target="_blank" rel="noreferrer">
            <MessageCircle size={18} />
            Discord
          </a>
        </div>
      </header>

      <section className="database-hero">
        <Link href="/" className="db-back">
          <ArrowLeft size={18} />
          返回首頁
        </Link>

        <p>KETHER OF PARADISO</p>
        <h1>{config.title}</h1>
        <span>{config.subtitle}</span>
        <b className="db-version-chip">網站版本 v2.4.7</b>
      </section>

      {error && (
        <section className="empty-state">
          <h2>讀取資料時發生問題</h2>
          <p>{error}</p>
        </section>
      )}

      {!error && <DataTable rows={rows} category={category} />}
    </main>
  );
}
