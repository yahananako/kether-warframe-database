"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Sparkles } from "lucide-react";

export default function HomeSearchFloating() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 80);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const q = keyword.trim();
    if (!q) return;

    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  const tags = ["Primed", "Yareli", "MOD", "近戰", "同伴"];

  return (
    <>
      <button
        type="button"
        aria-label="開啟搜尋"
        title="搜尋資料庫"
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
        <Search size={25} strokeWidth={2.15} />
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
            aria-label="關閉搜尋背景"
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
            aria-label="資料庫快速搜尋"
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
                    KETHER SEARCH
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
                    資料庫快速搜尋
                  </h2>

                  <p
                    style={{
                      margin: "7px 0 0",
                      fontSize: 14,
                      lineHeight: 1.7,
                      color: "#64748b"
                    }}
                  >
                    搜尋 MOD、戰甲、武器、同伴、來源或備註。
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="關閉搜尋"
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

              <form
                onSubmit={submitSearch}
                style={{
                  display: "flex",
                  gap: 9,
                  marginTop: 18
                }}
              >
                <label
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    borderRadius: 20,
                    border: "1px solid rgba(255, 255, 255, 0.86)",
                    background: "rgba(255, 255, 255, 0.72)",
                    boxShadow:
                      "inset 0 1px 8px rgba(15, 23, 42, 0.05), 0 10px 24px rgba(15, 23, 42, 0.06)",
                    padding: "0 14px"
                  }}
                >
                  <Search size={20} color="#64748b" />
                  <input
                    ref={inputRef}
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    placeholder="輸入 MOD、戰甲、武器..."
                    style={{
                      width: "100%",
                      height: 50,
                      border: "0",
                      outline: "0",
                      background: "transparent",
                      color: "#1f2937",
                      fontSize: 15,
                      fontWeight: 800
                    }}
                  />
                </label>

                <button
                  type="submit"
                  style={{
                    height: 50,
                    border: "0",
                    borderRadius: 20,
                    padding: "0 17px",
                    background: "#263445",
                    color: "white",
                    fontSize: 14,
                    fontWeight: 900,
                    boxShadow: "0 12px 26px rgba(15, 23, 42, 0.24)",
                    cursor: "pointer"
                  }}
                >
                  搜尋
                </button>
              </form>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginTop: 15
                }}
              >
                {tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setKeyword(tag)}
                    style={{
                      border: "1px solid rgba(255, 255, 255, 0.78)",
                      borderRadius: 999,
                      background: "rgba(255, 255, 255, 0.62)",
                      color: "#475569",
                      padding: "8px 13px",
                      fontSize: 13,
                      fontWeight: 900,
                      boxShadow: "0 7px 16px rgba(15, 23, 42, 0.08)",
                      cursor: "pointer"
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
