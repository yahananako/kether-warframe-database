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
      if (event.key === "Escape") {
        setOpen(false);
      }
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
        className="inline-flex items-center justify-center rounded-full p-2 text-slate-700 transition hover:bg-white/70 hover:shadow-sm"
      >
        <Search size={25} strokeWidth={2.4} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/20 px-4 pt-28 backdrop-blur-sm">
          <button
            type="button"
            aria-label="關閉搜尋"
            className="absolute inset-0 cursor-default"
            onClick={() => setOpen(false)}
          />

          <section className="relative w-full max-w-2xl overflow-hidden rounded-[30px] border border-white/70 bg-white/45 p-4 shadow-2xl shadow-slate-400/30 backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/80 via-white/35 to-sky-100/30" />

            <div className="relative">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 text-xs font-bold tracking-[0.35em] text-slate-400">
                    <Sparkles size={15} />
                    KETHER SEARCH
                  </p>
                  <h2 className="mt-2 text-xl font-black text-slate-800">
                    資料庫快速搜尋
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    搜尋 MOD、戰甲、武器、同伴、來源或備註。
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="關閉"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-white/70 bg-white/65 p-2 text-slate-600 shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={submitSearch} className="flex gap-2">
                <div className="flex flex-1 items-center gap-2 rounded-2xl border border-white/80 bg-white/70 px-4 py-3 shadow-inner">
                  <Search size={20} className="text-slate-400" />
                  <input
                    ref={inputRef}
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    placeholder="輸入 MOD、戰甲、武器、中文或英文名稱..."
                    className="w-full bg-transparent text-base font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>

                <button
                  type="submit"
                  className="rounded-2xl bg-slate-800 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-400/30"
                >
                  搜尋
                </button>
              </form>

              <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
                {["Primed", "Yareli", "MOD", "近戰", "同伴"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setKeyword(tag)}
                    className="rounded-full border border-white/70 bg-white/55 px-3 py-2 shadow-sm"
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
