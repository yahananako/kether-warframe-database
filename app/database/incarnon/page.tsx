import type { Metadata } from "next";
import Link from "next/link";

import IncarnonWeaponArchive from "../../../components/IncarnonWeaponArchive";
import { incarnonCatalog } from "../../../data/incarnonWeapons";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "靈化武器列表",
  description:
    "KETHER Warframe 靈化武器列表，依主要、次要、近戰分類，整理武器圖片、靈化特效、進化解鎖條件與進化能力。",
  alternates: {
    canonical: "/database/incarnon",
  },
};

export default async function IncarnonDatabasePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const q = Array.isArray(params.q) ? params.q[0] || "" : params.q || "";
  return (
    <main className="home-new-page">
      <div className="home-new-shell">
        <section className={`kether-overview-intro-card ${styles.intro}`}>
          <div className="kether-database-intro-topline">
            <p>KETHER INCARNON ARMORY</p>
            <Link
              href="/"
              className="kether-database-home-link"
              aria-label="回首頁"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m3 10 9-7 9 7" />
                <path d="M5 9v11h14V9" />
                <path d="M9 20v-6h6v6" />
              </svg>
              <span>回首頁</span>
            </Link>
          </div>

          <h1>靈化武器列表</h1>
          <span>
            依主要、次要、近戰三類整理完整應感武器。點開武器卡即可查看圖片、靈化特效、每階進化解鎖條件與全部能力選項。
          </span>

          <div className={styles.introStats} aria-label="靈化武器分類數量">
            <div>
              <strong>{incarnonCatalog.totals.primary}</strong>
              <span>主要</span>
            </div>
            <div>
              <strong>{incarnonCatalog.totals.secondary}</strong>
              <span>次要</span>
            </div>
            <div>
              <strong>{incarnonCatalog.totals.melee}</strong>
              <span>近戰</span>
            </div>
            <div>
              <strong>{incarnonCatalog.totals.all}</strong>
              <span>全部</span>
            </div>
          </div>
        </section>

        <section className="kether-category-content-shell">
          <IncarnonWeaponArchive key={q} initialQuery={q} />
        </section>
      </div>
    </main>
  );
}
