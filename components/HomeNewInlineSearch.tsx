"use client";

import Link from "next/link";
import { ArrowRight, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

const searchItems = [
  { label: "正式首頁", href: "/", tag: "KETHER" },
  { label: "新首頁測試", href: "/home-new", tag: "KETHER" },
  { label: "個人頁面", href: "/profile", tag: "個人" },
  { label: "資料庫總覽", href: "/database/overview", tag: "資料庫" },
  { label: "戰甲", href: "/database/warframes", tag: "資料庫" },
  { label: "主要武器", href: "/database/primary", tag: "資料庫" },
  { label: "次要武器", href: "/database/secondary", tag: "資料庫" },
  { label: "近戰武器", href: "/database/melee", tag: "資料庫" },
  { label: "同伴", href: "/database/companions", tag: "資料庫" },
  { label: "曲翼", href: "/database/archwing", tag: "資料庫" },
  { label: "MOD資料庫", href: "/database/mods", tag: "資料庫" },
  { label: "小希 Bot", href: "/bot", tag: "工具" },
  { label: "星圖電波局", href: "/live", tag: "工具" },
];

export default function HomeNewInlineSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) {
      return searchItems.slice(0, 8);
    }

    return searchItems.filter((item) => {
      return (
        item.label.toLowerCase().includes(keyword) ||
        item.tag.toLowerCase().includes(keyword) ||
        item.href.toLowerCase().includes(keyword)
      );
    });
  }, [query]);

  return (
    <div className="home-new-action-wrap">
      <button
        className="home-new-icon-action"
        type="button"
        aria-label={open ? "關閉搜尋" : "開啟搜尋"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={22} /> : <Search size={22} />}
      </button>

      {open ? (
        <>
          <button
            className="home-new-pop-backdrop"
            type="button"
            aria-label="關閉搜尋背景"
            onClick={() => setOpen(false)}
          />

          <section className="home-new-pop-panel home-new-search-panel" aria-label="KETHER 搜尋">
            <div className="home-new-pop-head">
              <p>KETHER SEARCH</p>
              <strong>星圖搜尋</strong>
            </div>

            <label className="home-new-search-box">
              <Search size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜尋資料庫、Bot、星圖電波局..."
                autoFocus
              />
            </label>

            <div className="home-new-search-results">
              {results.length > 0 ? (
                results.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="home-new-search-result"
                    onClick={() => setOpen(false)}
                  >
                    <span>
                      <em>{item.tag}</em>
                      <strong>{item.label}</strong>
                    </span>
                    <ArrowRight size={16} />
                  </Link>
                ))
              ) : (
                <div className="home-new-empty-state">沒有找到對應入口喵</div>
              )}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
