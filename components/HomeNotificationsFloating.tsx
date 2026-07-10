"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, X, Sparkles, ExternalLink } from "lucide-react";

const notices = [
  {
    version: "修繕",
    title: "鈴鐺公告面板調整中",
    content: "小希正在修復首頁鈴鐺公告列表捲動問題，讓手機版也能順順查看完整更新內容。"
  },
  {
    version: "LIVE",
    title: "小希星圖電波局已入場",
    content: "/live 已建立 Warframe 即時世界狀態頁，支援裂縫、入侵、突擊、執政官獵殺、警報與 Baro 資訊。"
  },
  {
    version: "視覺",
    title: "銀白科技框與磨砂玻璃完成",
    content: "電波局已套用銀白科技框與霧面玻璃質感，後續會等待繪師美工圖進場再做整體視覺換裝。"
  },
  {
    version: "守門",
    title: "登入守門結界整理完成",
    content: "Next.js 守門檔已由 middleware 遷移為 proxy，首頁維持公開，資料頁與個人頁仍依登入權限控管。"
  },
  {
    version: "資料",
    title: "KETHER 資料庫持續同步",
    content: "首頁會讀取 Google Sheets、Discord 個人進度與 Warframe 即時世界狀態，資料會依後續修繕逐步穩定。"
  }
];

export default function HomeNotificationsFloating() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        aria-label="開啟更新公告"
        onClick={() => setOpen(true)}
        style={{
          width: 32,
          height: 32,
          border: "0",
          padding: "0",
          margin: "0",
          outline: "0",
          background: "transparent",
          boxShadow: "none",
          color: "#6b21a8",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          appearance: "none",
          WebkitAppearance: "none",
          WebkitTapHighlightColor: "transparent"
        }}
      >
        <Bell size={22} />
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "grid",
            placeItems: "start center",
            padding: "86px 18px 18px",
            background: "rgba(15, 23, 42, 0.18)",
            backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)"
          }}
        >
          <button
            aria-label="關閉更新公告背景"
            onClick={() => setOpen(false)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
            maxHeight: "calc(100dvh - 96px)",
            overflowY: "auto",
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
            overscrollBehavior: "contain",
            touchAction: "pan-y",
              border: "0",
              background: "transparent",
              cursor: "default"
            }}
          />

          <section
            style={{
              width: "min(92vw, 420px)",
              borderRadius: 28,
              padding: 18,
              background: "rgba(255,255,255,0.78)",
              border: "1px solid rgba(255,255,255,0.88)",
              boxShadow: "0 26px 70px rgba(15, 23, 42, 0.22)",
              position: "relative",
              zIndex: 1
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <p
                  style={{
                    margin: "0 0 4px",
                    fontSize: 12,
                    fontWeight: 900,
                    letterSpacing: "0.16em",
                    color: "#64748b"
                  }}
                >
                  KETHER NOTICE
                </p>
                <h2 style={{ margin: 0, fontSize: 28 }}>更新公告</h2>
                <p style={{ margin: "8px 0 0", color: "#64748b" }}>
                  查看近期網站更新與資料庫開發狀態。
                </p>
              </div>

              <button
                aria-label="關閉更新公告"
                onClick={() => setOpen(false)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 999,
                  border: "1px solid rgba(255, 255, 255, 0.85)",
                  background: "rgba(255, 255, 255, 0.68)",
                  color: "#334155",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.10)",
                  cursor: "pointer"
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gap: 10,
                marginTop: 16,
                maxHeight: "min(54dvh, 440px)",
                overflowY: "auto",
                overflowX: "hidden",
                WebkitOverflowScrolling: "touch",
                overscrollBehavior: "contain",
                touchAction: "pan-y",
                paddingRight: 4,
              }}
            >
              {notices.map((notice) => (
                <article
                  key={`${notice.version}-${notice.title}`}
                  style={{
                    borderRadius: 22,
                    padding: "14px 16px",
                    background: "rgba(255,255,255,0.72)",
                    border: "1px solid rgba(148, 163, 184, 0.18)"
                  }}
                >
                  <strong style={{ color: "#6b21a8" }}>{notice.version}</strong>
                  <h3 style={{ margin: "4px 0 6px", fontSize: 16 }}>
                    <Sparkles size={16} style={{ verticalAlign: "-2px", marginRight: 6 }} />
                    {notice.title}
                  </h3>
                  <p style={{ margin: 0, color: "#475569", lineHeight: 1.65 }}>
                    {notice.content}
                  </p>
                </article>
              ))}
            </div>

            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              style={{
                marginTop: 14,
                height: 48,
                borderRadius: 20,
                background: "#263445",
                color: "white",
                fontSize: 14,
                fontWeight: 900,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: "0 12px 26px rgba(15, 23, 42, 0.24)"
              }}
            >
              查看完整公告 <ExternalLink size={16} />
            </Link>
          </section>
        </div>
      )}
    </>
  );
}
