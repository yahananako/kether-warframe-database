"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, X, Sparkles, ExternalLink } from "lucide-react";

const notices = [
  {
    version: "v2.2.0",
    title: "Discord 個人進度啟用",
    content: "首頁已接上 Discord 個人已購買與個人完成度，未登入時會退回表格統計。"
  },
  {
    version: "v2.2.0",
    title: "導航區整合分類狀態",
    content: "分類筆數、區塊數、有價格數與完成度已整合進首頁導航卡片。"
  },
  {
    version: "v2.2.0",
    title: "資料庫狀態與備註合併",
    content: "首頁資料庫狀態與備註已合併，顯示 Google Sheets＋Discord 個人進度。"
  },
  {
    version: "v2.2.0",
    title: "Discord 登入流程完成",
    content: "Discord 登入、權限驗證、登出回首頁與個人名片顯示已完成。"
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
            zIndex: 80,
            display: "grid",
            placeItems: "start center",
            padding: "86px 18px 18px",
            background: "rgba(15, 23, 42, 0.18)",
            backdropFilter: "blur(10px)"
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

            <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
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
