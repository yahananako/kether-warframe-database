import { Bell, Database, ShieldCheck, Sparkles, ArrowUpRight, RadioTower, BookOpenText } from "lucide-react";
import styles from "./notification-command.module.css";
import Link from "next/link";
import { KETHER_APP_VERSION, KETHER_BOT_VERSION } from "../../data/siteVersion";

const updates = [
  {
    version: KETHER_APP_VERSION,
    title: "全站統一介面重製",
    content:
      "全頁面共用導覽、通知、播放器與介面規格。搜尋加入分類筆數及分頁，一般戰甲預設顯示全部定位。",
  },
  {
    version: KETHER_BOT_VERSION,
    title: "小希 BOT 氏族工具更新",
    content:
      "新增氏族截圖自動驗證與按鈕抽獎，查價結果加入 Warframe Market 交易網站按鈕，並修復戰甲名片無回應。",
  },
  {
    version: KETHER_APP_VERSION,
    title: "系列任務故事書上線",
    content:
      "主線與支線之外新增六條連續任務航路，網站與 Android APP 共用相同節點與閱讀順序。",
  },
  {
    version: KETHER_APP_VERSION,
    title: "電波局與五大裝備分類改版",
    content:
      "12 座即時情報站皆有獨立美化頁面；主要、次要、近戰、同伴與曲翼加入分類導覽，並補齊擬狐獸、孤生獸、骨寡婦與虛空魂。",
  },
  {
    version: KETHER_APP_VERSION,
    title: "赤毒武器系列同步完成",
    content:
      "21 把赤毒武器已同步到 Google Sheets、網站、小希 BOT 與 Android APP，並加入已轉化玄骸即時拍賣價及交易頁。",
  },
  {
    version: KETHER_APP_VERSION,
    title: "一般戰甲檔案館上線",
    content:
      "收錄 65 位一般戰甲，並新增每位戰甲的技能、來源、Prime 行情與獨立配裝頁。",
  },
  {
    version: KETHER_APP_VERSION,
    title: "Prime 戰甲獨立分頁",
    content:
      "Prime 戰甲已與一般版本分離，獨立保留白金價格、Warframe Market 交易連結與個人持有資料。",
  },
  {
    version: KETHER_APP_VERSION,
    title: "故事書專屬封面更新",
    content:
      "主線與支線故事各自使用任務專屬封面，修復失效圖片並停止共用主要圖片或戰甲圖片。",
  },
  {
    version: KETHER_APP_VERSION,
    title: "首頁資訊全面同步",
    content:
      "首頁導覽、漢堡選單、搜尋、鈴鐺與動態跑馬燈皆已更新為最新資料庫結構。",
  },
  {
    version: KETHER_APP_VERSION,
    title: "同步系統維持運作",
    content: `Google Sheets、Discord 個人進度與每日 04:00 價格同步維持運作，BOT 版本為 ${KETHER_BOT_VERSION}。`,
  },
];

export default function NotificationsPage(){
  return <main className={styles.page}>
    <header className={styles.header}>
      <div><p><Bell size={15}/> KETHER / NETWORK TRANSMISSION ARCHIVE</p>
        <h1>更新與<span>通知中心</span></h1>
        <small>版本情報、網站更新與氏族 BOT 進度的統一收錄站。</small></div>
      <div className={styles.headerStatus}><Sparkles size={17}/>
        <strong>{updates.length} 則收錄資訊</strong><span>ARCHIVED MESSAGES</span></div>
    </header>
    <div className={styles.workspace}>
      <aside className={styles.systemPane} aria-label="系統版本與快速連結">
        <div className={styles.panelHeading}><p>01 / SYSTEM TELEMETRY</p><h2>目前系統版本</h2></div>
        <div className={styles.systemCards}>
          <article><Database size={19}/><span>網站版本</span><strong>{KETHER_APP_VERSION}</strong></article>
          <article><RadioTower size={19}/><span>Discord BOT 版本</span><strong>{KETHER_BOT_VERSION}</strong></article>
          <article><ShieldCheck size={19}/><span>個人化資料庫</span><strong>已提供登入入口</strong></article>
        </div>
        <div className={styles.shortcutTitle}>KETHER / QUICK ACCESS</div>
        <nav className={styles.shortcuts} aria-label="通知中心快速導覽">
          <Link href="/database/overview"><Database size={16}/> 資料庫總覽 <ArrowUpRight size={16}/></Link>
          <Link href="/story"><BookOpenText size={16}/> 故事書庫 <ArrowUpRight size={16}/></Link>
          <Link href="/live"><RadioTower size={16}/> 電波情報 <ArrowUpRight size={16}/></Link>
          <Link href="/clan"><ShieldCheck size={16}/> 氏族指揮中心 <ArrowUpRight size={16}/></Link>
        </nav>
        <p className={styles.notice}>以上版本為目前正式網站所記錄的標籤；PR 測試中的設計改版尚未正式發行，也未升級版本號。</p>
      </aside>
      <section className={styles.feedPane} aria-labelledby="notification-timeline-title">
        <div className={styles.panelHeading}><p>02 / CHANGELOG CHANNEL</p><h2 id="notification-timeline-title">更新紀錄 <small>/ {updates.length.toString().padStart(2,"0")}</small></h2></div>
        <div className={styles.feedScroll}>
          {updates.map((item,index)=><article className={styles.update} key={item.version+"-"+item.title}>
            <div className={styles.index}>{String(index+1).padStart(2,"0")}</div>
            <div className={styles.updateBody}><div className={styles.updateHead}>
              <span>{item.version}</span><small>{index===0?"LATEST RECORD":"ARCHIVED UPDATE"}</small></div>
              <h3>{item.title}</h3><p>{item.content}</p></div>
          </article>)}
        </div>
        <footer className={styles.feedFooter}>KETHER OF PARADISO · CHANGELOG TRANSMISSION</footer>
      </section>
    </div>
  </main>;
}
