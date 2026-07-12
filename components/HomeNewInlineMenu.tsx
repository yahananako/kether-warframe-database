import Link from "next/link";
import { Menu } from "lucide-react";

const mainLinks = [
  { label: "首頁", href: "/" },
  { label: "個人", href: "/profile" },
  { label: "氏族", href: "/clan" },
  { label: "電波局", href: "/live" },
  { label: "BOT", href: "/bot" },
];

const databaseLinks = [
  { label: "總覽", href: "/database/overview" },
  { label: "戰甲", href: "/database/warframes" },
  { label: "主要武器", href: "/database/primary" },
  { label: "次要武器", href: "/database/secondary" },
  { label: "近戰武器", href: "/database/melee" },
  { label: "同伴", href: "/database/companions" },
  { label: "曲翼", href: "/database/archwing" },
  { label: "MOD", href: "/database/mods" },
];

export default function HomeNewInlineMenu() {
  return (
    <details className="home-new-inline-menu">
      <summary className="home-new-menu-button" aria-label="開啟 KETHER 選單">
        <Menu size={22} />
      </summary>

      <div className="home-new-menu-panel">
        <div className="home-new-menu-panel-head">
          <p>KETHER MENU</p>
          <strong>網站選單</strong>
          <span>主要入口與資料庫分類。</span>
        </div>

        <div className="home-new-menu-group">
          <h3>主要入口</h3>

          <div className="home-new-menu-links">
            {mainLinks.map((item) => (
              <Link key={item.href} href={item.href} className="home-new-menu-link">
                {item.label}
              </Link>
            ))}

            <a
              href="https://discord.gg"
              target="_blank"
              rel="noreferrer"
              className="home-new-menu-link"
            >
              Discord
            </a>
          </div>
        </div>

        <div className="home-new-menu-group">
          <h3>資料庫</h3>

          <div className="home-new-menu-links">
            {databaseLinks.map((item) => (
              <Link key={item.href} href={item.href} className="home-new-menu-link">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </details>
  );
}
