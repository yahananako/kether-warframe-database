"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, X, Sparkles, ExternalLink } from "lucide-react";

const notices = [
  {
    version: "v2.5.43",
    title: "鈴鐺浮動通知選單",
    content: "首頁鈴鐺改為與放大鏡相同的透明玻璃浮動架構。"
  },
  {
    version: "v2.5.42",
    title: "搜尋圖示同步",
    content: "放大鏡圖示調整為與鈴鐺相同風格。"
  },
  {
    version: "v2.5.41",
    title: "玻璃搜尋選單修復",
    content: "修復首頁搜尋浮層與透明玻璃框架。"
  },
  {
    version: "v2.5.36",
    title: "通知中心啟用",
    content: "新增 /notifications 更新公告中心。"
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

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="開啟通知"
        title="更新公告"
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
        <Bell size={25} strokeWidth={2.15} />
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(15, 23, 42, 0.18)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)"
          }}
        >
          <button
            type="button"
            aria-label="關閉通知背景"
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
            role="dialog"
            aria-label="更新公告"
            style={{
              position: "absolute",
              top: 92,
              right: 18,
              width: "min(92vw, 430px)",
              borderRadius: 30,
              border: "1px solid rgba(255, 255, 255, 0.78)",
              background:
                "linear-gradient(145deg, rgba(255, 255, 255, 0.78), rgba(238, 246, 250, 0.50))",
              boxShadow:
                "0 26px 80px rgba(15, 23, 42, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.86)",
              backdropFilter: "blur(26px) saturate(155%)",
              WebkitBackdropFilter: "blur(26px) saturate(155%)",
              overflow: "hidden",
              color: "#263445"
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
                    <Sparkles size={15} />
                    KETHER NOTICE
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
                    更新公告
                  </h2>

                  <p
                    style={{
                      margin: "7px 0 0",
                      fontSize: 14,
                      lineHeight: 1.7,
                      color: "#64748b"
                    }}
                  >
                    查看近期網站更新與資料庫開發狀態。
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="關閉通知"
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
                  <X size={22} strokeWidth={2.6} />
                </button>
              </div>

              <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
                {notices.map((notice) => (
                  <article
                    key={notice.version}
                    style={{
                      borderRadius: 20,
                      border: "1px solid rgba(255, 255, 255, 0.78)",
                      background: "rgba(255, 255, 255, 0.62)",
                      boxShadow: "0 8px 20px rgba(15, 23, 42, 0.07)",
                      padding: "12px 14px"
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 900,
                        letterSpacing: "0.18em",
                        color: "#64748b"
                      }}
                    >
                      {notice.version}
                    </div>

                    <h3
                      style={{
                        margin: "5px 0 0",
                        fontSize: 16,
                        fontWeight: 900,
                        color: "#263445"
                      }}
                    >
                      {notice.title}
                    </h3>

                    <p
                      style={{
                        margin: "5px 0 0",
                        fontSize: 13,
                        lineHeight: 1.65,
                        color: "#64748b"
                      }}
                    >
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
                查看完整公告
                <ExternalLink size={17} />
              </Link>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
