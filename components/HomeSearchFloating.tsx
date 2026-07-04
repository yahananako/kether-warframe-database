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

  return (
    <>
      <button
        type="button"
        aria-label="開啟搜尋"
        title="搜尋資料庫"
        onClick={() => setOpen(true)}
        className="kether-search-icon-button"
      >
        <Search className="kether-search-icon-svg" aria-hidden="true" />
      </button>

      {open && (
        <div className="kether-search-backdrop">
          <button
            type="button"
            aria-label="關閉搜尋背景"
            onClick={() => setOpen(false)}
            className="kether-search-backdrop-close"
          />

          <section role="dialog" aria-label="資料庫快速搜尋" className="kether-search-panel">
            <div className="kether-search-panel-inner">
              <div className="kether-search-head">
                <div>
                  <div className="kether-search-label">
                    <Sparkles size={15} />
                    KETHER SEARCH
                  </div>

                  <h2 className="kether-search-title">資料庫快速搜尋</h2>

                  <p className="kether-search-text">
                    搜尋 MOD、戰甲、武器、同伴、來源或備註。
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="關閉搜尋"
                  onClick={() => setOpen(false)}
                  className="kether-search-close"
                >
                  <X size={21} strokeWidth={2.6} />
                </button>
              </div>

              <form onSubmit={submitSearch} className="kether-search-form">
                <label className="kether-search-input-wrap">
                  <Search size={19} color="#64748b" />
                  <input
                    ref={inputRef}
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    placeholder="輸入 MOD、戰甲、武器..."
                    className="kether-search-input"
                  />
                </label>

                <button type="submit" className="kether-search-submit">
                  搜尋
                </button>
              </form>

              <div className="kether-search-tags">
                {["Primed", "Yareli", "MOD", "近戰", "同伴"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setKeyword(tag)}
                    className="kether-search-tag"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      <style jsx>{`
        .kether-search-icon-button {
          width: auto !important;
          height: auto !important;
          min-width: 0 !important;
          min-height: 0 !important;
          border: 0 !important;
          outline: 0 !important;
          padding: 0 !important;
          margin: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
          color: #111827 !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          appearance: none !important;
          -webkit-appearance: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }

        .kether-search-icon-button:hover,
        .kether-search-icon-button:focus,
        .kether-search-icon-button:active {
          border: 0 !important;
          outline: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
        }

        .kether-search-icon-svg {
          width: 28px !important;
          height: 28px !important;
          stroke-width: 2.25 !important;
          display: block !important;
        }

        .kether-search-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(15, 23, 42, 0.16);
          backdrop-filter: blur(7px);
          -webkit-backdrop-filter: blur(7px);
        }

        .kether-search-backdrop-close {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: 0;
          background: transparent;
          cursor: default;
        }

        .kether-search-panel {
          position: absolute;
          top: 88px;
          right: 18px;
          width: min(92vw, 390px);
          border-radius: 28px;
          border: 1px solid rgba(255, 255, 255, 0.72);
          background: linear-gradient(
            145deg,
            rgba(255, 255, 255, 0.72),
            rgba(236, 244, 248, 0.46)
          );
          box-shadow:
            0 24px 70px rgba(15, 23, 42, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(24px) saturate(150%);
          -webkit-backdrop-filter: blur(24px) saturate(150%);
          overflow: hidden;
          color: #1f2937;
        }

        .kether-search-panel-inner {
          padding: 18px 18px 16px;
          background: radial-gradient(
            circle at top right,
            rgba(255, 255, 255, 0.82),
            transparent 55%
          );
        }

        .kether-search-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .kether-search-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.22em;
          color: #64748b;
        }

        .kether-search-title {
          margin: 8px 0 0;
          font-size: 22px;
          line-height: 1.25;
          font-weight: 900;
          color: #263445;
        }

        .kether-search-text {
          margin: 7px 0 0;
          font-size: 14px;
          line-height: 1.7;
          color: #64748b;
        }

        .kether-search-close {
          width: 38px;
          height: 38px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.78);
          background: rgba(255, 255, 255, 0.58);
          color: #334155;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
          cursor: pointer;
        }

        .kether-search-form {
          display: flex;
          gap: 8px;
          margin-top: 16px;
        }

        .kether-search-input-wrap {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.82);
          background: rgba(255, 255, 255, 0.66);
          box-shadow: inset 0 1px 8px rgba(15, 23, 42, 0.05);
          padding: 0 13px;
        }

        .kether-search-input {
          width: 100%;
          height: 48px;
          border: 0;
          outline: 0;
          background: transparent;
          color: #1f2937;
          font-size: 15px;
          font-weight: 700;
        }

        .kether-search-submit {
          height: 48px;
          border: 0;
          border-radius: 18px;
          padding: 0 16px;
          background: #263445;
          color: white;
          font-size: 14px;
          font-weight: 900;
          box-shadow: 0 10px 22px rgba(15, 23, 42, 0.2);
          cursor: pointer;
        }

        .kether-search-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 14px;
        }

        .kether-search-tag {
          border: 1px solid rgba(255, 255, 255, 0.72);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.54);
          color: #475569;
          padding: 8px 12px;
          font-size: 13px;
          font-weight: 800;
          box-shadow: 0 6px 14px rgba(15, 23, 42, 0.06);
          cursor: pointer;
        }

        .kether-search-icon-button,
        .nav-icon-button {
          width: auto !important;
          height: auto !important;
          min-width: 0 !important;
          min-height: 0 !important;
          border: 0 !important;
          outline: 0 !important;
          padding: 0 !important;
          margin: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
          color: #111827 !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          appearance: none !important;
          -webkit-appearance: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }

        .kether-search-icon-button:hover,
        .kether-search-icon-button:focus,
        .kether-search-icon-button:active,
        .nav-icon-button:hover,
        .nav-icon-button:focus,
        .nav-icon-button:active {
          border: 0 !important;
          outline: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
        }

        .kether-search-icon-svg,
        .kether-search-icon-button svg,
        .nav-icon-button svg {
          width: 28px !important;
          height: 28px !important;
          stroke-width: 2.25 !important;
          display: block !important;
        }

      `}</style>
    </>
  );
}
