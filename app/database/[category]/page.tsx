import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Bell, Gem, MessageCircle } from "lucide-react";
import { fetchSheetRows, SHEET_GIDS } from "../../../lib/sheets";
import DataTable from "../../../components/DataTable";
import HomeMenuFloating from "../../../components/HomeMenuFloating";
import HomeSearchFloating from "../../../components/HomeSearchFloating";
import HomeNotificationsFloating from "../../../components/HomeNotificationsFloating";

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
        <section className="kether-database-hero-shell">
          <p className="kether-database-kicker">{config.title}</p>

          <div className="kether-database-hero-banner">
            <img
              src="/home-hero-banner.png"
              alt={`${config.title} KETHER OF PARADISO Warframe 資料庫版圖`}
            />
          </div>

          <div className="kether-database-hero-copy">
            <h1>{config.title}</h1>
            <p>{config.subtitle}</p>

            <div className="kether-database-hero-actions">
              <Link href="/">
                <ArrowLeft size={16} />
                返回首頁
              </Link>

              <Link href="/database/overview">
                <Gem size={16} />
                總覽
              </Link>

              <Link href="/bot">
                <MessageCircle size={16} />
                小希 Bot
              </Link>

              <Link href="/live">
                <Bell size={16} />
                星圖電波局
              </Link>
            </div>
          </div>
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
