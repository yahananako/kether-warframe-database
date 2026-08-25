import Link from "next/link";
import HomeNewInlineMenu from "../../../components/HomeNewInlineMenu";
import DataTable from "../../../components/DataTable";
import WarframeRoleArchive from "../../../components/WarframeRoleArchive";
import { fetchSheetRows } from "../../../lib/sheets";
import { fetchWarframeImages } from "../../../lib/warframeImages";
import styles from "./warframes.module.css";

export const metadata = { title: "戰甲資料庫｜定位、故事與交易｜KETHER", description: "依傷害、群控、支援、生存與匿蹤分類的 Warframe 戰甲資料庫。" };

export default async function WarframesPage() {
  const [{ rows, error }, images] = await Promise.all([fetchSheetRows("warframes"), fetchWarframeImages()]);
  return <main className={styles.page}><div className={styles.shell}>
    <header className={styles.top}><Link className={styles.brand} href="/"><span className={styles.brandMark}><b>K</b></span><span><strong>KETHER</strong><small>WARFRAME DATABASE</small></span></Link><HomeNewInlineMenu /><Link className={styles.back} href="/">回到導覽</Link></header>
    <section className={styles.hero}><p>WARFRAME ROLE ARCHIVE</p><h1>戰甲資料庫</h1><span>從戰場定位開始選擇戰甲。傷害、群控、支援、生存與匿蹤五大分類，整合用途、交易資料與官方身世故事。</span></section>
    {error ? <section className={styles.archive}><h2>戰甲資料讀取失敗</h2><p>{error}</p></section> : <><WarframeRoleArchive rows={rows} images={images} /><details className={styles.archive}><summary>開啟完整交易與個人持有資料表</summary><DataTable rows={rows} category="warframes" /></details></>}
  </div></main>;
}
