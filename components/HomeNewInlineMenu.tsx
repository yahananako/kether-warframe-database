"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const menuGroups = [
  {
    title: "KETHER",
    links: [
      { label: "正式首頁", href: "/" },
      { label: "新首頁測試", href: "/home-new" },
      { label: "個人頁面", href: "/profile" },
    ],
  },
  {
    title: "資料庫",
    links: [
      { label: "總覽", href: "/database/overview" },
      { label: "戰甲", href: "/database/warframes" },
      { label: "主要武器", href: "/database/primary" },
      { label: "次要武器", href: "/database/secondary" },
      { label: "近戰武器", href: "/database/melee" },
      { label: "同伴", href: "/database/companions" },
      { label: "曲翼", href: "/database/archwing" },
      { label: "MOD資料庫", href: "/database/mods" },
    ],
  },
  {
    title: "小希工具",
    links: [
      { label: "小希 Bot", href: "/bot" },
      { label: "星圖電波局", href: "/live" },
    ],
  },
];

export default function HomeNewInlineMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="home-new-inline-menu">
      <button
        className="home-new-menu-button"
        type="button"
        aria-label={open ? "關閉選單" : "開啟選單"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={25} /> : <Menu size={26} />}
      </button>

      {open ? (
        <>
          <button
            className="home-new-menu-backdrop"
            type="button"
            aria-label="關閉選單背景"
            onClick={() => setOpen(false)}
          />

          <nav className="home-new-menu-panel" aria-label="KETHER 新首頁選單">
            <div className="home-new-menu-panel-head">
              <p>KETHER MENU</p>
              <strong>星圖選單</strong>
            </div>

            {menuGroups.map((group) => (
              <section key={group.title} className="home-new-menu-group">
                <h3>{group.title}</h3>

                <div className="home-new-menu-links">
                  {group.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="home-new-menu-link"
                      onClick={() => setOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </nav>
        </>
      ) : null}
    </div>
  );
}
