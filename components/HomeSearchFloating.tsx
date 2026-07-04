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

  const quickTags = ["Primed", "Yareli", "MOD", "近戰", "同伴"];

  return (
    <>
      <button
        type="button"
        aria-label="開啟搜尋"
        title="搜尋資料庫"
        onClick={() => setOpen(true)}
        style={{
          width: 44,
          height: 44,
          border: "none",
          outline: "none",
          background: "transparent",
          color: "#1f2937",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 999,
          cursor: "pointer",
          WebkitTapHighlightColor: "transparent"
        }}
      >
        <Search size={27} strokeWidth={2.5} />
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(15, 23, 42, 0.16)",
            backdropFilter: "blur(7px)",
            WebkitBackdropFilter: "blur(7px)"
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
              border: "none",
              background: "transparent",
              cursor: "default"
            }}
          />

          <section
            role="dialog"
            aria-label="資料庫快速搜尋"
            style={{
              position: "absolute",
              top: 88,
              right: 18,
              width: "min(92vw, 390px)",
              borderRadius: 28,
              border: "1px solid rgba(255,255,255,0.72)",
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.72), rgba(236,244,248,0.46))",
              boxShadow:
                "0 24px 70px rgba(15,23,42,0.20), inset 0 1px 0 rgba(255,255,255,0.75)",
              backdropFilter: "blur(24px) saturate(150%)",
              WebkitBackdropFilter: "blur(24px) saturate(150%)",
              overflow: "hidden",
              color: "#1f2937"
            }}
          >
            <div
              style={{
                padding: "18px 18px 16px",
                background:
                  "radial-gradient(circle at top right, rgba(255,255,255,0.82), transparent 55%)"
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 12
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 12,
                      fontWeight: 800,
                      letterSpacing: "0.22em",
                      color: "#64748b"
                    }}
                  >
                    <Sparkles size={15} />
                    KETHER SEARCH
                  </div>

                  <h2
                    style={{
                      margin: "8px 0 0",
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
                    width: 38,
                    height: 38,
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.78)",
                    background: "rgba(255,255,255,0.58)",
                    color: "#334155",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 18px rgba(15,23,42,0.08)",
                    cursor: "pointer"
                  }}
                >
                  <X size={21} strokeWidth={2.6} />
                </button>
              </div>

              <form
                onSubmit={submitSearch}
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 16
                }}
              >
                <label
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    borderRadius: 18,
                    border: "1px solid rgba(255,255,255,0.82)",
                    background: "rgba(255,255,255,0.66)",
                    boxShadow: "inset 0 1px 8px rgba(15,23,42,0.05)",
                    padding: "0 13px"
                  }}
                >
                  <Search size={19} color="#64748b" />
                  <input
                    ref={inputRef}
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    placeholder="輸入 MOD、戰甲、武器..."
                    style={{
                      width: "100%",
                      height: 48,
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      color: "#1f2937",
                      fontSize: 15,
                      fontWeight: 700
                    }}
                  />
                </label>

                <button
                  type="submit"
                  style={{
                    height: 48,
                    border: "none",
                    borderRadius: 18,
                    padding: "0 16px",
                    background: "#263445",
                    color: "white",
                    fontSize: 14,
                    fontWeight: 900,
                    boxShadow: "0 10px 22px rgba(15,23,42,0.20)",
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
                  marginTop: 14
                }}
              >
                {quickTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setKeyword(tag)}
                    style={{
                      border: "1px solid rgba(255,255,255,0.72)",
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.54)",
                      color: "#475569",
                      padding: "8px 12px",
                      fontSize: 13,
                      fontWeight: 800,
                      boxShadow: "0 6px 14px rgba(15,23,42,0.06)",
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
