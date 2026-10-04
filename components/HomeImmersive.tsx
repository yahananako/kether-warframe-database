"use client";
import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { homeNotices } from "../data/homeNotices";
import { navigationGroups } from "../data/siteNavigation";
import { NavigationGroup } from "./SiteShell";
const quickPool = [
  "Valkyr",
  "Nova",
  "Titania",
  "Volt",
  "Trinity",
  "Saryn",
  "Excalibur Umbra",
  "Ivara",
  "Yareli",
  "靈化",
  "Prime",
  "赤毒",
  "MOD",
  "同伴",
];
export default function HomeImmersive() {
  const [quick, setQuick] = useState<string[]>([]);
  useEffect(() => {
    function refresh() {
      let previous: string[] = [];
      try {
        const value = JSON.parse(
          localStorage.getItem("kether-last-quick-search") || "[]",
        );
        if (Array.isArray(value)) previous = value;
      } catch {}
      const available = quickPool.filter((term) => !previous.includes(term));
      for (let i = available.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [available[i], available[j]] = [available[j], available[i]];
      }
      const selected = available.slice(0, 3);
      setQuick(selected);
      try {
        localStorage.setItem(
          "kether-last-quick-search",
          JSON.stringify(selected),
        );
      } catch {}
    }
    refresh();
    const pageShow = (event: PageTransitionEvent) => {
      if (event.persisted) refresh();
    };
    window.addEventListener("pageshow", pageShow);
    return () => window.removeEventListener("pageshow", pageShow);
  }, []);
  return (
    <main className="home-workspace">
      <section className="home-copy">
        <p className="site-eyebrow">TENNO ARCHIVE / 資料檢索</p>
        <h1>
          從虛空中
          <br />
          <em>找到答案。</em>
        </h1>
        <p className="home-lead">戰甲、武器、故事與星圖情報。</p>
        <form action="/search" className="site-search">
          <Search aria-hidden="true" />
          <label className="sr-only" htmlFor="home-query">
            搜尋資料庫
          </label>
          <input
            id="home-query"
            name="q"
            type="search"
            placeholder="輸入中文、英文或戰甲暱稱…"
            required
          />
          <button type="submit">開始查詢</button>
        </form>
        <div className="home-quick">
          <span>快速搜尋</span>
          {quick.map((term) => (
            <Link href={`/search?q=${encodeURIComponent(term)}`} key={term}>
              {term}
            </Link>
          ))}
        </div>
        <div className="home-categories">
          {navigationGroups.map((group) => (
            <NavigationGroup group={group} key={group.label} />
          ))}
        </div>
      </section>
      <aside className="home-aside">
        <Image
          src="/home-hero-banner.png"
          width={1536}
          height={864}
          sizes="(max-width: 760px) 90vw, 32vw"
          alt="KETHER OF PARADISO"
          priority
        />
        <div className="home-latest">
          <span className="site-eyebrow">ARCHIVE UPDATE</span>
          <h2>{homeNotices[0]?.title || "檔案更新"}</h2>
          <p>{homeNotices[0]?.body}</p>
          <Link href="/notifications">查看近期收錄</Link>
        </div>
      </aside>
    </main>
  );
}
