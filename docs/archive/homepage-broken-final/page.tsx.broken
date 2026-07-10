import Link from "next/link";
import { MessageCircle, Radio, Sparkles } from "lucide-react";
import { fetchSheetRows } from "../lib/sheets";
import HomeSearchFloating from "../components/HomeSearchFloating";
import HomeNotificationsFloating from "../components/HomeNotificationsFloating";
import HomeMenuFloating from "../components/HomeMenuFloating";
import HomeAuthMini from "../components/HomeAuthMini";
import HomePersonalProgress from "../components/HomePersonalProgress";
import KetherClanWatermark from "../components/KetherClanWatermark";
import OfficialNewsBoard from "../components/OfficialNewsBoard";
import KetherDynamicInfo from "../components/KetherDynamicInfo";
import HomeStarChartInfo from "../components/HomeStarChartInfo";

const navItems = [
  { label: "總覽", key: "overview", href: "/database/overview", image: "/icon-overview.png", activeImage: "/icon-overview-2.png" },
  { label: "戰甲", key: "warframes", href: "/database/warframes", image: "/icon-warframe.png", activeImage: "/icon-warframe-2.png" },
  { label: "主要武器", key: "primary", href: "/database/primary", image: "/icon-primary.png", activeImage: "/icon-primary-2.png" },
  { label: "次要武器", key: "secondary", href: "/database/secondary", image: "/icon-secondary.png", activeImage: "/icon-secondary-2.png" },
  { label: "近戰武器", key: "melee", href: "/database/melee", image: "/icon-melee.png", activeImage: "/icon-melee-2.png" },
  { label: "同伴", key: "companions", href: "/database/companions", image: "/icon-companion.png", activeImage: "/icon-companion-2.png" },
  { label: "曲翼", key: "archwing", href: "/database/archwing", image: "/icon-archwing.png", activeImage: "/icon-archwing-2.png" },
  { label: "MOD資料庫", key: "mods", href: "/database/mods", image: "/icon-mod.png", activeImage: "/icon-mod-2.png" },
];

function isOwned(value: string): boolean {
  return String(value || "").includes("已購買");
}

