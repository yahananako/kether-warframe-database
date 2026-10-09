import Link from "next/link";
import {Ban, MessageCircle, ArrowLeft, ShieldAlert} from "lucide-react";
import styles from "./unauthorized.module.css";
export default function UnauthorizedPage() {
  return <main className={styles.page}>
    <section className={styles.card} aria-labelledby="access-denied-title">
      <div className={styles.icon}><ShieldAlert size={45} aria-hidden="true"/></div>
      <p className={styles.kicker}>KETHER SECURITY GATE / ACCESS DENIED</p>
      <h1 id="access-denied-title">尚未取得資料庫權限</h1>
      <p>可能尚未登入 Discord、未加入授權群組，或缺少所需的身分組。此頁不會修改帳號或授權。</p>
      <div className={styles.actions}>
        <Link href="/login">前往 Discord 登入</Link>
        <a href="https://discord.gg/TNGYQb5mBN" target="_blank" rel="noopener noreferrer">
          <MessageCircle size={17}/> 前往 Discord 社群
        </a>
      </div>
      <Link href="/" className={styles.back}><ArrowLeft size={15}/> 回到 KETHER 首頁</Link>
    </section>
    <div className={styles.decor} aria-hidden="true"><Ban size={180}/></div>
  </main>;
}
