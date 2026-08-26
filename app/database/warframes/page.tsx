import Link from "next/link";
import HomeNewInlineMenu from "../../../components/HomeNewInlineMenu";
import WarframeRoleArchive from "../../../components/WarframeRoleArchive";
import { regularWarframes } from "../../../data/regularWarframes";
import styles from "./warframes.module.css";

export const metadata = { title: "一般戰甲｜定位、故事與入手條件｜KETHER", description: "依傷害、群控、支援、生存與匿蹤分類的一般 Warframe 資料庫。" };

export default function WarframesPage() {
  return <main className={styles.page}><div className={styles.shell}>
    <header className={styles.top}><Link className={styles.brand} href="/"><span className={styles.brandMark}><b>K</b></span><span><strong>KETHER</strong><small>WARFRAME DATABASE</small></span></Link><HomeNewInlineMenu /><Link className={styles.back} href="/">回到導覽</Link></header>
    <nav className={styles.editionTabs} aria-label="戰甲版本"><Link className={styles.activeEdition} href="/database/warframes"><b>一般戰甲</b><small>入手條件與故事</small></Link><Link href="/database/warframes/prime"><b>Prime 戰甲</b><small>價格與交易資料</small></Link></nav>
    <section className={styles.hero}><p>REGULAR WARFRAME ARCHIVE</p><h1>一般戰甲</h1><span>收錄一般版本戰甲的定位、圖片、遊戲內故事與入手條件；不顯示交易價格與交易網站。</span></section>
    <WarframeRoleArchive mode="regular" regularFrames={regularWarframes} />
  </div></main>;
}
