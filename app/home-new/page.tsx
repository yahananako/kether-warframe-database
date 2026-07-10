import Link from "next/link";
import { Bell, MessageCircle, Search, UserRound } from "lucide-react";
import HomeMenuFloating from "../../components/HomeMenuFloating";
import KetherDynamicInfo from "../../components/KetherDynamicInfo";

export default function HomeNewPage() {
  return (
    <main className="home-new-page">
      <HomeMenuFloating />

      <div className="home-new-extra-actions" aria-label="首頁快捷入口">
        <button className="home-new-icon-action" type="button" aria-label="搜尋">
          <Search size={22} />
        </button>

        <button className="home-new-icon-action" type="button" aria-label="通知">
          <Bell size={22} />
        </button>

        <Link href="/profile" className="home-new-round-action" aria-label="個人頁面">
          <UserRound size={18} />
          <span>個人</span>
        </Link>

        <Link
          href="https://discord.gg"
          target="_blank"
          rel="noreferrer"
          className="home-new-discord-action"
          aria-label="Discord 入口"
        >
          <MessageCircle size={18} />
          <span>Discord</span>
        </Link>
      </div>

      <div className="home-new-shell">
        <section className="home-new-hero-card">
          <div className="home-new-topline">
            <span>KETHER</span>
          </div>

          <div className="home-new-banner">
            <img
              src="/home-hero-banner.png"
              alt="KETHER OF PARADISO Warframe Database 首頁版圖"
            />
          </div>
        </section>

        <KetherDynamicInfo />
      </div>
    </main>
  );
}
