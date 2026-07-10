import Link from "next/link";
import {
  Crosshair,
  Dog,
  Feather,
  Gem,
  Layers,
  Shield,
  Swords,
} from "lucide-react";
import { fetchSheetRows } from "../../../lib/sheets";
import DatabaseOverviewPage from "../../../components/DatabaseOverviewPage";

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

export default async function OverviewPage() {
  const { config, rows, error } = await fetchSheetRows("overview");

  return (
    <main className="min-h-screen bg-[#f6f3ff] text-slate-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap gap-2 rounded-[28px] border border-white/70 bg-white/70 p-3 shadow-xl shadow-violet-200/30 backdrop-blur">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.key === "overview";

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
        </nav>

        <DatabaseOverviewPage
          rows={rows}
          title={config.title}
          subtitle={config.subtitle}
          error={error}
        />
      </div>
    </main>
  );
}
