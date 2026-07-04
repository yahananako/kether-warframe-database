"use client";

import { useEffect, useState } from "react";
import {
  Menu,
  X,
  Home,
  Shield,
  Crosshair,
  Swords,
  Dog,
  Feather,
  Layers,
  Gem,
  User,
  Database,
  MessageCircle
} from "lucide-react";

const menuItems = [
  { label: "首頁", href: "/", icon: Home },
  { label: "總覽", href: "/database/overview", icon: Gem },
  { label: "戰甲", href: "/database/warframes", icon: Shield },
  { label: "主要武器", href: "/database/primary", icon: Crosshair },
  { label: "次要武器", href: "/database/secondary", icon: Crosshair },
  { label: "近戰武器", href: "/database/melee", icon: Swords },
  { label: "同伴", href: "/database/companions", icon: Dog },
  { label: "曲翼", href: "/database/archwing", icon: Feather },
  { label: "MOD資料庫", href: "/database/mods", icon: Layers },
  { label: "個人進度", href: "/profile", icon: User },
  { label: "資料庫狀態", href: "/db-status", icon: Database }
];

export default function HomeMenuFloating() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const oldOverflow = document.body.style.overflow;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function goTo(href: string) {
    setOpen(false);
    window.location.assign(href);
  }

  function openDiscord() {
    window.open("https://discord.gg", "_blank", "noopener,noreferrer");
  }

  return (
    <>
      <button
        type="button"
        aria-label="開啟選單"
        title="開啟選單"
        onClick={() => setOpen(true)}
        style={{
          width: 34,
          height: 34,
          border: "0",
          padding: "0",
          margin: "0",
          outline: "0",
          background: "transparent",
          boxShadow: "none",
          color: "#1f2937",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          appearance: "none",
          WebkitAppearance: "none",
          WebkitTapHighlightColor: "transparent"
        }}
      >
        <Menu size={28} strokeWidth={2.25} />
      </button>

      {open && (
        <div
          role="presentation"
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(15, 23, 42, 0.18)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)"
          }}
        >
          <aside
            role="dialog"
            aria-label="網站導覽選單"
            onClick={(event) => event.stopPropagation()}
            style={{
              position: "fixed",
              top: 88,
              left: 18,
              zIndex: 10000,
              width: "min(92vw, 430px)",
              maxHeight: "calc(100vh - 120px)",
              overflowY: "auto",
              borderRadius: 30,
              border: "1px solid rgba(255, 255, 255, 0.78)",
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.84), rgba(238,246,250,0.58))",
              boxShadow:
                "0 26px 80px rgba(15,23,42,0.24), inset 0 1px 0 rgba(255,255,255,0.86)",
              backdropFilter: "blur(26px) saturate(155%)",
              WebkitBackdropFilter: "blur(26px) saturate(155%)",
              color: "#263445",
              pointerEvents: "auto"
            }}
          >
            <div
              style={{
                padding: "20px 20px 18px",
                background:
                  "radial-gradient(circle at top right, rgba(255,255,255,0.88), transparent 58%), radial-gradient(circle at bottom left, rgba(226,239,246,0.45), transparent 62%)"
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 14
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      fontSize: 12,
                      fontWeight: 900,
                      letterSpacing: "0.24em",
                      color: "#64748b"
                    }}
                  >
                    <Menu size={15} />
                    KETHER MENU
                  </div>

                  <h2
                    style={{
                      margin: "9px 0 0",
                      fontSize: 22,
                      lineHeight: 1.25,
                      fontWeight: 900,
                      color: "#263445"
                    }}
                  >
                    網站導覽
                  </h2>

                  <p
                    style={{
                      margin: "7px 0 0",
                      fontSize: 14,
                      lineHeight: 1.7,
                      color: "#64748b"
                    }}
                  >
                    前往資料庫分類、個人進度與系統狀態。
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="關閉選單"
                  onClick={() => setOpen(false)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.85)",
                    background: "rgba(255,255,255,0.68)",
                    color: "#334155",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 10px 24px rgba(15,23,42,0.10)",
                    cursor: "pointer"
                  }}
                >
                  <X size={22} strokeWidth={2.6} />
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 10,
                  marginTop: 18
                }}
              >
                {menuItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.href}
                      type="button"
                      onClick={() => goTo(item.href)}
                      style={{
                        minHeight: 58,
                        borderRadius: 20,
                        border: "1px solid rgba(255,255,255,0.78)",
                        background: "rgba(255,255,255,0.62)",
                        color: "#263445",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "12px 14px",
                        fontSize: 14,
                        fontWeight: 900,
                        boxShadow: "0 8px 20px rgba(15,23,42,0.07)",
                        cursor: "pointer",
                        textAlign: "left"
                      }}
                    >
                      <Icon size={20} strokeWidth={2.3} />
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={openDiscord}
                style={{
                  width: "100%",
                  marginTop: 14,
                  height: 48,
                  border: "0",
                  borderRadius: 20,
                  background: "#263445",
                  color: "white",
                  fontSize: 14,
                  fontWeight: 900,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: "0 12px 26px rgba(15,23,42,0.24)",
                  cursor: "pointer"
                }}
              >
                <MessageCircle size={18} />
                Discord 入口
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
