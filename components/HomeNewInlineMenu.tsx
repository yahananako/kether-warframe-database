"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CSSProperties, MouseEvent as ReactMouseEvent } from "react";

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

type MenuPosition = {
  top: number;
  left: number;
};

type MenuPanelStyle = CSSProperties & {
  "--kether-menu-top": string;
  "--kether-menu-left": string;
};

export default function HomeNewInlineMenu() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({ top: 72, left: 12 });

  const updatePosition = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const isMobile = viewportWidth <= 760;
    const panelWidth = isMobile
      ? Math.min(520, viewportWidth - 24)
      : Math.min(760, viewportWidth - 36);
    const sideGap = isMobile ? 12 : 18;
    const topGap = isMobile ? 10 : 12;
    const left = Math.min(
      Math.max(sideGap, rect.left),
      Math.max(sideGap, viewportWidth - panelWidth - sideGap),
    );

    setPosition({
      top: Math.round(rect.bottom + topGap),
      left: Math.round(left),
    });
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open) return;

    updatePosition();

    const handleViewportChange = () => updatePosition();
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const panelStyle: MenuPanelStyle = {
    "--kether-menu-top": `${position.top}px`,
    "--kether-menu-left": `${position.left}px`,
  };

  const handlePanelClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("a")) setOpen(false);
  };

  return (
    <div className="home-new-inline-menu">
      <button
        ref={buttonRef}
        type="button"
        className="home-new-menu-button"
        aria-label={open ? "關閉 KETHER 選單" : "開啟 KETHER 選單"}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
      >
        <Menu size={22} />
      </button>

      {mounted && open
        ? createPortal(
            <>
              <button
                type="button"
                className="home-new-menu-backdrop home-new-menu-backdrop-portal"
                aria-label="關閉 KETHER 選單"
                onClick={() => setOpen(false)}
              />

              <div
                className="home-new-menu-panel home-new-menu-panel-portal"
                style={panelStyle}
                role="menu"
                aria-label="KETHER 網站選單"
                onClick={handlePanelClick}
              >
                <div className="home-new-menu-panel-head">
                  <p>KETHER MENU</p>
                  <strong>網站選單</strong>
                  <span>主要入口與資料庫分類。</span>
                </div>

                <div className="home-new-menu-group">
                  <h3>主要入口</h3>

                  <div className="home-new-menu-links">
                    {mainLinks.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="home-new-menu-link"
                        role="menuitem"
                      >
                        {item.label}
                      </Link>
                    ))}

                    <a
                      href="https://discord.gg"
                      target="_blank"
                      rel="noreferrer"
                      className="home-new-menu-link"
                      role="menuitem"
                    >
                      Discord
                    </a>
                  </div>
                </div>

                <div className="home-new-menu-group">
                  <h3>資料庫</h3>

                  <div className="home-new-menu-links">
                    {databaseLinks.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="home-new-menu-link"
                        role="menuitem"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </>,
            document.body,
          )
        : null}
    </div>
  );
}
