import WarframeRoleArchive from "../../../../components/WarframeRoleArchive";
import {isWarframeName} from "../../../../data/warframeRoles";
import {fetchSheetRows} from "../../../../lib/sheets";
import styles from "../../../../components/WarframeCommandDeck.module.css";
export const metadata = {title:"Prime 戰甲｜定位、故事與交易｜KETHER",description:"Prime Warframe 圖片、定位、故事、交易價格與收藏進度。"};
export default async function PrimeWarframesPage(){
  const {rows,error}=await fetchSheetRows("warframes");
  const primeRows=rows.filter(row=>/\bPrime\b/i.test(row.englishName)&&isWarframeName(row.englishName));
  return <main className={styles.page}>{error?
    <section className={styles.error} role="alert"><h1>Prime 戰甲資料暫時無法讀取</h1><p>{error}</p></section>:
    <WarframeRoleArchive mode="prime" rows={primeRows}/>}</main>;
}
