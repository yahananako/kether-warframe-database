import Link from "next/link";
import HomeNewInlineMenu from "../../../../components/HomeNewInlineMenu";
import DataTable from "../../../../components/DataTable";
import WarframeRoleArchive from "../../../../components/WarframeRoleArchive";
import { fetchSheetRows } from "../../../../lib/sheets";
import { isWarframeName } from "../../../../data/warframeRoles";
import styles from "../warframes.module.css";

export const metadata = { title: "Prime 戰甲｜定位、故事與交易｜KETHER", description: "Prime Warframe 圖片、分類、故事、價格與交易資料。" };

export default async function PrimeWarframesPage() {
  const { rows, error } = await fetchSheetRows("warframes");
  const primeRows = rows.filter((row) => /\bPrime\b/i.test(row.englishName) && isWarframeName(row.englishName));
  return <main className={styles.page}><div className={styles.shell}>
    <header className={styles.top}><Link className={styles.brand} href="/"><span className={styles.brandMark}><b>K</b></span><span><strong>KETHER</strong><small>WARFRAME DATABASE</small></span></Link><HomeNewInlineMenu /><Link className={styles.back} href="/">回到導覽</Link></header>
    <nav className={styles.editionTabs} aria-label="戰甲版本"><Link href="/database/warframes"><b>一般戰甲</b><small>入手條件與故事</small></Link><Link className={styles.activeEdition} href="/database/warframes/prime"><b>Prime 戰甲</b><small>價格與交易資料</small></Link></nav>
    <section className={styles.hero}><p>PRIME WARFRAME ARCHIVE</p><h1>Prime 戰甲</h1><span>獨立收錄 Prime 版本戰甲的定位、圖片、遊戲內故事、白金價格與交易連結。</span></section>
    {error ? <section className={styles.archive}><h2>Prime 戰甲資料讀取失敗</h2><p>{error}</p></section> : <><WarframeRoleArchive mode="prime" rows={primeRows} /><details className={styles.archive}><summary>開啟完整 Prime 交易與個人持有資料表</summary><DataTable rows={primeRows} category="warframes" /></details></>}
  </div></main>;
}
