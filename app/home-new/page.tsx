import Link from "next/link";
import { MessageCircle, UserRound } from "lucide-react";
import HomeMenuFloating from "../../components/HomeMenuFloating";
import HomeSearchFloating from "../../components/HomeSearchFloating";
import HomeNotificationsFloating from "../../components/HomeNotificationsFloating";
import KetherDynamicInfo from "../../components/KetherDynamicInfo";

export default function HomeNewPage() {
  return (
    <main className="min-h-screen bg-[#f6f3ff] text-slate-950">
      <HomeMenuFloating />

      <div className="fixed right-4 top-4 z-80 flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-2 py-2 shadow-xl shadow-slate-300/40 backdrop-blur-xl">
        <HomeSearchFloating />
        <HomeNotificationsFloating />

        <Link
          href="/profile"
          className="inline-flex h-9 min-w-9 items-center justify-center gap-2 rounded-full bg-white px-3 text-sm font-black text-slate-700 shadow-sm"
          aria-label="個人頁面"
        >
          <UserRound size={18} />
          <span className="hidden sm:inline">個人</span>
        </Link>

        <Link
          href="https://discord.gg"
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-9 min-w-9 items-center justify-center gap-2 rounded-full bg-[#5865f2] px-3 text-sm font-black text-white shadow-sm"
          aria-label="Discord 入口"
        >
          <MessageCircle size={18} />
          <span className="hidden sm:inline">Discord</span>
        </Link>
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-10 pt-24 sm:px-6 lg:px-8">
        <section className="rounded-[34px] border border-white/70 bg-white/80 p-5 shadow-2xl shadow-violet-200/30 backdrop-blur sm:p-8">
          <p className="text-xs font-black tracking-[0.28em] text-violet-600">
            KETHER OF PARADISO
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">
            KETHER 新首頁建置區
          </h1>

          <p className="mt-3 max-w-3xl text-sm font-bold leading-7 text-slate-500 sm:text-base">
            這是新版首頁測試路由。先確認菜單、放大鏡、鈴鐺、個人、Discord、版圖與 KETHER 動態資訊正常顯示。
          </p>

          <div className="mt-6 overflow-hidden rounded-[30px] border border-white/70 bg-white/70 shadow-xl shadow-slate-200/70">
            <img
              src="/home-hero-banner.png"
              alt="KETHER OF PARADISO Warframe Database 首頁版圖"
              className="h-auto w-full object-cover"
            />
          </div>
        </section>

        <KetherDynamicInfo />
      </div>
    </main>
  );
}