function hasPrice(value: string): boolean {
  const number = Number(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(number) && number > 0;
}

export default async function HomePage() {
  const dataCategories = navItems.filter((item) => item.key !== "overview");

  const results = await Promise.all(
    dataCategories.map(async (item) => {
      try {
        const result = await fetchSheetRows(item.key);
        const rows = result.rows;
        const owned = rows.filter((row) => isOwned(row.owned)).length;
        const priced = rows.filter((row) => hasPrice(row.price)).length;
        const sections = new Set(rows.map((row) => row.section || "未分類"));

        return {
          ...item,
          count: rows.length,
          owned,
          priced,
          sectionCount: sections.size,
          completion: rows.length > 0 ? Math.round((owned / rows.length) * 100) : 0,
        };
      } catch {
        return {
          ...item,
          count: 0,
          owned: 0,
          priced: 0,
          sectionCount: 0,
          completion: 0,
        };
      }
    })
  );

  const totalRows = results.reduce((sum, item) => sum + item.count, 0);
  const totalOwned = results.reduce((sum, item) => sum + item.owned, 0);
  const totalPriced = results.reduce((sum, item) => sum + item.priced, 0);
  const totalSections = results.reduce((sum, item) => sum + item.sectionCount, 0);
  const totalCompletion = totalRows > 0 ? Math.round((totalOwned / totalRows) * 100) : 0;

  return (
    <main className="min-h-screen bg-[#f6f3ff] text-slate-950">
      <HomeMenuFloating />
      <HomeSearchFloating />
      <HomeNotificationsFloating />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-[34px] border border-white/70 bg-white/80 p-5 shadow-2xl shadow-violet-200/30 backdrop-blur sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black tracking-[0.28em] text-violet-600">
                KETHER OF PARADISO
              </p>
              <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">
                KETHER
              </h1>
            </div>

            <Link
              href="https://discord.gg"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#5865f2] px-5 py-3 text-sm font-black text-white shadow-lg shadow-indigo-300/50"
            >
              <MessageCircle size={18} />
              Discord
            </Link>
          </div>

          <div className="mt-6 overflow-hidden rounded-[30px] border border-white/70 bg-white/70 shadow-xl shadow-slate-200/70">
            <img
              src="/home-hero-banner.png"
              alt="KETHER OF PARADISO Warframe Database 首頁橫版圖"
              className="h-auto w-full object-cover"
            />
          </div>
        </header>

        <KetherDynamicInfo />

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-xl shadow-violet-200/30 backdrop-blur">
            <span className="text-sm font-black text-slate-500">總資料數</span>
            <strong className="mt-2 block text-4xl font-black text-slate-950">
              {totalRows.toLocaleString("zh-TW")}
            </strong>
            <p className="mt-2 text-sm font-bold text-slate-500">
              Google Sheets 全分類資料量
            </p>
          </article>

          <article className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-xl shadow-violet-200/30 backdrop-blur">
            <span className="text-sm font-black text-slate-500">有價格資料</span>
            <strong className="mt-2 block text-4xl font-black text-slate-950">
              {totalPriced.toLocaleString("zh-TW")}
            </strong>
            <p className="mt-2 text-sm font-bold text-slate-500">
              目前可追價的資料列
            </p>
          </article>

          <article className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-xl shadow-violet-200/30 backdrop-blur">
            <span className="text-sm font-black text-slate-500">已購買完成率</span>
            <strong className="mt-2 block text-4xl font-black text-slate-950">
              {totalCompletion}%
            </strong>
            <p className="mt-2 text-sm font-bold text-slate-500">
              {totalOwned.toLocaleString("zh-TW")} 筆已標記
            </p>
          </article>
        </section>

        <section className="rounded-[34px] border border-white/70 bg-white/80 p-5 shadow-2xl shadow-violet-200/30 backdrop-blur sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <Sparkles className="text-violet-600" size={22} />
            <h2 className="text-2xl font-black text-slate-950">導航區</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {navItems.map((item) => {
              const stats = results.find((result) => result.key === item.key);

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className="group rounded-[26px] border border-slate-200/70 bg-white p-4 shadow-lg shadow-slate-200/60 transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.label}
                      className="h-12 w-12 object-contain transition group-hover:hidden"
                    />
                    <img
                      src={item.activeImage}
                      alt={`${item.label} active`}
                      className="hidden h-12 w-12 object-contain transition group-hover:block"
                    />

                    <div>
                      <strong className="block text-lg font-black text-slate-950">
                        {item.label}
                      </strong>
                      <span className="text-xs font-bold text-slate-500">
                        {stats
                          ? `${stats.count.toLocaleString("zh-TW")} 筆｜區塊 ${stats.sectionCount}｜有價格 ${stats.priced}`
                          : "查看總覽資料"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative overflow-hidden rounded-[34px]">
            <KetherClanWatermark />
            <div className="relative z-10">
              <HomeStarChartInfo
                totalRows={totalRows}
                totalPriced={totalPriced}
                totalSections={totalSections}
              />
            </div>
          </div>

          <article className="rounded-[34px] border border-white/70 bg-white/80 p-6 shadow-2xl shadow-violet-200/30 backdrop-blur">
            <p className="text-xs font-black tracking-[0.22em] text-violet-600">
              WARFRAME LINKS
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">
              小希星圖網址情報局
            </h2>

            <div className="mt-5 grid gap-3">
              <a href="https://www.warframe.com" target="_blank" rel="noreferrer" className="rounded-[20px] bg-white p-4 font-black text-slate-700 shadow">
                Warframe 官方網站
              </a>
              <a href="https://www.warframe.com/news" target="_blank" rel="noreferrer" className="rounded-[20px] bg-white p-4 font-black text-slate-700 shadow">
                官方新聞
              </a>
              <a href="https://forums.warframe.com" target="_blank" rel="noreferrer" className="rounded-[20px] bg-white p-4 font-black text-slate-700 shadow">
                官方論壇
              </a>
              <Link href="/live" className="inline-flex items-center gap-2 rounded-[20px] bg-slate-950 p-4 font-black text-white shadow">
                <Radio size={18} />
                小希星圖電波局
              </Link>
            </div>
          </article>
        </section>

        <HomeAuthMini />
        <HomePersonalProgress
          totalRows={totalRows}
          fallbackOwned={totalOwned}
          fallbackCompletion={totalCompletion}
        />
        <OfficialNewsBoard />

        <footer className="rounded-[28px] border border-white/70 bg-white/70 p-5 text-center text-sm font-black text-slate-500 shadow-xl shadow-violet-200/20 backdrop-blur">
          https://kether-warframe-database.vercel.app ｜ Website by ヤハ奈々子・羊咩・凱洛
        </footer>
      </div>
    </main>
  );
}
