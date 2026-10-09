import {BadgeCheck,Database,KeyRound,MessageCircle,Shield,Sparkles,Users,ArrowUpRight,RadioTower} from "lucide-react";
import Link from "next/link";
import ClanAccessStatus from "../../components/ClanAccessStatus";
import ClanAnnouncementBoard from "../../components/ClanAnnouncementBoard";
import ClanDiscordAccessCard from "../../components/ClanDiscordAccessCard";
import ClanPrivacyDisclaimer from "../../components/ClanPrivacyDisclaimer";
import styles from "./clan-command.module.css";
const roadmap=[
  {Icon:Database,title:"氏族專屬資料庫",text:"KETHER 的資料庫、收錄狀態與個人收藏維持獨立管理。"},
  {Icon:Users,title:"成員與名片",text:"未來可接入 Discord 成員與角色資料，目前不顯示未連接的資訊。"},
  {Icon:Shield,title:"身分權限",text:"由現有 Discord 授權機制決定可用功能，介面不可代替伺服器驗證。"},
  {Icon:Sparkles,title:"未來群組獨立庫",text:"其他群組若啟用獨立資料庫，將依各自授權規格處理。"},
];
export default function ClanPage(){
  return <main className={styles.page}>
    <header className={styles.commandTop}>
      <div className={styles.identity}>
        <img src="/kether-clan-logo.png" alt="" aria-hidden="true"/>
        <div><p>CLAN OPERATIONS / KETHER OF PARADISO</p><h1>氏族<span>指揮中心</span></h1>
          <small>氏族公告、Discord 授權、資料庫權限與資訊整合</small></div>
      </div>
      <div className={styles.commandActions}>
        <Link href="/database/overview"><Database size={15}/> 氏族資料庫 <ArrowUpRight size={14}/></Link>
        <Link href="/profile"><Users size={15}/> 個人中心 <ArrowUpRight size={14}/></Link>
      </div>
    </header>
    <div className={styles.dashboard}>
      <section className={styles.announcementPane} aria-label="KETHER 氏族公告與發布">
        <div className={styles.panelTitle}><div><p>01 / COMMUNICATION CENTER</p><h2>氏族通訊及公告</h2></div><MessageCircle size={23}/></div>
        <div className={styles.innerScroll}>
          <ClanAnnouncementBoard/>
          <ClanPrivacyDisclaimer/>
        </div>
      </section>
      <aside className={styles.managementPane} aria-label="氏族成員入口與權限檢查">
        <div className={styles.panelTitle}><div><p>02 / ACCESS CONTROL</p><h2>身分及權限控制台</h2></div><Shield size={23}/></div>
        <div className={styles.innerScroll}>
          <section className={styles.identityPanel}><div className={styles.pulseLine}><span/> DISCORD ACCESS GATEWAY</div>
            <p>以現有 Discord OAuth 與群組權限確認身分；未授權帳號不會因此頁面改版取得新權限。</p>
            <div className={styles.accessCard}><ClanDiscordAccessCard/></div>
          </section>
          <ClanAccessStatus/>
          <details className={styles.futurePanel}>
            <summary><BadgeCheck size={17}/> 氏族與網站連動資訊</summary>
            <div className={styles.futureGrid}>
              <article><MessageCircle size={18}/><strong>Discord 整合</strong><p>登入、BOT、公告與身分驗證由既有服務提供。</p></article>
              <article><KeyRound size={18}/><strong>OAuth 安全</strong><p>後端驗證權限，不因顯示管理元件而繞過安全檢查。</p></article>
            </div>
          </details>
          <details className={styles.futurePanel}>
            <summary><RadioTower size={17}/> 後續氏族整合規劃</summary>
            <div className={styles.futureGrid}>{roadmap.map(({Icon,title,text})=><article key={title}>
              <Icon size={18}/><strong>{title}</strong><p>{text}</p></article>)}</div>
          </details>
        </div>
      </aside>
    </div>
  </main>;
}
