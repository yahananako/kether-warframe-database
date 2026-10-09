import {BadgeCheck, BookOpenText, Database, KeyRound, ShieldCheck, Sparkles, UserRound} from "lucide-react";
import Link from "next/link";
import AuthSessionStatus from "../../components/AuthSessionStatus";
import BillingPlanStatus from "../../components/BillingPlanStatus";
import ProfileOwnedSummary from "../../components/ProfileOwnedSummary";
import PermissionVerificationStatus from "../../components/PermissionVerificationStatus";
import ProfilePrivacyDisclaimer from "../../components/ProfilePrivacyDisclaimer";
import styles from "./profile-command.module.css";

export default function ProfilePage() {
  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div>
          <p className={styles.kicker}><UserRound size={16} /> KETHER PERSONAL TERMINAL</p>
          <h1>Tenno 個人<span>控制中心</span></h1>
          <p>Discord 身分、收藏進度、權限與訂閱資料都在同一個工作區管理。</p>
        </div>
        <Link className={styles.quickLink} href="/database/overview"><Database size={16}/> 資料庫總覽</Link>
      </header>
      <div className={styles.columns}>
        <section className={styles.profilePanel} aria-labelledby="profile-identity-heading">
          <div className={styles.panelHead}><p>01 / IDENTITY</p><h2 id="profile-identity-heading">Discord 成員名片</h2></div>
          <div className={styles.identityScroll}>
            <AuthSessionStatus />
            <div className={styles.flow}>
              <p className={styles.kicker}>ACCOUNT CONNECTION / 授權流程</p>
              <div><BadgeCheck size={17}/><span>Discord OAuth 登入</span></div>
              <div><KeyRound size={17}/><span>Guild 與 Role 身分檢查</span></div>
              <div><ShieldCheck size={17}/><span>安全 Session 與個人權限</span></div>
            </div>
          </div>
        </section>
        <section className={styles.workspace} aria-labelledby="profile-workspace-heading">
          <div className={styles.panelHead}><p>02 / PERSONAL RECORDS</p><h2 id="profile-workspace-heading">個人資料工作區</h2></div>
          <div className={styles.workScroll}>
            <details className={styles.section} open>
              <summary><span><BookOpenText size={18}/> 個人收藏摘要</span><small>PERSONAL COLLECTION</small></summary>
              <div className={styles.sectionBody}><ProfileOwnedSummary /></div>
            </details>
            <details className={styles.section}>
              <summary><span><ShieldCheck size={18}/> 身分與權限驗證</span><small>ACCESS DIAGNOSTICS</small></summary>
              <div className={styles.sectionBody}><PermissionVerificationStatus /></div>
            </details>
            <details className={styles.section}>
              <summary><span><Sparkles size={18}/> 個人訂閱方案</span><small>BILLING STATUS</small></summary>
              <div className={styles.sectionBody}><BillingPlanStatus /></div>
            </details>
            <details className={styles.section}>
              <summary><span><KeyRound size={18}/> 個人化資料庫流程</span><small>DATA PROCESS</small></summary>
              <div className={styles.sectionBody}>
                <div className={styles.processGrid}>
                  <article><b>01</b><span>使用 Discord 登入並取得必要授權</span></article>
                  <article><b>02</b><span>確認伺服器成員資格與身分組</span></article>
                  <article><b>03</b><span>建立受保護的 Session</span></article>
                  <article><b>04</b><span>依法定權限讀取或更新個人收藏</span></article>
                </div>
              </div>
            </details>
            <div className={styles.privacy}><ProfilePrivacyDisclaimer /></div>
          </div>
        </section>
      </div>
    </main>
  );
}
