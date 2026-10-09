import type {Metadata} from "next";
import {Sparkles,Layers3} from "lucide-react";
import IncarnonWeaponArchive from "../../../components/IncarnonWeaponArchive";
import {incarnonCatalog} from "../../../data/incarnonWeapons";
import styles from "./page.module.css";
export const metadata:Metadata={
  title:"靈化武器列表",
  description:"KETHER Warframe 靈化武器列表，依主要、次要、近戰分類，整理圖片、特效、進化條件與能力。",
  alternates:{canonical:"/database/incarnon"}
};
export default async function IncarnonDatabasePage({searchParams}:{searchParams:Promise<{q?:string|string[]}>}){
  const params=await searchParams,q=Array.isArray(params.q)?params.q[0]||"":params.q||"";
  return <main className={styles.page}>
    <header className={styles.hero}>
      <div className={styles.heroTitle}>
        <p><Sparkles size={15}/> KETHER / INCARNON EVOLUTION NETWORK</p>
        <h1>靈化武器 <span>進化研究所</span></h1>
        <small>靈化形態、進化解鎖條件與全部能力選項，依武器類別即時篩選。</small>
      </div>
      <div className={styles.heroStats} aria-label="靈化武器各分類數量">
        {[
          ["主要",incarnonCatalog.totals.primary],
          ["次要",incarnonCatalog.totals.secondary],
          ["近戰",incarnonCatalog.totals.melee],
          ["全部",incarnonCatalog.totals.all],
        ].map(([label,value])=><div key={label}><strong>{value}</strong><span>{label}</span></div>)}
      </div>
    </header>
    <section className={styles.workspace} aria-label="靈化武器搜尋與進化檔案">
      <IncarnonWeaponArchive initialQuery={q}/>
    </section>
  </main>;
}
