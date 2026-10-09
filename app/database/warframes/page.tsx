import WarframeRoleArchive from "../../../components/WarframeRoleArchive";
import {regularWarframes} from "../../../data/regularWarframes";
import styles from "../../../components/WarframeCommandDeck.module.css";
export const metadata = {title:"一般戰甲｜定位、故事與入手條件｜KETHER",description:"依傷害、群控、支援、生存與匿蹤分類的一般 Warframe 資料庫。"};
export default function WarframesPage(){
  return <main className={styles.page}><WarframeRoleArchive mode="regular" regularFrames={regularWarframes}/></main>;
}
