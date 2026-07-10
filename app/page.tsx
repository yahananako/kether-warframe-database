import Link from "next/link";
import { Search, Bell, Menu, CalendarDays, Info, ClipboardList, Pencil, MessageCircle } from "lucide-react";
import { fetchSheetRows } from "../lib/sheets";
import HomeSearchFloating from "../components/HomeSearchFloating";
import HomeNotificationsFloating from "../components/HomeNotificationsFloating"; import HomeMenuFloating from "../components/HomeMenuFloating"; import HomeAuthMini from "../components/HomeAuthMini"; import HomePersonalProgress from "../components/HomePersonalProgress"; import KetherClanWatermark from "../components/KetherClanWatermark";
import OfficialNewsBoard from "../components/OfficialNewsBoard";
import KetherDynamicInfo from "../components/KetherDynamicInfo";
import { homepageRemarks } from "../data/siteUpdates";
const navItems = [
  {
    label: "總覽",
    key: "overview",
    href: "/database/overview",
    image: "/icon-overview.png",
    activeImage: "/icon-overview-2.png",
  },
  {
    label: "戰甲",
    key: "warframes",
    href: "/database/warframes",
    image: "/icon-warframe.png",
    activeImage: "/icon-warframe-2.png",
  },
  {
    label: "主要武器",
    key: "primary",
    href: "/database/primary",
    image: "/icon-primary.png",
    activeImage: "/icon-primary-2.png",
  },
  {
    label: "次要武器",
    key: "secondary",
    href: "/database/secondary",
    image: "/icon-secondary.png",
    activeImage: "/icon-secondary-2.png",
  },
  {
    label: "近戰武器",
    key: "melee",
    href: "/database/melee",
    image: "/icon-melee.png",
    activeImage: "/icon-melee-2.png",
  },
  {
    label: "同伴",
    key: "companions",
    href: "/database/companions",
    image: "/icon-companion.png",
    activeImage: "/icon-companion-2.png",
  },
  {
    label: "曲翼",
    key: "archwing",
    href: "/database/archwing",
    image: "/icon-archwing.png",
    activeImage: "/icon-archwing-2.png",
  },
  {
    label: "MOD資料庫",
    key: "mods",
    href: "/database/mods",
    image: "/icon-mod.png",
    activeImage: "/icon-mod-2.png",
  },
];

function isOwned(value: string): boolean {
  return String(value || "").includes("已購買");
}

function hasPrice(value: string): boolean {
  const number = Number(String(value || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(number) && number > 0;
}

export default async function HomePage() {
  const dataCategories = navItems.filter((item) => item.key !== "overview" && item.key !== "bot");

  const results = await Promise.all(
    dataCategories.map(async (item) => {
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
        completion: rows.length > 0 ? Math.round((owned / rows.length) * 100) : 0
      };
    })
  );

  const totalRows = results.reduce((sum, item) => sum + item.count, 0);
  const totalOwned = results.reduce((sum, item) => sum + item.owned, 0);
  const totalPriced = results.reduce((sum, item) => sum + item.priced, 0);
  const totalSections = results.reduce((sum, item) => sum + item.sectionCount, 0);
  const totalCompletion = totalRows > 0 ? Math.round((totalOwned / totalRows) * 100) : 0;

  return (<>
      <HomeMenuFloating />

    <main style={{ position: "relative", isolation: "isolate" }} className="page-shell homepage-sci-fi">
      
      <div className="home-fixed-bg" aria-hidden="true" />
<div className="corner corner-lt" />
      <div className="corner corner-rt" />
      <div className="corner corner-lb" />
      <div className="corner corner-rb home-tech-card home-tech-corner" />

      <header className="topbar">
        <div className="topbar-left">
  <HomeMenuFloating />
<span>KETHER</span>
        </div>

        <div className="topbar-right">
          <HomeSearchFloating />
          <HomeNotificationsFloating />
          <HomeAuthMini />
          <a className="discord-mini" href="https://discord.gg/MFhTb8XMZ" target="_blank" rel="noreferrer">
            <MessageCircle size={18} />
            Discord
          </a>
        </div>
      </header>
      <footer className="home-footer-signature">
        <a
          href="https://kether-warframe-database.vercel.app"
          target="_blank"
          rel="noreferrer"
          className="home-footer-link"
        >
          https://kether-warframe-database.vercel.app
        </a>
        <span className="home-footer-divider">｜</span>
        <span className="home-footer-designer">Website by ヤハ奈々子・羊咩・凱洛</span>
      </footer>

</main>
  </>);
}
