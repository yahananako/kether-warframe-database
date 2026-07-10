import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Crosshair,
  Dog,
  Feather,
  Gem,
  Layers,
  Menu,
  MessageCircle,
  Search,
  Shield,
  Swords,
} from "lucide-react";
import { fetchSheetRows, SHEET_GIDS } from "../../../lib/sheets";
import DataTable from "../../../components/DataTable";
import HomeNotificationsFloating from "../../../components/HomeNotificationsFloating";
import HomeSearchFloating from "../../../components/HomeSearchFloating";
import HomeMenuFloating from "../../../components/HomeMenuFloating";

const navItems = [
  { label: "總覽", key: "overview", href: "/database/overview", icon: Gem },
  { label: "戰甲", key: "warframes", href: "/database/warframes", icon: Shield },
  { label: "主要武器", key: "primary", href: "/database/primary", icon: Crosshair },
  { label: "次要武器", key: "secondary", href: "/database/secondary", icon: Crosshair },
  { label: "近戰武器", key: "melee", href: "/database/melee", icon: Swords },
  { label: "同伴", key: "companions", href: "/database/companions", icon: Dog },
  { label: "曲翼", key: "archwing", href: "/database/archwing", icon: Feather },
  { label: "MOD資料庫", key: "mods", href: "/database/mods", icon: Layers },
];

export default async function DatabaseCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  if (!SHEET_GIDS[category]) {
    notFound();
  }

  const { config, rows, error } = await fetchSheetRows(category);

  return (
    <main className="min-h-screen bg-[#f6f3ff] text-slate-950">
      <HomeMenuFloating />

      <div className="kether-database-top-actions" aria-label="資料庫快捷功能">
        <HomeSearchFloating />
        <HomeNotificationsFloating />
        <Link
          href="https://discord.gg"
          target="_blank"
          rel="noreferrer"
          className="kether-database-discord-action"
          aria-label="Discord 入口"
        >
          <MessageCircle size={18} />
          <span>Discord</span>
        </Link>
      </div>


      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-[34px] border border-white/70 bg-white/80 p-4 shadow-2xl shadow-violet-200/30 backdrop-blur sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link href="/" className="text-2xl font-black tracking-tight text-violet-700">
              KETHER
            </Link>

            <div className="flex flex-wrap items-center gap-2 text-sm font-black">
              <Link href="/" className="rounded-full bg-white px-4 py-2 text-slate-700 shadow">
                首頁
              </Link>
              <Link href="/login" className="rounded-full bg-white px-4 py-2 text-slate-700 shadow">
                Discord 登入
              </Link>
              <Link href="/profile" className="rounded-full bg-white px-4 py-2 text-slate-700 shadow">
                個人進度
              </Link>
              <Link href="/status" className="rounded-full bg-white px-4 py-2 text-slate-700 shadow">
                資料庫狀態
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <button className="rounded-full bg-white p-3 text-slate-700 shadow" aria-label="搜尋">
                <Search size={18} />
              </button>
              <button className="rounded-full bg-white p-3 text-slate-700 shadow" aria-label="通知">
                <Bell size={18} />
              </button>
              <button className="rounded-full bg-white p-3 text-slate-700 shadow" aria-label="選單">
                <Menu size={18} />
              </button>
            </div>
          </div>
        </header>

        <nav className="flex flex-wrap gap-2 rounded-[28px] border border-white/70 bg-white/70 p-3 shadow-xl shadow-violet-200/30 backdrop-blur">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.key === category;

            return (
              <Link
                key={item.key}
                href={item.href}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black transition ${
                  active
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-300/60"
                    : "bg-white text-slate-700 hover:bg-violet-50 hover:text-violet-700"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}

          <a
            href="https://discord.gg"
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white"
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={16} />
            Discord 群組
          </a>
        </nav>

        <section className="rounded-[34px] border border-white/70 bg-white/80 p-5 shadow-2xl shadow-violet-200/30 backdrop-blur sm:p-8">
          <Link
            href="/"
            className="mb-5 inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white"
          >
            <ArrowLeft size={16} />
            返回首頁
          </Link>

          <p className="text-xs font-black tracking-[0.28em] text-violet-600">
            KETHER OF PARADISO
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">
            {config.title}
          </h1>

          <p className="mt-3 max-w-2xl text-base font-bold leading-8 text-slate-600">
            {config.subtitle}
          </p>

          <span className="mt-4 inline-flex rounded-full bg-violet-100 px-4 py-2 text-sm font-black text-violet-700">
            網站版本 v2.5.33
          </span>
        </section>

        {error ? (
          <section className="rounded-[28px] border border-red-200 bg-red-50 p-6 text-red-700">
            <h2 className="text-xl font-black">讀取資料時發生問題</h2>
            <p className="mt-2 font-bold">{error}</p>
          </section>
        ) : (
          <DataTable rows={rows} category={category} />
        )}
      </div>
    </main>
  );
}
