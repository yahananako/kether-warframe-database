import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./PageState.module.css";

export default function PageState({ title, message, children, loading = false }: {
  title: string;
  message: string;
  children?: ReactNode;
  loading?: boolean;
}) {
  return (
    <main className={styles.stage}>
      <section className={styles.card} aria-busy={loading}>
        <Link href="/" className={styles.brand}>KETHER <span>OF PARADISO</span></Link>
        <div role={loading ? "status" : undefined} aria-live={loading ? "polite" : undefined}>
          <h1>{title}</h1>
          <p>{message}</p>
        </div>
        <div className={styles.actions}>{children}<Link href="/">返回首頁</Link></div>
      </section>
    </main>
  );
}
